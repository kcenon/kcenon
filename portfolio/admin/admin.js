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
    document.getElementById('editor-panel')?.addEventListener('submit', (e) => {
      if (e.target.id === 'editor-form') {
        e.preventDefault();
        this.saveItem();
      }
    });

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
    const formData = this.collectFormData();
    if (!formData) {
      console.error('saveItem: No form data collected');
      this.showToast('Failed to collect form data', 'error');
      return;
    }

    console.log('saveItem: Collected form data:', formData);

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
      console.log('saveItem: Updated testimonials.featured:', this.data.testimonials.featured);
      return;
    }

    const items = this.getCurrentItems();
    console.log('saveItem: Current items count:', items.length, 'selectedItem:', this.selectedItem, 'isNewItem:', this.isNewItem);

    if (this.isNewItem) {
      // Generate ID if not provided
      if (!formData.id) {
        formData.id = `${this.currentSubTab}-${Date.now()}`;
      }
      items.push(formData);
      console.log('saveItem: Added new item with id:', formData.id);
    } else {
      // Update existing item - use loose equality for type-agnostic comparison
      const index = items.findIndex(item => {
        const itemId = item.id || item.title || item.author;
        return itemId == this.selectedItem || String(itemId) === String(this.selectedItem);
      });
      if (index !== -1) {
        items[index] = formData;
        console.log('saveItem: Updated item at index:', index);
      } else {
        console.error('saveItem: Could not find item to update, selectedItem:', this.selectedItem);
        this.showToast('Failed to find item to update', 'error');
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

    this.renderList();
    this.renderEditor();
    this.showToast('Item saved (not yet written to file)', 'success');
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

    const items = this.getCurrentItems();
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.adminApp = new AdminApp();
});
