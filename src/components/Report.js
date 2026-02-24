import React, { useState, useRef } from "react";

const categories = [
    "Street Lighting",
    "Potholes",
    "Garbage Collection",
    "Water/Sewage",
    "Park Maintenance",
    "Traffic Signals",
    "Graffiti",
    "Other",
];

const Report = () => {
    const fileInputRef = useRef(null); // Hidden input ko control karne ke liye
    const [formData, setFormData] = useState({
        name: "",
        officialId: "",
        subject: "",
        address: "",
        description: "",
        accept: false,
        image: null, // Image store karne ke liye
    });

    const [selectedCategory, setSelectedCategory] = useState("");
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        setFormData({
            ...formData,
            [name]: newValue,
        });

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    // ✅ Image handling logic
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
        }
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.subject.trim()) newErrors.subject = "Subject is required";
        if (!selectedCategory) newErrors.category = "Please select a category";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.accept) newErrors.accept = "You must accept responsibility";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log("Form Submitted:", { ...formData, selectedCategory });
            alert("Report submitted successfully!");
        }
    };

    return (
        <div className="report-wrapper">
            <div className="report-card">
                <h2 className="report-title">Report a Problem</h2>

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="form-group">
                        <label>Your Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>

                    {/* Official ID */}
                    <div className="form-group">
                        <label>Official ID (Optional)</label>
                        <input
                            type="text"
                            name="officialId"
                            value={formData.officialId}
                            onChange={handleChange}
                            placeholder="Enter your official ID"
                        />
                    </div>

                    {/* Subject */}
                    <div className="form-group">
                        <label>Subject *</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Brief description of the issue"
                        />
                        {errors.subject && <span className="error">{errors.subject}</span>}
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label>Problem Category *</label>
                        <div className="category-grid">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        if (errors.category) {
                                            setErrors((prev) => ({ ...prev, category: "" }));
                                        }
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        {errors.category && <span className="error">{errors.category}</span>}
                    </div>

                    {/* Address */}
                    <div className="form-group">
                        <label>Address / Location *</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter address or intersection"
                        />
                        {errors.address && <span className="error">{errors.address}</span>}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label>Detailed Description *</label>
                        <textarea
                            rows="4"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Please provide details about the problem..."
                        />
                        {errors.description && <span className="error">{errors.description}</span>}
                    </div>

                    {/* ✅ PHOTO UPLOAD SECTION (Based on your image) */}
                    <div className="photo-upload-container">
                        <label className="photo-label">Add Photo (Optional - Max 1)</label>
                        <div className="upload-dropzone" onClick={() => fileInputRef.current.click()}>
                            <div className="upload-ui">
                                <div className="camera-icon-wrapper">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                </div>
                                <p className="upload-text">
                                    {formData.image ? formData.image.name : "Upload a photo to help us understand the problem"}
                                </p>
                                <button type="button" className="choose-photo-button">
                                    <span style={{fontSize: '18px', marginRight: '5px'}}>↑</span> Choose Photo
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageChange} 
                                    accept="image/*" 
                                    style={{ display: "none" }} 
                                />
                            </div>
                        </div>
                        <p className="upload-footer-text">Supported formats: JPG, PNG (Max 10MB, 1 photo limit)</p>
                    </div>

                    {/* Checkbox */}
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="accept"
                            name="accept"
                            checked={formData.accept}
                            onChange={handleChange}
                        />
                        <label htmlFor="accept">
                            I accept responsibility for the accuracy of this report
                        </label>
                    </div>
                    {errors.accept && <span className="error">{errors.accept}</span>}

                    {/* Submit */}
                    <button type="submit" className="submit-btn">
                        Submit Report
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Report;