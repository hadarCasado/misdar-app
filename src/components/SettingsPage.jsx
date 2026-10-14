import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/AppContext';
import './SettingsPage.css'

const ROOM_ORDER = ["ימין ימין", "ימין שמאל", "שמאל ימין", "שמאל שמאל"];

const SettingsPage = ({ onClose }) => {
    const { settings, updateSettings, loading } = useSettings();
    const [roomSettings, setRoomSettings] = useState(null);
    const [buildingManagers, setBuildingManagers] = useState(null);
    const [expandedBuilding, setExpandedBuilding] = useState(null);

    useEffect(() => {
        if (settings) {
            setRoomSettings(settings.ROOM_INFO);
            setBuildingManagers(settings.BUILDING_MANAGERS);
        }
    }, [settings]);

    const handleRoomChange = (buildingId, floorId, roomName, field, value) => {
        setRoomSettings(prev => ({
            ...prev,
            [buildingId]: {
                ...prev[buildingId],
                [floorId]: {
                    ...prev[buildingId][floorId],
                    [roomName]: {
                        ...prev[buildingId][floorId][roomName],
                        [field]: value
                    }
                }
            }
        }));
    };

    const handleSave = async () => {
        // שמירת הנתונים חזרה לענן דרך פונקציית הקונטקסט
        const result = await updateSettings({ 
            ROOM_INFO: roomSettings, 
            BUILDING_MANAGERS: buildingManagers 
        });
        if (result.success) {
            alert("ההגדרות נשמרו בהצלחה!");
            onClose(); // סגירת העמוד לאחר שמירה מוצלחת
        } else {
            alert("שגיאה בשמירת הנתונים");
        }
    };

    // הצגת מסך טעינה במידה והנתונים טרם הגיעו
    if (loading || !roomSettings || !buildingManagers) {
        return <div className="settings-full-page">טוען נתונים...</div>;
    }

    return (
        <div className="settings-full-page" dir="rtl">
            {/* כותרת עמוד קבועה למעלה */}
            <div className="settings-header-fixed">
                <button onClick={onClose} className="back-btn">
                    <ArrowRight size={24} />
                </button>
                <h1>הגדרות מערכת</h1>
                <div style={{ width: '40px' }}></div>
            </div>

            <div className="settings-container">
                {/* חלק 1: אחראי כניסות */}
                <section className="settings-card-section">
                    <h2 className="section-title">אחראי כניסות</h2>
                    {[3, 4, 5].map(id => (
                        <div key={id} className="settings-input-row">
                            <label>כניסה {id}:</label>
                            <input
                                type="text"
                                className="manager-input"
                                value={buildingManagers[id] || ""}
                                onChange={(e) => setBuildingManagers({ ...buildingManagers, [id]: e.target.value })}
                                placeholder="הכנס שם מלא..."
                            />
                        </div>
                    ))}
                </section>

                {/* חלק 2: אקורדיון כניסות לעריכת חדרים */}
                <h2 className="section-title">פרטי חדרים (אוכלוסייה וטלפון)</h2>
                {Object.entries(roomSettings).map(([bId, floors]) => (
                    <div key={bId} className={`setting-accordion-item ${expandedBuilding === bId ? 'open' : ''}`}>
                        <div
                            className="accordion-header"
                            onClick={() => setExpandedBuilding(expandedBuilding === bId ? null : bId)}
                        >
                            <span>כניסה {bId}</span>
                            {expandedBuilding === bId ? <ChevronUp /> : <ChevronDown />}
                        </div>

                        {expandedBuilding === bId && (
                            <div className="accordion-content">
                                {Object.entries(floors).map(([fId, rooms]) => (
                                    <div key={fId} className="floor-edit-block">
                                        <h4 className="floor-label">קומה {fId}</h4>

                                        {/* מיון החדרים לפני הרינדור */}
                                        {Object.keys(rooms)
                                            .sort((a, b) => {
                                                const indexA = ROOM_ORDER.indexOf(a);
                                                const indexB = ROOM_ORDER.indexOf(b);
                                                // אם החדר לא ברשימה (כמו שירותים), הוא יופיע בסוף
                                                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                                                if (indexA !== -1) return -1;
                                                if (indexB !== -1) return 1;
                                                return a.localeCompare(b);
                                            })
                                            .map((rName) => {
                                                const details = rooms[rName];
                                                return (
                                                    <div key={rName} className="room-edit-grid">
                                                        <span className="room-name-label">{rName}</span>
                                                        <div className="room-inputs-row"> {/* השורה שמוסיפה סדר וקיצור */}
                                                            <input
                                                                placeholder="אוכלוסייה"
                                                                className="settings-input-small"
                                                                value={details.pop || ""}
                                                                onChange={(e) => handleRoomChange(bId, fId, rName, 'pop', e.target.value)}
                                                            />
                                                            <input
                                                                placeholder="שם איש קשר"
                                                                className="settings-input-small"
                                                                value={details.contactName || ""}
                                                                onChange={(e) => handleRoomChange(bId, fId, rName, 'contactName', e.target.value)}
                                                            />
                                                            <input
                                                                placeholder="טלפון"
                                                                className="settings-input-small"
                                                                value={details.contact || ""}
                                                                onChange={(e) => handleRoomChange(bId, fId, rName, 'contact', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div style={{ height: '100px' }}></div> {/* מרווח בוטום */}
            </div>

            {/* כפתור שמירה צף בתחתית */}
            <button onClick={handleSave} className="floating-save-btn">
                שמור את כל השינויים
            </button>
        </div>
    );
};

export default SettingsPage;