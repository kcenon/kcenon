/**
 * Portfolio Data Loader
 * Dynamically loads data from JSON files
 */

(async function() {
  const DATA_BASE_PATH = 'data';
  // Bump on every content change to invalidate browser/CDN caches.
  const DATA_VERSION = '3.1.0';
  const PRIVATE_ACCESS_KEY = 'kcenon.private.access';
  const PRIVATE_ACCESS_TOKEN = 'enabled';

  /**
   * Process URL parameters for private access toggling.
   * - ?private=on  → grant access (persisted in localStorage)
   * - ?private=off → revoke access
   * The URL parameter is cleaned up after processing to avoid leaking the
   * access intent through shared/copied links.
   */
  function processPrivateAccessParam() {
    try {
      const params = new URLSearchParams(window.location.search);
      const value = params.get('private');
      if (value === 'on') {
        localStorage.setItem(PRIVATE_ACCESS_KEY, PRIVATE_ACCESS_TOKEN);
      } else if (value === 'off') {
        localStorage.removeItem(PRIVATE_ACCESS_KEY);
      }
      if (value !== null) {
        params.delete('private');
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
    } catch (e) {
      // localStorage may be unavailable (e.g. file:// in some browsers)
    }
  }

  function hasPrivateAccess() {
    try {
      return localStorage.getItem(PRIVATE_ACCESS_KEY) === PRIVATE_ACCESS_TOKEN;
    } catch (e) {
      return false;
    }
  }

  // Make access state observable to other scripts
  processPrivateAccessParam();
  window.PortfolioPrivateAccess = {
    enabled: hasPrivateAccess(),
    key: PRIVATE_ACCESS_KEY,
    token: PRIVATE_ACCESS_TOKEN
  };

  /**
   * Load a JSON file
   */
  async function loadJSON(filename) {
    try {
      const response = await fetch(`${DATA_BASE_PATH}/${filename}?v=${DATA_VERSION}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error);
      return null;
    }
  }

  /**
   * Load a private JSON file. Skipped silently when access is not granted —
   * no network request is made and no error is logged.
   */
  async function loadPrivateJSON(filename) {
    if (!hasPrivateAccess()) return null;
    try {
      const response = await fetch(`${DATA_BASE_PATH}/private/${filename}?v=${DATA_VERSION}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  try {
    // Load all data files in parallel
    const [projects, career, expertise, testimonials, manager, coverLetter, education, profile, compensation] = await Promise.all([
      loadJSON('projects.json'),
      loadJSON('career.json'),
      loadJSON('expertise.json'),
      loadJSON('testimonials.json'),
      loadJSON('manager.json'),
      loadJSON('cover-letter.json'),
      loadJSON('education.json'),
      loadJSON('profile.json'),
      loadPrivateJSON('compensation.json')
    ]);

    // Set global portfolio data
    window.PortfolioData = {
      projects,
      career,
      expertise,
      testimonials,
      manager,
      coverLetter,
      education,
      profile,
      compensation
    };

    console.log('✓ Portfolio data loaded successfully from JSON files');

    // Dispatch ready event for components that need to wait
    window.dispatchEvent(new CustomEvent('portfolioDataReady', {
      detail: window.PortfolioData
    }));
  } catch (error) {
    console.error('Failed to initialize portfolio data:', error);
    // Set empty object to prevent undefined errors
    window.PortfolioData = {
      projects: null,
      career: null,
      expertise: null,
      testimonials: null,
      manager: null,
      coverLetter: null,
      education: null,
      profile: null,
      compensation: null
    };

    // Dispatch the ready event on this path too. Consumers gate their
    // startup on this event; staying silent here leaves them waiting
    // forever and rendering a blank page with no error shown.
    window.dispatchEvent(new CustomEvent('portfolioDataReady', {
      detail: window.PortfolioData
    }));
  }
})();
