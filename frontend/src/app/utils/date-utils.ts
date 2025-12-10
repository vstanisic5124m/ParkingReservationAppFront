/**
 * Utility klasa za formatiranje datuma
 */
export class DateUtils {
    /**
     * Formatiranje Datu  objekta: YYYY-MM-DD string
     */
    static formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Normalizacija  date string-a ili Date objekta:  YYYY-MM-DD format
     * Vrati originalan string ako je greska kod formatiranja datuma
     */
    static normalizeDate(date: string | Date): string {
        if (date instanceof Date) {
            return this.formatDate(date);
        }

        const dateObj = new Date(date);
        // Check for invalid date
        if (isNaN(dateObj.getTime())) {
            return String(date); // Return original string if invalid
        }
        return this.formatDate(dateObj);
    }
}