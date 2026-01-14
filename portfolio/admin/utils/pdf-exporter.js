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
        managementProjects: '관리 프로젝트',
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
        managementProjects: 'Management Projects',
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
   * @returns {Object} Default PDF styles
   */
  getFallbackStyles() {
    return {
      defaultStyle: {
        fontSize: 10,
        lineHeight: 1.4,
        color: '1F2937'
      },
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          color: '1F2937',
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          color: '1F2937',
          margin: [0, 20, 0, 8]
        },
        sectionTitle: {
          fontSize: 14,
          bold: true,
          color: '3B82F6',
          margin: [0, 15, 0, 5]
        },
        tableHeader: {
          bold: true,
          fillColor: 'F3F4F6',
          margin: [5, 5, 5, 5]
        },
        bodyText: {
          fontSize: 10,
          color: '374151'
        },
        smallText: {
          fontSize: 9,
          color: '9CA3AF'
        },
        tagText: {
          fontSize: 8,
          color: '3B82F6'
        },
        successText: {
          color: '22C55E',
          bold: true
        },
        warningText: {
          color: 'F59E0B',
          bold: true
        }
      },
      pageMargins: [40, 60, 40, 60]
    };
  }

  /**
   * Get color from current theme
   * @param {string} colorPath - Dot-notation path to color (e.g., 'primary', 'text.muted')
   * @returns {string} Color without # prefix
   */
  getColor(colorPath) {
    if (!this.currentTheme) {
      // Fallback colors
      const fallbackColors = {
        primary: '3B82F6',
        secondary: '6B7280',
        accent: '22C55E',
        'text.primary': '1F2937',
        'text.secondary': '374151',
        'text.muted': '9CA3AF',
        'background.page': 'FFFFFF',
        'background.section': 'F9FAFB',
        'background.table': 'F3F4F6',
        border: 'E5E7EB',
        success: '22C55E',
        warning: 'F59E0B'
      };
      return fallbackColors[colorPath] || '000000';
    }

    const parts = colorPath.split('.');
    let value = this.currentTheme.colors;
    for (const part of parts) {
      value = value?.[part];
    }
    return value ? value.replace('#', '') : '000000';
  }

  /**
   * Get typography setting from current theme
   * @param {string} key - Typography key (e.g., 'fontSize.h1', 'lineHeight')
   * @returns {*} Typography value
   */
  getTypography(key) {
    if (!this.currentTheme) {
      const fallback = {
        'fontSize.h1': 24,
        'fontSize.h2': 16,
        'fontSize.h3': 14,
        'fontSize.body': 10,
        'fontSize.small': 9,
        'fontSize.tiny': 8,
        'lineHeight': 1.4
      };
      return fallback[key] || 10;
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
        'page.marginTop': 60,
        'page.marginRight': 40,
        'page.marginBottom': 60,
        'page.marginLeft': 40,
        'section.marginTop': 20,
        'section.marginBottom': 15,
        'paragraph.marginBottom': 5,
        'list.indent': 15,
        'list.itemSpacing': 3
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
        headerStyle: 'bordered',
        bulletStyle: 'disc',
        dividerStyle: 'line',
        dividerWeight: 1,
        tableStyle: 'striped'
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

      const docDefinition = this.buildDocument(data, sections, { title, author, pageBreakBetweenSections });

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
   * Build pdfmake document definition
   */
  buildDocument(data, sections, info) {
    const content = [];
    const { pageBreakBetweenSections = false } = info;

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
      styles: this.themeStyles?.styles || this.getFallbackStyles().styles,
      content
    };
  }

  /**
   * Build document header
   */
  buildHeader(info) {
    const headerStyle = this.getLayout('headerStyle');
    const locale = this.currentLang === 'ko' ? 'ko-KR' : 'en-US';
    const headerContent = {
      columns: [
        {
          text: info.author || info.title,
          style: 'header'
        },
        {
          text: new Date().toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long'
          }),
          alignment: 'right',
          color: this.getColor('text.muted'),
          margin: [0, 5, 0, 0]
        }
      ],
      margin: [0, 0, 0, 20]
    };

    // Apply header style based on theme layout
    if (headerStyle === 'underlined') {
      return [
        headerContent,
        {
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 515, y2: 0,
            lineWidth: this.getLayout('dividerWeight') || 1,
            lineColor: this.getColor('border')
          }],
          margin: [0, 0, 0, 15]
        }
      ];
    } else if (headerStyle === 'boxed') {
      return {
        ...headerContent,
        fillColor: this.getColor('background.section'),
        margin: [10, 10, 10, 20]
      };
    }

    return headerContent;
  }

  /**
   * Build expertise section
   * @param {Object} expertise - Expertise data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildExpertiseSection(expertise, addPageBreak = false) {
    const content = [];
    const labels = this.getLabels();

    const sectionHeader = {
      text: labels.expertise,
      style: 'subheader'
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

    // Categories
    if (expertise.categories && expertise.categories.length > 0) {
      expertise.categories.forEach(category => {
        const categoryContent = [];

        categoryContent.push({
          text: this.getText(category.title),
          style: 'sectionTitle'
        });

        const items = this.getArray(category.items);
        if (items.length > 0) {
          categoryContent.push({
            ul: items.map(item => this.stripHtml(this.getText(item))),
            margin: [this.getSpacing('list.indent'), 0, 0, 10],
            markerColor: this.getColor('primary')
          });
        }

        // Handle tags for Technologies category
        const tags = this.getArray(category.tags);
        if (tags.length > 0) {
          categoryContent.push({
            text: tags.map(tag => this.getText(tag)).join(' | '),
            color: this.getColor('primary'),
            fontSize: this.getTypography('fontSize.small'),
            margin: [this.getSpacing('list.indent'), 0, 0, 10]
          });
        }

        content.push({
          unbreakable: true,
          stack: categoryContent,
          margin: [0, 0, 0, 5]
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

    // Certifications
    if (expertise.certifications && expertise.certifications.length > 0) {
      content.push({
        unbreakable: true,
        stack: [
          {
            text: labels.certifications,
            style: 'sectionTitle'
          },
          {
            text: expertise.certifications.map(cert => this.getText(cert.name)).join(' | '),
            color: this.getColor('success'),
            bold: true,
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

    const sectionHeader = {
      text: labels.projects,
      style: 'subheader'
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

    // Featured projects first
    if (projects.featured && projects.featured.length > 0) {
      content.push({
        text: labels.featuredProjects,
        style: 'sectionTitle'
      });

      projects.featured.forEach(project => {
        content.push(this.formatProject(project));
      });
    }

    // Other project categories
    const categories = ['medicalImaging', 'orthodontic', 'equipmentControl', 'enterprise', 'openSource'];
    categories.forEach(category => {
      if (projects[category] && projects[category].length > 0) {
        const categoryName = this.formatCategoryName(category);
        content.push({
          text: categoryName,
          style: 'sectionTitle'
        });

        projects[category].forEach(project => {
          content.push(this.formatProject(project));
        });
      }
    });

    return content;
  }

  /**
   * Format a single project
   */
  formatProject(project) {
    const items = [];
    const labels = this.getLabels();

    items.push({
      text: this.getText(project.title) || this.getText(project.name) || 'Untitled Project',
      bold: true,
      fontSize: this.getTypography('fontSize.h3') - 2,
      color: this.getColor('text.primary'),
      margin: [0, 8, 0, 3]
    });

    if (project.company || project.period) {
      items.push({
        text: [this.getText(project.company), this.formatPeriodWithDuration(project.period)].filter(Boolean).join(' | '),
        color: this.getColor('text.muted'),
        fontSize: this.getTypography('fontSize.small'),
        margin: [0, 0, 0, 3]
      });
    }

    if (project.description) {
      items.push({
        text: this.stripHtml(this.getText(project.description)),
        color: this.getColor('text.secondary'),
        margin: [0, 0, 0, 5]
      });
    }

    const tags = this.getArray(project.tags);
    if (tags.length > 0) {
      items.push({
        text: tags.map(tag => this.getText(tag)).join(' | '),
        color: this.getColor('primary'),
        fontSize: this.getTypography('fontSize.tiny'),
        margin: [0, 0, 0, 5]
      });
    }

    // Expanded details
    if (project.expanded) {
      const roles = this.getArray(project.expanded.roles);
      if (roles.length > 0) {
        items.push({
          text: labels.keyResponsibilities,
          bold: true,
          fontSize: this.getTypography('fontSize.small'),
          color: this.getColor('text.secondary'),
          margin: [0, 3, 0, 2]
        });
        items.push({
          ul: roles.map(r => this.stripHtml(this.getText(r))),
          fontSize: this.getTypography('fontSize.small'),
          margin: [this.getSpacing('list.indent'), 0, 0, 3],
          markerColor: this.getColor('primary')
        });
      }

      const achievements = this.getArray(project.expanded.achievements);
      if (achievements.length > 0) {
        items.push({
          text: labels.achievements,
          bold: true,
          fontSize: this.getTypography('fontSize.small'),
          color: this.getColor('text.secondary'),
          margin: [0, 3, 0, 2]
        });
        items.push({
          ul: achievements.map(a => this.stripHtml(this.getText(a))),
          fontSize: this.getTypography('fontSize.small'),
          margin: [this.getSpacing('list.indent'), 0, 0, 3],
          markerColor: this.getColor('primary')
        });
      }
    }

    return {
      unbreakable: true,
      stack: items,
      margin: [0, 0, 0, 10]
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

    const sectionHeader = {
      text: labels.career,
      style: 'subheader'
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

    if (career.timeline && career.timeline.length > 0) {
      career.timeline.forEach(item => {
        const entry = [];

        // Company with optional badge
        const companyText = [];
        companyText.push({ text: this.getText(item.company) || this.getText(item.title) || '', bold: true, color: this.getColor('text.primary') });
        if (item.badge) {
          companyText.push({ text: ` [${this.getText(item.badge)}]`, color: this.getColor('warning'), bold: true });
        }

        entry.push({
          columns: [
            {
              text: companyText,
              fontSize: this.getTypography('fontSize.h3') - 2,
              width: '*'
            },
            {
              text: this.formatPeriodWithDuration(item.period) || '',
              alignment: 'right',
              color: this.getColor('text.muted'),
              fontSize: this.getTypography('fontSize.small'),
              width: 'auto'
            }
          ],
          margin: [0, 8, 0, 2]
        });

        if (item.role || item.position) {
          entry.push({
            text: this.getText(item.role) || this.getText(item.position),
            color: this.getColor('primary'),
            fontSize: this.getTypography('fontSize.body'),
            margin: [0, 0, 0, 3]
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
          entry.push({
            ul: achievements.map(a => this.stripHtml(this.getText(a))),
            fontSize: this.getTypography('fontSize.small'),
            margin: [this.getSpacing('list.indent'), 3, 0, 5],
            markerColor: this.getColor('primary')
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
          margin: [0, 0, 0, 10]
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

    const sectionHeader = {
      text: labels.testimonials,
      style: 'subheader'
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

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
   * Format a single testimonial
   */
  formatTestimonial(testimonial, isFeatured) {
    const items = [];

    if (testimonial.quote || testimonial.text) {
      const quoteText = this.getText(testimonial.quote) || this.getText(testimonial.text);
      items.push({
        text: `"${this.stripHtml(quoteText)}"`,
        italics: true,
        fontSize: this.getTypography('fontSize.body'),
        margin: [this.getSpacing('list.indent'), 0, this.getSpacing('list.indent'), 8],
        color: this.getColor('text.secondary')
      });
    }

    items.push({
      text: [
        { text: this.getText(testimonial.author) || this.getText(testimonial.name) || '', bold: true, color: this.getColor('text.primary') },
        { text: testimonial.role ? `, ${this.getText(testimonial.role)}` : '', color: this.getColor('text.muted') },
        { text: testimonial.relation ? ` (${this.getText(testimonial.relation)})` : '', color: this.getColor('text.muted') }
      ],
      fontSize: this.getTypography('fontSize.small'),
      margin: [this.getSpacing('list.indent'), 0, 0, 0]
    });

    // Labels
    if (testimonial.labels && testimonial.labels.length > 0) {
      items.push({
        text: testimonial.labels.map(l => this.getText(l.text)).join(' | '),
        fontSize: this.getTypography('fontSize.tiny'),
        color: this.getColor('primary'),
        margin: [this.getSpacing('list.indent'), 5, 0, 0]
      });
    }

    return {
      unbreakable: true,
      stack: items,
      margin: [0, 10, 0, 15]
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

    const sectionHeader = {
      text: labels.manager,
      style: 'subheader'
    };
    if (addPageBreak) {
      sectionHeader.pageBreak = 'before';
    }
    content.push(sectionHeader);

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

    // Management Projects
    if (manager.managementProjects && manager.managementProjects.length > 0) {
      content.push({
        text: labels.managementProjects,
        style: 'sectionTitle'
      });

      manager.managementProjects.forEach(project => {
        const items = [];

        items.push({
          text: project.title,
          bold: true,
          fontSize: this.getTypography('fontSize.h3') - 2,
          color: this.getColor('text.primary'),
          margin: [0, 5, 0, 2]
        });

        const metaInfo = [];
        if (project.duration) metaInfo.push(`${labels.duration} ${this.getText(project.duration)}`);
        if (project.teamSize) metaInfo.push(`${labels.teamSize} ${project.teamSize}`);

        if (metaInfo.length > 0) {
          items.push({
            text: metaInfo.join('  |  '),
            color: this.getColor('text.muted'),
            fontSize: this.getTypography('fontSize.small'),
            margin: [0, 0, 0, 3]
          });
        }

        if (project.certifications && project.certifications.length > 0) {
          items.push({
            text: project.certifications.join(' | '),
            color: this.getColor('success'),
            bold: true,
            fontSize: this.getTypography('fontSize.tiny'),
            margin: [0, 0, 0, 3]
          });
        }

        const outcomes = this.getArray(project.outcomes);
        if (outcomes.length > 0) {
          items.push({
            text: `${labels.outcomes} ${outcomes.map(o => this.getText(o)).join(', ')}`,
            color: this.getColor('text.secondary'),
            fontSize: this.getTypography('fontSize.small'),
            margin: [0, 0, 0, 5]
          });
        }

        content.push({
          unbreakable: true,
          stack: items,
          margin: [this.getSpacing('list.indent'), 0, 0, 8]
        });
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
