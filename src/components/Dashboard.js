import React, { useState, useEffect, useMemo, useCallback } from "react";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import toast, { Toaster } from "react-hot-toast";

// Custom hook for API calls
const useApi = () => {
  const token = localStorage.getItem('Token');
  
  const apiCall = useCallback(async (endpoint, method = 'GET', data = null) => {
    try {
      const config = {
        method,
        url: `${process.env.REACT_APP_API_KEY}${endpoint}`,
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": token,
        },
        ...(data && { data: data })
      };
      
      const response = await axios(config);
      return { 
        success: response.data.error_code === 200, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { 
        success: false, 
        message: 'Network error occurred',
        data: null 
      };
    }
  }, [token]);

  return apiCall;
};

// Custom hook for dashboard data
const useDashboardData = () => {
  const apiCall = useApi();
  const [dashboardData, setDashboardData] = useState({
    counts: {},
    university: [],
    flagged: [],
    analytics: {},
    bounceRate: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoints = [
        { key: 'counts', url: 'admin_get_count' },
        { key: 'university', url: 'admin_get_Primary_campus_info' }, 
        { key: 'flagged', url: 'admin_get_reported_post_details_2_limit' },
        { key: 'analytics', url: 'admin_get_homepage_cnts' },
        { key: 'bounceRate', url: 'admin_calculate_student_metrics' }
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint => apiCall(endpoint.url))
      );

      const newData = {
        counts: {},
        university: [],
        flagged: [],
        analytics: {},
        bounceRate: {}
      };

      results.forEach((result, index) => {
        const endpoint = endpoints[index];
        if (result.status === 'fulfilled' && result.value.success) {
          if (endpoint.key === 'counts') {
            newData.counts = result.value.data?.[0] || {};
          } else {
            newData[endpoint.key] = result.value.data || [];
          }
        } else {
          console.warn(`Failed to load ${endpoint.key}:`, result.reason || result.value?.message);
        }
      });

      setDashboardData(newData);

      // Check if all essential APIs failed
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      if (successCount === 0) {
        setError('Failed to load dashboard data');
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { dashboardData, loading, error, refetch: fetchAllData };
};

// Memoized components
const UniversityHeader = React.memo(({ university }) => {
  if (!university || university.length === 0) {
    return (
      <div className="d-flex flex-row" style={{ paddingLeft: "10px", alignItems: 'center' }}>
        <div>
          <img 
            src={require('./images/no_image.png')} 
            alt="Campus" 
            style={{ width: "40px", height: "40px", borderRadius: "3px" }} 
          />
        </div>
        <div style={{
          marginLeft: "20px",
          fontFamily: "poppins",
          fontStyle: "normal",
          fontWeight: "600",
          height: "31px",
          fontSize: "12px",
          lineHeight: "30px",
          color: "white"
        }}>
          University Campus
        </div>
      </div>
    );
  }

  const campus = university[0];
  return (
    <Link to="/feedHomePage" style={{ width: "100%" }}>
      <div className="d-flex flex-row" style={{ paddingLeft: "10px", alignItems: 'center' }}>
        <div>
          <img 
            src={campus.profile || require('./images/no_image.png')} 
            alt="Campus" 
            style={{ width: "40px", height: "40px", borderRadius: "3px" }} 
          />
        </div>
        <div style={{
          marginLeft: "20px",
          fontFamily: "poppins",
          fontStyle: "normal",
          fontWeight: "600",
          height: "31px",
          fontSize: "12px",
          lineHeight: "30px",
          color: "white"
        }}>
          {campus.campus_name}
        </div>
      </div>
    </Link>
  );
});

const StatCard = React.memo(({ title, value, icon, bgColor, link, isCenter = false, color = "#848484" }) => {
  const content = (
    <div className="small-box" style={{ 
      height: "80px", 
      boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.2)", 
      borderRadius: "3px",
      background: "white"
    }}>
      <div className={`inner flagged_inner ${isCenter ? 'text-center' : 'd-flex justify-content-between'}`}>
        <div>
          <div style={{ 
            fontWeight: "500", 
            color, 
            fontSize: isCenter ? "9px" : "11px", 
            fontFamily: "Poppins" 
          }}>
            {title}
          </div>
          <h5 style={{ 
            fontWeight: "600", 
            fontSize: "20px", 
            color: "black", 
            paddingTop: "10px", 
            fontFamily: "Poppins",
            margin: 0 
          }}>
            {value || 0}
          </h5>
        </div>
        {!isCenter && icon && (
          <div className="d-flex">
            <img src={icon} alt={title} className="ml-auto all_icon_imgs" />
          </div>
        )}
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
});

const AnalyticsCard = React.memo(({ title, value, change, changeType, icon, iconBg }) => (
  <div className="small-box box_border_class" style={{ 
    height: "85px", 
    marginTop: "10px",
    background: "white"
  }}>
    <div className="inner flagged_inner">
      <div className="d-flex" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="eleven_font_class" style={{ color: "#1F3977" }}>
            {title}
          </div>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <h5 className="twenty_font_class" style={{ color: "black", margin: 0 }}>
              {value || 0}
            </h5>
            {change && (
              <span className="ten_font_class" style={{ 
                color: changeType === 'positive' ? "#4AA081" : "#EB3F3F"
              }}>
                ({change})
              </span>
            )}
          </div>
        </div>
        <div className="d-flex p-0" style={{ 
          justifyContent: "center", 
          alignItems: "center", 
          background: iconBg, 
          width: "40px", 
          height: "40px",
          borderRadius: "3px" 
        }}>
          <img src={icon} className="all_icon_imgs" alt={title} />
        </div>
      </div>
      <div style={{ marginTop: "5px" }}>
        <span className="nine_font_class" style={{ color: "#293043" }}>
          Analytics for last week
        </span>
      </div>
    </div>
  </div>
));

const ActionModal = React.memo(({ row, onClose, onHidePost, onSilenceUser }) => {
  if (!row) return null;

  return (
    <div className="edit_campus_modal" style={{
      position: "absolute",
      top: "30px",
      right: "15px",
      width: "335px",
      background: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      borderRadius: "5px",
      zIndex: 1000,
      border: "1px solid #ddd"
    }}>
      <div className="p-3">
        <div className="d-flex justify-content-end mb-2">
          <img
            src="dist/img/Cancel.png"
            onClick={onClose}
            alt="Close"
            style={{ cursor: 'pointer', width: "16px", height: "16px" }}
          />
        </div>
        
        <div 
          className="hover_class p-2 cursor-pointer" 
          onClick={onHidePost}
          style={{ cursor: 'pointer', borderRadius: "3px" }}
        >
          <div className="d-flex flex-row align-items-center">
            <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
              <img 
                src="dist/img/PostHide.png" 
                alt="Hide Post" 
                style={{ width: "20px", height: "20px" }}
              />
            </div>
            <div className="flag_inner_div">
              <div style={{ fontSize: "10px", fontWeight: "600" }}>
                {row.feed_status === 0 ? "Keep Post" : "Hide Post"}
              </div>
              <div style={{ fontSize: "9px", fontWeight: "500", color: "#666" }}>
                {row.feed_status === 0 
                  ? "Disagree with flag and keep the post unchanged"
                  : "Hide this post and send a warning message"
                }
              </div>
            </div>
          </div>
        </div>

        <div 
          className="hover_class p-2 cursor-pointer" 
          onClick={onSilenceUser}
          style={{ cursor: 'pointer', borderRadius: "3px" }}
        >
          <div className="d-flex flex-row align-items-center">
            <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
              <img 
                src="dist/img/PostSilence.png" 
                alt="Silence User" 
                style={{ width: "20px", height: "20px" }}
              />
            </div>
            <div className="flag_inner_div">
              <div style={{ fontSize: "10px", fontWeight: "600" }}>
                {row.acc_freeze === 0 ? "Silence User" : "Unfreeze User"}
              </div>
              <div style={{ fontSize: "9px", fontWeight: "500", color: "#666" }}>
                {row.acc_freeze === 0
                  ? "A silenced user has all posting disabled"
                  : "Unfreezed user has all posting enables"
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Loading component
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
    <div className="text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <div className="mt-2">Loading dashboard...</div>
    </div>
  </div>
);

// Error component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
    <div className="text-center">
      <div style={{ color: "#dc3545", marginBottom: "10px" }}>
        {message}
      </div>
      <button 
        className="btn btn-primary btn-sm"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  </div>
);

export function Dashboard() {
  const navigate = useNavigate();
  const apiCall = useApi();
  const { dashboardData, loading, error, refetch } = useDashboardData();
  const [openModalId, setOpenModalId] = useState(null);

  // Memoized table styles
  const customStyles = useMemo(() => ({
    rows: {
      style: {
        background: "rgba(228, 233, 243, 0.6)",
        marginTop: "6px",
        border: "none",
        height: "30px",
        fontSize: "10px",
        fontWeight: "500"
      },
    },
    headCells: {
      style: {
        color: "#1F3977",
        fontWeight: "600",
        fontSize: "10px"
      },
    },
    head: {
      style: {
        fontWeight: "400",
        fontSize: "9px",
        boxShadow: "0 0 1px rgba(0,0,0,.125), 0 1px 3px rgba(0,0,0,.2)",
      },
    },
    table: {
      style: {
        marginTop: "0px",
        height: "auto"
      },
    },
  }), []);

  // Memoized table columns
  const columns = useMemo(() => [
    {
      name: "Reported by",
      selector: (row) => (
        <>
          <div style={{ fontWeight: "600" }}>{row.reported_by_full_name}</div>
          <div className="nine_font_class" style={{ color: "#666" }}>{row.reported_at}</div>
        </>
      ),
      sortable: true,
      width: "25%",
    },
    {
      name: "Category",
      selector: (row) => <div style={{ fontWeight: "500" }}>{row.category}</div>,
      width: "10%",
      sortable: true,
    },
    {
      name: "Post",
      width: "35%",
      selector: (row) => (
        <div style={{ width: "315px", lineHeight: "1.2" }}>{row.f_description}</div>
      ),
      sortable: true,
    },
    {
      name: "Media",
      width: "10%",
      selector: (row) => {
        const firstImage = row.feed_images?.[0]?.feed_img;
        return (
          <div>
            <img
              style={{ height: "30px", width: "60px", margin: "2px", objectFit: "contain" }}
              src={firstImage || "dist/img/event_photo.png"}
              alt="Post"
            />
          </div>
        );
      },
      sortable: false,
    },
    {
      name: "Posted by",
      selector: (row) => <div style={{ fontWeight: "500" }}>{row.posted_by_full_name}</div>,
      sortable: true,
      width: "10%",
    },
    {
      name: "Status",
      width: "10%",
      selector: (row) => (
        <div style={{ 
          color: row.feed_status === 0 ? "#EB3F3F" : "#4AA081",
          fontWeight: "500"
        }}>
          {row.feed_status === 0 ? "Hidden" : "Keep Post"}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      width: "auto",
      cell: (row) => {
        const isOpen = openModalId === row.report_id;
        return (
          <div className="d-flex" style={{ width: "100%", position: "relative" }}>
            <button
              className="all_action_buttons"
              onClick={(e) => {
                e.stopPropagation();
                setOpenModalId(isOpen ? null : row.report_id);
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#1F3977",
                fontSize: "10px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "3px"
              }}
            >
              Actions
            </button>
            {isOpen && (
              <ActionModal
                row={row}
                onClose={() => setOpenModalId(null)}
                onHidePost={async () => {
                  await handleHidePost(row.f_id);
                  setOpenModalId(null);
                }}
                onSilenceUser={async () => {
                  await handleSilenceUser(row.posted_by_id);
                  setOpenModalId(null);
                }}
              />
            )}
          </div>
        );
      },
    },
  ], [openModalId]);

  // API handlers
  const handleHidePost = useCallback(async (f_id) => {
    const formData = new FormData();
    formData.append("f_id", f_id);
    
    const result = await apiCall("admin_flagged_content_hide_post", "POST", formData);
    if (result.success) {
      toast.success(result.message || "Post status updated successfully");
      refetch();
    } else {
      toast.error(result.message || "Failed to update post status");
    }
  }, [apiCall, refetch]);

  const handleSilenceUser = useCallback(async (stud_id) => {
    const formData = new FormData();
    formData.append("stud_id", stud_id);
    
    const result = await apiCall("admin_change_student_freez_acc_status", "POST", formData);
    if (result.success) {
      toast.success(result.message || "User status updated successfully");
      refetch();
    } else {
      toast.error(result.message || "Failed to update user status");
    }
  }, [apiCall, refetch]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.edit_campus_modal') && 
          !event.target.closest('.all_action_buttons')) {
        setOpenModalId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { counts, university, flagged, analytics, bounceRate } = dashboardData;

  // Render loading state
  if (loading) {
    return (
      <div className="content-wrapper" style={{ padding: "10px 0px" }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="content-wrapper" style={{ padding: "10px 0px" }}>
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="content-wrapper" style={{ padding: "10px 0px" }}>
      <Toaster position="top-right" reverseOrder={false} />

      <section className="mt-0">
        <div className="p-0 container-fluid table-cards">
          {/* University Header */}
          <div style={{ marginBottom: "15px" }}>
            <div className="row">
              <div className="col-md-12">
                <div style={{
                  display: "flex", 
                  alignItems: "center", 
                  width: "100%",
                  boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.2)", 
                  marginBottom: "12px",
                  borderRadius: "3px", 
                  height: "50px", 
                  background: "#6C7A99"
                }}>
                  <UniversityHeader university={university} />
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="row">
              <div className="col-md-3" style={{ paddingRight: "2px", margin: "0" }}>
                <StatCard
                  title="Total Users"
                  value={analytics.total_users_cnt}
                  icon="dist/img/Teacher.png"
                  link="/student"
                />
              </div>
              <div className="col-md-1" style={{ paddingLeft: "2px", paddingRight: "2px" }}>
                <StatCard
                  title="Active"
                  value={analytics.active_users}
                  color="#4AA081"
                  isCenter={true}
                />
              </div>
              <div className="col-md-1" style={{ paddingLeft: "2px", paddingRight: "2px" }}>
                <StatCard
                  title="Inactive"
                  value={analytics.inactive_users}
                  color="#EB3F3F"
                  isCenter={true}
                />
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="mt-1" style={{ paddingLeft: "2px", paddingRight: "2px" }}>
            <div className="row">
              <div className="col-md-12" style={{ height: "100%", marginTop: "10px" }}>
                <div className="small-box" style={{
                  padding: "0px", 
                  boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.2)",
                  borderRadius: "0px 0px 5px 5px",
                  background: "white"
                }}>
                  <div>
                    <div style={{ 
                      background: "rgb(108, 122, 153)", 
                      color: "#fff", 
                      padding: "8px 7px 8px 25px",
                      borderRadius: "3px 3px 0 0"
                    }}>
                      <span className="ten_font_class" style={{ fontWeight: "600" }}>Analytics Dashboard</span>
                    </div>
                    <div className="event_inner_div" style={{ minHeight: "120px", padding: "15px" }}>
                      <div className="row m-0">
                        <div className="col-md-4">
                          <AnalyticsCard
                            title="Users"
                            value={bounceRate.total_students}
                            change="+40%"
                            changeType="positive"
                            icon="dist/img/UsersIcon.png"
                            iconBg="#E1EBFF"
                          />
                        </div>
                        <div className="col-md-4">
                          <AnalyticsCard
                            title="Bounce Rate"
                            value={bounceRate.bounce_rate}
                            change="+40%"
                            changeType="positive"
                            icon="dist/img/ComboChart.png"
                            iconBg="#FBE1FF"
                          />
                        </div>
                        <div className="col-md-4">
                          <AnalyticsCard
                            title="Time on App"
                            value={`${bounceRate.average_time || 0}m`}
                            change="-16%"
                            changeType="negative"
                            icon="dist/img/Timer.png"
                            iconBg="#BEF5C3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flagged Content */}
          <div className="mt-2">
            <div className="row">
              <div className="col-md-12" style={{ height: "100%", marginTop: "10px" }}>
                <div className="small-box" style={{
                  padding: "0px", 
                  boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.2)",
                  borderRadius: "0px 0px 5px 5px",
                  background: "white"
                }}>
                  <div>
                    <div style={{ 
                      background: "rgb(108, 122, 153)", 
                      color: "#fff", 
                      padding: "8px 7px 8px 25px",
                      borderRadius: "3px 3px 0 0"
                    }}>
                      <span className="ten_font_class" style={{ fontWeight: "600" }}>Flagged Content</span>
                    </div>
                    <div className="event_inner_div" style={{ minHeight: "140px", padding: "15px" }}>
                      <DataTable
                        fixedHeader
                        fixedHeaderScrollHeight="400px"
                        columns={columns}
                        data={flagged}
                        customStyles={customStyles}
                        noDataComponent={
                          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                            No flagged content found
                          </div>
                        }
                      />
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                        <Link
                          to="/FlaggedContents"
                          style={{
                            border: "1px solid rgb(108, 122, 153)", 
                            color: "rgb(108, 122, 153)", 
                            padding: "6px 40px",
                            borderRadius: "5px", 
                            fontSize: "9px", 
                            fontWeight: "600",
                            textDecoration: "none",
                            background: "white"
                          }}
                        >
                          View All
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}