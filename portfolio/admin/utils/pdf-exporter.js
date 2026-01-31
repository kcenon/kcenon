/**
 * PDF Exporter - Generate PDF from portfolio data using pdfmake
 * Supports theme-based styling via StyleManager
 *
 * Dependencies: utils/i18n.js (getLang, getText, getArray, calculateDuration, formatPeriodWithDuration)
 */

class PDFExporter {
  constructor() {
    this.fontLoaded = false;
    this.fontLoading = null;
    this.currentTheme = null;
    this.themeStyles = null;
    this.currentLang = 'ko';
  }

  /**
   * Get current language (delegates to shared utility)
   * @returns {string} Current language code ('ko' or 'en')
   */
  getLang() {
    return window.i18nUtils?.getLang?.() || window.currentLanguage || window.getLanguage?.() || 'ko';
  }

  /**
   * Get text from multilingual object (delegates to shared utility)
   * @param {*} obj - Multilingual object or string
   * @returns {string} Text in current language
   */
  getText(obj) {
    // Use shared utility with currentLang context
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = this.currentLang;
    return obj[lang] || obj.ko || obj.en || '';
  }

  /**
   * Get array from multilingual object (delegates to shared utility)
   * @param {*} obj - Multilingual array object or array
   * @returns {Array} Array in current language
   */
  getArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    const lang = this.currentLang;
    return obj[lang] || obj.ko || obj.en || [];
  }

  /**
   * Calculate duration from period string (delegates to shared utility)
   * @param {string|Object} period - Period string or multilingual object
   * @returns {string|null} Formatted duration string
   */
  calculateDuration(period) {
    // Temporarily set global language context for shared utility
    const originalLang = window.currentLanguage;
    window.currentLanguage = this.currentLang;
    const result = window.i18nUtils?.calculateDuration?.(period) ?? this._calculateDurationFallback(period);
    window.currentLanguage = originalLang;
    return result;
  }

  /**
   * Fallback duration calculation if shared utility not available
   * @private
   */
  _calculateDurationFallback(period) {
    const periodStr = this.getText(period);
    if (!periodStr) return null;
    const parts = periodStr.split(' - ');
    if (parts.length !== 2) return null;

    const parseDate = (str) => {
      str = str.trim().replace(/\s*\([^)]*\)\s*$/, '');
      if (str.toLowerCase() === 'present' || str === '현재') return new Date();
      const [year, month] = str.split('.');
      return new Date(parseInt(year), month ? parseInt(month) - 1 : 0);
    };

    try {
      const startDate = parseDate(parts[0]);
      const endDate = parseDate(parts[1]);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
      if (months <= 0) return null;
      const lang = this.currentLang;
      if (months >= 12) {
        const years = Math.floor(months / 12);
        const rem = months % 12;
        if (rem === 0) return lang === 'ko' ? `${years}년` : `${years} yr${years > 1 ? 's' : ''}`;
        return lang === 'ko' ? `${years}년 ${rem}개월` : `${years} yr${years > 1 ? 's' : ''} ${rem} mo`;
      }
      return lang === 'ko' ? `${months}개월` : `${months} mo`;
    } catch (e) { return null; }
  }

  /**
   * Format period with duration
   * @param {string|Object} period - Period string or multilingual object
   * @returns {string} Period with duration appended
   */
  formatPeriodWithDuration(period) {
    let periodStr = this.getText(period);
    periodStr = periodStr.replace(/\s*\([^)]*(?:개월|년|months?|yrs?|mo)[^)]*\)/gi, '').trim();
    const duration = this.calculateDuration(period);
    return duration ? `${periodStr} (${duration})` : periodStr;
  }

  /**
   * Get localized labels based on current language
   * @returns {Object} Localized label strings
   */
  getLabels() {
    const labels = {
      ko: {
        expertise: '전문성',
        projects: '프로젝트',
        career: '경력',
        testimonials: '추천서',
        manager: '리더십 & 관리',
        featuredProjects: '주요 프로젝트',
        medicalImaging: '의료 영상',
        orthodontic: '교정 시스템',
        equipmentControl: '장비 제어',
        enterprise: '엔터프라이즈 솔루션',
        openSource: '오픈 소스',
        coreCapabilities: '핵심 역량',
        certifications: '인증',
        keyResponsibilities: '주요 역할:',
        achievements: '성과:',
        challenges: '기술적 도전:',
        solutions: '해결 방법:',
        pmCapabilities: 'PM 역량',
        leadershipStyle: '리더십 스타일',
        businessImpact: '비즈니스 임팩트',
        softSkills: '소프트 스킬',
        teamSize: '팀 규모:',
        duration: '기간:',
        outcomes: '성과:'
      },
      en: {
        expertise: 'EXPERTISE',
        projects: 'PROJECTS',
        career: 'CAREER',
        testimonials: 'TESTIMONIALS',
        manager: 'LEADERSHIP & MANAGEMENT',
        featuredProjects: 'Featured Projects',
        medicalImaging: 'Medical Imaging',
        orthodontic: 'Orthodontic Systems',
        equipmentControl: 'Equipment Control',
        enterprise: 'Enterprise Solutions',
        openSource: 'Open Source',
        coreCapabilities: 'Core Capabilities',
        certifications: 'Certifications',
        keyResponsibilities: 'Key Responsibilities:',
        achievements: 'Achievements:',
        challenges: 'Challenges:',
        solutions: 'Solutions:',
        pmCapabilities: 'PM Capabilities',
        leadershipStyle: 'Leadership Style',
        businessImpact: 'Business Impact',
        softSkills: 'Soft Skills',
        teamSize: 'Team Size:',
        duration: 'Duration:',
        outcomes: 'Outcomes:'
      }
    };
    return labels[this.currentLang] || labels.en;
  }

  /**
   * Get StyleManager instance
   * @returns {Object} StyleManager singleton
   */
  getStyleManager() {
    return window.StyleManager || null;
  }

  /**
   * Initialize theme for export
   * @param {string} themeId - Theme identifier (default: 'professional')
   * @param {Object} overrides - Custom style overrides
   */
  initializeTheme(themeId = 'professional', overrides = {}) {
    const styleManager = this.getStyleManager();
    if (!styleManager) {
      console.warn('StyleManager not available, using fallback styles');
      this.currentTheme = null;
      this.themeStyles = this.getFallbackStyles();
      return;
    }

    // Get base theme
    this.currentTheme = styleManager.getTheme(themeId);
    if (!this.currentTheme) {
      console.warn(`Theme '${themeId}' not found, using professional theme`);
      this.currentTheme = styleManager.getTheme('professional');
    }

    // Apply overrides if provided
    if (overrides && Object.keys(overrides).length > 0) {
      this.currentTheme = styleManager.mergeStyles(this.currentTheme, overrides);
    }

    // Generate PDF-specific styles from theme
    this.themeStyles = styleManager.toPDFStyles(this.currentTheme);
  }

  /**
   * Get fallback styles when StyleManager is not available
   * Enhanced to match web design more closely with gradient-like colors
   * @returns {Object} Default PDF styles
   */
  getFallbackStyles() {
    return {
      defaultStyle: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#0F172A',
        font: this.fontLoaded ? 'NotoSansKR' : 'Roboto'
      },
      styles: {
        header: {
          fontSize: 28,
          bold: true,
          color: '#3B82F6',  // Primary blue matching web gradient start
          margin: [0, 0, 0, 12],
          lineHeight: 1.2
        },
        subheader: {
          fontSize: 20,
          bold: true,
          color: '#3B82F6',  // Primary blue for section headers
          margin: [0, 24, 0, 12],
          lineHeight: 1.3
        },
        sectionTitle: {
          fontSize: 16,
          bold: true,
          color: '#3B82F6',  // Primary blue
          margin: [0, 18, 0, 8],
          lineHeight: 1.3
        },
        subsectionTitle: {
          fontSize: 13,
          bold: true,
          color: '#475569',
          margin: [0, 14, 0, 6]
        },
        tableHeader: {
          bold: true,
          fillColor: '#F1F5F9',
          margin: [8, 6, 8, 6],
          fontSize: 10
        },
        bodyText: {
          fontSize: 11,
          color: '#475569',
          lineHeight: 1.7
        },
        smallText: {
          fontSize: 9,
          color: '#94A3B8',
          lineHeight: 1.5
        },
        tagText: {
          fontSize: 8,
          color: '#3B82F6',
          background: 'DBEAFE',
          margin: [4, 2, 4, 2]
        },
        successText: {
          color: '#10B981',
          bold: true
        },
        warningText: {
          color: '#F59E0B',
          bold: true
        },
        accentText: {
          color: '#3B82F6',
          bold: true
        },
        cardBorder: {
          margin: [0, 8, 0, 8]
        },
        listItem: {
          fontSize: 10,
          color: '#475569',
          margin: [0, 3, 0, 3]
        },
        quote: {
          fontSize: 12,
          color: '#475569',
          italics: true,
          margin: [15, 8, 15, 8],
          lineHeight: 1.8
        }
      },
      pageMargins: [45, 65, 45, 65],
      background: function(currentPage, pageSize) {
        return null; // Can add watermark or background here
      }
    };
  }

  /**
   * Get color from current theme
   * @param {string} colorPath - Dot-notation path to color (e.g., 'primary', 'text.muted')
   * @returns {string} Color WITH # prefix for pdfmake (pdfmake requires #)
   */
  getColor(colorPath) {
    if (!this.currentTheme) {
      // Enhanced fallback colors matching web design (WITH # for pdfmake)
      const fallbackColors = {
        // Primary colors
        primary: '#3B82F6',
        'primary.hover': '#2563EB',
        'primary.light': '#DBEAFE',
        secondary: '#6B7280',
        accent: '#3B82F6',
        'accent.hover': '#2563EB',
        'accent.light': '#DBEAFE',

        // Gradient colors
        'gradient.start': '#3B82F6',
        'gradient.end': '#8B5CF6',

        // Text colors
        'text.primary': '#0F172A',
        'text.secondary': '#475569',
        'text.muted': '#94A3B8',

        // Background colors
        'background.page': '#FFFFFF',
        'background.primary': '#FFFFFF',
        'background.secondary': '#F8FAFC',
        'background.tertiary': '#F1F5F9',
        'background.section': '#F8FAFC',
        'background.card': '#FFFFFF',
        'background.table': '#F1F5F9',

        // Border colors
        border: '#E2E8F0',
        'border.hover': '#CBD5E1',

        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Code colors
        'code.bg': '#1E293B',
        'code.text': '#E2E8F0'
      };
      return fallbackColors[colorPath] || '#000000';
    }

    const parts = colorPath.split('.');
    let value = this.currentTheme.colors;
    for (const part of parts) {
      value = value?.[part];
    }
    // Ensure # prefix for pdfmake
    let hexValue = value || '#000000';
    if (!hexValue.startsWith('#')) {
      hexValue = '#' + hexValue;
    }
    return hexValue;
  }

  /**
   * Get typography setting from current theme
   * @param {string} key - Typography key (e.g., 'fontSize.h1', 'lineHeight')
   * @returns {*} Typography value
   */
  getTypography(key) {
    if (!this.currentTheme) {
      const fallback = {
        // Font sizes (in pt)
        'fontSize.h1': 28,
        'fontSize.h2': 20,
        'fontSize.h3': 16,
        'fontSize.h4': 13,
        'fontSize.body': 11,
        'fontSize.small': 9,
        'fontSize.tiny': 8,
        'fontSize.label': 7,

        // Line heights
        'lineHeight': 1.6,
        'lineHeight.tight': 1.3,
        'lineHeight.relaxed': 1.8,
        'lineHeight.loose': 2.0,

        // Font weights (pdfmake doesn't support numeric weights directly)
        'fontWeight.normal': false,
        'fontWeight.medium': true,
        'fontWeight.bold': true,
        'fontWeight.semibold': true
      };
      return fallback[key] !== undefined ? fallback[key] : 11;
    }

    const parts = key.split('.');
    let value = this.currentTheme.typography;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  /**
   * Get spacing setting from current theme
   * @param {string} key - Spacing key (e.g., 'page.marginTop', 'section.marginTop')
   * @returns {number} Spacing value
   */
  getSpacing(key) {
    if (!this.currentTheme) {
      const fallback = {
        // Page margins
        'page.marginTop': 65,
        'page.marginRight': 45,
        'page.marginBottom': 65,
        'page.marginLeft': 45,

        // Section spacing
        'section.marginTop': 24,
        'section.marginBottom': 18,
        'section.paddingTop': 20,
        'section.paddingBottom': 20,

        // Subsection spacing
        'subsection.marginTop': 18,
        'subsection.marginBottom': 12,

        // Paragraph spacing
        'paragraph.marginTop': 8,
        'paragraph.marginBottom': 8,
        'paragraph.spacing': 5,

        // List spacing
        'list.indent': 20,
        'list.itemSpacing': 5,
        'list.marginBottom': 12,

        // Card spacing
        'card.padding': 20,
        'card.marginBottom': 16,
        'card.gap': 12,

        // Header spacing
        'header.marginBottom': 12,
        'header.paddingBottom': 8,

        // Gap sizes
        'gap.small': 4,
        'gap.medium': 8,
        'gap.large': 16,
        'gap.xlarge': 24
      };
      return fallback[key] || 10;
    }

    const parts = key.split('.');
    let value = this.currentTheme.spacing;
    for (const part of parts) {
      value = value?.[part];
    }
    return value || 0;
  }

  /**
   * Get layout setting from current theme
   * @param {string} key - Layout key (e.g., 'bulletStyle', 'dividerStyle')
   * @returns {*} Layout value
   */
  getLayout(key) {
    if (!this.currentTheme) {
      const fallback = {
        // Header styles
        headerStyle: 'bordered',
        headerAlignment: 'left',

        // Card styles
        cardStyle: 'bordered',
        cardBorderRadius: 8,
        cardBorderWidth: 1,
        cardShadow: true,

        // List styles
        bulletStyle: 'disc',
        bulletColor: '3b82f6',

        // Divider styles
        dividerStyle: 'line',
        dividerWeight: 1,
        dividerColor: 'e2e8f0',

        // Table styles
        tableStyle: 'striped',
        tableBorderColor: 'e2e8f0',
        tableHeaderBg: 'f1f5f9',

        // Badge/Tag styles
        badgeBorderRadius: 4,
        badgePadding: 6,

        // Section styles
        sectionDivider: true,
        sectionBackground: false
      };
      return fallback[key];
    }
    return this.currentTheme.layout?.[key];
  }

  /**
   * Load Korean font (Noto Sans KR) for PDF generation
   */
  async loadKoreanFont() {
    if (this.fontLoaded) return true;
    if (this.fontLoading) return this.fontLoading;

    this.fontLoading = (async () => {
      try {
        // Noto Sans KR Regular from Google Fonts
        const fontUrl = 'https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLTq8H4hfeE.ttf';

        const response = await fetch(fontUrl);
        if (!response.ok) {
          console.warn('Korean font load failed, using default font');
          return false;
        }

        const fontBuffer = await response.arrayBuffer();
        const base64 = this.arrayBufferToBase64(fontBuffer);

        // Register font with pdfMake
        pdfMake.vfs = pdfMake.vfs || {};
        pdfMake.vfs['NotoSansKR-Regular.ttf'] = base64;

        pdfMake.fonts = {
          Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf'
          },
          NotoSansKR: {
            normal: 'NotoSansKR-Regular.ttf',
            bold: 'NotoSansKR-Regular.ttf',
            italics: 'NotoSansKR-Regular.ttf',
            bolditalics: 'NotoSansKR-Regular.ttf'
          }
        };

        this.fontLoaded = true;
        console.log('Korean font loaded successfully');
        return true;
      } catch (error) {
        console.warn('Korean font load error:', error);
        return false;
      }
    })();

    return this.fontLoading;
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Generate PDF from portfolio data
   * @param {Object} data - Portfolio data object
   * @param {Object} options - Export options
   * @param {string} options.theme - Theme ID (default: 'professional')
   * @param {Object} options.themeOverrides - Custom style overrides
   * @param {Array} options.sections - Sections to include
   * @param {string} options.filename - Output filename
   * @param {string} options.title - Document title
   * @param {string} options.author - Document author
   * @param {boolean} options.pageBreakBetweenSections - Insert page breaks between sections
   * @param {string} options.language - Language code ('ko' or 'en')
   */
  async generatePDF(data, options = {}) {
    const {
      sections = ['expertise', 'projects', 'manager', 'career', 'testimonials'],
      filename = 'portfolio.pdf',
      title = 'Portfolio',
      author = 'Dongcheol Shin',
      theme = 'professional',
      themeOverrides = {},
      includeCoverLetter = false,
      pageBreakBetweenSections = false,
      language = null
    } = options;

    try {
      // Set current language for multilingual support
      // Use provided language option, or detect from window
      this.currentLang = language || this.getLang();

      // Initialize theme
      this.initializeTheme(theme, themeOverrides);

      // Load Korean font first
      await this.loadKoreanFont();

      // Load cover letter if requested
      let coverLetterTemplate = null;
      if (includeCoverLetter) {
        coverLetterTemplate = this.loadCoverLetterTemplate();
      }

      const docDefinition = this.buildDocument(data, sections, { title, author, includeCoverLetter, coverLetterTemplate, pageBreakBetweenSections });

      return new Promise((resolve, reject) => {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.download(filename);
        resolve({ success: true, filename });
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }

  /**
   * Load cover letter template from selected template ID
   * Uses parent window's cover letter data if available
   */
  loadCoverLetterTemplate() {
    try {
      // Try to get currently selected template from parent window
      if (window.parent && typeof window.parent.getCoverLetterTemplate === 'function') {
        const template = window.parent.getCoverLetterTemplate();
        if (template) return template;
      }

      // Fallback: Load from window.PortfolioData
      if (window.PortfolioData && window.PortfolioData.coverLetter) {
        const data = window.PortfolioData.coverLetter;
        // Default to first template (distributed-systems)
        return data.templates && data.templates.length > 0 ? data.templates[0] : null;
      }

      console.warn('Cover letter template not found');
      return null;
    } catch (error) {
      console.warn('Failed to load cover letter template:', error);
      return null;
    }
  }

  /**
   * Build pdfmake document definition
   */
  buildDocument(data, sections, info) {
    const content = [];
    const { includeCoverLetter = false, coverLetterTemplate = null, pageBreakBetweenSections = false } = info;

    // Cover Letter (if included)
    if (includeCoverLetter && coverLetterTemplate) {
      content.push(...this.buildCoverLetterPage(coverLetterTemplate));
      content.push({ text: '', pageBreak: 'after' }); // Page break after cover letter
    }

    // Header
    content.push(this.buildHeader(info));

    // Build each section
    sections.forEach((section, index) => {
      const addPageBreak = pageBreakBetweenSections && index > 0;

      switch (section) {
        case 'expertise':
          if (data.expertise) {
            content.push(...this.buildExpertiseSection(data.expertise, addPageBreak));
          }
          break;
        case 'projects':
          if (data.projects) {
            content.push(...this.buildProjectsSection(data.projects, addPageBreak));
          }
          break;
        case 'career':
          if (data.career) {
            content.push(...this.buildCareerSection(data.career, addPageBreak));
          }
          break;
        case 'testimonials':
          if (data.testimonials) {
            content.push(...this.buildTestimonialsSection(data.testimonials, addPageBreak));
          }
          break;
        case 'manager':
          if (data.manager) {
            content.push(...this.buildManagerSection(data.manager, addPageBreak));
          }
          break;
      }
    });

    // Use theme-based page margins
    const pageMargins = this.themeStyles?.pageMargins || [
      this.getSpacing('page.marginLeft'),
      this.getSpacing('page.marginTop'),
      this.getSpacing('page.marginRight'),
      this.getSpacing('page.marginBottom')
    ];

    return {
      info: {
        title: info.title,
        author: info.author,
        subject: 'Professional Portfolio',
        creator: 'Portfolio Admin'
      },
      pageSize: 'A4',
      pageMargins,
      defaultStyle: {
        font: this.fontLoaded ? 'NotoSansKR' : 'Roboto',
        fontSize: this.getTypography('fontSize.body'),
        lineHeight: this.getTypography('lineHeight'),
        color: this.getColor('text.primary')
      },
      // No styles object - use inline colors only
      content
    };
  }

  /**
   * Build cover letter page
   * @param {Object} template - Cover letter template object
   * @returns {Array} pdfmake content array for cover letter
   */
  buildCoverLetterPage(template) {
    const lang = this.currentLang;
    const content = [];

    // Greeting
    content.push({
      text: this.getText(template.greeting),
      fontSize: this.getTypography('fontSize.body'),
      margin: [0, 0, 0, this.getSpacing('section.gap') * 1.5]
    });

    // Opening paragraph (with variable substitution)
    const position = this.getText(template.targetRole);
    const opening = this.getText(template.opening).replace('{position}', position);
    content.push({
      text: opening,
      fontSize: this.getTypography('fontSize.body'),
      lineHeight: this.getTypography('lineHeight') * 1.1,
      alignment: 'justify',
      margin: [0, 0, 0, this.getSpacing('section.gap') * 1.5]
    });

    // Key points
    const keyPointsContent = [];
    const keyPoints = this.getArray(template.keyPoints);
    keyPoints.forEach(point => {
      const text = this.getText(point);
      // Convert **text** to bold
      const parts = text.split(/\*\*(.+?)\*\*/g);
      const formattedText = parts.map((part, index) => {
        if (index % 2 === 1) {
          // Odd indices are inside **...**
          return { text: part, bold: true, color: this.getColor('primary') };
        }
        return part;
      });

      keyPointsContent.push({
        text: formattedText,
        margin: [0, 0, 0, this.getSpacing('list.itemGap') * 1.2]
      });
    });

    content.push({
      ul: keyPointsContent,
      margin: [0, 0, 0, this.getSpacing('section.gap') * 1.5]
    });

    // Closing paragraph
    content.push({
      text: this.getText(template.closing),
      fontSize: this.getTypography('fontSize.body'),
      lineHeight: this.getTypography('lineHeight') * 1.1,
      alignment: 'justify',
      margin: [0, 0, 0, this.getSpacing('section.gap') * 2]
    });

    // Signature
    content.push({
      text: this.getText(template.signature),
      fontSize: this.getTypography('fontSize.body'),
      margin: [0, 0, 0, 0]
    });

    return content;
  }

  /**
   * Build document header with enhanced styling
   */
  buildHeader(info) {
    const headerStyle = this.getLayout('headerStyle');
    const locale = this.currentLang === 'ko' ? 'ko-KR' : 'en-US';

    // Enhanced header with better typography
    const headerContent = {
      columns: [
        {
          text: info.author || info.title,
          fontSize: this.getTypography('fontSize.h1'),
          bold: true,
          color: this.getColor('primary')  // Use primary color directly instead of style
        },
        {
          text: new Date().toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          alignment: 'right',
          fontSize: this.getTypography('fontSize.small'),
          color: this.getColor('text.muted'),
          margin: [0, 8, 0, 0],
          width: 'auto'
        }
      ],
      margin: [0, 0, 0, this.getSpacing('header.marginBottom')]
    };

    // Apply header style with gradient-like effect
    if (headerStyle === 'underlined' || headerStyle === 'bordered') {
      return [
        headerContent,
        {
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 515, y2: 0,
            lineWidth: 3,
            lineColor: this.getColor('primary')
          }],
          margin: [0, this.getSpacing('header.paddingBottom'), 0, this.getSpacing('section.marginTop')]
        }
      ];
    } else if (headerStyle === 'boxed') {
      return [
        headerContent,
        {
          canvas: [{
            type: 'rect',
            x: 0, y: -50,
            w: 515, h: 80,
            lineWidth: 1,
            lineColor: '#E2E8F0'
          }],
          margin: [0, 0, 0, this.getSpacing('section.marginBottom')]
        }
      ];
    }

    // Default: simple header with spacing
    return [
      headerContent,
      {
        text: '',
        margin: [0, 0, 0, this.getSpacing('section.marginTop')]
      }
    ];
  }

  /**
   * Build expertise section
   * @param {Object} expertise - Expertise data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildExpertiseSection(expertise, addPageBreak = false) {
    const content = [];
    const labels = this.getLabels();

    // Section header without style (to allow color override)
    const sectionHeader = {
      text: labels.expertise,
      fontSize: this.getTypography('fontSize.h2'),
      bold: true,
      color: this.getColor('primary'),
      margin: [0, 24, 0, 12],
      lineHeight: 1.3
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

    // Add enhanced section divider line with gradient-like appearance
    content.push({
      canvas: [{
        type: 'line',
        x1: 0, y1: 0,
        x2: 515, y2: 0,
        lineWidth: 3,  // Thicker line for web-like emphasis
        lineColor: this.getColor('primary')
      }],
      margin: [0, 0, 0, this.getSpacing('section.marginBottom')]
    });

    // Categories with color-coded sections
    if (expertise.categories && expertise.categories.length > 0) {
      expertise.categories.forEach((category, index) => {
        const categoryContent = [];

        // Category title with enhanced primary color (style removed to allow color override)
        categoryContent.push({
          text: '[ ' + this.getText(category.title) + ' ]',
          fontSize: this.getTypography('fontSize.h3'),
          color: '#3B82F6',  // Primary blue matching web design
          bold: true,
          margin: [0, this.getSpacing('subsection.marginTop'), 0, this.getSpacing('subsection.marginBottom')]
        });

        const items = this.getArray(category.items);
        if (items.length > 0) {
          categoryContent.push({
            ul: items.map(item => this.stripHtml(this.getText(item))),
            fontSize: this.getTypography('fontSize.body'),
            color: '#475569',  // Text secondary
            lineHeight: this.getTypography('lineHeight'),
            margin: [this.getSpacing('list.indent'), 0, 0, this.getSpacing('list.marginBottom')]
          });
        }

        // Handle tags for Technologies category with web-like styling
        const tags = this.getArray(category.tags);
        if (tags.length > 0) {
          categoryContent.push({
            text: '[ ' + tags.map(tag => this.getText(tag)).join(' | ') + ' ]',
            fontSize: this.getTypography('fontSize.small') + 1,  // Slightly larger
            color: '#3B82F6',  // Primary blue matching web
            bold: true,
            margin: [this.getSpacing('list.indent'), 0, 0, this.getSpacing('list.marginBottom')]
          });
        }

        content.push({
          unbreakable: true,
          stack: categoryContent,
          margin: [0, 0, 0, this.getSpacing('gap.medium')]
        });
      });
    }

    // Hero Capabilities
    if (expertise.heroCapabilities && expertise.heroCapabilities.length > 0) {
      const capabilitiesContent = [];

      capabilitiesContent.push({
        text: labels.coreCapabilities,
        style: 'sectionTitle'
      });

      expertise.heroCapabilities.forEach(cap => {
        capabilitiesContent.push({
          text: [
            { text: this.getText(cap.title) + ': ', bold: true },
            { text: this.getText(cap.description) }
          ],
          margin: [this.getSpacing('list.indent'), 0, 0, 5]
        });
      });

      content.push({
        unbreakable: true,
        stack: capabilitiesContent,
        margin: [0, 0, 0, 5]
      });
    }

    // Certifications with enhanced web-like styling
    if (expertise.certifications && expertise.certifications.length > 0) {
      content.push({
        unbreakable: true,
        stack: [
          {
            text: labels.certifications,
            fontSize: this.getTypography('fontSize.h3'),
            color: '#3B82F6',  // Primary blue
            bold: true,
            margin: [0, 18, 0, 8]
          },
          {
            text: expertise.certifications.map(cert => this.getText(cert.name)).join(' | '),
            color: this.getColor('success'),  // Success green matching web
            bold: true,
            fontSize: this.getTypography('fontSize.body') + 1,
            margin: [this.getSpacing('list.indent'), 0, 0, 10]
          }
        ],
        margin: [0, 0, 0, 5]
      });
    }

    return content;
  }

  /**
   * Strip HTML tags from text
   */
  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Build projects section
   * @param {Object} projects - Projects data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildProjectsSection(projects, addPageBreak = false) {
    const content = [];
    const labels = this.getLabels();

    // Section header without style (to allow color override)
    const sectionHeader = {
      text: labels.projects,
      fontSize: this.getTypography('fontSize.h2'),
      bold: true,
      color: this.getColor('primary'),
      margin: [0, 24, 0, 12],
      lineHeight: 1.3
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

    // Add enhanced section divider line with gradient-like appearance
    content.push({
      canvas: [{
        type: 'line',
        x1: 0, y1: 0,
        x2: 515, y2: 0,
        lineWidth: 3,  // Thicker line for web-like emphasis
        lineColor: this.getColor('primary')
      }],
      margin: [0, 0, 0, this.getSpacing('section.marginBottom')]
    });

    // Featured projects first
    if (projects.featured && projects.featured.length > 0) {
      content.push({
        text: labels.featuredProjects,
        style: 'sectionTitle',
        margin: [0, this.getSpacing('subsection.marginTop'), 0, this.getSpacing('subsection.marginBottom')]
      });

      projects.featured.forEach(project => {
        content.push(this.formatProject(project));
      });

      // Add spacing after featured projects
      content.push({
        text: '',
        margin: [0, 0, 0, this.getSpacing('gap.large')]
      });
    }

    // Other project categories
    const categories = ['medicalImaging', 'orthodontic', 'equipmentControl', 'enterprise', 'openSource'];
    categories.forEach((category, index) => {
      if (projects[category] && projects[category].length > 0) {
        const categoryName = this.formatCategoryName(category);
        content.push({
          text: categoryName,
          style: 'sectionTitle',
          margin: [0, this.getSpacing('subsection.marginTop'), 0, this.getSpacing('subsection.marginBottom')]
        });

        projects[category].forEach(project => {
          content.push(this.formatProject(project));
        });

        // Add spacing between categories
        if (index < categories.length - 1) {
          content.push({
            text: '',
            margin: [0, 0, 0, this.getSpacing('gap.large')]
          });
        }
      }
    });

    return content;
  }

  /**
   * Format a single project with enhanced color coding
   */
  formatProject(project) {
    const items = [];
    const labels = this.getLabels();

    // Project title with primary color for emphasis
    items.push({
      text: this.getText(project.title) || this.getText(project.name) || 'Untitled Project',
      bold: true,
      fontSize: this.getTypography('fontSize.h3'),
      color: this.getColor('primary'),  // Changed to primary for emphasis
      margin: [0, 0, 0, 4],
      lineHeight: this.getTypography('lineHeight.tight')
    });

    // Company and period with distinct colors
    if (project.company || project.period) {
      const metaText = [];
      if (project.company) {
        metaText.push({
          text: this.getText(project.company),
          color: this.getColor('text.secondary'),
          bold: true
        });
      }
      if (project.period) {
        const period = this.formatPeriodWithDuration(project.period);
        if (project.company) {
          metaText.push({ text: ' | ', color: this.getColor('text.muted') });
        }
        metaText.push({
          text: period,
          color: this.getColor('accent')  // Accent color for dates
        });
      }

      items.push({
        text: metaText,
        fontSize: this.getTypography('fontSize.small'),
        italics: true,
        margin: [0, 0, 0, 6]
      });
    }

    // Description with better spacing
    if (project.description) {
      items.push({
        text: this.stripHtml(this.getText(project.description)),
        color: this.getColor('text.secondary'),
        fontSize: this.getTypography('fontSize.body'),
        lineHeight: this.getTypography('lineHeight.relaxed'),
        margin: [0, 0, 0, 8]
      });
    }

    // Tags with enhanced web-like styling
    const tags = this.getArray(project.tags);
    if (tags.length > 0) {
      items.push({
        text: '[ ' + tags.map(tag => this.getText(tag)).join(' | ') + ' ]',
        fontSize: this.getTypography('fontSize.tiny') + 1,  // Slightly larger for readability
        color: '#3B82F6',  // Primary blue matching web accent
        bold: true,
        margin: [0, 0, 0, 8]
      });
    }

    // Expanded details with color-coded sections
    if (project.expanded) {
      const roles = this.getArray(project.expanded.roles);
      if (roles.length > 0) {
        // Add a separator line
        items.push({
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 150, y2: 0,
            lineWidth: 1,
            lineColor: '#E2E8F0'
          }],
          margin: [0, 8, 0, 8]
        });

        items.push({
          text: '[ ' + labels.keyResponsibilities + ' ]',
          bold: true,
          fontSize: this.getTypography('fontSize.h4'),
          color: '#3B82F6',  // Primary color
          margin: [0, 0, 0, 4]
        });
        items.push({
          ul: roles.map(r => this.stripHtml(this.getText(r))),
          fontSize: this.getTypography('fontSize.body'),
          color: '#475569',  // Text secondary
          lineHeight: this.getTypography('lineHeight'),
          margin: [this.getSpacing('list.indent'), 0, 0, 6]
        });
      }

      const achievements = this.getArray(project.expanded.achievements);
      if (achievements.length > 0) {
        items.push({
          text: '[ ' + labels.achievements + ' ]',
          bold: true,
          fontSize: this.getTypography('fontSize.h4'),
          color: '#10B981',  // Success color
          margin: [0, 6, 0, 4]
        });
        items.push({
          ul: achievements.map(a => this.stripHtml(this.getText(a))),
          fontSize: this.getTypography('fontSize.body'),
          color: '#475569',  // Text secondary
          lineHeight: this.getTypography('lineHeight'),
          margin: [this.getSpacing('list.indent'), 0, 0, 6]
        });
      }
    }

    // Return with card-like styling (removed fillColor as it causes black background)
    return {
      unbreakable: true,
      stack: items,
      margin: [0, 0, 0, this.getSpacing('card.marginBottom')]
    };
  }

  /**
   * Build career section
   * @param {Object} career - Career data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildCareerSection(career, addPageBreak = false) {
    const content = [];
    const labels = this.getLabels();

    // Section header without style (to allow color override)
    const sectionHeader = {
      text: labels.career,
      fontSize: this.getTypography('fontSize.h2'),
      bold: true,
      color: this.getColor('primary'),
      margin: [0, 24, 0, 12],
      lineHeight: 1.3
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

    // Add enhanced section divider line with gradient-like appearance
    content.push({
      canvas: [{
        type: 'line',
        x1: 0, y1: 0,
        x2: 515, y2: 0,
        lineWidth: 3,  // Thicker line for web-like emphasis
        lineColor: this.getColor('primary')
      }],
      margin: [0, 0, 0, this.getSpacing('section.marginBottom')]
    });

    if (career.timeline && career.timeline.length > 0) {
      career.timeline.forEach(item => {
        const entry = [];

        // Company with optional badge
        const companyText = [];
        companyText.push({
          text: this.getText(item.company) || this.getText(item.title) || '',
          bold: true,
          color: '#3B82F6'  // Primary color
        });
        if (item.badge) {
          companyText.push({
            text: ' [' + this.getText(item.badge) + ']',
            color: '#F59E0B',  // Warning color
            bold: true
          });
        }

        entry.push({
          columns: [
            {
              text: companyText,
              fontSize: this.getTypography('fontSize.h3'),
              width: '*'
            },
            {
              text: this.formatPeriodWithDuration(item.period) || '',
              alignment: 'right',
              color: '#3B82F6',  // Primary color for dates
              fontSize: this.getTypography('fontSize.small'),
              bold: true,
              width: 'auto'
            }
          ],
          margin: [0, 8, 0, 4]
        });

        if (item.role || item.position) {
          entry.push({
            text: '> ' + (this.getText(item.role) || this.getText(item.position)),
            color: '#0F172A',  // Text primary
            fontSize: this.getTypography('fontSize.body'),
            bold: true,
            margin: [0, 0, 0, 4]
          });
        }

        // Company description
        if (item.companyDescription) {
          entry.push({
            text: this.stripHtml(this.getText(item.companyDescription)),
            italics: true,
            color: this.getColor('text.muted'),
            fontSize: this.getTypography('fontSize.small'),
            margin: [0, 0, 0, 3]
          });
        }

        // Responsibilities
        if (item.responsibilities) {
          entry.push({
            text: [
              { text: this.currentLang === 'ko' ? '담당 업무: ' : 'Responsibilities: ', bold: true },
              { text: this.stripHtml(this.getText(item.responsibilities)) }
            ],
            color: this.getColor('text.secondary'),
            fontSize: this.getTypography('fontSize.small'),
            margin: [0, 0, 0, 3]
          });
        }

        // Scale (company/team size)
        if (item.scale && (item.scale.company || item.scale.team)) {
          const scaleText = [];
          if (item.scale.company) {
            scaleText.push(this.currentLang === 'ko' ? `회사 규모: ${this.getText(item.scale.company)}` : `Company: ${this.getText(item.scale.company)}`);
          }
          if (item.scale.team) {
            scaleText.push(this.currentLang === 'ko' ? `팀 규모: ${this.getText(item.scale.team)}` : `Team: ${this.getText(item.scale.team)}`);
          }
          entry.push({
            text: scaleText.join('  |  '),
            color: this.getColor('text.muted'),
            fontSize: this.getTypography('fontSize.tiny'),
            margin: [0, 0, 0, 3]
          });
        }

        if (item.description) {
          entry.push({
            text: this.stripHtml(this.getText(item.description)),
            color: this.getColor('text.secondary'),
            margin: [0, 0, 0, 3]
          });
        }

        const achievements = this.getArray(item.achievements);
        if (achievements.length > 0) {
          // Add achievements label with success color
          entry.push({
            text: '[ ' + (this.currentLang === 'ko' ? '주요 성과' : 'Key Achievements') + ' ]',
            bold: true,
            fontSize: this.getTypography('fontSize.h4'),
            color: '#10B981',  // Success color
            margin: [0, 6, 0, 3]
          });
          entry.push({
            ul: achievements.map(a => this.stripHtml(this.getText(a))),
            fontSize: this.getTypography('fontSize.body'),
            color: '#475569',  // Text secondary
            margin: [this.getSpacing('list.indent'), 0, 0, 6]
          });
        }

        if (item.note) {
          entry.push({
            text: this.stripHtml(this.getText(item.note)),
            fontSize: this.getTypography('fontSize.small'),
            italics: true,
            color: this.getColor('text.muted'),
            margin: [0, 3, 0, 5]
          });
        }

        // Leave reason
        if (item.leaveReason) {
          entry.push({
            text: [
              { text: this.currentLang === 'ko' ? '퇴사 사유: ' : 'Reason for Leaving: ', bold: true },
              { text: this.stripHtml(this.getText(item.leaveReason)) }
            ],
            color: this.getColor('text.muted'),
            fontSize: this.getTypography('fontSize.tiny'),
            margin: [0, 0, 0, 3]
          });
        }

        const tags = this.getArray(item.tags);
        if (tags.length > 0) {
          entry.push({
            text: tags.map(tag => this.getText(tag)).join(' | '),
            color: this.getColor('primary'),
            fontSize: this.getTypography('fontSize.tiny'),
            margin: [0, 0, 0, 5]
          });
        }

        content.push({
          unbreakable: true,
          stack: entry,
          margin: [0, 0, 0, this.getSpacing('gap.xlarge')]
        });
      });
    }

    return content;
  }

  /**
   * Build testimonials section
   * @param {Object} testimonials - Testimonials data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildTestimonialsSection(testimonials, addPageBreak = false) {
    const content = [];
    const labels = this.getLabels();

    // Section header without style (to allow color override)
    const sectionHeader = {
      text: labels.testimonials,
      fontSize: this.getTypography('fontSize.h2'),
      bold: true,
      color: this.getColor('primary'),
      margin: [0, 24, 0, 12],
      lineHeight: 1.3
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

    // Add enhanced section divider line with gradient-like appearance
    content.push({
      canvas: [{
        type: 'line',
        x1: 0, y1: 0,
        x2: 515, y2: 0,
        lineWidth: 3,  // Thicker line for web-like emphasis
        lineColor: this.getColor('primary')
      }],
      margin: [0, 0, 0, this.getSpacing('section.marginBottom')]
    });

    // Featured testimonial
    if (testimonials.featured) {
      content.push(this.formatTestimonial(testimonials.featured, true));
    }

    // Other testimonials
    if (testimonials.testimonials && testimonials.testimonials.length > 0) {
      testimonials.testimonials.forEach(testimonial => {
        content.push(this.formatTestimonial(testimonial, false));
      });
    }

    return content;
  }

  /**
   * Format a single testimonial with enhanced visual hierarchy
   */
  formatTestimonial(testimonial, isFeatured) {
    const items = [];

    // Add colored background box for featured testimonials
    if (isFeatured) {
      items.push({
        text: isFeatured ? '[ Featured Testimonial ]' : '',
        fontSize: this.getTypography('fontSize.tiny'),
        color: '#3B82F6',  // Primary
        bold: true,
        margin: [0, 0, 0, 4]
      });
    }

    if (testimonial.quote || testimonial.text) {
      const quoteText = this.getText(testimonial.quote) || this.getText(testimonial.text);
      items.push({
        text: `"${this.stripHtml(quoteText)}"`,
        italics: true,
        fontSize: isFeatured ? this.getTypography('fontSize.body') + 1 : this.getTypography('fontSize.body'),
        margin: [this.getSpacing('list.indent'), 0, this.getSpacing('list.indent'), 8],
        color: '#0F172A',  // Text primary
        lineHeight: this.getTypography('lineHeight.relaxed')
      });
    }

    // Author info with color coding
    const authorText = [];
    authorText.push({
      text: this.getText(testimonial.author) || this.getText(testimonial.name) || '',
      bold: true,
      color: '#3B82F6'  // Primary
    });
    if (testimonial.role) {
      authorText.push({
        text: ', ' + this.getText(testimonial.role),
        color: '#475569',  // Text secondary
        bold: false
      });
    }
    if (testimonial.relation) {
      authorText.push({
        text: ` (${this.getText(testimonial.relation)})`,
        color: '#3B82F6',  // Primary
        italics: true
      });
    }

    items.push({
      text: authorText,
      fontSize: this.getTypography('fontSize.small'),
      margin: [this.getSpacing('list.indent'), 0, 0, 0]
    });

    // Labels
    if (testimonial.labels && testimonial.labels.length > 0) {
      items.push({
        text: '[ ' + testimonial.labels.map(l => this.getText(l.text)).join(' | ') + ' ]',
        fontSize: this.getTypography('fontSize.tiny'),
        color: '#10B981',  // Success
        bold: true,
        margin: [this.getSpacing('list.indent'), 5, 0, 0]
      });
    }

    return {
      unbreakable: true,
      stack: items,
      margin: [0, this.getSpacing('card.marginBottom'), 0, this.getSpacing('gap.xlarge')]
    };
  }

  /**
   * Build manager/leadership section
   * @param {Object} manager - Manager data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildManagerSection(manager, addPageBreak = false) {
    const content = [];
    const labels = this.getLabels();

    // Section header without style (to allow color override)
    const sectionHeader = {
      text: labels.manager,
      fontSize: this.getTypography('fontSize.h2'),
      bold: true,
      color: this.getColor('primary'),
      margin: [0, 24, 0, 12],
      lineHeight: 1.3
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

    // Add enhanced section divider line with gradient-like appearance
    content.push({
      canvas: [{
        type: 'line',
        x1: 0, y1: 0,
        x2: 515, y2: 0,
        lineWidth: 3,  // Thicker line for web-like emphasis
        lineColor: this.getColor('primary')
      }],
      margin: [0, 0, 0, this.getSpacing('section.marginBottom')]
    });

    // PM Capabilities
    if (manager.pmCapabilities && manager.pmCapabilities.length > 0) {
      content.push({
        text: labels.pmCapabilities,
        style: 'sectionTitle'
      });

      manager.pmCapabilities.forEach(cap => {
        content.push({
          unbreakable: true,
          stack: [
            {
              text: this.getText(cap.title),
              bold: true,
              fontSize: this.getTypography('fontSize.h3') - 2,
              color: this.getColor('text.primary'),
              margin: [0, 5, 0, 2]
            },
            {
              text: this.getText(cap.description),
              color: this.getColor('text.secondary'),
              margin: [0, 0, 0, 5]
            }
          ],
          margin: [this.getSpacing('list.indent'), 0, 0, 5]
        });
      });
    }

    // Leadership Style
    if (manager.leadershipStyle) {
      content.push({
        text: labels.leadershipStyle,
        style: 'sectionTitle'
      });

      const principles = this.getArray(manager.leadershipStyle.principles);
      if (principles.length > 0) {
        content.push({
          ul: principles.map(p => this.stripHtml(this.getText(p))),
          margin: [this.getSpacing('list.indent'), 0, 0, 10],
          markerColor: this.getColor('primary')
        });
      }
    }

    // Business Impact
    if (manager.businessImpact) {
      content.push({
        text: labels.businessImpact,
        style: 'sectionTitle'
      });

      const highlights = this.getArray(manager.businessImpact.highlights);
      if (highlights.length > 0) {
        content.push({
          ul: highlights.map(h => this.stripHtml(this.getText(h))),
          margin: [this.getSpacing('list.indent'), 0, 0, 10],
          markerColor: this.getColor('success')
        });
      }

      // Key numbers
      if (manager.businessImpact.keyNumbers) {
        const kn = manager.businessImpact.keyNumbers;
        const keyNumbersText = [];
        if (kn.certifications) keyNumbersText.push(`${this.currentLang === 'ko' ? '인증' : 'Certifications'}: ${kn.certifications}`);
        if (kn.ipos) keyNumbersText.push(`IPO: ${kn.ipos}`);
        if (kn.performanceImprovement) keyNumbersText.push(`${this.currentLang === 'ko' ? '성능 향상' : 'Performance'}: ${kn.performanceImprovement}`);
        if (kn.projectsDelivered) keyNumbersText.push(`${this.currentLang === 'ko' ? '프로젝트' : 'Projects'}: ${kn.projectsDelivered}`);

        if (keyNumbersText.length > 0) {
          content.push({
            text: keyNumbersText.join('  |  '),
            color: this.getColor('primary'),
            bold: true,
            fontSize: this.getTypography('fontSize.small'),
            margin: [this.getSpacing('list.indent'), 0, 0, 10]
          });
        }
      }
    }

    // Soft Skills
    if (manager.softSkills && manager.softSkills.length > 0) {
      content.push({
        text: labels.softSkills,
        style: 'sectionTitle'
      });

      const skillsText = manager.softSkills.map(skill => {
        const levelDots = '●'.repeat(skill.level || 0) + '○'.repeat(5 - (skill.level || 0));
        return `${this.getText(skill.title)} ${levelDots}`;
      }).join('  |  ');

      content.push({
        text: skillsText,
        color: this.getColor('text.secondary'),
        fontSize: this.getTypography('fontSize.small'),
        margin: [this.getSpacing('list.indent'), 0, 0, 10]
      });
    }

    return content;
  }

  /**
   * Format category name for display
   */
  formatCategoryName(category) {
    const labels = this.getLabels();
    const names = {
      medicalImaging: labels.medicalImaging,
      orthodontic: labels.orthodontic,
      equipmentControl: labels.equipmentControl,
      enterprise: labels.enterprise,
      openSource: labels.openSource
    };
    return names[category] || category;
  }

  /**
   * Check if pdfmake is available
   */
  isAvailable() {
    return typeof pdfMake !== 'undefined';
  }
}

// Export singleton instance
window.PDFExporter = new PDFExporter();
