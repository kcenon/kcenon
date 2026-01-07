/**
 * Form Fields - Reusable form field components
 */

const FormFields = {
  /**
   * Create a text input field
   */
  textInput(config) {
    const { id, label, value = '', required = false, placeholder = '', type = 'text' } = config;
    return `
      <div class="form-group">
        <label for="${id}">${label}${required ? ' <span class="required">*</span>' : ''}</label>
        <input
          type="${type}"
          id="${id}"
          name="${id}"
          value="${this.escapeHtml(value)}"
          placeholder="${placeholder}"
          ${required ? 'required' : ''}
          class="form-input"
        />
      </div>
    `;
  },

  /**
   * Create a textarea field
   */
  textArea(config) {
    const { id, label, value = '', required = false, placeholder = '', rows = 4, richText = false } = config;
    return `
      <div class="form-group">
        <label for="${id}">
          ${label}${required ? ' <span class="required">*</span>' : ''}
          ${richText ? '<span class="hint">(HTML &lt;strong&gt; tags supported)</span>' : ''}
        </label>
        <textarea
          id="${id}"
          name="${id}"
          rows="${rows}"
          placeholder="${placeholder}"
          ${required ? 'required' : ''}
          class="form-input form-textarea"
        >${this.escapeHtml(value)}</textarea>
      </div>
    `;
  },

  /**
   * Create a select dropdown
   */
  select(config) {
    const { id, label, value = '', options = [], required = false } = config;
    const optionsHtml = options.map(opt => {
      const optValue = typeof opt === 'object' ? opt.value : opt;
      const optLabel = typeof opt === 'object' ? opt.label : opt;
      return `<option value="${optValue}" ${value === optValue ? 'selected' : ''}>${optLabel}</option>`;
    }).join('');

    return `
      <div class="form-group">
        <label for="${id}">${label}${required ? ' <span class="required">*</span>' : ''}</label>
        <select id="${id}" name="${id}" ${required ? 'required' : ''} class="form-input form-select">
          <option value="">-- Select --</option>
          ${optionsHtml}
        </select>
      </div>
    `;
  },

  /**
   * Create a checkbox field
   */
  checkbox(config) {
    const { id, label, checked = false } = config;
    return `
      <div class="form-group form-checkbox">
        <label>
          <input type="checkbox" id="${id}" name="${id}" ${checked ? 'checked' : ''} />
          <span>${label}</span>
        </label>
      </div>
    `;
  },

  /**
   * Create an array input (for tags, roles, etc.)
   */
  arrayInput(config) {
    const { id, label, values = [], required = false, placeholder = 'Add item...', suggestions = [] } = config;
    const tagsHtml = values.map((val, idx) => `
      <span class="tag-item" data-index="${idx}">
        ${this.escapeHtml(val)}
        <button type="button" class="tag-remove" data-field="${id}" data-index="${idx}">&times;</button>
      </span>
    `).join('');

    const suggestionsHtml = suggestions.length > 0 ? `
      <datalist id="${id}-suggestions">
        ${suggestions.map(s => `<option value="${s}">`).join('')}
      </datalist>
    ` : '';

    return `
      <div class="form-group">
        <label for="${id}">${label}${required ? ' <span class="required">*</span>' : ''}</label>
        <div class="array-input" data-field="${id}">
          <div class="tags-container" id="${id}-tags">
            ${tagsHtml}
          </div>
          <div class="array-input-row">
            <input
              type="text"
              id="${id}-input"
              placeholder="${placeholder}"
              class="form-input"
              list="${id}-suggestions"
            />
            <button type="button" class="btn btn-small btn-add" data-field="${id}">Add</button>
          </div>
          ${suggestionsHtml}
          <input type="hidden" id="${id}" name="${id}" value="${this.escapeHtml(JSON.stringify(values))}" />
        </div>
      </div>
    `;
  },

  /**
   * Create a multi-select with checkboxes
   */
  multiSelect(config) {
    const { id, label, values = [], options = [], required = false } = config;
    const optionsHtml = options.map(opt => {
      const optValue = typeof opt === 'object' ? opt.value : opt;
      const optLabel = typeof opt === 'object' ? opt.label : opt;
      const checked = values.includes(optValue);
      return `
        <label class="multi-select-option">
          <input type="checkbox" name="${id}[]" value="${optValue}" ${checked ? 'checked' : ''} />
          <span>${optLabel}</span>
        </label>
      `;
    }).join('');

    return `
      <div class="form-group">
        <label>${label}${required ? ' <span class="required">*</span>' : ''}</label>
        <div class="multi-select" id="${id}">
          ${optionsHtml}
        </div>
      </div>
    `;
  },

  /**
   * Create an object array input (for metrics, labels, etc.)
   */
  objectArrayInput(config) {
    const { id, label, values = [], fields = [], required = false } = config;

    const itemsHtml = values.map((item, idx) => this.objectArrayItem(id, idx, item, fields)).join('');

    return `
      <div class="form-group">
        <label>${label}${required ? ' <span class="required">*</span>' : ''}</label>
        <div class="object-array" id="${id}-container" data-field="${id}">
          <div class="object-array-items" id="${id}-items">
            ${itemsHtml}
          </div>
          <button type="button" class="btn btn-small btn-add-object" data-field="${id}">+ Add Item</button>
          <input type="hidden" id="${id}" name="${id}" value="${this.escapeHtml(JSON.stringify(values))}" />
        </div>
      </div>
    `;
  },

  /**
   * Create a single object array item
   */
  objectArrayItem(fieldId, index, item, fields) {
    const fieldsHtml = fields.map(field => {
      const value = item[field.key] || '';
      if (field.type === 'checkbox') {
        return `
          <label class="inline-field">
            <input type="checkbox" name="${fieldId}_${index}_${field.key}" ${value ? 'checked' : ''} />
            ${field.label}
          </label>
        `;
      }
      return `
        <input
          type="${field.type || 'text'}"
          name="${fieldId}_${index}_${field.key}"
          value="${this.escapeHtml(String(value))}"
          placeholder="${field.label}"
          class="form-input inline-input"
        />
      `;
    }).join('');

    return `
      <div class="object-array-item" data-index="${index}">
        ${fieldsHtml}
        <button type="button" class="btn-remove-object" data-field="${fieldId}" data-index="${index}">&times;</button>
      </div>
    `;
  },

  /**
   * Create a nested object editor (for expanded sections)
   */
  nestedObjectEditor(config) {
    const { id, label, value = {}, schema = {} } = config;

    let fieldsHtml = '';
    for (const [key, fieldConfig] of Object.entries(schema)) {
      const fieldValue = value[key];
      const fieldId = `${id}_${key}`;

      if (fieldConfig.type === 'array') {
        fieldsHtml += this.arrayInput({
          id: fieldId,
          label: fieldConfig.label,
          values: fieldValue || [],
          placeholder: fieldConfig.placeholder || 'Add item...'
        });
      } else if (fieldConfig.type === 'text') {
        fieldsHtml += this.textInput({
          id: fieldId,
          label: fieldConfig.label,
          value: fieldValue || ''
        });
      }
    }

    return `
      <div class="form-group nested-editor">
        <div class="nested-header">
          <label>${label}</label>
          <button type="button" class="btn-toggle-nested" data-target="${id}-content">
            <span class="toggle-icon">&#9660;</span>
          </button>
        </div>
        <div class="nested-content" id="${id}-content">
          ${fieldsHtml}
        </div>
      </div>
    `;
  },

  /**
   * Create a period input (date range)
   */
  periodInput(config) {
    const { id, label, value = '', required = false } = config;
    return `
      <div class="form-group">
        <label for="${id}">${label}${required ? ' <span class="required">*</span>' : ''}</label>
        <input
          type="text"
          id="${id}"
          name="${id}"
          value="${this.escapeHtml(value)}"
          placeholder="YYYY.MM - YYYY.MM"
          pattern="\\d{4}\\.\\d{2}\\s*-\\s*(\\d{4}\\.\\d{2}|Present)"
          ${required ? 'required' : ''}
          class="form-input"
        />
        <span class="hint">Format: YYYY.MM - YYYY.MM (or Present)</span>
      </div>
    `;
  },

  /**
   * Escape HTML to prevent XSS (including quotes for attribute values)
   */
  escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    // Also escape quotes for use in HTML attributes
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  /**
   * Parse array from hidden input
   */
  parseArrayValue(value) {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
};

// Export
window.FormFields = FormFields;
