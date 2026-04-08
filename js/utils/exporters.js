import { getLocale, t } from '../i18n.js';

function escapeCsv(value) {
    const normalized = String(value ?? '').replaceAll('"', '""');
    return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
}

function triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

export function exportCsv(filename, columns, rows) {
    const csvLines = [
        columns.map(column => escapeCsv(column.label)).join(','),
        ...rows.map(row => columns.map(column => escapeCsv(row[column.key])).join(','))
    ];

    triggerDownload(filename, csvLines.join('\n'), 'text/csv;charset=utf-8');
}

export function exportPdf(title, sections) {
    const popup = window.open('', '_blank', 'width=960,height=720');
    if (!popup) return;

    const htmlSections = sections.map(section => `
        <section style="margin-bottom:24px">
            ${section.title ? `<h2 style="margin:0 0 12px;font-size:18px">${section.title}</h2>` : ''}
            ${section.content}
        </section>
    `).join('');

    popup.document.write(`
        <!doctype html>
        <html lang="${getLocale()}">
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
                h1 { margin: 0 0 20px; font-size: 28px; }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 12px; }
                th { background: #eff6ff; }
                .muted { color: #475569; font-size: 12px; }
                .summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
                .summary-card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p class="muted">${t('common.date')}: ${new Date().toLocaleString(getLocale())}</p>
            ${htmlSections}
            <script>
                window.onload = () => {
                    window.print();
                    setTimeout(() => window.close(), 300);
                };
            </script>
        </body>
        </html>
    `);

    popup.document.close();
}
