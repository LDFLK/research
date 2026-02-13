import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import styles from './ActSlideshow.module.css';

/* ===== Data types ===== */

interface SlideshowMeta {
  actId: string;
  title: string;
  subtitle: string;
  tagline: string;
  logoUrl: string;
  logoAlt: string;
}

interface CoverSlide {
  type: 'cover';
}

interface ContentItem {
  highlight: string;
  text: string;
}

interface ContentSlide {
  type: 'content';
  year: number;
  heading: string;
  actLabel: string;
  accentColor: string;
  items: ContentItem[];
  sourceUrl?: string;
  sourceLabel?: string;
  sideLogoUrl?: string;
  sideLogoAlt?: string;
  note?: string;
  variant?: 'default' | 'alert';
}

interface SummaryRow {
  cells: string[];
  yearBadge?: boolean;
}

interface SummarySlide {
  type: 'summary';
  heading: string;
  accentColor: string;
  columns: string[];
  rows: SummaryRow[];
  footer?: string;
}

type Slide = CoverSlide | ContentSlide | SummarySlide;

export interface SlideshowData {
  meta: SlideshowMeta;
  slides: Slide[];
}

interface ActSlideshowProps {
  data: SlideshowData;
  height?: string;
  autoPlayInterval?: number;
}

/* ===== Sub-components ===== */

function CoverSlideView({ meta }: { meta: SlideshowMeta }) {
  return (
    <div className={styles.coverSlide} style={{ width: '100%', height: '100%' }}>
      <img className={styles.coverLogo} src={meta.logoUrl} alt={meta.logoAlt} />
      <h1 className={styles.coverTitle}>{meta.title}</h1>
      <div className={styles.coverDivider} />
      <p className={styles.coverSubtitle}>{meta.subtitle}</p>
      <p className={styles.coverTagline}>{meta.tagline}</p>
    </div>
  );
}

function ContentSlideView({
  slide,
  slideNumber,
  totalContent,
}: {
  slide: ContentSlide;
  slideNumber: number;
  totalContent: number;
}) {
  const isAlert = slide.variant === 'alert';

  const listContent = (
    <ul className={styles.itemList}>
      {slide.items.map((item, i) =>
        isAlert ? (
          <div key={i} className={styles.alertItem}>
            <span className={styles.alertItemStrong}>{item.highlight}</span> {item.text}
          </div>
        ) : (
          <li key={i} className={styles.itemListItem}>
            <span className={styles.itemHighlight}>{item.highlight}</span> {item.text}
          </li>
        ),
      )}
    </ul>
  );

  return (
    <div
      className={`${styles.contentSlide} ${isAlert ? styles.alertSlide : ''}`}
      style={{ width: '100%', height: '100%' }}
    >
      <div className={styles.accentBar} style={{ background: slide.accentColor }} />
      <span className={styles.slideNumber}>
        {String(slideNumber).padStart(2, '0')} / {String(totalContent).padStart(2, '0')}
      </span>
      <span className={styles.yearLabel}>{slide.year}</span>
      <h2 className={styles.contentHeading}>{slide.heading}</h2>
      <span className={styles.actLabel}>{slide.actLabel}</span>

      {slide.sideLogoUrl ? (
        <div className={styles.amendmentFlex}>
          <div className={styles.amendmentFlexContent}>{listContent}</div>
          <div className={styles.amendmentFlexLogo}>
            <img
              className={styles.amendmentFlexLogoImg}
              src={slide.sideLogoUrl}
              alt={slide.sideLogoAlt || ''}
            />
          </div>
        </div>
      ) : (
        listContent
      )}

      {slide.note && <p className={styles.noteText}>{slide.note}</p>}
      {slide.sourceUrl && (
        <a
          className={styles.sourceLink}
          href={slide.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {slide.sourceLabel || slide.sourceUrl}
        </a>
      )}
    </div>
  );
}

function SummarySlideView({ slide, slideNumber, totalContent }: { slide: SummarySlide; slideNumber: number; totalContent: number }) {
  return (
    <div className={styles.summarySlide} style={{ width: '100%', height: '100%' }}>
      <div className={styles.accentBar} style={{ background: slide.accentColor }} />
      <span className={styles.slideNumber}>
        {String(slideNumber).padStart(2, '0')} / {String(totalContent).padStart(2, '0')}
      </span>
      <h2 className={styles.summaryHeading}>{slide.heading}</h2>
      <table className={styles.summaryTable}>
        <thead>
          <tr>
            {slide.columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slide.rows.map((row, ri) => (
            <tr key={ri}>
              {row.cells.map((cell, ci) => (
                <td key={ci}>
                  {ci === 0 && row.yearBadge ? (
                    <span className={styles.yearBadge}>{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {slide.footer && <div className={styles.footerText}>{slide.footer}</div>}
    </div>
  );
}

/* ===== Main component ===== */

export default function ActSlideshow({
  data,
  height = '600px',
  autoPlayInterval = 6000,
}: ActSlideshowProps): ReactNode {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = data.slides.length;
  const totalContent = total - 1; // exclude cover for numbering
  const isCover = current === 0;

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < total) setCurrent(index);
    },
    [total],
  );

  const next = useCallback(() => {
    if (current < total - 1) setCurrent((c) => c + 1);
    else setIsPlaying(false);
  }, [current, total]);

  const prev = useCallback(() => {
    if (current > 0) setCurrent((c) => c - 1);
  }, [current]);

  const toggleAutoPlay = useCallback(() => {
    setIsPlaying((p) => {
      if (!p && current === total - 1) setCurrent(0);
      return !p;
    });
  }, [current, total]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrent((c) => {
          if (c < total - 1) return c + 1;
          setIsPlaying(false);
          return c;
        });
      }, autoPlayInterval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, autoPlayInterval, total]);

  // Focus-scoped keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Escape') {
        setIsPlaying(false);
      }
    },
    [next, prev],
  );

  // Render a single slide
  function renderSlide(slide: Slide, index: number) {
    let contentIndex = index; // 1-based for content slides (cover is 0)
    switch (slide.type) {
      case 'cover':
        return <CoverSlideView meta={data.meta} />;
      case 'content':
        return (
          <ContentSlideView
            slide={slide}
            slideNumber={contentIndex}
            totalContent={totalContent}
          />
        );
      case 'summary':
        return (
          <SummarySlideView
            slide={slide}
            slideNumber={contentIndex}
            totalContent={totalContent}
          />
        );
    }
  }

  const progressWidth = total > 1 ? (current / (total - 1)) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`${styles.slideshow} ${isCover ? styles.onCover : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={`Slideshow: ${data.meta.title}`}
      aria-roledescription="slideshow"
    >
      {/* Slides */}
      <div className={styles.slideTrack} style={{ height }}>
        {data.slides.map((slide, i) => {
          let slideClass = styles.slide;
          if (i === current) slideClass += ` ${styles.slideActive}`;
          else if (i < current) slideClass += ` ${styles.slideExitLeft}`;
          return (
            <div
              key={i}
              className={slideClass}
              role="tabpanel"
              aria-hidden={i !== current}
              aria-label={`Slide ${i + 1} of ${total}`}
            >
              {renderSlide(slide, i)}
            </div>
          );
        })}

        {/* Navigation arrows */}
        <button
          className={`${styles.navArrow} ${styles.navPrev} ${current === 0 ? styles.navArrowHidden : ''}`}
          onClick={prev}
          aria-label="Previous slide"
        >
          &#9664;
        </button>
        <button
          className={`${styles.navArrow} ${styles.navNext} ${current === total - 1 ? styles.navArrowHidden : ''}`}
          onClick={next}
          aria-label="Next slide"
        >
          &#9654;
        </button>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar} style={{ width: `${progressWidth}%` }} />

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.keyHint}>
          <kbd className={styles.keyHintKbd}>&larr;</kbd>{' '}
          <kbd className={styles.keyHintKbd}>&rarr;</kbd> to navigate
        </div>

        <div className={styles.dots} role="tablist" aria-label="Slide navigation">
          {data.slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          className={`${styles.btnAuto} ${isPlaying ? styles.btnAutoPlaying : ''}`}
          onClick={toggleAutoPlay}
          aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
        >
          {isPlaying ? 'Pause' : 'Auto Play'}
        </button>
      </div>
    </div>
  );
}
