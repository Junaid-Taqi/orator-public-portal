import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n";
import { serverUrl } from "../Services/Constants/Constants";

const News = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [municipalities, setMunicipalities] = useState([]);
    const [selectedMunicipalityId, setSelectedMunicipalityId] = useState("All");
    const [selectedPoolId, setSelectedPoolId] = useState("All");
    const [contentPools, setContentPools] = useState([]);
    const [newsItems, setNewsItems] = useState([]);

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
        const fetchActiveContentPools = async () => {
            try {
                const endpoint = selectedMunicipalityId === "All"
                    ? `${serverUrl}/o/externalApis/getActiveContentPools`
                    : `${serverUrl}/o/externalApis/getActiveContentPools?groupId=${encodeURIComponent(selectedMunicipalityId)}`;

                const response = await fetch(endpoint, {
                    method: "GET",
                });
                const data = await response.json();
                if (response.ok && data?.success && Array.isArray(data?.data)) {
                    setContentPools(data.data);
                } else {
                    setContentPools([]);
                }
            } catch (error) {
                setContentPools([]);
            }
        };

        fetchActiveContentPools();
    }, [selectedMunicipalityId]);

    useEffect(() => {
        if (
            selectedPoolId !== "All" &&
            !contentPools.some((pool) => String(pool.id) === String(selectedPoolId))
        ) {
            setSelectedPoolId("All");
        }
    }, [contentPools, selectedPoolId]);

    useEffect(() => {
        const fetchPublishedSlides = async () => {
            try {
                const params = new URLSearchParams();
                if (selectedPoolId !== "All") {
                    params.append("contentPoolId", String(selectedPoolId));
                }
                if (selectedMunicipalityId !== "All") {
                    params.append("groupId", String(selectedMunicipalityId));
                }
                const endpoint = params.toString().length > 0
                    ? `${serverUrl}/o/externalApis/getAllPublishedSlides?${params.toString()}`
                    : `${serverUrl}/o/externalApis/getAllPublishedSlides`;

                const response = await fetch(endpoint, {
                    method: "GET",
                });

                const data = await response.json();
                if (response.ok && data?.success && Array.isArray(data?.data)) {
                    setNewsItems(data.data);
                } else {
                    setNewsItems([]);
                }
            } catch (error) {
                setNewsItems([]);
            }
        };

        fetchPublishedSlides();
    }, [selectedPoolId, selectedMunicipalityId]);

    const formatDate = (value) => {
        if (!value) return "";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "";
        return parsed.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const filteredNews = newsItems.filter((item) => {
        const title = (item?.title || "").toLowerCase();
        const subtitle = (item?.subtitle || "").toLowerCase();
        const query = searchTerm.toLowerCase();
        return title.includes(query) || subtitle.includes(query);
    });

    return (
        <div className="news-wrapper py-5 px-4">
            <div className="container">
                <div className="mb-4">
                    <h2 className="text-white m-0">{t("news.title")}</h2>
                    <p className="text-info opacity-75">{t("news.subtitle")}</p>
                </div>

                <div className="search-bar-container d-flex flex-wrap gap-3 mb-5 align-items-center filter-group p-3">
                    <div className="position-relative flex-grow-1">
                        <FontAwesomeIcon icon={faSearch} className="search-icon-position" />
                        <input
                            type="text"
                            className="form-control search-input py-3"
                            placeholder={t("news.searchPlaceholder")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <i className="fas fa-filter text-info"></i>
                        <select
                            className="form-select filter-select news-select-filter"
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
                        <select
                            className="form-select filter-select news-select-filter"
                            value={selectedPoolId}
                            onChange={(e) => setSelectedPoolId(e.target.value)}
                        >
                            <option value="All">{t("news.all")}</option>
                            {contentPools.map((pool) => (
                                <option key={pool.id} value={String(pool.id)}>
                                    {pool.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row g-4">
                    {filteredNews.length > 0 ? (
                        filteredNews.map((item) => (
                            <div className="col-md-6" key={String(item.id || item.mediaId)}>
                                <div className="news-card">
                                    <div className="card-image-top d-flex align-items-center justify-content-center">
                                        {item.mediaUrl ? (
                                            <img
                                                src={item.mediaUrl}
                                                alt={item.title || "News media"}
                                                className="news-details-image"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                                            />
                                        ) : (
                                                <span className="display-1">{(item.title || "N").slice(0, 1).toUpperCase()}</span>
                                        )}
                                    </div>

                                    <div className="card-body-custom">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge category-badge text-capitalize">{item.poolName || t('newsDetails.updates')}</span>
                                            <span className="news-date">
                                                <i className="far fa-calendar-alt me-1"></i> {formatDate(item.publishDate)}
                                            </span>
                                        </div>
                                        <h4 className="news-title text-capitalize">{item.title}</h4>
                                        <p className="news-text text-capitalize">{item.subtitle || ""}</p>
                                        <hr className="divider" />
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <Link
                                                to={`/news/${item.id || item.mediaId}`}
                                                state={{ item }}
                                                className="read-more"
                                            >
                                                {t('news.readMore')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <h5 className="text-muted">{t("news.noResults")}{searchTerm ? ` \"${searchTerm}\"` : ""}</h5>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default News;
