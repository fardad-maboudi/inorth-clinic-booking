/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

/**
 * Typed slide configuration data.
 * Easily replace or customize images, titles, and call-to-actions here.
 */
export const HERO_SLIDES = [
  {
    id: 'skin-care',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1920&q=80',
    fallbackColor: '#0f3a37',
    alt: 'کلینیک تخصصی و اتاق مشاوره پوست و زیبایی نیلوفر',
    eyebrow: 'کلینیک زیبایی نیلوفر',
    title: 'پوستی سالم‌تر، حالی بهتر',
    subtitle: 'ویزیت تخصصی پوست، لیزر موهای زائد و ماساژ ریلکسیشن زیر نظر کادر مجرب. زمان خالی را ببینید و در چند ثانیه نوبت بگیرید.',
    cta: {
      label: 'رزرو آنلاین نوبت',
      to: '/book',
    },
    secondaryCta: {
      label: 'مشاهدهٔ خدمات',
      to: '/services',
    },
  },
  {
    id: 'laser-tech',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80',
    fallbackColor: '#1a3331',
    alt: 'تجهیزات مدرن لیزر پوست با سیستم خنک‌کننده',
    eyebrow: 'فناوری روز دنیا',
    title: 'لیزر موهای زائد با خنک‌کننده پیشرفته و بدون درد',
    subtitle: 'جلسات لیزر مؤثر و ایمن برای انواع تایپ‌های پوستی با دستگاه‌های الکساندرایت استاندارد و تأییدیه رسمی.',
    cta: {
      label: 'مشاهده بسته‌های لیزر',
      to: '/packages',
    },
    secondaryCta: {
      label: 'نوبت‌دهی لیزر',
      to: '/book?service=laser',
    },
  },
  {
    id: 'relaxation-massage',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80',
    fallbackColor: '#1c3634',
    alt: 'فضای آرام ماساژ و ریلکسیشن کلینیک',
    eyebrow: 'آرامش و تندرستی',
    title: 'آرامش عمیق و بازیابی انرژی با ماساژ تخصصی',
    subtitle: 'ماساژ ریلکسیشن و سوئدی با روغن‌های گیاهی ارگانیک در محیطی کاملاً استاندارد و آرامش‌بخش.',
    cta: {
      label: 'رزرو نوبت ماساژ',
      to: '/book?service=massage',
    },
    secondaryCta: {
      label: 'آشنایی با تیم متخصصان',
      to: '/team',
    },
  },
];

/** Animation Timing & Easing Constants */
export const MOTION_CONFIG = {
  autoplayIntervalMs: 6500,
  transitionDurationSec: 0.7, // Total transition window: 700ms
  textDelaySec: 0.2, // 200ms delay after image begins moving
  textDurationSec: 0.5, // 500ms duration (0.2s delay + 0.5s duration = 0.7s total)
  textExitDurationSec: 0.22, // Fast exit to prevent overlap
  imageExitDurationSec: 0.65,
  easeEnter: [0.16, 1, 0.3, 1], // Smooth calm ease-out (no bounce or overshoot)
  easeExit: [0.36, 0, 0.66, 0], // Clean exit
  textDistancePx: 90, // Text travels 90px in transition direction for layered parallax
  textExitDistancePx: -40,
};

export default function HeroSlider({ slides = HERO_SLIDES, slotCard }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReduced = useReducedMotion();
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const sliderRef = useRef(null);
  const pointerInteraction = useRef(false);

  const slideCount = slides.length;

  const paginate = useCallback(
    (newDirection) => {
      setDirection(newDirection);
      setCurrent((prev) => (prev + newDirection + slideCount) % slideCount);
    },
    [slideCount],
  );

  const goToSlide = useCallback(
    (index) => {
      if (index === current) return;
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current],
  );

  // Autoplay pauses while the user interacts, requests a pause, or prefers reduced motion.
  useEffect(() => {
    if (isInteracting || isPaused || prefersReduced || slideCount < 2) return undefined;
    const timer = setInterval(() => {
      paginate(1);
    }, MOTION_CONFIG.autoplayIntervalMs);
    return () => clearInterval(timer);
  }, [paginate, isInteracting, isPaused, prefersReduced, slideCount]);

  // Touch / Swipe handlers for mobile & tablet (RTL-aware)
  function handleTouchStart(e) {
    setIsInteracting(true);
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  }

  function handleTouchEnd(e) {
    setIsInteracting(false);
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe must dominate vertical scroll
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      // In RTL: dragging finger towards physical left (negative deltaX) advances to Next slide (+1)
      // dragging finger towards physical right (positive deltaX) goes to Previous slide (-1)
      if (deltaX < 0) {
        paginate(1);
      } else {
        paginate(-1);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  function handleFocus() {
    // Stop rotation as soon as keyboard or assistive-technology focus enters.
    if (!pointerInteraction.current) setIsPaused(true);
  }

  function toggleAutoPlay() {
    // Explicit play/pause takes precedence over the hover pause.
    setIsInteracting(false);
    setIsPaused((paused) => !paused);
  }

  function handleBlur(e) {
    // Pointer interaction can still be active after focus leaves the carousel.
    if (!sliderRef.current || !sliderRef.current.contains(e.relatedTarget)) {
      setIsInteracting(false);
    }
  }

  // Keyboard navigation
  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      // In RTL, left arrow goes forward (next)
      e.preventDefault();
      paginate(1);
    } else if (e.key === 'ArrowRight') {
      // In RTL, right arrow goes backward (prev)
      e.preventDefault();
      paginate(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(slideCount - 1);
    }
  }

  const slide = slides[current] || slides[0];

  // Motion variants for Image layer (transform & opacity only)
  const imageVariants = {
    enter: (dir) => ({
      x: prefersReduced ? 0 : dir > 0 ? '100%' : '-100%',
      opacity: prefersReduced ? 0 : 0.85,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { duration: prefersReduced ? 0 : MOTION_CONFIG.transitionDurationSec, ease: MOTION_CONFIG.easeEnter },
        opacity: { duration: prefersReduced ? 0.2 : MOTION_CONFIG.transitionDurationSec, ease: 'linear' },
      },
    },
    exit: (dir) => ({
      x: prefersReduced ? 0 : dir > 0 ? '-100%' : '100%',
      opacity: prefersReduced ? 0 : 0.4,
      transition: {
        x: { duration: prefersReduced ? 0 : MOTION_CONFIG.imageExitDurationSec, ease: MOTION_CONFIG.easeExit },
        opacity: { duration: prefersReduced ? 0.2 : MOTION_CONFIG.imageExitDurationSec },
      },
    }),
  };

  // Motion variants for Text block layer (delayed, layered travel in same direction)
  const textVariants = {
    enter: (dir) => ({
      x: prefersReduced ? 0 : dir > 0 ? MOTION_CONFIG.textDistancePx : -MOTION_CONFIG.textDistancePx,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: {
          delay: prefersReduced ? 0 : MOTION_CONFIG.textDelaySec,
          duration: prefersReduced ? 0 : MOTION_CONFIG.textDurationSec,
          ease: MOTION_CONFIG.easeEnter,
        },
        opacity: {
          delay: prefersReduced ? 0 : MOTION_CONFIG.textDelaySec,
          duration: prefersReduced ? 0.2 : MOTION_CONFIG.textDurationSec,
          ease: 'linear',
        },
      },
    },
    exit: (dir) => ({
      x: prefersReduced ? 0 : dir > 0 ? -MOTION_CONFIG.textExitDistancePx : MOTION_CONFIG.textExitDistancePx,
      opacity: 0,
      transition: {
        duration: prefersReduced ? 0.15 : MOTION_CONFIG.textExitDurationSec,
        ease: 'easeIn',
      },
    }),
  };

  return (
    <section
      ref={sliderRef}
      className="cl-hero-slider"
      aria-roledescription="carousel"
      aria-label="بنر معرفی و خدمات کلینیک"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onPointerDownCapture={() => { pointerInteraction.current = true; }}
      onPointerUp={() => { pointerInteraction.current = false; }}
      onPointerCancel={() => { pointerInteraction.current = false; }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <div className="cl-hero-slider-track" aria-live={isInteracting || isPaused ? 'polite' : 'off'}>
        <AnimatePresence initial={false} custom={direction}>
          <div
            key={slide.id}
            className="cl-hero-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`اسلاید ${current + 1} از ${slideCount}: ${slide.title}`}
          >
            {/* Background Image Layer (hardware-accelerated slide) */}
            <Motion.div
              className="cl-hero-slide-bg"
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ backgroundColor: slide.fallbackColor || '#0b3b38' }}
            >
              <img
                src={slide.image}
                alt={slide.alt || ''}
                className="cl-hero-slide-img"
                loading={current === 0 ? 'eager' : 'lazy'}
                fetchPriority={current === 0 ? 'high' : 'low'}
                decoding="async"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
              />
              <div className="cl-hero-slide-overlay" aria-hidden="true" />
            </Motion.div>

            {/* Content Text Block Layer (delayed entrance in same direction) */}
            <div className="cl-wrap cl-hero-slide-content-wrap">
              <Motion.div
                className="cl-hero-slide-body"
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {slide.eyebrow ? <p className="cl-eyebrow cl-eyebrow-light">{slide.eyebrow}</p> : null}
                <h1 className="cl-hero-slide-title">{slide.title}</h1>
                <p className="cl-hero-slide-subtitle">{slide.subtitle}</p>

                {(slide.cta || slide.secondaryCta) && (
                  <div className="cl-hero-slide-actions">
                    {slide.cta ? (
                      <Link className="cl-btn cl-btn-rose cl-btn-lg" to={slide.cta.to}>
                        {slide.cta.label}
                      </Link>
                    ) : null}
                    {slide.secondaryCta ? (
                      <Link className="cl-btn cl-btn-glass cl-btn-lg" to={slide.secondaryCta.to}>
                        {slide.secondaryCta.label}
                      </Link>
                    ) : null}
                  </div>
                )}
              </Motion.div>
            </div>
          </div>
        </AnimatePresence>
      </div>

      {/* NextSlot Booking Card overlaid directly on the slider banner */}
      {slotCard}

      <div className="cl-hero-controls">
        <div className="cl-hero-control-bar" role="group" aria-label="کنترل‌های اسلایدر">
          <button
            type="button"
            className="cl-hero-control-btn"
            aria-label="اسلاید قبلی"
            onClick={() => paginate(-1)}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>

          <div className="cl-hero-dots" role="group" aria-label="انتخاب مستقیم اسلاید">
            {slides.map((s, index) => {
              const isActive = index === current;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`رفتن به اسلاید ${index + 1}: ${s.title}`}
                  className={`cl-hero-dot${isActive ? ' on' : ''}`}
                  onClick={() => goToSlide(index)}
                >
                  <span className="cl-hero-dot-pill" aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="cl-hero-control-btn"
            aria-label="اسلاید بعدی"
            onClick={() => paginate(1)}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          <span className="cl-hero-control-divider" aria-hidden="true" />

          <button
            type="button"
            className="cl-hero-control-btn cl-hero-autoplay"
            disabled={Boolean(prefersReduced)}
            aria-label={prefersReduced ? 'پخش خودکار با تنظیم کاهش حرکت خاموش است' : isPaused ? 'ادامهٔ پخش خودکار اسلایدها' : 'توقف پخش خودکار اسلایدها'}
            onClick={toggleAutoPlay}
          >
            {isPaused || prefersReduced ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </section>
  );
}
