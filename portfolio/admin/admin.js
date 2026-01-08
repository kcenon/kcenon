/**
 * Portfolio Admin - Main Application
 */

class AdminApp {
  constructor() {
    this.data = {
      projects: null,
      career: null,
      expertise: null,
      testimonials: null
    };
    this.originalData = {};
    this.currentTab = 'projects';
    this.currentSubTab = 'featured';
    this.selectedItem = null;
    this.isNewItem = false;
    this.unsavedChanges = new Set();
    this.previewActive = false;
    this.previewDebounceTimer = null;

    // Export custom overrides state
    this.customOverrides = {
      colors: {},
      typography: {},
      spacing: {}
    };

    this.init();
  }

  async init() {
    this.bindEvents();
    this.initTheme();
    await this.loadData();
    this.render();
    this.updateStatusBar();
  }

  /**
   * Initialize theme from localStorage
   */
  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this.updateThemeIcon(next);
  }

  /**
   * Update theme toggle icon
   */
  updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.innerHTML = theme === 'dark'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  /**
   * Load all data
   */
  async loadData() {
    // Try to load from PortfolioData first (inline data from data.js)
    if (window.PortfolioData) {
      this.data.projects = window.PortfolioData.projects || null;
      this.data.career = window.PortfolioData.career || null;
      this.data.expertise = window.PortfolioData.expertise || null;
      this.data.testimonials = window.PortfolioData.testimonials || null;
    }

    // Deep clone for comparison
    this.originalData = JSON.parse(JSON.stringify(this.data));
  }

  /**
   * Connect to folder for file access
   */
  async connectFolder() {
    const success = await window.FileHandler.requestDirectoryAccess();
    if (success) {
      const loadedData = await window.FileHandler.loadAllData();

      // Update data if loaded successfully
      if (loadedData.projects) this.data.projects = loadedData.projects;
      if (loadedData.career) this.data.career = loadedData.career;
      if (loadedData.expertise) this.data.expertise = loadedData.expertise;
      if (loadedData.testimonials) this.data.testimonials = loadedData.testimonials;

      this.originalData = JSON.parse(JSON.stringify(this.data));
      this.render();
      this.showToast('Connected to folder successfully', 'success');
    }
    this.updateStatusBar();
  }

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());

    // Export dropdown
    this.bindExportEvents();

    // Tab navigation
    document.querySelector('.tab-nav')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (btn) {
        this.switchTab(btn.dataset.tab);
      }
    });

    // Sub-tab navigation
    document.getElementById('sub-tabs')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.sub-tab-btn');
      if (btn) {
        this.switchSubTab(btn.dataset.subtab);
      }
    });

    // List panel events (delegated)
    document.getElementById('list-panel')?.addEventListener('click', (e) => {
      // Add new button
      if (e.target.closest('.btn-add-new')) {
        this.createNewItem();
        return;
      }

      // Edit button
      if (e.target.closest('.btn-edit')) {
        const id = e.target.closest('.btn-edit').dataset.id;
        this.selectItem(id);
        return;
      }

      // Delete button
      if (e.target.closest('.btn-delete')) {
        const id = e.target.closest('.btn-delete').dataset.id;
        this.confirmDelete(id);
        return;
      }

      // Item click
      const item = e.target.closest('.item-list-item');
      if (item && !e.target.closest('.item-actions')) {
        this.selectItem(item.dataset.id);
      }
    });

    // Search
    document.getElementById('list-panel')?.addEventListener('input', (e) => {
      if (e.target.classList.contains('search-input')) {
        this.filterItems(e.target.value);
      }
    });

    // Editor panel events (delegated)
    document.getElementById('editor-panel')?.addEventListener('click', (e) => {
      // Preview toggle button
      if (e.target.closest('#btn-toggle-preview')) {
        this.togglePreview();
        return;
      }

      // Cancel button
      if (e.target.classList.contains('btn-cancel')) {
        this.cancelEdit();
        return;
      }

      // Delete button in editor
      if (e.target.classList.contains('btn-delete-item')) {
        this.confirmDelete(this.selectedItem);
        return;
      }

      // Toggle nested
      if (e.target.closest('.btn-toggle-nested')) {
        const target = e.target.closest('.btn-toggle-nested').dataset.target;
        this.toggleNested(target);
        return;
      }

      // Add tag
      if (e.target.classList.contains('btn-add')) {
        const field = e.target.dataset.field;
        this.addArrayItem(field);
        this.updatePreviewDebounced();
        return;
      }

      // Remove tag
      if (e.target.classList.contains('tag-remove')) {
        const field = e.target.dataset.field;
        const index = parseInt(e.target.dataset.index);
        this.removeArrayItem(field, index);
        this.updatePreviewDebounced();
        return;
      }

      // Add object array item
      if (e.target.classList.contains('btn-add-object')) {
        const field = e.target.dataset.field;
        this.addObjectArrayItem(field);
        this.updatePreviewDebounced();
        return;
      }

      // Remove object array item
      if (e.target.classList.contains('btn-remove-object')) {
        const field = e.target.dataset.field;
        const index = parseInt(e.target.dataset.index);
        this.removeObjectArrayItem(field, index);
        this.updatePreviewDebounced();
        return;
      }
    });

    // Form input changes for live preview
    document.getElementById('editor-panel')?.addEventListener('input', (e) => {
      if (e.target.closest('#editor-form')) {
        this.updatePreviewDebounced();
      }
    });

    // Checkbox changes for live preview
    document.getElementById('editor-panel')?.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox' && e.target.closest('#editor-form')) {
        this.updatePreviewDebounced();
      }
    });

    // Form submission
    const editorPanel = document.getElementById('editor-panel');
    console.log('bindEvents: editor-panel found:', !!editorPanel);

    if (editorPanel) {
      editorPanel.addEventListener('submit', (e) => {
        console.log('Submit event captured! target:', e.target, 'target.id:', e.target.id);
        if (e.target.id === 'editor-form') {
          e.preventDefault();
          console.log('Calling saveItem...');
          this.saveItem();
        }
      });

      // Backup: Direct click handler on Save button
      editorPanel.addEventListener('click', (e) => {
        const saveBtn = e.target.closest('button[type="submit"]');
        if (saveBtn && saveBtn.closest('#editor-form')) {
          console.log('Save button clicked via click handler!');
          // Manually trigger save if submit event didn't fire
          e.preventDefault();
          const form = saveBtn.closest('#editor-form');
          if (form) {
            // Check if saveItem was already called by submit event
            if (!this._saveInProgress) {
              this._saveInProgress = true;
              this.saveItem().finally(() => {
                this._saveInProgress = false;
              });
            }
          }
        }
      });
    }

    // Array input enter key
    document.getElementById('editor-panel')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id?.endsWith('-input')) {
        e.preventDefault();
        const field = e.target.id.replace('-input', '');
        this.addArrayItem(field);
      }
    });

    // Status bar
    document.querySelector('.status-bar')?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-connect-folder')) {
        this.connectFolder();
        return;
      }
      if (e.target.closest('.btn-save-all')) {
        this.saveAll();
        return;
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (this.selectedItem || this.isNewItem) {
          this.saveItem();
        }
      }
    });
  }

  /**
   * Switch main tab
   */
  switchTab(tab) {
    this.currentTab = tab;
    this.selectedItem = null;
    this.isNewItem = false;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update sub-tabs visibility
    const subTabsContainer = document.getElementById('sub-tabs');
    if (tab === 'projects') {
      subTabsContainer.style.display = 'flex';
      this.currentSubTab = 'featured';
    } else if (tab === 'expertise') {
      subTabsContainer.style.display = 'flex';
      this.currentSubTab = 'categories';
    } else if (tab === 'testimonials') {
      subTabsContainer.style.display = 'flex';
      this.currentSubTab = 'featured';
    } else {
      subTabsContainer.style.display = 'none';
      this.currentSubTab = null;
    }

    this.renderSubTabs();
    this.renderList();
    this.renderEditor();
  }

  /**
   * Switch sub-tab
   */
  switchSubTab(subTab) {
    this.currentSubTab = subTab;
    this.selectedItem = null;
    this.isNewItem = false;

    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subtab === subTab);
    });

    this.renderList();
    this.renderEditor();
  }

  /**
   * Render sub-tabs based on current tab
   */
  renderSubTabs() {
    const container = document.getElementById('sub-tabs');
    let tabs = [];

    if (this.currentTab === 'projects') {
      tabs = [
        { id: 'featured', label: 'Featured' },
        { id: 'medicalImaging', label: 'Medical Imaging' },
        { id: 'orthodontic', label: 'Orthodontic' },
        { id: 'equipmentControl', label: 'Equipment' },
        { id: 'enterprise', label: 'Enterprise' },
        { id: 'openSource', label: 'Open Source' }
      ];
    } else if (this.currentTab === 'expertise') {
      tabs = [
        { id: 'categories', label: 'Categories' },
        { id: 'certifications', label: 'Certifications' },
        { id: 'heroCapabilities', label: 'Hero Capabilities' },
        { id: 'lifecycleDetails', label: 'Lifecycle Details' }
      ];
    } else if (this.currentTab === 'testimonials') {
      tabs = [
        { id: 'featured', label: 'Featured' },
        { id: 'all', label: 'All Testimonials' }
      ];
    }

    container.innerHTML = tabs.map(t => `
      <button class="sub-tab-btn ${t.id === this.currentSubTab ? 'active' : ''}" data-subtab="${t.id}">
        ${t.label}
      </button>
    `).join('');
  }

  /**
   * Get current items based on tab/subtab
   */
  getCurrentItems() {
    switch (this.currentTab) {
      case 'projects':
        return this.data.projects?.[this.currentSubTab] || [];
      case 'career':
        return this.data.career?.timeline || [];
      case 'expertise':
        return this.data.expertise?.[this.currentSubTab] || [];
      case 'testimonials':
        if (this.currentSubTab === 'featured') {
          return this.data.testimonials?.featured ? [this.data.testimonials.featured] : [];
        }
        return this.data.testimonials?.testimonials || [];
      default:
        return [];
    }
  }

  /**
   * Render the list panel
   */
  renderList() {
    const container = document.getElementById('list-panel');
    const items = this.getCurrentItems();
    container.innerHTML = AdminComponents.renderItemList(items, this.currentTab, this.selectedItem);
  }

  /**
   * Render the editor panel
   */
  renderEditor() {
    const container = document.getElementById('editor-panel');

    if (!this.selectedItem && !this.isNewItem) {
      container.innerHTML = AdminComponents.renderEmptyEditor();
      return;
    }

    let formHtml = '';
    const item = this.isNewItem ? {} : this.findItem(this.selectedItem);

    switch (this.currentTab) {
      case 'projects':
        formHtml = AdminComponents.renderProjectForm(item, this.currentSubTab);
        break;
      case 'career':
        formHtml = AdminComponents.renderCareerForm(item);
        break;
      case 'expertise':
        if (this.currentSubTab === 'categories') {
          formHtml = AdminComponents.renderExpertiseCategoryForm(item);
        } else if (this.currentSubTab === 'certifications') {
          formHtml = AdminComponents.renderCertificationForm(item);
        } else {
          formHtml = AdminComponents.renderLifecycleForm(item);
        }
        break;
      case 'testimonials':
        if (this.currentSubTab === 'featured') {
          formHtml = AdminComponents.renderFeaturedTestimonialForm(item);
        } else {
          formHtml = AdminComponents.renderTestimonialForm(item);
        }
        break;
    }

    container.innerHTML = AdminComponents.renderEditorPanelWithPreview(formHtml, this.isNewItem, this.previewActive);

    // Update preview if active
    if (this.previewActive) {
      this.updatePreview();
    }
  }

  /**
   * Toggle preview panel
   */
  togglePreview() {
    this.previewActive = !this.previewActive;

    const btn = document.getElementById('btn-toggle-preview');
    const content = document.getElementById('editor-content');

    if (btn) {
      btn.classList.toggle('active', this.previewActive);
    }

    if (content) {
      content.classList.toggle('preview-active', this.previewActive);
    }

    if (this.previewActive) {
      this.updatePreview();
    }
  }

  /**
   * Update preview with debounce
   */
  updatePreviewDebounced() {
    if (!this.previewActive) return;

    if (this.previewDebounceTimer) {
      clearTimeout(this.previewDebounceTimer);
    }

    this.previewDebounceTimer = setTimeout(() => {
      this.updatePreview();
    }, 150);
  }

  /**
   * Update preview content
   */
  updatePreview() {
    const previewContent = document.getElementById('preview-content');
    if (!previewContent) return;

    const formData = this.collectFormData();
    if (!formData) {
      previewContent.innerHTML = AdminComponents.renderPreviewEmpty();
      return;
    }

    let previewHtml = '';

    switch (this.currentTab) {
      case 'projects':
        previewHtml = AdminComponents.renderProjectPreview(formData, this.currentSubTab);
        break;
      case 'career':
        previewHtml = AdminComponents.renderCareerPreview(formData);
        break;
      case 'expertise':
        previewHtml = AdminComponents.renderExpertisePreview(formData, this.currentSubTab);
        break;
      case 'testimonials':
        previewHtml = AdminComponents.renderTestimonialPreview(formData, this.currentSubTab === 'featured');
        break;
      default:
        previewHtml = AdminComponents.renderPreviewEmpty();
    }

    previewContent.innerHTML = previewHtml;
  }

  /**
   * Find item by ID
   */
  findItem(id) {
    const items = this.getCurrentItems();
    // Use loose equality to handle number vs string comparison
    return items.find(item => {
      const itemId = item.id || item.title || item.author;
      return itemId == id || String(itemId) === String(id);
    });
  }

  /**
   * Select an item for editing
   */
  selectItem(id) {
    this.selectedItem = id;
    this.isNewItem = false;
    this.renderList();
    this.renderEditor();
  }

  /**
   * Create a new item
   */
  createNewItem() {
    this.selectedItem = null;
    this.isNewItem = true;
    this.renderEditor();
  }

  /**
   * Cancel editing
   */
  cancelEdit() {
    this.selectedItem = null;
    this.isNewItem = false;
    this.renderList();
    this.renderEditor();
  }

  /**
   * Toggle nested section
   */
  toggleNested(targetId) {
    const content = document.getElementById(targetId);
    const icon = document.querySelector(`[data-target="${targetId}"] .toggle-icon`);
    if (content) {
      content.classList.toggle('collapsed');
      if (icon) {
        icon.style.transform = content.classList.contains('collapsed') ? 'rotate(-90deg)' : '';
      }
    }
  }

  /**
   * Add item to array field
   */
  addArrayItem(fieldId) {
    const input = document.getElementById(`${fieldId}-input`);
    const hiddenInput = document.getElementById(fieldId);
    const tagsContainer = document.getElementById(`${fieldId}-tags`);

    if (!input || !input.value.trim()) return;

    const values = FormFields.parseArrayValue(hiddenInput.value);
    values.push(input.value.trim());
    hiddenInput.value = JSON.stringify(values);

    // Re-render tags
    tagsContainer.innerHTML = values.map((val, idx) => `
      <span class="tag-item" data-index="${idx}">
        ${FormFields.escapeHtml(val)}
        <button type="button" class="tag-remove" data-field="${fieldId}" data-index="${idx}">&times;</button>
      </span>
    `).join('');

    input.value = '';
    input.focus();
  }

  /**
   * Remove item from array field
   */
  removeArrayItem(fieldId, index) {
    const hiddenInput = document.getElementById(fieldId);
    const tagsContainer = document.getElementById(`${fieldId}-tags`);

    const values = FormFields.parseArrayValue(hiddenInput.value);
    values.splice(index, 1);
    hiddenInput.value = JSON.stringify(values);

    // Re-render tags
    tagsContainer.innerHTML = values.map((val, idx) => `
      <span class="tag-item" data-index="${idx}">
        ${FormFields.escapeHtml(val)}
        <button type="button" class="tag-remove" data-field="${fieldId}" data-index="${idx}">&times;</button>
      </span>
    `).join('');
  }

  /**
   * Add object to object array field
   */
  addObjectArrayItem(fieldId) {
    const container = document.getElementById(`${fieldId}-container`);
    const itemsContainer = document.getElementById(`${fieldId}-items`);
    const hiddenInput = document.getElementById(fieldId);

    const values = FormFields.parseArrayValue(hiddenInput.value);
    const newIndex = values.length;
    values.push({});
    hiddenInput.value = JSON.stringify(values);

    // Get field config based on fieldId
    let fields = [];
    if (fieldId === 'metrics') {
      fields = [
        { key: 'value', label: 'Value', type: 'text' },
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'change', label: 'Change', type: 'text' },
        { key: 'positive', label: 'Positive', type: 'checkbox' }
      ];
    } else if (fieldId === 'labels') {
      fields = [
        { key: 'text', label: 'Text', type: 'text' },
        { key: 'type', label: 'Type', type: 'text' }
      ];
    }

    itemsContainer.insertAdjacentHTML('beforeend', FormFields.objectArrayItem(fieldId, newIndex, {}, fields));
  }

  /**
   * Remove object from object array field
   */
  removeObjectArrayItem(fieldId, index) {
    const itemsContainer = document.getElementById(`${fieldId}-items`);
    const hiddenInput = document.getElementById(fieldId);
    const item = itemsContainer.querySelector(`[data-index="${index}"]`);

    if (item) {
      item.remove();
    }

    // Update hidden input
    const values = FormFields.parseArrayValue(hiddenInput.value);
    values.splice(index, 1);
    hiddenInput.value = JSON.stringify(values);

    // Re-index remaining items
    itemsContainer.querySelectorAll('.object-array-item').forEach((el, idx) => {
      el.dataset.index = idx;
      el.querySelectorAll('input').forEach(input => {
        const name = input.name.replace(/_\d+_/, `_${idx}_`);
        input.name = name;
      });
      el.querySelector('.btn-remove-object').dataset.index = idx;
    });
  }

  /**
   * Collect form data
   */
  collectFormData() {
    const form = document.getElementById('editor-form');
    if (!form) return null;

    const formData = new FormData(form);
    const data = {};

    // Get list of object-array and array-input field names to skip
    const skipFields = new Set();
    form.querySelectorAll('.object-array input[type="hidden"]').forEach(input => {
      skipFields.add(input.name);
    });
    form.querySelectorAll('.array-input input[type="hidden"]').forEach(input => {
      skipFields.add(input.name);
    });

    // Process regular fields
    for (const [key, value] of formData.entries()) {
      // Skip array notation fields and special fields (handled separately)
      if (key.includes('[]') || key.includes('_')) continue;
      if (skipFields.has(key)) continue;
      data[key] = value;
    }

    // Process multi-select (roles)
    const rolesCheckboxes = form.querySelectorAll('input[name="roles[]"]:checked');
    if (rolesCheckboxes.length > 0) {
      data.roles = Array.from(rolesCheckboxes).map(cb => cb.value);
    }

    // Process nested object (expanded) FIRST - before other array fields
    const nestedContent = form.querySelector('.nested-content');
    if (nestedContent) {
      data.expanded = {};
      nestedContent.querySelectorAll('.array-input input[type="hidden"]').forEach(input => {
        const key = input.name.replace('expanded_', '');
        const values = FormFields.parseArrayValue(input.value);
        if (values && values.length > 0) {
          data.expanded[key] = values;
        }
      });
      if (Object.keys(data.expanded).length === 0) {
        delete data.expanded;
      }
    }

    // Process array fields (tags, achievements, etc.) - exclude nested-content
    form.querySelectorAll('.array-input input[type="hidden"]').forEach(input => {
      // Skip if inside nested-content (already handled above)
      if (input.closest('.nested-content')) return;
      data[input.name] = FormFields.parseArrayValue(input.value);
    });

    // Process object array fields (metrics, labels)
    form.querySelectorAll('.object-array input[type="hidden"]').forEach(input => {
      const fieldId = input.name;
      const itemsContainer = document.getElementById(`${fieldId}-items`);
      if (!itemsContainer) return;

      const items = [];

      itemsContainer.querySelectorAll('.object-array-item').forEach((itemEl, idx) => {
        const item = {};
        itemEl.querySelectorAll('input').forEach(fieldInput => {
          const match = fieldInput.name.match(/_\d+_(.+)$/);
          if (match) {
            const key = match[1];
            if (fieldInput.type === 'checkbox') {
              item[key] = fieldInput.checked;
            } else {
              item[key] = fieldInput.value;
            }
          }
        });
        if (Object.keys(item).length > 0) {
          items.push(item);
        }
      });

      if (items.length > 0) {
        data[fieldId] = items;
      }
    });

    // Process checkbox fields
    form.querySelectorAll('.form-checkbox input[type="checkbox"]').forEach(cb => {
      if (!cb.name.includes('[]')) {
        data[cb.name] = cb.checked;
      }
    });

    // Convert number fields
    if (data.stars) data.stars = parseInt(data.stars) || 0;
    if (data.id && this.currentTab === 'testimonials') data.id = parseInt(data.id) || Date.now();

    return data;
  }

  /**
   * Save current item
   */
  async saveItem() {
    console.log('=== saveItem START ===');
    console.log('currentTab:', this.currentTab, 'currentSubTab:', this.currentSubTab);
    console.log('selectedItem:', this.selectedItem, 'isNewItem:', this.isNewItem);

    const formData = this.collectFormData();
    if (!formData) {
      console.error('saveItem: No form data collected');
      alert('ERROR: Failed to collect form data');
      return;
    }

    console.log('saveItem: Collected form data:', JSON.stringify(formData, null, 2));

    const category = formData.category;
    delete formData.category;

    // Special handling for Testimonials Featured - it's a single object, not an array
    if (this.currentTab === 'testimonials' && this.currentSubTab === 'featured') {
      console.log('saveItem: Saving Featured Testimonial');
      this.data.testimonials.featured = formData;
      this.unsavedChanges.add(this.currentTab);
      this.updateStatusBar();
      this.selectedItem = formData.author;
      this.isNewItem = false;
      this.renderList();
      this.renderEditor();
      this.showToast('Item saved (not yet written to file)', 'success');
      console.log('=== saveItem END (Featured) ===');
      return;
    }

    // Get reference to the data array
    let items;
    let dataPath;
    switch (this.currentTab) {
      case 'projects':
        if (!this.data.projects) this.data.projects = {};
        if (!this.data.projects[this.currentSubTab]) this.data.projects[this.currentSubTab] = [];
        items = this.data.projects[this.currentSubTab];
        dataPath = `this.data.projects.${this.currentSubTab}`;
        break;
      case 'career':
        if (!this.data.career) this.data.career = {};
        if (!this.data.career.timeline) this.data.career.timeline = [];
        items = this.data.career.timeline;
        dataPath = 'this.data.career.timeline';
        break;
      case 'expertise':
        if (!this.data.expertise) this.data.expertise = {};
        if (!this.data.expertise[this.currentSubTab]) this.data.expertise[this.currentSubTab] = [];
        items = this.data.expertise[this.currentSubTab];
        dataPath = `this.data.expertise.${this.currentSubTab}`;
        break;
      case 'testimonials':
        if (!this.data.testimonials) this.data.testimonials = {};
        if (!this.data.testimonials.testimonials) this.data.testimonials.testimonials = [];
        items = this.data.testimonials.testimonials;
        dataPath = 'this.data.testimonials.testimonials';
        break;
      default:
        console.error('saveItem: Unknown tab:', this.currentTab);
        alert('ERROR: Unknown tab: ' + this.currentTab);
        return;
    }

    console.log('saveItem: dataPath:', dataPath);
    console.log('saveItem: items count before:', items.length);

    if (this.isNewItem) {
      // Generate ID if not provided
      if (!formData.id) {
        formData.id = `${this.currentSubTab || this.currentTab}-${Date.now()}`;
      }
      items.push(formData);
      console.log('saveItem: Added new item with id:', formData.id);
      console.log('saveItem: items count after:', items.length);
    } else {
      // Update existing item - use loose equality for type-agnostic comparison
      const index = items.findIndex(item => {
        const itemId = item.id || item.title || item.author;
        const matches = itemId == this.selectedItem || String(itemId) === String(this.selectedItem);
        console.log(`  comparing itemId=${itemId} with selectedItem=${this.selectedItem}: ${matches}`);
        return matches;
      });

      console.log('saveItem: Found index:', index);

      if (index !== -1) {
        console.log('saveItem: Before update, item:', JSON.stringify(items[index], null, 2).substring(0, 200));
        items[index] = formData;
        console.log('saveItem: After update, item:', JSON.stringify(items[index], null, 2).substring(0, 200));
      } else {
        console.error('saveItem: Could not find item to update');
        console.error('  selectedItem:', this.selectedItem);
        console.error('  available IDs:', items.map(i => i.id || i.title || i.author));
        alert('ERROR: Could not find item to update. selectedItem=' + this.selectedItem);
        return;
      }
    }

    // Mark as changed
    this.unsavedChanges.add(this.currentTab);
    console.log('saveItem: Unsaved changes:', Array.from(this.unsavedChanges));
    this.updateStatusBar();

    // Update selection
    this.selectedItem = formData.id || formData.title || formData.author;
    this.isNewItem = false;

    console.log('saveItem: New selectedItem:', this.selectedItem);

    this.renderList();
    this.renderEditor();
    this.showToast('Item saved (not yet written to file)', 'success');
    console.log('=== saveItem END ===');
  }

  /**
   * Confirm delete
   */
  confirmDelete(id) {
    const modal = AdminComponents.renderConfirmModal(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      'Delete',
      'Cancel'
    );

    document.body.insertAdjacentHTML('beforeend', modal);

    const modalEl = document.getElementById('confirm-modal');
    setTimeout(() => modalEl.classList.add('active'), 10);

    const closeModal = () => {
      modalEl.classList.remove('active');
      setTimeout(() => modalEl.remove(), 200);
    };

    modalEl.querySelector('.modal-close').addEventListener('click', closeModal);
    modalEl.querySelector('.modal-cancel').addEventListener('click', closeModal);
    modalEl.querySelector('.modal-confirm').addEventListener('click', () => {
      this.deleteItem(id);
      closeModal();
    });
  }

  /**
   * Delete item
   */
  deleteItem(id) {
    // Special handling for Testimonials Featured - cannot delete, only clear
    if (this.currentTab === 'testimonials' && this.currentSubTab === 'featured') {
      this.showToast('Cannot delete featured testimonial. Edit it instead.', 'error');
      return;
    }

    // Get direct reference to the data array
    let items;
    switch (this.currentTab) {
      case 'projects':
        items = this.data.projects?.[this.currentSubTab];
        break;
      case 'career':
        items = this.data.career?.timeline;
        break;
      case 'expertise':
        items = this.data.expertise?.[this.currentSubTab];
        break;
      case 'testimonials':
        items = this.data.testimonials?.testimonials;
        break;
    }

    if (!items) {
      console.error('deleteItem: No items array found');
      return;
    }

    // Use loose equality for type-agnostic comparison
    const index = items.findIndex(item => {
      const itemId = item.id || item.title || item.author;
      return itemId == id || String(itemId) === String(id);
    });

    if (index !== -1) {
      items.splice(index, 1);
      this.unsavedChanges.add(this.currentTab);
      this.updateStatusBar();

      if (this.selectedItem == id || String(this.selectedItem) === String(id)) {
        this.selectedItem = null;
        this.isNewItem = false;
      }

      this.renderList();
      this.renderEditor();
      this.showToast('Item deleted', 'success');
    }
  }

  /**
   * Filter items in list
   */
  filterItems(query) {
    const items = document.querySelectorAll('.item-list-item');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
      const title = item.querySelector('.item-title')?.textContent.toLowerCase() || '';
      const subtitle = item.querySelector('.item-subtitle')?.textContent.toLowerCase() || '';
      const matches = title.includes(lowerQuery) || subtitle.includes(lowerQuery);
      item.style.display = matches ? '' : 'none';
    });
  }

  /**
   * Save all changes
   */
  async saveAll() {
    if (this.unsavedChanges.size === 0) {
      this.showToast('No unsaved changes to save', 'info');
      return;
    }

    let savedCount = 0;
    let failedCount = 0;

    for (const dataType of this.unsavedChanges) {
      let filename, data;

      switch (dataType) {
        case 'projects':
          filename = 'projects.json';
          data = this.data.projects;
          break;
        case 'career':
          filename = 'career.json';
          data = this.data.career;
          break;
        case 'expertise':
          filename = 'expertise.json';
          data = this.data.expertise;
          break;
        case 'testimonials':
          filename = 'testimonials.json';
          data = this.data.testimonials;
          break;
      }

      if (filename && data) {
        try {
          console.log(`Saving ${filename}:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
          const result = await window.FileHandler.saveFile(filename, data);
          if (result.success) {
            savedCount++;
            console.log(`Successfully saved ${filename} via ${result.method}`);
          } else {
            failedCount++;
            console.error(`Failed to save ${filename}`);
          }
        } catch (err) {
          failedCount++;
          console.error(`Error saving ${filename}:`, err);
        }
      }
    }

    if (savedCount > 0) {
      const method = window.FileHandler.hasAccess() ? 'filesystem' : 'download';
      this.showToast(`Saved ${savedCount} file(s) via ${method}`, 'success');
      this.unsavedChanges.clear();
      this.originalData = JSON.parse(JSON.stringify(this.data));
    }
    if (failedCount > 0) {
      this.showToast(`Failed to save ${failedCount} file(s)`, 'error');
    }

    this.updateStatusBar();
  }

  /**
   * Update status bar
   */
  updateStatusBar() {
    const container = document.querySelector('.status-bar');
    const status = window.FileHandler.getStatus();
    container.innerHTML = AdminComponents.renderStatusBar(this.unsavedChanges.size, status);
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Main render function
   */
  render() {
    this.renderSubTabs();
    this.renderList();
    this.renderEditor();
  }

  /**
   * Bind export dropdown events
   */
  bindExportEvents() {
    const dropdown = document.getElementById('export-dropdown');
    const toggle = document.getElementById('export-toggle');
    const menu = document.getElementById('export-menu');

    if (!dropdown || !toggle) return;

    // Toggle dropdown
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    // Export PDF
    document.getElementById('export-pdf')?.addEventListener('click', () => {
      dropdown.classList.remove('active');
      this.exportPDF();
    });

    // Export DOCX
    document.getElementById('export-docx')?.addEventListener('click', () => {
      dropdown.classList.remove('active');
      this.exportDOCX();
    });

    // Export Options
    document.getElementById('export-options')?.addEventListener('click', () => {
      dropdown.classList.remove('active');
      this.showExportOptionsModal();
    });
  }

  /**
   * Export portfolio as PDF
   */
  async exportPDF(options = {}) {
    if (!window.PDFExporter?.isAvailable()) {
      this.showToast('PDF export library not loaded', 'error');
      return;
    }

    this.showExportProgress('Generating PDF...');

    try {
      const result = await window.PDFExporter.generatePDF(this.data, {
        filename: 'portfolio.pdf',
        author: 'Dongcheol Shin',
        ...options
      });

      this.hideExportProgress();
      this.showToast(`PDF exported: ${result.filename}`, 'success');
    } catch (error) {
      this.hideExportProgress();
      console.error('PDF export failed:', error);
      this.showToast('PDF export failed: ' + error.message, 'error');
    }
  }

  /**
   * Export portfolio as DOCX
   */
  async exportDOCX(options = {}) {
    if (!window.DOCXExporter?.isAvailable()) {
      this.showToast('Word export library not loaded', 'error');
      return;
    }

    this.showExportProgress('Generating Word document...');

    try {
      const result = await window.DOCXExporter.generateDOCX(this.data, {
        filename: 'portfolio.docx',
        author: 'Dongcheol Shin',
        ...options
      });

      this.hideExportProgress();
      this.showToast(`Word document exported: ${result.filename}`, 'success');
    } catch (error) {
      this.hideExportProgress();
      console.error('DOCX export failed:', error);
      this.showToast('Word export failed: ' + error.message, 'error');
    }
  }

  /**
   * Show export progress overlay
   */
  showExportProgress(message) {
    const overlay = document.createElement('div');
    overlay.id = 'export-progress-overlay';
    overlay.className = 'export-progress-overlay';
    overlay.innerHTML = `
      <div class="export-progress-modal">
        <div class="export-progress-spinner"></div>
        <div class="export-progress-text">${message}</div>
        <div class="export-progress-subtext">Please wait...</div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
  }

  /**
   * Hide export progress overlay
   */
  hideExportProgress() {
    const overlay = document.getElementById('export-progress-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 200);
    }
  }

  /**
   * Get available themes for export
   * @returns {Array} Array of theme objects with id, name, description, colors
   */
  getAvailableThemes() {
    const styleManager = window.StyleManager;
    if (styleManager && styleManager.getAllThemes) {
      return styleManager.getAllThemes().map(theme => ({
        id: theme.id,
        name: theme.name,
        description: theme.description,
        colors: theme.colors
      }));
    }
    // Fallback themes
    return [
      { id: 'professional', name: 'Professional', description: 'Clean blue and gray palette', colors: { primary: '#3B82F6', secondary: '#6B7280', accent: '#22C55E', text: { primary: '#1F2937' }, background: { page: '#FFFFFF' } } },
      { id: 'modern-dark', name: 'Modern Dark', description: 'Sleek dark theme', colors: { primary: '#60A5FA', secondary: '#A78BFA', accent: '#34D399', text: { primary: '#F9FAFB' }, background: { page: '#1F2937' } } },
      { id: 'minimal', name: 'Minimal', description: 'Clean black and white', colors: { primary: '#111827', secondary: '#374151', accent: '#111827', text: { primary: '#111827' }, background: { page: '#FFFFFF' } } },
      { id: 'creative', name: 'Creative', description: 'Vibrant colors', colors: { primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B', text: { primary: '#1F2937' }, background: { page: '#FFFFFF' } } },
      { id: 'executive', name: 'Executive', description: 'Navy and gold', colors: { primary: '#1E3A5F', secondary: '#B8860B', accent: '#B8860B', text: { primary: '#1E293B' }, background: { page: '#FFFFFF' } } }
    ];
  }

  /**
   * Get saved export theme preference from localStorage
   * @returns {string} Theme ID
   */
  getSavedExportTheme() {
    return localStorage.getItem('portfolioExportTheme') || 'professional';
  }

  /**
   * Save export theme preference to localStorage
   * @param {string} themeId - Theme ID to save
   */
  saveExportTheme(themeId) {
    localStorage.setItem('portfolioExportTheme', themeId);
  }

  /**
   * Build theme preview card HTML
   * @param {Object} theme - Theme object with colors
   * @returns {string} HTML string for preview card
   */
  buildThemePreviewCard(theme) {
    if (!theme || !theme.colors) return '';

    const { colors } = theme;
    const bgColor = colors.background?.page || '#FFFFFF';
    const textColor = colors.text?.primary || '#1F2937';

    return `
      <div class="theme-preview-card">
        <div class="theme-preview-swatch" style="background: ${bgColor};">
          <div class="swatch-header" style="background: ${colors.primary};"></div>
          <div class="swatch-body">
            <div class="swatch-line" style="background: ${textColor}; width: 80%;"></div>
            <div class="swatch-line" style="background: ${colors.secondary || textColor}; width: 60%; opacity: 0.7;"></div>
            <div class="swatch-line" style="background: ${textColor}; width: 70%; opacity: 0.5;"></div>
          </div>
          <div class="swatch-accent" style="background: ${colors.accent || colors.primary};"></div>
        </div>
        <div class="theme-preview-info">
          <h4 class="theme-name">${theme.name}</h4>
          <p class="theme-description">${theme.description}</p>
          <div class="theme-colors">
            <span class="color-dot" style="background: ${colors.primary};" title="Primary"></span>
            <span class="color-dot" style="background: ${colors.secondary || colors.primary};" title="Secondary"></span>
            <span class="color-dot" style="background: ${colors.accent || colors.primary};" title="Accent"></span>
            <span class="color-dot" style="background: ${textColor};" title="Text"></span>
            <span class="color-dot" style="background: ${bgColor}; border: 1px solid #E5E7EB;" title="Background"></span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update theme preview in export modal
   * @param {string} themeId - Selected theme ID
   */
  updateExportThemePreview(themeId) {
    const themes = this.getAvailableThemes();
    const theme = themes.find(t => t.id === themeId);
    const previewContainer = document.getElementById('theme-preview-container');

    if (previewContainer && theme) {
      previewContainer.innerHTML = this.buildThemePreviewCard(theme);
    }
  }

  /**
   * Show export options modal
   */
  showExportOptionsModal() {
    const themes = this.getAvailableThemes();
    const savedTheme = this.getSavedExportTheme();
    const selectedTheme = themes.find(t => t.id === savedTheme) || themes[0];

    // Reset custom overrides
    this.customOverrides = {
      colors: {},
      typography: {},
      spacing: {}
    };

    const themeOptions = themes.map(t =>
      `<option value="${t.id}" ${t.id === savedTheme ? 'selected' : ''}>${t.name}</option>`
    ).join('');

    const modal = `
      <div class="modal-overlay" id="export-options-modal">
        <div class="modal export-modal">
          <div class="modal-header">
            <h3>Export Portfolio</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="export-format">Format</label>
              <select id="export-format" class="form-select">
                <option value="pdf">PDF (.pdf)</option>
                <option value="docx">Word (.docx)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="export-theme">Theme</label>
              <select id="export-theme" class="form-select">
                ${themeOptions}
              </select>
            </div>

            <div class="theme-preview-container" id="theme-preview-container">
              ${this.buildThemePreviewCard(selectedTheme)}
            </div>

            <!-- Advanced Options Section -->
            <div class="advanced-options-section">
              <button type="button" class="advanced-toggle" id="advanced-toggle">
                <span class="toggle-icon">&#9654;</span>
                <span>Advanced Options</span>
              </button>

              <div class="advanced-content" id="advanced-content" style="display: none;">
                <!-- Color Customization -->
                <div class="option-group">
                  <h4 class="option-group-title">Colors</h4>
                  <div class="color-options-grid">
                    ${this.buildColorPicker('primary', 'Primary', selectedTheme.colors?.primary || '#3B82F6')}
                    ${this.buildColorPicker('accent', 'Accent', selectedTheme.colors?.accent || '#22C55E')}
                    ${this.buildColorPicker('text', 'Text', selectedTheme.colors?.text?.primary || '#1F2937')}
                    ${this.buildColorPicker('background', 'Background', selectedTheme.colors?.background?.section || '#F9FAFB')}
                  </div>
                </div>

                <!-- Typography -->
                <div class="option-group">
                  <h4 class="option-group-title">Typography</h4>
                  <div class="button-group" id="font-size-group">
                    <button type="button" class="size-btn" data-size="small">Small</button>
                    <button type="button" class="size-btn active" data-size="medium">Medium</button>
                    <button type="button" class="size-btn" data-size="large">Large</button>
                  </div>
                </div>

                <!-- Page Margins -->
                <div class="option-group">
                  <h4 class="option-group-title">Page Margins</h4>
                  <div class="button-group" id="margin-group">
                    <button type="button" class="size-btn" data-margin="compact">Compact</button>
                    <button type="button" class="size-btn active" data-margin="normal">Normal</button>
                    <button type="button" class="size-btn" data-margin="wide">Wide</button>
                  </div>
                </div>

                <!-- Reset Button -->
                <button type="button" class="btn-reset-defaults" id="btn-reset-defaults">
                  &#8634; Reset to Theme Defaults
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Sections to Include</label>
              <div class="checkbox-grid">
                <label class="checkbox-label">
                  <input type="checkbox" name="export-section" value="expertise" checked>
                  <span>Expertise</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="export-section" value="projects" checked>
                  <span>Projects</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="export-section" value="career" checked>
                  <span>Career</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="export-section" value="testimonials" checked>
                  <span>Testimonials</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="export-filename">Filename</label>
              <input type="text" class="form-input" id="export-filename" value="portfolio" placeholder="Filename (without extension)">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary modal-cancel">Cancel</button>
            <button class="btn btn-primary modal-export">Export</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);

    const modalEl = document.getElementById('export-options-modal');
    setTimeout(() => modalEl.classList.add('active'), 10);

    // Bind advanced options events
    this.bindAdvancedOptionsEvents(modalEl, selectedTheme);

    // Theme selection change handler
    const themeSelect = modalEl.querySelector('#export-theme');
    themeSelect.addEventListener('change', (e) => {
      this.updateExportThemePreview(e.target.value);
      this.updateAdvancedOptionsForTheme(modalEl, e.target.value);
    });

    const closeModal = () => {
      modalEl.classList.remove('active');
      setTimeout(() => modalEl.remove(), 200);
    };

    modalEl.querySelector('.modal-close').addEventListener('click', closeModal);
    modalEl.querySelector('.modal-cancel').addEventListener('click', closeModal);
    modalEl.querySelector('.modal-export').addEventListener('click', () => {
      const format = modalEl.querySelector('#export-format').value;
      const theme = modalEl.querySelector('#export-theme').value;
      const sections = Array.from(modalEl.querySelectorAll('input[name="export-section"]:checked'))
        .map(cb => cb.value);
      const filename = modalEl.querySelector('#export-filename').value || 'portfolio';

      // Save theme preference
      this.saveExportTheme(theme);

      // Save custom preferences
      this.saveExportPreferences();

      closeModal();

      const options = {
        sections,
        filename: `${filename}.${format}`,
        theme,
        themeOverrides: this.buildExportOverrides()
      };

      if (format === 'pdf') {
        this.exportPDF(options);
      } else {
        this.exportDOCX(options);
      }
    });
  }

  /**
   * Build color picker HTML
   * @param {string} id - Color picker ID
   * @param {string} label - Display label
   * @param {string} defaultValue - Default hex color
   * @returns {string} HTML string
   */
  buildColorPicker(id, label, defaultValue) {
    return `
      <div class="color-picker-group">
        <label class="color-label">${label}</label>
        <div class="color-input-wrapper">
          <input type="color"
                 id="color-${id}"
                 class="color-input"
                 value="${defaultValue}"
                 data-default="${defaultValue}">
          <input type="text"
                 id="color-${id}-hex"
                 class="hex-input"
                 value="${defaultValue}"
                 pattern="^#[0-9A-Fa-f]{6}$">
        </div>
        <button type="button" class="btn-reset-color" data-color-id="${id}" title="Reset to theme default">
          &#8634;
        </button>
      </div>
    `;
  }

  /**
   * Bind advanced options event handlers
   * @param {HTMLElement} modalEl - Modal element
   * @param {Object} theme - Current theme object
   */
  bindAdvancedOptionsEvents(modalEl, theme) {
    // Toggle advanced options
    const toggleBtn = modalEl.querySelector('#advanced-toggle');
    const content = modalEl.querySelector('#advanced-content');

    toggleBtn.addEventListener('click', () => {
      const isExpanded = content.style.display !== 'none';
      content.style.display = isExpanded ? 'none' : 'block';
      toggleBtn.classList.toggle('expanded', !isExpanded);
      toggleBtn.querySelector('.toggle-icon').innerHTML = isExpanded ? '&#9654;' : '&#9660;';
    });

    // Color picker handlers
    ['primary', 'accent', 'text', 'background'].forEach(colorId => {
      const colorInput = modalEl.querySelector(`#color-${colorId}`);
      const hexInput = modalEl.querySelector(`#color-${colorId}-hex`);
      const resetBtn = modalEl.querySelector(`.btn-reset-color[data-color-id="${colorId}"]`);

      colorInput.addEventListener('input', (e) => {
        hexInput.value = e.target.value;
        this.setColorOverride(colorId, e.target.value);
        this.updateThemePreviewWithOverrides(modalEl);
      });

      hexInput.addEventListener('change', (e) => {
        const value = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/i.test(value)) {
          colorInput.value = value;
          this.setColorOverride(colorId, value);
          this.updateThemePreviewWithOverrides(modalEl);
        } else {
          e.target.value = colorInput.value;
        }
      });

      resetBtn.addEventListener('click', () => {
        const defaultValue = colorInput.dataset.default;
        colorInput.value = defaultValue;
        hexInput.value = defaultValue;
        this.removeColorOverride(colorId);
        this.updateThemePreviewWithOverrides(modalEl);
      });
    });

    // Font size handlers
    const fontSizeBtns = modalEl.querySelectorAll('#font-size-group .size-btn');
    fontSizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fontSizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setFontSizeOverride(btn.dataset.size);
        this.updateThemePreviewWithOverrides(modalEl);
      });
    });

    // Margin handlers
    const marginBtns = modalEl.querySelectorAll('#margin-group .size-btn');
    marginBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        marginBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMarginOverride(btn.dataset.margin);
        this.updateThemePreviewWithOverrides(modalEl);
      });
    });

    // Reset to defaults handler
    modalEl.querySelector('#btn-reset-defaults').addEventListener('click', () => {
      this.resetToThemeDefaults(modalEl);
    });
  }

  /**
   * Set color override
   * @param {string} colorId - Color identifier
   * @param {string} value - Hex color value
   */
  setColorOverride(colorId, value) {
    const colorMapping = {
      'primary': { path: 'primary' },
      'accent': { path: 'accent' },
      'text': { path: 'text', nested: 'primary' },
      'background': { path: 'background', nested: 'section' }
    };

    const mapping = colorMapping[colorId];
    if (!mapping) return;

    if (mapping.nested) {
      if (!this.customOverrides.colors[mapping.path]) {
        this.customOverrides.colors[mapping.path] = {};
      }
      this.customOverrides.colors[mapping.path][mapping.nested] = value;
    } else {
      this.customOverrides.colors[mapping.path] = value;
    }
  }

  /**
   * Remove color override
   * @param {string} colorId - Color identifier
   */
  removeColorOverride(colorId) {
    const colorMapping = {
      'primary': { path: 'primary' },
      'accent': { path: 'accent' },
      'text': { path: 'text', nested: 'primary' },
      'background': { path: 'background', nested: 'section' }
    };

    const mapping = colorMapping[colorId];
    if (!mapping) return;

    if (mapping.nested) {
      if (this.customOverrides.colors[mapping.path]) {
        delete this.customOverrides.colors[mapping.path][mapping.nested];
        if (Object.keys(this.customOverrides.colors[mapping.path]).length === 0) {
          delete this.customOverrides.colors[mapping.path];
        }
      }
    } else {
      delete this.customOverrides.colors[mapping.path];
    }
  }

  /**
   * Set font size override
   * @param {string} size - Size preset (small, medium, large)
   */
  setFontSizeOverride(size) {
    const multipliers = {
      small: 0.85,
      medium: 1.0,
      large: 1.15
    };

    if (size === 'medium') {
      delete this.customOverrides.typography.sizeMultiplier;
    } else {
      this.customOverrides.typography.sizeMultiplier = multipliers[size];
    }
  }

  /**
   * Set margin override
   * @param {string} preset - Margin preset (compact, normal, wide)
   */
  setMarginOverride(preset) {
    const presets = {
      compact: {
        marginTop: 40,
        marginRight: 30,
        marginBottom: 40,
        marginLeft: 30
      },
      normal: null, // Use theme defaults
      wide: {
        marginTop: 80,
        marginRight: 60,
        marginBottom: 80,
        marginLeft: 60
      }
    };

    if (preset === 'normal') {
      delete this.customOverrides.spacing.page;
    } else {
      this.customOverrides.spacing.page = presets[preset];
    }
  }

  /**
   * Reset all overrides to theme defaults
   * @param {HTMLElement} modalEl - Modal element
   */
  resetToThemeDefaults(modalEl) {
    const themeId = modalEl.querySelector('#export-theme').value;
    const themes = this.getAvailableThemes();
    const theme = themes.find(t => t.id === themeId);

    // Reset overrides
    this.customOverrides = {
      colors: {},
      typography: {},
      spacing: {}
    };

    // Reset color inputs
    ['primary', 'accent', 'text', 'background'].forEach(colorId => {
      const colorInput = modalEl.querySelector(`#color-${colorId}`);
      const hexInput = modalEl.querySelector(`#color-${colorId}-hex`);
      const defaultValue = colorInput.dataset.default;
      colorInput.value = defaultValue;
      hexInput.value = defaultValue;
    });

    // Reset font size to medium
    modalEl.querySelectorAll('#font-size-group .size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === 'medium');
    });

    // Reset margins to normal
    modalEl.querySelectorAll('#margin-group .size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.margin === 'normal');
    });

    // Update preview
    this.updateThemePreviewWithOverrides(modalEl);
  }

  /**
   * Update advanced options when theme changes
   * @param {HTMLElement} modalEl - Modal element
   * @param {string} themeId - New theme ID
   */
  updateAdvancedOptionsForTheme(modalEl, themeId) {
    const themes = this.getAvailableThemes();
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    // Reset overrides
    this.customOverrides = {
      colors: {},
      typography: {},
      spacing: {}
    };

    // Update color picker defaults
    const colorDefaults = {
      primary: theme.colors?.primary || '#3B82F6',
      accent: theme.colors?.accent || '#22C55E',
      text: theme.colors?.text?.primary || '#1F2937',
      background: theme.colors?.background?.section || '#F9FAFB'
    };

    Object.entries(colorDefaults).forEach(([colorId, value]) => {
      const colorInput = modalEl.querySelector(`#color-${colorId}`);
      const hexInput = modalEl.querySelector(`#color-${colorId}-hex`);
      if (colorInput && hexInput) {
        colorInput.value = value;
        colorInput.dataset.default = value;
        hexInput.value = value;
      }
    });

    // Reset buttons to defaults
    modalEl.querySelectorAll('#font-size-group .size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === 'medium');
    });
    modalEl.querySelectorAll('#margin-group .size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.margin === 'normal');
    });
  }

  /**
   * Update theme preview with current overrides
   * @param {HTMLElement} modalEl - Modal element
   */
  updateThemePreviewWithOverrides(modalEl) {
    const themeId = modalEl.querySelector('#export-theme').value;
    const themes = this.getAvailableThemes();
    const baseTheme = themes.find(t => t.id === themeId);
    if (!baseTheme) return;

    const previewContainer = modalEl.querySelector('#theme-preview-container');
    const themeName = previewContainer.querySelector('.theme-name');

    // Check if customized
    const hasOverrides = Object.keys(this.customOverrides.colors).length > 0 ||
                         Object.keys(this.customOverrides.typography).length > 0 ||
                         Object.keys(this.customOverrides.spacing).length > 0;

    // Update customized indicator
    let indicator = themeName.querySelector('.customized-indicator');
    if (hasOverrides && !indicator) {
      indicator = document.createElement('span');
      indicator.className = 'customized-indicator';
      indicator.textContent = ' (Customized)';
      themeName.appendChild(indicator);
    } else if (!hasOverrides && indicator) {
      indicator.remove();
    }

    // Update color dots with overridden values
    const colorDots = previewContainer.querySelectorAll('.color-dot');
    const colors = [
      this.customOverrides.colors.primary || baseTheme.colors?.primary,
      this.customOverrides.colors.secondary || baseTheme.colors?.secondary,
      this.customOverrides.colors.accent || baseTheme.colors?.accent,
      this.customOverrides.colors.text?.primary || baseTheme.colors?.text?.primary,
      this.customOverrides.colors.background?.section || baseTheme.colors?.background?.page
    ];

    colorDots.forEach((dot, i) => {
      if (colors[i]) dot.style.background = colors[i];
    });

    // Update swatch header
    const swatchHeader = previewContainer.querySelector('.swatch-header');
    if (swatchHeader && (this.customOverrides.colors.primary || baseTheme.colors?.primary)) {
      swatchHeader.style.background = this.customOverrides.colors.primary || baseTheme.colors?.primary;
    }
  }

  /**
   * Build export overrides object
   * @returns {Object|null} Theme overrides or null if none
   */
  buildExportOverrides() {
    const hasOverrides = Object.keys(this.customOverrides.colors).length > 0 ||
                         Object.keys(this.customOverrides.typography).length > 0 ||
                         Object.keys(this.customOverrides.spacing).length > 0;

    if (!hasOverrides) return null;

    return JSON.parse(JSON.stringify(this.customOverrides));
  }

  /**
   * Save export preferences to localStorage
   */
  saveExportPreferences() {
    const fontSizeBtn = document.querySelector('#font-size-group .size-btn.active');
    const marginBtn = document.querySelector('#margin-group .size-btn.active');

    const prefs = {
      fontSize: fontSizeBtn?.dataset.size || 'medium',
      margin: marginBtn?.dataset.margin || 'normal'
    };

    localStorage.setItem('portfolioExportPrefs', JSON.stringify(prefs));
  }
}

// Global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Global error:', msg, 'at', url, lineNo, columnNo);
  alert('JavaScript Error: ' + msg);
  return false;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing AdminApp...');
  try {
    window.adminApp = new AdminApp();
    console.log('AdminApp initialized successfully');
  } catch (err) {
    console.error('Failed to initialize AdminApp:', err);
    alert('Failed to initialize AdminApp: ' + err.message);
  }
});
