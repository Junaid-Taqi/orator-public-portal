import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useTranslation } from '../i18n';

const newsData = [
    {
        id: 1,
        category: "Events",
        date: "March 1, 2026",
        title: "Spring Festival 2026 - Save the Date!",
        description: "Join us for our annual Spring Festival on March 15th our state-of-the-art community center next month. The festival will feature live music, local vendors, food trucks, and activities for all ages. Fun for the whole family!",
        author: "Events Team",
        icon: "🎉"
    },
    {
        id: 2,
        category: "Community",
        date: "February 28, 2026",
        title: "New Community Center Opening",
        description: "We're excited to announce the grand opening of our state-of-the-art community center next month. The facility includes a gymnasium, art studios, computer lab, and meeting spaces.",
        author: "Community Services",
        icon: "🏢"
    }
];

const News = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // ✅ Search aur Filter Logic
    const filteredNews = newsData.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="news-wrapper py-5 px-4">
            <div className="container">
                {/* Header Section */}
                <div className="mb-4">
                    <h2 className="text-white m-0">{t('news.title')}</h2>
                    <p className="text-info opacity-75">{t('news.subtitle')}</p>
                </div>

                {/* ✅ Search & Filter Bar (Functional) */}
                <div className="search-bar-container d-flex gap-3 mb-5 align-items-center filter-group p-3">
                    {/* Big Search Input */}
                    <div className="position-relative flex-grow-1">
                        {/* Icon ko input ke upar rakha gaya hai */}
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="search-icon-position"
                        />
                        <input
                            type="text"
                            className="form-control search-input py-3"
                            placeholder={t('news.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Small Filter & Dropdown */}
                    <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-filter text-info"></i>
                        <select
                            className="form-select filter-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="All">{t('news.all')}</option>
                            <option value="Events">Events</option>
                            <option value="Community">Community</option>
                        </select>
                    </div>
                </div>

                {/* News Grid */}
                <div className="row g-4">
                    {filteredNews.length > 0 ? (
                        filteredNews.map((item) => (
                            <div className="col-md-6" key={item.id}>
                                <div className="news-card">
                                    <div className="card-image-top d-flex align-items-center justify-content-center">
                                        <span className="display-1">{item.icon}</span>
                                    </div>

                                    <div className="card-body-custom">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge category-badge">{item.category}</span>
                                            <span className="news-date">
                                                <i className="far fa-calendar-alt me-1"></i> {item.date}
                                            </span>
                                        </div>
                                        <h4 className="news-title">{item.title}</h4>
                                        <p className="news-text">{item.description}</p>
                                        <hr className="divider" />
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="author-name">By {item.author}</span>
                                            <a href="#" className="read-more">Read More →</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <h5 className="text-muted">{t('news.noResults')} "{searchTerm}"</h5>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default News;