import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpRightFromSquare,
    faLocationDot,
    faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
    return (
        <div className="home container">

            {/* Hero Section */}
            <section className="hero">
                <h1>Welcome to ORATOR</h1>
                <p>
                    Stay connected with your community. Access news, updates, and report
                    issues directly to your municipality.
                </p>

                <div className="hero-cards">
                    <div className="hero-card">
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="hero-icon" />
                        <h3>View All News</h3>
                    </div>

                    <div className="hero-card">
                        <FontAwesomeIcon icon={faLocationDot} className="hero-icon" />
                        <h3>Report a Problem</h3>
                    </div>

                    <div className="hero-card">
                        <FontAwesomeIcon icon={faCalendarDays} className="hero-icon" />
                        <h3>Event Calendar</h3>
                    </div>
                </div>
            </section>

            {/* Latest Updates */}
            <section className="updates">
                <div className="updates-header">
                    <h2>Latest Updates</h2>
                    <span className="view-all">View All →</span>
                </div>

                <div className="update-cards">

                    <div className="update-card">
                        <div className="update-top">🎉</div>
                        <div className="update-bottom">
                            <div className="badge">Events</div>
                            <h4>Spring Festival 2026 - Save the Date!</h4>
                            <p>
                                Join us for our annual Spring Festival on March 15th. Fun for
                                the whole family!
                            </p>
                        </div>
                    </div>

                    <div className="update-card">
                        <div className="update-top">🏢</div>
                        <div className="update-bottom">
                            <div className="badge">Community</div>
                            <h4>New Community Center Opening</h4>
                            <p>
                                State-of-the-art facility opens next month with sports,
                                arts, and education programs.
                            </p>
                        </div>
                    </div>

                    <div className="update-card">
                        <div className="update-top">🚧</div>
                        <div className="update-bottom">
                            <div className="badge">Infrastructure</div>
                            <h4>Road Maintenance Schedule</h4>
                            <p>
                                Planned road work for downtown area. Check dates and
                                alternative routes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Impact Section */}
            <section className="impact-section">
                <div className="impact-card">
                    <h2>Community Impact</h2>

                    <div className="impact-stats">
                        <div className="impact-item">
                            <h3 className="impact-blue">342</h3>
                            <p>Active Citizens</p>
                        </div>

                        <div className="impact-item">
                            <h3 className="impact-green">156</h3>
                            <p>Problems Resolved</p>
                        </div>

                        <div className="impact-item">
                            <h3 className="impact-purple">89</h3>
                            <p>News Updates</p>
                        </div>

                        <div className="impact-item">
                            <h3 className="impact-orange">12</h3>
                            <p>Upcoming Events</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;