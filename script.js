/* ========================================
   .ISO — TIME TRAVEL AGENCY
   Основной JavaScript
   ======================================== */

(function() {
    'use strict';

    // ============================================
    // УТИЛИТЫ
    // ============================================
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const throttle = (fn, limit = 16) => {
        let inThrottle = false;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // ============================================
    // ПРОГРЕСС-БАР ПРОКРУТКИ
    // ============================================
    const progressBar = $('.scroll-progress');
    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        progressBar.style.transform = `scaleX(${clamp(progress, 0, 1)})`;
    };
    window.addEventListener('scroll', throttle(updateProgress), { passive: true });
    updateProgress();

    // ============================================
    // ИНТЕРСЕКШН ОБСЕРВЕР (REVEAL ANIMATIONS)
    // ============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    $$('.reveal').forEach(el => revealObserver.observe(el));

    // ============================================
    // БУРГЕР-МЕНЮ
    // ============================================
    const burger = $('.burger');
    const nav = $('.nav');
    const navLinks = $$('.nav-link');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            const expanded = burger.getAttribute('aria-expanded') === 'true';
            burger.setAttribute('aria-expanded', !expanded);
            nav.classList.toggle('active');
            document.body.style.overflow = expanded ? '' : 'hidden';
        });

        // Закрытие по клику на ссылку
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.setAttribute('aria-expanded', 'false');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                burger.setAttribute('aria-expanded', 'false');
                nav.classList.remove('active');
                document.body.style.overflow = '';
                burger.focus();
            }
        });
    }

    // ============================================
    // АКТИВНАЯ ССЫЛКА В НАВИГАЦИИ
    // ============================================
    const sections = $$('section[id]');
    const setActiveNav = () => {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(l => l.classList.remove('active'));
                const activeLink = $(`.nav-link[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', throttle(setActiveNav), { passive: true });
    setActiveNav();

    // ============================================
    // ТАЙПИНГ ЭФФЕКТ В ГЕРОЕ
    // ============================================
    const typingEl = $('.typing-text');
    const cursorEl = $('.cursor');

    if (typingEl) {
        const fullText = typingEl.dataset.text || '';
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 50;

        const type = () => {
            const currentText = fullText.slice(0, charIndex);
            typingEl.textContent = currentText;

            if (!isDeleting && charIndex < fullText.length) {
                charIndex++;
                typingSpeed = 50 + Math.random() * 30;
            } else if (isDeleting && charIndex > 0) {
                charIndex--;
                typingSpeed = 30;
            } else if (!isDeleting && charIndex === fullText.length) {
                isDeleting = true;
                typingSpeed = 2000; // пауза перед удалением
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                typingSpeed = 500; // пауза перед следующим циклом
            }

            setTimeout(type, typingSpeed);
        };

        // Запуск после небольшой задержки
        setTimeout(type, 1000);
    }

    // ============================================
    // МОДАЛКА ГАЛЕРЕИ
    // ============================================
    const modal = $('#galleryModal');
    const modalImg = $('#modalImage');
    const modalCaption = $('#modalCaption');
    const modalCurrent = $('#modalCurrent');
    const modalTotal = $('#modalTotal');
    const modalClose = $('.modal-close', modal);
    const modalPrev = $('.modal-prev', modal);
    const modalNext = $('.modal-next', modal);

    const galleryItems = $$('.gallery-item');
    const totalSlides = galleryItems.length;
    let currentIndex = 0;
    let lastFocused = null;

    const slideData = [
        { src: 'assets/preza12.jpg', alt: 'Титульный слайд: ПРОЕКТ .ISO', caption: '01 / ПРОЕКТ .ISO' },
        { src: 'assets/preza13.jpg', alt: 'Техническая схема машины времени', caption: '02 / СХЕМА МАШИНЫ' },
        { src: 'assets/preza14.jpg', alt: 'Концепт временных дисков', caption: '03 / ДИСКИ ЭПОХ' },
        { src: 'assets/preza15.jpg', alt: 'UI интерфейс и технические спецификации', caption: '04 / UI / СПЕКИ' },
        { src: 'assets/preza16.jpg', alt: 'Временная линия с маркерами эпох', caption: '05 / ВРЕМЕННАЯ ЛИНИЯ' },
        { src: 'assets/preza17.jpg', alt: 'Терминал INSERT DISK', caption: '06 / ТЕРМИНАЛ' },
        { src: 'assets/preza18.jpg', alt: 'Меню выбора эпохи', caption: '07 / ВЫБОР ЭПОХИ' },
        { src: 'assets/preza19.jpg', alt: 'Визуализация временного перехода', caption: '08 / ПЕРЕХОД' },
        { src: 'assets/preza20.jpg', alt: 'Параметры и настройки', caption: '09 / ПАРАМЕТРЫ' },
        { src: 'assets/preza21.jpg', alt: 'Финальный слайд', caption: '10 / ФИНАЛ' }
    ];

    const openModal = (index) => {
        currentIndex = clamp(index, 0, totalSlides - 1);
        const data = slideData[currentIndex];

        modalImg.src = data.src;
        modalImg.alt = data.alt;
        modalCaption.textContent = data.caption;
        modalCurrent.textContent = currentIndex + 1;
        modalTotal.textContent = totalSlides;

        modal.hidden = false;
        // Force reflow for animation
        modal.offsetHeight;
        document.body.style.overflow = 'hidden';

        // Save focus and trap
        lastFocused = document.activeElement;
        modalClose.focus();

        // Add event listeners
        document.addEventListener('keydown', handleKeydown);
    };

    const closeModal = () => {
        modal.hidden = true;
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeydown);
        if (lastFocused) lastFocused.focus();
    };

    const goToSlide = (index) => {
        currentIndex = clamp(index, 0, totalSlides - 1);
        const data = slideData[currentIndex];

        modalImg.style.opacity = '0';
        setTimeout(() => {
            modalImg.src = data.src;
            modalImg.alt = data.alt;
            modalCaption.textContent = data.caption;
            modalCurrent.textContent = currentIndex + 1;
            modalImg.style.opacity = '1';
        }, 150);
    };

    const handleKeydown = (e) => {
        if (e.key === 'Escape') closeModal();
        else if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
        else if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
        else if (e.key === 'Tab') trapFocus(e);
    };

    const trapFocus = (e) => {
        const focusable = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    // Event listeners for gallery
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openModal(index));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(index);
            }
        });
        // Make keyboard accessible
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Открыть слайд ${index + 1}`);
    });

    modalClose.addEventListener('click', closeModal);
    modalPrev.addEventListener('click', () => goToSlide(currentIndex - 1));
    modalNext.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // ============================================
    // ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРЕЙ
    // ============================================
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = $(href);
            if (target) {
                e.preventDefault();
                const headerHeight = $('.header').offsetHeight || 72;
                const targetPos = target.offsetTop - headerHeight;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // ПАРАЛЛАКС ДЛЯ HERO BG (ОПЦИОНАЛЬНО)
    // ============================================
    const heroBg = $('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            const hero = $('.hero');
            if (hero) {
                const heroRect = hero.getBoundingClientRect();
                if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
                    heroBg.style.transform = `translateY(${scrolled * 0.15}px)`;
                }
            }
        }), { passive: true });
    }

    // ============================================
    // LENIS-STYLE SMOOTH SCROLL (ЛЁГКИЙ ПОЛИФИЛЛ)
    // ============================================
    // Если нужен более плавный скролл — раскомментируй:
    // const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // if (!prefersReducedMotion) {
    //     // Можно подключить Lenis или другой smooth scroll
    // }

    console.log('.ISO system initialized. Time travel ready.');
})();