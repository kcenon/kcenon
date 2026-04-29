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
  initializeTheme(themeId = 'executive', overrides = {}) {
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
   * Enhanced to match web design more closely with gradient-like colors
   * @returns {Object} Default DOCX styles
   */
  getFallbackStyles() {
    return {
      heading1: {
        run: { size: 56, bold: true, color: '3b82f6' },  // Primary blue for main header
        paragraph: { spacing: { after: 240, line: 300 } }
      },
      heading2: {
        run: { size: 40, bold: true, color: '3b82f6' },  // Primary blue for section headers
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
      // Executive navy + gold palette (matches executiveTheme in theme-config)
      const fallbackColors = {
        'primary': '1E3A5F',
        'primary.hover': '0F2A4F',
        'primary.light': 'E2E8F0',
        'secondary': 'B8860B',
        'accent': 'B8860B',

        'gradient.start': '1E3A5F',
        'gradient.end': '0F2A4F',

        'text.primary': '1E293B',
        'text.secondary': '475569',
        'text.muted': '94A3B8',

        'background.page': 'FFFFFF',
        'background.primary': 'FFFFFF',
        'background.secondary': 'F8FAFC',
        'background.tertiary': 'F1F5F9',
        'background.section': 'F8FAFC',
        'background.card': 'FFFFFF',
        'background.table': 'F1F5F9',

        'border': 'CBD5E1',
        'border.hover': '94A3B8',

        'success': '0E7C66',
        'warning': 'B8860B',
        'error': 'B91C1C',
        'info': '1E3A5F'
      };
      // Theme-config stores hex without leading '#'. Normalize callers
      // that pass either case-style — return uppercase consistent palette.
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
      theme = 'executive',
      themeOverrides = {},
      includeCoverLetter = false,
      includeCoverPage = true,
      pageBreakBetweenSections = true,
      language = null
    } = options;

    try {
      // Set current language for multilingual support
      this.currentLang = language || this.getLang();

      // Resolve author / title based on language unless caller passed
      // an explicit value. Korean exports use the Korean rendering of
      // the author's name on the cover and footer.
      const author = options.author
        || (this.currentLang === 'ko' ? '신동철' : 'Dongcheol Shin');
      const title = options.title
        || (this.currentLang === 'ko' ? '포트폴리오' : 'Portfolio');

      // Initialize theme
      this.initializeTheme(theme, themeOverrides);

      // Load cover letter if requested
      let coverLetterTemplate = null;
      if (includeCoverLetter) {
        coverLetterTemplate = this.loadCoverLetterTemplate();
      }

      const doc = this.buildDocument(data, sections, {
        title, author, includeCoverLetter, coverLetterTemplate,
        includeCoverPage, pageBreakBetweenSections
      });
      const blob = await docx.Packer.toBlob(doc);
      saveAs(blob, filename);
      return { success: true, filename };
    } catch (error) {
      console.error('DOCX generation failed:', error);
      throw error;
    }
  }

  /**
   * Load cover letter template from selected template ID
   */
  loadCoverLetterTemplate() {
    try {
      // 1. Optional getters (parent or same window)
      if (window.parent && typeof window.parent.getCoverLetterTemplate === 'function') {
        const t = window.parent.getCoverLetterTemplate();
        if (t) return t;
      }
      if (typeof window.getCoverLetterTemplate === 'function') {
        const t = window.getCoverLetterTemplate();
        if (t) return t;
      }

      // 2. Honor the user's selection persisted in localStorage by admin.js
      if (window.PortfolioData && window.PortfolioData.coverLetter) {
        const templates = window.PortfolioData.coverLetter.templates || [];
        if (templates.length === 0) return null;
        const selectedId = (typeof localStorage !== 'undefined')
          ? localStorage.getItem('cover-letter-template-id')
          : null;
        if (selectedId) {
          const found = templates.find(t => t.id === selectedId);
          if (found) return found;
        }
        // 3. Fallback: first template only when nothing was selected
        return templates[0];
      }

      console.warn('Cover letter template not found');
      return null;
    } catch (error) {
      console.warn('Failed to load cover letter template:', error);
      return null;
    }
  }

  /**
   * Build docx document
   */
  buildDocument(data, sections, info) {
    const children = [];
    const {
      includeCoverLetter = false,
      coverLetterTemplate = null,
      includeCoverPage = true,
      pageBreakBetweenSections = true
    } = info;

    // Cover page (hero + stats infographic)
    if (includeCoverPage) {
      children.push(...this.buildCoverPage(info, data));
    }

    // Cover letter (if included)
    if (includeCoverLetter && coverLetterTemplate) {
      children.push(new docx.Paragraph({ children: [], pageBreakBefore: true }));
      children.push(...this.buildCoverLetterPage(coverLetterTemplate));
    }

    // Inline header (only when no cover page)
    if (!includeCoverPage) {
      children.push(...this.buildHeader(info));
    }

    // Build each section. With cover page (or cover letter), every section
    // header begins a new page; otherwise only break between sections.
    const headPlaced = includeCoverPage || includeCoverLetter;
    sections.forEach((section, index) => {
      const addPageBreak = headPlaced
        ? true
        : (pageBreakBetweenSections && index > 0);

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

    const sectionConfig = {
      properties: includeCoverPage ? { titlePage: true } : {},
      footers: {
        default: this.buildPageFooter(info)
      },
      children
    };

    // Suppress footer on the cover page (first page) when cover is enabled
    if (includeCoverPage) {
      sectionConfig.footers.first = new docx.Footer({
        children: [new docx.Paragraph({ children: [new docx.TextRun({ text: '' })] })]
      });
    }

    return new docx.Document({
      creator: info.author,
      title: info.title,
      description: 'Professional Portfolio Document',
      sections: [sectionConfig]
    });
  }

  /**
   * Build cover letter page for DOCX
   * @param {Object} template - Cover letter template object
   * @returns {Array} docx Paragraph array for cover letter
   */
  buildCoverLetterPage(template) {
    const children = [];

    // Greeting
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: this.getText(template.greeting),
        size: this.toHalfPt(this.getTypography('fontSize.body'))
      })],
      spacing: { after: this.getSpacing('section.gap') * 20 }
    }));

    // Opening paragraph
    const position = this.getText(template.targetRole);
    const opening = this.getText(template.opening).replace('{position}', position);
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: opening,
        size: this.toHalfPt(this.getTypography('fontSize.body'))
      })],
      alignment: docx.AlignmentType.JUSTIFIED,
      spacing: { after: this.getSpacing('section.gap') * 20 }
    }));

    // Key points
    const keyPoints = this.getArray(template.keyPoints);
    keyPoints.forEach(point => {
      const text = this.getText(point);
      // Parse **bold** text
      const parts = text.split(/\*\*(.+?)\*\*/g);
      const runs = parts.map((part, index) => {
        if (index % 2 === 1) {
          // Odd indices are inside **...**
          return new docx.TextRun({
            text: part,
            bold: true,
            color: this.getColor('primary'),
            size: this.toHalfPt(this.getTypography('fontSize.body'))
          });
        }
        return new docx.TextRun({
          text: part,
          size: this.toHalfPt(this.getTypography('fontSize.body'))
        });
      });

      children.push(new docx.Paragraph({
        children: runs,
        bullet: { level: 0 },
        spacing: { after: this.getSpacing('list.itemGap') * 20 }
      }));
    });

    // Add spacing after bullet list
    children.push(new docx.Paragraph({
      text: '',
      spacing: { after: this.getSpacing('section.gap') * 10 }
    }));

    // Closing paragraph
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: this.getText(template.closing),
        size: this.toHalfPt(this.getTypography('fontSize.body'))
      })],
      alignment: docx.AlignmentType.JUSTIFIED,
      spacing: { after: this.getSpacing('section.gap') * 30 }
    }));

    // Signature
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: this.getText(template.signature),
        size: this.toHalfPt(this.getTypography('fontSize.body'))
      })],
      spacing: { after: 0 }
    }));

    return children;
  }

  /**
   * Build cover page paragraphs (hero + stats infographic).
   * The caller is responsible for placing this at the start of the document
   * and ensuring the next heading uses pageBreakBefore.
   * @param {Object} info - Document info
   * @param {Object} data - Portfolio data
   * @returns {Array<docx.Paragraph|docx.Table>} children for the cover page
   */
  buildCoverPage(info, data) {
    const children = [];
    const lang = this.currentLang;
    const subtitle = lang === 'ko'
      ? 'CTO · 연구소장 · 플랫폼 아키텍트'
      : 'CTO · Research Director · Platform Architect';
    const summaryLines = lang === 'ko'
      ? [
          '안전 중요·ISO 인증 도메인에서 R&D와 플랫폼을 20년 넘게 이끌어 왔습니다.',
          '4개국 의료기기 인증, 2회 IPO, 3–11명 다언어 R&D 팀 리딩 경험.',
          '규제 SDLC(IEC 62304 / ISO 13485)를 ISO 26262·DO-178C·IEC 61508로 이전 가능.'
        ]
      : [
          '20+ years leading R&D and platform architecture in safety-critical, ISO-certified domains.',
          '4 international approvals, 2 IPOs, 3–11 person multi-language R&D team leadership.',
          'Regulated SDLC (IEC 62304 / ISO 13485) transferable to ISO 26262, DO-178C, IEC 61508.'
        ];

    // Top accent rule — short bold mark above the name (executive editorial style).
    // Implemented as a 1-cell left-anchored table so the rule does not span full width.
    children.push(new docx.Table({
      rows: [new docx.TableRow({
        children: [new docx.TableCell({
          children: [new docx.Paragraph({ children: [new docx.TextRun({ text: '' })] })],
          shading: { type: docx.ShadingType.CLEAR, fill: this.getColor('primary') },
          width: { size: 1200, type: docx.WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 0, right: 0 },
          borders: {
            top: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            left: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' }
          }
        })]
      })],
      width: { size: 1200, type: docx.WidthType.DXA },
      borders: {
        top: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' }
      }
    }));
    children.push(new docx.Paragraph({ children: [], spacing: { after: 600 } }));

    // Name — 32pt per Microsoft Word resume guide (28–35pt range)
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: info.author || info.title,
        bold: true,
        size: this.toHalfPt(32),
        color: this.getColor('text.primary')
      })],
      spacing: { after: 140 }
    }));

    // Subtitle / role line
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: subtitle,
        bold: true,
        size: this.toHalfPt(12),
        color: this.getColor('primary'),
        characterSpacing: 30
      })],
      spacing: { after: 360 }
    }));

    // Executive summary — 3-line P&L / team-size / impact synthesis (HBS pattern)
    summaryLines.forEach((line, i) => {
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({
          text: line,
          size: this.toHalfPt(10.5),
          color: this.getColor('text.secondary')
        })],
        spacing: {
          after: i === summaryLines.length - 1 ? 480 : 80,
          line: 320
        }
      }));
    });

    // Divider
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: '' })],
      border: {
        bottom: {
          color: this.getColor('border'),
          size: 6, space: 1, style: docx.BorderStyle.SINGLE
        }
      },
      spacing: { after: 360 }
    }));

    // Stats table infographic
    const statsTable = this.buildStatsTable(data);
    if (statsTable) {
      children.push(statsTable);
      children.push(new docx.Paragraph({ children: [], spacing: { after: 360 } }));
    }

    // Certifications row
    if (data?.expertise?.certifications?.length > 0) {
      const certText = data.expertise.certifications
        .map(c => this.getText(c.name)).join('  ·  ');
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({
          text: lang === 'ko' ? '인증 / Certifications' : 'Certifications',
          bold: true,
          size: this.toHalfPt(9),
          color: this.getColor('text.muted')
        })],
        spacing: { before: 200, after: 80 }
      }));
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({
          text: certText,
          bold: true,
          size: this.toHalfPt(11),
          color: this.getColor('success')
        })],
        spacing: { after: 0 }
      }));
    }

    return children;
  }

  /**
   * Build a 4-column stats infographic table for the cover page
   * @param {Object} data - Portfolio data
   * @returns {docx.Table|null} stats table or null when no data
   */
  buildStatsTable(data) {
    const lang = this.currentLang;
    const kn = data?.manager?.businessImpact?.keyNumbers || {};
    const certCount = data?.expertise?.certifications?.length || kn.certifications;
    const stats = [];

    stats.push({ value: '20+', label: lang === 'ko' ? '경력 (년)' : 'Years' });
    if (certCount) stats.push({ value: String(certCount), label: lang === 'ko' ? '글로벌 인증' : 'Certifications' });
    if (kn.ipos) stats.push({ value: String(kn.ipos), label: 'IPO' });
    if (kn.performanceImprovement) stats.push({ value: String(kn.performanceImprovement), label: lang === 'ko' ? '성능 향상' : 'Performance' });
    if (kn.projectsDelivered && stats.length < 4) {
      stats.push({ value: String(kn.projectsDelivered), label: lang === 'ko' ? '프로젝트' : 'Projects' });
    }

    const finalStats = stats.slice(0, 4);
    if (finalStats.length === 0) return null;

    const totalWidth = 9000;
    const colWidth = Math.floor(totalWidth / finalStats.length);
    const primaryFill = this.getColor('primary');

    const valueCells = finalStats.map(s => new docx.TableCell({
      children: [new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [new docx.TextRun({
          text: s.value, bold: true,
          size: this.toHalfPt(28), color: 'FFFFFF'
        })],
        spacing: { before: 200, after: 120 }
      })],
      shading: { type: docx.ShadingType.CLEAR, fill: primaryFill },
      margins: { top: 80, bottom: 80, left: 80, right: 80 },
      width: { size: colWidth, type: docx.WidthType.DXA }
    }));

    const labelCells = finalStats.map(s => new docx.TableCell({
      children: [new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [new docx.TextRun({
          text: s.label,
          size: this.toHalfPt(10),
          color: this.getColor('text.secondary')
        })],
        spacing: { before: 100, after: 100 }
      })],
      shading: { type: docx.ShadingType.CLEAR, fill: 'F1F5F9' },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      width: { size: colWidth, type: docx.WidthType.DXA }
    }));

    return new docx.Table({
      rows: [
        new docx.TableRow({ children: valueCells }),
        new docx.TableRow({ children: labelCells })
      ],
      width: { size: totalWidth, type: docx.WidthType.DXA },
      columnWidths: Array(finalStats.length).fill(colWidth),
      borders: {
        top: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 24, color: 'FFFFFF' },
        insideVertical: { style: docx.BorderStyle.SINGLE, size: 24, color: 'FFFFFF' }
      }
    });
  }

  /**
   * Build the page footer with author + page numbers (default footer).
   * First-page footer is a separate empty footer to keep the cover clean.
   * @param {Object} info - Document info
   * @returns {docx.Footer}
   */
  buildPageFooter(info) {
    const author = info.author || 'Portfolio';
    return new docx.Footer({
      children: [
        new docx.Paragraph({
          children: [new docx.TextRun({ text: '' })],
          border: {
            top: {
              color: 'E2E8F0',
              size: 4, space: 1, style: docx.BorderStyle.SINGLE
            }
          },
          spacing: { after: 80 }
        }),
        new docx.Paragraph({
          tabStops: [{ type: docx.TabStopType.RIGHT, position: 9000 }],
          children: [
            new docx.TextRun({
              text: author,
              size: this.toHalfPt(8),
              color: this.getColor('text.muted')
            }),
            new docx.TextRun({ text: '\t', size: this.toHalfPt(8) }),
            new docx.TextRun({
              children: [docx.PageNumber.CURRENT],
              size: this.toHalfPt(8), bold: true,
              color: this.getColor('primary')
            }),
            new docx.TextRun({
              text: ' / ',
              size: this.toHalfPt(8),
              color: this.getColor('text.muted')
            }),
            new docx.TextRun({
              children: [docx.PageNumber.TOTAL_PAGES],
              size: this.toHalfPt(8),
              color: this.getColor('text.muted')
            })
          ]
        })
      ]
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
      // Enhanced divider with primary color matching web design
      new docx.Paragraph({
        children: [new docx.TextRun({ text: '' })],
        border: {
          bottom: {
            color: this.getColor('primary'),
            space: 1,
            style: docx.BorderStyle.SINGLE,
            size: 24  // Thicker border for web-like emphasis
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
                  text: `${this.stripHtml(this.getText(item))}`,
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

        // Handle tags for Technologies category with web-like styling
        if (hasTags) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: tags.map(tag => this.getText(tag)).join(' | '),
                size: this.toHalfPt(this.getTypography('fontSize.small') + 1),  // Slightly larger
                color: this.getColor('primary'),
                bold: true,
                shading: {
                  type: docx.ShadingType.CLEAR,
                  fill: 'dbeafe'  // Light blue background matching web accent-light
                }
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

    // Certifications with enhanced web-like styling
    if (expertise.certifications && expertise.certifications.length > 0) {
      children.push(this.createHeading3WithKeep(labels.certifications, true));

      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: expertise.certifications.map(cert => this.getText(cert.name)).join(' | '),
            bold: true,
            size: this.toHalfPt(this.getTypography('fontSize.body') + 1),
            color: this.getColor('success'),  // Success green matching web
            shading: {
              type: docx.ShadingType.CLEAR,
              fill: 'd1fae5'  // Light green background
            }
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

    // Each category that has projects starts on a new page for readability.
    // The very first category sits on the same page as the PROJECTS header.
    let firstCategory = true;

    if (projects.featured && projects.featured.length > 0) {
      children.push(this.createHeading3(labels.featuredProjects, !firstCategory));
      firstCategory = false;
      projects.featured.forEach(project => {
        children.push(...this.formatProject(project));
      });
    }

    const categories = ['medicalImaging', 'orthodontic', 'equipmentControl', 'enterprise', 'openSource'];
    categories.forEach(category => {
      if (projects[category] && projects[category].length > 0) {
        const categoryName = this.formatCategoryName(category);
        children.push(this.createHeading3(categoryName, !firstCategory));
        firstCategory = false;
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

    // Tags with enhanced web-like shading
    const tags = this.getArray(project.tags);
    if (tags.length > 0) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: tags.map(tag => this.getText(tag)).join(' • '),
            size: this.toHalfPt(10),  // Slightly larger for readability
            color: '3b82f6',  // Primary blue matching web
            bold: true,
            shading: {
              type: docx.ShadingType.CLEAR,
              fill: 'dbeafe'  // Light blue background matching web accent-light
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
        // Add enhanced separator with web-like styling
        children.push(new docx.Paragraph({
          children: [],
          border: {
            top: {
              color: 'cbd5e1',  // Slightly darker border matching web border-hover
              space: 1,
              style: docx.BorderStyle.SINGLE,
              size: 12  // Thicker for better visibility
            }
          },
          spacing: { before: 80, after: 80 }
        }));

        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: '[ ' + labels.keyResponsibilities + ' ]',
              bold: true,
              size: this.toHalfPt(14),  // Slightly larger
              color: '3b82f6',  // Primary blue matching web
              shading: {
                type: docx.ShadingType.CLEAR,
                fill: 'eff6ff'  // Light blue background
              }
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
                text: `${this.stripHtml(this.getText(role))}`,
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
              size: this.toHalfPt(14),  // Slightly larger
              color: '10b981',  // Success green matching web
              shading: {
                type: docx.ShadingType.CLEAR,
                fill: 'd1fae5'  // Light green background
              }
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
                text: `${this.stripHtml(this.getText(achievement))}`,
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

    // Wider trailing spacer so each project reads as its own block
    // rather than blending into the next.
    children.push(new docx.Paragraph({ children: [], spacing: { after: 320 } }));

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
          // Add achievements label with enhanced web-like styling
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: '[ ' + (this.currentLang === 'ko' ? '주요 성과' : 'Key Achievements') + ' ]',
                bold: true,
                size: this.toHalfPt(14),  // Slightly larger
                color: '10b981',  // Success green matching web
                shading: {
                  type: docx.ShadingType.CLEAR,
                  fill: 'd1fae5'  // Light green background
                }
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
                  text: `${this.stripHtml(this.getText(achievement))}`,
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

    // Build a flat list with a spacer + thin centered rule between
    // adjacent testimonials so each block reads as its own card.
    const ordered = [];
    if (testimonials.featured) ordered.push({ t: testimonials.featured, featured: true });
    if (testimonials.testimonials && testimonials.testimonials.length > 0) {
      testimonials.testimonials.forEach(t => ordered.push({ t, featured: false }));
    }

    ordered.forEach(({ t, featured }, idx) => {
      if (idx > 0) {
        children.push(new docx.Paragraph({
          children: [new docx.TextRun({ text: '' })],
          alignment: docx.AlignmentType.CENTER,
          border: {
            bottom: {
              color: this.getColor('border'),
              size: 4,
              space: 1,
              style: docx.BorderStyle.SINGLE
            }
          },
          spacing: { before: 100, after: 140 },
          indent: { left: 2400, right: 2400 }
        }));
      }
      children.push(...this.formatTestimonial(t, featured));
    });

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

    const lang = this.currentLang;
    const accentHex = this.getColor('accent');
    const primaryHex = this.getColor('primary');
    const secondaryHex = this.getColor('text.secondary');
    const mutedHex = this.getColor('text.muted');

    // ── PM Capabilities — title + description + highlights + metrics ────
    if (manager.pmCapabilities && manager.pmCapabilities.length > 0) {
      children.push(this.createHeading3(labels.pmCapabilities, false));

      manager.pmCapabilities.forEach((cap, idx) => {
        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({ text: '◆  ', bold: true, size: this.toHalfPt(12), color: accentHex }),
            new docx.TextRun({ text: this.getText(cap.title), bold: true, size: this.toHalfPt(12), color: primaryHex })
          ],
          spacing: { before: idx === 0 ? 0 : 240, after: 80 },
          keepLines: true, keepNext: true
        }));

        if (cap.description) {
          children.push(new docx.Paragraph({
            children: [new docx.TextRun({
              text: this.getText(cap.description),
              italics: true, size: this.toHalfPt(10.5), color: secondaryHex
            })],
            spacing: { after: 100, line: 300 },
            indent: { left: 240 },
            keepLines: true, keepNext: true
          }));
        }

        const highlights = this.getArray(cap.highlights);
        highlights.forEach(h => {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '·  ', bold: true, color: accentHex, size: this.toHalfPt(10.5) }),
              new docx.TextRun({ text: this.stripHtml(this.getText(h)), size: this.toHalfPt(10.5), color: secondaryHex })
            ],
            spacing: { after: 60, line: 300 },
            indent: { left: 240 },
            keepLines: true
          }));
        });

        const m = cap.metrics || {};
        const chips = [];
        if (Array.isArray(m.teamSizes) && m.teamSizes.length > 0) {
          const min = Math.min(...m.teamSizes), max = Math.max(...m.teamSizes);
          chips.push(`${lang === 'ko' ? '팀 규모' : 'Team Size'} ${min}–${max}`);
        }
        if (m.yearsLeading) chips.push(`${lang === 'ko' ? '리딩 연차' : 'Leading'} ${m.yearsLeading}+ ${lang === 'ko' ? '년' : 'yrs'}`);
        if (m.projectsLed) chips.push(`${lang === 'ko' ? '리딩 프로젝트' : 'Projects Led'} ${m.projectsLed}+`);
        if (m.onTimeDelivery) chips.push(`${lang === 'ko' ? '정시 납품' : 'On-Time'} ${m.onTimeDelivery}`);
        if (m.certificationSuccess) chips.push(`${lang === 'ko' ? '인증 성공률' : 'Cert Success'} ${m.certificationSuccess}`);
        if (m.majorProjects) chips.push(`${lang === 'ko' ? '주요 프로젝트' : 'Major Projects'} ${m.majorProjects}+`);

        if (chips.length > 0) {
          children.push(new docx.Paragraph({
            children: [new docx.TextRun({
              text: chips.join('   ·   '),
              bold: true, size: this.toHalfPt(9), color: accentHex
            })],
            spacing: { before: 60, after: 80 },
            indent: { left: 240 }
          }));
        }

        const tags = this.getArray(cap.stakeholderTypes).concat(cap.frameworks || []);
        if (tags.length > 0) {
          children.push(new docx.Paragraph({
            children: [new docx.TextRun({
              text: tags.map(t => this.getText(t)).join(' · '),
              size: this.toHalfPt(9), color: mutedHex
            })],
            spacing: { after: 80 },
            indent: { left: 240 }
          }));
        }
      });
    }

    // ── Leadership Style ───────────────────────────────────
    if (manager.leadershipStyle) {
      const principles = this.getArray(manager.leadershipStyle.principles);
      if (principles.length > 0) {
        children.push(this.createHeading3(labels.leadershipStyle, false));

        principles.forEach(principle => {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '·  ', bold: true, color: accentHex, size: this.toHalfPt(10.5) }),
              new docx.TextRun({
                text: this.stripHtml(this.getText(principle)),
                size: this.toHalfPt(10.5), color: secondaryHex
              })
            ],
            spacing: { after: 60, line: 300 },
            indent: { left: 240 },
            keepLines: true
          }));
        });
      }
    }

    // ── Business Impact ────────────────────────────────────
    // keyNumbers omitted — already shown on the cover-page stat infographic.
    if (manager.businessImpact) {
      const highlights = this.getArray(manager.businessImpact.highlights);
      if (highlights.length > 0) {
        children.push(this.createHeading3(labels.businessImpact, false));

        highlights.forEach(h => {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '·  ', bold: true, color: this.getColor('success'), size: this.toHalfPt(10.5) }),
              new docx.TextRun({
                text: this.stripHtml(this.getText(h)),
                size: this.toHalfPt(10.5), color: secondaryHex
              })
            ],
            spacing: { after: 60, line: 300 },
            indent: { left: 240 },
            keepLines: true
          }));
        });
      }
    }

    // ── Soft Skills — 2-column descriptive grid ───────────
    if (manager.softSkills && manager.softSkills.length > 0) {
      children.push(this.createHeading3(labels.softSkills, false));

      const totalWidth = 9000;
      const colWidth = Math.floor(totalWidth / 2);

      const buildSkillCell = (skill) => new docx.TableCell({
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: '◆  ', bold: true, size: this.toHalfPt(11), color: accentHex }),
              new docx.TextRun({
                text: this.getText(skill.title),
                bold: true, size: this.toHalfPt(11.5), color: primaryHex
              })
            ],
            spacing: { after: 100 }
          }),
          ...(skill.description ? [new docx.Paragraph({
            children: [new docx.TextRun({
              text: this.getText(skill.description),
              size: this.toHalfPt(9.5), color: secondaryHex
            })],
            spacing: { after: 0, line: 280 },
            indent: { left: 240 }
          })] : [])
        ],
        width: { size: colWidth, type: docx.WidthType.DXA },
        margins: { top: 160, bottom: 200, left: 200, right: 200 },
        borders: {
          top: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          bottom: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          left: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' }
        }
      });

      const emptyCell = () => new docx.TableCell({
        children: [new docx.Paragraph({ children: [new docx.TextRun({ text: '' })] })],
        width: { size: colWidth, type: docx.WidthType.DXA },
        borders: {
          top: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          bottom: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          left: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' }
        }
      });

      const rows = [];
      for (let i = 0; i < manager.softSkills.length; i += 2) {
        const rowCells = manager.softSkills.slice(i, i + 2).map(buildSkillCell);
        while (rowCells.length < 2) rowCells.push(emptyCell());
        rows.push(new docx.TableRow({ children: rowCells }));
      }

      children.push(new docx.Table({
        rows,
        width: { size: totalWidth, type: docx.WidthType.DXA },
        columnWidths: [colWidth, colWidth],
        borders: {
          top: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          bottom: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          left: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideHorizontal: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideVertical: { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' }
        }
      }));
      children.push(new docx.Paragraph({ children: [], spacing: { after: 160 } }));
    }

    return children;
  }

  /**
   * Create heading 2 with enhanced styling
   * @param {string} text - Heading text
   * @param {boolean} pageBreakBefore - Whether to add page break before heading
   */
  createHeading2(text, pageBreakBefore = false) {
    const upperText = (text || '').toString().toUpperCase();
    return [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: upperText,
            bold: true,
            size: this.toHalfPt(13),
            color: this.getColor('primary'),
            characterSpacing: 60
          })
        ],
        spacing: {
          before: pageBreakBefore ? 0 : 480,
          after: 320,
          line: 280
        },
        pageBreakBefore,
        border: {
          bottom: {
            color: this.getColor('primary'),
            space: 6,
            style: docx.BorderStyle.SINGLE,
            size: 12
          }
        }
      })
    ];
  }

  /**
   * Create heading 3 with enhanced styling
   */
  createHeading3(text, pageBreakBefore = false) {
    return new docx.Paragraph({
      children: [
        new docx.TextRun({
          text,
          bold: true,
          size: this.toHalfPt(14),
          color: this.getColor('primary')
        })
      ],
      spacing: {
        before: pageBreakBefore ? 0 : 360,
        after: 200,
        line: 320
      },
      pageBreakBefore,
      border: {
        bottom: {
          color: this.getColor('accent'),
          space: 4,
          style: docx.BorderStyle.SINGLE,
          size: 8
        }
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
