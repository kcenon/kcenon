/**
 * Portfolio i18n Utilities
 * Shared internationalization and text processing functions
 */

/**
 * Get current language from global state
 * @returns {string} Current language code ('ko' or 'en')
 */
function getLang() {
    return window.currentLanguage || window.getLanguage?.() || 'ko';
}

/**
 * Get text from multilingual object { ko: "...", en: "..." }
 * @param {Object|string} obj - Multilingual object or plain string
 * @returns {string} Text in current language
 */
function getText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = getLang();
    return obj[lang] || obj.ko || obj.en || '';
}

/**
 * Get array from multilingual object { ko: [...], en: [...] }
 * @param {Object|Array} obj - Multilingual array object or plain array
 * @returns {Array} Array in current language
 */
function getArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    const lang = getLang();
    return obj[lang] || obj.ko || obj.en || [];
}

/**
 * Calculate development duration from period string
 * @param {string|Object} period - Period string or multilingual object
 * @returns {string|null} Formatted duration string (e.g., "1년 6개월" or "1 yr 6 mo")
 */
function calculateDuration(period) {
    const periodStr = getText(period);
    if (!periodStr) return null;

    // Parse period formats: "YYYY.MM - YYYY.MM", "YYYY - YYYY", "YYYY.MM - Present"
    const parts = periodStr.split(' - ');
    if (parts.length !== 2) return null;

    const parseDate = (str) => {
        str = str.trim();
        // Remove any duration info like "(8개월)" or "(8 months)"
        str = str.replace(/\s*\([^)]*\)\s*$/, '');
        if (str.toLowerCase() === 'present' || str === '현재') {
            return new Date();
        }
        const [year, month] = str.split('.');
        return new Date(parseInt(year), month ? parseInt(month) - 1 : 0);
    };

    try {
        const startDate = parseDate(parts[0]);
        const endDate = parseDate(parts[1]);

        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12
                     + (endDate.getMonth() - startDate.getMonth()) + 1;

        if (months <= 0) return null;

        const lang = getLang();
        if (months >= 12) {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            if (remainingMonths === 0) {
                return lang === 'ko' ? `${years}년` : `${years} yr${years > 1 ? 's' : ''}`;
            }
            return lang === 'ko'
                ? `${years}년 ${remainingMonths}개월`
                : `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo`;
        }
        return lang === 'ko' ? `${months}개월` : `${months} mo`;
    } catch (e) {
        return null;
    }
}

/**
 * Format period with calculated duration appended
 * @param {string|Object} period - Period string or multilingual object
 * @returns {string} Period with duration (e.g., "2019.01 - 2020.06 (1년 6개월)")
 */
function formatPeriodWithDuration(period) {
    let periodStr = getText(period);
    // Remove any existing duration info
    periodStr = periodStr.replace(/\s*\([^)]*(?:개월|년|months?|yrs?|mo)[^)]*\)/gi, '').trim();
    const duration = calculateDuration(period);
    if (duration) {
        return `${periodStr} (${duration})`;
    }
    return periodStr;
}

/**
 * Get translated text from translations object
 * @param {string} key - Translation key (e.g., 'nav.about')
 * @returns {string} Translated text or key if not found
 */
function t(key) {
    const lang = getLang();
    return window.translations?.[lang]?.[key] || key;
}

// Export for browser global access
window.i18nUtils = {
    getLang,
    getText,
    getArray,
    calculateDuration,
    formatPeriodWithDuration,
    t
};

// Also export individual functions for direct access
window.getLang = getLang;
window.getText = getText;
window.getArray = getArray;
window.calculateDuration = calculateDuration;
window.formatPeriodWithDuration = formatPeriodWithDuration;
