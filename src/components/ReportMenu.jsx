import React from 'react';
import { MoreVertical, Trash2, Edit2 } from 'lucide-react';
import './ReportMenu.css';

const ReportMenu = ({ showMenu, setShowMenu, onEdit, onDownloadPDF, onDelete }) => {
  return (
    <div className="menu-container">
      <button className="menu-trigger-btn" onClick={() => setShowMenu(!showMenu)}>
        <MoreVertical size={22} />
      </button>
      
      {showMenu && (
        <>
          <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
          <div className="menu-dropdown">
            <button className="menu-item" onClick={() => { onEdit(); setShowMenu(false); }}>
              <Edit2 size={16} />
              <span>עריכה</span>
            </button>

            <button className="menu-item delete-item" onClick={() => { onDelete(); setShowMenu(false); }}>
              <Trash2 size={16} />
              <span>מחיקה</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportMenu;