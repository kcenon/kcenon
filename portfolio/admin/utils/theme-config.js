/**
 * Theme Configuration - Define theme structure and base themes for PDF and DOCX exports
 */

/**
 * Theme Schema Definition
 *
 * Each theme defines colors, typography, spacing, and layout options
 * that can be applied to both PDF and DOCX exports.
 */
const ThemeSchema = {
  id: 'string',
  name: 'string',
  description: 'string',
  colors: {
    primary: 'string (hex)',
    secondary: 'string (hex)',
    accent: 'string (hex)',
    text: {
      primary: 'string (hex)',
      secondary: 'string (hex)',
      muted: 'string (hex)',
      inverse: 'string (hex)'
    },
    background: {
      page: 'string (hex)',
      section: 'string (hex)',
      highlight: 'string (hex)',
      table: 'string (hex)'
    },
    border: 'string (hex)',
    success: 'string (hex)',
    warning: 'string (hex)'
  },
  typography: {
    fontFamily: {
      primary: 'string',
      secondary: 'string',
      monospace: 'string'
    },
    fontSize: {
      h1: 'number',
      h2: 'number',
      h3: 'number',
      body: 'number',
      small: 'number',
      tiny: 'number'
    },
    fontWeight: {
      normal: 'number',
      medium: 'number',
      bold: 'number'
    },
    lineHeight: 'number'
  },
  spacing: {
    page: {
      marginTop: 'number',
      marginRight: 'number',
      marginBottom: 'number',
      marginLeft: 'number'
    },
    section: {
      marginTop: 'number',
      marginBottom: 'number',
      paddingTop: 'number',
      paddingBottom: 'number'
    },
    paragraph: {
      marginTop: 'number',
      marginBottom: 'number'
    },
    list: {
      indent: 'number',
      itemSpacing: 'number'
    }
  },
  layout: {
    headerStyle: 'bordered | simple | underlined | boxed',
    bulletStyle: 'disc | circle | square | dash | arrow',
    dividerStyle: 'line | dots | gradient | none',
    dividerWeight: 'number',
    borderRadius: 'number',
    tableStyle: 'striped | bordered | minimal'
  }
};

/**
 * Professional Theme (Default)
 * Clean blue and gray palette suitable for corporate settings
 */
const professionalTheme = {
  id: 'professional',
  name: 'Professional',
  description: 'Clean blue and gray palette suitable for corporate settings',
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#22C55E',
    text: {
      primary: '#1F2937',
      secondary: '#374151',
      muted: '#9CA3AF',
      inverse: '#FFFFFF'
    },
    background: {
      page: '#FFFFFF',
      section: '#F9FAFB',
      highlight: '#EFF6FF',
      table: '#F3F4F6'
    },
    border: '#E5E7EB',
    success: '#22C55E',
    warning: '#F59E0B'
  },
  typography: {
    fontFamily: {
      primary: 'Roboto',
      secondary: 'Roboto',
      monospace: 'Courier'
    },
    fontSize: {
      h1: 24,
      h2: 16,
      h3: 14,
      body: 10,
      small: 9,
      tiny: 8
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    },
    lineHeight: 1.4
  },
  spacing: {
    page: {
      marginTop: 60,
      marginRight: 40,
      marginBottom: 60,
      marginLeft: 40
    },
    section: {
      marginTop: 20,
      marginBottom: 15,
      paddingTop: 0,
      paddingBottom: 0
    },
    paragraph: {
      marginTop: 5,
      marginBottom: 5
    },
    list: {
      indent: 15,
      itemSpacing: 3
    }
  },
  layout: {
    headerStyle: 'bordered',
    bulletStyle: 'disc',
    dividerStyle: 'line',
    dividerWeight: 1,
    borderRadius: 0,
    tableStyle: 'striped'
  }
};

/**
 * Modern Dark Theme
 * Sleek dark theme with high contrast accents
 */
const modernDarkTheme = {
  id: 'modern-dark',
  name: 'Modern Dark',
  description: 'Sleek dark theme with high contrast accents',
  colors: {
    primary: '#60A5FA',
    secondary: '#A78BFA',
    accent: '#34D399',
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      muted: '#9CA3AF',
      inverse: '#111827'
    },
    background: {
      page: '#1F2937',
      section: '#374151',
      highlight: '#4B5563',
      table: '#374151'
    },
    border: '#4B5563',
    success: '#34D399',
    warning: '#FBBF24'
  },
  typography: {
    fontFamily: {
      primary: 'Roboto',
      secondary: 'Roboto',
      monospace: 'Courier'
    },
    fontSize: {
      h1: 24,
      h2: 16,
      h3: 14,
      body: 10,
      small: 9,
      tiny: 8
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    },
    lineHeight: 1.4
  },
  spacing: {
    page: {
      marginTop: 60,
      marginRight: 40,
      marginBottom: 60,
      marginLeft: 40
    },
    section: {
      marginTop: 20,
      marginBottom: 15,
      paddingTop: 0,
      paddingBottom: 0
    },
    paragraph: {
      marginTop: 5,
      marginBottom: 5
    },
    list: {
      indent: 15,
      itemSpacing: 3
    }
  },
  layout: {
    headerStyle: 'simple',
    bulletStyle: 'disc',
    dividerStyle: 'line',
    dividerWeight: 1,
    borderRadius: 4,
    tableStyle: 'bordered'
  }
};

/**
 * Minimal Theme
 * Clean black and white with elegant typography
 */
const minimalTheme = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean black and white with elegant typography',
  colors: {
    primary: '#111827',
    secondary: '#374151',
    accent: '#111827',
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#6B7280',
      inverse: '#FFFFFF'
    },
    background: {
      page: '#FFFFFF',
      section: '#FFFFFF',
      highlight: '#F9FAFB',
      table: '#F3F4F6'
    },
    border: '#E5E7EB',
    success: '#374151',
    warning: '#374151'
  },
  typography: {
    fontFamily: {
      primary: 'Roboto',
      secondary: 'Roboto',
      monospace: 'Courier'
    },
    fontSize: {
      h1: 22,
      h2: 15,
      h3: 13,
      body: 10,
      small: 9,
      tiny: 8
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    },
    lineHeight: 1.5
  },
  spacing: {
    page: {
      marginTop: 50,
      marginRight: 50,
      marginBottom: 50,
      marginLeft: 50
    },
    section: {
      marginTop: 25,
      marginBottom: 20,
      paddingTop: 0,
      paddingBottom: 0
    },
    paragraph: {
      marginTop: 6,
      marginBottom: 6
    },
    list: {
      indent: 20,
      itemSpacing: 4
    }
  },
  layout: {
    headerStyle: 'simple',
    bulletStyle: 'dash',
    dividerStyle: 'line',
    dividerWeight: 0.5,
    borderRadius: 0,
    tableStyle: 'minimal'
  }
};

/**
 * Creative Theme
 * Vibrant colors for creative professionals
 */
const creativeTheme = {
  id: 'creative',
  name: 'Creative',
  description: 'Vibrant colors for creative professionals',
  colors: {
    primary: '#8B5CF6',
    secondary: '#EC4899',
    accent: '#F59E0B',
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
      muted: '#9CA3AF',
      inverse: '#FFFFFF'
    },
    background: {
      page: '#FFFFFF',
      section: '#FDF4FF',
      highlight: '#F5F3FF',
      table: '#FDF4FF'
    },
    border: '#E9D5FF',
    success: '#10B981',
    warning: '#F59E0B'
  },
  typography: {
    fontFamily: {
      primary: 'Roboto',
      secondary: 'Roboto',
      monospace: 'Courier'
    },
    fontSize: {
      h1: 26,
      h2: 17,
      h3: 14,
      body: 10,
      small: 9,
      tiny: 8
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    },
    lineHeight: 1.4
  },
  spacing: {
    page: {
      marginTop: 55,
      marginRight: 45,
      marginBottom: 55,
      marginLeft: 45
    },
    section: {
      marginTop: 22,
      marginBottom: 16,
      paddingTop: 0,
      paddingBottom: 0
    },
    paragraph: {
      marginTop: 5,
      marginBottom: 5
    },
    list: {
      indent: 15,
      itemSpacing: 3
    }
  },
  layout: {
    headerStyle: 'boxed',
    bulletStyle: 'circle',
    dividerStyle: 'gradient',
    dividerWeight: 2,
    borderRadius: 8,
    tableStyle: 'bordered'
  }
};

/**
 * Executive Theme
 * Sophisticated navy and gold for senior professionals
 */
const executiveTheme = {
  id: 'executive',
  name: 'Executive',
  description: 'Sophisticated navy and gold for senior professionals',
  colors: {
    primary: '#1E3A5F',
    secondary: '#B8860B',
    accent: '#B8860B',
    text: {
      primary: '#1E293B',
      secondary: '#475569',
      muted: '#94A3B8',
      inverse: '#FFFFFF'
    },
    background: {
      page: '#FFFFFF',
      section: '#F8FAFC',
      highlight: '#F1F5F9',
      table: '#F1F5F9'
    },
    border: '#CBD5E1',
    success: '#1E3A5F',
    warning: '#B8860B'
  },
  typography: {
    fontFamily: {
      primary: 'Roboto',
      secondary: 'Roboto',
      monospace: 'Courier'
    },
    fontSize: {
      h1: 24,
      h2: 16,
      h3: 14,
      body: 10,
      small: 9,
      tiny: 8
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    },
    lineHeight: 1.45
  },
  spacing: {
    page: {
      marginTop: 65,
      marginRight: 45,
      marginBottom: 65,
      marginLeft: 45
    },
    section: {
      marginTop: 22,
      marginBottom: 18,
      paddingTop: 0,
      paddingBottom: 0
    },
    paragraph: {
      marginTop: 6,
      marginBottom: 6
    },
    list: {
      indent: 18,
      itemSpacing: 4
    }
  },
  layout: {
    headerStyle: 'underlined',
    bulletStyle: 'square',
    dividerStyle: 'line',
    dividerWeight: 2,
    borderRadius: 0,
    tableStyle: 'bordered'
  }
};

/**
 * Default themes collection
 */
const defaultThemes = {
  professional: professionalTheme,
  'modern-dark': modernDarkTheme,
  minimal: minimalTheme,
  creative: creativeTheme,
  executive: executiveTheme
};

/**
 * Required theme fields for validation
 */
const requiredFields = [
  'id',
  'name',
  'colors.primary',
  'colors.text.primary',
  'colors.background.page',
  'typography.fontSize.body',
  'spacing.page.marginTop'
];

// Export for browser usage
window.ThemeConfig = {
  ThemeSchema,
  defaultThemes,
  professionalTheme,
  modernDarkTheme,
  minimalTheme,
  creativeTheme,
  executiveTheme,
  requiredFields
};
