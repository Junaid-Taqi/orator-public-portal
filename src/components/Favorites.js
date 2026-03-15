import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { serverUrl } from '../Services/Constants/Constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const Favorites = ({ user }) => {
    const { t } = useTranslation();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const userId = user?.userId;
    const groupId = user?.groups?.[0]?.id;

    const fetchFavorites = async () => {
        if (!userId || !groupId) return;
        setLoading(true);
        setError('');
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${serverUrl}/o/endUserCitizen/getAllFavoriteArticles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    userId: String(userId),
                    groupId: String(groupId)
                })
            });

            const data = await response.json();
            if (data?.success) {
                // Handle inconsistency: Java backend returns 'slides' when empty and 'favorites' when not empty
                setFavorites(data.favorites || data.slides || []);
            } else {
                throw new Error(data?.message || t('favorites.messages.failedLoad'));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleRemove = async (favoriteId) => {
        if (!window.confirm(t('favorites.messages.confirmRemove', 'Are you sure you want to remove this from favorites?'))) return;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${serverUrl}/o/endUserCitizen/removeFromFavorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    favoriteId: String(favoriteId)
                })
            });
            const data = await response.json();
            if (data?.success) {
                fetchFavorites();
            } else {
                throw new Error(data?.message || 'Failed to remove favorite');
            }
        } catch (err) {
            console.error('Error removing favorite:', err);
            alert(err.message || 'An error occurred while removing favorite.');
        }
    };

    return (
        <div className="report-dashboard py-5">
            <div className="container">
                <header className="mb-4">
                    <h2 className="text-white">{t('favorites.title')}</h2>
                    <p className="text-info opacity-75">{t('favorites.subtitle')}</p>
                </header>

                <div className="glass-card p-4">
                    {loading && <div className="text-white-50">{t('favorites.messages.loading')}</div>}
                    {error && <div className="text-danger">{error}</div>}
                    {!loading && !error && favorites.length === 0 && (
                        <div className="text-white-50">{t('favorites.messages.noFavorites')}</div>
                    )}

                    {!loading && !error && favorites.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th className="px-3 py-3 border-0">{t('favorites.table.title')}</th>
                                        <th className="px-3 py-3 border-0" style={{ width: '200px' }}>{t('favorites.table.date')}</th>
                                        <th className="px-3 py-3 border-0 text-end" style={{ width: '150px' }}>{t('favorites.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {favorites.map((fav) => (
                                        <tr key={fav.slideId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td className="px-3 py-3 border-0">
                                                <div className="text-white fw-bold">{fav.title || 'Untitled'}</div>
                                            </td>
                                            <td className="px-3 py-3 border-0 text-white-50">
                                                {fav.publishDate ? new Date(fav.publishDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-3 py-3 border-0 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Link 
                                                        to={`/news/${fav.slideId}`} 
                                                        className="btn btn-sm btn-info rounded-pill px-3"
                                                        title={t('favorites.actions.view')}
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleRemove(fav.favoriteId)}
                                                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                        title={t('favorites.actions.remove')}
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Favorites;
