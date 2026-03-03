import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n";
import { serverUrl } from "../Services/Constants/Constants";

const News = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPoolId, setSelectedPoolId] = useState("All");
    const [contentPools, setContentPools] = useState([]);
    const [newsItems, setNewsItems] = useState([]);

    useEffect(() => {
        const fetchActiveContentPools = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch(`${serverUrl}/o/externalApis/getActiveContentPools`, {
                    method: "GET",
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await response.json();
                if (response.ok && data?.success && Array.isArray(data?.data)) {
                    setContentPools(data.data);
                }
            } catch (error) {}
        };

        fetchActiveContentPools();
    }, []);

    useEffect(() => {
        const fetchPublishedSlides = async () => {
            try {
                const endpoint = selectedPoolId === "All"
                    ? `${serverUrl}/o/externalApis/getAllPublishedSlides`
                    : `${serverUrl}/o/externalApis/getAllPublishedSlides?contentPoolId=${encodeURIComponent(selectedPoolId)}`;

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
    }, [selectedPoolId]);

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

                <div className="search-bar-container d-flex gap-3 mb-5 align-items-center filter-group p-3">
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

                    <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-filter text-info"></i>
                        <select
                            className="form-select filter-select"
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
                        filteredNews.map((item, index) => (
                            <div className="col-md-6" key={`${item.title || "news"}-${index}`}>
                                <div className="news-card">
                                    <div className="card-image-top d-flex align-items-center justify-content-center">
                                        <span className="display-1">{(item.poolName || "N").slice(0, 1).toUpperCase()}</span>
                                    </div>

                                    <div className="card-body-custom">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge category-badge text-capitalize">{item.poolName || "Updates"}</span>
                                            <span className="news-date">
                                                <i className="far fa-calendar-alt me-1"></i> {formatDate(item.publishDate)}
                                            </span>
                                        </div>
                                        <h4 className="news-title text-capitalize">{item.title}</h4>
                                        <p className="news-text text-capitalize">{item.subtitle || ""}</p>
                                        <hr className="divider" />
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <Link
                                                to={`/news/${index}`}
                                                state={{ item }}
                                                className="read-more"
                                            >
                                                Read More ->
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
