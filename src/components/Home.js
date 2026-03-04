import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from '../i18n';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpRightFromSquare,
    faLocationDot,
    faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { serverUrl } from "../Services/Constants/Constants";

const Home = () => {
    const { t } = useTranslation();
    const [latestUpdates, setLatestUpdates] = useState([]);

    useEffect(() => {
        const fetchLatestUpdates = async () => {
            try {
                const response = await fetch(`${serverUrl}/o/externalApis/getLatestPublishedSlidePerPool`, {
                    method: "GET",
                });

                const data = await response.json();
                if (response.ok && data?.success && Array.isArray(data?.data)) {
                    setLatestUpdates(data.data);
                }
            } catch (error) {}
        };

        fetchLatestUpdates();
    }, []);

    const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const apiCards = latestUpdates.map((item) => ({
        id: item.id || item.mediaId,
        item,
        icon: (item.poolName || "U").slice(0, 1).toUpperCase(),
        badge: item.poolName || "Updates",
        date: formatDate(item.publishDate),
        title: item.title || "",
        subtitle: item.subtitle || "",
        description: item.webDescription || item.subtitle || "",
    }));

    return (
        <div className="home">

            {/* Hero Section */}
            <section className="hero">
                <h1>{t('home.welcome')}</h1>
                <p>{t('home.intro')}</p>

                <div className="hero-cards">
                    <Link to="/news" className="hero-card">
                        <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                            className="hero-icon"
                        />
                        <h5>{t('home.viewAllNews')}</h5>
                    </Link>

                    <Link to="/report" className="hero-card">
                        <FontAwesomeIcon
                            icon={faLocationDot}
                            className="hero-icon"
                        />
                        <h5>{t('home.reportProblem')}</h5>
                    </Link>

                    <Link to="/calendar" className="hero-card">
                        <FontAwesomeIcon
                            icon={faCalendarDays}
                            className="hero-icon"
                        />
                        <h5>{t('home.eventCalendar')}</h5>
                    </Link>
                </div>
            </section>

            {/* Latest Updates */}
            <section className="updates">
                <div className="updates-header">
                    <h2>{t('home.latestUpdates')}</h2>
                    <Link to="/news" className="view-all">{t('home.viewAll')}</Link>
                </div>

                <div className="update-cards">
                    {apiCards.map((card) => (
                        <div key={card.id} className="update-card">
                            <div className="update-top">{card.icon}</div>
                            <div className="update-bottom">
                                <div className="update-info-top">
                                    <div className="badge text-capitalize">{card.badge}</div>
                                    <div className="date">{card.date}</div>
                                </div>
                                <h4 className="text-capitalize">{card.title}</h4>
                                <p className="text-capitalize">{card.subtitle}</p>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <Link
                                        to={`/news/${card.id}`}
                                        state={{ item: card.item }}
                                        className="read-more"
                                    >
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Community Impact Section */}
            <section className="impact-section">
                <div className="impact-card">
                    <h2 className="mb-4">{t('home.communityImpact')}</h2>

                    <div className="impact-stats">
                        <div className="impact-item">
                            <h3 className="impact-blue">342</h3>
                            <p>{t('home.activeCitizens')}</p>
                        </div>

                        <div className="impact-item">
                            <h3 className="impact-green">156</h3>
                            <p>{t('home.problemsResolved')}</p>
                        </div>

                        <div className="impact-item">
                            <h3 className="impact-purple">89</h3>
                            <p>{t('home.newsUpdates')}</p>
                        </div>

                        <div className="impact-item">
                            <h3 className="impact-orange">12</h3>
                            <p>{t('home.upcomingEvents')}</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
