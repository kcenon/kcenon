/**
 * PDF Exporter - Generate PDF from portfolio data using pdfmake
 */

class PDFExporter {
  constructor() {
    this.defaultStyles = {
      header: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 20, 0, 8]
      },
      sectionTitle: {
        fontSize: 14,
        bold: true,
        color: '#3B82F6',
        margin: [0, 15, 0, 5]
      },
      tableHeader: {
        bold: true,
        fillColor: '#f3f4f6',
        margin: [5, 5, 5, 5]
      }
    };
  }

  /**
   * Generate PDF from portfolio data
   * @param {Object} data - Portfolio data object
   * @param {Object} options - Export options
   */
  async generatePDF(data, options = {}) {
    const {
      sections = ['expertise', 'projects', 'career', 'testimonials'],
      filename = 'portfolio.pdf',
      title = 'Portfolio',
      author = 'Dongcheol Shin'
    } = options;

    try {
      const docDefinition = this.buildDocument(data, sections, { title, author });

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

    // Header
    content.push(this.buildHeader(info));

    // Build each section
    sections.forEach(section => {
      switch (section) {
        case 'expertise':
          if (data.expertise) {
            content.push(...this.buildExpertiseSection(data.expertise));
          }
          break;
        case 'projects':
          if (data.projects) {
            content.push(...this.buildProjectsSection(data.projects));
          }
          break;
        case 'career':
          if (data.career) {
            content.push(...this.buildCareerSection(data.career));
          }
          break;
        case 'testimonials':
          if (data.testimonials) {
            content.push(...this.buildTestimonialsSection(data.testimonials));
          }
          break;
      }
    });

    return {
      info: {
        title: info.title,
        author: info.author,
        subject: 'Professional Portfolio',
        creator: 'Portfolio Admin'
      },
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
        lineHeight: 1.4
      },
      styles: this.defaultStyles,
      content
    };
  }

  /**
   * Build document header
   */
  buildHeader(info) {
    return {
      columns: [
        {
          text: info.author || info.title,
          style: 'header'
        },
        {
          text: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          }),
          alignment: 'right',
          color: '#6b7280',
          margin: [0, 5, 0, 0]
        }
      ],
      margin: [0, 0, 0, 20]
    };
  }

  /**
   * Build expertise section
   */
  buildExpertiseSection(expertise) {
    const content = [];

    content.push({
      text: 'EXPERTISE',
      style: 'subheader'
    });

    // Categories
    if (expertise.categories && expertise.categories.length > 0) {
      expertise.categories.forEach(category => {
        content.push({
          text: category.title,
          style: 'sectionTitle'
        });

        if (category.items && category.items.length > 0) {
          content.push({
            ul: category.items,
            margin: [10, 0, 0, 10]
          });
        }
      });
    }

    // Certifications
    if (expertise.certifications && expertise.certifications.length > 0) {
      content.push({
        text: 'Certifications',
        style: 'sectionTitle'
      });

      const certTable = {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Certification', style: 'tableHeader' },
              { text: 'Issuer', style: 'tableHeader' },
              { text: 'Year', style: 'tableHeader' }
            ],
            ...expertise.certifications.map(cert => [
              cert.name || cert.title || '',
              cert.issuer || '',
              cert.year || ''
            ])
          ]
        },
        margin: [0, 5, 0, 15]
      };
      content.push(certTable);
    }

    return content;
  }

  /**
   * Build projects section
   */
  buildProjectsSection(projects) {
    const content = [];

    content.push({
      text: 'PROJECTS',
      style: 'subheader'
    });

    // Featured projects first
    if (projects.featured && projects.featured.length > 0) {
      content.push({
        text: 'Featured Projects',
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

    items.push({
      text: project.title || project.name || 'Untitled Project',
      bold: true,
      fontSize: 12,
      margin: [0, 8, 0, 3]
    });

    if (project.company || project.period) {
      items.push({
        text: [project.company, project.period].filter(Boolean).join(' | '),
        color: '#6b7280',
        fontSize: 9,
        margin: [0, 0, 0, 3]
      });
    }

    if (project.description) {
      items.push({
        text: project.description,
        margin: [0, 0, 0, 5]
      });
    }

    if (project.tags && project.tags.length > 0) {
      items.push({
        text: project.tags.join(' | '),
        color: '#3B82F6',
        fontSize: 8,
        margin: [0, 0, 0, 5]
      });
    }

    return {
      stack: items,
      margin: [0, 0, 0, 10]
    };
  }

  /**
   * Build career section
   */
  buildCareerSection(career) {
    const content = [];

    content.push({
      text: 'CAREER',
      style: 'subheader'
    });

    if (career.timeline && career.timeline.length > 0) {
      career.timeline.forEach(item => {
        const entry = [];

        entry.push({
          columns: [
            {
              text: item.company || item.title || '',
              bold: true,
              fontSize: 12,
              width: '*'
            },
            {
              text: item.period || '',
              alignment: 'right',
              color: '#6b7280',
              fontSize: 9,
              width: 'auto'
            }
          ],
          margin: [0, 8, 0, 2]
        });

        if (item.role || item.position) {
          entry.push({
            text: item.role || item.position,
            color: '#3B82F6',
            fontSize: 10,
            margin: [0, 0, 0, 3]
          });
        }

        if (item.description) {
          entry.push({
            text: item.description,
            margin: [0, 0, 0, 3]
          });
        }

        if (item.achievements && item.achievements.length > 0) {
          entry.push({
            ul: item.achievements,
            margin: [10, 3, 0, 5]
          });
        }

        content.push({
          stack: entry,
          margin: [0, 0, 0, 10]
        });
      });
    }

    return content;
  }

  /**
   * Build testimonials section
   */
  buildTestimonialsSection(testimonials) {
    const content = [];

    content.push({
      text: 'TESTIMONIALS',
      style: 'subheader'
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
   * Format a single testimonial
   */
  formatTestimonial(testimonial, isFeatured) {
    const items = [];

    if (testimonial.quote || testimonial.text) {
      items.push({
        text: `"${testimonial.quote || testimonial.text}"`,
        italics: true,
        fontSize: isFeatured ? 11 : 10,
        margin: [10, 0, 10, 8],
        color: '#374151'
      });
    }

    items.push({
      text: [
        { text: testimonial.author || testimonial.name || '', bold: true },
        { text: testimonial.role ? `, ${testimonial.role}` : '' },
        { text: testimonial.company ? ` at ${testimonial.company}` : '' }
      ],
      fontSize: 9,
      color: '#6b7280',
      margin: [10, 0, 0, 0]
    });

    return {
      stack: items,
      margin: [0, 10, 0, 15]
    };
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
   * Check if pdfmake is available
   */
  isAvailable() {
    return typeof pdfMake !== 'undefined';
  }
}

// Export singleton instance
window.PDFExporter = new PDFExporter();
