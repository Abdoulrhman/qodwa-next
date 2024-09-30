import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right'; // Add position prop to determine sidebar side
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, children, position = 'left' }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'} ${position}`}>
      <button className="sidebar-close-btn" onClick={toggleSidebar}>
        &times;
      </button>
      <div className="sidebar-content">{children}</div>
    </div>
  );
};

export default Sidebar;
