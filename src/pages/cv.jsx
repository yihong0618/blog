import React from "react";

import Layout from "../components/layout";

export default () => {
  return (
    <Layout>
      <article className="flex flex-wrap">
        <div className="w-100 w-50-l pr4-l">
          <section>
            <h2 className="f3-m  mb1 f2-l">Experience</h2>
            <div>
              <h5 className="f6 gray">
                <span className="black">Thread</span> &ndash; Software Engineer,
                June 2014 - Present
              </h5>
              <p>
                As part of a product-focused engineering team at Thread, much of
                my role involves projects designed to address key business
                metrics such as margin, conversion or revenue growth, although a
                core part of my job is to help create a great engineering
                culture in which to work.
              </p>
              <p>
                I’m frequently involved in the rapid development of new product
                features designed to address user feedback, and work closely
                with designers, stylists, copy-writers, and marketers to achieve
                this. I also work on pure engineering projects, such as our
                build processes, automation, and continuous delivery to help the
                team work faster and more effectively. I take part in code
                review on a regular basis, pair programming where appropriate,
                and participate in hiring for new engineers.
              </p>
              <p>
                While at Thread I have worked on all parts of our codebase,
                building features and solving problems for different teams
                across growth, customer acquisition, retention, core product
                value, user experience, styling, inventory, commercial, finance,
                warehouse operations, logistics, shipping, APIs, client apps,
                internationalisation, automation, deployment, databases,
                continuous integration and delivery, monitoring, alerting,
                documenting, training, mentoring and more.
              </p>
            </div>
            <div>
              <h5 className="f6 gray">
                <span className="black">MWR InfoSecurity</span> &ndash; Security
                Research and Development, Summer 2013
              </h5>
              <p>
                At MWR I took a new security product from idea to fully featured
                prototype in order to explore a new potential business
                opportunity for the company. The prototype was successful and
                development continued, being spun out into a new company –
                Countercept, who grew to a ~100 people before being acquired
                along with MWR by F-Secure in 2014.
              </p>
              <p>
                During my time at MWR I participated in a penetration test
                against a client’s iOS application, finding a critical
                vulnerability and verifying the client’s fixes in a code review.
                I also assisted in incident response for an attack by a
                suspected "Advanced Persistent Threat" actor, analysing a piece
                of malware to reverse engineer the cryptography being used by
                it.
              </p>
            </div>
            <div>
              <h5 className="f6 gray">
                <span className="black">GoSquared</span> &ndash; Software
                Developer, Summer 2012
              </h5>
              <p>
                At GoSquared I spent 4 months working on re-engineering the
                backend services that handle incoming web analytics data, making
                use of Node.js, Redis, Cassandra and more. I investigated the
                use of Amazon Elastic Map Reduce and competing products, and
                helped to set up the continuous integration and deployment
                systems used in the company.
              </p>
            </div>
            <div>
              <h5 className="f6 gray">
                <span className="black">Realmac Software</span> &ndash; Software
                Developer Intern, Summer 2011
              </h5>
              <p>
                At Realmac Software I worked on improving an existing app,
                Courier, contributed to in-house frameworks that were shared
                between several applications, and helped put the finishing
                touches on Analog (since sold to Appuous) prior to its release
                at the end of my internship. Through code review and mentoring,
                I learnt a lot about the structure of larger applications,
                dealing with web services and APIs, and about making very high
                quality, user-experience focused apps.
              </p>
            </div>
          </section>
        </div>
        <div className="w-100 w-50-l pl4-l">
          <section>
            <h2 className="f3-m  mb1 f2-l">Qualifications</h2>
            <div>
              <ul>
                <li>
                  <strong>
                    MEng Computer Science with Mobile and Secure Systems
                  </strong>
                  <br />
                  The University of Southampton (2010-2014)
                  <ul>
                    <li>Programming Principles: 92%</li>
                    <li>Secure Systems: 82%</li>
                    <li>Winner of 3rd Year Netcraft Prize</li>
                  </ul>
                </li>
                <li>
                  <strong>
                    A-Levels: Maths A, Physics A, Computing A*, Economics (AS) A
                  </strong>
                </li>
              </ul>
            </div>
          </section>
          <section className="pt3">
            <h2 className="f3-m  mb1 f2-l">Events</h2>
            <div>
              <p>
                I make an effort to attend industry events, as I find them a
                great way of learning new skills, finding alternate points of
                view, and getting critical feedback on ideas. Events I’ve been
                to include{" "}
                <a
                  className="link gray underline-hover"
                  href="http://www.manytomany.co.uk/"
                >
                  Many to Many
                </a>
                , Monzo hackathons (multiple years),{" "}
                <a
                  className="link gray underline-hover"
                  href="http://hackunamatata.nl/"
                >
                  Hackunamatata
                </a>
                , National Hack the Government (multiple years),{" "}
                <a
                  className="link gray underline-hover"
                  href="http://nsconference.com/"
                >
                  NSConference
                </a>
                , Southampton Appathon,{" "}
                <a
                  className="link gray underline-hover"
                  href="http://www.rhok.org/event/southampton-uk"
                >
                  Random Hack of Kindness
                </a>{" "}
                (multiple years),{" "}
                <a
                  className="link gray underline-hover"
                  href="http://rewiredstate.org/hacks/parliament-2012"
                >
                  Rewired State: Parliament
                </a>
                , Barcamp Brighton, Southampton, and London. I have won multiple
                hackathons, ofter with some help from friends.
              </p>
              <p>
                I have also presented at PyConUK and the London Django Meetup
                Group.
              </p>
              <ul>
                <li>
                  <a
                    className="link gray underline-hover"
                    href="https://www.youtube.com/watch?v=jBBcORHhfV0"
                  >
                    Scaling Django Codebases – PyConUK 2017
                  </a>
                </li>
                <li>
                  <a
                    className="link gray underline-hover"
                    href="https://skillsmatter.com/skillscasts/11718-django-enumfield"
                  >
                    Managing Special Cases with Django Enumfield – London Django
                    Meetup 2018
                  </a>
                </li>
              </ul>
            </div>
          </section>
          <section className="pt3">
            <h2 className="f3-m  mb1 f2-l">Skills</h2>
            <div>
              <h5>Technical</h5>
              <ul>
                <li>
                  Currently using Python, Django, Elm, Javascript, React and Git
                </li>
                <li>Experience using Postgres and Redis in production</li>
                <li>
                  Previously worked on Objective-C, C# .NET MVC and Node.js
                  codebases on professional projects
                </li>
                <li>Some experience with Haskell for personal projects</li>
                <li>Used Java, C and Io in university projects</li>
                <li>Knowledge of, and interest in, computer security issues</li>
                <li>
                  Basic knowledge, and interest in penetration testing and
                  malware analysis
                </li>
                <li>Experience with good software design practices</li>
              </ul>
              <h5>Non-Technical</h5>
              <ul>
                <li>Extensive experience with code review</li>
                <li>
                  Strong emphasis on empathy, candour and clarity in
                  communication
                </li>
                <li>Experience in hiring for software engineering roles</li>
                <li>
                  Experience with project management tools, bug tracking and
                  testing feedback
                </li>
                <li>Excellent written and spoken communication</li>
                <li>
                  Experience working in an environment with constant
                  re-prioritisation of work
                </li>
                <li>Able to learn new problem domains quickly</li>
              </ul>
            </div>
          </section>
          <section className="pt3">
            <h2 className="f3-m  mb1 f2-l">Contact</h2>
            <p>
              You can contact me a{" "}
              <a
                className="link gray underline-hover"
                href="mailto:cv@danpalmer.me"
              >
                cv@danpalmer.me
              </a>
            </p>
          </section>
        </div>
      </article>
    </Layout>
  );
};
