/**
 * DOCX Exporter - Generate Word documents from portfolio data using docx.js
 * Supports theme-based styling via StyleManager
 *
 * Content (sections, field order, labels, localized strings) comes from the
 * format-neutral tree built by utils/export-ir.js (window.ExportIR); this
 * file only maps IR nodes to docx.js constructs and owns every styling
 * decision (colors, sizes, spacing, keep-together pagination).
 *
 * Dependencies: utils/export-content.js (labels), utils/export-ir.js (IR)
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
      sections = ['expertise', 'manager', 'projects', 'career', 'education', 'testimonials'],
      filename = 'portfolio.docx',
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
        includeCoverPage, pageBreakBetweenSections, personalInfoFields
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
   * Build docx document from the format-neutral IR tree
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

    const children = [];
    ir.children.forEach(section => children.push(...this.renderSection(section)));

    const includeCoverPage = ir.includeCoverPage;
    const sectionConfig = {
      properties: includeCoverPage ? { titlePage: true } : {},
      footers: {
        default: this.buildPageFooter(ir)
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
      creator: ir.author,
      title: ir.title,
      description: 'Professional Portfolio Document',
      sections: [sectionConfig]
    });
  }

  // ── IR walkers ──────────────────────────────────────────────────────────

  /**
   * Render one IR section to an array of docx elements
   * @param {Object} section - IR section node
   * @returns {Array} docx elements
   */
  renderSection(section) {
    const out = [];
    // The cover letter starts on a fresh page via an explicit break
    // paragraph (the section headings carry their own pageBreakBefore).
    if (section.id === 'coverLetter' && section.pageBreakBefore) {
      out.push(new docx.Paragraph({ children: [], pageBreakBefore: true }));
    }
    out.push(...this.renderNodes(section.children));
    return out;
  }

  /**
   * Render a list of IR nodes
   * @param {Array} nodes - IR nodes
   * @returns {Array} docx elements
   */
  renderNodes(nodes) {
    const out = [];
    (nodes || []).forEach(node => out.push(...this.renderNode(node)));
    return out;
  }

  /**
   * Render a single IR node
   * @param {Object} node - IR node
   * @returns {Array} docx elements
   */
  renderNode(node) {
    switch (node.type) {
      case 'group': return this.renderGroup(node);
      case 'heading': return this.renderHeading(node);
      case 'paragraph': return this.renderParagraph(node);
      case 'bulletList': return this.renderBulletList(node);
      case 'keyValueList': return this.renderKeyValueList(node);
      case 'badgeRow': return this.renderBadgeRow(node);
      case 'table': return this.renderTable(node);
      case 'statsRow': return this.renderStatsRow(node);
      case 'spacer': return this.renderSpacer(node);
      default: return [];
    }
  }

  /**
   * Render an IR group. DOCX has no unbreakable container, so groups mostly
   * flatten; per-role trailing spacers keep blocks visually distinct.
   */
  renderGroup(node) {
    switch (node.role) {
      case 'careerEntry': {
        // Legacy DOCX field order: the italic company context line sits
        // between the company header and the role line. The IR canonical
        // order is role-first (web order); reorder here to preserve the
        // historical DOCX layout.
        const kids = node.children.slice();
        const roleIdx = kids.findIndex(k => k.role === 'careerRole');
        const descIdx = kids.findIndex(k => k.role === 'careerCompanyDescription');
        if (roleIdx !== -1 && descIdx !== -1 && descIdx > roleIdx) {
          const [desc] = kids.splice(descIdx, 1);
          kids.splice(roleIdx, 0, desc);
        }
        const out = this.renderNodes(kids);
        out.push(new docx.Paragraph({ children: [], spacing: { after: 100 } }));
        return out;
      }
      case 'project': {
        // Trailing spacer keeps each project visually distinct without
        // wasting too much page height.
        const out = this.renderNodes(node.children);
        out.push(new docx.Paragraph({ children: [], spacing: { after: 240 } }));
        return out;
      }
      default:
        return this.renderNodes(node.children);
    }
  }

  /**
   * Render an IR heading node
   */
  renderHeading(node) {
    switch (node.role) {
      case 'section':
        return this.createHeading2(node.text, !!node.pageBreakBefore);
      case 'subsection':
        return [this.createHeading3(node.text, !!node.pageBreakBefore)];
      case 'expertiseCategory':
      case 'coreCapabilities':
      case 'certifications':
        return [this.createHeading3WithKeep(node.text, !!node.keepWithNext)];
      default:
        return [];
    }
  }

  /**
   * Render an IR paragraph node (role decides the exact typography)
   */
  renderParagraph(node) {
    const bodySize = this.toHalfPt(this.getTypography('fontSize.body'));
    const smallSize = this.toHalfPt(this.getTypography('fontSize.small'));

    switch (node.role) {
      // ── Cover page ────────────────────────────────────────────────
      case 'coverName':
        // Name — 32pt per Microsoft Word resume guide (28–35pt range)
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            bold: true,
            size: this.toHalfPt(32),
            color: this.getColor('text.primary')
          })],
          spacing: { after: 140 }
        })];

      case 'coverSubtitle':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            bold: true,
            size: this.toHalfPt(12),
            color: this.getColor('primary'),
            characterSpacing: 30
          })],
          spacing: { after: node.tight ? 160 : 360 }
        })];

      case 'coverPersonalInfo':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            size: this.toHalfPt(9.5),
            color: this.getColor('text.secondary')
          })],
          spacing: { after: 280 }
        })];

      case 'coverSummary':
        // Executive summary — one paragraph per line, tight leading
        return node.lines.map((line, i) => new docx.Paragraph({
          children: [new docx.TextRun({
            text: line,
            size: this.toHalfPt(10.5),
            color: this.getColor('text.secondary')
          })],
          spacing: {
            after: i === node.lines.length - 1 ? 480 : 80,
            line: 320
          }
        }));

      case 'coverCertsLabel':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            bold: true,
            size: this.toHalfPt(9),
            color: this.getColor('text.muted')
          })],
          spacing: { before: 200, after: 80 }
        })];

      case 'coverCertsText':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            bold: true,
            size: this.toHalfPt(11),
            color: this.getColor('success')
          })],
          spacing: { after: 0 }
        })];

      case 'coverDate':
        // PDF-only content: the DOCX cover carries no date line.
        return [];

      // ── Cover letter ──────────────────────────────────────────────
      case 'clGreeting':
        return [new docx.Paragraph({
          children: [new docx.TextRun({ text: node.text, size: bodySize })],
          spacing: { after: this.getSpacing('section.gap') * 20 }
        })];

      case 'clOpening':
        return [new docx.Paragraph({
          children: [new docx.TextRun({ text: node.text, size: bodySize })],
          alignment: docx.AlignmentType.JUSTIFIED,
          spacing: { after: this.getSpacing('section.gap') * 20 }
        })];

      case 'clClosing':
        return [new docx.Paragraph({
          children: [new docx.TextRun({ text: node.text, size: bodySize })],
          alignment: docx.AlignmentType.JUSTIFIED,
          spacing: { after: this.getSpacing('section.gap') * 30 }
        })];

      case 'clSignature':
        return [new docx.Paragraph({
          children: [new docx.TextRun({ text: node.text, size: bodySize })],
          spacing: { after: 0 }
        })];

      // ── Inline header (no cover page) ─────────────────────────────
      case 'inlineHeader': {
        const titleRun = node.runs.find(r => r.role === 'title');
        const dateRun = node.runs.find(r => r.role === 'date');
        return [
          new docx.Paragraph({
            children: [new docx.TextRun({
              text: titleRun ? titleRun.text : '',
              bold: true,
              size: this.toHalfPt(32),
              color: this.getColor('text.primary')
            })],
            spacing: { after: 80 }
          }),
          new docx.Paragraph({
            children: [new docx.TextRun({
              text: dateRun ? dateRun.text : '',
              size: this.toHalfPt(11),
              color: this.getColor('text.muted')
            })],
            spacing: { after: 200 }
          })
        ];
      }

      // ── Projects ──────────────────────────────────────────────────
      case 'projectTitle':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            bold: true,
            size: this.toHalfPt(16),
            color: this.getColor('primary')  // Primary color for titles
          })],
          spacing: { before: 280, after: 80, line: 320 },
          keepLines: true,
          keepNext: true
        })];

      case 'projectMeta': {
        const company = node.runs.find(r => r.role === 'company');
        const period = node.runs.find(r => r.role === 'period');
        const metaParts = [];
        if (company) {
          metaParts.push(new docx.TextRun({
            text: company.text,
            size: this.toHalfPt(10),
            color: this.getColor('text.secondary'),
            bold: true
          }));
        }
        if (period) {
          if (company) {
            metaParts.push(new docx.TextRun({
              text: ' | ',
              size: this.toHalfPt(10),
              color: this.getColor('text.muted')
            }));
          }
          metaParts.push(new docx.TextRun({
            text: period.text,
            size: this.toHalfPt(10),
            color: this.getColor('accent'),  // Accent color for dates
            italics: true
          }));
        }
        return [new docx.Paragraph({
          children: metaParts,
          spacing: { after: 120 },
          keepLines: true,
          keepNext: true
        })];
      }

      case 'projectDescription':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            size: this.toHalfPt(11),
            color: this.getColor('text.secondary')
          })],
          spacing: { after: 160, line: 360 },
          keepLines: true,
          keepNext: true
        })];

      case 'blockLabel': {
        // Color-coded '[ Label ]' block headers (web palette)
        const styles = {
          roles: { color: '3b82f6', fill: 'eff6ff', before: 40 },
          challenges: { color: 'f59e0b', fill: 'fef3c7', before: 60 },
          solutions: { color: '3b82f6', fill: 'dbeafe', before: 60 },
          achievements: { color: '10b981', fill: 'd1fae5', before: 60 },
          keyAchievements: { color: '10b981', fill: 'd1fae5', before: 60 }
        };
        const s = styles[node.variant] || styles.roles;
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            bold: true,
            size: this.toHalfPt(14),
            color: s.color,
            shading: {
              type: docx.ShadingType.CLEAR,
              fill: s.fill
            }
          })],
          spacing: { before: s.before, after: 40 },
          keepLines: true,
          keepNext: true
        })];
      }

      // ── Career ────────────────────────────────────────────────────
      case 'careerHeader': {
        const companyRuns = [];
        node.runs.forEach(r => {
          if (r.role === 'title') {
            companyRuns.push(new docx.TextRun({
              text: r.text,
              bold: true,
              size: this.toHalfPt(15),
              color: this.getColor('primary')  // Primary color for company
            }));
          } else if (r.role === 'badge') {
            companyRuns.push(new docx.TextRun({
              text: ' [' + r.text + ']',
              bold: true,
              size: this.toHalfPt(10),
              color: 'f59e0b'  // Warning color
            }));
          } else if (r.role === 'period') {
            companyRuns.push(new docx.TextRun({
              text: `  ${r.text}`,
              size: this.toHalfPt(10),
              color: '3b82f6',  // Primary color for dates
              bold: true
            }));
          }
        });
        return [new docx.Paragraph({
          children: companyRuns,
          spacing: { before: 150, after: 50 },
          keepLines: true,
          keepNext: true
        })];
      }

      case 'careerCompanyDescription':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            size: bodySize,
            italics: true,
            color: this.getColor('text.muted')
          })],
          spacing: { after: this.getSpacing('list.itemSpacing') },
          keepLines: true,
          keepNext: true
        })];

      case 'careerRole':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: '> ' + node.text,
            size: this.toHalfPt(12),
            color: '0f172a',  // Text primary
            bold: true
          })],
          spacing: { after: this.getSpacing('list.itemSpacing') },
          keepLines: true,
          keepNext: !!node.keepWithNext
        })];

      case 'careerResponsibilities': {
        const label = node.runs.find(r => r.role === 'label');
        const value = node.runs.find(r => r.role === 'value');
        return [new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `${label ? label.text : ''} `,
              bold: true,
              size: bodySize,
              color: this.getColor('text.secondary')
            }),
            new docx.TextRun({
              text: value ? value.text : '',
              size: bodySize,
              color: this.getColor('text.secondary')
            })
          ],
          spacing: { after: this.getSpacing('list.itemSpacing') },
          keepLines: true,
          keepNext: !!node.keepWithNext
        })];
      }

      case 'careerDescription':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            size: bodySize,
            color: this.getColor('text.secondary')
          })],
          spacing: { after: this.getSpacing('list.itemSpacing') },
          keepLines: true,
          keepNext: !!node.keepWithNext
        })];

      case 'careerNote':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            size: smallSize,
            italics: true,
            color: this.getColor('text.muted')
          })],
          spacing: { after: this.getSpacing('list.itemSpacing') },
          keepLines: true,
          keepNext: !!node.keepWithNext
        })];

      case 'careerLeaveReason': {
        const label = node.runs.find(r => r.role === 'label');
        const value = node.runs.find(r => r.role === 'value');
        return [new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `${label ? label.text : ''} `,
              bold: true,
              size: smallSize,
              color: this.getColor('text.muted')
            }),
            new docx.TextRun({
              text: value ? value.text : '',
              size: smallSize,
              italics: true,
              color: this.getColor('text.muted')
            })
          ],
          spacing: { after: this.getSpacing('list.itemSpacing') },
          keepLines: true,
          keepNext: !!node.keepWithNext
        })];
      }

      // ── Education ─────────────────────────────────────────────────
      case 'eduHeader': {
        const title = node.runs.find(r => r.role === 'title');
        const meta = node.runs.find(r => r.role === 'meta');
        return [new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: title ? title.text : '',
              bold: true,
              size: this.toHalfPt(this.getTypography('fontSize.h3')),
              color: this.getColor('primary')
            }),
            new docx.TextRun({
              text: '\t' + (meta ? meta.text : ''),
              bold: true,
              size: smallSize,
              color: this.getColor('primary')
            })
          ],
          tabStops: [{ type: docx.TabStopType.RIGHT, position: 9000 }],
          spacing: { before: 120, after: 60 }
        })];
      }

      case 'eduDegree':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            size: bodySize,
            color: this.getColor('text.primary')
          })],
          spacing: { after: 40 }
        })];

      case 'eduLocation':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            italics: true,
            size: smallSize,
            color: this.getColor('text.muted')
          })],
          spacing: { after: 200 }
        })];

      // ── Compensation (private) ────────────────────────────────────
      case 'compSubtitle':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            italics: true,
            size: bodySize,
            color: this.getColor('text.muted')
          })],
          spacing: { after: 80 }
        })];

      case 'compIntro':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            size: smallSize,
            color: this.getColor('text.primary')
          })],
          spacing: { after: 120 }
        })];

      case 'compWarning':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            bold: true,
            size: smallSize,
            color: 'B91C1C'
          })],
          spacing: { after: 160 }
        })];

      case 'compBlockTitle':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            bold: true,
            size: this.toHalfPt(this.getTypography('fontSize.h3')),
            color: this.getColor('primary')
          })],
          spacing: { before: node.variant === 'package' ? 80 : 200, after: 60 }
        })];

      case 'compEstimate':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            italics: true,
            size: smallSize,
            color: this.getColor('text.muted')
          })],
          spacing: { after: 160 }
        })];

      case 'compStance':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            size: smallSize,
            color: this.getColor('text.primary')
          })],
          spacing: { after: 120 }
        })];

      case 'compLastUpdated':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            italics: true,
            size: smallSize,
            color: this.getColor('text.muted')
          })],
          alignment: docx.AlignmentType.RIGHT,
          spacing: { before: 120 }
        })];

      // ── Testimonials ──────────────────────────────────────────────
      case 'testimonialFeaturedTag':
        // PDF-only content: legacy DOCX renders no featured marker.
        return [];

      case 'testimonialQuote':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: `"${node.text}"`,
            italics: true,
            size: bodySize,
            color: this.getColor('text.secondary')
          })],
          spacing: { before: 150, after: 80 },
          indent: { left: this.getSpacing('list.indent'), right: this.getSpacing('list.indent') },
          keepLines: true,
          keepNext: true
        })];

      case 'testimonialAuthor': {
        const authorRuns = [];
        node.runs.forEach(r => {
          if (r.role === 'author') {
            authorRuns.push(new docx.TextRun({
              text: '— ' + r.text,
              bold: true,
              size: smallSize,
              color: this.getColor('text.primary')
            }));
          } else if (r.role === 'authorRole') {
            authorRuns.push(new docx.TextRun({
              text: `, ${r.text}`,
              size: smallSize,
              color: this.getColor('text.muted')
            }));
          } else if (r.role === 'relation') {
            authorRuns.push(new docx.TextRun({
              text: ` (${r.text})`,
              size: smallSize,
              color: this.getColor('text.muted')
            }));
          }
        });
        if (authorRuns.length === 0) return [];
        return [new docx.Paragraph({
          children: authorRuns,
          spacing: { after: 80 },
          indent: { left: this.getSpacing('list.indent') },
          keepLines: true,
          keepNext: !!node.keepWithNext
        })];
      }

      // ── Manager / leadership ──────────────────────────────────────
      case 'pmCapTitle':
        return [new docx.Paragraph({
          children: [
            new docx.TextRun({ text: '◆  ', bold: true, size: this.toHalfPt(12), color: this.getColor('accent') }),
            new docx.TextRun({ text: node.text, bold: true, size: this.toHalfPt(12), color: this.getColor('primary') })
          ],
          spacing: { before: node.first ? 0 : 180, after: 70 },
          keepLines: true, keepNext: true
        })];

      case 'pmCapDescription':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: node.text,
            italics: true, size: this.toHalfPt(10.5), color: this.getColor('text.secondary')
          })],
          spacing: { after: 100, line: 300 },
          indent: { left: 240 },
          keepLines: true, keepNext: true
        })];

      default:
        return [];
    }
  }

  /**
   * Render an IR bullet list (role decides marker, size and keep chain)
   */
  renderBulletList(node) {
    const items = node.items || [];
    const last = items.length - 1;

    switch (node.role) {
      case 'expertiseItems':
        return items.map((item, index) => new docx.Paragraph({
          children: [new docx.TextRun({
            text: item.text,
            size: this.toHalfPt(this.getTypography('fontSize.body')),
            color: this.getColor('text.secondary')
          })],
          spacing: { after: this.getSpacing('list.itemSpacing') },
          indent: { left: this.getSpacing('list.indent') },
          keepLines: true,
          keepNext: index !== last || !!node.keepWithNext
        }));

      case 'projectDetail':
      case 'careerAchievements':
        return items.map((item, index) => new docx.Paragraph({
          children: [new docx.TextRun({
            text: item.text,
            size: this.toHalfPt(11),
            color: this.getColor('text.secondary')
          })],
          spacing: { after: 50 },
          indent: { left: this.getSpacing('list.indent') },
          keepLines: true,
          keepNext: index !== last || !!node.keepWithNext
        }));

      case 'pmCapHighlights':
      case 'managerPrinciples':
      case 'managerImpact': {
        const markerColor = node.role === 'managerImpact'
          ? this.getColor('success')
          : this.getColor('accent');
        return items.map(item => new docx.Paragraph({
          children: [
            new docx.TextRun({ text: '·  ', bold: true, color: markerColor, size: this.toHalfPt(10.5) }),
            new docx.TextRun({ text: item.text, size: this.toHalfPt(10.5), color: this.getColor('text.secondary') })
          ],
          spacing: { after: 60, line: 300 },
          indent: { left: 240 },
          keepLines: true
        }));
      }

      case 'clKeyPoints': {
        const bodySize = this.toHalfPt(this.getTypography('fontSize.body'));
        const out = items.map(item => new docx.Paragraph({
          children: (item.runs || []).map(r => r.role === 'strong'
            ? new docx.TextRun({
              text: r.text,
              bold: true,
              color: this.getColor('primary'),
              size: bodySize
            })
            : new docx.TextRun({ text: r.text, size: bodySize })),
          bullet: { level: 0 },
          spacing: { after: this.getSpacing('list.itemGap') * 20 }
        }));
        // Add spacing after bullet list
        out.push(new docx.Paragraph({
          text: '',
          spacing: { after: this.getSpacing('section.gap') * 10 }
        }));
        return out;
      }

      case 'compNonNegotiables':
        return items.map(item => new docx.Paragraph({
          children: [new docx.TextRun({
            text: `• ${item.text}`,
            size: this.toHalfPt(this.getTypography('fontSize.small')),
            color: this.getColor('text.primary')
          })],
          spacing: { after: 30 }
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
        return entries.map((entry, index) => new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `${entry.label}: `,
              bold: true,
              size: this.toHalfPt(this.getTypography('fontSize.body')),
              color: this.getColor('text.primary')
            }),
            new docx.TextRun({
              text: entry.value,
              size: this.toHalfPt(this.getTypography('fontSize.body')),
              color: this.getColor('text.secondary')
            })
          ],
          spacing: { after: this.getSpacing('list.itemSpacing') },
          indent: { left: this.getSpacing('list.indent') },
          keepLines: true,
          keepNext: index !== entries.length - 1
        }));

      case 'careerScale': {
        const smallSize = this.toHalfPt(this.getTypography('fontSize.small'));
        const scaleRuns = [];
        entries.forEach((entry, index) => {
          if (index > 0) {
            scaleRuns.push(new docx.TextRun({
              text: ' | ',
              size: smallSize,
              color: this.getColor('text.muted')
            }));
          }
          scaleRuns.push(new docx.TextRun({
            text: `${entry.label} `,
            bold: true,
            size: smallSize,
            color: this.getColor('text.secondary')
          }));
          scaleRuns.push(new docx.TextRun({
            text: entry.value,
            size: smallSize,
            color: this.getColor('text.secondary')
          }));
        });
        return [new docx.Paragraph({
          children: scaleRuns,
          spacing: { after: this.getSpacing('list.itemSpacing') },
          keepLines: true,
          keepNext: !!node.keepWithNext
        })];
      }

      case 'compComponents':
        return entries.map(entry => new docx.Paragraph({
          children: [new docx.TextRun({
            text: `• ${entry.label}: ${entry.value}`,
            size: this.toHalfPt(this.getTypography('fontSize.small')),
            color: this.getColor('text.primary')
          })],
          spacing: { after: 30 }
        }));

      case 'compRationales':
        return entries.map(entry => new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `${entry.label}: `,
              bold: true,
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: this.getColor('primary')
            }),
            new docx.TextRun({
              text: entry.value,
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: this.getColor('text.muted')
            })
          ],
          spacing: { before: 60, after: 40 }
        }));

      default:
        return [];
    }
  }

  /**
   * Render an IR badge row. The joiner and decoration are DOCX styling
   * decisions (the PDF walker uses its own).
   */
  renderBadgeRow(node) {
    const items = node.items || [];

    switch (node.role) {
      case 'expertiseTags':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: items.join(' | '),
            size: this.toHalfPt(this.getTypography('fontSize.small') + 1),  // Slightly larger
            color: this.getColor('primary'),
            bold: true,
            shading: {
              type: docx.ShadingType.CLEAR,
              fill: 'dbeafe'  // Light blue background matching web accent-light
            }
          })],
          spacing: { after: 100 },
          indent: { left: this.getSpacing('list.indent') },
          keepLines: true
        })];

      case 'certificationBadges':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: items.join(' | '),
            bold: true,
            size: this.toHalfPt(this.getTypography('fontSize.body') + 1),
            color: this.getColor('success'),  // Success green matching web
            shading: {
              type: docx.ShadingType.CLEAR,
              fill: 'd1fae5'  // Light green background
            }
          })],
          spacing: { after: 150 },
          indent: { left: this.getSpacing('list.indent') },
          keepLines: true
        })];

      case 'projectTags':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: items.join(' • '),
            size: this.toHalfPt(10),  // Slightly larger for readability
            color: '3b82f6',  // Primary blue matching web
            bold: true,
            shading: {
              type: docx.ShadingType.CLEAR,
              fill: 'dbeafe'  // Light blue background matching web accent-light
            }
          })],
          spacing: { after: 160 },
          keepLines: true,
          keepNext: node.keepWithNext ? true : false
        })];

      case 'careerTags':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: items.join(' | '),
            size: this.toHalfPt(this.getTypography('fontSize.tiny')),
            color: this.getColor('primary')
          })],
          keepLines: true,
          spacing: { after: 80 }
        })];

      case 'testimonialLabels':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: items.join(' | '),
            size: this.toHalfPt(this.getTypography('fontSize.tiny')),
            color: this.getColor('primary')
          })],
          spacing: { after: 150 },
          indent: { left: this.getSpacing('list.indent') },
          keepLines: true
        })];

      case 'pmCapMetrics':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: items.join('   ·   '),
            bold: true, size: this.toHalfPt(9), color: this.getColor('accent')
          })],
          spacing: { before: 60, after: 80 },
          indent: { left: 240 }
        })];

      case 'pmCapTags':
        return [new docx.Paragraph({
          children: [new docx.TextRun({
            text: items.join(' · '),
            size: this.toHalfPt(9), color: this.getColor('text.muted')
          })],
          spacing: { after: 80 },
          indent: { left: 240 }
        })];

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
        const smallSize = this.toHalfPt(this.getTypography('fontSize.small'));
        const headerCells = (node.header || []).map(h => new docx.TableCell({
          children: [new docx.Paragraph({
            children: [new docx.TextRun({
              text: h,
              bold: true,
              size: smallSize
            })]
          })]
        }));

        const rows = [new docx.TableRow({ children: headerCells, tableHeader: true })];
        (node.rows || []).forEach(rowData => {
          const cells = rowData.map((val, idx) => new docx.TableCell({
            children: [new docx.Paragraph({
              children: [new docx.TextRun({
                text: val,
                bold: idx === 0,
                size: smallSize
              })]
            })]
          }));
          rows.push(new docx.TableRow({ children: cells }));
        });

        return [new docx.Table({
          rows,
          width: { size: 100, type: docx.WidthType.PERCENTAGE }
        })];
      }

      case 'softSkillsGrid': {
        // 2-column descriptive grid
        const skills = node.cells || [];
        const totalWidth = 9000;
        const colWidth = Math.floor(totalWidth / 2);
        const accentHex = this.getColor('accent');
        const primaryHex = this.getColor('primary');
        const secondaryHex = this.getColor('text.secondary');

        const buildSkillCell = (skill) => new docx.TableCell({
          children: [
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: '◆  ', bold: true, size: this.toHalfPt(11), color: accentHex }),
                new docx.TextRun({
                  text: skill.title,
                  bold: true, size: this.toHalfPt(11.5), color: primaryHex
                })
              ],
              spacing: { after: 100 }
            }),
            ...(skill.description ? [new docx.Paragraph({
              children: [new docx.TextRun({
                text: skill.description,
                size: this.toHalfPt(9.5), color: secondaryHex
              })],
              spacing: { after: 0, line: 280 },
              indent: { left: 240 }
            })] : [])
          ],
          width: { size: colWidth, type: docx.WidthType.DXA },
          margins: { top: 120, bottom: 160, left: 180, right: 180 },
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
        for (let i = 0; i < skills.length; i += 2) {
          const rowCells = skills.slice(i, i + 2).map(buildSkillCell);
          while (rowCells.length < 2) rowCells.push(emptyCell());
          rows.push(new docx.TableRow({ children: rowCells }));
        }

        return [
          new docx.Table({
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
          }),
          new docx.Paragraph({ children: [], spacing: { after: 120 } })
        ];
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

    return [
      new docx.Table({
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
      }),
      new docx.Paragraph({ children: [], spacing: { after: 360 } })
    ];
  }

  /**
   * Render decorative spacers/rules (role decides the exact visual)
   */
  renderSpacer(node) {
    switch (node.role) {
      case 'coverTopRule':
        // Top accent rule — short bold mark above the name (executive
        // editorial style). Implemented as a 1-cell left-anchored table so
        // the rule does not span full width.
        return [
          new docx.Table({
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
          }),
          new docx.Paragraph({ children: [], spacing: { after: 600 } })
        ];

      case 'coverDivider':
        return [new docx.Paragraph({
          children: [new docx.TextRun({ text: '' })],
          border: {
            bottom: {
              color: this.getColor('border'),
              size: 6, space: 1, style: docx.BorderStyle.SINGLE
            }
          },
          spacing: { after: 360 }
        })];

      case 'inlineHeaderRule':
        // Enhanced divider with primary color matching web design
        return [new docx.Paragraph({
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
        })];

      case 'projectDetailRule':
        // Separator between project summary and expanded details
        return [new docx.Paragraph({
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
        })];

      case 'testimonialDivider':
        // Thin centered rule between adjacent testimonials
        return [new docx.Paragraph({
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
        })];

      case 'pmCapabilitiesEnd':
        // PDF-only trailing gap node.
        return [];

      default:
        return [];
    }
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
            size: this.toHalfPt(16),
            color: this.getColor('primary'),
            characterSpacing: 60
          })
        ],
        spacing: {
          before: pageBreakBefore ? 0 : 360,
          after: 240,
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
          size: this.toHalfPt(12.5),
          color: this.getColor('primary')
        })
      ],
      spacing: {
        before: pageBreakBefore ? 0 : 280,
        after: 160,
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
   * Check if docx.js is available
   */
  isAvailable() {
    return typeof docx !== 'undefined' && typeof saveAs !== 'undefined';
  }
}

// Export singleton instance
window.DOCXExporter = new DOCXExporter();
