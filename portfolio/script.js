// =============================================
// Data Loading and Rendering
// =============================================

// Initialize portfolio using inline data (no server required)
function initializePortfolio() {
    const components = window.PortfolioComponents;
    if (!components) {
        console.warn('PortfolioComponents not found. Make sure components/components.js is loaded.');
        return;
    }
    const { renderProjects, renderTestimonials, renderCareer, renderExpertise, renderLifecycleDetails, renderManager } = components;

    // Get data from inline JavaScript (data/data.js)
    const data = window.PortfolioData;

    if (!data) {
        console.error('Portfolio data not found. Make sure data/data.js is loaded.');
        return;
    }

    // Render sections using inline data
    if (data.projects) {
        const projectsContainer = document.getElementById('projects-container');
        if (projectsContainer) renderProjects(data.projects, projectsContainer);
    }

    if (data.career) {
        const careerContainer = document.getElementById('career-container');
        if (careerContainer) renderCareer(data.career, careerContainer);
    }

    if (data.testimonials) {
        const testimonialsContainer = document.getElementById('testimonials-container');
        if (testimonialsContainer) renderTestimonials(data.testimonials, testimonialsContainer);
    }

    if (data.expertise) {
        const expertiseContainer = document.getElementById('expertise-container');
        if (expertiseContainer) renderExpertise(data.expertise, expertiseContainer);

        const lifecycleDetails = document.getElementById('lifecycle-details');
        if (lifecycleDetails) renderLifecycleDetails(data.expertise, lifecycleDetails);
    }

    // Render manager/leadership section
    if (data.manager) {
        const managerContainer = document.getElementById('manager-container');
        if (managerContainer) renderManager(data.manager, managerContainer);
    }

    // Initialize expand buttons after rendering
    initializeExpandButtons();

    // Initialize scroll animations after content is loaded
    initializeScrollAnimations();
}

// Initialize expand buttons for dynamically created cards
function initializeExpandButtons() {
    document.querySelectorAll('.project-card.expandable .expand-btn').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.project-card');
            const isExpanded = card.classList.contains('expanded');

            card.classList.toggle('expanded');
            this.setAttribute('aria-expanded', !isExpanded);

            const buttonText = this.querySelector('span');
            if (buttonText) {
                const lang = window.getLanguage ? window.getLanguage() : 'ko';
                const expandText = window.translations?.[lang]?.['expand'] || '상세 보기';
                const collapseText = window.translations?.[lang]?.['collapse'] || '접기';
                buttonText.textContent = isExpanded ? expandText : collapseText;
            }
        });
    });
}

// Initialize scroll animations for dynamically created elements
function initializeScrollAnimations() {
    if (typeof IntersectionObserver === 'undefined') return;
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.highlight-card, .expertise-category, .project-card, .timeline-item, .testimonial-card, .lifecycle-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// NOTE: Portfolio initialization is triggered from setLanguage() so the first render
// uses the correct language (prevents a KO->EN flash when localStorage is 'en').

// =============================================
// Language System
// =============================================

const templateVars = {
    year: String(new Date().getFullYear())
};

function interpolateTemplate(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, (_, key) => (templateVars[key] ?? `{${key}}`));
}

const translations = {
    ko: {
        // Meta
        'meta.title': '신동철 | Software Architect · Distributed Systems',
        'meta.description': '분산 시스템·플랫폼 엔지니어링 소프트웨어 아키텍트 신동철의 포트폴리오. 마이크로서비스, 메시징, CI/CD, 관측성, 고성능 C++/C#/.NET 및 규제(IEC 62304/ISO 13485) 딜리버리 경험.',
        'meta.locale': 'ko_KR',
        // Navigation
        'nav.about': '소개',
        'nav.expertise': '전문성',
        'nav.projects': '프로젝트',
        'nav.testimonials': '추천서',
        'nav.career': '경력',
        'nav.manager': '리더십',
        'nav.contact': '연락처',
        // Manager Section
        'manager.title': '리더십 & 관리',
        'manager.desc': '2~11명 팀 리딩, 멘토링/코드리뷰 기반 팀 성장과 인증·납기·품질 성과를 함께 만든 경험',
        // Hero
        'hero.status': 'Open to Opportunities',
        'hero.name': '신동철',
        'hero.title': 'Software Architect · 분산 시스템/플랫폼 엔지니어링',
        'hero.summary': '프로덕션 환경에서 운영 가능한 <strong>분산 시스템/플랫폼</strong>을 설계·구현해 왔습니다. 마이크로서비스, 메시징(RabbitMQ), 캐시(Redis), <strong>CI/CD(무중단 배포)</strong>, <strong>관측성(OpenTelemetry)</strong>을 통해 확장성과 안정성을 만들고, 필요 시 <strong>IEC 62304/ISO 13485</strong> 같은 규제 환경에서도 요구사항→설계→테스트→문서화까지 end-to-end 딜리버리를 수행합니다.',
        'hero.metric1': '년 경력',
        'hero.metric2': '마이크로서비스',
        'hero.metric3': 'Daily Release',
        'hero.badge1': 'Microservices',
        'hero.badge2': '무중단 배포',
        'hero.badge3': '관측성 (OpenTelemetry)',
        'hero.badge4': 'IEC 62304 / ISO 13485',
        'hero.badge5': 'CE · FDA · KFDA · CCC',
        'hero.capability1.title': '분산 시스템',
        'hero.capability1.desc': '마이크로서비스·메시징·캐시·확장성 패턴',
        'hero.capability2.title': '신뢰성 & 관측성',
        'hero.capability2.desc': 'Tracing/metrics/logging, 장애 대응, SLO 기반 운영',
        'hero.capability3.title': '플랫폼 엔지니어링',
        'hero.capability3.desc': 'CI/CD, 무중단 배포, 배포 표준화/자동화',
        'hero.capability4.title': '규제 환경 딜리버리',
        'hero.capability4.desc': 'IEC 62304/ISO 13485, 추적성, V&V/심사 대응',
        // V-Model
        'vmodel.definition': '정의 & 설계',
        'vmodel.verification': '검증 & 테스트',
        'vmodel.requirements': '요구사항 분석',
        'vmodel.requirements.sub': 'Requirements',
        'vmodel.architecture': '아키텍처 설계',
        'vmodel.architecture.sub': 'Architecture',
        'vmodel.detailed': '상세 설계',
        'vmodel.detailed.sub': 'Detailed Design',
        'vmodel.unit': '단위 설계',
        'vmodel.unit.sub': 'Unit Design',
        'vmodel.implementation': '구현',
        'vmodel.implementation.sub': 'Implementation',
        'vmodel.unittest': '단위 테스트',
        'vmodel.unittest.sub': 'Unit Test',
        'vmodel.integration': '통합 테스트',
        'vmodel.integration.sub': 'Integration Test',
        'vmodel.system': '시스템 테스트',
        'vmodel.system.sub': 'System Test',
        'vmodel.acceptance': '인수 테스트 / 릴리스',
        'vmodel.acceptance.sub': 'Acceptance / Release',
        'vmodel.caption': 'IEC 62304 V-Model: 각 개발 단계와 대응하는 검증 활동의 매핑',
        // Contact
        'contact.title': 'Contact',
        'contact.intro': '분산 시스템, 플랫폼 엔지니어링, 고성능 C++/.NET, 또는 오픈소스 협업에 관심이 있으시다면 언제든 연락주세요.',
        'section.methodology': '규제 환경 딜리버리 (IEC 62304)',
        'section.methodology.desc': '요구사항↔설계↔테스트 추적성과 V&V를 갖춘 규제 환경(IEC 62304) 기반 딜리버리 프로세스',
        'expertise.desc': '분산 시스템·클라우드·고성능 엔지니어링을 기반으로, 규제 환경에서 단련된 품질/문서화 역량까지 함께 제공합니다.',
        'projects.title': 'Projects',
        'projects.desc': '프로덕션 시스템과 플랫폼 컴포넌트 중심의 주요 프로젝트',
        'testimonials.title': 'Testimonials',
        'testimonials.desc': '함께 일한 동료들의 추천서',
        'expand': '상세 보기',
        'collapse': '접기',
        'footer.copyright': '&copy; {year} 신동철. 프로덕션 시스템과 엔지니어링에 대한 열정으로 만들었습니다.'
    },
    en: {
        // Meta
        'meta.title': 'Dongcheol Shin | Software Architect · Distributed Systems',
        'meta.description': 'Portfolio of Dongcheol Shin, a software architect focused on distributed systems and platform engineering: microservices, messaging, CI/CD, observability, and high-performance C++/C#/.NET. Also experienced in regulated delivery (IEC 62304/ISO 13485).',
        'meta.locale': 'en_US',
        // Navigation
        'nav.about': 'About',
        'nav.expertise': 'Expertise',
        'nav.projects': 'Projects',
        'nav.testimonials': 'Testimonials',
        'nav.career': 'Career',
        'nav.manager': 'Leadership',
        'nav.contact': 'Contact',
        // Manager Section
        'manager.title': 'Leadership & Management',
        'manager.desc': 'Led teams of 2-11, driving team growth through mentoring/code reviews while delivering on quality, compliance, and deadlines',
        // Hero
        'hero.status': 'Open to Opportunities',
        'hero.name': 'Dongcheol Shin',
        'hero.title': 'Software Architect · Distributed Systems / Platform Engineering',
        'hero.summary': 'I design and build production-grade <strong>distributed systems/platforms</strong>: microservices, messaging (RabbitMQ), caching (Redis), <strong>CI/CD (zero-downtime releases)</strong>, and <strong>observability (OpenTelemetry)</strong>. I can also deliver end-to-end in regulated contexts such as <strong>IEC 62304 / ISO 13485</strong>—from requirements to design, testing, and documentation.',
        'hero.metric1': 'Years Experience',
        'hero.metric2': 'Microservices',
        'hero.metric3': 'Daily Release',
        'hero.badge1': 'Microservices',
        'hero.badge2': 'Zero-downtime Deploy',
        'hero.badge3': 'Observability (OpenTelemetry)',
        'hero.badge4': 'IEC 62304 / ISO 13485',
        'hero.badge5': 'CE · FDA · KFDA · CCC',
        'hero.capability1.title': 'Distributed Systems',
        'hero.capability1.desc': 'Microservices, messaging, caching, scalability patterns',
        'hero.capability2.title': 'Reliability & Observability',
        'hero.capability2.desc': 'Tracing/metrics/logging, incident response, SLO mindset',
        'hero.capability3.title': 'Platform Engineering',
        'hero.capability3.desc': 'CI/CD, zero-downtime releases, automation & tooling',
        'hero.capability4.title': 'Regulated Delivery',
        'hero.capability4.desc': 'IEC 62304/ISO 13485, traceability, V&V & audits',
        // V-Model
        'vmodel.definition': 'Definition & Design',
        'vmodel.verification': 'Verification & Test',
        'vmodel.requirements': 'Requirements Analysis',
        'vmodel.requirements.sub': 'Requirements',
        'vmodel.architecture': 'Architecture Design',
        'vmodel.architecture.sub': 'Architecture',
        'vmodel.detailed': 'Detailed Design',
        'vmodel.detailed.sub': 'Detailed Design',
        'vmodel.unit': 'Unit Design',
        'vmodel.unit.sub': 'Unit Design',
        'vmodel.implementation': 'Implementation',
        'vmodel.implementation.sub': 'Implementation',
        'vmodel.unittest': 'Unit Test',
        'vmodel.unittest.sub': 'Unit Test',
        'vmodel.integration': 'Integration Test',
        'vmodel.integration.sub': 'Integration Test',
        'vmodel.system': 'System Test',
        'vmodel.system.sub': 'System Test',
        'vmodel.acceptance': 'Acceptance / Release',
        'vmodel.acceptance.sub': 'Acceptance / Release',
        'vmodel.caption': 'IEC 62304 V-Model: Mapping development phases to verification activities',
        // Sections
        'contact.title': 'Contact',
        'contact.intro': 'If you are interested in distributed systems, platform engineering, high-performance software, or open source collaboration, please feel free to contact me.',
        'section.methodology': 'Regulated Delivery (IEC 62304)',
        'section.methodology.desc': 'Regulated delivery process based on IEC 62304 with end-to-end traceability and V&V',
        'expertise.desc': 'Distributed/cloud/high-performance engineering, plus quality and documentation discipline from regulated environments.',
        'projects.title': 'Projects',
        'projects.desc': 'Selected production systems and platform components across domains',
        'testimonials.title': 'Testimonials',
        'testimonials.desc': 'Recommendations from colleagues',
        'expand': 'View Details',
        'collapse': 'Collapse',
        'footer.copyright': '&copy; {year} Dongcheol Shin. Built with passion for production systems and engineering.'
    }
};

let currentLang = localStorage.getItem('lang') || 'ko';

function setMetaContent(selector, content) {
    const el = document.querySelector(selector);
    if (!el || !content) return;
    el.setAttribute('content', content);
}

function updateMetaForLanguage(lang) {
    const title = interpolateTemplate(translations?.[lang]?.['meta.title']);
    const description = interpolateTemplate(translations?.[lang]?.['meta.description']);
    const locale = translations?.[lang]?.['meta.locale'];

    if (title) {
        document.title = title;
        setMetaContent('meta[property="og:title"]', title);
        setMetaContent('meta[name="twitter:title"]', title);
    }
    if (description) {
        setMetaContent('meta[name="description"]', description);
        setMetaContent('meta[property="og:description"]', description);
        setMetaContent('meta[name="twitter:description"]', description);
    }
    if (locale) {
        setMetaContent('meta[property="og:locale"]', locale);
    }
}

function reorderStaticSections() {
    const lifecycle = document.getElementById('lifecycle');
    if (!lifecycle) return;

    // Place the regulated delivery section after Leadership and before Testimonials
    const testimonials = document.getElementById('testimonials');
    if (testimonials?.parentNode) {
        testimonials.parentNode.insertBefore(lifecycle, testimonials);
        return;
    }

    const manager = document.getElementById('manager');
    manager?.after?.(lifecycle);
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang === 'ko' ? 'ko' : 'en');

    // Update toggle button text
    const langToggle = document.querySelector('.lang-toggle .lang-text');
    if (langToggle) {
        langToggle.textContent = lang === 'ko' ? 'EN' : 'KO';
    }

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = interpolateTemplate(translations[lang][key]);
        }
    });

    // Update SVG text elements with svg-i18n class
    document.querySelectorAll('.svg-i18n').forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    updateMetaForLanguage(lang);
    reorderStaticSections();

    // Re-render dynamic content
    if (window.PortfolioData && window.PortfolioComponents) {
        window.currentLanguage = lang;
        initializePortfolio();
    }
}

function getLanguage() {
    return currentLang;
}

// Initialize language and wait for data
document.addEventListener('DOMContentLoaded', () => {
    // Initialize when portfolio data is ready
    function initWhenReady() {
        if (window.PortfolioData && window.PortfolioData.projects) {
            // Data is already loaded
            setLanguage(currentLang);
        } else {
            // Wait for data to load
            window.addEventListener('portfolioDataReady', () => {
                setLanguage(currentLang);
            }, { once: true });
        }
    }

    initWhenReady();

    // Language toggle event
    const langToggle = document.querySelector('.lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const newLang = currentLang === 'ko' ? 'en' : 'ko';
            setLanguage(newLang);
        });
    }
});

// Export for use in components
window.getLanguage = getLanguage;
window.translations = translations;

// =============================================
// Theme Toggle
// =============================================

const themeToggle = document.querySelector('.theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function getTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return prefersDark.matches ? 'dark' : 'light';
}

// Initialize theme
setTheme(getTheme());

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
}

// Listen for system theme changes
prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

// =============================================
// Navigation
// =============================================

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinksContainer) {
    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        navLinksContainer.classList.toggle('open');
    });

    // Close mobile menu when clicking a link
    navLinksContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            navLinksContainer.classList.remove('open');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuToggle.contains(e.target) && !navLinksContainer.contains(e.target)) {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            navLinksContainer.classList.remove('open');
        }
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navEl = document.querySelector('.nav');
            const navHeight = navEl ? navEl.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navigation active state on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Navigation background on scroll
const nav = document.querySelector('.nav');

function updateNavBackground() {
    if (!nav) return;
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

if (nav) {
    window.addEventListener('scroll', updateNavBackground);
}

// =============================================
// Scroll Animations CSS
// =============================================

const style = document.createElement('style');
style.textContent = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .animate-on-scroll.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .nav-links a.active {
        color: var(--accent);
    }

    .nav.scrolled {
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }

    [data-theme="dark"] .nav.scrolled {
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
    }
`;
document.head.appendChild(style);

// =============================================
// Back to Top Button
// =============================================

const backToTopButton = document.querySelector('.back-to-top');

function updateBackToTop() {
    if (window.scrollY > 500) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
}

if (backToTopButton) {
    window.addEventListener('scroll', updateBackToTop);

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =============================================
// PDF Download
// =============================================

const _loadedScripts = new Map();

function loadScriptOnce(src) {
    if (_loadedScripts.has(src)) return _loadedScripts.get(src);

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
        const p = new Promise((resolve, reject) => {
            if (existing.dataset.loaded === 'true') return resolve();
            existing.addEventListener('load', () => {
                existing.dataset.loaded = 'true';
                resolve();
            }, { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        });
        _loadedScripts.set(src, p);
        return p;
    }

    const p = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
    _loadedScripts.set(src, p);
    return p;
}

async function ensurePdfMakeLoaded() {
    if (typeof pdfMake !== 'undefined') return;
    await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js');
    await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js');
}

async function downloadResumePDF() {
    const button = document.querySelector('.pdf-download');
    if (!button) return;
    const originalText = button.querySelector('span').textContent;
    const lang = getLanguage();

    // Localized messages
    const messages = {
        ko: {
            generating: '생성 중...',
            downloaded: '다운로드 완료!',
            error: '오류 발생',
            filename: '신동철_포트폴리오.pdf',
            title: '포트폴리오',
            author: '신동철'
        },
        en: {
            generating: 'Generating...',
            downloaded: 'Downloaded!',
            error: 'Error',
            filename: 'Dongcheol_Shin_Portfolio.pdf',
            title: 'Portfolio',
            author: 'Dongcheol Shin'
        }
    };
    const msg = messages[lang] || messages.en;

    try {
        // Show loading state
        button.disabled = true;
        button.querySelector('span').textContent = msg.generating;

        // Lazy-load pdfmake only when needed (keeps initial page load lighter)
        await ensurePdfMakeLoaded();

        // Check if PDFExporter is available
        if (!window.PDFExporter) {
            throw new Error('PDF Exporter not loaded');
        }

        // Get portfolio data
        const data = window.PortfolioData;
        if (!data) {
            throw new Error('Portfolio data not found');
        }

        // Generate PDF with current language
        await window.PDFExporter.generatePDF(data, {
            sections: ['expertise', 'projects', 'manager', 'career', 'testimonials'],
            filename: msg.filename,
            title: msg.title,
            author: msg.author,
            theme: 'professional',
            pageBreakBetweenSections: true  // Enable page breaks between sections
        });

        // Reset button
        button.querySelector('span').textContent = msg.downloaded;
        setTimeout(() => {
            button.querySelector('span').textContent = originalText;
            button.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('PDF generation failed:', error);
        button.querySelector('span').textContent = msg.error;
        setTimeout(() => {
            button.querySelector('span').textContent = originalText;
            button.disabled = false;
        }, 2000);
    }
}

// =============================================
// Cover Letter Functionality (Admin Only)
// =============================================

/**
 * Get selected cover letter template for PDF/DOCX export
 * Called by admin page exporters
 * Returns template object based on saved template ID in localStorage
 */
window.getCoverLetterTemplate = function() {
    try {
        // Get selected template ID from localStorage (set by admin page)
        const selectedTemplateId = localStorage.getItem('cover-letter-template-id') || 'distributed-systems';

        // Load templates from window.PortfolioData
        if (window.PortfolioData && window.PortfolioData.coverLetter) {
            const data = window.PortfolioData.coverLetter;

            // Find and return the selected template
            const template = data.templates.find(t => t.id === selectedTemplateId);
            return template || data.templates[0]; // Fallback to first template
        } else {
            console.error('window.PortfolioData.coverLetter not found');
            return null;
        }
    } catch (error) {
        console.error('Failed to load cover letter template:', error);
        return null;
    }
};

// =============================================
// Console Easter Egg
// =============================================

console.log('%c안녕하세요! 신동철입니다.', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
console.log('%c의료 소프트웨어와 고성능 시스템에 관심이 있으시다면 연락주세요!', 'font-size: 14px; color: #64748b;');
console.log('%ckcenon@gmail.com', 'font-size: 14px; color: #3b82f6;');
