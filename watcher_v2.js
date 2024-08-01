const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PDFDocument } = require('pdf-lib');

const watchFolder = 'C:/Users/nilsh/OneDrive/Desktop/PDF_Testordner';
const xmlFolder = 'C:/Users/nilsh/OneDrive/Desktop/XML';

// Sicherstellen, dass die Verzeichnisse existieren
if (!fs.existsSync(xmlFolder)) {
    fs.mkdirSync(xmlFolder, { recursive: true });
}

console.log(`Überwache Ordner: ${watchFolder}`);

fs.watch(watchFolder, (eventType, filename) => {
    console.log(`Event: ${eventType}, Datei: ${filename}`);
    if (eventType === 'rename' && filename.endsWith('.pdf')) {
        const pdfPath = path.join(watchFolder, filename);
        const xmlPath = path.join(xmlFolder, `${path.parse(filename).name}.xml`);

        // Warte kurz, um sicherzustellen, dass die Datei vollständig kopiert ist
        setTimeout(async () => {
            if (fs.existsSync(pdfPath)) {
                try {
                    console.log(`PDF-Datei gefunden: ${pdfPath}`);

                    // Extrahiere Formulardaten aus der PDF-Datei
                    const pdfData = await fs.promises.readFile(pdfPath);
                    const pdfDoc = await PDFDocument.load(pdfData);
                    const form = pdfDoc.getForm();
                    const fields = form.getFields();

                    // Konvertiere extrahierte Felddaten in XML-Format
                    let xmlContent = '<document>\n';
                    fields.forEach(field => {
                        const name = field.getName();
                        const type = field.constructor.name;
                        let value = '';

                        if (field.getText) {
                            value = field.getText();
                        } else if (field.getValue) {
                            value = field.getValue();
                        }

                        xmlContent += `  <field>\n`;
                        xmlContent += `    <name>${name}</name>\n`;
                        xmlContent += `    <type>${type}</type>\n`;
                        xmlContent += `    <value>${value}</value>\n`;
                        xmlContent += `  </field>\n`;
                    });
                    xmlContent += '</document>';

                    // Speichere die XML-Datei
                    fs.writeFileSync(xmlPath, xmlContent);
                    console.log(`PDF erfolgreich in XML konvertiert: ${filename}`);
                } catch (error) {
                    console.error('Fehler beim Konvertieren in XML:', error);
                }
            } else {
                console.error('PDF-Datei nicht gefunden:', pdfPath);
            }
        }, 1000); // Warte 1 Sekunde
    }
});

console.log('Überwachung des Ordners gestartet...');
