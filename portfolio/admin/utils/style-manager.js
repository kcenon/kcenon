/**
 * Style Manager - Handles theme operations and style generation for PDF and DOCX exports
 */

class StyleManager {
  constructor() {
    this.themes = new Map();
    this.currentTheme = null;
    this.customOverrides = {};
    this.loadDefaultThemes();
  }

  /**
   * Load all built-in themes from ThemeConfig
   */
  loadDefaultThemes() {
    if (typeof window.ThemeConfig === 'undefined') {
      console.warn('ThemeConfig not loaded. Using fallback theme.');
      return;
    }

    const { defaultThemes } = window.ThemeConfig;
    Object.entries(defaultThemes).forEach(([id, theme]) => {
      this.themes.set(id, theme);
    });

    // Set professional as default
    this.currentTheme = this.themes.get('professional') || null;
  }

  /**
   * Get theme by ID
   * @param {string} themeId - Theme identifier
   * @returns {Object|null} Theme object or null if not found
   */
  getTheme(themeId) {
    return this.themes.get(themeId) || null;
  }

  /**
   * Get all available themes
   * @returns {Array} Array of theme objects
   */
  getAllThemes() {
    return Array.from(this.themes.values());
  }

  /**
   * Get all theme IDs
   * @returns {Array} Array of theme IDs
   */
  getThemeIds() {
    return Array.from(this.themes.keys());
  }

  /**
   * Set current theme by ID
   * @param {string} themeId - Theme identifier
   * @returns {boolean} True if theme was set successfully
   */
  setTheme(themeId) {
    const theme = this.themes.get(themeId);
    if (theme) {
      this.currentTheme = theme;
      this.customOverrides = {};
      return true;
    }
    return false;
  }

  /**
   * Get current theme
   * @returns {Object|null} Current theme object
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Apply custom overrides to current theme
   * @param {Object} overrides - Custom style overrides
   */
  applyOverrides(overrides) {
    this.customOverrides = this.mergeDeep({}, this.customOverrides, overrides);
  }

  /**
   * Clear all custom overrides
   */
  clearOverrides() {
    this.customOverrides = {};
  }

  /**
   * Get effective theme (current theme + overrides)
   * @returns {Object} Merged theme with overrides
   */
  getEffectiveTheme() {
    if (!this.currentTheme) {
      return null;
    }
    return this.mergeStyles(this.currentTheme, this.customOverrides);
  }

  /**
   * Merge custom settings with theme
   * @param {Object} theme - Base theme object
   * @param {Object} overrides - Custom overrides
   * @returns {Object} Merged theme object
   */
  mergeStyles(theme, overrides) {
    return this.mergeDeep({}, theme, overrides);
  }

  /**
   * Deep merge helper function
   * @param {Object} target - Target object
   * @param  {...Object} sources - Source objects to merge
   * @returns {Object} Merged object
   */
  mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.mergeDeep(target, ...sources);
  }

  /**
   * Check if value is a plain object
   * @param {*} item - Value to check
   * @returns {boolean} True if plain object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Generate PDF-specific styles from theme
   * @param {Object} theme - Theme object (defaults to effective theme)
   * @returns {Object} pdfmake compatible style definition
   */
  toPDFStyles(theme = null) {
    const t = theme || this.getEffectiveTheme();
    if (!t) return {};

    return {
      defaultStyle: {
        fontSize: t.typography.fontSize.body,
        lineHeight: t.typography.lineHeight,
        color: this.hexToColor(t.colors.text.primary)
      },
      styles: {
        header: {
          fontSize: t.typography.fontSize.h1,
          bold: true,
          color: this.hexToColor(t.colors.text.primary),
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: t.typography.fontSize.h2,
          bold: true,
          color: this.hexToColor(t.colors.text.primary),
          margin: [0, t.spacing.section.marginTop, 0, 8]
        },
        sectionTitle: {
          fontSize: t.typography.fontSize.h3,
          bold: true,
          color: this.hexToColor(t.colors.primary),
          margin: [0, 15, 0, 5]
        },
        tableHeader: {
          bold: true,
          fillColor: this.hexToColor(t.colors.background.table),
          margin: [5, 5, 5, 5]
        },
        bodyText: {
          fontSize: t.typography.fontSize.body,
          color: this.hexToColor(t.colors.text.secondary)
        },
        smallText: {
          fontSize: t.typography.fontSize.small,
          color: this.hexToColor(t.colors.text.muted)
        },
        tagText: {
          fontSize: t.typography.fontSize.tiny,
          color: this.hexToColor(t.colors.primary)
        },
        successText: {
          color: this.hexToColor(t.colors.success),
          bold: true
        },
        warningText: {
          color: this.hexToColor(t.colors.warning),
          bold: true
        }
      },
      pageMargins: [
        t.spacing.page.marginLeft,
        t.spacing.page.marginTop,
        t.spacing.page.marginRight,
        t.spacing.page.marginBottom
      ]
    };
  }

  /**
   * Generate DOCX-specific styles from theme
   * @param {Object} theme - Theme object (defaults to effective theme)
   * @returns {Object} docx.js compatible style definition
   */
  toDOCXStyles(theme = null) {
    const t = theme || this.getEffectiveTheme();
    if (!t) return {};

    // Convert pt to half-points (DOCX uses half-points)
    const toHalfPt = (pt) => Math.round(pt * 2);
    // Convert pt to twips (1 pt = 20 twips)
    const toTwips = (pt) => Math.round(pt * 20);

    return {
      heading1: {
        run: {
          size: toHalfPt(t.typography.fontSize.h1),
          bold: true,
          color: this.hexToDocxColor(t.colors.text.primary)
        },
        paragraph: {
          spacing: { after: toTwips(10) }
        }
      },
      heading2: {
        run: {
          size: toHalfPt(t.typography.fontSize.h2),
          bold: true,
          color: this.hexToDocxColor(t.colors.primary)
        },
        paragraph: {
          spacing: {
            before: toTwips(t.spacing.section.marginTop),
            after: toTwips(8)
          }
        }
      },
      heading3: {
        run: {
          size: toHalfPt(t.typography.fontSize.h3),
          bold: true,
          color: this.hexToDocxColor(t.colors.text.secondary)
        },
        paragraph: {
          spacing: {
            before: toTwips(10),
            after: toTwips(5)
          }
        }
      },
      normal: {
        run: {
          size: toHalfPt(t.typography.fontSize.body),
          color: this.hexToDocxColor(t.colors.text.secondary)
        },
        paragraph: {
          spacing: {
            after: toTwips(t.spacing.paragraph.marginBottom)
          }
        }
      },
      small: {
        run: {
          size: toHalfPt(t.typography.fontSize.small),
          color: this.hexToDocxColor(t.colors.text.muted)
        }
      },
      tag: {
        run: {
          size: toHalfPt(t.typography.fontSize.tiny),
          color: this.hexToDocxColor(t.colors.primary)
        }
      },
      success: {
        run: {
          bold: true,
          color: this.hexToDocxColor(t.colors.success)
        }
      },
      warning: {
        run: {
          bold: true,
          color: this.hexToDocxColor(t.colors.warning)
        }
      },
      // Additional style helpers
      colors: {
        primary: this.hexToDocxColor(t.colors.primary),
        secondary: this.hexToDocxColor(t.colors.secondary),
        accent: this.hexToDocxColor(t.colors.accent),
        textPrimary: this.hexToDocxColor(t.colors.text.primary),
        textSecondary: this.hexToDocxColor(t.colors.text.secondary),
        textMuted: this.hexToDocxColor(t.colors.text.muted),
        border: this.hexToDocxColor(t.colors.border),
        tableBackground: this.hexToDocxColor(t.colors.background.table)
      },
      spacing: {
        listIndent: toTwips(t.spacing.list.indent),
        itemSpacing: toTwips(t.spacing.list.itemSpacing)
      }
    };
  }

  /**
   * Convert hex color to PDF color (without #)
   * @param {string} hex - Hex color code
   * @returns {string} Color without # prefix
   */
  hexToColor(hex) {
    if (!hex) return '000000';
    return hex.replace('#', '');
  }

  /**
   * Convert hex color to DOCX color format
   * @param {string} hex - Hex color code
   * @returns {string} Color without # prefix (DOCX format)
   */
  hexToDocxColor(hex) {
    if (!hex) return '000000';
    return hex.replace('#', '');
  }

  /**
   * Validate theme structure
   * @param {Object} theme - Theme object to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  validateTheme(theme) {
    const errors = [];

    if (!theme) {
      return { valid: false, errors: ['Theme object is required'] };
    }

    // Check required top-level fields
    const requiredFields = ['id', 'name', 'colors', 'typography', 'spacing', 'layout'];
    requiredFields.forEach(field => {
      if (!theme[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate colors
    if (theme.colors) {
      if (!theme.colors.primary || !this.isValidHex(theme.colors.primary)) {
        errors.push('Invalid or missing colors.primary');
      }
      if (!theme.colors.text?.primary || !this.isValidHex(theme.colors.text.primary)) {
        errors.push('Invalid or missing colors.text.primary');
      }
      if (!theme.colors.background?.page || !this.isValidHex(theme.colors.background.page)) {
        errors.push('Invalid or missing colors.background.page');
      }
    }

    // Validate typography
    if (theme.typography) {
      if (!theme.typography.fontSize?.body || typeof theme.typography.fontSize.body !== 'number') {
        errors.push('Invalid or missing typography.fontSize.body');
      }
    }

    // Validate spacing
    if (theme.spacing) {
      if (!theme.spacing.page?.marginTop || typeof theme.spacing.page.marginTop !== 'number') {
        errors.push('Invalid or missing spacing.page.marginTop');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if string is valid hex color
   * @param {string} hex - String to check
   * @returns {boolean} True if valid hex color
   */
  isValidHex(hex) {
    if (!hex || typeof hex !== 'string') return false;
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  /**
   * Export current theme configuration
   * @returns {Object} Current theme with overrides applied
   */
  exportTheme() {
    return JSON.parse(JSON.stringify(this.getEffectiveTheme()));
  }

  /**
   * Import custom theme
   * @param {Object} themeConfig - Theme configuration object
   * @returns {Object} Result { success: boolean, errors?: string[], themeId?: string }
   */
  importTheme(themeConfig) {
    const validation = this.validateTheme(themeConfig);

    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // Check for duplicate ID
    if (this.themes.has(themeConfig.id)) {
      // Generate unique ID
      themeConfig.id = `${themeConfig.id}-${Date.now()}`;
    }

    this.themes.set(themeConfig.id, themeConfig);
    return { success: true, themeId: themeConfig.id };
  }

  /**
   * Remove a custom theme
   * @param {string} themeId - Theme ID to remove
   * @returns {boolean} True if theme was removed
   */
  removeTheme(themeId) {
    // Prevent removing default themes
    const defaultThemeIds = ['professional', 'modern-dark', 'minimal', 'creative', 'executive'];
    if (defaultThemeIds.includes(themeId)) {
      return false;
    }

    return this.themes.delete(themeId);
  }

  /**
   * Get theme preview data for UI display
   * @param {string} themeId - Theme ID
   * @returns {Object|null} Preview data
   */
  getThemePreview(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return null;

    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      primaryColor: theme.colors.primary,
      backgroundColor: theme.colors.background.page,
      textColor: theme.colors.text.primary
    };
  }

  /**
   * Get all theme previews for UI display
   * @returns {Array} Array of preview objects
   */
  getAllThemePreviews() {
    return this.getAllThemes().map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      primaryColor: theme.colors.primary,
      backgroundColor: theme.colors.background.page,
      textColor: theme.colors.text.primary
    }));
  }
}

// Export singleton instance
window.StyleManager = new StyleManager();
