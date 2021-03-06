import time
import datetime
from typing import Any, Dict, List, Optional, Tuple

from geopy import distance as geopy_distance  # type: ignore
from geopy.geocoders import Nominatim
import polyline  # type: ignore
from sqlalchemy import (
    create_engine,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Interval,
    PickleType,
    String,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, Session
from stravalib.model import Activity as StravaActivity  # type: ignore

from .valuerange import ValueRange


Base = declarative_base()


class Athlete(Base):
    __tablename__ = "athletes"

    id = Column(Integer, primary_key=True)
    firstname = Column(String)
    lastname = Column(String)

    def to_dict(self) -> Dict:
        return {"id": self.id, "firstname": self.firstname, "lastname": self.lastname}


# reverse the location (lan, lon) -> location detail
g = Nominatim(user_agent="yihong0618")


def is_point_on_track(
    point: Tuple[float, float],
    track: List[Tuple[float, float]],
    max_distance_meters: float = 100,
) -> bool:
    point_lat, point_lon = point
    for coordinates in track:
        lat, lon = coordinates
        is_on_track = (
            abs(point_lat - lat) < 0.01
            and abs(point_lon - lon) < 0.01
            and geopy_distance.geodesic(point, coordinates).meters < max_distance_meters
        )

        if is_on_track:
            return True
    return False


ACTIVITY_KEYS = [
    "strava_id",
    "athlete_id",
    "name",
    "distance",
    "moving_time",
    "elapsed_time",
    "total_elevation_gain",
    "type",
    "start_date",
    "start_date_local",
    "location_country",
    "summary_polyline",
    "average_heartrate",
    "average_speed",
]


class Activity(Base):
    __tablename__ = "activities"

    strava_id = Column(Integer, primary_key=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"))
    athlete = relationship("Athlete")
    name = Column(String)
    distance = Column(Float)
    moving_time = Column(Interval)
    elapsed_time = Column(Interval)
    total_elevation_gain = Column(Float)
    type = Column(String)
    start_date = Column(String)
    start_date_local = Column(String)
    location_country = Column(String)
    summary_polyline = Column(String)
    track = Column(PickleType)
    average_heartrate = Column(Float)
    average_speed = Column(Float)
    pois = None
    streak = None

    def bbox(self) -> Tuple[Optional[ValueRange], Optional[ValueRange]]:
        if self.track:
            lat_range = ValueRange()
            lon_range = ValueRange()
            for (lat, lon) in self.track:
                lat_range.add(lat)
                lon_range.add(lon)
            return lat_range, lon_range
        return None, None

    def set_pois(self, pois: Dict[str, Dict]) -> None:
        if self.track and pois:
            lat_range, lon_range = self.bbox()
            if lat_range is None or lon_range is None:
                return
            track_pois = []
            for (name, point) in pois.items():
                lat, lon = point["lat"], point["lon"]
                if not lat_range.contains(lat, 0.01) or not lon_range.contains(
                    lon, 0.01
                ):
                    continue
                if is_point_on_track((lat, lon), self.track):
                    track_pois.append(name)

            if track_pois:
                self.pois = track_pois
                return

    def to_dict(self) -> Dict:
        out: Dict[str, Any] = {}
        for key in ACTIVITY_KEYS:
            attr = getattr(self, key)
            if isinstance(attr, (datetime.timedelta, datetime.datetime)):
                out[key] = str(attr)
            else:
                out[key] = attr

        if self.pois:
            out["pois"] = self.pois
        if self.streak:
            out["streak"] = self.streak

        return out


def update_or_create_activity(session, athlete, strava_activity):
    created = False
    activity = (
        session.query(Activity).filter_by(strava_id=int(strava_activity.id)).first()
    )
    if not activity:
        start_point = strava_activity.start_latlng
        location_country = strava_activity.location_country
        if start_point:
            try:
                location_country = str(
                    g.reverse(f"{start_point.lat}, {start_point.lon}")
                )
            # limit (only for the first time)
            except:
                print("+++++++limit+++++++")
                time.sleep(60)
                location_country = str(
                    g.reverse(f"{start_point.lat}, {start_point.lon}")
                )

        activity = Activity(
            strava_id=strava_activity.id,
            athlete=athlete,
            name=strava_activity.name,
            distance=strava_activity.distance,
            moving_time=strava_activity.moving_time,
            elapsed_time=strava_activity.elapsed_time,
            total_elevation_gain=strava_activity.total_elevation_gain,
            type=strava_activity.type,
            start_date=strava_activity.start_date,
            start_date_local=strava_activity.start_date_local,
            location_country=location_country,
            average_heartrate=strava_activity.average_heartrate,
            average_speed=float(strava_activity.average_speed),
        )
        session.add(activity)
        created = True
    else:
        activity.name = strava_activity.name
        activity.distance = float(strava_activity.distance)
        activity.moving_time = strava_activity.moving_time
        activity.elapsed_time = strava_activity.elapsed_time
        activity.total_elevation_gain = float(strava_activity.total_elevation_gain)
        activity.type = strava_activity.type
        activity.average_heartrate = strava_activity.average_heartrate
        activity.average_speed = float(strava_activity.average_speed)
    try:
        decoded = polyline.decode(strava_activity.map.summary_polyline)
        activity.summary_polyline = strava_activity.map.summary_polyline
        if decoded:
            activity.track = decoded
    except (AttributeError, TypeError):
        pass

    return created


def init_db(db_path: str) -> Session:
    engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)
    return session()
