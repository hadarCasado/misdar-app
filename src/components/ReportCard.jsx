import React from 'react';
import './ReportCard.css';

const ReportCard = ({ report, onClick }) => (
  <div className="report-card-wrapper" onClick={onClick}>
    <div className="report-card-bubble">
      <div className="report-card-top">
        <span className="report-card-title">דו"ח מסדר</span>
        <span className="report-card-date">{report.date}</span>
      </div>
      <div className="report-card-divider"></div>
      <div className="report-card-footer">
        <span>מאת: {report.inspector}</span>
      </div>
    </div>
  </div>
);

export default ReportCard;