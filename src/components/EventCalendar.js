import React, { useState } from 'react';

const EventCalendar = () => {
  const [view, setView] = useState('Month'); 

  const containerStyle = {
    background: 'linear-gradient(135deg, #112235 0%, #0f2d3e 40%, #155e75 100%)',
    minHeight: '100vh',
    color: 'white',
    padding: '2rem'
  };

  const glassPanel = "bg-opacity-5 border border-white border-opacity-10 rounded-4 shadow-sm p-3 mb-3";
  const activeBtn = "btn btn-info text-dark  rounded-pill px-3 shadow-sm";
  const inactiveBtn = "btn text-white-50 rounded-pill px-3 border-0 hover-light";

  // --- NEW YEAR VIEW COMPONENT ---
  const YearView = () => {
    const months = [
      { name: 'January', count: 0 }, { name: 'February', count: 2 },
      { name: 'March', count: 6 }, { name: 'April', count: 0 },
      { name: 'May', count: 0 }, { name: 'June', count: 0 },
      { name: 'July', count: 0 }, { name: 'August', count: 0 },
      { name: 'September', count: 0 }, { name: 'October', count: 0 },
      { name: 'November', count: 0 }, { name: 'December', count: 0 }
    ];

    return (
      <div className="row g-3">
        {months.map((m, i) => (
          <div key={i} className="col-12 col-md-6 col-lg-3">
            <div className={`${glassPanel} h-100 p-4 d-flex flex-column justify-content-between`} style={{minHeight: '150px'}}>
              <div>
                <h5 className=" mb-3">{m.name}</h5>
                <h2 className={` mb-1 ${m.count > 0 ? 'text-info' : 'text-white'}`}>
                  {m.count}
                </h2>
              </div>
              <div className="text-white-50 small">Events</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DayView = () => (
    <div className={`${glassPanel} p-4 mt-3`}>
      <h3 className=" mb-4">Tuesday, February 24, 2026</h3>
      <div className="p-4 rounded-4 bg-opacity-5 border border-white border-opacity-10 d-flex gap-4">
        <div className="bg-secondary bg-opacity-20 rounded-3 d-flex align-items-center justify-content-center" style={{width: '120px', height: '120px'}}>
           <span className="text-white-50 small text-center px-2">City Council Meeting Image</span>
        </div>
        <div>
          <h4 className=" mb-1">City Council Meeting</h4>
          <p className="text-info opacity-75 mb-3">Monthly public meeting</p>
          <div className="small mb-3">
            <div className="mb-1 opacity-75">🕒 18:00</div>
            <div className="opacity-75">📍 City Hall, Room 201</div>
          </div>
          <div className="d-flex gap-2">
            <span className="badge rounded-pill bg-info bg-opacity-20 border border-info border-opacity-25 px-3">Government</span>
            <span className="badge rounded-pill bg-info bg-opacity-20 border border-info border-opacity-25 px-3">Public Meeting</span>
          </div>
          <button className="btn btn-link text-info p-0 mt-3 text-decoration-none ">View Details →</button>
        </div>
      </div>
    </div>
  );

  const WeekView = () => {
    const weekDays = [
      { day: 'Sun', date: '22' }, { day: 'Mon', date: '23' }, 
      { day: 'Tue', date: '24', active: true, event: { time: '18:00', title: 'City Council Meeting', loc: 'City Hall, Room 201' }},
      { day: 'Wed', date: '25' }, { day: 'Thu', date: '26' }, 
      { day: 'Fri', date: '27' }, 
      { day: 'Sat', date: '28', event: { time: '09:00', title: 'Community Cleanup Day', loc: 'Central Park' }}
    ];

    return (
      <div className={`${glassPanel} p-0 overflow-hidden`}>
        <div className="row g-0 text-center">
          {weekDays.map((d, i) => (
            <div key={i} className={`col border-end border-white border-opacity-10 p-3`} style={{ minHeight: '400px', backgroundColor: d.active ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
              <div className={` ${d.active ? 'text-info' : 'text-white'}`}>{d.day}</div>
              <div className={`fs-3  mb-4 ${d.active ? 'text-info' : 'text-white'}`}>{d.date}</div>
              {d.event && (
                <div className="p-2 rounded-3 text-start bg-info bg-opacity-10 border border-info border-opacity-20">
                  <div className="text-info " style={{fontSize: '0.7rem'}}>{d.event.time}</div>
                  <div className=" small my-1">{d.event.title}</div>
                  <div className="text-white-50" style={{fontSize: '0.65rem'}}>{d.event.loc}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MonthView = () => (
    <div className={`${glassPanel} p-0 overflow-hidden`}>
      <div className="row g-0 text-center bg-opacity-5 py-2 border-bottom border-white border-opacity-10">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="col  text-white-50">{d}</div>)}
      </div>
      <div className="row g-0">
        {Array.from({length: 28}).map((_, i) => (
          <div key={i} className="col border-end border-bottom border-white border-opacity-10 p-2" style={{flex: '0 0 14.28%', minHeight: '100px'}}>
            <span className={`small ${i+1 === 24 ? 'text-info ' : 'text-white-50'}`}>{i + 1}</span>
            {i + 1 === 25 && <div className="mt-1 p-1 rounded bg-info bg-opacity-10 text-info" style={{fontSize: '0.6rem'}}>City Council Meeting</div>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div className={glassPanel}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="btn-group bg-dark bg-opacity-25 p-1 rounded-pill">
            {['Day', 'Week', 'Month', 'Year'].map(v => (
              <button key={v} onClick={() => setView(v)} className={view === v ? activeBtn : inactiveBtn}>{v}</button>
            ))}
          </div>
          <div className="d-flex align-items-center gap-2">
             <div className="btn-group bg-dark bg-opacity-25 p-1 rounded-pill">
                <button className="btn btn-sm text-white-50 border-0">&lt;</button>
                <button className="btn btn-sm text-white px-3 border-0 bg-opacity-10 rounded-pill mx-1">Today</button>
                <button className="btn btn-sm text-white-50 border-0">&gt;</button>
             </div>
             <span className="ms-2 text-white">
               {view === 'Year' ? '2026' : view === 'Week' ? 'Feb 22 - Feb 28, 2026' : view === 'Day' ? 'February 24, 2026' : 'February 2026'}
             </span>
          </div>
        </div>
      </div>

      <div className={glassPanel}>
        <div className="d-flex gap-2 flex-wrap">
          {['All Municipalities', 'Downtown District', 'Central Park District', 'North Valley', 'East Harbor', 'West Springs', 'South Ridge'].map((m, i) => (
            <button key={m} className={i === 0 ? activeBtn : "btn btn-sm bg-opacity-10 text-white-50 rounded-pill border-0 px-3"}>{m}</button>
          ))}
        </div>
      </div>

      {view === 'Day' && <DayView />}
      {view === 'Week' && <WeekView />}
      {view === 'Month' && <MonthView />}
      {view === 'Year' && <YearView />}
    </div>
  );
};

export default EventCalendar;