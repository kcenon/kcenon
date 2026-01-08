/**
 * DOCX Exporter - Generate Word documents from portfolio data using docx.js
 */

class DOCXExporter {
  constructor() {
    this.styles = {
      heading1: {
        run: { size: 48, bold: true, color: '1F2937' },
        paragraph: { spacing: { after: 200 } }
      },
      heading2: {
        run: { size: 32, bold: true, color: '3B82F6' },
        paragraph: { spacing: { before: 300, after: 150 } }
      },
      heading3: {
        run: { size: 24, bold: true, color: '374151' },
        paragraph: { spacing: { before: 200, after: 100 } }
      },
      normal: {
        run: { size: 22, color: '4B5563' },
        paragraph: { spacing: { after: 100 } }
      }
    };
  }

  /**
   * Generate DOCX from portfolio data
   * @param {Object} data - Portfolio data object
   * @param {Object} options - Export options
   */
  async generateDOCX(data, options = {}) {
    const {
      sections = ['expertise', 'projects', 'career', 'testimonials'],
      filename = 'portfolio.docx',
      title = 'Portfolio',
      author = 'Dongcheol Shin'
    } = options;

    try {
      const doc = this.buildDocument(data, sections, { title, author });
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

    // Header
    children.push(...this.buildHeader(info));

    // Build each section
    sections.forEach(section => {
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
    return [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: info.author || info.title,
            bold: true,
            size: 56,
            color: '1F2937'
          })
        ],
        spacing: { after: 100 }
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: 'Professional Portfolio',
            size: 28,
            color: '6B7280'
          })
        ],
        spacing: { after: 100 }
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            }),
            size: 22,
            color: '9CA3AF'
          })
        ],
        spacing: { after: 400 }
      }),
      new docx.Paragraph({
        children: [new docx.TextRun({ text: '' })],
        border: {
          bottom: { color: 'E5E7EB', space: 1, style: docx.BorderStyle.SINGLE, size: 6 }
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

    children.push(this.createHeading2('EXPERTISE'));

    // Categories
    if (expertise.categories && expertise.categories.length > 0) {
      expertise.categories.forEach(category => {
        children.push(this.createHeading3(category.title || 'Category'));

        if (category.items && category.items.length > 0) {
          category.items.forEach(item => {
            children.push(new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `• ${this.stripHtml(item)}`,
                  size: 22,
                  color: '4B5563'
                })
              ],
              spacing: { after: 60 },
              indent: { left: 360 }
            }));
          });
        }

        // Handle tags for Technologies category
        if (category.tags && category.tags.length > 0) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: category.tags.join(' | '),
                size: 20,
                color: '3B82F6'
              })
            ],
            spacing: { after: 100 },
            indent: { left: 360 }
          }));
        }
      });
    }

    // Hero Capabilities
    if (expertise.heroCapabilities && expertise.heroCapabilities.length > 0) {
      children.push(this.createHeading3('Core Capabilities'));

      expertise.heroCapabilities.forEach(cap => {
        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `${cap.title}: `,
              bold: true,
              size: 22,
              color: '1F2937'
            }),
            new docx.TextRun({
              text: cap.description,
              size: 22,
              color: '4B5563'
            })
          ],
          spacing: { after: 60 },
          indent: { left: 360 }
        }));
      });
    }

    // Certifications
    if (expertise.certifications && expertise.certifications.length > 0) {
      children.push(this.createHeading3('Certifications'));

      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: expertise.certifications.map(cert => cert.name).join(' | '),
            bold: true,
            size: 22,
            color: '22C55E'
          })
        ],
        spacing: { after: 150 },
        indent: { left: 360 }
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

    children.push(this.createHeading2('PROJECTS'));

    // Featured projects
    if (projects.featured && projects.featured.length > 0) {
      children.push(this.createHeading3('Featured Projects'));
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

    // Title
    children.push(new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: project.title || project.name || 'Untitled Project',
          bold: true,
          size: 24,
          color: '1F2937'
        })
      ],
      spacing: { before: 150, after: 50 }
    }));

    // Company and period
    if (project.company || project.period) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: [project.company, project.period].filter(Boolean).join(' | '),
            size: 20,
            color: '6B7280',
            italics: true
          })
        ],
        spacing: { after: 60 }
      }));
    }

    // Description
    if (project.description) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: this.stripHtml(project.description),
            size: 22,
            color: '4B5563'
          })
        ],
        spacing: { after: 60 }
      }));
    }

    // Tags
    if (project.tags && project.tags.length > 0) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: project.tags.join(' • '),
            size: 18,
            color: '3B82F6'
          })
        ],
        spacing: { after: 80 }
      }));
    }

    // Expanded details
    if (project.expanded) {
      if (project.expanded.roles && project.expanded.roles.length > 0) {
        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: 'Key Responsibilities:',
              bold: true,
              size: 20,
              color: '374151'
            })
          ],
          spacing: { before: 60, after: 40 }
        }));

        project.expanded.roles.forEach(role => {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `• ${this.stripHtml(role)}`,
                size: 20,
                color: '4B5563'
              })
            ],
            spacing: { after: 30 },
            indent: { left: 360 }
          }));
        });
      }

      if (project.expanded.achievements && project.expanded.achievements.length > 0) {
        children.push(new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: 'Achievements:',
              bold: true,
              size: 20,
              color: '374151'
            })
          ],
          spacing: { before: 60, after: 40 }
        }));

        project.expanded.achievements.forEach(achievement => {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `• ${this.stripHtml(achievement)}`,
                size: 20,
                color: '4B5563'
              })
            ],
            spacing: { after: 30 },
            indent: { left: 360 }
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

    children.push(this.createHeading2('CAREER'));

    if (career.timeline && career.timeline.length > 0) {
      career.timeline.forEach(item => {
        // Company name with optional badge
        const companyRuns = [
          new docx.TextRun({
            text: item.company || item.title || '',
            bold: true,
            size: 24,
            color: '1F2937'
          })
        ];

        if (item.badge) {
          companyRuns.push(new docx.TextRun({
            text: ` [${item.badge}]`,
            bold: true,
            size: 20,
            color: 'F59E0B'
          }));
        }

        companyRuns.push(new docx.TextRun({
          text: `  ${item.period || ''}`,
          size: 20,
          color: '9CA3AF'
        }));

        children.push(new docx.Paragraph({
          children: companyRuns,
          spacing: { before: 150, after: 50 }
        }));

        // Role
        if (item.role || item.position) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: item.role || item.position,
                size: 22,
                color: '3B82F6'
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Description
        if (item.description) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: this.stripHtml(item.description),
                size: 22,
                color: '4B5563'
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Achievements
        if (item.achievements && item.achievements.length > 0) {
          item.achievements.forEach(achievement => {
            children.push(new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `• ${this.stripHtml(achievement)}`,
                  size: 20,
                  color: '4B5563'
                })
              ],
              spacing: { after: 40 },
              indent: { left: 360 }
            }));
          });
        }

        // Note
        if (item.note) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: this.stripHtml(item.note),
                size: 20,
                italics: true,
                color: '6B7280'
              })
            ],
            spacing: { after: 60 }
          }));
        }

        // Tags
        if (item.tags && item.tags.length > 0) {
          children.push(new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: item.tags.join(' | '),
                size: 18,
                color: '3B82F6'
              })
            ],
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

    children.push(this.createHeading2('TESTIMONIALS'));

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

    // Quote
    if (testimonial.quote || testimonial.text) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `"${this.stripHtml(testimonial.quote || testimonial.text)}"`,
            italics: true,
            size: isFeatured ? 24 : 22,
            color: '374151'
          })
        ],
        spacing: { before: 150, after: 80 },
        indent: { left: 360, right: 360 }
      }));
    }

    // Author info
    const authorRuns = [];
    if (testimonial.author || testimonial.name) {
      authorRuns.push(new docx.TextRun({
        text: '— ' + (testimonial.author || testimonial.name),
        bold: true,
        size: 20,
        color: '374151'
      }));
    }
    if (testimonial.role) {
      authorRuns.push(new docx.TextRun({
        text: `, ${testimonial.role}`,
        size: 20,
        color: '6B7280'
      }));
    }
    if (testimonial.relation) {
      authorRuns.push(new docx.TextRun({
        text: ` (${testimonial.relation})`,
        size: 20,
        color: '9CA3AF'
      }));
    }

    if (authorRuns.length > 0) {
      children.push(new docx.Paragraph({
        children: authorRuns,
        spacing: { after: 80 },
        indent: { left: 360 }
      }));
    }

    // Labels
    if (testimonial.labels && testimonial.labels.length > 0) {
      children.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: testimonial.labels.map(l => l.text).join(' | '),
            size: 18,
            color: '3B82F6'
          })
        ],
        spacing: { after: 150 },
        indent: { left: 360 }
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
          size: 32,
          color: '3B82F6'
        })
      ],
      spacing: { before: 400, after: 200 }
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
          size: 24,
          color: '374151'
        })
      ],
      spacing: { before: 250, after: 120 }
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
              size: 20,
              color: isHeader ? '1F2937' : '4B5563'
            })
          ]
        })
      ],
      shading: isHeader ? { fill: 'F3F4F6' } : undefined,
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
    const names = {
      medicalImaging: 'Medical Imaging',
      orthodontic: 'Orthodontic Systems',
      equipmentControl: 'Equipment Control',
      enterprise: 'Enterprise Solutions',
      openSource: 'Open Source'
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
