import React, { useState, useEffect } from 'react';
import { Plus, FileText, Settings } from 'lucide-react';
import { db } from './firebase'; // הייבוא של מסד הנתונים
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import BuildingTabs from './components/BuildingTabs';
import ReportCard from './components/ReportCard';
import ReportForm from './components/ReportForm';
import SettingsPage from './components/SettingsPage'
import { generateWeeklyPDF } from './components/PDFGenerator';
import { useSettings } from './context/AppContext';
import './App.css';

const INITIAL_FORM_STATE = {
  building: '',
  dutyMebist: '',
  GeneralComments: '',
  floors: {
    1: { rooms: { "ימין ימין": { issues: '', notes: '' }, "ימין שמאל": { issues: '', notes: '' }, "שמאל ימין": { issues: '', notes: '' }, "שמאל שמאל": { issues: '', notes: '' } } },
    2: { rooms: { "ימין ימין": { issues: '', notes: '' }, "ימין שמאל": { issues: '', notes: '' }, "שמאל ימין": { issues: '', notes: '' }, "שמאל שמאל": { issues: '', notes: '' } } },
    3: { rooms: { "ימין ימין": { issues: '', notes: '' }, "ימין שמאל": { issues: '', notes: '' }, "שמאל ימין": { issues: '', notes: '' }, "שמאל שמאל": { issues: '', notes: '' } } }
  }
};

const App = () => {
  const [activeTab, setActiveTab] = useState(3);
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewMode, setIsViewMode] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const { settings, loading } = useSettings();

  const handleDelete = async (reportId) => {
    // הסרנו את ה-confirm, המחיקה מתבצעת מיד
    try {
      await deleteDoc(doc(db, "reports", reportId));
      setSelectedReport(null); // סוגר את המודל מיד אחרי המחיקה
    } catch (error) {
      console.error("שגיאה במחיקה:", error);
      alert("לא ניתן למחוק את הדוח כרגע");
    }
  };

  const handleUpdate = async () => {
    try {
      const reportRef = doc(db, "reports", selectedReport.id);
      await updateDoc(reportRef, selectedReport);
      setIsViewMode(true); // אחרי השמירה, חזור למצב צפייה
      alert("הדוח עודכן בהצלחה!");
    } catch (error) {
      console.error("שגיאה בעדכון:", error);
      alert("לא ניתן לעדכן את הדוח");
    }
  };

  const handleExportByDate = () => {
    const reportsToExport = reports.filter(report => {
      if (!report.date) return false;
      const normalizedDate = report.date.replace(/\./g, '/');
      const parts = normalizedDate.split('/');
      const reportFormattedForComparison = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      return reportFormattedForComparison === exportDate;
    });

    if (reportsToExport.length === 0) {
      const formattedDateForAlert = exportDate.split('-').reverse().join('/');
      alert(`לא נמצאו דוחות לתאריך ${formattedDateForAlert}`);
      return;
    }

    generateWeeklyPDF(reportsToExport, exportDate, settings);
    setShowDatePicker(false);
  };

 const handleOpenNewReport = () => {
    setFormData(JSON.parse(JSON.stringify(INITIAL_FORM_STATE)));
    setIsViewMode(false);
    setShowForm(true);
  };

  const buildings = [
    { id: 3, name: 'כניסה 3' },
    { id: 4, name: 'כניסה 4' },
    { id: 5, name: 'כניסה 5' },
  ];

  // האזנה לנתונים מהענן בזמן אמת
 useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsArr = [];
      querySnapshot.forEach((doc) => {
        reportsArr.push({ ...doc.data(), id: doc.id });
      });
      setReports(reportsArr);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newReport = {
        ...formData,
        building: activeTab,
        date: new Date().toLocaleDateString('he-IL'),
        createdAt: new Date()
      };
      await addDoc(collection(db, "reports"), newReport);
      setShowForm(false);
    } catch (error) {
      console.error("שגיאה בשמירה:", error);
      alert("הייתה בעיה בשמירת הדוח, נסי שוב");
    }
  };

  // מניעת רינדור לפני שהגדרות המערכת נטענו מ-Firebase
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>טוען נתונים...</div>;
  }

  return (
    <div className="app-container" dir="rtl">
      <BuildingTabs buildings={buildings} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        <div className="title-wrapper">
          <h2 className="main-title">דוחות {buildings.find(b => b.id === activeTab).name}</h2>
          <div className="title-decoration-house"></div>
        </div>

        <div className="reports-list">
          {reports.filter(r => r.building === activeTab).map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => {
                setSelectedReport(report);
                setIsViewMode(true); // תמיד נפתח קודם לצפייה
              }}
            />))}
        </div>
      </main>

      <div className="fab-container">
        {showDatePicker && (
          <div className="date-picker-bubble">
            <label>בחר תאריך לייצוא:</label>
            <input
              type="date"
              value={exportDate}
              onChange={(e) => setExportDate(e.target.value)}
            />
            <button onClick={handleExportByDate} className="btn-confirm-pdf">הורד PDF</button>
            <button onClick={() => setShowDatePicker(false)} className="btn-cancel-pdf">ביטול</button>
          </div>
        )}

        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="pdf-floating-tab"
        >
          <FileText size={24} />
        </button>

        <button onClick={handleOpenNewReport} className="add-report-btn">
          <Plus size={32} />
        </button>

        <button
        onClick={() => setShowSettings(true)}
        className="settings-floating-btn"
      >
        <Settings size={24} />
      </button>
      </div>

      {showSettings && (
  <SettingsPage 
    onClose={() => setShowSettings(false)} 
  />
)}

      {showForm && (
        <ReportForm
          buildingName={buildings.find(b => b.id === activeTab).name}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setFormData(INITIAL_FORM_STATE); // איפוס נוסף לביטחון בסגירה
          }}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {selectedReport && (
        <ReportForm
          isViewOnly={isViewMode} // משתמש ב-State החדש
          setIsViewMode={setIsViewMode} // מעביר את פונקציית העדכון
          formData={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDelete={() => handleDelete(selectedReport.id)}
          onSubmit={handleUpdate} // פונקציית עדכון שנכתוב מיד
          setFormData={(newData) => setSelectedReport(newData)}
          buildingName={buildings.find(b => b.id === activeTab).name}
        />
      )}
    </div>
  );
};

export default App;