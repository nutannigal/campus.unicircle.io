import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import moment from "moment";

// Custom hook for events data management
const useEvents = () => {
  const token = localStorage.getItem("Token");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentDate, setCurrentDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  const apiCall = useCallback(async (endpoint, data = null) => {
    try {
      const config = {
        method: "POST",
        url: `${process.env.REACT_APP_API_KEY}${endpoint}`,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
        ...(data && { data })
      };

      const response = await axios(config);
      return {
        success: response.data.error_code === 200,
        data: response.data.data,
        message: response.data.message
      };
    } catch (err) {
      console.error("API Error:", err);
      return { success: false, message: "Network error occurred" };
    }
  }, [token]);

  const fetchEvents = useCallback(async (month, year) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("month", `${month + 1},${year}`);
      
      const result = await apiCall("admin_get_monthwise_event_list", formData);
      
      if (result.success) {
        setEvents(result.data || []);
      } else {
        setEvents([]);
        setError(result.message || "No events found for this month");
      }
    } catch (err) {
      setError("Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const navigateMonth = useCallback((direction) => {
    setCurrentDate(prev => {
      let newMonth = prev.month;
      let newYear = prev.year;

      if (direction === 'next') {
        newMonth++;
        if (newMonth > 11) {
          newMonth = 0;
          newYear++;
        }
      } else {
        newMonth--;
        if (newMonth < 0) {
          newMonth = 11;
          newYear--;
        }
      }

      return { month: newMonth, year: newYear };
    });
  }, []);

  const getMonthName = useCallback((monthIndex) => {
    return new Date(currentDate.year, monthIndex).toLocaleString("default", { month: "long" });
  }, [currentDate.year]);

  return {
    events,
    loading,
    error,
    currentDate,
    navigateMonth,
    getMonthName,
    fetchEvents,
    setCurrentDate
  };
};

// Event Card Component
const EventCard = React.memo(({ event }) => {
  const { images, label, start_date, end_date, start_time, end_time, location } = event;
  
  const eventImage = useMemo(() => {
    return images?.[0]?.image || require("../images/no_image.png");
  }, [images]);

  const formattedDates = useMemo(() => {
    const start = moment(start_date).format("D MMM");
    const end = moment(end_date).format("D MMM");
    return { start, end };
  }, [start_date, end_date]);

  return (
    <div className="col-md-4 mt-1">
      <div 
        className="small-box event-card"
        style={{
          width: "100%",
          paddingLeft: "10px",
          background: "white",
          minHeight: "75px",
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          border: "1px solid #e9ecef",
          transition: "all 0.2s ease",
          cursor: "pointer"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0px 1px 3px rgba(0, 0, 0, 0.1)";
        }}
      >
        <div className="inner" style={{ height: "100%", padding: "0", margin: "0" }}>
          <div className="row g-0">
            <div className="col-4 d-flex align-items-center">
              <img
                src={eventImage}
                alt={label}
                style={{
                  width: "70px",
                  height: "50px",
                  objectFit: "cover",
                  borderRadius: "4px"
                }}
                onError={(e) => {
                  e.target.src = require("../images/no_image.png");
                }}
              />
            </div>

            <div className="col-8">
              <div className="mt-1">
                <h6
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    margin: "0 0 4px 0",
                    color: "#1F3977",
                    lineHeight: "1.2",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                  title={label}
                >
                  {label}
                </h6>
              </div>

              <div style={{ fontSize: "9px", lineHeight: "1.3" }}>
                <div style={{ marginBottom: "2px" }}>
                  <span style={{ fontWeight: "600", color: "#495057" }}>Start: </span>
                  <span style={{ color: "#6c757d" }}>
                    {formattedDates.start} - {start_time}
                  </span>
                </div>
                <div style={{ marginBottom: "2px" }}>
                  <span style={{ fontWeight: "600", color: "#495057" }}>End: </span>
                  <span style={{ color: "#6c757d" }}>
                    {formattedDates.end} - {end_time}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: "600", color: "#495057" }}>Location: </span>
                  <span style={{ color: "#6c757d" }}>{location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Loading Skeleton Component
const EventCardSkeleton = () => (
  <div className="col-md-4 mt-1">
    <div 
      className="small-box"
      style={{
        width: "100%",
        padding: "10px",
        background: "white",
        minHeight: "75px",
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        border: "1px solid #e9ecef"
      }}
    >
      <div className="row g-0">
        <div className="col-4">
          <div 
            style={{
              width: "70px",
              height: "50px",
              background: "#e9ecef",
              borderRadius: "4px",
              animation: "pulse 1.5s ease-in-out infinite"
            }}
          ></div>
        </div>
        <div className="col-8">
          <div 
            style={{
              height: "12px",
              background: "#e9ecef",
              borderRadius: "4px",
              marginBottom: "8px",
              width: "80%",
              animation: "pulse 1.5s ease-in-out infinite"
            }}
          ></div>
          <div 
            style={{
              height: "8px",
              background: "#e9ecef",
              borderRadius: "4px",
              marginBottom: "4px",
              width: "60%",
              animation: "pulse 1.5s ease-in-out infinite"
            }}
          ></div>
          <div 
            style={{
              height: "8px",
              background: "#e9ecef",
              borderRadius: "4px",
              width: "70%",
              animation: "pulse 1.5s ease-in-out infinite"
            }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

// Month Navigation Component
const MonthNavigation = React.memo(({ currentDate, onNavigate, getMonthName, loading }) => {
  const monthName = getMonthName(currentDate.month);

  return (
    <div
      style={{
        background: "rgb(108, 122, 153)",
        color: "#fff",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "8px 8px 0 0"
      }}
    >
      <button
        onClick={() => onNavigate('prev')}
        disabled={loading}
        style={{
          marginRight: "25px",
          border: "none",
          background: "transparent",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          padding: "4px",
          borderRadius: "4px",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <img
          src="dist/img/prev_img.png"
          alt="Previous month"
          style={{ height: "18px", width: "18px", filter: "brightness(0) invert(1)" }}
        />
      </button>

      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          fontSize: "14px",
          fontWeight: "600",
          minWidth: "200px",
          justifyContent: "center"
        }}
      >
        <span>Campus Events in</span>
        <span>{monthName}</span>
        <span>{currentDate.year}</span>
        {loading && (
          <div 
            className="spinner-border spinner-border-sm" 
            style={{ width: "12px", height: "12px" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onNavigate('next')}
        disabled={loading}
        style={{
          marginLeft: "25px",
          border: "none",
          background: "transparent",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          padding: "4px",
          borderRadius: "4px",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <img
          src="dist/img/next_img.png"
          alt="Next month"
          style={{ height: "18px", width: "18px", filter: "brightness(0) invert(1)" }}
        />
      </button>
    </div>
  );
});

// Empty State Component
const EmptyState = ({ message }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "120px",
      padding: "20px",
      color: "#6c757d"
    }}
  >
    <div style={{ fontSize: "48px", color: "#e9ecef", marginBottom: "8px" }}>
      📅
    </div>
    <p style={{ 
      fontSize: "14px", 
      fontWeight: "500", 
      margin: "0",
      textAlign: "center"
    }}>
      {message}
    </p>
    <p style={{ 
      fontSize: "12px", 
      color: "#adb5bd", 
      margin: "4px 0 0 0",
      textAlign: "center"
    }}>
      No events scheduled for this month
    </p>
  </div>
);

// Error State Component
const ErrorState = ({ message, onRetry }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "120px",
      padding: "20px"
    }}
  >
    <div style={{ fontSize: "36px", color: "#dc3545", marginBottom: "8px" }}>
      ⚠️
    </div>
    <p style={{ 
      fontSize: "14px", 
      fontWeight: "500", 
      margin: "0 0 12px 0",
      color: "#dc3545",
      textAlign: "center"
    }}>
      {message}
    </p>
    <button
      onClick={onRetry}
      style={{
        border: "1px solid #dc3545",
        background: "transparent",
        color: "#dc3545",
        padding: "6px 16px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#dc3545";
        e.currentTarget.style.color = "white";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#dc3545";
      }}
    >
      Try Again
    </button>
  </div>
);

export function CampusEvents() {
  const {
    events,
    loading,
    error,
    currentDate,
    navigateMonth,
    getMonthName,
    fetchEvents,
    setCurrentDate
  } = useEvents();

  // Fetch events when month/year changes
  useEffect(() => {
    fetchEvents(currentDate.month, currentDate.year);
  }, [currentDate.month, currentDate.year, fetchEvents]);

  // Handle navigation with loading state
  const handleNavigate = useCallback((direction) => {
    navigateMonth(direction);
  }, [navigateMonth]);

  // Quick navigation to current month
  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    setCurrentDate({
      month: now.getMonth(),
      year: now.getFullYear()
    });
  }, [setCurrentDate]);

  // Memoized events grid
  const eventsGrid = useMemo(() => {
    if (loading) {
      return Array.from({ length: 6 }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ));
    }

    if (error) {
      return (
        <div className="col-12">
          <ErrorState 
            message={error} 
            onRetry={() => fetchEvents(currentDate.month, currentDate.year)} 
          />
        </div>
      );
    }

    if (!events || events.length === 0) {
      return (
        <div className="col-12">
          <EmptyState message="No Events This Month" />
        </div>
      );
    }

    return events.map((event, index) => (
      <EventCard key={`${event.event_id || index}_${event.start_date}`} event={event} />
    ));
  }, [events, loading, error, currentDate, fetchEvents]);

  return (
    <div
      className="col-md-12 p-0"
      style={{
        height: "100%",
        marginTop: "10px",
      }}
    >
      <div
        className="small-box"
        style={{
          padding: "0px",
          minHeight: "190px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          background: "white",
          overflow: "hidden"
        }}
      >
        <div>
          <MonthNavigation
            currentDate={currentDate}
            onNavigate={handleNavigate}
            getMonthName={getMonthName}
            loading={loading}
          />

          <div className="event_inner_div" style={{ padding: "16px" }}>
            <div className="row m-0">
              {eventsGrid}
            </div>
            
            {/* Current Month Quick Action */}
            {!loading && (
              <div className="row m-0 mt-3">
                <div className="col-12 text-center">
                  <button
                    onClick={goToCurrentMonth}
                    style={{
                      border: "1px solid #6C7A99",
                      background: "transparent",
                      color: "#6C7A99",
                      padding: "6px 16px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#6C7A99";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#6C7A99";
                    }}
                  >
                    Back to Current Month
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          
          .event-card:hover {
            transform: translateY(-2px);
            transition: all 0.2s ease;
          }
        `}
      </style>
    </div>
  );
}

// Export with display name for better debugging
CampusEvents.displayName = 'CampusEvents';