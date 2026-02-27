/**
 * Extracts embedded medicine information from GS1 standard (Indian Mandated) QR codes.
 * 
 * GS1 strings often encode multiple Application Identifiers (AIs) in a single string.
 * Native scanner strings often come concatenated without proper FNC1 group separators,
 * so we use a simplified best-effort linear parsing approach based on known fixed
 * and variable lengths for Indian Medicine mandates.
 * 
 * @param {string} qrString - The raw decoded string from a QR code/barcode.
 * @returns {Object} Extracted data object (e.g., { gtin, batch, expiry, name })
 */
export const parseGS1IndianQR = (qrString) => {
    const data = {};

    try {
        if (!qrString || typeof qrString !== 'string') return data;

        // Strip common human-readable brackets some scanners inject
        let raw = qrString.replace(/[\(\)]/g, "");

        // If it doesn't look like a GS1 tag starting with AI 01, abort processing
        if (!raw.startsWith("01")) return data;

        let i = 0;

        while (i < raw.length) {
            const ai = raw.substring(i, i + 2);

            if (ai === "01") {
                // (01) GTIN - fixed 14 digits
                data.gtin = raw.substring(i + 2, i + 16);
                i += 16;
            } else if (ai === "10") {
                // (10) Batch - Variable length (up to 20)
                // In a perfect GS1 string, variable lengths are terminated by ASCII 29 (GS)
                // But many basic QR apps strip invisible ascii.
                // For this parser, we'll try to look ahead for the next AI (usually 17)
                const next17Index = raw.indexOf("17", i + 2);
                if (next17Index !== -1 && next17Index - (i + 2) <= 20) {
                    data.batch = raw.substring(i + 2, next17Index);
                    i = next17Index;
                } else {
                    // Fallback to reading next 8 chars if no terminator found
                    data.batch = raw.substring(i + 2, i + 10);
                    i += 10;
                }
            } else if (ai === "17") {
                // (17) Expiry Date - fixed 6 digits (YYMMDD)
                data.expiry = raw.substring(i + 2, i + 8);
                i += 8;
            } else if (ai === "21") {
                // (21) Serial Number - variable length
                const next240Index = raw.indexOf("240", i + 2);
                if (next240Index !== -1) {
                    data.serial = raw.substring(i + 2, next240Index);
                    i = next240Index;
                } else {
                    data.serial = raw.substring(i + 2, i + 10);
                    i += 10;
                }
            } else if (ai === "24") {
                // Look specifically for 240 (Additional Product Info) where India places the Name
                const ai3 = raw.substring(i, i + 3);
                if (ai3 === "240") {
                    data.name = raw.substring(i + 3);
                    i += raw.length; // Assume it eats the rest of the string
                } else {
                    break;
                }
            } else {
                // Skip unknown tags or end parsing if we get stuck
                i++;
            }
        }
    } catch (e) {
        console.error("Error parsing GS1 QR:", e);
    }

    return data;
};
