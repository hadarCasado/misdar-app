import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ROOM_INFO as DEFAULT_ROOM_INFO } from './roomData';

const SettingsContext = createContext();

export const ContextProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // האזנה לשינויים ב-Firebase בזמן אמת
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "settings", "globalConfig"), (docSnap) => {
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            } else {
                // אם אין נתונים בענן, נשתמש בברירות המחדל מהקובץ הסטטי
                setSettings({
                    BUILDING_MANAGERS: {
                        3: "ליאם בר גבע ואורי קורקט",
                        4: "הדר קסדו",
                        5: "יהלי מימון שפירא"
                    },
                    ROOM_INFO: DEFAULT_ROOM_INFO
                });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // פונקציה לעדכון הגדרות (מיועדת לשימוש מה-SettingsPage)
    const updateSettings = async (newSettings) => {
        try {
            await setDoc(doc(db, "settings", "globalConfig"), newSettings);
            return { success: true };
        } catch (error) {
            console.error("Error updating settings:", error);
            return { success: false, error };
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Hook מותאם אישית לשימוש קל ברכיבים
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};