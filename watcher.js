const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const watchFolder = 'C:/Users/nilsh/OneDrive/Desktop/PDF_Testordner';
const processedFolder = 'C:/Users/nilsh/OneDrive/Desktop/Processed';
const xmlFolder = 'C:/Users/nilsh/OneDrive/Desktop/XML';

if (!fs.existsSync(processedFolder)) {
    fs.mkdirSync(processedFolder, { recursive: true });
}
if (!fs.existsSync(xmlFolder)) {
    fs.mkdirSync(xmlFolder, { recursive: true });
}

fs.watch(watchFolder, (eventType, filename) => {
    if (eventType === 'rename' && filename.endsWith('.pdf')) {
        const pdfPath = path.join(watchFolder, filename);
        const processedPdfPath = path.join(processedFolder, filename);
        const xmlPath = path.join(xmlFolder, `${path.parse(filename).name}.xml`);

        
        setTimeout(() => {
            if (fs.existsSync(pdfPath)) {
                try {

                    fs.copyFileSync(pdfPath, processedPdfPath);
                    console.log(`PDF erfolgreich kopiert: ${filename}`);

                    const extractedText = execSync(`pdftotext "${pdfPath}" -`);


                    let xmlContent = '<document>\n';
                    extractedText.toString().split('\n').forEach(line => {
                        xmlContent += `  <line>${line}</line>\n`;
                    });
                    xmlContent += '</document>';


                    fs.writeFileSync(xmlPath, xmlContent);
                    console.log(`PDF erfolgreich in XML konvertiert: ${filename}`);
                } catch (error) {
                    console.error('Fehler beim Kopieren der Datei oder Konvertieren in XML:', error);
                }
            } else {
                console.error('PDF-Datei nicht gefunden:', pdfPath);
            }
        }, 1000);
    }
});

console.log('Überwachung des Ordners gestartet...');
