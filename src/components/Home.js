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
    const [municipalities, setMunicipalities] = useState([]);
    const [selectedMunicipalityId, setSelectedMunicipalityId] = useState("All");
    const [impactCounts, setImpactCounts] = useState({
        allUsersCount: 0,
        problemsResolvedCount: 0,
        totalPublishedSlidesCount: 0,
        upcomingEventsCount: 0,
    });

    useEffect(() => {
        const fetchMunicipalities = async () => {
            try {
                const response = await fetch(`${serverUrl}/o/endUserRegistrationApplication/getMunicipalities`, {
                    method: "GET",
                });
                const data = await response.json();

                if (response.ok && data?.success && Array.isArray(data?.data)) {
                    setMunicipalities(data.data);
                } else {
                    setMunicipalities([]);
                }
            } catch (error) {
                setMunicipalities([]);
            }
        };

        fetchMunicipalities();
    }, []);

    useEffect(() => {
        const fetchLatestUpdates = async () => {
            try {
                const params = new URLSearchParams();
                if (selectedMunicipalityId !== "All") {
                    params.append("groupId", String(selectedMunicipalityId));
                }

                const endpoint = params.toString().length > 0
                    ? `${serverUrl}/o/externalApis/getLatestPublishedSlidePerPool?${params.toString()}`
                    : `${serverUrl}/o/externalApis/getLatestPublishedSlidePerPool`;

                const response = await fetch(endpoint, {
                    method: "GET",
                });

                const data = await response.json();
                if (response.ok && data?.success && Array.isArray(data?.data)) {
                    setLatestUpdates(data.data);
                    setImpactCounts({
                        allUsersCount: Number(data?.allUsersCount || 0),
                        problemsResolvedCount: Number(data?.problemsResolvedCount || 0),
                        totalPublishedSlidesCount: Number(data?.totalPublishedSlidesCount || 0),
                        upcomingEventsCount: Number(data?.upcomingEventsCount || 0),
                    });
                } else {
                    setLatestUpdates([]);
                }
            } catch (error) {
                setLatestUpdates([]);
            }
        };

        fetchLatestUpdates();
    }, [selectedMunicipalityId]);

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

    const apiCards = [...latestUpdates]
        .sort((a, b) => {
            const aTime = new Date(a?.publishDate || 0).getTime();
            const bTime = new Date(b?.publishDate || 0).getTime();
            return bTime - aTime;
        })
        .slice(0, 6)
        .map((item) => ({
            id: item.id,
            item,
            icon: (item.poolName || "U").slice(0, 1).toUpperCase(),
            badge: item.poolName || t('newsDetails.updates'),
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
                <div className="d-flex align-items-center justify-content-center gap-3">
                    <div className="municipality-card-wrapper d-flex align-items-center justify-content-center gap-3">
                        {/* Left Side Icon */}
                        <div className="icon-circle">
                            <FontAwesomeIcon
                            icon={faLocationDot}
                            className=""
                        />
                        </div>

                        {/* Text and Select Container */}
                        <div className="flex-grow-1">
                            <label className="select-label m-0">Select Your Municipality</label>
                            <p className="select-subtitle m-0">Choose your location to see relevant updates</p>

                            <select
                                className="form-select custom-glass-select text-center"
                                value={selectedMunicipalityId}
                                onChange={(e) => setSelectedMunicipalityId(e.target.value)}
                            >
                                <option value="All">{t("calendar.allMunicipalities")}</option>
                                {municipalities.map((municipality, index) => (
                                    <option key={`${municipality.groupId}-${index}`} value={String(municipality.groupId)}>
                                        {municipality.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>


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
                <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                    <div className="latestUpdate">
                        <h2 className="m-0">{t('home.latestUpdates')}</h2>
                    </div>
                    <div className="filterDropdown d-flex gap-3 align-items-center">
                        <Link to="/news" className="header-action-btn">{t('home.viewAll')}</Link>
                    </div>
                </div>

                <div className="update-cards">
                    {apiCards.map((card) => (
                        <div key={card.id} className="update-card">
                            <div className="update-top">
                                {card.item.mediaUrl ? (
                                    <img
                                        src={card.item.mediaUrl}
                                        alt={card.title || "Update media"}
                                        className="news-details-image"
                                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                                    />
                                ) : (
                                    card.icon
                                )}
                            </div>
                            <div className="update-bottom">
                                <div className="update-info-top">
                                    <div className="badge text-capitalize">{card.badge}</div>
                                    <div className="date">{card.date}</div>
                                </div>
                                <h4 className="text-capitalize CustomTitle">{card.title}</h4>
                                <p className="text-capitalize news-text">{card.subtitle}</p>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <Link
                                        to={`/news/${card.id}`}
                                        state={{ item: card.item }}
                                        className="read-more"
                                    >
                                        {t('news.readMore')}
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
                            <h3 className="impact-blue">{impactCounts.allUsersCount}</h3>
                            <p>{t('home.activeCitizens')}</p>
                        </div>

                        <div className="impact-item">
                            <h3 className="impact-green">{impactCounts.problemsResolvedCount}</h3>
                            <p>{t('home.problemsResolved')}</p>
                        </div>

                        <div className="impact-item">
                            <h3 className="impact-purple">{impactCounts.totalPublishedSlidesCount}</h3>
                            <p>{t('home.newsUpdates')}</p>
                        </div>

                        <div className="impact-item">
                            <h3 className="impact-orange">{impactCounts.upcomingEventsCount}</h3>
                            <p>{t('home.upcomingEvents')}</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
