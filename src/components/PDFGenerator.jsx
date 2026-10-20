import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { assistantFont } from './Assistant-Regular-normal';

export const generateWeeklyPDF = (reports, exportDate, settings) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // רישום הפונט העברי
    doc.addFileToVFS('Assistant.ttf', assistantFont);
    doc.addFont('Assistant.ttf', 'Assistant', 'normal');
    doc.setFont('Assistant');

    const reverseStr = (str) => {
        if (!str) return "";

        const reversed = str.toString().split('').reverse().join('');

        const fixedBrackets = reversed
            .replace(/\(/g, 'TEMP_OPEN')
            .replace(/\)/g, '(')
            .replace(/TEMP_OPEN/g, ')');

        return fixedBrackets.replace(/[0-9\-+/a-zA-Z]{2,}/g, (match) => {
            return match.split('').reverse().join('');
        });
    };

    const managers = settings?.BUILDING_MANAGERS || {};
    try {
        const imgPath = '/assets/flying_school_logo.png'; 
        doc.addImage(imgPath, 'PNG', 180, 5, 15, 15); 
    } catch (e) {
        console.error("לא הצלחתי לטעון את הלוגו:", e);
    }

    // --- כותרת ראשית ---
    doc.setFontSize(22);
    doc.text(reverseStr("דו\"ח מסדר"), 105, 20, { align: 'center' });

    // --- סידור התאריך (בלי להפוך אותו פעמיים) ---
    const dateParts = exportDate.split('-');
    const day = dateParts[2];
    const month = dateParts[1];
    const year = dateParts[0];
    const formattedDate = `${day}/${month}/${year}`;

    doc.setFontSize(12);
    doc.text(`${reverseStr("תאריך:")}`, 190, 35, { align: 'right' });
    doc.text(formattedDate, 175, 35, { align: 'right' });

    // --- הצגת אחראים קבועים לפי הרשימה למעלה ---
    doc.setFontSize(11);
    doc.text(`${reverseStr(managers[3] || "לא הוגדר")} :${reverseStr("אחראי כניסה 3")}`, 190, 45, { align: 'right' });
    doc.text(`${reverseStr(managers[4] || "לא הוגדר")} :${reverseStr("אחראי כניסה 4")}`, 190, 52, { align: 'right' });
    doc.text(`${reverseStr(managers[5] || "לא הוגדר")} :${reverseStr("אחראי כניסה 5")}`, 190, 59, { align: 'right' });

    // --- פס כחול מפריד עם הכיתוב "התייחסויות" ---
    let currentY = 65;
    doc.setFillColor(139, 169, 169);
    doc.rect(20, currentY, 170, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(reverseStr("התייחסויות וליקויים לפי כניסות"), 105, currentY + 5.5, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    currentY += 15;

    reports.forEach((report) => {
        doc.setDrawColor(200);
        doc.line(20, currentY, 190, currentY);
        currentY += 10;

        doc.setFontSize(16);
        const buildingName = `כניסה ${report.building}`;
        doc.text(reverseStr(buildingName), 190, currentY, { align: 'right' });
        currentY += 7;

        // הערות כלליות
        if (report.GeneralComments) {
            doc.setFontSize(10);

            const commentPrefix = reverseStr("הערות כלליות:");
            const commentText = reverseStr(report.GeneralComments);

            doc.text(`${commentText} ${commentPrefix}`, 190, currentY, { align: 'right' });
            currentY += 7;
        }

        const tableRows = [];
        if (report.floors) {
            Object.entries(report.floors).forEach(([floorNum, floorData]) => {
                if (floorData.rooms) {
                    Object.entries(floorData.rooms).forEach(([roomName, roomData]) => {
                        if (roomData.issues || roomData.notes) {
                            const roomExtra = settings?.ROOM_INFO?.[report.building]?.[floorNum]?.[roomName];

                            let contactDisplay = "-";
                            if (roomExtra) {
                                const name = roomExtra.contactName ? reverseStr(`${roomExtra.contactName}:`) : '';
                                const phone = roomExtra.contact ? reverseStr(roomExtra.contact) : '';
                                const pop = roomExtra.pop ? reverseStr(`(${roomExtra.pop})`) : '';

                                contactDisplay = [name, phone, pop].filter(item => item !== '').join('\n');
                            }

                            tableRows.push([
                                reverseStr(roomData.notes || "-"),
                                reverseStr(roomData.issues || "-"),
                                contactDisplay, 
                                reverseStr(roomName),
                                reverseStr(`קומה ${floorNum}`)
                            ]);
                        }
                    });
                }
            });
        }

        if (tableRows.length > 0) {
            autoTable(doc, {
                startY: currentY,
                showHead: false,
                body: tableRows,
                styles: {
                    font: 'Assistant',
                    halign: 'right',
                    fontSize: 9
                },
                headStyles: {
                    fillColor: [139, 169, 169], 
                    cellPadding: 2 
                },
                margin: { right: 20, left: 20 },
                columnStyles: {
                    0: { cellWidth: 40 }, // הערות
                    1: { cellWidth: 40 }, // ליקויים
                    2: {
                        cellWidth: 45,    // איש קשר
                        minCellHeight: 5
                    }, 
                    3: { cellWidth: 25 }, // שם חדר
                    4: { cellWidth: 20 }  // קומה
                }
            });
            currentY = doc.lastAutoTable.finalY + 15;
        } else {
            doc.setFontSize(10);
            doc.text(reverseStr("לא נמצאו ליקויים בכניסה זו"), 190, currentY, { align: 'right' });
            currentY += 15;
        }

        if (currentY > 260) {
            doc.addPage();
            currentY = 20;
        }
    });

    doc.save(`דוח_מסדר_${formattedDate.replace(/\//g, '-')}.pdf`);
};