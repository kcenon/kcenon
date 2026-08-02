/**
 * Form Fields - Reusable form field components
 */

const FormFields = {
  /**
   * Get current admin edit language
   * @returns {string} Current language code ('ko' or 'en')
   */
  getCurrentLang() {
    return window.adminCurrentLang || 'ko';
  },

  /**
   * Get text from multilingual object { ko: "...", en: "..." }
   * @param {*} obj - Multilingual object or string
   * @param {string} lang - Preferred language (uses current admin language if not specified)
   * @returns {string} Text in preferred language
   */
  getText(obj, lang = null) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const useLang = lang || this.getCurrentLang();
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      return obj[useLang] || obj.ko || obj.en || '';
    }
    return String(obj);
  },

  /**
   * Escape HTML to prevent XSS (including quotes for attribute values)
   */
  escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    // Also escape quotes for use in HTML attributes
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};

// Export
window.FormFields = FormFields;
