import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Menu() {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(() => {
    // Initialize from localStorage only once on component mount
    const stored = localStorage.getItem('active_index');
    return stored ? parseInt(stored, 10) : 1;
  });

  // Menu configuration for better maintainability
  const menuConfig = useMemo(() => [
    {
      title: "Dashboard",
      items: [
        { path: "/homepage", label: "Home", index: 1, icon: "fa-check-square" },
        { path: "/calender", label: "Calender", index: 2, icon: "fa-check-square" },
        { path: "/student", label: "Students", index: 3, icon: "fa-check-square" },
      ]
    },
    {
      title: "Engage",
      items: [
        { path: "/campusNews", label: "Campus News", index: 4, icon: "fa-check-square" },
        { path: "/event", label: "Events", index: 5, icon: "fa-check-square" },
        { path: "/polls", label: "Polls", index: 6, icon: "fa-check-square" },
        { path: "/community", label: "Campus Groups", index: 7, icon: "fa-check-square" },
        { path: "/jobDetails", label: "Jobs", index: 12, icon: "fa-check-square" },
      ]
    },
    {
      title: "Service Desk",
      items: [
        { path: "/faqDetails", label: "FAQ'S", index: 8, icon: "fa-check-square" },
        { path: "/FlaggedContents", label: "Tickets", index: 10, icon: "fa-check-square" },
      ]
    },
    {
      title: "Marketplace",
      items: [
        { path: "/marketplaceDetails", label: "Campus Shop", index: 11, icon: "fa-check-square" },
      ]
    },
    {
      title: "Settings",
      items: [
        { path: "/classDetails", label: "Class", index: 15, icon: "fa-check-square" },
      ]
    }
  ], []);

  // Create a path-to-index map for faster lookups
  const pathToIndexMap = useMemo(() => {
    const map = new Map();
    menuConfig.forEach(section => {
      section.items.forEach(item => {
        map.set(item.path, item.index);
      });
    });
    return map;
  }, [menuConfig]);

  // Handle item click with useCallback to prevent unnecessary re-renders
  const handleItemClick = useCallback((index) => {
    setActiveIndex(index);
    // Use requestIdleCallback for non-critical storage operation
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        localStorage.setItem('active_index', index.toString());
      });
    } else {
      setTimeout(() => {
        localStorage.setItem('active_index', index.toString());
      }, 0);
    }
  }, []);

  // Sync active index with current route
  useEffect(() => {
    const currentIndex = pathToIndexMap.get(location.pathname);
    if (currentIndex && currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname, pathToIndexMap, activeIndex]);

  // Memoized menu item renderer
  const renderMenuItem = useCallback((item) => (
    <li 
      key={item.index}
      onClick={() => handleItemClick(item.index)}
      className={activeIndex === item.index ? "active" : ""}
    >
      <Link to={item.path}>
        <i className={`fa ${item.icon}`} aria-hidden="true"></i>
        {item.label}
      </Link>
    </li>
  ), [activeIndex, handleItemClick]);

  // Memoized menu section renderer
  const renderMenuSection = useCallback((section) => (
    <li key={section.title} style={{ marginTop: "16px" }}>
      <div className="menu-section-title">
        {section.title}
      </div>
      <ul style={{ fontSize: "14px", color: 'lightblue' }}>
        {section.items.map(renderMenuItem)}
      </ul>
    </li>
  ), [renderMenuItem]);

  const menuStyles = {
    aside: {
      overflowY: "auto" ,
      fontFamily: "Poppins",
      overflowX: "hidden" ,
      height: "100%"
    },
    sectionTitle: {
      paddingLeft: "0.0rem",
      fontFamily: "Poppins",
      fontStyle: "normal",
      fontWeight: "500",
      fontSize: "9px",
      lineHeight: "16px",
      color: "rgba(255, 255, 255, 0.9)"
    }
  };

  return (
    <aside 
      className="main-sidebar sidebar-dark-primary elevation-4" 
      style={menuStyles.aside}
    >
      <nav className="main-sidebar sidebar-dark-primary elevation-4">
        <ul className="mainmenu">
          {menuConfig.map(renderMenuSection)}
        </ul>
      </nav>
    </aside>
  );
}

// Add CSS for better performance (put this in your CSS file)
/*
.menu-section-title {
  padding-left: 0.0rem;
  font-family: Poppins;
  font-style: normal;
  font-weight: 500;
  font-size: 9px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.mainmenu li {
  transition: all 0.2s ease;
}

.mainmenu li.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.mainmenu a {
  display: block;
  padding: 8px 12px;
  text-decoration: none;
  color: inherit;
}

.mainmenu a:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
*/