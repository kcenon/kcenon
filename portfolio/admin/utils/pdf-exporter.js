/**
 * PDF Exporter - Generate PDF from portfolio data using pdfmake
 * Supports theme-based styling via StyleManager
 *
 * Content (sections, field order, labels, localized strings) comes from the
 * format-neutral tree built by utils/export-ir.js (window.ExportIR); this
 * file only maps IR nodes to pdfmake constructs and owns every styling
 * decision (colors, typography, spacing, unbreakable blocks) plus the
 * Korean font loading.
 *
 * Dependencies: utils/i18n.js (getLang), utils/export-content.js (labels),
 * utils/export-ir.js (IR)
 */

class PDFExporter {
  constructor() {
    this.fontLoaded = false;
    this.boldFontLoaded = false;
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
      pageMargins: [72, 72, 72, 72],
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
      // Executive navy + gold palette (matches executiveTheme in theme-config)
      const fallbackColors = {
        primary: '#1E3A5F',
        'primary.hover': '#0F2A4F',
        'primary.light': '#E2E8F0',
        secondary: '#B8860B',
        accent: '#B8860B',
        'accent.hover': '#9A7209',
        'accent.light': '#FAF3E0',

        'gradient.start': '#1E3A5F',
        'gradient.end': '#0F2A4F',

        'text.primary': '#1E293B',
        'text.secondary': '#475569',
        'text.muted': '#94A3B8',

        'background.page': '#FFFFFF',
        'background.primary': '#FFFFFF',
        'background.secondary': '#F8FAFC',
        'background.tertiary': '#F1F5F9',
        'background.section': '#F8FAFC',
        'background.card': '#FFFFFF',
        'background.table': '#F1F5F9',

        border: '#CBD5E1',
        'border.hover': '#94A3B8',

        success: '#0E7C66',
        warning: '#B8860B',
        error: '#B91C1C',
        info: '#1E3A5F',

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
        'page.marginTop': 72,
        'page.marginRight': 72,
        'page.marginBottom': 72,
        'page.marginLeft': 72,

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
   * Load Korean fonts (Noto Sans KR Regular + Bold) for PDF generation.
   *
   * Regular is required: without it Korean exports would render broken
   * Hangul glyphs, so callers treat its failure as fatal for 'ko'.
   * Bold is optional: when it fails, every weight falls back to Regular
   * and the export proceeds (bold hierarchy is lost, not the text).
   *
   * The result is memoized via this.fontLoading so repeated exports do
   * not refetch either font.
   *
   * @returns {Promise<{regular: boolean, bold: boolean}>} Load status per weight
   */
  async loadKoreanFont() {
    if (this.fontLoaded) return { regular: true, bold: this.boldFontLoaded };
    if (this.fontLoading) return this.fontLoading;

    this.fontLoading = (async () => {
      try {
        // Noto Sans KR from Google Fonts
        const regularUrl = 'https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLTq8H4hfeE.ttf';
        const boldUrl = 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01eLQ.ttf';

        const fetchFont = async (url) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return this.arrayBufferToBase64(await response.arrayBuffer());
        };

        const [regularResult, boldResult] = await Promise.allSettled([
          fetchFont(regularUrl),
          fetchFont(boldUrl)
        ]);

        if (regularResult.status !== 'fulfilled') {
          console.warn('Korean font load failed, using default font:', regularResult.reason);
          return { regular: false, bold: false };
        }

        const boldOk = boldResult.status === 'fulfilled';
        if (!boldOk) {
          console.warn('Korean bold font load failed, using Regular for bold text:', boldResult.reason);
        }

        // Register fonts with pdfMake. When Bold is unavailable, map the
        // bold weights back to Regular so the export still succeeds.
        pdfMake.vfs = pdfMake.vfs || {};
        pdfMake.vfs['NotoSansKR-Regular.ttf'] = regularResult.value;
        if (boldOk) {
          pdfMake.vfs['NotoSansKR-Bold.ttf'] = boldResult.value;
        }
        const boldFile = boldOk ? 'NotoSansKR-Bold.ttf' : 'NotoSansKR-Regular.ttf';

        pdfMake.fonts = {
          Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf'
          },
          NotoSansKR: {
            normal: 'NotoSansKR-Regular.ttf',
            bold: boldFile,
            italics: 'NotoSansKR-Regular.ttf',
            bolditalics: boldFile
          }
        };

        this.fontLoaded = true;
        this.boldFontLoaded = boldOk;
        console.log(boldOk
          ? 'Korean fonts loaded successfully (Regular + Bold)'
          : 'Korean font loaded (Regular only, Bold unavailable)');
        return { regular: true, bold: boldOk };
      } catch (error) {
        console.warn('Korean font load error:', error);
        return { regular: false, bold: false };
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
      sections = ['expertise', 'manager', 'projects', 'career', 'education', 'testimonials'],
      filename = 'portfolio.pdf',
      theme = 'executive',
      themeOverrides = {},
      includeCoverLetter = false,
      includeCoverPage = true,
      pageBreakBetweenSections = true,
      personalInfoFields = [],
      language = null
    } = options;

    try {
      // Set current language for multilingual support
      // Use provided language option, or detect from window
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

      // Load Korean fonts first. Without Regular a Korean export would
      // silently produce broken Hangul glyphs (Roboto has none), so abort
      // in that case; English exports proceed with a warning attached to
      // the result. A missing Bold weight is never fatal: the export
      // proceeds with Regular substituted and a warning attached.
      const fontStatus = await this.loadKoreanFont();
      if (!fontStatus.regular && this.currentLang === 'ko') {
        throw new Error('Korean font (Noto Sans KR) could not be loaded - aborting PDF export to avoid broken Hangul text. Check the network connection and retry.');
      }
      let fontWarning = null;
      if (!fontStatus.regular) {
        fontWarning = 'Korean font unavailable - PDF generated with the Latin-only Roboto font.';
      } else if (!fontStatus.bold) {
        fontWarning = 'Korean bold font unavailable - bold text is rendered in the regular weight.';
      }

      // Load cover letter if requested
      let coverLetterTemplate = null;
      if (includeCoverLetter) {
        coverLetterTemplate = this.loadCoverLetterTemplate();
      }

      const docDefinition = this.buildDocument(data, sections, {
        title, author, includeCoverLetter, coverLetterTemplate,
        includeCoverPage, pageBreakBetweenSections, personalInfoFields
      });

      // Resolve only after the PDF is actually built and handed to the
      // browser for download; build/save errors reject instead of being
      // silently reported as success.
      return new Promise((resolve, reject) => {
        try {
          const pdfDoc = pdfMake.createPdf(docDefinition);
          pdfDoc.getBlob((blob) => {
            try {
              window.saveAs(blob, filename);
              const result = { success: true, filename };
              if (fontWarning) result.fontWarning = fontWarning;
              resolve(result);
            } catch (saveError) {
              reject(saveError);
            }
          });
        } catch (buildError) {
          reject(buildError);
        }
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
   * Build pdfmake document definition from the format-neutral IR tree
   */
  buildDocument(data, sections, info) {
    const ir = window.ExportIR.build(data, {
      sections,
      title: info.title,
      author: info.author,
      includeCoverPage: info.includeCoverPage,
      includeCoverLetter: info.includeCoverLetter,
      coverLetterTemplate: info.coverLetterTemplate,
      pageBreakBetweenSections: info.pageBreakBetweenSections,
      personalInfoFields: info.personalInfoFields
    }, this.currentLang);

    const content = [];
    ir.children.forEach(section => content.push(...this.renderSection(section)));

    // Use theme-based page margins
    const pageMargins = this.themeStyles?.pageMargins || [
      this.getSpacing('page.marginLeft'),
      this.getSpacing('page.marginTop'),
      this.getSpacing('page.marginRight'),
      this.getSpacing('page.marginBottom')
    ];

    return {
      info: {
        title: ir.title,
        author: ir.author,
        subject: 'Professional Portfolio',
        creator: 'Portfolio Admin'
      },
      pageSize: 'A4',
      pageMargins,
      footer: this.getDocFooter(ir),
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

  // ── IR walkers ──────────────────────────────────────────────────────────

  /**
   * Render one IR section to an array of pdfmake content nodes
   * @param {Object} section - IR section node
   * @returns {Array} pdfmake content nodes
   */
  renderSection(section) {
    const out = this.renderNodes(section.children, {});
    // The cover letter starts on a new page by setting pageBreak:'before' on
    // its first node — no trailing break (the next section header handles
    // that one). Content-section headings carry their own pageBreakBefore.
    if (section.id === 'coverLetter' && section.pageBreakBefore && out.length > 0) {
      out[0].pageBreak = 'before';
    }
    return out;
  }

  /**
   * Render a list of IR nodes
   * @param {Array} nodes - IR nodes
   * @param {Object} ctx - Render context (e.g. featured testimonial flag)
   * @returns {Array} pdfmake content nodes
   */
  renderNodes(nodes, ctx) {
    const out = [];
    (nodes || []).forEach(node => out.push(...this.renderNode(node, ctx)));
    return out;
  }

  /**
   * Render a single IR node
   * @param {Object} node - IR node
   * @param {Object} ctx - Render context
   * @returns {Array} pdfmake content nodes
   */
  renderNode(node, ctx) {
    switch (node.type) {
      case 'group': return this.renderGroup(node, ctx);
      case 'heading': return this.renderHeading(node);
      case 'paragraph': return this.renderParagraph(node, ctx);
      case 'bulletList': return this.renderBulletListNode(node);
      case 'keyValueList': return this.renderKeyValueList(node);
      case 'badgeRow': return this.renderBadgeRow(node);
      case 'table': return this.renderTable(node);
      case 'statsRow': return this.renderStatsRow(node);
      case 'spacer': return this.renderSpacer(node);
      default: return [];
    }
  }

  /**
   * Render an IR group as an unbreakable stack (role decides the margin)
   */
  renderGroup(node, ctx) {
    switch (node.role) {
      case 'expertiseCategory':
        return [{
          unbreakable: true,
          stack: this.renderNodes(node.children, ctx),
          margin: [0, 0, 0, this.getSpacing('gap.medium')]
        }];
      case 'heroCapabilities':
      case 'certifications':
        return [{
          unbreakable: true,
          stack: this.renderNodes(node.children, ctx),
          margin: [0, 0, 0, 5]
        }];
      case 'project':
        // Card-like block. Bottom margin sized to keep projects distinct
        // without leaving large gaps on the page.
        return [{
          unbreakable: true,
          stack: this.renderNodes(node.children, ctx),
          margin: [0, 0, 0, 22]
        }];
      case 'careerEntry':
        return [{
          unbreakable: true,
          stack: this.renderNodes(node.children, ctx),
          margin: [0, 0, 0, this.getSpacing('gap.xlarge')]
        }];
      case 'educationEntry':
        return [{
          unbreakable: true,
          stack: this.renderNodes(node.children, ctx),
          margin: [0, 0, 0, this.getSpacing('gap.medium')]
        }];
      case 'testimonial':
        return [{
          unbreakable: true,
          stack: this.renderNodes(node.children, { ...ctx, featured: !!node.featured }),
          margin: [0, 14, 0, 22]
        }];
      case 'pmCapability':
        return [{
          unbreakable: true,
          stack: this.renderNodes(node.children, ctx),
          margin: [0, 0, 0, 4]
        }];
      default:
        return this.renderNodes(node.children, ctx);
    }
  }

  /**
   * Render an IR heading node
   */
  renderHeading(node) {
    switch (node.role) {
      case 'section':
        return this.buildSectionHeader(node.text, !!node.pageBreakBefore);
      case 'subsection':
        return this.buildSubsectionHeader(node.text, !!node.pageBreakBefore);
      case 'expertiseCategory':
        // Category title with enhanced primary color
        return [{
          text: '[ ' + node.text + ' ]',
          fontSize: this.getTypography('fontSize.h3'),
          color: '#3B82F6',  // Primary blue matching web design
          bold: true,
          margin: [0, this.getSpacing('subsection.marginTop'), 0, this.getSpacing('subsection.marginBottom')]
        }];
      case 'coreCapabilities':
        return [{
          text: node.text,
          style: 'sectionTitle'
        }];
      case 'certifications':
        return [{
          text: node.text,
          fontSize: this.getTypography('fontSize.h3'),
          color: '#3B82F6',  // Primary blue
          bold: true,
          margin: [0, 18, 0, 8]
        }];
      default:
        return [];
    }
  }

  /**
   * Render an IR paragraph node (role decides the exact typography)
   */
  renderParagraph(node, ctx) {
    switch (node.role) {
      // ── Cover page ────────────────────────────────────────────────
      case 'coverName':
        // Name — 32pt per Microsoft Word resume guide (28–35pt range)
        return [{
          text: node.text,
          fontSize: 32,
          bold: true,
          color: this.getColor('text.primary'),
          lineHeight: 1.15,
          margin: [0, 0, 0, 10]
        }];

      case 'coverSubtitle':
        return [{
          text: node.text,
          fontSize: 12,
          color: this.getColor('primary'),
          bold: true,
          characterSpacing: 1.5,
          margin: [0, 0, 0, node.tight ? 12 : 26]
        }];

      case 'coverPersonalInfo':
        return [{
          text: node.text,
          fontSize: 9.5,
          color: this.getColor('text.secondary'),
          margin: [0, 0, 0, 22]
        }];

      case 'coverSummary':
        // Executive summary — single block, lines joined with newlines
        return [{
          text: node.lines.join('\n'),
          fontSize: 10.5,
          color: this.getColor('text.secondary'),
          lineHeight: 1.6,
          margin: [0, 0, 0, 30]
        }];

      case 'coverCertsLabel':
        return [{
          text: node.text,
          fontSize: 9,
          color: this.getColor('text.muted'),
          bold: true,
          margin: [0, 28, 0, 6]
        }];

      case 'coverCertsText':
        return [{
          text: node.text,
          fontSize: 11,
          color: this.getColor('success'),
          bold: true,
          margin: [0, 0, 0, 0]
        }];

      case 'coverDate':
        return [{
          text: node.text,
          fontSize: 9,
          color: this.getColor('text.muted'),
          alignment: 'right',
          margin: [0, 60, 0, 0]
        }];

      // ── Cover letter ──────────────────────────────────────────────
      case 'clGreeting':
        return [{
          text: node.text,
          fontSize: this.getTypography('fontSize.body'),
          margin: [0, 0, 0, this.getSpacing('section.gap') * 1.5]
        }];

      case 'clOpening':
        return [{
          text: node.text,
          fontSize: this.getTypography('fontSize.body'),
          lineHeight: this.getTypography('lineHeight') * 1.1,
          alignment: 'justify',
          margin: [0, 0, 0, this.getSpacing('section.gap') * 1.5]
        }];

      case 'clClosing':
        return [{
          text: node.text,
          fontSize: this.getTypography('fontSize.body'),
          lineHeight: this.getTypography('lineHeight') * 1.1,
          alignment: 'justify',
          margin: [0, 0, 0, this.getSpacing('section.gap') * 2]
        }];

      case 'clSignature':
        return [{
          text: node.text,
          fontSize: this.getTypography('fontSize.body'),
          margin: [0, 0, 0, 0]
        }];

      // ── Inline header (no cover page) ─────────────────────────────
      case 'inlineHeader': {
        const titleRun = node.runs.find(r => r.role === 'title');
        const dateRun = node.runs.find(r => r.role === 'date');
        return [{
          columns: [
            {
              text: titleRun ? titleRun.text : '',
              fontSize: this.getTypography('fontSize.h1'),
              bold: true,
              color: this.getColor('primary')  // Use primary color directly instead of style
            },
            {
              text: dateRun ? dateRun.text : '',
              alignment: 'right',
              fontSize: this.getTypography('fontSize.small'),
              color: this.getColor('text.muted'),
              margin: [0, 8, 0, 0],
              width: 'auto'
            }
          ],
          margin: [0, 0, 0, this.getSpacing('header.marginBottom')]
        }];
      }

      // ── Projects ──────────────────────────────────────────────────
      case 'projectTitle':
        return [{
          text: node.text,
          bold: true,
          fontSize: this.getTypography('fontSize.h3'),
          color: this.getColor('primary'),  // Primary for emphasis
          margin: [0, 0, 0, 4],
          lineHeight: this.getTypography('lineHeight.tight')
        }];

      case 'projectMeta': {
        const company = node.runs.find(r => r.role === 'company');
        const period = node.runs.find(r => r.role === 'period');
        const metaText = [];
        if (company) {
          metaText.push({
            text: company.text,
            color: this.getColor('text.secondary'),
            bold: true
          });
        }
        if (period) {
          if (company) {
            metaText.push({ text: ' | ', color: this.getColor('text.muted') });
          }
          metaText.push({
            text: period.text,
            color: this.getColor('accent')  // Accent color for dates
          });
        }
        return [{
          text: metaText,
          fontSize: this.getTypography('fontSize.small'),
          italics: true,
          margin: [0, 0, 0, 6]
        }];
      }

      case 'projectDescription':
        return [{
          text: node.text,
          color: this.getColor('text.secondary'),
          fontSize: this.getTypography('fontSize.body'),
          lineHeight: this.getTypography('lineHeight.relaxed'),
          margin: [0, 0, 0, 8]
        }];

      case 'blockLabel': {
        // Color-coded '[ Label ]' block headers (web palette)
        const styles = {
          roles: { color: '#3B82F6', margin: [0, 0, 0, 4] },
          challenges: { color: '#F59E0B', margin: [0, 6, 0, 4] },
          solutions: { color: '#3B82F6', margin: [0, 6, 0, 4] },
          achievements: { color: '#10B981', margin: [0, 6, 0, 4] },
          keyAchievements: { color: '#10B981', margin: [0, 6, 0, 3] }
        };
        const s = styles[node.variant] || styles.roles;
        return [{
          text: node.text,
          bold: true,
          fontSize: this.getTypography('fontSize.h4'),
          color: s.color,
          margin: s.margin
        }];
      }

      // ── Career ────────────────────────────────────────────────────
      case 'careerHeader': {
        const title = node.runs.find(r => r.role === 'title');
        const badge = node.runs.find(r => r.role === 'badge');
        const period = node.runs.find(r => r.role === 'period');
        const companyText = [];
        companyText.push({
          text: title ? title.text : '',
          bold: true,
          color: '#3B82F6'  // Primary color
        });
        if (badge) {
          companyText.push({
            text: ' [' + badge.text + ']',
            color: '#F59E0B',  // Warning color
            bold: true
          });
        }
        return [{
          columns: [
            {
              text: companyText,
              fontSize: this.getTypography('fontSize.h3'),
              width: '*'
            },
            {
              text: period ? period.text : '',
              alignment: 'right',
              color: '#3B82F6',  // Primary color for dates
              fontSize: this.getTypography('fontSize.small'),
              bold: true,
              width: 'auto'
            }
          ],
          margin: [0, 8, 0, 4]
        }];
      }

      case 'careerRole':
        return [{
          text: '> ' + node.text,
          color: '#0F172A',  // Text primary
          fontSize: this.getTypography('fontSize.body'),
          bold: true,
          margin: [0, 0, 0, 4]
        }];

      case 'careerCompanyDescription':
        return [{
          text: node.text,
          italics: true,
          color: this.getColor('text.muted'),
          fontSize: this.getTypography('fontSize.small'),
          margin: [0, 0, 0, 3]
        }];

      case 'careerResponsibilities': {
        const label = node.runs.find(r => r.role === 'label');
        const value = node.runs.find(r => r.role === 'value');
        return [{
          text: [
            { text: (label ? label.text : '') + ' ', bold: true },
            { text: value ? value.text : '' }
          ],
          color: this.getColor('text.secondary'),
          fontSize: this.getTypography('fontSize.small'),
          margin: [0, 0, 0, 3]
        }];
      }

      case 'careerDescription':
        return [{
          text: node.text,
          color: this.getColor('text.secondary'),
          margin: [0, 0, 0, 3]
        }];

      case 'careerNote':
        return [{
          text: node.text,
          fontSize: this.getTypography('fontSize.small'),
          italics: true,
          color: this.getColor('text.muted'),
          margin: [0, 3, 0, 5]
        }];

      case 'careerLeaveReason': {
        const label = node.runs.find(r => r.role === 'label');
        const value = node.runs.find(r => r.role === 'value');
        return [{
          text: [
            { text: (label ? label.text : '') + ' ', bold: true },
            { text: value ? value.text : '' }
          ],
          color: this.getColor('text.muted'),
          fontSize: this.getTypography('fontSize.tiny'),
          margin: [0, 0, 0, 3]
        }];
      }

      // ── Education ─────────────────────────────────────────────────
      case 'eduHeader': {
        const title = node.runs.find(r => r.role === 'title');
        const meta = node.runs.find(r => r.role === 'meta');
        return [{
          columns: [
            {
              text: title ? title.text : '',
              fontSize: this.getTypography('fontSize.h3'),
              bold: true,
              color: this.getColor('primary'),
              width: '*'
            },
            {
              text: meta ? meta.text : '',
              alignment: 'right',
              color: this.getColor('primary'),
              fontSize: this.getTypography('fontSize.small'),
              bold: true,
              width: 'auto'
            }
          ],
          margin: [0, 8, 0, 4]
        }];
      }

      case 'eduDegree':
        return [{
          text: node.text,
          color: this.getColor('text.primary'),
          fontSize: this.getTypography('fontSize.body'),
          margin: [0, 0, 0, 3]
        }];

      case 'eduLocation':
        return [{
          text: node.text,
          color: this.getColor('text.muted'),
          italics: true,
          fontSize: this.getTypography('fontSize.small'),
          margin: [0, 0, 0, 3]
        }];

      // ── Compensation (private) ────────────────────────────────────
      case 'compSubtitle':
        return [{
          text: node.text,
          italics: true,
          color: this.getColor('text.muted'),
          fontSize: this.getTypography('fontSize.body'),
          margin: [0, 0, 0, 6]
        }];

      case 'compIntro':
        return [{
          text: node.text,
          color: this.getColor('text.primary'),
          fontSize: this.getTypography('fontSize.small'),
          margin: [0, 0, 0, 10]
        }];

      case 'compWarning':
        // Confidentiality watermark line
        return [{
          text: node.text,
          color: '#b91c1c',
          bold: true,
          fontSize: this.getTypography('fontSize.small'),
          margin: [0, 0, 0, 10]
        }];

      case 'compBlockTitle':
        return [{
          text: node.text,
          bold: true,
          color: this.getColor('primary'),
          fontSize: this.getTypography('fontSize.h3'),
          margin: [0, node.variant === 'package' ? 0 : 12, 0, 4]
        }];

      case 'compEstimate':
        return [{
          text: node.text,
          italics: true,
          color: this.getColor('text.muted'),
          fontSize: this.getTypography('fontSize.small'),
          margin: [0, 4, 0, 12]
        }];

      case 'compStance':
        return [{
          text: node.text,
          fontSize: this.getTypography('fontSize.small'),
          color: this.getColor('text.primary'),
          margin: [0, 0, 0, 8]
        }];

      case 'compLastUpdated':
        return [{
          text: node.text,
          italics: true,
          color: this.getColor('text.muted'),
          fontSize: this.getTypography('fontSize.small'),
          alignment: 'right',
          margin: [0, 8, 0, 0]
        }];

      // ── Testimonials ──────────────────────────────────────────────
      case 'testimonialFeaturedTag':
        return [{
          text: node.text,
          fontSize: this.getTypography('fontSize.tiny'),
          color: '#3B82F6',  // Primary
          bold: true,
          margin: [0, 0, 0, 4]
        }];

      case 'testimonialQuote':
        return [{
          text: `"${node.text}"`,
          italics: true,
          fontSize: (ctx && ctx.featured)
            ? this.getTypography('fontSize.body') + 1
            : this.getTypography('fontSize.body'),
          margin: [this.getSpacing('list.indent'), 0, this.getSpacing('list.indent'), 8],
          color: '#0F172A',  // Text primary
          lineHeight: this.getTypography('lineHeight.relaxed')
        }];

      case 'testimonialAuthor': {
        const author = node.runs.find(r => r.role === 'author');
        const authorRole = node.runs.find(r => r.role === 'authorRole');
        const relation = node.runs.find(r => r.role === 'relation');
        const authorText = [];
        authorText.push({
          text: author ? author.text : '',
          bold: true,
          color: '#3B82F6'  // Primary
        });
        if (authorRole) {
          authorText.push({
            text: ', ' + authorRole.text,
            color: '#475569',  // Text secondary
            bold: false
          });
        }
        if (relation) {
          authorText.push({
            text: ` (${relation.text})`,
            color: '#3B82F6',  // Primary
            italics: true
          });
        }
        return [{
          text: authorText,
          fontSize: this.getTypography('fontSize.small'),
          margin: [this.getSpacing('list.indent'), 0, 0, 0]
        }];
      }

      // ── Manager / leadership ──────────────────────────────────────
      case 'pmCapTitle':
        return [{
          text: [
            { text: '◆ ', color: this.getColor('accent'), fontSize: 12, bold: true },
            { text: node.text, color: this.getColor('primary'), bold: true, fontSize: 12 }
          ],
          margin: [0, node.first ? 0 : 10, 0, 4]
        }];

      case 'pmCapDescription':
        return [{
          text: node.text,
          color: this.getColor('text.secondary'),
          italics: true,
          fontSize: 10.5,
          lineHeight: 1.5,
          margin: [16, 0, 0, 6]
        }];

      default:
        return [];
    }
  }

  /**
   * Render an IR bullet list node (role decides marker color and margins)
   */
  renderBulletListNode(node) {
    const texts = (node.items || []).map(item => item.text);

    switch (node.role) {
      case 'expertiseItems':
        return [this.buildBulletList(texts)];

      case 'projectDetail': {
        const markerByVariant = {
          roles: this.getColor('accent'),
          challenges: this.getColor('warning'),
          solutions: this.getColor('accent'),
          achievements: this.getColor('success')
        };
        return [this.buildBulletList(texts, {
          markerColor: markerByVariant[node.variant] || this.getColor('accent'),
          bottomMargin: 6
        })];
      }

      case 'careerAchievements':
        return [this.buildBulletList(texts, { markerColor: this.getColor('success'), bottomMargin: 6 })];

      case 'pmCapHighlights':
        return [this.buildBulletList(texts, { markerColor: this.getColor('accent'), bottomMargin: 6 })];

      case 'managerPrinciples':
        return [this.buildBulletList(texts, { markerColor: this.getColor('accent') })];

      case 'managerImpact':
        return [this.buildBulletList(texts, { markerColor: this.getColor('success') })];

      case 'clKeyPoints': {
        const keyPointsContent = (node.items || []).map(item => ({
          text: (item.runs || []).map(r => r.role === 'strong'
            ? { text: r.text, bold: true, color: this.getColor('primary') }
            : r.text),
          margin: [0, 0, 0, this.getSpacing('list.itemGap') * 1.2]
        }));
        return [{
          ul: keyPointsContent,
          margin: [0, 0, 0, this.getSpacing('section.gap') * 1.5]
        }];
      }

      case 'compNonNegotiables':
        return texts.map(text => ({
          text: `• ${text}`,
          fontSize: this.getTypography('fontSize.small'),
          color: this.getColor('text.primary'),
          margin: [0, 0, 0, 2]
        }));

      default:
        return [];
    }
  }

  /**
   * Render an IR key/value list
   */
  renderKeyValueList(node) {
    const entries = node.entries || [];

    switch (node.role) {
      case 'heroCapabilities':
        return entries.map(entry => ({
          text: [
            { text: entry.label + ': ', bold: true },
            { text: entry.value }
          ],
          margin: [this.getSpacing('list.indent'), 0, 0, 5]
        }));

      case 'careerScale':
        return [{
          text: entries.map(entry => `${entry.label} ${entry.value}`).join('  |  '),
          color: this.getColor('text.muted'),
          fontSize: this.getTypography('fontSize.tiny'),
          margin: [0, 0, 0, 3]
        }];

      case 'compComponents':
        return entries.map(entry => ({
          text: `• ${entry.label}: ${entry.value}`,
          fontSize: this.getTypography('fontSize.small'),
          color: this.getColor('text.primary'),
          margin: [0, 0, 0, 2]
        }));

      case 'compRationales':
        // Per-tier rationale lines
        return entries.map(entry => ({
          text: [
            { text: `${entry.label}: `, bold: true, color: this.getColor('primary') },
            { text: entry.value, color: this.getColor('text.muted') }
          ],
          fontSize: this.getTypography('fontSize.small'),
          margin: [0, 0, 0, 3]
        }));

      default:
        return [];
    }
  }

  /**
   * Render an IR badge row. The joiner and bracket decoration are PDF
   * styling decisions (the DOCX walker uses its own).
   */
  renderBadgeRow(node) {
    const items = node.items || [];

    switch (node.role) {
      case 'expertiseTags':
        return [{
          text: '[ ' + items.join(' | ') + ' ]',
          fontSize: this.getTypography('fontSize.small') + 1,  // Slightly larger
          color: '#3B82F6',  // Primary blue matching web
          bold: true,
          margin: [this.getSpacing('list.indent'), 0, 0, this.getSpacing('list.marginBottom')]
        }];

      case 'certificationBadges':
        return [{
          text: items.join(' | '),
          color: this.getColor('success'),  // Success green matching web
          bold: true,
          fontSize: this.getTypography('fontSize.body') + 1,
          margin: [this.getSpacing('list.indent'), 0, 0, 10]
        }];

      case 'projectTags':
        return [{
          text: '[ ' + items.join(' | ') + ' ]',
          fontSize: this.getTypography('fontSize.tiny') + 1,  // Slightly larger for readability
          color: '#3B82F6',  // Primary blue matching web accent
          bold: true,
          margin: [0, 0, 0, 8]
        }];

      case 'careerTags':
        return [{
          text: items.join(' | '),
          color: this.getColor('primary'),
          fontSize: this.getTypography('fontSize.tiny'),
          margin: [0, 0, 0, 5]
        }];

      case 'testimonialLabels':
        return [{
          text: '[ ' + items.join(' | ') + ' ]',
          fontSize: this.getTypography('fontSize.tiny'),
          color: '#10B981',  // Success
          bold: true,
          margin: [this.getSpacing('list.indent'), 5, 0, 0]
        }];

      case 'pmCapMetrics':
        return [{
          text: items.join('   ·   '),
          color: this.getColor('accent'),
          bold: true,
          fontSize: 9,
          margin: [16, 4, 0, 0]
        }];

      case 'pmCapTags':
        return [{
          text: items.join(' · '),
          color: this.getColor('text.muted'),
          fontSize: 9,
          margin: [16, 4, 0, 0]
        }];

      default:
        return [];
    }
  }

  /**
   * Render an IR table node
   */
  renderTable(node) {
    switch (node.role) {
      case 'compTiers': {
        // Negotiation tiers as a compact table
        const headerRow = (node.header || []).map(h => ({ text: h, bold: true }));
        const body = [headerRow];
        (node.rows || []).forEach(rowData => {
          body.push(rowData.map((val, idx) => idx === 0
            ? { text: val, bold: true }
            : { text: val }));
        });
        return [{
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', '*'],
            body
          },
          layout: 'lightHorizontalLines',
          fontSize: this.getTypography('fontSize.small'),
          margin: [0, 0, 0, 10]
        }];
      }

      case 'softSkillsGrid': {
        // 2-column descriptive grid
        const buildSkillCell = (skill) => ({
          stack: [
            {
              text: [
                { text: '◆  ', color: this.getColor('accent'), fontSize: 11, bold: true },
                { text: skill.title, color: this.getColor('primary'), bold: true, fontSize: 11.5 }
              ],
              margin: [0, 0, 0, 5]
            },
            ...(skill.description ? [{
              text: skill.description,
              color: this.getColor('text.secondary'),
              fontSize: 9.5,
              lineHeight: 1.55,
              margin: [16, 0, 0, 0]
            }] : [])
          ]
        });

        const cells = (node.cells || []).map(buildSkillCell);
        while (cells.length % 2 !== 0) cells.push({ text: '' });
        const rows = [];
        for (let i = 0; i < cells.length; i += 2) rows.push(cells.slice(i, i + 2));

        return [{
          table: { widths: ['*', '*'], body: rows },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 10,
            paddingRight: () => 10,
            paddingTop: () => 10,
            paddingBottom: () => 12
          },
          margin: [0, 0, 0, 6]
        }];
      }

      default:
        return [];
    }
  }

  /**
   * Render the cover-page stats row as a 2-row infographic table
   */
  renderStatsRow(node) {
    const finalStats = node.items || [];
    if (finalStats.length === 0) return [];

    const widths = Array(finalStats.length).fill('*');
    const valueRow = finalStats.map(s => ({
      text: s.value,
      fillColor: this.getColor('primary'),
      color: '#FFFFFF',
      bold: true,
      fontSize: 26,
      alignment: 'center',
      margin: [0, 14, 0, 6]
    }));
    const labelRow = finalStats.map(s => ({
      text: s.label,
      fillColor: '#F1F5F9',
      color: this.getColor('text.secondary'),
      fontSize: 9,
      alignment: 'center',
      margin: [0, 8, 0, 12]
    }));

    return [{
      table: { widths, heights: [56, 28], body: [valueRow, labelRow] },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0 : 4,
        vLineColor: () => '#FFFFFF',
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0
      },
      margin: [0, 0, 0, 0]
    }];
  }

  /**
   * Render decorative spacers/rules (role decides the exact visual)
   */
  renderSpacer(node) {
    switch (node.role) {
      case 'coverTopRule':
        return [{
          canvas: [{ type: 'rect', x: 0, y: 0, w: 60, h: 3, color: this.getColor('primary') }],
          margin: [0, 40, 0, 48]
        }];

      case 'coverDivider':
        return [{
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 451, y2: 0, lineWidth: 0.5, lineColor: this.getColor('border') }],
          margin: [0, 0, 0, 26]
        }];

      case 'inlineHeaderRule': {
        // Header underline depends on the theme's headerStyle layout key
        const headerStyle = this.getLayout('headerStyle');
        if (headerStyle === 'underlined' || headerStyle === 'bordered') {
          return [{
            canvas: [{
              type: 'line',
              x1: 0, y1: 0,
              x2: 451, y2: 0,
              lineWidth: 3,
              lineColor: this.getColor('primary')
            }],
            margin: [0, this.getSpacing('header.paddingBottom'), 0, this.getSpacing('section.marginTop')]
          }];
        } else if (headerStyle === 'boxed') {
          return [{
            canvas: [{
              type: 'rect',
              x: 0, y: -50,
              w: 451, h: 80,
              lineWidth: 1,
              lineColor: '#E2E8F0'
            }],
            margin: [0, 0, 0, this.getSpacing('section.marginBottom')]
          }];
        }
        // Default: simple spacing
        return [{
          text: '',
          margin: [0, 0, 0, this.getSpacing('section.marginTop')]
        }];
      }

      case 'projectDetailRule':
        // Separator between project summary and expanded details
        return [{
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 150, y2: 0,
            lineWidth: 1,
            lineColor: '#E2E8F0'
          }],
          margin: [0, 8, 0, 8]
        }];

      case 'testimonialDivider':
        // Thin centered rule between adjacent testimonials
        return [{
          canvas: [{ type: 'line', x1: 200, y1: 0, x2: 315, y2: 0, lineWidth: 0.5, lineColor: this.getColor('border') }],
          margin: [0, 4, 0, 6]
        }];

      case 'pmCapabilitiesEnd':
        return [{ text: '', margin: [0, 0, 0, 10] }];

      default:
        return [];
    }
  }

  /**
   * Build the per-page footer callback (skip page 1 / cover)
   * @param {Object} info - Document info
   * @returns {Function} pdfmake footer function
   */
  getDocFooter(info) {
    const author = info.author || 'Portfolio';
    const accentColor = this.getColor('primary');
    const mutedColor = this.getColor('text.muted');
    return (currentPage, pageCount) => {
      if (currentPage === 1) return null;
      return {
        margin: [72, 0, 72, 0],
        stack: [
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 451, y2: 0, lineWidth: 0.5, lineColor: '#E2E8F0' }],
            margin: [0, 0, 0, 6]
          },
          {
            columns: [
              { text: author, fontSize: 8, color: mutedColor, width: '*' },
              {
                text: [
                  { text: `${currentPage}`, color: accentColor, bold: true },
                  { text: ` / ${pageCount}`, color: mutedColor }
                ],
                fontSize: 8, width: 'auto', alignment: 'right'
              }
            ]
          }
        ]
      };
    };
  }

  /**
   * Render a bullet list as a stack of paragraphs that mirrors the DOCX
   * '·  ' style — colored leading marker + indented body text. This keeps
   * PDF and DOCX visually consistent (pdfmake's native `ul:` produces a
   * tighter disc bullet that does not match Word's rendering).
   * @param {Array<string>} items - Plain-text items
   * @param {Object} [options]
   * @param {string} [options.markerColor] - Color hex for the leading marker
   * @param {number} [options.fontSize] - Body font size
   * @param {string} [options.color] - Body text color
   * @param {number} [options.indentLeft] - Left indent in pt
   * @param {number} [options.bottomMargin] - Bottom margin after the list
   * @returns {Object} pdfmake stack node
   */
  buildBulletList(items, options = {}) {
    const {
      markerColor = this.getColor('accent'),
      fontSize = 10.5,
      color = this.getColor('text.secondary'),
      indentLeft = 12,
      bottomMargin = 10
    } = options;

    return {
      stack: items.map((item, i) => ({
        text: [
          { text: '·  ', bold: true, color: markerColor },
          { text: item, color }
        ],
        fontSize,
        lineHeight: 1.45,
        margin: [indentLeft, 0, 0, i === items.length - 1 ? bottomMargin : 3]
      }))
    };
  }

  /**
   * Editorial-style subsection header (category level inside a section).
   * Smaller than H2 with a short gold/accent underline so the visual
   * hierarchy is distinct from the navy section bands.
   * @param {string} text - Subsection title
   * @param {boolean} addPageBreak - Force a new page before this subsection
   * @returns {Array} pdfmake content nodes
   */
  buildSubsectionHeader(text, addPageBreak = false) {
    // Single full-width accent thin rule under the heading,
    // matching the DOCX H3 paragraph bottom border (1pt accent).
    const titleNode = {
      text: (text || '').toString(),
      fontSize: 12.5,
      bold: true,
      color: this.getColor('primary'),
      margin: [0, addPageBreak ? 0 : 10, 0, 4]
    };
    if (addPageBreak) titleNode.pageBreak = 'before';

    return [
      titleNode,
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 451, y2: 0, lineWidth: 1, lineColor: this.getColor('accent') }],
        margin: [0, 0, 0, 10]
      }
    ];
  }

  /**
   * Build a card-style section header with optional page break.
   * Returns nodes ready to push into pdfmake content (header + rule).
   * @param {string} text - Section title (uppercase applied)
   * @param {boolean} addPageBreak - Force page break before this section
   * @returns {Array} pdfmake content nodes
   */
  buildSectionHeader(text, addPageBreak = false) {
    // Single full-width primary-color rule under the heading,
    // matching the DOCX H2 paragraph bottom border (1.5pt primary).
    const titleNode = {
      text: (text || '').toString().toUpperCase(),
      fontSize: 16,
      bold: true,
      color: this.getColor('primary'),
      characterSpacing: 3,
      margin: [0, 0, 0, 6]
    };
    if (addPageBreak) titleNode.pageBreak = 'before';

    return [
      titleNode,
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 451, y2: 0, lineWidth: 1.5, lineColor: this.getColor('primary') }],
        margin: [0, 0, 0, 18]
      }
    ];
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
