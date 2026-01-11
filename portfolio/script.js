// =============================================
// Data Loading and Rendering
// =============================================

// Initialize portfolio using inline data (no server required)
function initializePortfolio() {
    const { renderProjects, renderTestimonials, renderCareer, renderExpertise, renderLifecycleDetails } = window.PortfolioComponents;

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

// Initialize portfolio when DOM is ready
document.addEventListener('DOMContentLoaded', initializePortfolio);

// =============================================
// Language System
// =============================================

const translations = {
    ko: {
        // Navigation
        'nav.about': '소개',
        'nav.expertise': '전문성',
        'nav.projects': '프로젝트',
        'nav.testimonials': '추천서',
        'nav.career': '경력',
        'nav.contact': '연락처',
        // Hero
        'hero.status': 'Open to Opportunities',
        'hero.name': '신동철',
        'hero.title': 'Medical Software Architect',
        'hero.summary': '<strong>IEC 62304 생명주기 모델</strong> 기반 의료기기 소프트웨어의 전 개발 과정을 경험한 아키텍트. PACS 서버, DICOM 뷰어, 교정 시뮬레이션, 모달리티 장비 제어 시스템까지 의료 영상 분야 전반을 설계하고 구현.',
        'hero.metric1': '년 경력',
        'hero.metric2': 'IPO 성공',
        'hero.metric3': '글로벌 인증',
        'hero.capability1.title': 'Full Lifecycle',
        'hero.capability1.desc': 'IEC 62304 기반 전 개발 단계 수행',
        'hero.capability2.title': 'Regulatory Docs',
        'hero.capability2.desc': 'ISO 13485, IEC 62304 규격 문서 작성',
        'hero.capability3.title': 'Team Leadership',
        'hero.capability3.desc': '코드 리뷰와 멘토링 기반 팀 성장',
        'hero.capability4.title': 'Clinical Validation',
        'hero.capability4.desc': '임상 시험 및 검증 단계 완수',
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
        // Sections
        'contact.title': 'Contact',
        'contact.intro': '의료 소프트웨어 개발, 시스템 아키텍처 설계, 또는 오픈소스 협업에 관심이 있으시다면 언제든 연락주세요.',
        'section.methodology': 'Development Methodology',
        'section.methodology.desc': 'IEC 62304 생명주기 모델 기반의 체계적인 의료기기 소프트웨어 개발',
        'projects.title': 'Projects',
        'projects.desc': '20년간 참여한 주요 프로젝트들',
        'testimonials.title': 'Testimonials',
        'testimonials.desc': '함께 일한 동료들의 추천서',
        'expand': '상세 보기',
        'collapse': '접기',
        'footer.copyright': '&copy; 2025 신동철. 의료 소프트웨어에 대한 열정으로 만들었습니다.'
    },
    en: {
        // Navigation
        'nav.about': 'About',
        'nav.expertise': 'Expertise',
        'nav.projects': 'Projects',
        'nav.testimonials': 'Testimonials',
        'nav.career': 'Career',
        'nav.contact': 'Contact',
        // Hero
        'hero.status': 'Open to Opportunities',
        'hero.name': 'Dongcheol Shin',
        'hero.title': 'Medical Software Architect',
        'hero.summary': 'Architect with full lifecycle experience in medical device software based on <strong>IEC 62304 lifecycle model</strong>. Designed and implemented PACS servers, DICOM viewers, orthodontic simulations, and modality equipment control systems across the medical imaging domain.',
        'hero.metric1': 'Years Experience',
        'hero.metric2': 'IPO Success',
        'hero.metric3': 'Global Certs',
        'hero.capability1.title': 'Full Lifecycle',
        'hero.capability1.desc': 'Complete IEC 62304 development phases',
        'hero.capability2.title': 'Regulatory Docs',
        'hero.capability2.desc': 'ISO 13485, IEC 62304 documentation',
        'hero.capability3.title': 'Team Leadership',
        'hero.capability3.desc': 'Team growth through code review & mentoring',
        'hero.capability4.title': 'Clinical Validation',
        'hero.capability4.desc': 'Clinical trials & validation completion',
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
        'contact.intro': 'If you are interested in medical software development, system architecture design, or open source collaboration, please feel free to contact me.',
        'section.methodology': 'Development Methodology',
        'section.methodology.desc': 'Systematic medical device software development based on IEC 62304 lifecycle model',
        'projects.title': 'Projects',
        'projects.desc': 'Key projects over 20 years of experience',
        'testimonials.title': 'Testimonials',
        'testimonials.desc': 'Recommendations from colleagues',
        'expand': 'View Details',
        'collapse': 'Collapse',
        'footer.copyright': '&copy; 2025 Dongcheol Shin. Built with passion for medical software.'
    }
};

let currentLang = localStorage.getItem('lang') || 'ko';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);

    // Update toggle button text
    const langToggle = document.querySelector('.lang-toggle .lang-text');
    if (langToggle) {
        langToggle.textContent = lang === 'ko' ? 'EN' : 'KO';
    }

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Update SVG text elements with svg-i18n class
    document.querySelectorAll('.svg-i18n').forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Re-render dynamic content
    if (window.PortfolioData && window.PortfolioComponents) {
        window.currentLanguage = lang;
        initializePortfolio();
    }
}

function getLanguage() {
    return currentLang;
}

// Initialize language
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);

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

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

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
            const navHeight = document.querySelector('.nav').offsetHeight;
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
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', updateNavBackground);

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

async function downloadResumePDF() {
    const button = document.querySelector('.pdf-download');
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
            sections: ['expertise', 'projects', 'career', 'testimonials'],
            filename: msg.filename,
            title: msg.title,
            author: msg.author,
            theme: 'professional'
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
// Console Easter Egg
// =============================================

console.log('%c안녕하세요! 신동철입니다.', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
console.log('%c의료 소프트웨어와 고성능 시스템에 관심이 있으시다면 연락주세요!', 'font-size: 14px; color: #64748b;');
console.log('%ckcenon@gmail.com', 'font-size: 14px; color: #3b82f6;');
