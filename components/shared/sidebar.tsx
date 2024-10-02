"use client";
import React, { useEffect } from 'react';
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right'; // Add position prop to determine sidebar side
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, children, position = 'left' }) => {

  useEffect(() => {
    if (isOpen) {
      // Add class to disable scrolling
      document.body.classList.add('no-scroll');
    } else {
      // Remove class when sidebar is closed
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);
  return (
    <>
      {/* Backdrop for the blur effect */}
      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}

      {/* Sidebar container */}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'} ${position}`}>
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          &times;
        </button>
        <div className="sidebar-content">{children}</div>
      </div>
    </>
  );
};

export default Sidebar;
