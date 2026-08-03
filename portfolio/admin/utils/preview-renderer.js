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
    this.currentLang = 'ko';

    this.init();
  }

  /**
   * Get current language.
   * Prefers the export modal's language select (the value the exporters
   * receive), falling back to the site language.
   * @returns {string} Current language code ('ko' or 'en')
   */
  getLang() {
    const select = document.getElementById('export-language');
    if (select && (select.value === 'ko' || select.value === 'en')) {
      return select.value;
    }
    return window.currentLanguage || window.getLanguage?.() || 'ko';
  }

  /**
   * Get text from multilingual object { ko: "...", en: "..." }.
   * Delegates to the shared ExportContent helper so the preview resolves
   * text exactly like the exporters.
   * @param {*} obj - Multilingual object or string
   * @returns {string} Text in current language
   */
  getText(obj) {
    if (window.ExportContent) {
      return window.ExportContent.getTextIn(obj, this.currentLang);
    }
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[this.currentLang] || obj.ko || obj.en || '';
  }

  /**
   * Get array from multilingual object { ko: [...], en: [...] }.
   * Delegates to the shared ExportContent helper.
   * @param {*} obj - Multilingual array object or array
   * @returns {Array} Array in current language
   */
  getArray(obj) {
    if (window.ExportContent) {
      return window.ExportContent.getArrayIn(obj, this.currentLang);
    }
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return obj[this.currentLang] || obj.ko || obj.en || [];
  }

  /**
   * Get the localized export label dictionary shared with the exporters.
   * @returns {Object} Label dictionary (empty object when unavailable)
   */
  getExportLabels() {
    return window.ExportContent ? window.ExportContent.getLabels(this.currentLang) : {};
  }

  /**
   * Strip HTML tags from a text value (same as the exporters' stripHtml).
   * @param {string} text - Text possibly containing HTML tags
   * @returns {string} Plain text
   */
  stripHtml(text) {
    if (!text) return '';
    return String(text).replace(/<[^>]*>/g, '');
  }

  /**
   * Calculate duration from period string.
   * Delegates to the shared ExportContent implementation (same rules as
   * both exporters).
   * @param {string|Object} period - Period string or multilingual object
   * @returns {string|null} Formatted duration string
   */
  calculateDuration(period) {
    if (!window.ExportContent) return null;
    return window.ExportContent.calculateDuration(period, this.currentLang);
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
   * @param {boolean} [options.includeCoverPage] - Show the cover page (defaults to true, like the exporters)
   * @param {boolean} [options.includeCoverLetter] - Show the cover letter (defaults to the export-modal checkbox)
   * @param {string[]} [options.personalInfoFields] - Personal-info field IDs (defaults to the export-modal checkboxes)
   * @param {string} [options.language] - Language code (defaults to the export-modal language select)
   */
  update(data, theme, sections, options = {}) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.data = data;
      this.theme = theme;
      this.sections = sections;
      this.options = options;
      // Set current language for multilingual support
      this.currentLang = options.language || this.getLang();
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

    const resolved = this.resolveExportOptions(options);
    const pageHeight = 842;
    const contentHeight = pageHeight - this.theme.spacing.page.marginTop - this.theme.spacing.page.marginBottom;

    const state = { pages: [], page: { elements: [], currentY: 0 } };

    // Cover page — both exporters include it by default (admin.js never
    // disables it), so the preview shows it as page 1.
    if (resolved.includeCoverPage) {
      this.flowElements(this.buildCoverPageElements(data, resolved.personalInfoFields), state, contentHeight);
    }

    // Cover letter — occupies its own page right after the cover, matching
    // both exporters (pageBreakBefore on the letter).
    let letterPlaced = false;
    if (resolved.includeCoverLetter) {
      const template = this.loadCoverLetterTemplate();
      if (template) {
        this.breakPage(state);
        this.flowElements(this.buildCoverLetterElements(template), state, contentHeight);
        letterPlaced = true;
      }
    }

    // Inline header replaces the cover page when the cover is disabled
    // (exporters render buildHeader only when includeCoverPage is false).
    if (!resolved.includeCoverPage) {
      if (letterPlaced) this.breakPage(state);
      const author = this.currentLang === 'ko' ? '신동철' : 'Dongcheol Shin';
      state.page.elements.push({ type: 'header', text: author, y: state.page.currentY, height: 60 });
      state.page.currentY += 60;
    }

    // Sections. Exporter rule: once a cover page or cover letter is placed,
    // every section starts on a new page; otherwise page breaks follow the
    // "page break between sections" option (skipping the first section).
    const headPlaced = resolved.includeCoverPage || letterPlaced;
    sections.forEach((sectionId, sectionIndex) => {
      const sectionData = data[sectionId];
      if (!sectionData) return;

      const breakBefore = headPlaced
        ? true
        : (resolved.pageBreakBetweenSections && sectionIndex > 0);
      if (breakBefore) this.breakPage(state);

      this.flowElements(this.buildSectionElements(sectionId, sectionData), state, contentHeight);
    });

    if (state.page.elements.length > 0) {
      state.pages.push(state.page);
    }

    return state.pages.length > 0 ? state.pages : [{ elements: [{ type: 'empty', text: 'No content selected', y: 100 }] }];
  }

  /**
   * Resolve export options the same way the exporters receive them.
   * admin.js only passes pageBreakBetweenSections to the preview, so the
   * remaining values are read from the live export-modal controls, falling
   * back to the same localStorage keys admin.js persists for the exporters.
   * @param {Object} options - Options passed to update()
   * @returns {Object} Resolved options
   */
  resolveExportOptions(options = {}) {
    const letterCheckbox = document.getElementById('include-cover-letter');
    const includeCoverLetter = options.includeCoverLetter !== undefined
      ? !!options.includeCoverLetter
      : (letterCheckbox
        ? letterCheckbox.checked
        : localStorage.getItem('export-include-cover-letter') === 'true');

    // Both exporters default includeCoverPage to true and admin.js never
    // overrides it, so the preview defaults to true as well.
    const includeCoverPage = options.includeCoverPage !== undefined
      ? !!options.includeCoverPage
      : true;

    const pageBreakBetweenSections = options.pageBreakBetweenSections !== undefined
      ? !!options.pageBreakBetweenSections
      : localStorage.getItem('export-page-break-sections') === 'true';

    let personalInfoFields = Array.isArray(options.personalInfoFields)
      ? options.personalInfoFields
      : null;
    if (!personalInfoFields) {
      personalInfoFields = Array.from(
        document.querySelectorAll('.personal-info-field-input:checked')
      ).map(el => el.dataset.fieldId);
    }

    return { includeCoverLetter, includeCoverPage, pageBreakBetweenSections, personalInfoFields };
  }

  /**
   * Push the current page (when non-empty) and start a new one.
   * @param {Object} state - Pagination state ({ pages, page })
   */
  breakPage(state) {
    if (state.page.elements.length > 0) {
      state.pages.push(state.page);
      state.page = { elements: [], currentY: 0 };
    }
  }

  /**
   * Flow elements onto pages, breaking when an element does not fit.
   * @param {Array} elements - Elements to place
   * @param {Object} state - Pagination state ({ pages, page })
   * @param {number} contentHeight - Usable page height
   */
  flowElements(elements, state, contentHeight) {
    elements.forEach(element => {
      // Check if element fits on current page (groups use total group height)
      if (state.page.currentY + element.height > contentHeight && state.page.elements.length > 0) {
        state.pages.push(state.page);
        state.page = { elements: [], currentY: 0 };
      }

      // Handle group elements - set relative y positions for items
      if (element.type === 'group' && element.items) {
        element.y = state.page.currentY;
        let itemY = 0;
        element.items.forEach(item => {
          item.relativeY = itemY;
          itemY += item.height + 3;
        });
      } else {
        element.y = state.page.currentY;
      }

      state.page.elements.push(element);
      state.page.currentY += element.height + 5;
    });
  }

  /**
   * Load the cover letter template with the same resolution order as the
   * exporters: optional getter functions first, then the template selected
   * in localStorage, then the first available template.
   * @returns {Object|null} Cover letter template or null
   */
  loadCoverLetterTemplate() {
    try {
      if (window.parent && typeof window.parent.getCoverLetterTemplate === 'function') {
        const t = window.parent.getCoverLetterTemplate();
        if (t) return t;
      }
      if (typeof window.getCoverLetterTemplate === 'function') {
        const t = window.getCoverLetterTemplate();
        if (t) return t;
      }

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
        return templates[0];
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Estimate the rendered height of wrapped paragraph text.
   * CJK glyphs count as full-width, Latin glyphs as ~0.55em; line height
   * matches the factor used by wrapText (fontSize * 1.4).
   * @param {string} text - Text to measure
   * @param {number} fontSize - Font size in px
   * @returns {number} Estimated height in px
   */
  estimateWrappedHeight(text, fontSize) {
    const str = String(text || '');
    const contentWidth = 595 - this.theme.spacing.page.marginLeft - this.theme.spacing.page.marginRight;
    let width = 0;
    const cjkPattern = /[ᄀ-ᇿ　-鿿가-힣]/;
    for (const ch of str) {
      width += cjkPattern.test(ch) ? fontSize : fontSize * 0.55;
    }
    const lines = Math.max(1, Math.ceil(width / Math.max(contentWidth, 1)));
    return Math.round(lines * fontSize * 1.4) + 6;
  }

  /**
   * Build cover page elements (name, role line, optional personal info,
   * executive summary, stats infographic, certifications) mirroring the
   * exporters' buildCoverPage.
   * @param {Object} data - Portfolio data
   * @param {string[]} personalInfoFields - Selected personal-info field IDs
   * @returns {Array} Element list
   */
  buildCoverPageElements(data, personalInfoFields) {
    const { typography } = this.theme;
    const lang = this.currentLang;
    const ec = window.ExportContent;
    const elements = [];

    // Same author resolution as the exporters / admin.js
    const author = lang === 'ko' ? '신동철' : 'Dongcheol Shin';
    elements.push({ type: 'coverName', text: author, height: 48 });

    const subtitle = ec ? ec.getCoverSubtitle(lang, data.profile) : '';
    if (subtitle) {
      elements.push({ type: 'coverSubtitle', text: subtitle, height: typography.fontSize.h3 + 14 });
    }

    // Personal info row — only the fields selected in the export modal
    if (personalInfoFields.length > 0 && data.profile && Array.isArray(data.profile.fields)) {
      const byId = new Map(data.profile.fields.map(f => [f.id, f]));
      const parts = personalInfoFields
        .map(id => byId.get(id))
        .filter(Boolean)
        .map(f => this.getText(f.value))
        .filter(v => v && v.length > 0);
      if (parts.length > 0) {
        elements.push({ type: 'date', text: parts.join('   ·   '), height: typography.fontSize.small + 8 });
      }
    }

    const summaryLines = ec ? ec.getCoverSummaryLines(lang, data.profile) : [];
    summaryLines.forEach(line => {
      elements.push({
        type: 'paragraph',
        text: line,
        height: this.estimateWrappedHeight(line, typography.fontSize.body)
      });
    });

    elements.push({ type: 'divider', height: 14 });

    const stats = this.buildCoverStats(data);
    if (stats.length > 0) {
      elements.push({ type: 'statsRow', stats, height: 64 });
    }

    if (data?.expertise?.certifications?.length > 0) {
      const certText = data.expertise.certifications
        .map(c => this.getText(c.name)).join('  ·  ');
      elements.push({
        type: 'date',
        text: lang === 'ko' ? '인증 / Certifications' : 'Certifications',
        height: typography.fontSize.small + 8
      });
      elements.push({ type: 'subheading', text: certText, height: typography.fontSize.h3 + 10 });
    }

    return elements;
  }

  /**
   * Build cover-page stats with the same selection rule as the exporters'
   * buildStatsTable (max 4 entries).
   * @param {Object} data - Portfolio data
   * @returns {Array<{value: string, label: string}>} Stats entries
   */
  buildCoverStats(data) {
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

    return stats.slice(0, 4);
  }

  /**
   * Build cover letter elements (greeting, opening, key points, closing,
   * signature) as text blocks. Bold markers (**) are stripped since the
   * canvas preview renders single-style text.
   * @param {Object} template - Cover letter template
   * @returns {Array} Element list
   */
  buildCoverLetterElements(template) {
    const { typography } = this.theme;
    const body = typography.fontSize.body;
    const elements = [];

    const pushParagraph = (text, extra = 0) => {
      if (!text) return;
      elements.push({
        type: 'paragraph',
        text,
        height: this.estimateWrappedHeight(text, body) + extra
      });
    };

    pushParagraph(this.getText(template.greeting), 6);

    const position = this.getText(template.targetRole);
    const opening = this.getText(template.opening).replace('{position}', position);
    pushParagraph(this.stripHtml(opening).replace(/\*\*/g, ''), 6);

    this.getArray(template.keyPoints).forEach(point => {
      const text = this.stripHtml(this.getText(point)).replace(/\*\*/g, '');
      if (text) pushParagraph(`•  ${text}`);
    });

    pushParagraph(this.stripHtml(this.getText(template.closing)).replace(/\*\*/g, ''), 6);
    pushParagraph(this.getText(template.signature), 10);

    return elements;
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

      case 'manager':
        this.buildManagerElements(elements, data, typography);
        break;

      case 'testimonials':
        this.buildTestimonialsElements(elements, data, typography);
        break;

      case 'education':
        this.buildEducationElements(elements, data, typography);
        break;

      case 'compensation':
        this.buildCompensationElements(elements, data, typography);
        break;
    }

    return elements;
  }

  /**
   * Build manager (Leadership & Management) section elements.
   * Mirrors the exporters' buildManagerSection: PM capabilities (title,
   * description, highlights, metric chips, tags), leadership principles,
   * business impact highlights, and soft skills. keyNumbers are omitted
   * here as well — they appear on the cover-page stats infographic.
   */
  buildManagerElements(elements, data, typography) {
    const labels = this.getExportLabels();
    const lang = this.currentLang;

    // PM Capabilities
    if (Array.isArray(data.pmCapabilities) && data.pmCapabilities.length > 0) {
      elements.push({
        type: 'subheading',
        text: labels.pmCapabilities || 'PM Capabilities',
        height: typography.fontSize.h3 + 10
      });

      data.pmCapabilities.forEach(cap => {
        const groupItems = [];
        groupItems.push({
          type: 'projectTitle',
          text: this.getText(cap.title),
          height: typography.fontSize.h3 + 8
        });
        if (cap.description) {
          const desc = this.getText(cap.description);
          groupItems.push({
            type: 'paragraph',
            text: desc,
            height: this.estimateWrappedHeight(desc, typography.fontSize.body)
          });
        }
        this.getArray(cap.highlights).forEach(h => {
          groupItems.push({
            type: 'bullet',
            text: this.stripHtml(this.getText(h)),
            height: typography.fontSize.body + 8
          });
        });
        const chips = this.buildManagerMetricChips(cap.metrics, lang);
        if (chips.length > 0) {
          groupItems.push({
            type: 'date',
            text: chips.join('   ·   '),
            height: typography.fontSize.small + 6
          });
        }
        const tags = this.getArray(cap.stakeholderTypes).concat(cap.frameworks || []);
        if (tags.length > 0) {
          groupItems.push({
            type: 'date',
            text: tags.map(t => this.getText(t)).join(' · '),
            height: typography.fontSize.small + 6
          });
        }
        elements.push({
          type: 'group',
          items: groupItems,
          height: groupItems.reduce((sum, item) => sum + item.height, 0) + 5
        });
      });
    }

    // Leadership Style principles
    const principles = data.leadershipStyle ? this.getArray(data.leadershipStyle.principles) : [];
    if (principles.length > 0) {
      elements.push({
        type: 'subheading',
        text: labels.leadershipStyle || 'Leadership Style',
        height: typography.fontSize.h3 + 10
      });
      principles.forEach(p => {
        elements.push({
          type: 'bullet',
          text: this.stripHtml(this.getText(p)),
          height: typography.fontSize.body + 8
        });
      });
    }

    // Business Impact highlights (keyNumbers intentionally omitted)
    const impactHighlights = data.businessImpact ? this.getArray(data.businessImpact.highlights) : [];
    if (impactHighlights.length > 0) {
      elements.push({
        type: 'subheading',
        text: labels.businessImpact || 'Business Impact',
        height: typography.fontSize.h3 + 10
      });
      impactHighlights.forEach(h => {
        elements.push({
          type: 'bullet',
          text: this.stripHtml(this.getText(h)),
          height: typography.fontSize.body + 8
        });
      });
    }

    // Soft Skills — exporters use a 2-column grid; the preview approximates
    // it as a flat "title — description" list.
    if (Array.isArray(data.softSkills) && data.softSkills.length > 0) {
      elements.push({
        type: 'subheading',
        text: labels.softSkills || 'Soft Skills',
        height: typography.fontSize.h3 + 10
      });
      data.softSkills.forEach(skill => {
        const title = this.getText(skill.title);
        const desc = this.getText(skill.description);
        const text = desc ? `${title} — ${desc}` : title;
        elements.push({
          type: 'paragraph',
          text: `•  ${text}`,
          height: this.estimateWrappedHeight(text, typography.fontSize.body)
        });
      });
    }
  }

  /**
   * Build metric chip strings for a PM capability, matching the exporters'
   * chip labels and order.
   * @param {Object} metrics - Capability metrics object
   * @param {string} lang - Language code ('ko' or 'en')
   * @returns {string[]} Chip strings
   */
  buildManagerMetricChips(metrics, lang) {
    const m = metrics || {};
    const chips = [];
    if (Array.isArray(m.teamSizes) && m.teamSizes.length > 0) {
      const min = Math.min(...m.teamSizes);
      const max = Math.max(...m.teamSizes);
      chips.push(`${lang === 'ko' ? '팀 규모' : 'Team Size'} ${min}–${max}`);
    }
    if (m.yearsLeading) chips.push(`${lang === 'ko' ? '리딩 연차' : 'Leading'} ${m.yearsLeading}+ ${lang === 'ko' ? '년' : 'yrs'}`);
    if (m.projectsLed) chips.push(`${lang === 'ko' ? '리딩 프로젝트' : 'Projects Led'} ${m.projectsLed}+`);
    if (m.onTimeDelivery) chips.push(`${lang === 'ko' ? '정시 납품' : 'On-Time'} ${m.onTimeDelivery}`);
    if (m.certificationSuccess) chips.push(`${lang === 'ko' ? '인증 성공률' : 'Cert Success'} ${m.certificationSuccess}`);
    if (m.majorProjects) chips.push(`${lang === 'ko' ? '주요 프로젝트' : 'Major Projects'} ${m.majorProjects}+`);
    return chips;
  }

  /**
   * Build compensation section preview elements (PRIVATE).
   * Renders a compact list of negotiation tiers — kept terse so the preview
   * still reads as "this section will be present" without reproducing the
   * full table layout.
   */
  buildCompensationElements(elements, data, typography) {
    // Confidentiality warning line
    elements.push({
      type: 'paragraph',
      text: '※ PRIVATE — do not distribute externally',
      height: typography.fontSize.small + 8
    });

    const tiers = data?.tiers || [];
    tiers.forEach(tier => {
      const groupItems = [];
      groupItems.push({
        type: 'subheading',
        text: this.getText(tier.label),
        height: typography.fontSize.h3 + 10
      });
      groupItems.push({
        type: 'paragraph',
        text: `Base ${this.getText(tier.base)} · Total ${this.getText(tier.totalFirstYear)}`,
        height: typography.fontSize.body + 8
      });
      elements.push({
        type: 'group',
        items: groupItems,
        height: groupItems.reduce((sum, item) => sum + item.height, 0) + 5
      });
    });
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
          text: this.getText(cat.title),
          height: typography.fontSize.h3 + 10
        });
        const items = this.getArray(cat.items);
        if (items.length > 0) {
          items.slice(0, 4).forEach(item => {
            groupItems.push({
              type: 'bullet',
              text: this.getText(typeof item === 'string' ? item : (item.name || item)),
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
        text: this.getText(project.title),
        height: typography.fontSize.h3 + 8
      });
      groupItems.push({
        type: 'paragraph',
        text: this.truncate(this.getText(project.description), 100),
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
          text: `${this.getText(entry.company)} - ${this.getText(entry.role)}`,
          height: typography.fontSize.h3 + 8
        });
        groupItems.push({
          type: 'date',
          text: this.formatPeriodWithDuration(entry.period),
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
   * Build education section elements
   */
  buildEducationElements(elements, data, typography) {
    const items = data?.items || [];
    items.slice(0, 3).forEach(entry => {
      const groupItems = [];
      groupItems.push({
        type: 'careerEntry',
        text: this.getText(entry.institution),
        height: typography.fontSize.h3 + 8
      });
      if (entry.degree) {
        groupItems.push({
          type: 'date',
          text: this.getText(entry.degree),
          height: typography.fontSize.small + 6
        });
      }
      if (entry.period) {
        groupItems.push({
          type: 'date',
          text: entry.period,
          height: typography.fontSize.small + 6
        });
      }
      elements.push({
        type: 'group',
        items: groupItems,
        height: groupItems.reduce((sum, item) => sum + item.height, 0) + 5
      });
    });
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
        text: this.truncate(this.getText(data.featured.quote), 150),
        height: typography.fontSize.body * 3 + 20
      });
      groupItems.push({
        type: 'attribution',
        text: `— ${this.getText(data.featured.author)}, ${this.getText(data.featured.role)}`,
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
    // Section titles come from the shared exporter label source so the
    // preview matches the exported document in both languages.
    const labels = this.getExportLabels();
    if (labels[sectionId]) return labels[sectionId];
    return sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
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

      case 'coverName':
        this.ctx.font = `bold 32px ${fontFamily}`;
        this.ctx.fillStyle = colors.text.primary;
        this.ctx.fillText(element.text, x, y + 32);
        break;

      case 'coverSubtitle':
        this.ctx.font = `bold ${typography.fontSize.h3}px ${fontFamily}`;
        this.ctx.fillStyle = colors.primary;
        this.ctx.fillText(element.text, x, y + typography.fontSize.h3);
        break;

      case 'divider':
        this.ctx.strokeStyle = colors.border || '#ddd';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + 6);
        this.ctx.lineTo(x + contentWidth, y + 6);
        this.ctx.stroke();
        break;

      case 'statsRow': {
        const stats = element.stats || [];
        if (stats.length === 0) break;
        const gap = 6;
        const cellW = (contentWidth - gap * (stats.length - 1)) / stats.length;
        const valueH = 34;
        stats.forEach((s, i) => {
          const cellX = x + i * (cellW + gap);
          this.ctx.fillStyle = colors.primary;
          this.ctx.fillRect(cellX, y, cellW, valueH);
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.font = `bold 16px ${fontFamily}`;
          this.ctx.textAlign = 'center';
          this.ctx.fillText(s.value, cellX + cellW / 2, y + 23);
          this.ctx.fillStyle = colors.text.secondary;
          this.ctx.font = `${typography.fontSize.small}px ${fontFamily}`;
          this.ctx.fillText(s.label, cellX + cellW / 2, y + valueH + typography.fontSize.small + 4);
        });
        this.ctx.textAlign = 'left';
        break;
      }

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
    // Handle multilingual objects and ensure string
    if (!text) return;
    if (typeof text === 'object') {
      text = this.getText(text);
    }
    text = String(text);

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
    // Handle multilingual objects as fallback
    if (typeof text === 'object') {
      text = this.getText(text);
    }
    // Ensure text is a string
    text = String(text);
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
