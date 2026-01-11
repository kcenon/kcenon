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
        professionalPortfolio: '프로페셔널 포트폴리오'
      },
      en: {
        expertise: 'EXPERTISE',
        projects: 'PROJECTS',
        career: 'CAREER',
        testimonials: 'TESTIMONIALS',
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
        professionalPortfolio: 'Professional Portfolio'
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
   * @returns {Object} Default DOCX styles
   */
  getFallbackStyles() {
    return {
      heading1: {
        run: { size: 48, bold: true, color: '1F2937' },
        paragraph: { spacing: { after: 200 } }
      },
      heading2: {
        run: { size: 32, bold: true, color: '3B82F6' },
        paragraph: { spacing: { before: 400, after: 200 } }
      },
      heading3: {
        run: { size: 24, bold: true, color: '374151' },
        paragraph: { spacing: { before: 250, after: 120 } }
      },
      normal: {
        run: { size: 22, color: '4B5563' },
        paragraph: { spacing: { after: 100 } }
      },
      small: {
        run: { size: 18, color: '9CA3AF' }
      },
      tag: {
        run: { size: 16, color: '3B82F6' }
      },
      colors: {
        primary: '3B82F6',
        secondary: '6B7280',
        textPrimary: '1F2937',
        textSecondary: '374151',
        textMuted: '9CA3AF',
        success: '22C55E',
        warning: 'F59E0B',
        border: 'E5E7EB'
      },
      spacing: {
        listIndent: 360,
        itemSpacing: 60
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
      // Use fallback colors
      const fallbackColors = {
        'primary': '3B82F6',
        'secondary': '6B7280',
        'text.primary': '1F2937',
        'text.secondary': '374151',
        'text.muted': '9CA3AF',
        'background.page': 'FFFFFF',
        'background.section': 'F9FAFB',
        'background.table': 'F3F4F6',
        'success': '22C55E',
        'warning': 'F59E0B',
        'border': 'E5E7EB'
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
      sections = ['expertise', 'projects', 'career', 'testimonials'],
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
      // Insert page break before section (except the first)
      if (pageBreakBetweenSections && index > 0) {
        children.push(new docx.Paragraph({
          children: [],
          pageBreakBefore: true
        }));
      }

      switch (section) {
        case 'expertise':
          if (data.expertise) {
            children.push(...this.buildExpertiseSection(data.expertise));
          }
          break;
        case 'projects':
          if (data.projects) {
            children.push(...this.buildProjectsSection(data.projects));
          }
          break;
        case 'career':
          if (data.career) {
            children.push(...this.buildCareerSection(data.career));
          }
          break;
        case 'testimonials':
          if (data.testimonials) {
            children.push(...this.buildTestimonialsSection(data.testimonials));
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
   * Build document header
   */
  buildHeader(info) {
    const labels = this.getLabels();
    const locale = this.currentLang === 'ko' ? 'ko-KR' : 'en-US';

    return [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: info.author || info.title,
            bold: true,
            size: this.toHalfPt(this.getTypography('fontSize.h1') + 4),
            color: this.getColor('text.primary')
          })
        ],
        spacing: { after: 100 }
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: labels.professionalPortfolio,
            size: this.toHalfPt(this.getTypography('fontSize.h2') - 2),
            color: this.getColor('text.muted')
          })
        ],
        spacing: { after: 100 }
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: new Date().toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long'
            }),
            size: this.toHalfPt(this.getTypography('fontSize.body')),
            color: this.getColor('text.muted')
          })
        ],
        spacing: { after: 400 }
      }),
      new docx.Paragraph({
        children: [new docx.TextRun({ text: '' })],
        border: {
          bottom: { color: this.getColor('border'), space: 1, style: docx.BorderStyle.SINGLE, size: 6 }
        },
        spacing: { after: 300 }
      })
    ];
  }

  /**
   * Build expertise section
   */
  buildExpertiseSection(expertise) {
    const children = [];
    const labels = this.getLabels();

    children.push(this.createHeading2(labels.expertise));

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
   */
  buildProjectsSection(projects) {
    const children = [];
    const labels = this.getLabels();

    children.push(this.createHeading2(labels.projects));

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

    // Title
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: this.getText(project.title) || this.getText(project.name) || 'Untitled Project',
          bold: true,
          size: this.toHalfPt(this.getTypography('fontSize.h3') - 2),
          color: this.getColor('text.primary')
        })
      ],
      spacing: { before: 150, after: 50 },
      keepLines: true,
      keepNext: true
    }));

    // Company and period
    if (project.company || project.period) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: [this.getText(project.company), this.getText(project.period)].filter(Boolean).join(' | '),
            size: this.toHalfPt(this.getTypography('fontSize.small')),
            color: this.getColor('text.muted'),
            italics: true
          })
        ],
        spacing: { after: this.getSpacing('list.itemSpacing') },
        keepLines: true,
        keepNext: true
      }));
    }

    // Description
    if (project.description) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: this.stripHtml(this.getText(project.description)),
            size: this.toHalfPt(this.getTypography('fontSize.body')),
            color: this.getColor('text.secondary')
          })
        ],
        spacing: { after: this.getSpacing('list.itemSpacing') },
        keepLines: true,
        keepNext: true
      }));
    }

    // Tags
    const tags = this.getArray(project.tags);
    if (tags.length > 0) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: tags.map(tag => this.getText(tag)).join(' • '),
            size: this.toHalfPt(this.getTypography('fontSize.tiny')),
            color: this.getColor('primary')
          })
        ],
        spacing: { after: 80 },
        keepLines: true,
        keepNext: project.expanded ? true : false
      }));
    }

    // Expanded details
    if (project.expanded) {
      const roles = this.getArray(project.expanded.roles);
      if (roles.length > 0) {
        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: labels.keyResponsibilities,
              bold: true,
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: this.getColor('text.secondary')
            })
          ],
          spacing: { before: 60, after: 40 },
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
                size: this.toHalfPt(this.getTypography('fontSize.small')),
                color: this.getColor('text.secondary')
              })
            ],
            spacing: { after: 30 },
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
              text: labels.achievements,
              bold: true,
              size: this.toHalfPt(this.getTypography('fontSize.small')),
              color: this.getColor('text.secondary')
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
                size: this.toHalfPt(this.getTypography('fontSize.small')),
                color: this.getColor('text.secondary')
              })
            ],
            spacing: { after: 30 },
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
   */
  buildCareerSection(career) {
    const children = [];
    const labels = this.getLabels();

    children.push(this.createHeading2(labels.career));

    if (career.timeline && career.timeline.length > 0) {
      career.timeline.forEach(item => {
        // Determine what content exists for this item
        const hasRole = item.role || item.position;
        const hasDescription = item.description;
        const achievements = this.getArray(item.achievements);
        const hasAchievements = achievements.length > 0;
        const hasNote = item.note;
        const tags = this.getArray(item.tags);
        const hasTags = tags.length > 0;

        // Company name with optional badge
        const companyRuns = [
          new docx.TextRun({
            text: this.getText(item.company) || this.getText(item.title) || '',
            bold: true,
            size: this.toHalfPt(this.getTypography('fontSize.h3') - 2),
            color: this.getColor('text.primary')
          })
        ];

        if (item.badge) {
          companyRuns.push(new docx.TextRun({
            text: ` [${this.getText(item.badge)}]`,
            bold: true,
            size: this.toHalfPt(this.getTypography('fontSize.small')),
            color: this.getColor('warning')
          }));
        }

        companyRuns.push(new docx.TextRun({
          text: `  ${this.getText(item.period) || ''}`,
          size: this.toHalfPt(this.getTypography('fontSize.small')),
          color: this.getColor('text.muted')
        }));

        children.push(new docx.Paragraph({
          children: companyRuns,
          spacing: { before: 150, after: 50 },
          keepLines: true,
          keepNext: true
        }));

        // Role
        if (hasRole) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: this.getText(item.role) || this.getText(item.position),
                size: this.toHalfPt(this.getTypography('fontSize.body')),
                color: this.getColor('primary')
              })
            ],
            spacing: { after: this.getSpacing('list.itemSpacing') },
            keepLines: true,
            keepNext: hasDescription || hasAchievements || hasNote || hasTags
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
            keepNext: hasAchievements || hasNote || hasTags
          }));
        }

        // Achievements
        if (hasAchievements) {
          achievements.forEach((achievement, index) => {
            const isLast = index === achievements.length - 1;
            children.push(new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `• ${this.stripHtml(this.getText(achievement))}`,
                  size: this.toHalfPt(this.getTypography('fontSize.small')),
                  color: this.getColor('text.secondary')
                })
              ],
              spacing: { after: 40 },
              indent: { left: this.getSpacing('list.indent') },
              keepLines: true,
              keepNext: !isLast || hasNote || hasTags
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
   */
  buildTestimonialsSection(testimonials) {
    const children = [];
    const labels = this.getLabels();

    children.push(this.createHeading2(labels.testimonials));

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
            size: isFeatured ? this.toHalfPt(this.getTypography('fontSize.body') + 2) : this.toHalfPt(this.getTypography('fontSize.body')),
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
   * Create heading 2
   */
  createHeading2(text) {
    return new docx.Paragraph({
      children: [
        new docx.TextRun({
          text,
          bold: true,
          size: this.toHalfPt(this.getTypography('fontSize.h2')),
          color: this.getColor('primary')
        })
      ],
      spacing: { before: this.getSpacing('section.marginTop'), after: this.getSpacing('section.marginBottom') }
    });
  }

  /**
   * Create heading 3
   */
  createHeading3(text) {
    return new docx.Paragraph({
      children: [
        new docx.TextRun({
          text,
          bold: true,
          size: this.toHalfPt(this.getTypography('fontSize.h3')),
          color: this.getColor('text.secondary')
        })
      ],
      spacing: { before: 250, after: 120 }
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
