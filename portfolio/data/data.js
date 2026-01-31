/**
 * Portfolio Data Loader
 * Dynamically loads data from JSON files
 */

(async function() {
  const DATA_BASE_PATH = 'data';

  /**
   * Load a JSON file
   */
  async function loadJSON(filename) {
    try {
      const response = await fetch(`${DATA_BASE_PATH}/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error);
      return null;
    }
  }

  try {
    // Load all data files in parallel
    const [projects, career, expertise, testimonials, manager, coverLetter] = await Promise.all([
      loadJSON('projects.json'),
      loadJSON('career.json'),
      loadJSON('expertise.json'),
      loadJSON('testimonials.json'),
      loadJSON('manager.json'),
      loadJSON('cover-letter.json')
    ]);

    // Set global portfolio data
    window.PortfolioData = {
      projects,
      career,
      expertise,
      testimonials,
      manager,
      coverLetter
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
      coverLetter: null
    };
  }
})();
