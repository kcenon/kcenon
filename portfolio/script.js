// Theme Toggle
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

// Intersection Observer for scroll animations
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

// Observe elements for animation
document.querySelectorAll('.highlight-card, .expertise-category, .project-card, .timeline-item').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
});

// Add CSS for scroll animations
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

// Typing effect for code window (optional enhancement)
function typeCode() {
    const codeElement = document.querySelector('.code-content code');
    if (!codeElement) return;

    const originalHTML = codeElement.innerHTML;
    const text = codeElement.textContent;

    // Skip typing effect if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    codeElement.innerHTML = '';
    codeElement.style.visibility = 'visible';

    let i = 0;
    const speed = 20;

    function type() {
        if (i < text.length) {
            codeElement.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            // Restore syntax highlighting after typing is complete
            codeElement.innerHTML = originalHTML;
        }
    }

    // Start typing after a short delay
    setTimeout(type, 500);
}

// Initialize typing effect when page loads
// Uncomment the line below to enable typing effect
// window.addEventListener('load', typeCode);

// Project Card Accordion
document.querySelectorAll('.project-card.expandable .expand-btn').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.project-card');
        const isExpanded = card.classList.contains('expanded');

        // Toggle expanded state
        card.classList.toggle('expanded');
        this.setAttribute('aria-expanded', !isExpanded);

        // Update button text
        const buttonText = this.querySelector('span');
        if (buttonText) {
            buttonText.textContent = isExpanded ? '상세 보기' : '접기';
        }
    });
});

// Console easter egg
console.log('%c안녕하세요! 신동철입니다.', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
console.log('%c의료 소프트웨어와 고성능 시스템에 관심이 있으시다면 연락주세요!', 'font-size: 14px; color: #64748b;');
console.log('%ckcenon@gmail.com', 'font-size: 14px; color: #3b82f6;');
