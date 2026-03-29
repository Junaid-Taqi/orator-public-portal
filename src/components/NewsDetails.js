import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from '../i18n';
import ReCAPTCHA from "react-google-recaptcha";
import { serverUrl } from "../Services/Constants/Constants";

// Map raw tag values (as they come from backend) to translation keys
const TAG_VALUE_TO_KEY = {
    '🏥 Health': 'health',
    '⚽ Sport': 'sport',
    '⚽ Football': 'football',
    '🏀 Basketball': 'basketball',
    '🎾 Tennis': 'tennis',
    '🏊 Swimming': 'swimming',
    '🚗 Traffic': 'traffic',
    '🏗️ Infrastructure': 'infrastructure',
    '🏘️ Communal': 'communal',
    '🌳 Environment': 'environment',
    '👶 Child Care': 'childCare',
    '👥 Social': 'social',
    '🌍 International': 'international',
    '🎓 Education': 'education',
    '🎭 Culture': 'culture',
    '🚨 Safety': 'safety',
    '🏠 Housing': 'housing',
    '💼 Economy': 'economy'
};

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

const getClientRefId = (entry) => {
    if (!entry) return "";
    if (entry.clientRefId) return String(entry.clientRefId);
    const rawConfig = entry.configJSON;
    if (!rawConfig) return "";
    if (typeof rawConfig === "object" && rawConfig !== null) {
        return String(rawConfig.clientRefId || rawConfig.clientRef || "");
    }
    try {
        const parsed = JSON.parse(rawConfig);
        if (parsed && typeof parsed === "object") {
            return String(parsed.clientRefId || parsed.clientRef || "");
        }
    } catch (e) {
        return "";
    }
    return "";
};

const parseDateValue = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const toDateWindow = (startValue, endValue) => {
    const start = parseDateValue(startValue);
    const end = parseDateValue(endValue);
    if (!start && !end) return null;
    if (start && end) {
        if (start <= end) return { start, end };
        return { start: end, end: start };
    }
    const single = start || end;
    return { start: single, end: single };
};

const addDateWindowsFromArray = (arr, windows) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((value) => {
        const window = toDateWindow(value, value);
        if (window) windows.push(window);
    });
};

const collectEventDateWindows = (item, config) => {
    const windows = [];
    const addRangeArray = (ranges) => {
        if (!Array.isArray(ranges)) return;
        ranges.forEach((range) => {
            if (!range || typeof range !== "object") return;
            const window = toDateWindow(
                range.startDate || range.start || range.from,
                range.endDate || range.end || range.to
            );
            if (window) windows.push(window);
        });
    };

    if (item) {
        if (item.eventMode) {
            if (item.eventMode === 1 && item.eventStartDate) {
                const window = toDateWindow(item.eventStartDate, item.eventStartDate);
                if (window) windows.push(window);
            } else if (item.eventMode === 2 && (item.eventStartDate || item.eventEndDate)) {
                const window = toDateWindow(item.eventStartDate, item.eventEndDate);
                if (window) windows.push(window);
            } else if (item.eventMode === 3 && item.eventDates) {
                let parsedDates = [];
                try {
                    parsedDates = typeof item.eventDates === "string" ? JSON.parse(item.eventDates) : item.eventDates;
                } catch (e) { }
                addDateWindowsFromArray(parsedDates, windows);
            }
        } else {
            let parsedDates = item.eventDates;
            if (typeof item.eventDates === "string") {
                try {
                    parsedDates = JSON.parse(item.eventDates);
                } catch (e) { }
            }
            addDateWindowsFromArray(parsedDates, windows);
            addDateWindowsFromArray(item.dates, windows);
            if (item.eventDate) {
                const window = toDateWindow(item.eventDate, item.eventDate);
                if (window) windows.push(window);
            }
            if (item.eventStartDate || item.eventEndDate) {
                const window = toDateWindow(item.eventStartDate, item.eventEndDate);
                if (window) windows.push(window);
            }
            addRangeArray(item.eventDateRanges);
            addRangeArray(item.dateRanges);
        }
    }

    if (config && typeof config === "object") {
        addDateWindowsFromArray(config.eventDates, windows);
        addDateWindowsFromArray(config.dates, windows);
        if (config.eventDate) {
            const window = toDateWindow(config.eventDate, config.eventDate);
            if (window) windows.push(window);
        }
        if (config.eventStartDate || config.eventEndDate) {
            const window = toDateWindow(config.eventStartDate, config.eventEndDate);
            if (window) windows.push(window);
        }
        addRangeArray(config.eventDateRanges);
        addRangeArray(config.dateRanges);

        if (config.event && typeof config.event === "object") {
            addDateWindowsFromArray(config.event.eventDates, windows);
            addDateWindowsFromArray(config.event.dates, windows);
            if (config.event.eventDate) {
                const window = toDateWindow(config.event.eventDate, config.event.eventDate);
                if (window) windows.push(window);
            }
            if (config.event.startDate || config.event.endDate) {
                const window = toDateWindow(config.event.startDate, config.event.endDate);
                if (window) windows.push(window);
            }
            addRangeArray(config.event.dateRanges);
            addRangeArray(config.event.eventDateRanges);
        }
    }

    return windows;
};


const NewsDetails = ({ hasCitizenRole }) => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n?.language || 'en-GB';
    const { newsId } = useParams();
    const location = useLocation();
    const fallbackItem = location?.state?.item;
    const [item, setItem] = useState(null);
    const [relatedItems, setRelatedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [actionTone, setActionTone] = useState("info");
    const [isFavorited, setIsFavorited] = useState(false);
    const [currentFavoriteId, setCurrentFavoriteId] = useState(null);
    const [showReminderDialog, setShowReminderDialog] = useState(false);
    const [reminderEmail, setReminderEmail] = useState("");
    const [reminderOffset, setReminderOffset] = useState(1);
    const [reminderStatus, setReminderStatus] = useState("idle");
    const [reminderMessage, setReminderMessage] = useState("");
    const [reminderCaptcha, setReminderCaptcha] = useState("");
    const reminderCaptchaRef = useRef(null);
    const actionTimerRef = useRef(null);

    const slideUuid = useMemo(() => {
        if (newsId && newsId.length > 0 && !newsId.startsWith("qr-code-scan")) {
            return newsId;
        }
        const stateId = fallbackItem?.id;
        if (stateId && !stateId.startsWith("qr-code-scan")) {
            return stateId;
        }
        return 0;
    }, [newsId, fallbackItem]);

    const routeRef = useMemo(() => {
        if (slideUuid) return "";
        const trimmed = String(newsId || "").trim();
        return trimmed || "";
    }, [newsId, slideUuid]);

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

    const eventDateWindows = useMemo(() => collectEventDateWindows(item, parsedConfig), [item, parsedConfig]);

    const formatEventDate = (value) => {
        if (!value) return "";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString(currentLang, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formattedEventWindows = useMemo(() => {
        return eventDateWindows.map((window) => {
            const startText = formatEventDate(window.start);
            const endText = formatEventDate(window.end);
            const isSingleDay = startText === endText;
            return {
                label: isSingleDay ? startText : `${startText} \u2013 ${endText}`,
                isSingleDay
            };
        });
    }, [eventDateWindows, currentLang]);

    const reminderOptions = useMemo(() => {
        const today = new Date();
        const anchor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const offsets = [
            { days: 1, label: t('newsDetails.day1', "1 Day") },
            { days: 7, label: t('newsDetails.week1', "1 Week") },
            { days: 30, label: t('newsDetails.month1', "1 Month") },
        ];

        return offsets.map((option) => {
            const target = new Date(anchor);
            target.setDate(target.getDate() + option.days);
            const allowed = eventDateWindows.some((window) => window.end >= target);
            return { ...option, allowed };
        });
    }, [eventDateWindows]);

    const reminderAvailable = useMemo(
        () => reminderOptions.some((option) => option.allowed),
        [reminderOptions]
    );

    const pickEventDateForOffset = (offsetDays) => {
        if (!eventDateWindows.length) return null;
        const today = new Date();
        const anchor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const target = new Date(anchor);
        target.setDate(target.getDate() + offsetDays);
        let best = null;

        eventDateWindows.forEach((window) => {
            if (window.end < target) return;
            const candidate = window.start > target ? window.start : target;
            if (candidate > window.end) return;
            if (!best || candidate < best) {
                best = candidate;
            }
        });

        return best;
    };

    useEffect(() => {
        const fetchSlideDetails = async () => {
            if (!slideUuid && !routeRef) {
                setItem(fallbackItem || null);
                setLoading(false);
                setError(t('newsDetails.noId'));
                return;
            }

            if (slideUuid) {
                // If we have fallback item from navigation state and it matches the slideUuid,
                // we use it directly to avoid a redundant API call.
                const fallbackId = fallbackItem?.id;
                if (fallbackItem && String(fallbackId) === String(slideUuid)) {
                    setItem(fallbackItem);
                    setLoading(false);
                    return;
                }
            } else if (routeRef) {
                const fallbackRef = getClientRefId(fallbackItem);
                if (fallbackItem && fallbackRef && fallbackRef === routeRef) {
                    setItem(fallbackItem);
                    setLoading(false);
                    return;
                }
            }

            setLoading(true);
            setError("");
            try {
                if (slideUuid) {
                    const response = await fetch(`${serverUrl}/o/externalApis/getSlideDetailsById/${slideUuid}`, {
                        method: "GET",
                    });
                    const data = await response.json();

                    if (response.ok && data?.success && data?.data) {
                        setItem(data.data);
                    } else {
                        setItem(fallbackItem || null);
                        setError(data?.message || t('newsDetails.failedLoad'));
                    }
                } else {
                    const response = await fetch(`${serverUrl}/o/externalApis/getAllPublishedSlides`, {
                        method: "GET",
                    });
                    const data = await response.json();
                    if (!response.ok || !data?.success || !Array.isArray(data?.data)) {
                        setItem(fallbackItem || null);
                        setError(t('newsDetails.failedLoad'));
                        return;
                    }
                    const match = data.data.find((entry) => getClientRefId(entry) === routeRef);
                    if (match) {
                        setItem(match);
                    } else {
                        setItem(fallbackItem || null);
                        setError(t('newsDetails.noMatch'));
                    }
                }
            } catch (e) {
                setItem(fallbackItem || null);
                setError(t('newsDetails.failedLoad'));
            } finally {
                setLoading(false);
            }
        };

        fetchSlideDetails();
    }, [slideUuid, routeRef, fallbackItem]);

    // Ensure the page scrolls to the top whenever the route changes to this component
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, [location.pathname]);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            const liferayUserRaw = sessionStorage.getItem('liferayUser');
            if (!liferayUserRaw || !item) {
                setIsFavorited(false);
                return;
            }

            try {
                const user = JSON.parse(liferayUserRaw);
                const token = sessionStorage.getItem('token');
                const response = await fetch(`${serverUrl}/o/endUserCitizen/getAllFavoriteArticles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        userId: String(user.userId)
                    })
                });
                const data = await response.json();
                if (data?.success) {
                    const favList = data.favorites || data.slides || [];
                    const currentId = String(item.slideId);
                    const favItem = favList.find(fav => String(fav.slideId) === currentId);
                    if (favItem) {
                        setIsFavorited(true);
                        setCurrentFavoriteId(favItem.favoriteId);
                    } else {
                        setIsFavorited(false);
                        setCurrentFavoriteId(null);
                    }
                }
            } catch (err) {
                console.error('Error checking favorite status:', err);
            }
        };

        checkFavoriteStatus();
    }, [item]);

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

                const currentId = String(item.slideId);
                const filtered = data.data
                    .filter((entry) => String(entry.slideId || "") !== currentId)
                    .filter((entry) => String(entry.poolName || "").trim() === String(item.poolName || "").trim())
                    .slice(0, 4);

                setRelatedItems(filtered);
            } catch (e) {
                setRelatedItems([]);
            }
        };

        fetchRelatedSlides();
    }, [item]);

    const showActionMessage = (message, tone = "info") => {
        setActionMessage(message);
        setActionTone(tone);
        if (actionTimerRef.current) {
            window.clearTimeout(actionTimerRef.current);
        }
        actionTimerRef.current = window.setTimeout(() => {
            setActionMessage("");
        }, 3000);
    };

    const handleToggleFavorite = async () => {
        const liferayUserRaw = sessionStorage.getItem('liferayUser');
        if (!liferayUserRaw) {
            showActionMessage(t('favorites.messages.loginRequired'), "info");
            return;
        }

        if (!item) return;

        try {
            const user = JSON.parse(liferayUserRaw);
            const token = sessionStorage.getItem('token');
            const currentId = String(item.slideId);

            if (isFavorited && currentFavoriteId) {
                const response = await fetch(`${serverUrl}/o/endUserCitizen/removeFromFavorite`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        favoriteId: String(currentFavoriteId)
                    })
                });
                const data = await response.json();
                if (data?.success) {
                    setIsFavorited(false);
                    setCurrentFavoriteId(null);
                    showActionMessage(data.message || t('favorites.messages.removedSuccess'), "info");
                } else {
                    throw new Error(data?.message || 'Failed to remove favorite');
                }
            } else {
                const response = await fetch(`${serverUrl}/o/endUserCitizen/addToFavorite`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        userId: String(user.userId),
                        slideId: currentId
                    })
                });
                const data = await response.json();
                if (data?.success) {
                    setIsFavorited(true);
                    // Re-fetch to get the new favoriteId
                    const fetchAllResp = await fetch(`${serverUrl}/o/endUserCitizen/getAllFavoriteArticles`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({
                            userId: String(user.userId)
                        })
                    });
                    const allData = await fetchAllResp.json();
                    if (allData?.success) {
                        const favList = allData.favorites || allData.slides || [];
                        const newFav = favList.find(f => String(f.slideId) === currentId);
                        if (newFav) setCurrentFavoriteId(newFav.favoriteId);
                    }
                    showActionMessage(data.message || t('favorites.messages.addedSuccess'), "success");
                } else {
                    throw new Error(data?.message || 'Failed to add favorite');
                }
            }
        } catch (error) {
            showActionMessage(error.message, "error");
        }
    };

    const handleShare = async () => {
        if (!item) return;
        const shareUrl = window.location.href;
        const shareTitle = item.title || "News Article";
        const shareText = item.subtitle || "Check out this news update.";

        try {
            if (navigator.share) {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
                showActionMessage(t('newsDetails.shareDialogOpened'), "success");
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                showActionMessage(t('newsDetails.linkCopied'), "success");
            } else {
                showActionMessage(t('newsDetails.shareNotSupported'), "error");
            }
        } catch (e) {
            showActionMessage(t('newsDetails.shareError'), "error");
        }
    };

    const openReminderDialog = () => {
        setReminderMessage("");
        setReminderStatus("idle");
        setReminderEmail("");
        setReminderCaptcha("");
        setReminderOffset(1);
        reminderCaptchaRef.current?.reset?.();
        setShowReminderDialog(true);
    };

    const closeReminderDialog = () => {
        setShowReminderDialog(false);
        setReminderMessage("");
        setReminderStatus("idle");
    };

    const handleReminderSubmit = async () => {
        if (reminderStatus === "loading") return;

        const selectedOption = reminderOptions.find((opt) => opt.days === reminderOffset);
        if (!selectedOption || !selectedOption.allowed) {
            setReminderMessage(t('newsDetails.reminderOptionUnavailable'));
            setReminderStatus("failed");
            return;
        }

        const email = reminderEmail.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setReminderMessage(t('newsDetails.invalidEmail'));
            setReminderStatus("failed");
            return;
        }

        if (!reminderCaptcha) {
            setReminderMessage(t('newsDetails.completeCaptcha'));
            setReminderStatus("failed");
            return;
        }

        const eventDate = pickEventDateForOffset(reminderOffset);
        if (!eventDate) {
            setReminderMessage(t('newsDetails.noEventDates'));
            setReminderStatus("failed");
            return;
        }

        setReminderStatus("loading");
        setReminderMessage("");

        try {
            const payload = {
                token: String(reminderCaptcha),
                email,
                slideId: String(item?.slideId),
                reminderOffsetDays: String(reminderOffset),
            };

            const response = await fetch(`${serverUrl}/o/externalApis/saveEventReminder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok || !data?.success) {
                throw new Error(data?.message || t('newsDetails.failedReminder'));
            }

            setReminderStatus("succeeded");
            setReminderMessage(t('newsDetails.successReminder'));
            setReminderCaptcha("");
            setReminderEmail("");
            setReminderOffset(1);
            reminderCaptchaRef.current?.reset?.();
        } catch (e) {
            setReminderStatus("failed");
            setReminderMessage(e.message || t('newsDetails.failedReminder'));
            setReminderCaptcha("");
            reminderCaptchaRef.current?.reset?.();
        }
    };

    if (loading) {
        return (
            <div className="news-wrapper py-5 px-4">
                <div className="container">
                    <h2 className="text-white m-0">{t('header.news', 'News Details')}</h2>
                    <p className="text-info opacity-75">{t('newsDetails.loading')}</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="news-wrapper py-5 px-4">
                <div className="container">
                    <h2 className="text-white m-0">{t('header.news', 'News Details')}</h2>
                    <p className="text-info opacity-75">{error || t('newsDetails.noData')}</p>
                    <Link to="/news" className="read-more">{t('newsDetails.backToNews')}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="news-wrapper py-2 px-2">
            <div className="container news-details-container">
                <div className="news-back-row">
                    <Link to="/news" className="news-back-link">
                        {t('newsDetails.backToNewsArrow')}
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
                                <span className="badge category-badge">{item.poolName || t('newsDetails.updates')}</span>
                                <span className="news-details-meta-item">📅 {formatDate(item.publishDate)}</span>
                            </div>                            <h1 className="news-details-title">{item.title || t('newsDetails.untitled')}</h1>
                            {!!item.subtitle && <p className="news-details-subtitle">{item.subtitle}</p>}

                            {!!tags.length && (
                                <div className="news-details-tags-wrap">
                                    <span className="news-details-tag-icon">🏷</span>
                                    <div className="news-details-tags">
                                        {tags.map((tag) => {
                                            const key = TAG_VALUE_TO_KEY[tag];
                                            const label = key ? (t(`calendar.tag.${key}`) || tag) : tag;
                                            return (
                                                <span key={tag} className="news-details-tag-chip">
                                                    {label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <p className="news-details-description">{item.webDescription || item.subtitle || ""}</p>

                            {formattedEventWindows.length > 0 && (
                                <div className="news-details-event-dates">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="far fa-calendar-check text-info"></i>
                                        <span className="fw-semibold">
                                            {t('newsDetails.eventDates', 'Event Dates')}
                                        </span>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {formattedEventWindows.map((win, idx) => (
                                            <span
                                                key={`${win.label}-${idx}`}
                                                className="badge bg-info bg-opacity-10 border border-info border-opacity-25 text-info px-3 py-2"
                                                style={{ fontSize: '0.9rem' }}
                                            >
                                                {win.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="news-details-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                {!!item.articleUrl && (
                                    <a
                                        className="news-details-visit-btn"
                                        href={item.articleUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ margin: 0 }}
                                    >
                                        {t('newsDetails.visitPage')}
                                    </a>
                                )}
                                {hasCitizenRole && (
                                    <button
                                        type="button"
                                        className={`news-details-visit-btn ${isFavorited ? "is-active" : ""}`}
                                        onClick={handleToggleFavorite}
                                        style={{ margin: 0 }}
                                    >
                                        {isFavorited ? t('newsDetails.favorited') : t('newsDetails.addFavorite')}
                                    </button>
                                )}
                                {item.eventEnabled && (
                                    <button
                                        type="button"
                                        className="news-details-visit-btn"
                                        onClick={openReminderDialog}
                                        style={{ margin: 0 }}
                                    >
                                        {t('newsDetails.setReminder')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="news-details-visit-btn"
                                    onClick={handleShare}
                                    style={{ margin: 0 }}
                                >
                                    {t('newsDetails.shareArticle')}
                                </button>
                            </div>
                            {actionMessage && (
                                <p className={`news-action-message ${actionTone}`}>{actionMessage}</p>
                            )}
                            {error && <p className="text-warning mb-0">{error}</p>}
                        </div>
                    </div>

                    <aside className="news-details-sidebar">
                        <h3>{t('newsDetails.relatedArticles')}</h3>
                        {!relatedItems.length ? (
                            <p className="news-details-empty-related">{t('newsDetails.noRelated')}</p>
                        ) : (
                            <div className="news-details-related-list">
                                {relatedItems.map((related) => (
                                    <Link
                                        key={String(related.id)}
                                        to={`/news/${related.id}`}
                                        state={{ item: related }}
                                        className="news-details-related-item"
                                    >
                                        <strong>{related.title || t('newsDetails.untitled')}</strong>
                                        <small>{formatDate(related.publishDate)}</small>
                                    </Link>
                                ))}
                            </div>
                        )}
                        <Link to="/news" className="news-details-view-all">{t('newsDetails.viewAllNews')}</Link>
                    </aside>
                </div>
            </div>
            {showReminderDialog && (
                <div className="news-reminder-overlay" onClick={closeReminderDialog}>
                    <div className="news-reminder-dialog" onClick={(event) => event.stopPropagation()}>
                        <h3>{t('newsDetails.setReminderTitle')}</h3>
                        <p className="news-reminder-subtitle">
                            {t('newsDetails.reminderSubtitle')}
                        </p>

                        {!reminderAvailable && (
                            <div className="news-reminder-message failed">
                                {t('newsDetails.noUpcomingDates')}
                            </div>
                        )}

                        <div className="news-reminder-options">
                            {reminderOptions.map((option) => (
                                <button
                                    key={option.days}
                                    type="button"
                                    className={`news-reminder-option ${reminderOffset === option.days ? "is-active" : ""
                                        } ${option.allowed ? "" : "is-disabled"}`}
                                    onClick={() => option.allowed && setReminderOffset(option.days)}
                                    disabled={!option.allowed}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="news-reminder-form">
                            <label className="news-reminder-label">{t('newsDetails.emailLabel')}</label>
                            <input
                                type="email"
                                className="news-reminder-input"
                                placeholder={t('newsDetails.emailPlaceholder')}
                                value={reminderEmail}
                                onChange={(event) => setReminderEmail(event.target.value)}
                            />
                        </div>

                        <div className="news-reminder-captcha">
                            <ReCAPTCHA
                                ref={reminderCaptchaRef}
                                sitekey="6Ld7PGosAAAAAKW0wruLeowTCOdG6j8c4qInVmg8"
                                onChange={(value) => setReminderCaptcha(value || "")}
                            />
                        </div>

                        {!!reminderMessage && (
                            <div className={`news-reminder-message ${reminderStatus}`}>
                                {reminderMessage}
                            </div>
                        )}

                        <div className="news-reminder-actions">
                            <button type="button" className="news-action-btn" onClick={closeReminderDialog}>
                                {t('newsDetails.cancel')}
                            </button>
                            <button
                                type="button"
                                className="news-action-btn primary"
                                onClick={handleReminderSubmit}
                                disabled={reminderStatus === "loading" || !reminderAvailable}
                            >
                                {reminderStatus === "loading" ? t('newsDetails.saving') : t('newsDetails.setReminderTitle')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default NewsDetails;
