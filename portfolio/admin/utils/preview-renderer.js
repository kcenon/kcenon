/**
 * Document Preview Renderer
 * Renders a real-time visual preview of the export document in a canvas element
 */

class DocumentPreviewRenderer {
  constructor(containerElement) {
    this.container = containerElement;
    this.canvas = null;
    this.ctx = null;
    this.currentPage = 1;
    this.totalPages = 1;
    this.zoom = 1.0;
    this.pageData = [];
    this.theme = null;
    this.debounceTimer = null;
    this.data = null;
    this.sections = [];

    this.init();
  }

  /**
   * Initialize canvas and controls
   */
  init() {
    this.container.innerHTML = `
      <div class="preview-toolbar">
        <div class="zoom-controls">
          <button type="button" class="preview-btn" data-action="zoom-out" title="Zoom Out">−</button>
          <span class="zoom-level">100%</span>
          <button type="button" class="preview-btn" data-action="zoom-in" title="Zoom In">+</button>
        </div>
        <div class="page-controls">
          <button type="button" class="preview-btn" data-action="prev-page" title="Previous Page">◀</button>
          <span class="page-indicator">1 / 1</span>
          <button type="button" class="preview-btn" data-action="next-page" title="Next Page">▶</button>
        </div>
      </div>
      <div class="preview-viewport">
        <canvas class="preview-canvas"></canvas>
      </div>
    `;

    this.canvas = this.container.querySelector('.preview-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.zoomDisplay = this.container.querySelector('.zoom-level');
    this.pageDisplay = this.container.querySelector('.page-indicator');

    this.bindEvents();
  }

  /**
   * Bind event listeners for controls
   */
  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;

      switch (action) {
        case 'zoom-in':
          this.zoomIn();
          break;
        case 'zoom-out':
          this.zoomOut();
          break;
        case 'prev-page':
          this.prevPage();
          break;
        case 'next-page':
          this.nextPage();
          break;
      }
    });
  }

  /**
   * Update preview with new theme and data
   * @param {Object} data - Portfolio data
   * @param {Object} theme - Merged theme configuration
   * @param {Array} sections - Selected sections to include
   * @param {Object} options - Additional options
   * @param {boolean} options.pageBreakBetweenSections - Whether to insert page breaks between sections
   */
  update(data, theme, sections, options = {}) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.data = data;
      this.theme = theme;
      this.sections = sections;
      this.options = options;
      this.pageData = this.calculatePages(data, sections, options);
      this.totalPages = this.pageData.length;
      this.currentPage = Math.min(this.currentPage, this.totalPages);
      if (this.currentPage < 1) this.currentPage = 1;
      this.render();
    }, 150);
  }

  /**
   * Calculate page layout and content distribution
   * @param {Object} data - Portfolio data
   * @param {Array} sections - Selected sections
   * @param {Object} options - Additional options
   * @param {boolean} options.pageBreakBetweenSections - Whether to insert page breaks between sections
   * @returns {Array} Array of page objects
   */
  calculatePages(data, sections, options = {}) {
    if (!this.theme || !data) {
      return [{ elements: [{ type: 'empty', text: 'No content available', y: 100 }] }];
    }

    const { pageBreakBetweenSections = false } = options;
    const pages = [];
    const pageHeight = 842;
    const contentHeight = pageHeight - this.theme.spacing.page.marginTop - this.theme.spacing.page.marginBottom;

    let currentPage = { elements: [], currentY: 0 };

    // Add header
    currentPage.elements.push({
      type: 'header',
      text: 'Portfolio',
      y: 0
    });
    currentPage.currentY += 60;

    // Process each section
    sections.forEach((sectionId, sectionIndex) => {
      const sectionData = data[sectionId];
      if (!sectionData) return;

      // Insert page break before section (except the first)
      if (pageBreakBetweenSections && sectionIndex > 0) {
        // Push current page and start a new one
        if (currentPage.elements.length > 0) {
          pages.push(currentPage);
        }
        currentPage = { elements: [], currentY: 0 };
      }

      const sectionElements = this.buildSectionElements(sectionId, sectionData);

      sectionElements.forEach(element => {
        // Check if element fits on current page (groups use total group height)
        if (currentPage.currentY + element.height > contentHeight) {
          pages.push(currentPage);
          currentPage = { elements: [], currentY: 0 };
        }

        // Handle group elements - set relative y positions for items
        if (element.type === 'group' && element.items) {
          element.y = currentPage.currentY;
          let itemY = 0;
          element.items.forEach(item => {
            item.relativeY = itemY;
            itemY += item.height + 3;
          });
        } else {
          element.y = currentPage.currentY;
        }

        currentPage.elements.push(element);
        currentPage.currentY += element.height + 5;
      });
    });

    if (currentPage.elements.length > 0) {
      pages.push(currentPage);
    }

    return pages.length > 0 ? pages : [{ elements: [{ type: 'empty', text: 'No content selected', y: 100 }] }];
  }

  /**
   * Build visual elements for a section
   * @param {string} sectionId - Section identifier
   * @param {Object} data - Section data
   * @returns {Array} Array of element objects (may include groups)
   */
  buildSectionElements(sectionId, data) {
    const elements = [];
    const { typography, colors } = this.theme;

    // Section title
    elements.push({
      type: 'sectionTitle',
      text: this.formatSectionTitle(sectionId),
      height: typography.fontSize.h2 + 20,
      color: colors.primary
    });

    switch (sectionId) {
      case 'expertise':
        this.buildExpertiseElements(elements, data, typography);
        break;

      case 'projects':
        this.buildProjectsElements(elements, data, typography);
        break;

      case 'career':
        this.buildCareerElements(elements, data, typography);
        break;

      case 'testimonials':
        this.buildTestimonialsElements(elements, data, typography);
        break;
    }

    return elements;
  }

  /**
   * Build expertise section elements
   * Groups category title with its items to prevent splitting
   */
  buildExpertiseElements(elements, data, typography) {
    if (data.categories) {
      data.categories.slice(0, 3).forEach(cat => {
        const groupItems = [];
        groupItems.push({
          type: 'subheading',
          text: cat.title,
          height: typography.fontSize.h3 + 10
        });
        if (cat.items) {
          cat.items.slice(0, 4).forEach(item => {
            groupItems.push({
              type: 'bullet',
              text: typeof item === 'string' ? item : item.name,
              height: typography.fontSize.body + 8
            });
          });
        }
        // Push as a group to keep together
        elements.push({
          type: 'group',
          items: groupItems,
          height: groupItems.reduce((sum, item) => sum + item.height, 0) + 5
        });
      });
    }
  }

  /**
   * Build projects section elements
   * Groups project title with description to prevent splitting
   */
  buildProjectsElements(elements, data, typography) {
    const allProjects = [
      ...(data.featured || []),
      ...(data.medicalImaging || []),
      ...(data.orthodontic || []),
      ...(data.equipmentControl || []),
      ...(data.enterprise || []),
      ...(data.openSource || [])
    ].slice(0, 4);

    allProjects.forEach(project => {
      const groupItems = [];
      groupItems.push({
        type: 'projectTitle',
        text: project.title,
        height: typography.fontSize.h3 + 8
      });
      groupItems.push({
        type: 'paragraph',
        text: this.truncate(project.description, 100),
        height: typography.fontSize.body * 2 + 10
      });
      // Push as a group to keep together
      elements.push({
        type: 'group',
        items: groupItems,
        height: groupItems.reduce((sum, item) => sum + item.height, 0) + 5
      });
    });
  }

  /**
   * Build career section elements
   * Groups career entry with date to prevent splitting
   */
  buildCareerElements(elements, data, typography) {
    if (data.timeline) {
      data.timeline.slice(0, 3).forEach(entry => {
        const groupItems = [];
        groupItems.push({
          type: 'careerEntry',
          text: `${entry.company} - ${entry.role}`,
          height: typography.fontSize.h3 + 8
        });
        groupItems.push({
          type: 'date',
          text: entry.period,
          height: typography.fontSize.small + 6
        });
        // Push as a group to keep together
        elements.push({
          type: 'group',
          items: groupItems,
          height: groupItems.reduce((sum, item) => sum + item.height, 0) + 5
        });
      });
    }
  }

  /**
   * Build testimonials section elements
   * Groups quote with attribution to prevent splitting
   */
  buildTestimonialsElements(elements, data, typography) {
    if (data.featured) {
      const groupItems = [];
      groupItems.push({
        type: 'quote',
        text: this.truncate(data.featured.quote, 150),
        height: typography.fontSize.body * 3 + 20
      });
      groupItems.push({
        type: 'attribution',
        text: `— ${data.featured.author}, ${data.featured.role}`,
        height: typography.fontSize.small + 10
      });
      // Push as a group to keep together
      elements.push({
        type: 'group',
        items: groupItems,
        height: groupItems.reduce((sum, item) => sum + item.height, 0) + 5
      });
    }
  }

  /**
   * Format section title
   * @param {string} sectionId - Section identifier
   * @returns {string} Formatted title
   */
  formatSectionTitle(sectionId) {
    const titles = {
      expertise: 'Expertise',
      projects: 'Projects',
      career: 'Career',
      testimonials: 'Testimonials'
    };
    return titles[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  }

  /**
   * Render current page to canvas
   */
  render() {
    const page = this.pageData[this.currentPage - 1];
    if (!page || !this.theme) {
      this.renderEmptyState();
      return;
    }

    const { colors, typography, spacing } = this.theme;

    const scale = this.zoom * 0.4;
    const pageWidth = 595;
    const pageHeight = 842;

    this.canvas.width = pageWidth * scale;
    this.canvas.height = pageHeight * scale;

    this.ctx.scale(scale, scale);

    // Draw page background
    this.ctx.fillStyle = colors.background?.page || '#FFFFFF';
    this.ctx.fillRect(0, 0, pageWidth, pageHeight);

    // Draw page border
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0.5, 0.5, pageWidth - 1, pageHeight - 1);

    const marginLeft = spacing.page.marginLeft;
    const marginTop = spacing.page.marginTop;
    const contentWidth = pageWidth - spacing.page.marginLeft - spacing.page.marginRight;

    // Render elements
    page.elements.forEach(element => {
      const x = marginLeft;
      const y = marginTop + element.y;

      // Handle group elements by rendering each item within the group
      if (element.type === 'group' && element.items) {
        element.items.forEach(item => {
          const itemY = y + (item.relativeY || 0);
          this.renderElement(item, x, itemY, contentWidth, colors, typography);
        });
      } else {
        this.renderElement(element, x, y, contentWidth, colors, typography);
      }
    });

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.updateControls();
  }

  /**
   * Render a single element
   */
  renderElement(element, x, y, contentWidth, colors, typography) {
    const fontFamily = typography.fontFamily?.primary || 'Arial';

    switch (element.type) {
      case 'header':
        this.ctx.font = `bold ${typography.fontSize.h1}px ${fontFamily}`;
        this.ctx.fillStyle = colors.text.primary;
        this.ctx.fillText(element.text, x, y + typography.fontSize.h1);
        // Draw underline
        this.ctx.strokeStyle = colors.border;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + typography.fontSize.h1 + 10);
        this.ctx.lineTo(x + contentWidth, y + typography.fontSize.h1 + 10);
        this.ctx.stroke();
        break;

      case 'sectionTitle':
        this.ctx.font = `bold ${typography.fontSize.h2}px ${fontFamily}`;
        this.ctx.fillStyle = element.color || colors.primary;
        this.ctx.fillText(element.text, x, y + typography.fontSize.h2);
        break;

      case 'subheading':
        this.ctx.font = `bold ${typography.fontSize.h3}px ${fontFamily}`;
        this.ctx.fillStyle = colors.text.secondary;
        this.ctx.fillText(element.text, x, y + typography.fontSize.h3);
        break;

      case 'bullet':
        this.ctx.font = `${typography.fontSize.body}px ${fontFamily}`;
        this.ctx.fillStyle = colors.primary;
        this.ctx.fillText('•', x, y + typography.fontSize.body);
        this.ctx.fillStyle = colors.text.primary;
        this.ctx.fillText(element.text, x + 15, y + typography.fontSize.body);
        break;

      case 'projectTitle':
      case 'careerEntry':
        this.ctx.font = `bold ${typography.fontSize.h3}px ${fontFamily}`;
        this.ctx.fillStyle = colors.text.primary;
        this.ctx.fillText(element.text, x, y + typography.fontSize.h3);
        break;

      case 'paragraph':
        this.ctx.font = `${typography.fontSize.body}px ${fontFamily}`;
        this.ctx.fillStyle = colors.text.secondary;
        this.wrapText(element.text, x, y + typography.fontSize.body, contentWidth);
        break;

      case 'date':
        this.ctx.font = `${typography.fontSize.small}px ${fontFamily}`;
        this.ctx.fillStyle = colors.text.muted;
        this.ctx.fillText(element.text, x, y + typography.fontSize.small);
        break;

      case 'quote':
        this.ctx.font = `italic ${typography.fontSize.body}px ${fontFamily}`;
        this.ctx.fillStyle = colors.text.secondary;
        this.wrapText(`"${element.text}"`, x + 20, y + typography.fontSize.body, contentWidth - 40);
        break;

      case 'attribution':
        this.ctx.font = `${typography.fontSize.small}px ${fontFamily}`;
        this.ctx.fillStyle = colors.text.muted;
        this.ctx.fillText(element.text, x + 20, y + typography.fontSize.small);
        break;

      case 'empty':
        this.ctx.font = `italic ${typography.fontSize.body}px ${fontFamily}`;
        this.ctx.fillStyle = colors.text.muted;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(element.text, 595 / 2, y);
        this.ctx.textAlign = 'left';
        break;
    }
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    const scale = this.zoom * 0.4;
    const pageWidth = 595;
    const pageHeight = 842;

    this.canvas.width = pageWidth * scale;
    this.canvas.height = pageHeight * scale;

    this.ctx.scale(scale, scale);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, pageWidth, pageHeight);
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0.5, 0.5, pageWidth - 1, pageHeight - 1);

    this.ctx.font = 'italic 12px Arial';
    this.ctx.fillStyle = '#9CA3AF';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Preview loading...', pageWidth / 2, pageHeight / 2);
    this.ctx.textAlign = 'left';

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.updateControls();
  }

  /**
   * Wrap text to fit within width
   * @param {string} text - Text to wrap
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} maxWidth - Maximum width
   */
  wrapText(text, x, y, maxWidth) {
    const words = text.split(' ');
    let line = '';
    let lineY = y;
    const lineHeight = parseInt(this.ctx.font) * 1.4;

    words.forEach(word => {
      const testLine = line + word + ' ';
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== '') {
        this.ctx.fillText(line.trim(), x, lineY);
        line = word + ' ';
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    });

    if (line.trim()) {
      this.ctx.fillText(line.trim(), x, lineY);
    }
  }

  /**
   * Truncate text to max length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncate(text, maxLength) {
    if (!text) return '';
    text = text.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * Update control displays
   */
  updateControls() {
    if (this.zoomDisplay) {
      this.zoomDisplay.textContent = `${Math.round(this.zoom * 100)}%`;
    }
    if (this.pageDisplay) {
      this.pageDisplay.textContent = `${this.currentPage} / ${this.totalPages}`;
    }

    // Update button states
    const prevBtn = this.container.querySelector('[data-action="prev-page"]');
    const nextBtn = this.container.querySelector('[data-action="next-page"]');
    const zoomInBtn = this.container.querySelector('[data-action="zoom-in"]');
    const zoomOutBtn = this.container.querySelector('[data-action="zoom-out"]');

    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
    if (zoomInBtn) zoomInBtn.disabled = this.zoom >= 2.0;
    if (zoomOutBtn) zoomOutBtn.disabled = this.zoom <= 0.5;
  }

  /**
   * Zoom in
   */
  zoomIn() {
    if (this.zoom < 2.0) {
      this.zoom += 0.25;
      this.render();
    }
  }

  /**
   * Zoom out
   */
  zoomOut() {
    if (this.zoom > 0.5) {
      this.zoom -= 0.25;
      this.render();
    }
  }

  /**
   * Go to next page
   */
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.render();
    }
  }

  /**
   * Go to previous page
   */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
    }
  }

  /**
   * Destroy the renderer and clean up
   */
  destroy() {
    clearTimeout(this.debounceTimer);
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.canvas = null;
    this.ctx = null;
  }
}

// Export to window
window.DocumentPreviewRenderer = DocumentPreviewRenderer;
