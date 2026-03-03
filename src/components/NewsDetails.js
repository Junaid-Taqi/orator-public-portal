import React from "react";
import { Link, useLocation } from "react-router-dom";

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
    const location = useLocation();
    const item = location?.state?.item;

    if (!item) {
        return (
            <div className="news-wrapper py-5 px-4">
                <div className="container">
                    <h2 className="text-white m-0">News Details</h2>
                    <p className="text-info opacity-75">No article data found.</p>
                    <Link to="/news" className="read-more">&lt;- Back to News</Link>
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
                    <p className="news-text">
                        Details page placeholder. You can integrate your article/content details API here.
                    </p>
                    <Link to="/news" className="read-more">&lt;- Back to News</Link>
                </div>
            </div>
        </div>
    );
};

export default NewsDetails;
