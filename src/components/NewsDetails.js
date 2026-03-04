import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { serverUrl } from "../Services/Constants/Constants";

const formatDate = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const NewsDetails = () => {
    const { newsId } = useParams();
    const location = useLocation();
    const fallbackItem = location?.state?.item;
    const [item, setItem] = useState(null);
    const [relatedItems, setRelatedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const slideId = useMemo(() => {
        const routeId = Number(newsId);
        if (!Number.isNaN(routeId) && routeId > 0) return routeId;

        const stateId = Number(fallbackItem?.id || fallbackItem?.mediaId);
        if (!Number.isNaN(stateId) && stateId > 0) return stateId;

        return 0;
    }, [newsId, fallbackItem]);

    const parsedConfig = useMemo(() => {
        if (!item?.configJSON) return {};
        if (typeof item.configJSON === "object") return item.configJSON;
        try {
            const parsed = JSON.parse(item.configJSON);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (e) {
            return {};
        }
    }, [item?.configJSON]);

    const tags = Array.isArray(parsedConfig?.tags)
        ? parsedConfig.tags.filter((tag) => typeof tag === "string" && tag.trim())
        : [];

    useEffect(() => {
        const fetchSlideDetails = async () => {
            if (!slideId) {
                setItem(fallbackItem || null);
                setLoading(false);
                setError("No valid slide id found.");
                return;
            }

            setLoading(true);
            setError("");
            try {
                const response = await fetch(`${serverUrl}/o/externalApis/getSlideDetailsById/${slideId}`, {
                    method: "GET",
                });
                const data = await response.json();

                if (response.ok && data?.success && data?.data) {
                    setItem(data.data);
                } else {
                    setItem(fallbackItem || null);
                    setError(data?.message || "Failed to load news details.");
                }
            } catch (e) {
                setItem(fallbackItem || null);
                setError("Failed to load news details.");
            } finally {
                setLoading(false);
            }
        };

        fetchSlideDetails();
    }, [slideId, fallbackItem]);

    useEffect(() => {
        const fetchRelatedSlides = async () => {
            if (!item?.poolName) {
                setRelatedItems([]);
                return;
            }

            try {
                const response = await fetch(`${serverUrl}/o/externalApis/getAllPublishedSlides`, {
                    method: "GET",
                });
                const data = await response.json();

                if (!response.ok || !data?.success || !Array.isArray(data?.data)) {
                    setRelatedItems([]);
                    return;
                }

                const currentId = String(item.id || item.mediaId || "");
                const filtered = data.data
                    .filter((entry) => String(entry.id || entry.mediaId || "") !== currentId)
                    .filter((entry) => String(entry.poolName || "").trim() === String(item.poolName || "").trim())
                    .slice(0, 4);

                setRelatedItems(filtered);
            } catch (e) {
                setRelatedItems([]);
            }
        };

        fetchRelatedSlides();
    }, [item]);

    if (loading) {
        return (
            <div className="news-wrapper py-5 px-4">
                <div className="container">
                    <h2 className="text-white m-0">News Details</h2>
                    <p className="text-info opacity-75">Loading article...</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="news-wrapper py-5 px-4">
                <div className="container">
                    <h2 className="text-white m-0">News Details</h2>
                    <p className="text-info opacity-75">{error || "No article data found."}</p>
                    <Link to="/news" className="read-more">Back to News</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="news-wrapper py-5 px-4">
            <div className="container news-details-container">
                <div className="news-back-row">
                    <Link to="/news" className="news-back-link">
                        ← Back to News
                    </Link>
                </div>

                <div className="news-details-grid">
                    <div className="news-details-main">
                        <div className="news-details-image-wrap">
                            {item.mediaUrl ? (
                                <img
                                    src={item.mediaUrl}
                                    alt={item.title || "News media"}
                                    className="news-details-image"
                                />
                            ) : (
                                <div className="news-details-image-placeholder">
                                    {(item.poolName || "N").slice(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="news-details-content">
                            <div className="news-details-meta-row">
                                <span className="badge category-badge">{item.poolName || "Updates"}</span>
                                <span className="news-details-meta-item">📅 {formatDate(item.publishDate)}</span>
                            </div>

                            <h1 className="news-details-title">{item.title || "Untitled"}</h1>
                            {!!item.subtitle && <p className="news-details-subtitle">{item.subtitle}</p>}

                            {!!tags.length && (
                                <div className="news-details-tags-wrap">
                                    <span className="news-details-tag-icon">🏷</span>
                                    <div className="news-details-tags">
                                        {tags.map((tag) => (
                                            <span key={tag} className="news-details-tag-chip">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="news-details-description">{item.webDescription || item.subtitle || ""}</p>
                            {error && <p className="text-warning mb-0">{error}</p>}
                        </div>
                    </div>

                    <aside className="news-details-sidebar">
                        <h3>Related Articles</h3>
                        {!relatedItems.length ? (
                            <p className="news-details-empty-related">No related articles found</p>
                        ) : (
                            <div className="news-details-related-list">
                                {relatedItems.map((related) => (
                                    <Link
                                        key={String(related.id || related.mediaId)}
                                        to={`/news/${related.id || related.mediaId}`}
                                        state={{ item: related }}
                                        className="news-details-related-item"
                                    >
                                        <strong>{related.title || "Untitled"}</strong>
                                        <small>{formatDate(related.publishDate)}</small>
                                    </Link>
                                ))}
                            </div>
                        )}
                        <Link to="/news" className="news-details-view-all">View All News →</Link>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default NewsDetails;
