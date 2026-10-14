import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './ReportForm.css';
import ReportMenu from './ReportMenu';
import { useSettings } from '../context/AppContext';

const ROOM_ORDER = ["ימין ימין", "ימין שמאל", "שמאל ימין", "שמאל שמאל"];

const ReportForm = ({
  isViewOnly,
  formData,
  onClose,
  onSubmit,
  setFormData,
  buildingName,
  onDelete,
  setIsViewMode, // וודא שאתה מעביר את זה מהקומפוננטה שקוראת ל-ReportForm
  handleDownloadPDF // כנ"ל
}) => {
  const [openFloor, setOpenFloor] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const accordionRefs = useRef({});
  const { settings } = useSettings();
  if (!settings) return null;

  const handleFloorClick = (floor) => {
    setOpenFloor(openFloor === floor ? null : floor);
    if (openFloor !== floor) {
      setTimeout(() => {
        accordionRefs.current[floor]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // CHANGED: פונקציה לזיהוי הבניין לצורך שליפת נתונים מהקונטקסט
  const getBuildingId = () => {
    if (buildingName.includes('3')) return 3;
    if (buildingName.includes('4')) return 4;
    if (buildingName.includes('5')) return 5;
    return null;
  };

  const handleUpdateRoom = (floor, room, field, value) => {
    setFormData(prev => ({
      ...prev,
      floors: {
        ...prev.floors,
        [floor]: {
          ...prev.floors[floor],
          rooms: {
            ...prev.floors[floor].rooms,
            [room]: {
              ...prev.floors[floor].rooms[room],
              [field]: value
            }
          }
        }
      }
    }));
  };

  const addExtraSpace = (floor, spaceName) => {
    if (formData.floors[floor].rooms[spaceName]) return;
    handleUpdateRoom(floor, spaceName, 'issues', '');
  };

  return (
    <div className={`report-modal-overlay ${isViewOnly ? 'view-mode' : ''}`} dir="rtl">
      <div className="report-form-card">

        {/* תפריט אפשרויות בפינה העליונה */}
        {isViewOnly && (
          <ReportMenu
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onEdit={() => setIsViewMode(false)} // דוגמה לשינוי מצב
            onDownloadPDF={handleDownloadPDF}   // פונקציה שתצרי בהמשך
            onDelete={onDelete}
          />
        )}

        <div className="form-header-with-delete">
          <h3 className="form-title">
            {isViewOnly ? `דו"ח מסדר ${formData.date}` : `הוספת דו"ח - ${buildingName}`}
          </h3>
        </div>

        <div className="form-content">
          {/* שדה מעביר המסדר */}
          <div className="input-group">
            <label className="field-label">מעביר המסדר:</label>
            {isViewOnly ? (
              <div className="view-text-value">{formData.inspector}</div>
            ) : (
              <input
                type="text"
                className="bottom-line-input"
                value={formData.inspector}
                onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
              />
            )}
            <div className="bottom-line"></div>
          </div>

          <div className="input-group">
            <label className="field-label">מביסט תורן:</label>
            {isViewOnly ? (
              <div className="view-text-value">{formData.dutyMebist || "-"}</div>
            ) : (
              <input
                type="text"
                className="bottom-line-input"
                value={formData.dutyMebist}
                onChange={(e) => setFormData({ ...formData, dutyMebist: e.target.value })}
              />
            )}
            <div className="bottom-line"></div>
          </div>

          <div className="input-group">
            <label className="field-label">הערות כלליות:</label>
            {isViewOnly ? (
              <div className="view-text-value">{formData.GeneralComments || "-"}</div>
            ) : (
              <textarea
                type="text"
                className="bottom-line-input"
                value={formData.GeneralComments}
                onChange={(e) => setFormData({ ...formData, GeneralComments: e.target.value })}
              />
            )}
            <div className="bottom-line"></div>
          </div>

          {/* אקורדיון קומות */}
          <div className="floors-accordion">
            {[1, 2, 3].map((floor) => (
              <div
                key={floor}
                className={`accordion-item ${isViewOnly ? 'view-open' : ''}`}
                ref={el => accordionRefs.current[floor] = el}
              >
                {isViewOnly ? (
                  /* כאן הוספנו את ה-Class שדואג לצבע הכתום */
                  <div className="floor-header view-header">
                    <span>קומה {floor}</span>
                  </div>
                ) : (
                  <button
                    className="floor-header"
                    onClick={() => handleFloorClick(floor)}
                  >
                    <span>קומה {floor}</span>
                    {openFloor === floor ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                )}

                {(isViewOnly || openFloor === floor) && (
                  <div className="floor-content">
                    {/* חדרים */}
                    {formData.floors[floor].rooms && (() => {
                      const rooms = formData.floors[floor].rooms;

                      // מיון החדרים: קודם אלו שב-ROOM_ORDER, ואז כל השאר
                      const sortedRoomNames = Object.keys(rooms).sort((a, b) => {
                        const indexA = ROOM_ORDER.indexOf(a);
                        const indexB = ROOM_ORDER.indexOf(b);

                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;
                        return a.localeCompare(b);
                      });

                      return sortedRoomNames.map((roomName) => {
                        const roomData = rooms[roomName];
                        return (
                          <div key={roomName} className="room-section">
                            <div className="room-header-with-info">
                              <span className="room-title">{roomName}</span>

                              {/* הלוגיקה החדשה שמושכת מה-Firebase או מהקובץ הסטטי כגיבוי */}
                              {(() => {
                                const buildingId = getBuildingId();
                                const info = settings?.ROOM_INFO?.[buildingId]?.[floor]?.[roomName];

                                if (!info) return null;

                                return (
                                  <div className="room-meta-info">
                                    {info.pop && <span>{info.pop}</span>}
                                    {info.contactName && <span> | {info.contactName}</span>}
                                    {info.contact && (
                                      <>
                                        <span> - </span>
                                        <span className="contact-link">{info.contact}</span>
                                      </>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                            <div className={isViewOnly ? "field-display" : "field-row"}>
                              <span className="label">תקלות:</span>
                              {isViewOnly ? (
                                <p className="value">{roomData.issues || "-"}</p>
                              ) : (
                                <textarea
                                  className="inner-input"
                                  value={roomData.issues}
                                  onChange={(e) => handleUpdateRoom(floor, roomName, 'issues', e.target.value)}
                                />
                              )}
                            </div>

                            <div className={isViewOnly ? "field-display" : "field-row"}>
                              <span className="label">הערות:</span>
                              {isViewOnly ? (
                                <p className="value">{roomData.notes || "-"}</p>
                              ) : (
                                <textarea
                                  className="inner-input"
                                  value={roomData.notes}
                                  onChange={(e) => handleUpdateRoom(floor, roomName, 'notes', e.target.value)}
                                />
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                    {/* אזור הוספת מקום עם מסגרת מקווקווקת */}
                    {!isViewOnly && (
                      <div className="add-space-row">
                        <select
                          className="add-space-select"
                          onChange={(e) => {
                            if (e.target.value) {
                              addExtraSpace(floor, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">+ הוסף מיקום (שירותים, מבואה...)</option>
                          <option value="שירותים ימין">שירותים ימין</option>
                          <option value="שירותים שמאל">שירותים שמאל</option>
                          <option value="מבואה ימין">מבואה ימין</option>
                          <option value="מבואה שמאל">מבואה שמאל</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* כפתורי פעולה */}
          <div className="form-footer-buttons">
            {isViewOnly ? (
              <button onClick={onClose} className="btn-view-close">סגירה</button>
            ) : (
              <>
                <button onClick={onSubmit} className="btn-save">הוסף</button>
                <button onClick={onClose} className="btn-cancel">ביטול</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;