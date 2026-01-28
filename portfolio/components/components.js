/**
 * Portfolio Components - Dynamic Rendering Functions
 * Renders portfolio sections from JSON data
 *
 * Dependencies: utils/i18n.js (getLang, getText, getArray, calculateDuration, t)
 */

// Use shared utilities from utils/i18n.js (access via window to avoid redeclaration)
const _getLang = () => window.getLang?.() || window.i18nUtils?.getLang?.() || 'ko';
const _getText = (obj) => window.getText?.(obj) ?? window.i18nUtils?.getText?.(obj) ?? (typeof obj === 'string' ? obj : obj?.ko || obj?.en || '');
const _getArray = (obj) => window.getArray?.(obj) ?? window.i18nUtils?.getArray?.(obj) ?? (Array.isArray(obj) ? obj : obj?.ko || obj?.en || []);
const _t = (key) => window.i18nUtils?.t?.(key) ?? window.translations?.[_getLang()]?.[key] ?? key;

// Icon SVG definitions - Consolidated for all sections
const Icons = {
    // Project icons
    hospital: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>`,
    microscope: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>`,
    clipboard: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
    zap: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    tool: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    github: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
    chevronDown: `<svg class="expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    // Common icons
    checkCircle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    fileText: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    users: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    checkSquare: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    search: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    alertTriangle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    refreshCw: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
    flask: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v5l4 9H5l4-9V3z"/><path d="M3 21h18"/></svg>`,
    // Manager/Leadership section icons
    handshake: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>`,
    calendarCheck: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>`,
    shield: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    trendingUp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    messageCircle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    compass: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
    bookOpen: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    unlock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`
};

// Icon key mapping for data compatibility (maps data icon names to Icons keys)
const IconKeyMap = {
    'calendar-check': 'calendarCheck',
    'trending-up': 'trendingUp',
    'message-circle': 'messageCircle',
    'book-open': 'bookOpen',
    'check-circle': 'checkCircle',
    'alert-triangle': 'alertTriangle',
    'refresh-cw': 'refreshCw',
    'file-text': 'fileText',
    'check-square': 'checkSquare'
};

const ProjectIconMap = {
    hospital: Icons.hospital,
    microscope: Icons.microscope,
    clipboard: Icons.clipboard,
    zap: Icons.zap,
    tool: Icons.tool
};

// Use shared calculateDuration from utils/i18n.js
const _calculateDuration = (period) => window.calculateDuration?.(period) ?? window.i18nUtils?.calculateDuration?.(period) ?? null;

// Render period with duration
function renderPeriodWithDuration(period) {
    const periodStr = _getText(period);
    const duration = _calculateDuration(period);
    if (duration) {
        return `<span class="project-period">${periodStr} <span class="project-duration">(${duration})</span></span>`;
    }
    return `<span class="project-period">${periodStr}</span>`;
}

// Render role badges
function renderRoleBadges(roles) {
    const roleLabels = {
        'architect': 'Architect',
        'lead': 'Lead',
        'core-dev': 'Core Dev',
        'qa-doc': 'QA Doc'
    };
    return roles.map(role =>
        `<span class="role-badge ${role}">${roleLabels[role] || role}</span>`
    ).join('');
}

// Render tags
function renderTags(tags) {
    return tags.map(tag => `<span class="tag">${tag}</span>`).join('');
}

// Render metrics
function renderMetrics(metrics) {
    if (!metrics || metrics.length === 0) return '';
    return `
        <div class="project-metrics">
            ${metrics.map(m => `
                <div class="metric">
                    <span class="metric-value">${_getText(m.value)}</span>
                    <span class="metric-label">${_getText(m.label)}</span>
                    ${m.change ? `<span class="metric-change ${m.positive ? 'positive' : ''}">${_getText(m.change)}</span>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Render certifications
function renderCertifications(certs) {
    if (!certs || certs.length === 0) return '';
    const lang = _getLang();
    const label = lang === 'ko' ? '인증' : 'Certifications';
    return `
        <div class="expanded-section">
            <h4>${label}</h4>
            <div class="cert-badges">
                ${certs.map(cert => `<span class="cert-badge">${cert}</span>`).join('')}
            </div>
        </div>
    `;
}

// Render expanded section list
function renderExpandedList(title, items) {
    if (!items || items.length === 0) return '';
    return `
        <div class="expanded-section">
            <h4>${title}</h4>
            <ul>
                ${items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Render a featured project card
function renderFeaturedProject(project) {
    const iconSvg = ProjectIconMap[project.icon] || Icons.hospital;
    const lang = _getLang();
    const labels = lang === 'ko'
        ? { roles: '담당 역할', challenges: '기술적 도전', solutions: '해결 방법', achievements: '성과' }
        : { roles: 'Roles', challenges: 'Challenges', solutions: 'Solutions', achievements: 'Achievements' };

    return `
        <article class="project-card featured expandable" id="project-${project.id}">
            <div class="project-header">
                <div class="project-icon">${iconSvg}</div>
                <div class="project-meta">
                    <span class="project-badge">Featured</span>
                    <span class="project-company">${_getText(project.company)}</span>
                </div>
            </div>
            <h3 class="project-title">${_getText(project.title)}</h3>
            ${renderPeriodWithDuration(project.period)}
            <div class="role-badges">${renderRoleBadges(project.roles)}</div>
            <p class="project-description">${_getText(project.description)}</p>
            ${renderMetrics(project.metrics)}
            <div class="project-tags">${renderTags(project.tags)}</div>
            <button class="expand-btn" aria-expanded="false">
                <span>${t('expand')}</span>
                ${Icons.chevronDown}
            </button>
            <div class="project-expanded">
                ${renderExpandedList(labels.roles, _getArray(project.expanded?.roles))}
                ${renderExpandedList(labels.challenges, _getArray(project.expanded?.challenges))}
                ${renderExpandedList(labels.solutions, _getArray(project.expanded?.solutions))}
                ${renderExpandedList(labels.achievements, _getArray(project.expanded?.achievements))}
                ${renderCertifications(project.expanded?.certifications)}
            </div>
        </article>
    `;
}

// Render a regular project card
function renderProjectCard(project) {
    const lang = _getLang();
    const labels = lang === 'ko'
        ? { roles: '담당 역할', challenges: '기술적 도전', solutions: '해결 방법' }
        : { roles: 'Roles', challenges: 'Challenges', solutions: 'Solutions' };

    return `
        <article class="project-card expandable" id="project-${project.id}">
            <div class="project-header">
                <span class="project-company-small">${_getText(project.company)}</span>
            </div>
            <h3 class="project-title">${_getText(project.title)}</h3>
            ${renderPeriodWithDuration(project.period)}
            <div class="role-badges">${renderRoleBadges(project.roles)}</div>
            <p class="project-description">${_getText(project.description)}</p>
            ${renderMetrics(project.metrics)}
            <div class="project-tags">${renderTags(project.tags)}</div>
            <button class="expand-btn" aria-expanded="false">
                <span>${t('expand')}</span>
                <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="project-expanded">
                ${renderExpandedList(labels.roles, _getArray(project.expanded?.roles))}
                ${renderExpandedList(labels.challenges, _getArray(project.expanded?.challenges))}
                ${renderExpandedList(labels.solutions, _getArray(project.expanded?.solutions))}
                ${renderCertifications(project.expanded?.certifications)}
            </div>
        </article>
    `;
}

// Render an open source project card
function renderOpenSourceCard(project) {
    const lang = _getLang();
    const labels = lang === 'ko'
        ? { features: '주요 기능', performance: '성능 특징', viewOnGithub: 'GitHub에서 보기' }
        : { features: 'Key Features', performance: 'Performance', viewOnGithub: 'View on GitHub' };

    return `
        <article class="project-card opensource expandable" id="project-${project.id}">
            <div class="project-header">
                <span class="project-company-small">Open Source</span>
                <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="github-link" title="${labels.viewOnGithub}">
                    ${Icons.github}
                </a>
            </div>
            <h3 class="project-title">${_getText(project.title)}</h3>
            ${project.period ? `<span class="project-period">${_getText(project.period)}</span>` : ''}
            ${project.stars ? `<div class="project-stats"><span class="star-count">${project.stars} stars</span></div>` : ''}
            <p class="project-description">${_getText(project.description)}</p>
            <div class="project-tags">${renderTags(project.tags)}</div>
            <button class="expand-btn" aria-expanded="false">
                <span>${t('expand')}</span>
                <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="project-expanded">
                ${renderExpandedList(labels.features, _getArray(project.expanded?.features))}
                ${renderExpandedList(labels.performance, _getArray(project.expanded?.performance))}
            </div>
        </article>
    `;
}

// Render all projects with filter tabs
function renderProjects(data, container) {
    const lang = _getLang();
    let html = `
        <h2 class="section-title">${t('projects.title')}</h2>
        <p class="section-description">${t('projects.desc')}</p>

        <!-- Filter Tabs -->
        <div class="project-filters">
            <button class="filter-tab active" data-filter="all">All</button>
            <button class="filter-tab" data-filter="featured">Featured</button>
            <button class="filter-tab" data-filter="enterprise">Enterprise</button>
            <button class="filter-tab" data-filter="opensource">Open Source</button>
            <button class="filter-tab" data-filter="medical">Medical/Regulated</button>
            <button class="filter-tab" data-filter="orthodontic">Orthodontic</button>
            <button class="filter-tab" data-filter="equipment">Equipment</button>
        </div>

        <!-- Featured Projects -->
        <div class="project-category" data-category="featured">
            <div class="projects-featured">
                ${data.featured.map(renderFeaturedProject).join('')}
            </div>
        </div>

        <!-- Enterprise Systems -->
        <div class="project-category" data-category="enterprise">
            <h3 class="projects-subtitle">Distributed & Enterprise Systems</h3>
            <div class="projects-grid">
                ${data.enterprise.map(renderProjectCard).join('')}
            </div>
        </div>

        <!-- Open Source Projects -->
        <div class="project-category" data-category="opensource">
            <h3 class="projects-subtitle">Platform Components (Open Source)</h3>
            <p class="opensource-description">
                ${lang === 'ko'
                    ? '네트워크/스레딩/메시징/로깅 등 프로덕션 시스템에 필요한 인프라 컴포넌트를 Modern C++20으로 설계·구현한 오픈소스들.'
                    : 'Open-source infrastructure components for production systems (networking, threading, messaging, logging), designed and built in Modern C++20.'}
            </p>
            <div class="projects-grid">
                ${data.openSource.map(renderOpenSourceCard).join('')}
            </div>
            <div class="opensource-cta">
                <a href="https://github.com/kcenon" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                    ${Icons.github}
                    ${lang === 'ko' ? '전체 37개 프로젝트 보기' : 'View all 37 projects'}
                </a>
            </div>
        </div>

        <!-- Medical Imaging Platform -->
        <div class="project-category" data-category="medical">
            <h3 class="projects-subtitle">Medical & Regulated Systems</h3>
            <div class="projects-grid">
                ${data.medicalImaging.map(renderProjectCard).join('')}
            </div>
        </div>

        <!-- Orthodontic Simulation -->
        <div class="project-category" data-category="orthodontic">
            <h3 class="projects-subtitle">Orthodontic Simulation (교정 시뮬레이션)</h3>
            <div class="projects-grid">
                ${data.orthodontic.map(renderProjectCard).join('')}
            </div>
        </div>

        <!-- Equipment Control & 3D -->
        <div class="project-category" data-category="equipment">
            <h3 class="projects-subtitle">Equipment Control & 3D Printing</h3>
            <div class="projects-grid">
                ${data.equipmentControl.map(renderProjectCard).join('')}
            </div>
        </div>
    `;
    container.innerHTML = html;

    // Initialize filter tabs
    initializeProjectFilters(container);
}

// Initialize project filter tabs
function initializeProjectFilters(container) {
    const filterTabs = container.querySelectorAll('.filter-tab');
    const categories = container.querySelectorAll('.project-category');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;

            // Update active tab
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show/hide categories
            if (filter === 'all') {
                categories.forEach(cat => cat.classList.remove('hidden'));
            } else {
                categories.forEach(cat => {
                    if (cat.dataset.category === filter) {
                        cat.classList.remove('hidden');
                    } else {
                        cat.classList.add('hidden');
                    }
                });
            }
        });
    });
}

// Render testimonials
function renderTestimonials(data, container) {
    const renderLabels = (labels) => {
        if (!labels) return '';
        const arr = _getArray(labels);
        return arr.map(l =>
            `<span class="testimonial-label ${l.type}">${_getText(l.text)}</span>`
        ).join('');
    };

    let html = `
        <h2 class="section-title">${t('testimonials.title')}</h2>
        <p class="section-description">${t('testimonials.desc')}</p>

        <!-- Leadership Highlight -->
        <div class="testimonial-highlight">
            <blockquote class="testimonial-featured">
                <p class="testimonial-quote">"${_getText(data.featured.quote)}"</p>
                <div class="testimonial-labels">${renderLabels(data.featured.labels)}</div>
                <footer class="testimonial-author">
                    <span class="author-name">${_getText(data.featured.author)}</span>
                    <span class="author-role">${_getText(data.featured.role)}</span>
                    <span class="author-relation">${_getText(data.featured.relation)}</span>
                </footer>
            </blockquote>
        </div>

        <div class="testimonials-grid">
            ${data.testimonials.map(item => `
                <div class="testimonial-card">
                    <div class="testimonial-meta">
                        <span class="testimonial-date">${item.date}</span>
                        <span class="testimonial-context">${_getText(item.context)}</span>
                    </div>
                    <p class="testimonial-text">"${_getText(item.text)}"</p>
                    <div class="testimonial-labels">${renderLabels(item.labels)}</div>
                    <footer class="testimonial-author">
                        <span class="author-name">${_getText(item.author)}</span>
                        <span class="author-role">${_getText(item.role)}</span>
                        <span class="author-relation">${_getText(item.relation)}</span>
                    </footer>
                </div>
            `).join('')}
        </div>
    `;
    container.innerHTML = html;
}

// Render career timeline
function renderCareer(data, container) {
    const lang = _getLang();
    const labels = lang === 'ko'
        ? {
            responsibilities: '담당 업무',
            companyScale: '회사 규모',
            teamScale: '팀 규모',
            leaveReason: '퇴사 사유',
            relatedProjects: '관련 프로젝트'
          }
        : {
            responsibilities: 'Responsibilities',
            companyScale: 'Company Size',
            teamScale: 'Team Size',
            leaveReason: 'Reason for Leaving',
            relatedProjects: 'Related Projects'
          };

    // Helper to find project title by ID
    const getProjectTitle = (projectId) => {
        const projectData = window.PortfolioData?.projects;
        if (!projectData) return projectId;

        // Search in all project categories
        const allProjects = [
            ...(projectData.featured || []),
            ...(projectData.medicalImaging || []),
            ...(projectData.openSource || [])
        ];

        const project = allProjects.find(p => p.id === projectId);
        return project ? _getText(project.title) : projectId;
    };

    const renderRelatedProjects = (projectIds) => {
        if (!projectIds || projectIds.length === 0) return '';
        return `
            <div class="timeline-related-projects">
                <strong>${labels.relatedProjects}:</strong>
                <div class="project-links">
                    ${projectIds.map(id => `<a href="#project-${id}" class="project-link" data-project-id="${id}">${getProjectTitle(id)}</a>`).join('')}
                </div>
            </div>
        `;
    };

    const renderTimelinePeriod = (period) => {
        let periodStr = _getText(period);
        // Remove any existing duration from the period string
        periodStr = periodStr.replace(/\s*\([^)]*(?:개월|년|months?|yrs?|mo)[^)]*\)/gi, '').trim();
        const duration = _calculateDuration(period);
        if (duration) {
            return `${periodStr} <span class="timeline-duration">(${duration})</span>`;
        }
        return periodStr;
    };

    const renderAchievements = (achievements) => {
        if (!achievements) return '';
        const arr = _getArray(achievements);
        if (arr.length === 0) return '';
        return `
            <ul class="timeline-achievements">
                ${arr.map(a => `<li>${_getText(a)}</li>`).join('')}
            </ul>
        `;
    };

    const renderScale = (scale) => {
        if (!scale) return '';
        return `
            <div class="timeline-scale">
                ${scale.company ? `<span class="scale-item"><strong>${labels.companyScale}:</strong> ${_getText(scale.company)}</span>` : ''}
                ${scale.team ? `<span class="scale-item"><strong>${labels.teamScale}:</strong> ${_getText(scale.team)}</span>` : ''}
            </div>
        `;
    };

    let html = `
        <h2 class="section-title">Career</h2>
        <div class="timeline">
            ${data.timeline.map(item => `
                <div class="timeline-item ${item.highlight ? 'highlight' : ''}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${_getText(item.company)}</h3>
                            <span class="timeline-period">${renderTimelinePeriod(item.period)}</span>
                            ${item.badge ? `<span class="timeline-badge">${_getText(item.badge)}</span>` : ''}
                        </div>
                        <p class="timeline-role">${_getText(item.role)}</p>
                        ${item.companyDescription ? `<p class="timeline-company-desc">${_getText(item.companyDescription)}</p>` : ''}
                        ${item.description ? `<p class="timeline-description">${_getText(item.description)}</p>` : ''}
                        ${item.responsibilities ? `<p class="timeline-responsibilities"><strong>${labels.responsibilities}:</strong> ${_getText(item.responsibilities)}</p>` : ''}
                        ${renderScale(item.scale)}
                        ${renderAchievements(item.achievements)}
                        ${item.note ? `<div class="timeline-note"><p>${_getText(item.note)}</p></div>` : ''}
                        ${item.leaveReason ? `<p class="timeline-leave-reason"><strong>${labels.leaveReason}:</strong> ${_getText(item.leaveReason)}</p>` : ''}
                        ${renderRelatedProjects(item.relatedProjects)}
                        ${item.tags ? `<div class="timeline-tags">${renderTags(item.tags)}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    container.innerHTML = html;

    // Add click handlers for project links
    container.querySelectorAll('.project-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = link.dataset.projectId;
            const projectCard = document.getElementById(`project-${projectId}`);
            if (projectCard) {
                projectCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                projectCard.classList.add('highlight-flash');
                setTimeout(() => projectCard.classList.remove('highlight-flash'), 2000);
            }
        });
    });
}

// Render expertise section
function renderExpertise(data, container) {
    const iconMap = {
        'hospital': '🏥',
        'clipboard': '📋',
        'zap': '⚡',
        'tool': '🛠️',
        'file-text': '📄',
        'git-branch': '🔀',
        'cloud': '☁️',
        'shield': '🛡️'
    };

    let html = `
        <h2 class="section-title">${_t('nav.expertise')}</h2>
        <p class="section-description">${_t('expertise.desc')}</p>
        <div class="expertise-grid">
            ${data.categories.map(cat => {
                if (cat.tags) {
                    return `
                        <div class="expertise-category">
                            <h3 class="expertise-title">
                                <span class="expertise-icon">${iconMap[cat.icon] || '📌'}</span>
                                ${_getText(cat.title)}
                            </h3>
                            <div class="tech-tags">
                                ${cat.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    `;
                }
                const items = _getArray(cat.items);
                return `
                    <div class="expertise-category">
                        <h3 class="expertise-title">
                            <span class="expertise-icon">${iconMap[cat.icon] || '📌'}</span>
                            ${_getText(cat.title)}
                        </h3>
                        <ul class="expertise-list">
                            ${items.map(item => `<li>${_getText(item)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    container.innerHTML = html;
}

// Render lifecycle details
function renderLifecycleDetails(data, container) {
    const iconMap = {
        'clipboard': '📋',
        'search': '🔍',
        'alert-triangle': '⚠️',
        'refresh-cw': '🔄',
        'users': '🤝',
        'flask': '🧪'
    };

    container.innerHTML = data.lifecycleDetails.map(item => `
        <div class="lifecycle-card">
            <div class="lifecycle-icon">${iconMap[item.icon] || '📌'}</div>
            <h4>${_getText(item.title)}</h4>
            <p>${_getText(item.description)}</p>
        </div>
    `).join('');
}

// Render manager/leadership section
function renderManager(data, container) {
    const lang = _getLang();

    // Helper to get icon from consolidated Icons object
    const getIcon = (iconKey) => {
        const mappedKey = IconKeyMap[iconKey] || iconKey;
        return Icons[mappedKey] || Icons.users;
    };

    // Leadership highlight stats (quick proof points)
    const renderLeadershipHighlights = (highlights) => {
        if (!highlights || highlights.length === 0) return '';
        return `
            <div class="manager-highlights-grid">
                ${highlights.map(h => `
                    <div class="manager-highlight-card">
                        <div class="highlight-icon">${getIcon(h.icon)}</div>
                        <div class="manager-highlight-value">${_getText(h.value)}</div>
                        <div class="manager-highlight-label">${_getText(h.label)}</div>
                        <div class="manager-highlight-description">${_getText(h.description)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    };

    // Render PM Capabilities
    const renderCapabilities = (capabilities) => {
        const renderBadges = (items) =>
            (items || []).filter(Boolean).map(text => `<span class="metric-badge">${text}</span>`).join('');

        return capabilities.map(cap => {
            const badges = [];

            // Common metrics
            if (cap.metrics?.onTimeDelivery) {
                badges.push(`${cap.metrics.onTimeDelivery} ${lang === 'ko' ? '일정 준수' : 'On-time'}`);
            }
            if (cap.metrics?.certificationSuccess) {
                badges.push(`${lang === 'ko' ? '인증' : 'Certs'} ${cap.metrics.certificationSuccess}`);
            }
            if (cap.metrics?.majorProjects) {
                badges.push(`${cap.metrics.majorProjects}+ ${lang === 'ko' ? '프로젝트' : 'Projects'}`);
            }
            if (cap.metrics?.yearsLeading) {
                badges.push(`${cap.metrics.yearsLeading}+ ${lang === 'ko' ? '년 리딩' : 'Years Leading'}`);
            }
            if (cap.metrics?.projectsLed) {
                badges.push(`${cap.metrics.projectsLed}+ ${lang === 'ko' ? '리딩' : 'Projects Led'}`);
            }
            if (Array.isArray(cap.metrics?.teamSizes) && cap.metrics.teamSizes.length > 0) {
                const minSize = Math.min(...cap.metrics.teamSizes);
                const maxSize = Math.max(...cap.metrics.teamSizes);
                badges.push(lang === 'ko' ? `팀 ${minSize}~${maxSize}명` : `Team ${minSize}-${maxSize}`);
            }

            // Stakeholders / frameworks as proof points
            const stakeholderTypes = _getArray(cap.stakeholderTypes).slice(0, 6);
            stakeholderTypes.forEach(s => badges.push(s));
            const frameworks = (cap.frameworks || []).slice(0, 6);
            frameworks.forEach(f => badges.push(f));

            const highlights = _getArray(cap.highlights);

            return `
                <div class="manager-capability-card">
                    <div class="capability-icon">${getIcon(cap.icon)}</div>
                    <h3 class="capability-title">${_getText(cap.title)}</h3>
                    <p class="capability-description">${_getText(cap.description)}</p>
                    ${highlights && highlights.length > 0 ? `
                        <ul class="capability-highlights">
                            ${highlights.map(h => `<li>${h}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${badges.length > 0 ? `<div class="capability-metrics">${renderBadges(badges)}</div>` : ''}
                </div>
            `;
        }).join('');
    };

    // Render Leadership Style
    const renderLeadershipStyle = (style) => {
        if (!style) return '';
        const principles = _getArray(style.principles);
        return `
            <div class="leadership-style-section">
                <h3 class="subsection-title">${_getText(style.title)}</h3>
                <div class="leadership-principles">
                    ${principles.map(p => `
                        <div class="principle-item">
                            <span class="principle-icon">✓</span>
                            <span>${p}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };

    // Render Business Impact
    const renderBusinessImpact = (impact) => {
        if (!impact) return '';
        const highlights = _getArray(impact.highlights);
        const numbers = impact.keyNumbers;
        return `
            <div class="business-impact-section">
                <h3 class="subsection-title">${lang === 'ko' ? '비즈니스 임팩트' : 'Business Impact'}</h3>
                <div class="impact-numbers">
                    <div class="impact-number">
                        <span class="number">${numbers.certifications}</span>
                        <span class="label">${lang === 'ko' ? '글로벌 인증' : 'Global Certs'}</span>
                    </div>
                    <div class="impact-number">
                        <span class="number">${numbers.ipos}</span>
                        <span class="label">${lang === 'ko' ? 'IPO 기여' : 'IPO Contrib'}</span>
                    </div>
                    <div class="impact-number">
                        <span class="number">${numbers.performanceImprovement}</span>
                        <span class="label">${lang === 'ko' ? '성능 향상' : 'Performance'}</span>
                    </div>
                    <div class="impact-number">
                        <span class="number">${numbers.projectsDelivered}</span>
                        <span class="label">${lang === 'ko' ? '프로젝트 납품' : 'Projects'}</span>
                    </div>
                </div>
                <ul class="impact-highlights">
                    ${highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
            </div>
        `;
    };

    // Render Soft Skills
    const renderSoftSkills = (skills) => {
        if (!skills || skills.length === 0) return '';
        return `
            <div class="soft-skills-section">
                <h3 class="subsection-title">${lang === 'ko' ? '소프트 스킬' : 'Soft Skills'}</h3>
                <div class="soft-skills-grid">
                    ${skills.map(skill => `
                        <div class="soft-skill-item">
                            <div class="skill-icon">${getIcon(skill.icon)}</div>
                            <span class="skill-name">${_getText(skill.title)}</span>
                            <div class="skill-level">
                                ${Array(5).fill(0).map((_, i) => `<span class="level-dot ${i < skill.level ? 'filled' : ''}"></span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };

    // Render Management Projects
    const renderManagementProjects = (projects) => {
        if (!projects || projects.length === 0) return '';
        return `
            <div class="management-projects-section">
                <h3 class="subsection-title">${lang === 'ko' ? '주요 리딩 프로젝트' : 'Key Projects Led'}</h3>
                <div class="management-projects-grid">
                    ${projects.map(proj => `
                        <div class="management-project-card">
                            <div class="project-header">
                                <h4>${proj.title}</h4>
                                <span class="project-duration">${_getText(proj.duration)}</span>
                            </div>
                            ${proj.teamSize ? `<div class="project-team"><span class="team-icon">👥</span> ${lang === 'ko' ? `팀 ${proj.teamSize}명` : `Team of ${proj.teamSize}`}</div>` : ''}
                            ${proj.certifications ? `<div class="project-certs">${proj.certifications.map(c => `<span class="cert-badge-small">${c}</span>`).join('')}</div>` : ''}
                            ${proj.outcomes ? `
                                <ul class="project-outcomes">
                                    ${_getArray(proj.outcomes).map(o => `<li>${o}</li>`).join('')}
                                </ul>
                            ` : ''}
                            ${proj.onTime ? `<span class="on-time-badge">${lang === 'ko' ? '일정 준수' : 'On-time'}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };

    let html = `
        <h2 class="section-title">${t('manager.title')}</h2>
        <p class="section-description">${t('manager.desc')}</p>

        ${renderLeadershipHighlights(data.leadershipHighlights)}

        <!-- PM Capabilities Grid -->
        <div class="manager-capabilities-grid">
            ${renderCapabilities(data.pmCapabilities)}
        </div>

        <!-- Two Column Layout -->
        <div class="manager-two-column">
            <div class="manager-column">
                ${renderLeadershipStyle(data.leadershipStyle)}
                ${renderSoftSkills(data.softSkills)}
            </div>
            <div class="manager-column">
                ${renderBusinessImpact(data.businessImpact)}
            </div>
        </div>

        <!-- Management Projects -->
        ${renderManagementProjects(data.managementProjects)}
    `;

    container.innerHTML = html;
}

// Export functions
window.PortfolioComponents = {
    renderProjects,
    renderTestimonials,
    renderCareer,
    renderExpertise,
    renderLifecycleDetails,
    renderManager,
    Icons
};
