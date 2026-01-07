/**
 * File Handler - File System Access API wrapper
 * Handles saving and loading JSON data files
 */

class FileHandler {
  constructor() {
    this.fileHandles = new Map();
    this.directoryHandle = null;
    this.isSupported = 'showDirectoryPicker' in window;
  }

  /**
   * Request access to the data directory
   */
  async requestDirectoryAccess() {
    if (!this.isSupported) {
      console.warn('File System Access API not supported');
      return false;
    }

    try {
      this.directoryHandle = await window.showDirectoryPicker({
        id: 'portfolio-data',
        mode: 'readwrite',
        startIn: 'documents'
      });
      return true;
    } catch (err) {
      if (err.name === 'AbortError') {
        return false;
      }
      throw err;
    }
  }

  /**
   * Load a JSON file from the data directory
   */
  async loadFile(filename) {
    if (this.directoryHandle) {
      try {
        const fileHandle = await this.directoryHandle.getFileHandle(filename);
        const file = await fileHandle.getFile();
        const text = await file.text();
        this.fileHandles.set(filename, fileHandle);
        return JSON.parse(text);
      } catch (err) {
        console.error(`Error loading ${filename}:`, err);
        return null;
      }
    }
    return null;
  }

  /**
   * Save data to a JSON file
   */
  async saveFile(filename, data) {
    const jsonString = JSON.stringify(data, null, 2);

    // Try File System Access API first
    if (this.directoryHandle) {
      try {
        let fileHandle = this.fileHandles.get(filename);
        if (!fileHandle) {
          fileHandle = await this.directoryHandle.getFileHandle(filename, { create: true });
          this.fileHandles.set(filename, fileHandle);
        }
        const writable = await fileHandle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return { success: true, method: 'filesystem' };
      } catch (err) {
        console.error(`Error saving ${filename} via File System API:`, err);
      }
    }

    // Fallback to download
    return this.downloadFile(filename, data);
  }

  /**
   * Fallback: Download file
   */
  downloadFile(filename, data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true, method: 'download' };
  }

  /**
   * Load all data files
   */
  async loadAllData() {
    const data = {
      projects: null,
      career: null,
      expertise: null,
      testimonials: null
    };

    if (this.directoryHandle) {
      data.projects = await this.loadFile('projects.json');
      data.career = await this.loadFile('career.json');
      data.expertise = await this.loadFile('expertise.json');
      data.testimonials = await this.loadFile('testimonials.json');
    }

    return data;
  }

  /**
   * Check if we have directory access
   */
  hasAccess() {
    return this.directoryHandle !== null;
  }

  /**
   * Get API support status
   */
  getStatus() {
    return {
      isSupported: this.isSupported,
      hasAccess: this.hasAccess(),
      browserInfo: this.getBrowserInfo()
    };
  }

  /**
   * Get browser compatibility info
   */
  getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome (Full support)';
    if (ua.includes('Edge')) return 'Edge (Full support)';
    if (ua.includes('Firefox')) return 'Firefox (Download only)';
    if (ua.includes('Safari')) return 'Safari (Download only)';
    return 'Unknown browser';
  }
}

// Export singleton instance
window.FileHandler = new FileHandler();
