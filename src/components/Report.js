import React, { useState, useRef } from "react";
import { useTranslation } from '../i18n';

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
    const { t } = useTranslation();
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
        if (!formData.name.trim()) newErrors.name = t('reportForm.errors.name');
        if (!formData.subject.trim()) newErrors.subject = t('reportForm.errors.subject');
        if (!selectedCategory) newErrors.category = t('reportForm.errors.category');
        if (!formData.address.trim()) newErrors.address = t('reportForm.errors.address');
        if (!formData.description.trim()) newErrors.description = t('reportForm.errors.description');
        if (!formData.accept) newErrors.accept = t('reportForm.errors.accept');

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
                <h2 className="report-title">{t('reportForm.title')}</h2>

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="form-group">
                        <label>{t('reportForm.name')}</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('reportForm.namePlaceholder')}
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>

                    {/* Official ID */}
                    <div className="form-group">
                        <label>{t('reportForm.officialId')}</label>
                        <input
                            type="text"
                            name="officialId"
                            value={formData.officialId}
                            onChange={handleChange}
                            placeholder={t('reportForm.officialIdPlaceholder')}
                        />
                    </div>

                    {/* Subject */}
                    <div className="form-group">
                        <label>{t('reportForm.subject')}</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder={t('reportForm.subjectPlaceholder')}
                        />
                        {errors.subject && <span className="error">{errors.subject}</span>}
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label>{t('reportForm.category')}</label>
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
                        <label>{t('reportForm.address')}</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder={t('reportForm.addressPlaceholder')}
                        />
                        {errors.address && <span className="error">{errors.address}</span>}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label>{t('reportForm.description')}</label>
                        <textarea
                            rows="4"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder={t('reportForm.descriptionPlaceholder')}
                        />
                        {errors.description && <span className="error">{errors.description}</span>}
                    </div>

                    {/* ✅ PHOTO UPLOAD SECTION (Based on your image) */}
                    <div className="photo-upload-container">
                        <label className="photo-label">{t('reportForm.uploadLabel')}</label>
                        <div className="upload-dropzone" onClick={() => fileInputRef.current.click()}>
                            <div className="upload-ui">
                                <div className="camera-icon-wrapper">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                </div>
                                <p className="upload-text">
                                    {formData.image ? formData.image.name : t('reportForm.uploadTextDefault')}
                                </p>
                                <button type="button" className="choose-photo-button">
                                    <span style={{fontSize: '18px', marginRight: '5px'}}>↑</span> {t('reportForm.uploadChoose')}
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
                        <p className="upload-footer-text">{t('reportForm.uploadFooter')}</p>
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
                            {t('reportForm.acceptText')}
                        </label>
                    </div>
                    {errors.accept && <span className="error">{errors.accept}</span>}

                    {/* Submit */}
                    <button type="submit" className="submit-btn">
                        {t('reportForm.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Report;