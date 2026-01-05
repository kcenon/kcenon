/**
 * Portfolio Components - Dynamic Rendering Functions
 * Renders portfolio sections from JSON data
 */

// Icon SVG definitions
const Icons = {
    hospital: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>`,
    microscope: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>`,
    clipboard: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
    zap: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    tool: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    github: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
    chevronDown: `<svg class="expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    checkCircle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    fileText: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    users: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>`,
    checkSquare: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    search: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    alertTriangle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    refreshCw: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
    flask: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v5l4 9H5l4-9V3z"/><path d="M3 21h18"/></svg>`
};

const ProjectIconMap = {
    hospital: Icons.hospital,
    microscope: Icons.microscope
};

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
                    <span class="metric-value">${m.value}</span>
                    <span class="metric-label">${m.label}</span>
                    ${m.change ? `<span class="metric-change ${m.positive ? 'positive' : ''}">${m.change}</span>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Render certifications
function renderCertifications(certs) {
    if (!certs || certs.length === 0) return '';
    return `
        <div class="expanded-section">
            <h4>인증</h4>
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
    return `
        <article class="project-card featured expandable">
            <div class="project-header">
                <div class="project-icon">${iconSvg}</div>
                <div class="project-meta">
                    <span class="project-badge">Featured</span>
                    <span class="project-company">${project.company}</span>
                </div>
            </div>
            <h3 class="project-title">${project.title}</h3>
            <span class="project-period">${project.period}</span>
            <div class="role-badges">${renderRoleBadges(project.roles)}</div>
            <p class="project-description">${project.description}</p>
            ${renderMetrics(project.metrics)}
            <div class="project-tags">${renderTags(project.tags)}</div>
            <button class="expand-btn" aria-expanded="false">
                <span>상세 보기</span>
                ${Icons.chevronDown}
            </button>
            <div class="project-expanded">
                ${renderExpandedList('담당 역할', project.expanded?.roles)}
                ${renderExpandedList('기술적 도전', project.expanded?.challenges)}
                ${renderExpandedList('해결 방법', project.expanded?.solutions)}
                ${renderExpandedList('성과', project.expanded?.achievements)}
                ${renderCertifications(project.expanded?.certifications)}
            </div>
        </article>
    `;
}

// Render a regular project card
function renderProjectCard(project) {
    return `
        <article class="project-card expandable">
            <div class="project-header">
                <span class="project-company-small">${project.company}</span>
            </div>
            <h3 class="project-title">${project.title}</h3>
            <span class="project-period">${project.period}</span>
            <div class="role-badges">${renderRoleBadges(project.roles)}</div>
            <p class="project-description">${project.description}</p>
            ${renderMetrics(project.metrics)}
            <div class="project-tags">${renderTags(project.tags)}</div>
            <button class="expand-btn" aria-expanded="false">
                <span>상세 보기</span>
                <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="project-expanded">
                ${renderExpandedList('담당 역할', project.expanded?.roles)}
                ${renderExpandedList('기술적 도전', project.expanded?.challenges)}
                ${renderExpandedList('해결 방법', project.expanded?.solutions)}
                ${renderCertifications(project.expanded?.certifications)}
            </div>
        </article>
    `;
}

// Render an open source project card
function renderOpenSourceCard(project) {
    return `
        <article class="project-card opensource expandable">
            <div class="project-header">
                <span class="project-company-small">Open Source</span>
                <a href="${project.github}" target="_blank" class="github-link" title="GitHub에서 보기">
                    ${Icons.github}
                </a>
            </div>
            <h3 class="project-title">${project.title}</h3>
            ${project.stars ? `<div class="project-stats"><span class="star-count">${project.stars} stars</span></div>` : ''}
            <p class="project-description">${project.description}</p>
            <div class="project-tags">${renderTags(project.tags)}</div>
            <button class="expand-btn" aria-expanded="false">
                <span>상세 보기</span>
                <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="project-expanded">
                ${renderExpandedList('주요 기능', project.expanded?.features)}
                ${renderExpandedList('성능 특징', project.expanded?.performance)}
            </div>
        </article>
    `;
}

// Render all projects
function renderProjects(data, container) {
    let html = `
        <h2 class="section-title">Projects</h2>
        <p class="section-description">20년간 참여한 주요 프로젝트들</p>

        <!-- Featured Projects -->
        <div class="projects-featured">
            ${data.featured.map(renderFeaturedProject).join('')}
        </div>

        <!-- Medical Imaging Platform -->
        <h3 class="projects-subtitle">Medical Imaging Platform</h3>
        <div class="projects-grid">
            ${data.medicalImaging.map(renderProjectCard).join('')}
        </div>

        <!-- Orthodontic Simulation -->
        <h3 class="projects-subtitle">Orthodontic Simulation (교정 시뮬레이션)</h3>
        <div class="projects-grid">
            ${data.orthodontic.map(renderProjectCard).join('')}
        </div>

        <!-- Equipment Control & 3D -->
        <h3 class="projects-subtitle">Equipment Control & 3D Printing</h3>
        <div class="projects-grid">
            ${data.equipmentControl.map(renderProjectCard).join('')}
        </div>

        <!-- Enterprise Systems -->
        <h3 class="projects-subtitle">Enterprise & AI Systems</h3>
        <div class="projects-grid">
            ${data.enterprise.map(renderProjectCard).join('')}
        </div>

        <!-- Open Source Projects -->
        <h3 class="projects-subtitle">Open Source Projects</h3>
        <p class="opensource-description">
            업무 경험을 바탕으로 개발한 오픈소스 프로젝트들. 모든 프로젝트는 Modern C++20 기반.
        </p>
        <div class="projects-grid">
            ${data.openSource.map(renderOpenSourceCard).join('')}
        </div>

        <div class="opensource-cta">
            <a href="https://github.com/kcenon" target="_blank" class="btn btn-secondary">
                ${Icons.github}
                전체 37개 프로젝트 보기
            </a>
        </div>
    `;
    container.innerHTML = html;
}

// Render testimonials
function renderTestimonials(data, container) {
    const renderLabels = (labels) => labels.map(l =>
        `<span class="testimonial-label ${l.type}">${l.text}</span>`
    ).join('');

    let html = `
        <h2 class="section-title">Testimonials</h2>
        <p class="section-description">함께 일한 동료들의 추천서</p>

        <!-- Leadership Highlight -->
        <div class="testimonial-highlight">
            <blockquote class="testimonial-featured">
                <p class="testimonial-quote">"${data.featured.quote}"</p>
                <footer class="testimonial-author">
                    <span class="author-name">${data.featured.author}</span>
                    <span class="author-role">${data.featured.role}</span>
                    <span class="author-relation">${data.featured.relation}</span>
                </footer>
            </blockquote>
        </div>

        <div class="testimonials-grid">
            ${data.testimonials.map(t => `
                <div class="testimonial-card">
                    <div class="testimonial-meta">
                        <span class="testimonial-date">${t.date}</span>
                        <span class="testimonial-context">${t.context}</span>
                    </div>
                    <p class="testimonial-text">"${t.text}"</p>
                    <div class="testimonial-labels">${renderLabels(t.labels)}</div>
                    <footer class="testimonial-author">
                        <span class="author-name">${t.author}</span>
                        <span class="author-role">${t.role}</span>
                        <span class="author-relation">${t.relation}</span>
                    </footer>
                </div>
            `).join('')}
        </div>
    `;
    container.innerHTML = html;
}

// Render career timeline
function renderCareer(data, container) {
    const renderAchievements = (achievements) => {
        if (!achievements) return '';
        return `
            <ul class="timeline-achievements">
                ${achievements.map(a => `<li>${a}</li>`).join('')}
            </ul>
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
                            <h3 class="timeline-title">${item.company}</h3>
                            <span class="timeline-period">${item.period}</span>
                            ${item.badge ? `<span class="timeline-badge">${item.badge}</span>` : ''}
                        </div>
                        <p class="timeline-role">${item.role}</p>
                        ${item.description ? `<p class="timeline-description">${item.description}</p>` : ''}
                        ${renderAchievements(item.achievements)}
                        ${item.note ? `<div class="timeline-note"><p>${item.note}</p></div>` : ''}
                        ${item.tags ? `<div class="timeline-tags">${renderTags(item.tags)}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    container.innerHTML = html;
}

// Render expertise section
function renderExpertise(data, container) {
    const iconMap = {
        'hospital': '🏥',
        'clipboard': '📋',
        'zap': '⚡',
        'tool': '🛠️'
    };

    let html = `
        <h2 class="section-title">Expertise</h2>
        <div class="expertise-grid">
            ${data.categories.map(cat => {
                if (cat.tags) {
                    return `
                        <div class="expertise-category">
                            <h3 class="expertise-title">
                                <span class="expertise-icon">${iconMap[cat.icon] || '📌'}</span>
                                ${cat.title}
                            </h3>
                            <div class="tech-tags">
                                ${cat.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    `;
                }
                return `
                    <div class="expertise-category">
                        <h3 class="expertise-title">
                            <span class="expertise-icon">${iconMap[cat.icon] || '📌'}</span>
                            ${cat.title}
                        </h3>
                        <ul class="expertise-list">
                            ${cat.items.map(item => `<li>${item}</li>`).join('')}
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
            <h4>${item.title}</h4>
            <p>${item.description}</p>
        </div>
    `).join('');
}

// Export functions
window.PortfolioComponents = {
    renderProjects,
    renderTestimonials,
    renderCareer,
    renderExpertise,
    renderLifecycleDetails,
    Icons
};
