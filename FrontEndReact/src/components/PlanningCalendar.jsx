import React, { useState, useEffect } from 'react';
import './PlanningCalendar.css';

const PlanningCalendar = ({ plannings = [], onDateClick, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendar();
  }, [currentDate, plannings]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayPlannings = plannings.filter(planning => {
        const planningStart = new Date(planning.dateDebut);
        const planningEnd = new Date(planning.dateFin);
        return current >= planningStart && current <= planningEnd;
      });
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: isToday(current),
        plannings: dayPlannings
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day) => {
    if (onDateClick) {
      onDateClick(day.date);
    }
  };

  const handlePlanningClick = (e, planning) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(planning);
    }
  };

  const getEventColor = (planning) => {
    switch (planning.statut) {
      case 'actif':
        return '#28a745';
      case 'brouillon':
        return '#ffc107';
      case 'termine':
        return '#6c757d';
      default:
        return '#007bff';
    }
  };

  return (
    <div className="planning-calendar">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button className="btn btn-outline" onClick={goToPreviousMonth}>
            ←
          </button>
          <h2 className="calendar-title">
            {formatMonth(currentDate)}
          </h2>
          <button className="btn btn-outline" onClick={goToNextMonth}>
            →
          </button>
        </div>
        <button className="btn btn-primary" onClick={goToToday}>
          Aujourd'hui
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${
              day.isToday ? 'today' : ''
            } ${day.plannings.length > 0 ? 'has-events' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            <div className="day-number">
              {day.date.getDate()}
            </div>
            
            {day.plannings.length > 0 && (
              <div className="day-events">
                {day.plannings.slice(0, 3).map((planning, i) => (
                  <div
                    key={planning._id || i}
                    className="calendar-event"
                    style={{ backgroundColor: getEventColor(planning) }}
                    onClick={(e) => handlePlanningClick(e, planning)}
                    title={planning.nom}
                  >
                    <span className="event-title">
                      {planning.nom.length > 15 
                        ? `${planning.nom.substring(0, 15)}...` 
                        : planning.nom
                      }
                    </span>
                  </div>
                ))}
                {day.plannings.length > 3 && (
                  <div className="more-events">
                    +{day.plannings.length - 3} autre(s)
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
          <span>Actif</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
          <span>Brouillon</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#6c757d' }}></div>
          <span>Terminé</span>
        </div>
      </div>
    </div>
  );
};

export default PlanningCalendar;
