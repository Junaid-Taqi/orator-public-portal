import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { serverUrl } from "../Services/Constants/Constants";

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

const NewsDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const fallbackItem = location?.state?.item;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const slideId = useMemo(() => {
        const routeId = Number(id);
        if (!Number.isNaN(routeId) && routeId > 0) return routeId;

        const stateId = Number(fallbackItem?.id || fallbackItem?.mediaId);
        if (!Number.isNaN(stateId) && stateId > 0) return stateId;

        return 0;
    }, [id, fallbackItem]);

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
            <div className="container">
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge category-badge">{item.poolName || "Updates"}</span>
                        <span className="news-date">{formatDate(item.publishDate)}</span>
                    </div>
                    <h2 className="text-white m-0">{item.title || "Untitled"}</h2>
                    <p className="text-info opacity-75 mt-2">{item.subtitle || ""}</p>
                </div>

                <div className="news-card p-4">
                    {error && <p className="text-warning mb-3">{error}</p>}
                    {item.mediaUrl && (
                        <img
                            src={item.mediaUrl}
                            alt={item.title || "News media"}
                            className="img-fluid rounded mb-3"
                        />
                    )}
                    <p className="news-text">{item.webDescription || item.subtitle || ""}</p>
                    <Link to="/news" className="read-more btn btn-outline-light text-decoration-none"> Back to News</Link>
                </div>
            </div>
        </div>
    );
};

export default NewsDetails;
