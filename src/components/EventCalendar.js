import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n';
import { serverUrl } from '../Services/Constants/Constants';

const EventCalendar = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'en-GB';
  const [view, setView] = useState('Month');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [summaryMonths, setSummaryMonths] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('All');
  const [loading, setLoading] = useState(false);

  const containerStyle = {
    background: 'linear-gradient(135deg, #112235 0%, #0f2d3e 40%, #155e75 100%)',
    minHeight: '100vh',
    color: 'white',
    padding: '2rem'
  };

  const glassPanel = 'bg-opacity-5 border border-white border-opacity-10 rounded-4 shadow-sm p-3 mb-3';
  const activeBtn = 'btn btn-info text-dark rounded-pill px-3 shadow-sm';
  const inactiveBtn = 'btn text-white-50 rounded-pill px-3 border-0 hover-light';

  const formatIso = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };


  const startOfWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };

  const endOfWeek = (date) => {
    const d = startOfWeek(date);
    d.setDate(d.getDate() + 6);
    return d;
  };

  const getRangeByView = (date, mode) => {
    const d = new Date(date);
    if (mode === 'Day') {
      return { from: new Date(d.getFullYear(), d.getMonth(), d.getDate()), to: new Date(d.getFullYear(), d.getMonth(), d.getDate()) };
    }
    if (mode === 'Week') {
      return { from: startOfWeek(d), to: endOfWeek(d) };
    }
    if (mode === 'Year') {
      return { from: new Date(d.getFullYear(), 0, 1), to: new Date(d.getFullYear(), 11, 31) };
    }
    return { from: new Date(d.getFullYear(), d.getMonth(), 1), to: new Date(d.getFullYear(), d.getMonth() + 1, 0) };
  };

  const range = useMemo(() => getRangeByView(anchorDate, view), [anchorDate, view]);

  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await fetch(`${serverUrl}/o/endUserRegistrationApplication/getMunicipalities`, {
          method: 'GET'
        });
        const data = await response.json();
        if (response.ok && data?.success && Array.isArray(data?.data)) {
          setMunicipalities(data.data);
        } else {
          setMunicipalities([]);
        }
      } catch (e) {
        setMunicipalities([]);
      }
    };

    fetchMunicipalities();
  }, []);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const params = {
          fromDate: formatIso(range.from),
          toDate: formatIso(range.to)
        };
        if (selectedMunicipalityId !== 'All') {
          params.groupId = String(selectedMunicipalityId);
        }
        const qs = new URLSearchParams(params);

        const response = await fetch(`${serverUrl}/o/externalApis/getEventCalendar?${qs.toString()}`);
        const data = await response.json();

        if (response.ok && data?.success) {
          setEvents(Array.isArray(data?.data) ? data.data : []);
          setSummaryMonths(Array.isArray(data?.summary?.months) ? data.summary.months : []);
        } else {
          setEvents([]);
          setSummaryMonths([]);
        }
      } catch (e) {
        setEvents([]);
        setSummaryMonths([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [range.from, range.to, selectedMunicipalityId]);

  useEffect(() => {
    if (
      selectedMunicipalityId !== 'All' &&
      !municipalities.some((m) => String(m.groupId) === String(selectedMunicipalityId))
    ) {
      setSelectedMunicipalityId('All');
    }
  }, [municipalities, selectedMunicipalityId]);

  const filteredEvents = useMemo(() => events, [events]);

  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach((e) => {
      const key = String(e.eventDate || '');
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [filteredEvents]);

  const shiftRange = (step) => {
    const d = new Date(anchorDate);
    if (view === 'Day') d.setDate(d.getDate() + step);
    else if (view === 'Week') d.setDate(d.getDate() + (7 * step));
    else if (view === 'Year') d.setFullYear(d.getFullYear() + step);
    else d.setMonth(d.getMonth() + step);
    setAnchorDate(d);
  };

  const resetToday = () => setAnchorDate(new Date());

  const getHeaderLabel = () => {
    if (view === 'Year') return `${range.from.getFullYear()}`;
    if (view === 'Week') {
      const a = range.from.toLocaleDateString(currentLang, { month: 'short', day: '2-digit' });
      const b = range.to.toLocaleDateString(currentLang, { month: 'short', day: '2-digit', year: 'numeric' });
      return `${a} - ${b}`;
    }
    if (view === 'Day') {
      return range.from.toLocaleDateString(currentLang, { day: '2-digit', month: 'long', year: 'numeric' });
    }
    return range.from.toLocaleDateString(currentLang, { month: 'long', year: 'numeric' });
  };

  const CalendarViewButton = ({ v }) => (
    <button onClick={() => setView(v)} className={view === v ? activeBtn : inactiveBtn}>{t(`calendar.${v}`) || v}</button>
  );

  const DayView = () => {
    const key = formatIso(range.from);
    const dayEvents = eventsByDate[key] || [];

    return (
      <div className={`${glassPanel} p-4 mt-3`}>
        <h3 className="mb-4">{range.from.toLocaleDateString(currentLang, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</h3>
        {dayEvents.length === 0 && <div className="text-white-50">{t('calendar.noEvents')}</div>}
        {dayEvents.map((e) => (
          <div key={e.eventId} className="p-4 rounded-4 bg-opacity-5 border border-white border-opacity-10 d-flex gap-4 mb-3">
            <div>
              <h4 className="mb-1">{e.title || t('calendar.untitled')}</h4>
              <p className="text-info opacity-75 mb-2">{e.subtitle || ''}</p>
              <div className="small mb-2">
                {e.location && <div className="opacity-75">{e.location}</div>}
              </div>
              <div className="d-flex gap-2">
                <span className="badge rounded-pill bg-info bg-opacity-20 border border-info border-opacity-25 px-3">
                  {e.poolName || t('calendar.events')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const WeekView = () => {
    const start = startOfWeek(anchorDate);
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });

    return (
      <div className={`${glassPanel} p-0 overflow-hidden`}>
        <div className="row g-0 text-center">
          {days.map((d) => {
            const key = formatIso(d);
            const dayEvents = eventsByDate[key] || [];
            const isActive = formatIso(d) === formatIso(new Date(anchorDate));

            return (
              <div key={key} className="col border-end border-white border-opacity-10 p-3" style={{ minHeight: '320px', backgroundColor: isActive ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                <div className={isActive ? 'text-info' : 'text-white'}>{d.toLocaleDateString(currentLang, { weekday: 'short' })}</div>
                <div className={`fs-3 mb-3 ${isActive ? 'text-info' : 'text-white'}`}>{d.getDate()}</div>
                {dayEvents.slice(0, 3).map((e) => (
                  <div key={e.eventId} className="p-2 rounded-3 text-start bg-info bg-opacity-10 border border-info border-opacity-20 mb-2">
                    <div className="small my-1">{e.title || t('calendar.untitled')}</div>
                    <div className="text-white-50" style={{ fontSize: '0.65rem' }}>{e.subtitle || ''}</div>
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="text-white-50 small">+{dayEvents.length - 3} {t('calendar.more')}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MonthView = () => {
    const year = range.from.getFullYear();
    const month = range.from.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = first.getDay();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));

    return (
      <div className={`${glassPanel} p-0 overflow-hidden`}>
        <div className="row g-0 text-center bg-opacity-5 py-2 border-bottom border-white border-opacity-10">
          {[t('calendar.sun'), t('calendar.mon'), t('calendar.tue'), t('calendar.wed'), t('calendar.thu'), t('calendar.fri'), t('calendar.sat')].map((d) => <div key={d} className="col text-white-50">{d}</div>)}
        </div>
        <div className="row g-0">
          {cells.map((d, i) => {
            const key = d ? formatIso(d) : `empty-${i}`;
            const dayEvents = d ? (eventsByDate[key] || []) : [];
            return (
              <div key={key} className="col border-end border-bottom border-white border-opacity-10 p-2" style={{ flex: '0 0 14.28%', minHeight: '100px' }}>
                {d && <span className="small text-white-50">{d.getDate()}</span>}
                {dayEvents.slice(0, 2).map((e) => (
                  <div key={e.eventId} className="mt-1 p-1 rounded bg-info bg-opacity-10 text-info" style={{ fontSize: '0.65rem' }}>
                    {e.title || t('calendar.untitled')}
                  </div>
                ))}
                {dayEvents.length > 2 && <div className="small text-white-50 mt-1">+{dayEvents.length - 2}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const YearView = () => {
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    const monthMap = {};
    summaryMonths.forEach((m) => {
      monthMap[String(m.month || '').toUpperCase()] = Number(m.count || 0);
    });

    return (
      <div className="row g-3">
        {months.map((m) => (
          <div key={m} className="col-12 col-md-6 col-lg-3">
            <div className={`${glassPanel} h-100 p-4 d-flex flex-column justify-content-between`} style={{ minHeight: '150px' }}>
              <div>
                <h5 className="mb-3">{t(`calendar.${m.substring(0, 3).toLowerCase()}`)}</h5>
                <h2 className={`mb-1 ${monthMap[m] > 0 ? 'text-info' : 'text-white'}`}>{monthMap[m] || 0}</h2>
              </div>
              <div className="text-white-50 small">{t('calendar.events')}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div className={glassPanel}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="btn-group bg-dark bg-opacity-25 p-1 rounded-pill">
            {['Day', 'Week', 'Month', 'Year'].map((v) => (
              <CalendarViewButton key={v} v={v} />
            ))}
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="btn-group bg-dark bg-opacity-25 p-1 rounded-pill">
              <button className="btn btn-sm text-white-50 border-0" onClick={() => shiftRange(-1)}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="btn btn-sm text-white px-3 border-0 bg-opacity-10 rounded-pill mx-1" onClick={resetToday}>
                {t('calendar.today')}
              </button>
              <button className="btn btn-sm text-white-50 border-0" onClick={() => shiftRange(1)}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            <span className="ms-2 text-white">{getHeaderLabel()}</span>
          </div>
        </div>
      </div>

      <div className={glassPanel}>
        <div className="d-flex gap-2 flex-wrap">
          {[{ groupId: 'All', name: t('calendar.allMunicipalities') }, ...municipalities].map((m, i) => {
            const selected = String(selectedMunicipalityId) === String(m.groupId);
            return (
              <button
                key={`${m.groupId}-${i}`}
                onClick={() => setSelectedMunicipalityId(m.groupId)}
                className={selected ? activeBtn : 'btn btn-sm bg-opacity-10 text-white-50 rounded-pill border-0 px-3'}
              >
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <div className="text-white-50 mb-3">{t('calendar.loading')}</div>}

      {!loading && view === 'Day' && <DayView />}
      {!loading && view === 'Week' && <WeekView />}
      {!loading && view === 'Month' && <MonthView />}
      {!loading && view === 'Year' && <YearView />}
    </div>
  );
};

export default EventCalendar;

