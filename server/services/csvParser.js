/**
 * Robust RFC-4180 compliant CSV parser and serializer for BUG HUNT
 */

export function parseCSV(text) {
    if (!text || typeof text !== 'string') return [];
    
    // Strip UTF-8 BOM if present
    const cleanText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;

    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        const nextChar = cleanText[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++; // Skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++; // Skip LF in CRLF
            }
            currentRow.push(currentField.trim());
            // Only add rows that have at least one non-empty field
            if (currentRow.some(val => val.length > 0)) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    // Flush remaining buffer
    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(val => val.length > 0)) {
            rows.push(currentRow);
        }
    }

    return rows;
}

/**
 * Parses CSV rows into objects using the header row
 */
export function parseCSVToObjects(text) {
    const rows = parseCSV(text);
    if (rows.length < 2) {
        return { headers: [], objects: [], error: 'CSV file must have at least a header row and one data row.' };
    }

    // Normalize header names (lowercase, remove spaces/underscores/quotes)
    const rawHeaders = rows[0];
    const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/[\s_-]+/g, '_'));

    const objects = [];
    const errors = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j] !== undefined ? row[j] : '';
        }
        obj._rowNumber = i + 1;
        objects.push(obj);
    }

    return { headers, objects, errors };
}
