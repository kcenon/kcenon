/**
 * Admin Components - UI components for admin page
 */

const AdminComponents = {
  /**
   * Render item list for a data type
   */
  renderItemList(items, dataType, selectedId = null) {
    if (!items || items.length === 0) {
      return `
        <div class="item-list-empty">
          <p>No items found</p>
        </div>
      `;
    }

    const itemsHtml = items.map(item => {
      // Handle multilingual objects for id, title, subtitle
      const rawId = item.id || item.title || item.author || item.name || `item-${Math.random().toString(36).substr(2, 9)}`;
      const id = FormFields.getText(rawId);
      const rawTitle = item.title || item.company || item.name || item.author || 'Untitled';
      const title = FormFields.getText(rawTitle);
      const rawSubtitle = item.company || item.role || item.period || '';
      const subtitle = FormFields.getText(rawSubtitle);
      const isSelected = String(id) === String(selectedId);

      return `
        <div class="item-list-item ${isSelected ? 'selected' : ''}" data-id="${id}" data-type="${dataType}">
          <div class="item-info">
            <span class="item-title">${FormFields.escapeHtml(title)}</span>
            ${subtitle ? `<span class="item-subtitle">${FormFields.escapeHtml(subtitle)}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="item-list-header">
        <span class="item-count">${items.length} items</span>
      </div>
      <div class="item-list-search">
        <input type="text" placeholder="Search..." class="form-input search-input" />
      </div>
      <div class="item-list-items">
        ${itemsHtml}
      </div>
    `;
  },

  /**
   * Render project form
   */
  renderProjectForm(project = {}, category = 'featured') {
    const isOpenSource = category === 'openSource';
    const isFeatured = category === 'featured';

    const roleOptions = [
      { value: 'architect', label: 'Architect' },
      { value: 'lead', label: 'Lead' },
      { value: 'core-dev', label: 'Core Developer' },
      { value: 'qa-doc', label: 'QA/Documentation' }
    ];

    const iconOptions = [
      { value: 'hospital', label: 'Hospital' },
      { value: 'microscope', label: 'Microscope' },
      { value: 'code', label: 'Code' },
      { value: 'server', label: 'Server' }
    ];

    let formHtml = `
      <input type="hidden" name="category" value="${category}" />
      ${FormFields.textInput({ id: 'id', label: 'ID', value: project.id, required: true, placeholder: 'unique-project-id' })}
    `;

    if (isFeatured) {
      formHtml += FormFields.select({ id: 'icon', label: 'Icon', value: project.icon, options: iconOptions });
    }

    if (!isOpenSource) {
      formHtml += `
        ${FormFields.textInput({ id: 'company', label: 'Company', value: project.company, required: true })}
        ${FormFields.textInput({ id: 'title', label: 'Title', value: project.title, required: true })}
        ${FormFields.periodInput({ id: 'period', label: 'Period', value: project.period, required: true })}
        ${FormFields.multiSelect({ id: 'roles', label: 'Roles', values: project.roles || [], options: roleOptions, required: true })}
      `;
    } else {
      formHtml += `
        ${FormFields.textInput({ id: 'title', label: 'Title', value: project.title, required: true })}
        ${FormFields.textInput({ id: 'github', label: 'GitHub URL', value: project.github, type: 'url' })}
        ${FormFields.textInput({ id: 'stars', label: 'Stars', value: project.stars, type: 'number' })}
      `;
    }

    formHtml += `
      ${FormFields.textArea({ id: 'description', label: 'Description', value: project.description, required: true, richText: true })}
      ${FormFields.arrayInput({ id: 'tags', label: 'Tags', values: project.tags || [], placeholder: 'Add tag...' })}
    `;

    if (!isOpenSource) {
      formHtml += FormFields.objectArrayInput({
        id: 'metrics',
        label: 'Metrics',
        values: project.metrics || [],
        fields: [
          { key: 'value', label: 'Value', type: 'text' },
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'change', label: 'Change', type: 'text' },
          { key: 'positive', label: 'Positive', type: 'checkbox' }
        ]
      });

      formHtml += FormFields.nestedObjectEditor({
        id: 'expanded',
        label: 'Expanded Details',
        value: project.expanded || {},
        schema: {
          roles: { type: 'array', label: 'Detailed Roles', placeholder: 'Add role detail...' },
          challenges: { type: 'array', label: 'Challenges', placeholder: 'Add challenge...' },
          solutions: { type: 'array', label: 'Solutions', placeholder: 'Add solution...' },
          achievements: { type: 'array', label: 'Achievements', placeholder: 'Add achievement...' },
          certifications: { type: 'array', label: 'Certifications', placeholder: 'Add certification...' }
        }
      });
    } else {
      formHtml += FormFields.nestedObjectEditor({
        id: 'expanded',
        label: 'Expanded Details',
        value: project.expanded || {},
        schema: {
          features: { type: 'array', label: 'Features', placeholder: 'Add feature...' }
        }
      });
    }

    return formHtml;
  },

  /**
   * Render career form
   */
  renderCareerForm(career = {}) {
    return `
      ${FormFields.textInput({ id: 'id', label: 'ID', value: career.id, required: true, placeholder: 'unique-career-id' })}
      ${FormFields.textInput({ id: 'company', label: 'Company', value: career.company, required: true })}
      ${FormFields.periodInput({ id: 'period', label: 'Period', value: career.period, required: true })}
      ${FormFields.textInput({ id: 'role', label: 'Role', value: career.role, required: true })}
      ${FormFields.textInput({ id: 'badge', label: 'Badge', value: career.badge, placeholder: 'e.g., IPO' })}
      ${FormFields.textArea({ id: 'companyDescription', label: 'Company Description', value: career.companyDescription, placeholder: 'Brief description of the company' })}
      ${FormFields.textArea({ id: 'responsibilities', label: 'Responsibilities', value: career.responsibilities, placeholder: 'Main responsibilities in this role' })}
      ${FormFields.nestedObjectEditor({
        id: 'scale',
        label: 'Company/Team Scale',
        value: career.scale || {},
        schema: {
          company: { type: 'text', label: 'Company Size' },
          team: { type: 'text', label: 'Team Size' }
        }
      })}
      ${FormFields.textArea({ id: 'leaveReason', label: 'Reason for Leaving', value: career.leaveReason, placeholder: 'Reason for leaving this position' })}
      ${FormFields.arrayInput({ id: 'relatedProjects', label: 'Related Projects', values: career.relatedProjects || [], placeholder: 'Add project ID...' })}
      ${FormFields.textArea({ id: 'description', label: 'Description', value: career.description, richText: true })}
      ${FormFields.textArea({ id: 'note', label: 'Note', value: career.note, richText: true })}
      ${FormFields.arrayInput({ id: 'achievements', label: 'Achievements', values: career.achievements || [], placeholder: 'Add achievement...' })}
      ${FormFields.arrayInput({ id: 'tags', label: 'Tags', values: career.tags || [], placeholder: 'Add tag...' })}
      ${FormFields.checkbox({ id: 'highlight', label: 'Highlight this entry', checked: career.highlight })}
    `;
  },

  /**
   * Render expertise category form
   */
  renderExpertiseCategoryForm(category = {}) {
    const iconOptions = [
      { value: 'hospital', label: 'Hospital' },
      { value: 'clipboard', label: 'Clipboard' },
      { value: 'zap', label: 'Zap' },
      { value: 'tool', label: 'Tool' }
    ];

    return `
      ${FormFields.textInput({ id: 'id', label: 'ID', value: category.id, required: true })}
      ${FormFields.select({ id: 'icon', label: 'Icon', value: category.icon, options: iconOptions, required: true })}
      ${FormFields.textInput({ id: 'title', label: 'Title', value: category.title, required: true })}
      ${FormFields.arrayInput({ id: 'items', label: 'Items (for list-based)', values: category.items || [], placeholder: 'Add item...' })}
      ${FormFields.arrayInput({ id: 'tags', label: 'Tags (for tag-based)', values: category.tags || [], placeholder: 'Add tag...' })}
    `;
  },

  /**
   * Render certification form
   */
  renderCertificationForm(cert = {}) {
    const iconOptions = ['EU', 'US', 'KR', 'CN'].map(i => ({ value: i, label: i }));

    return `
      ${FormFields.select({ id: 'icon', label: 'Icon (Country)', value: cert.icon, options: iconOptions, required: true })}
      ${FormFields.textInput({ id: 'name', label: 'Name', value: cert.name, required: true })}
    `;
  },

  /**
   * Render lifecycle/capability form
   */
  renderLifecycleForm(item = {}) {
    const iconOptions = [
      'clipboard', 'search', 'alert-triangle', 'refresh-cw', 'users', 'flask',
      'check-circle', 'file-text', 'check-square'
    ].map(i => ({ value: i, label: i }));

    return `
      ${FormFields.select({ id: 'icon', label: 'Icon', value: item.icon, options: iconOptions, required: true })}
      ${FormFields.textInput({ id: 'title', label: 'Title', value: item.title, required: true })}
      ${FormFields.textInput({ id: 'description', label: 'Description', value: item.description, required: true })}
    `;
  },

  /**
   * Render featured testimonial form
   */
  renderFeaturedTestimonialForm(featured = {}) {
    return `
      ${FormFields.textArea({ id: 'quote', label: 'Quote', value: featured.quote, required: true, richText: true, rows: 6 })}
      ${FormFields.textInput({ id: 'author', label: 'Author', value: featured.author, required: true })}
      ${FormFields.textInput({ id: 'role', label: 'Role', value: featured.role, required: true })}
      ${FormFields.textInput({ id: 'relation', label: 'Relation', value: featured.relation, required: true })}
    `;
  },

  /**
   * Render testimonial form
   */
  renderTestimonialForm(testimonial = {}) {
    const labelTypeOptions = [
      { value: 'domain', label: 'Domain' },
      { value: 'technical', label: 'Technical' },
      { value: 'leadership', label: 'Leadership' },
      { value: 'mentoring', label: 'Mentoring' },
      { value: 'communication', label: 'Communication' }
    ];

    return `
      ${FormFields.textInput({ id: 'id', label: 'ID', value: testimonial.id, type: 'number' })}
      ${FormFields.textInput({ id: 'date', label: 'Date', value: testimonial.date, required: true, placeholder: 'YYYY.MM' })}
      ${FormFields.textInput({ id: 'context', label: 'Context', value: testimonial.context, required: true })}
      ${FormFields.textArea({ id: 'text', label: 'Text', value: testimonial.text, required: true, richText: true, rows: 6 })}
      ${FormFields.objectArrayInput({
        id: 'labels',
        label: 'Labels',
        values: testimonial.labels || [],
        fields: [
          { key: 'text', label: 'Text', type: 'text' },
          { key: 'type', label: 'Type', type: 'text' }
        ]
      })}
      ${FormFields.textInput({ id: 'author', label: 'Author', value: testimonial.author, required: true })}
      ${FormFields.textInput({ id: 'role', label: 'Role', value: testimonial.role, required: true })}
      ${FormFields.textInput({ id: 'relation', label: 'Relation', value: testimonial.relation, required: true })}
    `;
  },

  /**
   * Render PM Capability form
   */
  renderPMCapabilityForm(capability = {}) {
    const iconOptions = [
      { value: 'users', label: 'Users (Team)' },
      { value: 'handshake', label: 'Handshake (Stakeholder)' },
      { value: 'calendar-check', label: 'Calendar (Delivery)' },
      { value: 'shield', label: 'Shield (Risk)' },
      { value: 'trending-up', label: 'Trending Up (Process)' }
    ];

    return `
      ${FormFields.textInput({ id: 'id', label: 'ID', value: capability.id, required: true, placeholder: 'team-management' })}
      ${FormFields.select({ id: 'icon', label: 'Icon', value: capability.icon, options: iconOptions })}
      ${FormFields.textInput({ id: 'title', label: 'Title', value: capability.title, required: true })}
      ${FormFields.textArea({ id: 'description', label: 'Description', value: capability.description, required: true, rows: 3 })}
    `;
  },

  /**
   * Render Leadership Style form
   */
  renderLeadershipStyleForm(style = {}) {
    return `
      ${FormFields.textInput({ id: 'title', label: 'Title', value: style.title, required: true })}
      ${FormFields.arrayInput({ id: 'principles', label: 'Principles', values: style.principles })}
    `;
  },

  /**
   * Render Business Impact form
   */
  renderBusinessImpactForm(impact = {}) {
    return `
      ${FormFields.arrayInput({ id: 'highlights', label: 'Highlights', values: impact.highlights })}
      <div class="form-section">
        <h4>Key Numbers</h4>
        ${FormFields.textInput({ id: 'keyNumbers.certifications', label: 'Certifications Count', value: impact.keyNumbers?.certifications, type: 'number' })}
        ${FormFields.textInput({ id: 'keyNumbers.ipos', label: 'IPOs Count', value: impact.keyNumbers?.ipos, type: 'number' })}
        ${FormFields.textInput({ id: 'keyNumbers.performanceImprovement', label: 'Performance Improvement', value: impact.keyNumbers?.performanceImprovement, placeholder: '2x' })}
        ${FormFields.textInput({ id: 'keyNumbers.latencyReduction', label: 'Latency Reduction', value: impact.keyNumbers?.latencyReduction, placeholder: '50%' })}
        ${FormFields.textInput({ id: 'keyNumbers.projectsDelivered', label: 'Projects Delivered', value: impact.keyNumbers?.projectsDelivered, placeholder: '15+' })}
      </div>
    `;
  },

  /**
   * Render Soft Skill form
   */
  renderSoftSkillForm(skill = {}) {
    const iconOptions = [
      { value: 'message-circle', label: 'Message (Communication)' },
      { value: 'users', label: 'Users (Mentoring)' },
      { value: 'compass', label: 'Compass (Direction)' },
      { value: 'book-open', label: 'Book (Learning)' },
      { value: 'unlock', label: 'Unlock (Openness)' },
      { value: 'check-circle', label: 'Check (Quality)' }
    ];

    const levelOptions = [
      { value: '1', label: '1 - Basic' },
      { value: '2', label: '2 - Developing' },
      { value: '3', label: '3 - Competent' },
      { value: '4', label: '4 - Advanced' },
      { value: '5', label: '5 - Expert' }
    ];

    return `
      ${FormFields.textInput({ id: 'id', label: 'ID', value: skill.id, required: true, placeholder: 'communication' })}
      ${FormFields.select({ id: 'icon', label: 'Icon', value: skill.icon, options: iconOptions })}
      ${FormFields.textInput({ id: 'title', label: 'Title', value: skill.title, required: true })}
      ${FormFields.select({ id: 'level', label: 'Level', value: String(skill.level || 3), options: levelOptions })}
    `;
  },

  /**
   * Render Management Project form
   */
  renderManagementProjectForm(project = {}) {
    return `
      ${FormFields.textInput({ id: 'projectId', label: 'Project ID', value: project.projectId, required: true, placeholder: 'smartdent-v3' })}
      ${FormFields.textInput({ id: 'title', label: 'Title', value: project.title, required: true })}
      ${FormFields.textInput({ id: 'duration', label: 'Duration', value: project.duration, placeholder: '18 months' })}
      ${FormFields.textInput({ id: 'teamSize', label: 'Team Size', value: project.teamSize, type: 'number' })}
      ${FormFields.checkbox({ id: 'onTime', label: 'Delivered On Time', checked: project.onTime })}
      ${FormFields.arrayInput({ id: 'certifications', label: 'Certifications', values: project.certifications })}
      ${FormFields.arrayInput({ id: 'outcomes', label: 'Outcomes', values: project.outcomes })}
    `;
  },

  /**
   * Render editor panel
   */
  renderEditorPanel(formHtml, isNew = false) {
    return `
      <div class="editor-header">
        <h3>${isNew ? 'Add New Item' : 'Edit Item'}</h3>
      </div>
      <form id="editor-form" class="editor-form">
        ${formHtml}
        <div class="editor-actions">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-secondary btn-cancel">Cancel</button>
          ${!isNew ? '<button type="button" class="btn btn-danger btn-delete-item">Delete</button>' : ''}
        </div>
      </form>
    `;
  },

  /**
   * Render empty preview state
   */
  renderEmptyEditor() {
    return `
      <div class="editor-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <p>Select an item to view preview</p>
      </div>
    `;
  },

  /**
   * Render preview-only panel (no editing)
   */
  renderPreviewOnlyPanel(previewHtml) {
    return `
      <div class="preview-only-panel">
        <div class="preview-only-header">
          <h3>Preview</h3>
          <div class="preview-export-actions">
            <button type="button" class="btn btn-primary" id="export-pdf">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Export as PDF
            </button>
            <button type="button" class="btn btn-primary" id="export-docx">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
              Export as Word
            </button>
          </div>
        </div>
        <div class="preview-only-content">
          ${previewHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render confirmation modal
   */
  renderConfirmModal(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return `
      <div class="modal-overlay" id="confirm-modal">
        <div class="modal">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary modal-cancel">${cancelText}</button>
            <button class="btn btn-danger modal-confirm">${confirmText}</button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render status bar (preview mode - no save buttons)
   */
  renderStatusBar(unsavedCount = 0, apiStatus = {}) {
    return `
      <div class="status-info">
        <span>Preview Mode - Read Only</span>
      </div>
      <div class="status-actions">
        <span class="status-hint">Select items to preview and export as PDF or Word</span>
      </div>
    `;
  },

  /**
   * Render editor panel with preview support
   */
  renderEditorPanelWithPreview(formHtml, isNew = false, previewActive = false) {
    return `
      <div class="editor-header">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3>${isNew ? 'Add New Item' : 'Edit Item'}</h3>
          <button type="button" class="btn btn-small btn-preview ${previewActive ? 'active' : ''}" id="btn-toggle-preview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </button>
        </div>
      </div>
      <div class="editor-content ${previewActive ? 'preview-active' : ''}" id="editor-content">
        <div class="editor-form-container">
          <form id="editor-form" class="editor-form">
            ${formHtml}
            <div class="editor-actions">
              <button type="submit" class="btn btn-primary">Save</button>
              <button type="button" class="btn btn-secondary btn-cancel">Cancel</button>
              ${!isNew ? '<button type="button" class="btn btn-danger btn-delete-item">Delete</button>' : ''}
            </div>
          </form>
        </div>
        <div class="preview-panel" id="preview-panel">
          <div class="preview-header">
            <h4>Preview</h4>
          </div>
          <div class="preview-content" id="preview-content">
            ${this.renderPreviewEmpty()}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render project preview
   */
  renderProjectPreview(data, category = 'featured') {
    if (!data || !data.title) {
      return this.renderPreviewEmpty();
    }

    const isOpenSource = category === 'openSource';

    // Convert multilingual fields to text
    const titleText = FormFields.getText(data.title) || '';
    const companyText = FormFields.getText(data.company) || '';
    const periodText = FormFields.getText(data.period) || '';
    const descriptionText = FormFields.getText(data.description) || '';

    // Roles badges
    const rolesHtml = data.roles && data.roles.length > 0 ? `
      <div class="preview-roles">
        ${data.roles.map(r => `<span class="preview-role">${FormFields.escapeHtml(FormFields.getText(r))}</span>`).join('')}
      </div>
    ` : '';

    // Metrics
    const metricsHtml = data.metrics && data.metrics.length > 0 ? `
      <div class="preview-metrics">
        ${data.metrics.map(m => {
          const valueText = FormFields.getText(m.value) || '';
          const labelText = FormFields.getText(m.label) || '';
          const changeText = FormFields.getText(m.change) || '';
          return `
            <div class="preview-metric">
              <div class="preview-metric-value">${FormFields.escapeHtml(valueText)}</div>
              <div class="preview-metric-label">${FormFields.escapeHtml(labelText)}</div>
              ${changeText ? `<div class="preview-metric-change ${m.positive ? 'positive' : ''}">${FormFields.escapeHtml(changeText)}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    ` : '';

    // Tags
    const tagsHtml = data.tags && data.tags.length > 0 ? `
      <div class="preview-tags">
        ${data.tags.map(t => `<span class="preview-tag">${FormFields.escapeHtml(FormFields.getText(t))}</span>`).join('')}
      </div>
    ` : '';

    // Expanded section
    let expandedHtml = '';
    if (data.expanded) {
      const sections = [];

      if (data.expanded.roles && data.expanded.roles.length > 0) {
        sections.push(`
          <div class="preview-expanded-section">
            <div class="preview-expanded-title">Roles & Responsibilities</div>
            <ul class="preview-expanded-list">
              ${data.expanded.roles.map(r => `<li>${FormFields.getText(r)}</li>`).join('')}
            </ul>
          </div>
        `);
      }

      if (data.expanded.challenges && data.expanded.challenges.length > 0) {
        sections.push(`
          <div class="preview-expanded-section">
            <div class="preview-expanded-title">Challenges</div>
            <ul class="preview-expanded-list">
              ${data.expanded.challenges.map(c => `<li>${FormFields.getText(c)}</li>`).join('')}
            </ul>
          </div>
        `);
      }

      if (data.expanded.solutions && data.expanded.solutions.length > 0) {
        sections.push(`
          <div class="preview-expanded-section">
            <div class="preview-expanded-title">Solutions</div>
            <ul class="preview-expanded-list">
              ${data.expanded.solutions.map(s => `<li>${FormFields.getText(s)}</li>`).join('')}
            </ul>
          </div>
        `);
      }

      if (data.expanded.achievements && data.expanded.achievements.length > 0) {
        sections.push(`
          <div class="preview-expanded-section">
            <div class="preview-expanded-title">Achievements</div>
            <ul class="preview-expanded-list">
              ${data.expanded.achievements.map(a => `<li>${FormFields.getText(a)}</li>`).join('')}
            </ul>
          </div>
        `);
      }

      if (data.expanded.certifications && data.expanded.certifications.length > 0) {
        sections.push(`
          <div class="preview-expanded-section">
            <div class="preview-expanded-title">Certifications</div>
            <div class="preview-certifications">
              ${data.expanded.certifications.map(c => `<span class="preview-cert-badge">${FormFields.escapeHtml(FormFields.getText(c))}</span>`).join('')}
            </div>
          </div>
        `);
      }

      if (data.expanded.features && data.expanded.features.length > 0) {
        sections.push(`
          <div class="preview-expanded-section">
            <div class="preview-expanded-title">Features</div>
            <ul class="preview-expanded-list">
              ${data.expanded.features.map(f => `<li>${FormFields.getText(f)}</li>`).join('')}
            </ul>
          </div>
        `);
      }

      if (sections.length > 0) {
        expandedHtml = `<div class="preview-expanded">${sections.join('')}</div>`;
      }
    }

    // Open source specific
    const githubHtml = isOpenSource && data.github ? `
      <div style="margin-bottom: 1rem;">
        <a href="${FormFields.escapeHtml(data.github)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent);">
          ${FormFields.escapeHtml(data.github)}
        </a>
        ${data.stars ? `<span style="margin-left: 0.5rem; color: var(--text-muted);">★ ${data.stars}</span>` : ''}
      </div>
    ` : '';

    return `
      <div class="preview-card">
        <div class="preview-card-header">
          <div>
            <h3 class="preview-card-title">${FormFields.escapeHtml(titleText)}</h3>
            ${companyText ? `<div class="preview-card-subtitle">${FormFields.escapeHtml(companyText)}</div>` : ''}
          </div>
          ${periodText ? `<span class="preview-card-period">${FormFields.escapeHtml(periodText)}</span>` : ''}
        </div>
        ${rolesHtml}
        ${githubHtml}
        <div class="preview-card-description">${descriptionText}</div>
        ${metricsHtml}
        ${tagsHtml}
        ${expandedHtml}
      </div>
    `;
  },

  /**
   * Render career preview
   */
  renderCareerPreview(data) {
    if (!data || !data.company) {
      return this.renderPreviewEmpty();
    }

    // Convert multilingual fields to text
    const companyText = FormFields.getText(data.company) || '';
    const roleText = FormFields.getText(data.role) || '';
    const periodText = FormFields.getText(data.period) || '';
    const badgeText = FormFields.getText(data.badge) || '';
    const companyDescText = FormFields.getText(data.companyDescription) || '';
    const responsibilitiesText = FormFields.getText(data.responsibilities) || '';
    const leaveReasonText = FormFields.getText(data.leaveReason) || '';
    const descriptionText = FormFields.getText(data.description) || '';
    const noteText = FormFields.getText(data.note) || '';

    const badgeHtml = badgeText ? `<span class="preview-career-badge">${FormFields.escapeHtml(badgeText)}</span>` : '';

    const companyDescHtml = companyDescText ? `
      <div class="preview-company-desc" style="font-style: italic; color: var(--text-muted); margin: 0.5rem 0;">${FormFields.escapeHtml(companyDescText)}</div>
    ` : '';

    const responsibilitiesHtml = responsibilitiesText ? `
      <div class="preview-responsibilities" style="margin: 0.5rem 0;">
        <strong>Responsibilities:</strong> ${FormFields.escapeHtml(responsibilitiesText)}
      </div>
    ` : '';

    const scaleCompanyText = FormFields.getText(data.scale?.company) || '';
    const scaleTeamText = FormFields.getText(data.scale?.team) || '';

    const scaleHtml = data.scale && (scaleCompanyText || scaleTeamText) ? `
      <div class="preview-scale" style="display: flex; gap: 1rem; margin: 0.5rem 0; font-size: 0.9rem; color: var(--text-muted);">
        ${scaleCompanyText ? `<span><strong>Company:</strong> ${FormFields.escapeHtml(scaleCompanyText)}</span>` : ''}
        ${scaleTeamText ? `<span><strong>Team:</strong> ${FormFields.escapeHtml(scaleTeamText)}</span>` : ''}
      </div>
    ` : '';

    const leaveReasonHtml = leaveReasonText ? `
      <div class="preview-leave-reason" style="margin: 0.5rem 0; padding: 0.5rem; background: var(--bg-tertiary); border-radius: 4px; font-size: 0.9rem;">
        <strong>Reason for Leaving:</strong> ${FormFields.escapeHtml(leaveReasonText)}
      </div>
    ` : '';

    const relatedProjectsHtml = data.relatedProjects && data.relatedProjects.length > 0 ? `
      <div class="preview-related-projects" style="margin: 0.5rem 0;">
        <strong>Related Projects:</strong>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem;">
          ${data.relatedProjects.map(p => `<span class="preview-tag" style="background: var(--accent); color: white;">${FormFields.escapeHtml(FormFields.getText(p))}</span>`).join('')}
        </div>
      </div>
    ` : '';

    const achievementsHtml = data.achievements && data.achievements.length > 0 ? `
      <div class="preview-expanded-section" style="margin-top: 1rem;">
        <div class="preview-expanded-title">Achievements</div>
        <ul class="preview-expanded-list">
          ${data.achievements.map(a => `<li>${FormFields.getText(a)}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    const tagsHtml = data.tags && data.tags.length > 0 ? `
      <div class="preview-tags">
        ${data.tags.map(t => `<span class="preview-tag">${FormFields.escapeHtml(FormFields.getText(t))}</span>`).join('')}
      </div>
    ` : '';

    const noteHtml = noteText ? `
      <div class="preview-career-note">${noteText}</div>
    ` : '';

    return `
      <div class="preview-card">
        <div class="preview-career">
          <div class="preview-card-header">
            <div>
              <h3 class="preview-card-title">
                ${FormFields.escapeHtml(companyText)}
                ${badgeHtml}
              </h3>
              <div class="preview-card-subtitle">${FormFields.escapeHtml(roleText)}</div>
            </div>
            <span class="preview-card-period">${FormFields.escapeHtml(periodText)}</span>
          </div>
          ${companyDescHtml}
          ${responsibilitiesHtml}
          ${scaleHtml}
          ${descriptionText ? `<div class="preview-card-description">${descriptionText}</div>` : ''}
          ${achievementsHtml}
          ${leaveReasonHtml}
          ${relatedProjectsHtml}
          ${tagsHtml}
          ${noteHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render testimonial preview
   */
  renderTestimonialPreview(data, isFeatured = false) {
    if (!data || (!data.quote && !data.text)) {
      return this.renderPreviewEmpty();
    }

    const quoteText = FormFields.getText(data.quote) || FormFields.getText(data.text) || '';
    const authorText = FormFields.getText(data.author) || 'U';
    const initial = authorText.charAt(0).toUpperCase();

    // Ensure labels is an array before mapping
    const labelsHtml = Array.isArray(data.labels) && data.labels.length > 0 ? `
      <div class="preview-testimonial-labels">
        ${data.labels.map(l => {
          const labelText = FormFields.getText(l.text) || '';
          return `<span class="preview-label ${l.type || ''}">${FormFields.escapeHtml(labelText)}</span>`;
        }).join('')}
      </div>
    ` : '';

    const roleText = FormFields.getText(data.role) || '';
    const relationText = FormFields.getText(data.relation) || '';

    return `
      <div class="preview-card">
        <div class="preview-testimonial">
          <div class="preview-testimonial-quote">${quoteText}</div>
          <div class="preview-testimonial-author">
            <div class="preview-testimonial-avatar">${initial}</div>
            <div class="preview-testimonial-info">
              <div class="preview-testimonial-name">${FormFields.escapeHtml(authorText)}</div>
              <div class="preview-testimonial-role">
                ${FormFields.escapeHtml(roleText)}
                ${relationText ? ` · ${FormFields.escapeHtml(relationText)}` : ''}
              </div>
            </div>
          </div>
          ${labelsHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render expertise preview
   */
  renderExpertisePreview(data, subType = 'categories') {
    if (!data) {
      return this.renderPreviewEmpty();
    }

    // Convert multilingual fields to text
    const titleText = FormFields.getText(data.title) || '';
    const descriptionText = FormFields.getText(data.description) || '';
    const nameText = FormFields.getText(data.name) || '';

    if (subType === 'categories') {
      const itemsHtml = data.items && data.items.length > 0 ? `
        <ul class="preview-expertise-items">
          ${data.items.map(i => `<li>${FormFields.getText(i)}</li>`).join('')}
        </ul>
      ` : '';

      const tagsHtml = data.tags && data.tags.length > 0 ? `
        <div class="preview-tags">
          ${data.tags.map(t => `<span class="preview-tag">${FormFields.escapeHtml(FormFields.getText(t))}</span>`).join('')}
        </div>
      ` : '';

      return `
        <div class="preview-card">
          <div class="preview-expertise-category">
            <h3 class="preview-card-title">${FormFields.escapeHtml(titleText)}</h3>
            ${itemsHtml}
            ${tagsHtml}
          </div>
        </div>
      `;
    }

    if (subType === 'certifications') {
      return `
        <div class="preview-card">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 1.5rem;">${FormFields.escapeHtml(data.icon || '')}</span>
            <span class="preview-card-title">${FormFields.escapeHtml(nameText)}</span>
          </div>
        </div>
      `;
    }

    // heroCapabilities or lifecycleDetails
    return `
      <div class="preview-card">
        <h3 class="preview-card-title">${FormFields.escapeHtml(titleText)}</h3>
        <p class="preview-card-description">${FormFields.escapeHtml(descriptionText)}</p>
      </div>
    `;
  },

  /**
   * Render empty preview state
   */
  renderPreviewEmpty() {
    return `
      <div class="preview-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <p>Fill in the form to see preview</p>
      </div>
    `;
  }
};

// Export
window.AdminComponents = AdminComponents;
