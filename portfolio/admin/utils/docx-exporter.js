/**
 * DOCX Exporter - Generate Word documents from portfolio data using docx.js
 * Supports theme-based styling via StyleManager
 */

class DOCXExporter {
  constructor() {
    this.currentTheme = null;
    this.themeStyles = null;
    this.currentLang = 'ko';
  }

  /**
   * Get current language
   * @returns {string} Current language code ('ko' or 'en')
   */
  getLang() {
    return window.currentLanguage || window.getLanguage?.() || 'ko';
  }

  /**
   * Get text from multilingual object { ko: "...", en: "..." }
   * @param {*} obj - Multilingual object or string
   * @returns {string} Text in current language
   */
  getText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = this.currentLang;
    return obj[lang] || obj.ko || obj.en || '';
  }

  /**
   * Get array from multilingual object { ko: [...], en: [...] }
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
   * Calculate duration from period string
   * @param {string|Object} period - Period string or multilingual object
   * @returns {string|null} Formatted duration string
   */
  calculateDuration(period) {
    const periodStr = this.getText(period);
    if (!periodStr) return null;

    // Parse period formats: "YYYY.MM - YYYY.MM", "YYYY - YYYY", "YYYY.MM - Present"
    const parts = periodStr.split(' - ');
    if (parts.length !== 2) return null;

    const parseDate = (str) => {
      str = str.trim();
      // Remove any existing duration info like "(8개월)" or "(8 months)"
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

      const lang = this.currentLang;
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
   * Format period with duration
   * @param {string|Object} period - Period string or multilingual object
   * @returns {string} Period with duration appended
   */
  formatPeriodWithDuration(period) {
    let periodStr = this.getText(period);
    // Remove any existing duration info like "(8개월)", "(1년 2개월)", "(8 months)", "(1 yr 2 mo)"
    periodStr = periodStr.replace(/\s*\([^)]*(?:개월|년|months?|yrs?|mo)[^)]*\)/gi, '').trim();
    const duration = this.calculateDuration(period);
    if (duration) {
      return `${periodStr} (${duration})`;
    }
    return periodStr;
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
        professionalPortfolio: '프로페셔널 포트폴리오',
        responsibilities: '담당 업무:',
        companyScale: '회사 규모:',
        teamScale: '팀 규모:',
        reasonForLeaving: '퇴사 사유:',
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
        professionalPortfolio: 'Professional Portfolio',
        responsibilities: 'Responsibilities:',
        companyScale: 'Company Size:',
        teamScale: 'Team Size:',
        reasonForLeaving: 'Reason for Leaving:',
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

    // Generate DOCX-specific styles from theme
    this.themeStyles = styleManager.toDOCXStyles(this.currentTheme);
  }

  /**
   * Get fallback styles when StyleManager is not available
   * Enhanced to match web design more closely
   * @returns {Object} Default DOCX styles
   */
  getFallbackStyles() {
    return {
      heading1: {
        run: { size: 56, bold: true, color: '0f172a' },
        paragraph: { spacing: { after: 240, line: 300 } }
      },
      heading2: {
        run: { size: 40, bold: true, color: '3b82f6' },
        paragraph: { spacing: { before: 480, after: 240, line: 320 } }
      },
      heading3: {
        run: { size: 32, bold: true, color: '3b82f6' },
        paragraph: { spacing: { before: 360, after: 160, line: 320 } }
      },
      heading4: {
        run: { size: 26, bold: true, color: '475569' },
        paragraph: { spacing: { before: 280, after: 120 } }
      },
      normal: {
        run: { size: 22, color: '475569' },
        paragraph: { spacing: { after: 160, line: 360 } }
      },
      small: {
        run: { size: 18, color: '94a3b8' },
        paragraph: { spacing: { after: 120, line: 300 } }
      },
      tag: {
        run: { size: 16, color: '3b82f6' },
        paragraph: { spacing: { after: 80 } }
      },
      quote: {
        run: { size: 24, color: '475569', italics: true },
        paragraph: { spacing: { after: 160, line: 400 } }
      },
      colors: {
        primary: '3b82f6',
        primaryLight: 'dbeafe',
        secondary: '6b7280',
        textPrimary: '0f172a',
        textSecondary: '475569',
        textMuted: '94a3b8',
        bgPrimary: 'ffffff',
        bgSecondary: 'f8fafc',
        bgTertiary: 'f1f5f9',
        success: '10b981',
        warning: 'f59e0b',
        error: 'ef4444',
        border: 'e2e8f0',
        borderHover: 'cbd5e1'
      },
      spacing: {
        listIndent: 400,
        itemSpacing: 100,
        cardPadding: 320,
        sectionMargin: 480,
        paragraphSpacing: 160
      }
    };
  }

  /**
   * Get color from current theme
   * @param {string} colorPath - Dot-notation path to color (e.g., 'primary', 'text.muted')
   * @returns {string} Color without # prefix
   */
  getColor(colorPath) {
    if (!this.currentTheme) {
      // Enhanced fallback colors matching web design
      const fallbackColors = {
        // Primary colors
        'primary': '3b82f6',
        'primary.hover': '2563eb',
        'primary.light': 'dbeafe',
        'secondary': '6b7280',
        'accent': '3b82f6',

        // Gradient colors
        'gradient.start': '3b82f6',
        'gradient.end': '8b5cf6',

        // Text colors
        'text.primary': '0f172a',
        'text.secondary': '475569',
        'text.muted': '94a3b8',

        // Background colors
        'background.page': 'ffffff',
        'background.primary': 'ffffff',
        'background.secondary': 'f8fafc',
        'background.tertiary': 'f1f5f9',
        'background.section': 'f8fafc',
        'background.card': 'ffffff',
        'background.table': 'f1f5f9',

        // Border colors
        'border': 'e2e8f0',
        'border.hover': 'cbd5e1',

        // Status colors
        'success': '10b981',
        'warning': 'f59e0b',
        'error': 'ef4444',
        'info': '3b82f6'
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
        'fontSize.body': 11,
        'fontSize.small': 9,
        'fontSize.tiny': 8
      };
      return fallback[key] || 11;
    }

    const parts = key.split('.');
    let value = this.currentTheme.typography;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  /**
   * Convert points to half-points (DOCX uses half-points for font size)
   * @param {number} pts - Size in points
   * @returns {number} Size in half-points
   */
  toHalfPt(pts) {
    return Math.round(pts * 2);
  }

  /**
   * Convert points to twips (DOCX uses twips for spacing: 1 pt = 20 twips)
   * @param {number} pts - Size in points
   * @returns {number} Size in twips
   */
  toTwips(pts) {
    return Math.round(pts * 20);
  }

  /**
   * Get spacing setting from current theme
   * @param {string} key - Spacing key (e.g., 'list.indent', 'section.marginTop')
   * @returns {number} Spacing value in twips
   */
  getSpacing(key) {
    if (!this.currentTheme) {
      const fallback = {
        'list.indent': 15,
        'list.itemSpacing': 3,
        'section.marginTop': 20,
        'section.marginBottom': 15,
        'paragraph.marginBottom': 5
      };
      return this.toTwips(fallback[key] || 10);
    }

    const parts = key.split('.');
    let value = this.currentTheme.spacing;
    for (const part of parts) {
      value = value?.[part];
    }
    return this.toTwips(value || 0);
  }

  /**
   * Generate DOCX from portfolio data
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
  async generateDOCX(data, options = {}) {
    const {
      sections = ['expertise', 'projects', 'manager', 'career', 'testimonials'],
      filename = 'portfolio.docx',
      title = 'Portfolio',
      author = 'Dongcheol Shin',
      theme = 'professional',
      themeOverrides = {},
      pageBreakBetweenSections = false,
      language = null
    } = options;

    try {
      // Set current language for multilingual support
      this.currentLang = language || this.getLang();

      // Initialize theme
      this.initializeTheme(theme, themeOverrides);

      const doc = this.buildDocument(data, sections, { title, author, pageBreakBetweenSections });
      const blob = await docx.Packer.toBlob(doc);
      saveAs(blob, filename);
      return { success: true, filename };
    } catch (error) {
      console.error('DOCX generation failed:', error);
      throw error;
    }
  }

  /**
   * Build docx document
   */
  buildDocument(data, sections, info) {
    const children = [];
    const { pageBreakBetweenSections = false } = info;

    // Header
    children.push(...this.buildHeader(info));

    // Build each section
    sections.forEach((section, index) => {
      const addPageBreak = pageBreakBetweenSections && index > 0;

      switch (section) {
        case 'expertise':
          if (data.expertise) {
            children.push(...this.buildExpertiseSection(data.expertise, addPageBreak));
          }
          break;
        case 'projects':
          if (data.projects) {
            children.push(...this.buildProjectsSection(data.projects, addPageBreak));
          }
          break;
        case 'career':
          if (data.career) {
            children.push(...this.buildCareerSection(data.career, addPageBreak));
          }
          break;
        case 'testimonials':
          if (data.testimonials) {
            children.push(...this.buildTestimonialsSection(data.testimonials, addPageBreak));
          }
          break;
        case 'manager':
          if (data.manager) {
            children.push(...this.buildManagerSection(data.manager, addPageBreak));
          }
          break;
      }
    });

    return new docx.Document({
      creator: info.author,
      title: info.title,
      description: 'Professional Portfolio Document',
      sections: [{
        properties: {},
        children
      }]
    });
  }

  /**
   * Build document header with enhanced styling
   */
  buildHeader(info) {
    const labels = this.getLabels();
    const locale = this.currentLang === 'ko' ? 'ko-KR' : 'en-US';

    return [
      // Main title with gradient-like color
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: info.author || info.title,
            bold: true,
            size: this.toHalfPt(32),
            color: this.getColor('text.primary')
          })
        ],
        spacing: { after: 80 }
      }),
      // Date
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: new Date().toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            size: this.toHalfPt(11),
            color: this.getColor('text.muted')
          })
        ],
        spacing: { after: 200 }
      }),
      // Enhanced divider with primary color
      new docx.Paragraph({
        children: [new docx.TextRun({ text: '' })],
        border: {
          bottom: {
            color: this.getColor('primary'),
            space: 1,
            style: docx.BorderStyle.SINGLE,
            size: 18  // Thicker border
          }
        },
        spacing: { after: 400 }
      })
    ];
  }

  /**
   * Build expertise section
   * @param {Object} expertise - Expertise data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildExpertiseSection(expertise, addPageBreak = false) {
    const children = [];
    const labels = this.getLabels();

    children.push(...this.createHeading2(labels.expertise, addPageBreak));

    // Categories
    if (expertise.categories && expertise.categories.length > 0) {
      expertise.categories.forEach(category => {
        const tags = this.getArray(category.tags);
        const items = this.getArray(category.items);
        const hasTags = tags.length > 0;
        const hasItems = items.length > 0;

        children.push(this.createHeading3WithKeep(this.getText(category.title) || 'Category', hasItems || hasTags));

        if (hasItems) {
          items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            children.push(new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `• ${this.stripHtml(this.getText(item))}`,
                  size: this.toHalfPt(this.getTypography('fontSize.body')),
                  color: this.getColor('text.secondary')
                })
              ],
              spacing: { after: this.getSpacing('list.itemSpacing') },
              indent: { left: this.getSpacing('list.indent') },
              keepLines: true,
              keepNext: !isLast || hasTags
            }));
          });
        }

        // Handle tags for Technologies category
        if (hasTags) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: tags.map(tag => this.getText(tag)).join(' | '),
                size: this.toHalfPt(this.getTypography('fontSize.small')),
                color: this.getColor('primary')
              })
            ],
            spacing: { after: 100 },
            indent: { left: this.getSpacing('list.indent') },
            keepLines: true
          }));
        }
      });
    }

    // Hero Capabilities
    if (expertise.heroCapabilities && expertise.heroCapabilities.length > 0) {
      children.push(this.createHeading3WithKeep(labels.coreCapabilities, true));

      expertise.heroCapabilities.forEach((cap, index) => {
        const isLast = index === expertise.heroCapabilities.length - 1;
        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `${this.getText(cap.title)}: `,
              bold: true,
              size: this.toHalfPt(this.getTypography('fontSize.body')),
              color: this.getColor('text.primary')
            }),
            new docx.TextRun({
              text: this.getText(cap.description),
              size: this.toHalfPt(this.getTypography('fontSize.body')),
              color: this.getColor('text.secondary')
            })
          ],
          spacing: { after: this.getSpacing('list.itemSpacing') },
          indent: { left: this.getSpacing('list.indent') },
          keepLines: true,
          keepNext: !isLast
        }));
      });
    }

    // Certifications
    if (expertise.certifications && expertise.certifications.length > 0) {
      children.push(this.createHeading3WithKeep(labels.certifications, true));

      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: expertise.certifications.map(cert => this.getText(cert.name)).join(' | '),
            bold: true,
            size: this.toHalfPt(this.getTypography('fontSize.body')),
            color: this.getColor('success')
          })
        ],
        spacing: { after: 150 },
        indent: { left: this.getSpacing('list.indent') },
        keepLines: true
      }));
    }

    return children;
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
    const children = [];
    const labels = this.getLabels();

    children.push(...this.createHeading2(labels.projects, addPageBreak));

    // Featured projects
    if (projects.featured && projects.featured.length > 0) {
      children.push(this.createHeading3(labels.featuredProjects));
      projects.featured.forEach(project => {
        children.push(...this.formatProject(project));
      });
    }

    // Other categories
    const categories = ['medicalImaging', 'orthodontic', 'equipmentControl', 'enterprise', 'openSource'];
    categories.forEach(category => {
      if (projects[category] && projects[category].length > 0) {
        const categoryName = this.formatCategoryName(category);
        children.push(this.createHeading3(categoryName));
        projects[category].forEach(project => {
          children.push(...this.formatProject(project));
        });
      }
    });

    return children;
  }

  /**
   * Format a single project
   */
  formatProject(project) {
    const children = [];
    const labels = this.getLabels();

    // Title with primary color for emphasis
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: this.getText(project.title) || this.getText(project.name) || 'Untitled Project',
          bold: true,
          size: this.toHalfPt(16),
          color: this.getColor('primary')  // Primary color for titles
        })
      ],
      spacing: { before: 280, after: 80, line: 320 },
      keepLines: true,
      keepNext: true
    }));

    // Company and period with distinct colors
    if (project.company || project.period) {
      const metaParts = [];
      if (project.company) {
        metaParts.push(new docx.TextRun({
          text: this.getText(project.company),
          size: this.toHalfPt(10),
          color: this.getColor('text.secondary'),
          bold: true
        }));
      }
      if (project.period) {
        if (project.company) {
          metaParts.push(new docx.TextRun({
            text: ' | ',
            size: this.toHalfPt(10),
            color: this.getColor('text.muted')
          }));
        }
        metaParts.push(new docx.TextRun({
          text: this.formatPeriodWithDuration(project.period),
          size: this.toHalfPt(10),
          color: this.getColor('accent'),  // Accent color for dates
          italics: true
        }));
      }

      children.push(new docx.Paragraph({
        children: metaParts,
        spacing: { after: 120 },
        keepLines: true,
        keepNext: true
      }));
    }

    // Description with improved line height
    if (project.description) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: this.stripHtml(this.getText(project.description)),
            size: this.toHalfPt(11),
            color: this.getColor('text.secondary')
          })
        ],
        spacing: { after: 160, line: 360 },
        keepLines: true,
        keepNext: true
      }));
    }

    // Tags with shading
    const tags = this.getArray(project.tags);
    if (tags.length > 0) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: tags.map(tag => this.getText(tag)).join(' • '),
            size: this.toHalfPt(9),
            color: '3b82f6',  // Primary color
            bold: true,
            shading: {
              type: docx.ShadingType.CLEAR,
              fill: 'f1f5f9'  // Light gray background
            }
          })
        ],
        spacing: { after: 160 },
        keepLines: true,
        keepNext: project.expanded ? true : false
      }));
    }

    // Expanded details with color coding
    if (project.expanded) {
      const roles = this.getArray(project.expanded.roles);
      if (roles.length > 0) {
        // Add separator
        children.push(new docx.Paragraph({
          children: [],
          border: {
            top: {
              color: 'e2e8f0',
              space: 1,
              style: docx.BorderStyle.SINGLE,
              size: 8
            }
          },
          spacing: { before: 80, after: 80 }
        }));

        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: '[ ' + labels.keyResponsibilities + ' ]',
              bold: true,
              size: this.toHalfPt(13),
              color: '3b82f6'  // Primary color
            })
          ],
          spacing: { before: 40, after: 40 },
          keepLines: true,
          keepNext: true
        }));

        const achievements = this.getArray(project.expanded.achievements);
        roles.forEach((role, index) => {
          const isLast = index === roles.length - 1;
          const hasAchievements = achievements.length > 0;
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `• ${this.stripHtml(this.getText(role))}`,
                size: this.toHalfPt(11),
                color: this.getColor('text.secondary')
              })
            ],
            spacing: { after: 50 },
            indent: { left: this.getSpacing('list.indent') },
            keepLines: true,
            keepNext: !isLast || hasAchievements
          }));
        });
      }

      const achievements = this.getArray(project.expanded.achievements);
      if (achievements.length > 0) {
        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: '[ ' + labels.achievements + ' ]',
              bold: true,
              size: this.toHalfPt(13),
              color: '10b981'  // Success color
            })
          ],
          spacing: { before: 60, after: 40 },
          keepLines: true,
          keepNext: true
        }));

        achievements.forEach((achievement, index) => {
          const isLast = index === achievements.length - 1;
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `• ${this.stripHtml(this.getText(achievement))}`,
                size: this.toHalfPt(11),
                color: this.getColor('text.secondary')
              })
            ],
            spacing: { after: 50 },
            indent: { left: this.getSpacing('list.indent') },
            keepLines: true,
            keepNext: !isLast
          }));
        });
      }
    }

    children.push(new docx.Paragraph({ children: [], spacing: { after: 100 } }));

    return children;
  }

  /**
   * Build career section
   * @param {Object} career - Career data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildCareerSection(career, addPageBreak = false) {
    const children = [];
    const labels = this.getLabels();

    children.push(...this.createHeading2(labels.career, addPageBreak));

    if (career.timeline && career.timeline.length > 0) {
      career.timeline.forEach(item => {
        // Determine what content exists for this item
        const hasRole = item.role || item.position;
        const hasCompanyDescription = item.companyDescription;
        const hasResponsibilities = item.responsibilities;
        const hasScale = item.scale && (item.scale.company || item.scale.team);
        const hasLeaveReason = item.leaveReason;
        const hasDescription = item.description;
        const achievements = this.getArray(item.achievements);
        const hasAchievements = achievements.length > 0;
        const hasNote = item.note;
        const tags = this.getArray(item.tags);
        const hasTags = tags.length > 0;

        // Company name with primary color and optional badge
        const companyRuns = [
          new docx.TextRun({
            text: this.getText(item.company) || this.getText(item.title) || '',
            bold: true,
            size: this.toHalfPt(15),
            color: this.getColor('primary')  // Primary color for company
          })
        ];

        if (item.badge) {
          companyRuns.push(new docx.TextRun({
            text: ' [' + this.getText(item.badge) + ']',
            bold: true,
            size: this.toHalfPt(10),
            color: 'f59e0b'  // Warning color
          }));
        }

        companyRuns.push(new docx.TextRun({
          text: `  ${this.formatPeriodWithDuration(item.period) || ''}`,
          size: this.toHalfPt(10),
          color: '3b82f6',  // Primary color for dates
          bold: true
        }));

        children.push(new docx.Paragraph({
          children: companyRuns,
          spacing: { before: 150, after: 50 },
          keepLines: true,
          keepNext: true
        }));

        // Company description
        if (hasCompanyDescription) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: this.stripHtml(this.getText(item.companyDescription)),
                size: this.toHalfPt(this.getTypography('fontSize.body')),
                italics: true,
                color: this.getColor('text.muted')
              })
            ],
            spacing: { after: this.getSpacing('list.itemSpacing') },
            keepLines: true,
            keepNext: true
          }));
        }

        // Role with emphasis
        if (hasRole) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: '> ' + (this.getText(item.role) || this.getText(item.position)),
                size: this.toHalfPt(12),
                color: '0f172a',  // Text primary
                bold: true
              })
            ],
            spacing: { after: this.getSpacing('list.itemSpacing') },
            keepLines: true,
            keepNext: hasResponsibilities || hasScale || hasDescription || hasAchievements || hasNote || hasTags || hasLeaveReason
          }));
        }

        // Responsibilities
        if (hasResponsibilities) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `${labels.responsibilities} `,
                bold: true,
                size: this.toHalfPt(this.getTypography('fontSize.body')),
                color: this.getColor('text.secondary')
              }),
              new docx.TextRun({
                text: this.stripHtml(this.getText(item.responsibilities)),
                size: this.toHalfPt(this.getTypography('fontSize.body')),
                color: this.getColor('text.secondary')
              })
            ],
            spacing: { after: this.getSpacing('list.itemSpacing') },
            keepLines: true,
            keepNext: hasScale || hasDescription || hasAchievements || hasNote || hasTags || hasLeaveReason
          }));
        }

        // Scale (company/team size)
        if (hasScale) {
          const scaleRuns = [];
          if (item.scale.company) {
            scaleRuns.push(new docx.TextRun({
              text: `${labels.companyScale} `,
              bold: true,
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: this.getColor('text.secondary')
            }));
            scaleRuns.push(new docx.TextRun({
              text: this.getText(item.scale.company),
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: this.getColor('text.secondary')
            }));
          }
          if (item.scale.company && item.scale.team) {
            scaleRuns.push(new docx.TextRun({
              text: ' | ',
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: this.getColor('text.muted')
            }));
          }
          if (item.scale.team) {
            scaleRuns.push(new docx.TextRun({
              text: `${labels.teamScale} `,
              bold: true,
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: this.getColor('text.secondary')
            }));
            scaleRuns.push(new docx.TextRun({
              text: this.getText(item.scale.team),
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: this.getColor('text.secondary')
            }));
          }
          children.push(new docx.Paragraph({
            children: scaleRuns,
            spacing: { after: this.getSpacing('list.itemSpacing') },
            keepLines: true,
            keepNext: hasDescription || hasAchievements || hasNote || hasTags || hasLeaveReason
          }));
        }

        // Description
        if (hasDescription) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: this.stripHtml(this.getText(item.description)),
                size: this.toHalfPt(this.getTypography('fontSize.body')),
                color: this.getColor('text.secondary')
              })
            ],
            spacing: { after: this.getSpacing('list.itemSpacing') },
            keepLines: true,
            keepNext: hasAchievements || hasNote || hasTags || hasLeaveReason
          }));
        }

        // Achievements with success color
        if (hasAchievements) {
          // Add achievements label
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: '[ ' + (this.currentLang === 'ko' ? '주요 성과' : 'Key Achievements') + ' ]',
                bold: true,
                size: this.toHalfPt(13),
                color: '10b981'  // Success color
              })
            ],
            spacing: { before: 60, after: 40 },
            keepLines: true,
            keepNext: true
          }));

          achievements.forEach((achievement, index) => {
            const isLast = index === achievements.length - 1;
            children.push(new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `• ${this.stripHtml(this.getText(achievement))}`,
                  size: this.toHalfPt(11),
                  color: this.getColor('text.secondary')
                })
              ],
              spacing: { after: 50 },
              indent: { left: this.getSpacing('list.indent') },
              keepLines: true,
              keepNext: !isLast || hasNote || hasTags || hasLeaveReason
            }));
          });
        }

        // Note
        if (hasNote) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: this.stripHtml(this.getText(item.note)),
                size: this.toHalfPt(this.getTypography('fontSize.small')),
                italics: true,
                color: this.getColor('text.muted')
              })
            ],
            spacing: { after: this.getSpacing('list.itemSpacing') },
            keepLines: true,
            keepNext: hasTags || hasLeaveReason
          }));
        }

        // Leave reason
        if (hasLeaveReason) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `${labels.reasonForLeaving} `,
                bold: true,
                size: this.toHalfPt(this.getTypography('fontSize.small')),
                color: this.getColor('text.muted')
              }),
              new docx.TextRun({
                text: this.stripHtml(this.getText(item.leaveReason)),
                size: this.toHalfPt(this.getTypography('fontSize.small')),
                italics: true,
                color: this.getColor('text.muted')
              })
            ],
            spacing: { after: this.getSpacing('list.itemSpacing') },
            keepLines: true,
            keepNext: hasTags
          }));
        }

        // Tags
        if (hasTags) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: tags.map(tag => this.getText(tag)).join(' | '),
                size: this.toHalfPt(this.getTypography('fontSize.tiny')),
                color: this.getColor('primary')
              })
            ],
            keepLines: true,
            spacing: { after: 80 }
          }));
        }

        children.push(new docx.Paragraph({ children: [], spacing: { after: 100 } }));
      });
    }

    return children;
  }

  /**
   * Build testimonials section
   * @param {Object} testimonials - Testimonials data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildTestimonialsSection(testimonials, addPageBreak = false) {
    const children = [];
    const labels = this.getLabels();

    children.push(...this.createHeading2(labels.testimonials, addPageBreak));

    // Featured testimonial
    if (testimonials.featured) {
      children.push(...this.formatTestimonial(testimonials.featured, true));
    }

    // Other testimonials
    if (testimonials.testimonials && testimonials.testimonials.length > 0) {
      testimonials.testimonials.forEach(testimonial => {
        children.push(...this.formatTestimonial(testimonial, false));
      });
    }

    return children;
  }

  /**
   * Format a single testimonial
   */
  formatTestimonial(testimonial, isFeatured) {
    const children = [];
    const hasLabels = testimonial.labels && testimonial.labels.length > 0;

    // Quote
    if (testimonial.quote || testimonial.text) {
      const quoteText = this.getText(testimonial.quote) || this.getText(testimonial.text);
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `"${this.stripHtml(quoteText)}"`,
            italics: true,
            size: this.toHalfPt(this.getTypography('fontSize.body')),
            color: this.getColor('text.secondary')
          })
        ],
        spacing: { before: 150, after: 80 },
        indent: { left: this.getSpacing('list.indent'), right: this.getSpacing('list.indent') },
        keepLines: true,
        keepNext: true
      }));
    }

    // Author info
    const authorRuns = [];
    if (testimonial.author || testimonial.name) {
      authorRuns.push(new docx.TextRun({
        text: '— ' + (this.getText(testimonial.author) || this.getText(testimonial.name)),
        bold: true,
        size: this.toHalfPt(this.getTypography('fontSize.small')),
        color: this.getColor('text.primary')
      }));
    }
    if (testimonial.role) {
      authorRuns.push(new docx.TextRun({
        text: `, ${this.getText(testimonial.role)}`,
        size: this.toHalfPt(this.getTypography('fontSize.small')),
        color: this.getColor('text.muted')
      }));
    }
    if (testimonial.relation) {
      authorRuns.push(new docx.TextRun({
        text: ` (${this.getText(testimonial.relation)})`,
        size: this.toHalfPt(this.getTypography('fontSize.small')),
        color: this.getColor('text.muted')
      }));
    }

    if (authorRuns.length > 0) {
      children.push(new docx.Paragraph({
        children: authorRuns,
        spacing: { after: 80 },
        indent: { left: this.getSpacing('list.indent') },
        keepLines: true,
        keepNext: hasLabels
      }));
    }

    // Labels
    if (hasLabels) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: testimonial.labels.map(l => this.getText(l.text)).join(' | '),
            size: this.toHalfPt(this.getTypography('fontSize.tiny')),
            color: this.getColor('primary')
          })
        ],
        spacing: { after: 150 },
        indent: { left: this.getSpacing('list.indent') },
        keepLines: true
      }));
    }

    return children;
  }

  /**
   * Build manager/leadership section
   * @param {Object} manager - Manager data
   * @param {boolean} addPageBreak - Whether to add page break before section
   */
  buildManagerSection(manager, addPageBreak = false) {
    const children = [];
    const labels = this.getLabels();

    children.push(...this.createHeading2(labels.manager, addPageBreak));

    // PM Capabilities
    if (manager.pmCapabilities && manager.pmCapabilities.length > 0) {
      children.push(this.createHeading3WithKeep(labels.pmCapabilities, true));

      manager.pmCapabilities.forEach((cap, index) => {
        const isLast = index === manager.pmCapabilities.length - 1;
        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: this.getText(cap.title),
              bold: true,
              size: this.toHalfPt(this.getTypography('fontSize.body')),
              color: this.getColor('text.primary')
            })
          ],
          spacing: { before: 100, after: 30 },
          keepLines: true,
          keepNext: true
        }));

        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: this.getText(cap.description),
              size: this.toHalfPt(this.getTypography('fontSize.body')),
              color: this.getColor('text.secondary')
            })
          ],
          spacing: { after: 80 },
          indent: { left: this.getSpacing('list.indent') },
          keepLines: true,
          keepNext: !isLast
        }));
      });
    }

    // Leadership Style
    if (manager.leadershipStyle) {
      const principles = this.getArray(manager.leadershipStyle.principles);
      if (principles.length > 0) {
        children.push(this.createHeading3WithKeep(labels.leadershipStyle, true));

        principles.forEach((principle, index) => {
          const isLast = index === principles.length - 1;
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `• ${this.stripHtml(this.getText(principle))}`,
                size: this.toHalfPt(this.getTypography('fontSize.body')),
                color: this.getColor('text.secondary')
              })
            ],
            spacing: { after: this.getSpacing('list.itemSpacing') },
            indent: { left: this.getSpacing('list.indent') },
            keepLines: true,
            keepNext: !isLast
          }));
        });
      }
    }

    // Business Impact
    if (manager.businessImpact) {
      const highlights = this.getArray(manager.businessImpact.highlights);
      if (highlights.length > 0) {
        children.push(this.createHeading3WithKeep(labels.businessImpact, true));

        highlights.forEach((highlight, index) => {
          const isLast = index === highlights.length - 1;
          const hasKeyNumbers = manager.businessImpact.keyNumbers && isLast;
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `• ${this.stripHtml(this.getText(highlight))}`,
                size: this.toHalfPt(this.getTypography('fontSize.body')),
                color: this.getColor('text.secondary')
              })
            ],
            spacing: { after: this.getSpacing('list.itemSpacing') },
            indent: { left: this.getSpacing('list.indent') },
            keepLines: true,
            keepNext: !isLast || hasKeyNumbers
          }));
        });

        // Key numbers
        if (manager.businessImpact.keyNumbers) {
          const kn = manager.businessImpact.keyNumbers;
          const keyNumbersText = [];
          if (kn.certifications) keyNumbersText.push(`${this.currentLang === 'ko' ? '인증' : 'Certifications'}: ${kn.certifications}`);
          if (kn.ipos) keyNumbersText.push(`IPO: ${kn.ipos}`);
          if (kn.performanceImprovement) keyNumbersText.push(`${this.currentLang === 'ko' ? '성능 향상' : 'Performance'}: ${kn.performanceImprovement}`);
          if (kn.projectsDelivered) keyNumbersText.push(`${this.currentLang === 'ko' ? '프로젝트' : 'Projects'}: ${kn.projectsDelivered}`);

          if (keyNumbersText.length > 0) {
            children.push(new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: keyNumbersText.join('  |  '),
                  bold: true,
                  size: this.toHalfPt(this.getTypography('fontSize.small')),
                  color: this.getColor('primary')
                })
              ],
              spacing: { before: 60, after: 100 },
              indent: { left: this.getSpacing('list.indent') },
              keepLines: true
            }));
          }
        }
      }
    }

    // Soft Skills
    if (manager.softSkills && manager.softSkills.length > 0) {
      children.push(this.createHeading3WithKeep(labels.softSkills, true));

      const skillsRuns = [];
      manager.softSkills.forEach((skill, index) => {
        const levelDots = '●'.repeat(skill.level || 0) + '○'.repeat(5 - (skill.level || 0));
        if (index > 0) {
          skillsRuns.push(new docx.TextRun({
            text: '  |  ',
            size: this.toHalfPt(this.getTypography('fontSize.small')),
            color: this.getColor('text.muted')
          }));
        }
        skillsRuns.push(new docx.TextRun({
          text: `${this.getText(skill.title)} ${levelDots}`,
          size: this.toHalfPt(this.getTypography('fontSize.small')),
          color: this.getColor('text.secondary')
        }));
      });

      children.push(new docx.Paragraph({
        children: skillsRuns,
        spacing: { after: 100 },
        indent: { left: this.getSpacing('list.indent') },
        keepLines: true
      }));
    }

    return children;
  }

  /**
   * Create heading 2 with enhanced styling
   * @param {string} text - Heading text
   * @param {boolean} pageBreakBefore - Whether to add page break before heading
   */
  createHeading2(text, pageBreakBefore = false) {
    return [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text,
            bold: true,
            size: this.toHalfPt(20),
            color: this.getColor('primary')
          })
        ],
        spacing: {
          before: pageBreakBefore ? 0 : 480,
          after: 120,
          line: 320
        },
        pageBreakBefore
      }),
      // Add divider line
      new docx.Paragraph({
        children: [new docx.TextRun({ text: '' })],
        border: {
          bottom: {
            color: this.getColor('primary'),
            space: 1,
            style: docx.BorderStyle.SINGLE,
            size: 18
          }
        },
        spacing: {
          after: 240
        }
      })
    ];
  }

  /**
   * Create heading 3 with enhanced styling
   */
  createHeading3(text) {
    return new docx.Paragraph({
      children: [
        new docx.TextRun({
          text,
          bold: true,
          size: this.toHalfPt(16),
          color: this.getColor('accent')
        })
      ],
      spacing: {
        before: 360,
        after: 160,
        line: 320
      }
    });
  }

  /**
   * Create heading 3 with keepNext option
   * @param {string} text - Heading text
   * @param {boolean} keepNext - Whether to keep with next paragraph
   */
  createHeading3WithKeep(text, keepNext = true) {
    return new docx.Paragraph({
      children: [
        new docx.TextRun({
          text,
          bold: true,
          size: this.toHalfPt(this.getTypography('fontSize.h3')),
          color: this.getColor('text.secondary')
        })
      ],
      spacing: { before: 250, after: 120 },
      keepLines: true,
      keepNext
    });
  }

  /**
   * Create table cell
   */
  createTableCell(text, isHeader = false) {
    return new docx.TableCell({
      children: [
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: text || '',
              bold: isHeader,
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: isHeader ? this.getColor('text.primary') : this.getColor('text.secondary')
            })
          ]
        })
      ],
      shading: isHeader ? { fill: this.getColor('background.table') } : undefined,
      margins: {
        top: 80,
        bottom: 80,
        left: 120,
        right: 120
      }
    });
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
   * Check if docx.js is available
   */
  isAvailable() {
    return typeof docx !== 'undefined' && typeof saveAs !== 'undefined';
  }
}

// Export singleton instance
window.DOCXExporter = new DOCXExporter();
