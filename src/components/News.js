import React from "react";

const newsData = [
  {
    id: 1,
    category: "Events",
    date: "March 1, 2026",
    title: "Spring Festival 2026 - Save the Date!",
    description: "Join us for our annual Spring Festival on March 15th. The festival will feature live music, local vendors, The festival will feature live music food trucks, and activities for all ages. Fun for the whole family!",
    author: "Events Team",
    icon: "🎉" // Aap yahan image tag bhi laga sakte hain
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
  return (
    <div className="news-wrapper py-5 px-4">
      <div className="container">
        {/* Header Section */}
        <div className="mb-4">
          <h1 className="text-white fw-bold m-0">News & Updates</h1>
          <p className="text-info opacity-75">Stay informed about what's happening in your community</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="search-bar-container d-flex gap-2 mb-5 align-items-center">
          <div className="position-relative flex-grow-1">
            <i className="bi bi-search search-icon"></i>
            <input type="text" className="form-control search-input" placeholder="Search news..." />
          </div>
          <button className="btn filter-btn"><i className="bi bi-funnel"></i></button>
          <select className="form-select filter-select">
            <option>All</option>
          </select>
        </div>

        {/* News Grid */}
        <div className="row g-4">
          {newsData.map((item) => (
            <div className="col-md-6" key={item.id}>
              <div className="news-card">
                {/* Top Icon Area */}
                <div className="card-image-top d-flex align-items-center justify-content-center">
                  <span className="display-1">{item.icon}</span>
                </div>
                
                {/* Content Area */}
                <div className="card-body-custom">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge category-badge">{item.category}</span>
                    <span className="news-date"><i className="bi bi-calendar3 me-1"></i> {item.date}</span>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;