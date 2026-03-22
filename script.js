// Language Management
let currentLang = localStorage.getItem('quantum_lang') || 'ru';
const translations = {};

async function loadLanguage(lang) {
    try {
        const response = await fetch(`/lang/${lang}.json`);
        const data = await response.json();
        translations[lang] = data;
        return data;
    } catch (error) {
        console.error('Error loading language:', error);
        return null;
    }
}

function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = key.split('.').reduce((obj, k) => obj?.[k], t);
        if (value !== undefined) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.hasAttribute('data-i18n-placeholder')) {
                    el.placeholder = value;
                }
            } else {
                el.innerHTML = value;
            }
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const value = key.split('.').reduce((obj, k) => obj?.[k], t);
        if (value !== undefined) el.placeholder = value;
    });
    
    document.documentElement.lang = lang === 'ru' ? 'ru' : 'en';
    document.querySelectorAll('.lang-switch').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    localStorage.setItem('quantum_lang', lang);
    currentLang = lang;
}

async function initLanguage() {
    await loadLanguage('ru');
    await loadLanguage('en');
    await applyTranslations(currentLang);
    
    document.querySelectorAll('.lang-switch').forEach(btn => {
        btn.addEventListener('click', async () => {
            const newLang = btn.getAttribute('data-lang');
            if (newLang && newLang !== currentLang) await applyTranslations(newLang);
        });
    });
}

// Mobile Menu
const mobileBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileBtn.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileBtn.classList.remove('active');
        }
    });
}

// Dropdown Menu
const dropdownBtn = document.getElementById('servicesDropdownBtn');
const dropdownMenu = document.getElementById('servicesDropdown');
if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
        dropdownBtn.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
            dropdownBtn.classList.remove('active');
        }
    });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-link, .dropdown-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu?.classList.remove('active');
        mobileBtn?.classList.remove('active');
    });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === "#" || targetId === "") return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            const offsetTop = targetElement.offsetTop - 80;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    });
});

// Contact Form
const contactForm = document.getElementById('contactForm');
const formResponse = document.getElementById('formResponse');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name')?.value.trim(),
            email: document.getElementById('email')?.value.trim(),
            company: document.getElementById('company')?.value.trim(),
            message: document.getElementById('message')?.value.trim(),
            lang: currentLang
        };
        
        if (!formData.name || !formData.email || !formData.message) {
            const msg = currentLang === 'ru' ? 'Пожалуйста, заполните все обязательные поля' : 'Please fill in all required fields';
            if (formResponse) { formResponse.innerHTML = msg; formResponse.className = 'form-response error'; }
            return;
        }
        
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            const msg = currentLang === 'ru' ? 'Введите корректный email адрес' : 'Please enter a valid email address';
            if (formResponse) { formResponse.innerHTML = msg; formResponse.className = 'form-response error'; }
            return;
        }
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = currentLang === 'ru' ? 'Отправка...' : 'Sending...';
        
        try {
            const response = await fetch('/api/mail.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                const msg = currentLang === 'ru' ? '✅ Заявка успешно отправлена! Мы свяжемся с вами.' : '✅ Application sent successfully! We will contact you.';
                if (formResponse) { formResponse.innerHTML = msg; formResponse.className = 'form-response success'; }
                contactForm.reset();
                setTimeout(() => { if (formResponse) formResponse.innerHTML = ''; }, 5000);
            } else {
                const msg = currentLang === 'ru' ? '❌ Ошибка отправки. Попробуйте позже.' : '❌ Submission error. Please try again later.';
                if (formResponse) { formResponse.innerHTML = msg; formResponse.className = 'form-response error'; }
            }
        } catch (error) {
            const msg = currentLang === 'ru' ? '❌ Ошибка соединения. Попробуйте позже.' : '❌ Connection error. Please try again later.';
            if (formResponse) { formResponse.innerHTML = msg; formResponse.className = 'form-response error'; }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Header scroll effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (header) {
        header.style.background = window.scrollY > 100 ? 'rgba(10, 10, 26, 0.98)' : 'rgba(10, 10, 26, 0.95)';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => { initLanguage(); });