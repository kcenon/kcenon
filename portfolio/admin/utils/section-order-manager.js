/**
 * Section Order Manager
 * Manages draggable section list for export options with drag-and-drop reordering
 */

class SectionOrderManager {
  constructor(containerElement, onChange) {
    this.container = containerElement;
    this.sections = [];
    this.draggedItem = null;
    this.draggedIndex = null;
    this.onChange = onChange;
    this.touchStartY = 0;
    this.touchCurrentItem = null;

    this.init();
  }

  /**
   * Initialize the manager
   */
  init() {
    this.loadSavedOrder();
    this.render();
    this.bindEvents();
  }

  /**
   * Load saved section order from localStorage or use defaults
   */
  loadSavedOrder() {
    const saved = localStorage.getItem('export-section-order');
    if (saved) {
      try {
        this.sections = JSON.parse(saved);
        // Validate saved data
        const requiredIds = ['expertise', 'projects', 'career', 'testimonials'];
        const savedIds = this.sections.map(s => s.id);
        const hasAllIds = requiredIds.every(id => savedIds.includes(id));
        if (!hasAllIds) {
          this.sections = this.getDefaultSections();
        }
      } catch (e) {
        this.sections = this.getDefaultSections();
      }
    } else {
      this.sections = this.getDefaultSections();
    }
  }

  /**
   * Get default section configuration
   * @returns {Array} Default sections array
   */
  getDefaultSections() {
    return [
      { id: 'expertise', label: 'Expertise', included: true },
      { id: 'projects', label: 'Projects', included: true },
      { id: 'career', label: 'Career', included: true },
      { id: 'testimonials', label: 'Testimonials', included: true }
    ];
  }

  /**
   * Get ordered sections that are included
   * @returns {Array} Array of section IDs in order
   */
  getOrderedSections() {
    return this.sections
      .filter(s => s.included)
      .map(s => s.id);
  }

  /**
   * Get all sections with their state
   * @returns {Array} All sections array
   */
  getAllSections() {
    return [...this.sections];
  }

  /**
   * Save current order to localStorage
   */
  saveOrder() {
    localStorage.setItem('export-section-order', JSON.stringify(this.sections));
  }

  /**
   * Render the section list
   */
  render() {
    this.container.innerHTML = `
      <div class="section-order-list" role="listbox" aria-label="Section order">
        ${this.sections.map((section, index) => this.renderItem(section, index)).join('')}
      </div>
      <div class="section-order-hint">
        Drag items to reorder • Uncheck to exclude
      </div>
    `;
  }

  /**
   * Render a single section item
   * @param {Object} section - Section object
   * @param {number} index - Item index
   * @returns {string} HTML string
   */
  renderItem(section, index) {
    const isFirst = index === 0;
    const isLast = index === this.sections.length - 1;
    const excludedClass = section.included ? '' : 'excluded';

    return `
      <div class="section-order-item ${excludedClass}"
           data-index="${index}"
           data-id="${section.id}"
           draggable="true"
           role="option"
           aria-selected="${section.included}"
           tabindex="0">
        <span class="drag-handle" aria-hidden="true">⋮⋮</span>
        <label class="section-checkbox">
          <input type="checkbox"
                 ${section.included ? 'checked' : ''}
                 data-id="${section.id}"
                 aria-label="Include ${section.label}">
          <span>${section.label}</span>
        </label>
        <div class="order-buttons">
          <button type="button"
                  class="order-btn"
                  data-action="move-up"
                  data-index="${index}"
                  ${isFirst ? 'disabled' : ''}
                  aria-label="Move ${section.label} up"
                  title="Move up">▲</button>
          <button type="button"
                  class="order-btn"
                  data-action="move-down"
                  data-index="${index}"
                  ${isLast ? 'disabled' : ''}
                  aria-label="Move ${section.label} down"
                  title="Move down">▼</button>
        </div>
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Drag events
    this.container.addEventListener('dragstart', (e) => this.handleDragStart(e));
    this.container.addEventListener('dragend', (e) => this.handleDragEnd(e));
    this.container.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.container.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    this.container.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.container.addEventListener('drop', (e) => this.handleDrop(e));

    // Touch events for mobile
    this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    // Click events for buttons and checkboxes
    this.container.addEventListener('click', (e) => this.handleClick(e));
    this.container.addEventListener('change', (e) => this.handleChange(e));

    // Keyboard events for accessibility
    this.container.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  /**
   * Handle drag start
   * @param {DragEvent} e - Drag event
   */
  handleDragStart(e) {
    const item = e.target.closest('.section-order-item');
    if (!item) return;

    this.draggedItem = item;
    this.draggedIndex = parseInt(item.dataset.index);

    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.index);

    // Create ghost image
    const ghost = item.cloneNode(true);
    ghost.style.opacity = '0.8';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    setTimeout(() => ghost.remove(), 0);
  }

  /**
   * Handle drag end
   * @param {DragEvent} e - Drag event
   */
  handleDragEnd(e) {
    if (this.draggedItem) {
      this.draggedItem.classList.remove('dragging');
    }

    // Remove all drag-over classes
    this.container.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });

    this.draggedItem = null;
    this.draggedIndex = null;
  }

  /**
   * Handle drag over
   * @param {DragEvent} e - Drag event
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  /**
   * Handle drag enter
   * @param {DragEvent} e - Drag event
   */
  handleDragEnter(e) {
    const item = e.target.closest('.section-order-item');
    if (item && item !== this.draggedItem) {
      item.classList.add('drag-over');
    }
  }

  /**
   * Handle drag leave
   * @param {DragEvent} e - Drag event
   */
  handleDragLeave(e) {
    const item = e.target.closest('.section-order-item');
    if (item) {
      // Check if we're leaving to a child element
      const relatedTarget = e.relatedTarget;
      if (!item.contains(relatedTarget)) {
        item.classList.remove('drag-over');
      }
    }
  }

  /**
   * Handle drop
   * @param {DragEvent} e - Drag event
   */
  handleDrop(e) {
    e.preventDefault();

    const targetItem = e.target.closest('.section-order-item');
    if (!targetItem || targetItem === this.draggedItem) return;

    const fromIndex = this.draggedIndex;
    const toIndex = parseInt(targetItem.dataset.index);

    this.moveSection(fromIndex, toIndex);
  }

  /**
   * Handle touch start
   * @param {TouchEvent} e - Touch event
   */
  handleTouchStart(e) {
    const item = e.target.closest('.section-order-item');
    const handle = e.target.closest('.drag-handle');

    if (!item || !handle) return;

    this.touchCurrentItem = item;
    this.touchStartY = e.touches[0].clientY;
    this.draggedIndex = parseInt(item.dataset.index);

    item.classList.add('dragging');
  }

  /**
   * Handle touch move
   * @param {TouchEvent} e - Touch event
   */
  handleTouchMove(e) {
    if (!this.touchCurrentItem) return;

    e.preventDefault();

    const touch = e.touches[0];
    const items = this.container.querySelectorAll('.section-order-item');

    // Find item under touch point
    items.forEach(item => {
      if (item === this.touchCurrentItem) return;

      const rect = item.getBoundingClientRect();
      if (touch.clientY > rect.top && touch.clientY < rect.bottom) {
        item.classList.add('drag-over');
      } else {
        item.classList.remove('drag-over');
      }
    });
  }

  /**
   * Handle touch end
   * @param {TouchEvent} e - Touch event
   */
  handleTouchEnd(e) {
    if (!this.touchCurrentItem) return;

    const dragOverItem = this.container.querySelector('.section-order-item.drag-over');

    if (dragOverItem) {
      const fromIndex = this.draggedIndex;
      const toIndex = parseInt(dragOverItem.dataset.index);
      this.moveSection(fromIndex, toIndex);
    }

    // Cleanup
    this.touchCurrentItem.classList.remove('dragging');
    this.container.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });

    this.touchCurrentItem = null;
    this.touchStartY = 0;
    this.draggedIndex = null;
  }

  /**
   * Handle click events
   * @param {MouseEvent} e - Click event
   */
  handleClick(e) {
    const button = e.target.closest('.order-btn');
    if (!button) return;

    const action = button.dataset.action;
    const index = parseInt(button.dataset.index);

    if (action === 'move-up' && index > 0) {
      this.moveSection(index, index - 1);
      // Announce to screen readers
      this.announceReorder(index, index - 1);
    } else if (action === 'move-down' && index < this.sections.length - 1) {
      this.moveSection(index, index + 1);
      this.announceReorder(index, index + 1);
    }
  }

  /**
   * Handle checkbox change
   * @param {Event} e - Change event
   */
  handleChange(e) {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (!checkbox) return;

    const sectionId = checkbox.dataset.id;
    const section = this.sections.find(s => s.id === sectionId);

    if (section) {
      section.included = checkbox.checked;
      this.saveOrder();
      this.render();
      this.bindEvents();

      if (this.onChange) {
        this.onChange(this.getOrderedSections());
      }
    }
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeydown(e) {
    const item = e.target.closest('.section-order-item');
    if (!item) return;

    const index = parseInt(item.dataset.index);

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (e.altKey && index > 0) {
          // Alt+Up: Move item up
          this.moveSection(index, index - 1);
          this.announceReorder(index, index - 1);
          // Focus moved item
          setTimeout(() => {
            const newItem = this.container.querySelector(`[data-index="${index - 1}"]`);
            if (newItem) newItem.focus();
          }, 100);
        } else if (!e.altKey && index > 0) {
          // Up: Focus previous item
          const prevItem = this.container.querySelector(`[data-index="${index - 1}"]`);
          if (prevItem) prevItem.focus();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (e.altKey && index < this.sections.length - 1) {
          // Alt+Down: Move item down
          this.moveSection(index, index + 1);
          this.announceReorder(index, index + 1);
          setTimeout(() => {
            const newItem = this.container.querySelector(`[data-index="${index + 1}"]`);
            if (newItem) newItem.focus();
          }, 100);
        } else if (!e.altKey && index < this.sections.length - 1) {
          // Down: Focus next item
          const nextItem = this.container.querySelector(`[data-index="${index + 1}"]`);
          if (nextItem) nextItem.focus();
        }
        break;

      case ' ':
      case 'Enter':
        // Toggle checkbox
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && e.target !== checkbox) {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
        break;
    }
  }

  /**
   * Move section from one index to another
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Target index
   */
  moveSection(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= this.sections.length) return;
    if (toIndex < 0 || toIndex >= this.sections.length) return;

    const [movedSection] = this.sections.splice(fromIndex, 1);
    this.sections.splice(toIndex, 0, movedSection);

    this.saveOrder();
    this.render();
    this.bindEvents();

    if (this.onChange) {
      this.onChange(this.getOrderedSections());
    }
  }

  /**
   * Announce reorder to screen readers
   * @param {number} fromIndex - Original index
   * @param {number} toIndex - New index
   */
  announceReorder(fromIndex, toIndex) {
    const section = this.sections[toIndex];
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `${section.label} moved to position ${toIndex + 1} of ${this.sections.length}`;
    announcement.style.cssText = 'position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0);';

    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  /**
   * Reset to default order
   */
  resetToDefault() {
    this.sections = this.getDefaultSections();
    this.saveOrder();
    this.render();
    this.bindEvents();

    if (this.onChange) {
      this.onChange(this.getOrderedSections());
    }
  }

  /**
   * Set sections from external source
   * @param {Array} sections - Sections array
   */
  setSections(sections) {
    this.sections = sections;
    this.render();
    this.bindEvents();
  }

  /**
   * Destroy the manager
   */
  destroy() {
    this.container.innerHTML = '';
    this.sections = [];
    this.draggedItem = null;
    this.draggedIndex = null;
    this.onChange = null;
  }
}

// Export to window
window.SectionOrderManager = SectionOrderManager;
