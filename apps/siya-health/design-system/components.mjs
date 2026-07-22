/**
 * Design System — HTML string render helpers for build-time injection.
 * Used by seo-build, page generators, and site-chrome (Pass 2+).
 */
import { ctaTrackingAttrs, CTA_SLOTS } from './cta-system.mjs';
import {
  resolvePageCtas,
  resolveConversion,
  resolveNavCtaSlot,
  isAdhdFunnelPath,
} from './conversion-system.mjs';
import { resolveTrust, trustToRenderProps } from './trust-system.mjs';
import { dualClass } from './class-names.mjs';

export { dualClass };

export function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Slot ids that are also ConversionGoal values — prefer over page primary goal. */
const CTA_SLOT_AS_GOAL = new Set([
  'meetGreet',
  'secureChat',
  'consultation',
  'screening',
  'newsletter',
  'bookDemo',
  'exploreCare',
  'viewPricing',
  'zocdoc',
]);

function linkAttrs(href, opts = {}) {
  const { external = false, track = '', location = '', relPath = '', ctaSlot = '', analytics = null } = opts;
  const ext = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  let meta = analytics;
  if (!meta && relPath) {
    const conv = resolveConversion(relPath);
    const goalFromSlot = ctaSlot && CTA_SLOT_AS_GOAL.has(ctaSlot) ? ctaSlot : null;
    meta = {
      pageType: conv.pageType,
      intent: conv.intent,
      conversionGoal: goalFromSlot || conv.conversionGoal || '',
      ctaSlot: ctaSlot || '',
    };
  }
  const trackAttr = track || meta
    ? ` ${ctaTrackingAttrs({ track, location, component: 'button', ctaSlot, ...meta })}`
    : '';
  return `href="${escAttr(href)}"${ext}${trackAttr}`;
}

/**
 * @param {{ label: string, href: string, variant?: 'primary'|'secondary'|'accent'|'ghost-on-dark', external?: boolean, track?: string, location?: string, className?: string, relPath?: string, ctaSlot?: string, analytics?: object }} opts
 */
export function renderButton({
  label,
  href,
  variant = 'primary',
  external = false,
  track = '',
  location = '',
  className = '',
  relPath = '',
  ctaSlot = '',
  analytics = null,
}) {
  const variantClass =
    variant === 'secondary'
      ? ' ds-button--secondary secondary'
      : variant === 'accent'
        ? ' ds-button--accent'
        : variant === 'ghost-on-dark'
          ? ' ds-button--ghost-on-dark secondary'
          : ' ds-button--primary';
  const extra = className ? ` ${className}` : '';
  return `<a class="button ds-button${variantClass}${extra}" ${linkAttrs(href, { external, track, location, relPath, ctaSlot, analytics })}>${escHtml(label)}</a>`;
}

/**
 * @param {{ title: string, lead?: string, eyebrow?: string, backgroundImage?: string, trustItems?: string[], ctas?: Array<Parameters<typeof renderButton>[0]>, pageType?: string }} opts
 */
export function renderHero({
  title,
  lead = '',
  eyebrow = '',
  backgroundImage = '',
  trustItems = [],
  ctas = [],
  pageType,
}) {
  const bgStyle = backgroundImage
    ? ` style="background-image: url('${escAttr(backgroundImage)}');"`
    : '';
  const eyebrowHtml = eyebrow
    ? `\n            <span class="ds-hero__eyebrow">${escHtml(eyebrow)}</span>`
    : '';
  const trustHtml =
    trustItems.length > 0
      ? `\n            <div class="ds-hero__trust" aria-label="Trust indicators">${trustItems.map((t) => `<span>${escHtml(t)}</span>`).join('')}</div>`
      : '';
  const ctaHtml =
    ctas.length > 0
      ? `\n            <div class="ds-hero__ctas hero-ctas">${ctas.map((c) => renderButton(c)).join('\n              ')}</div>`
      : pageType
        ? renderHeroCtasFromPageType(pageType)
        : '';

  return `<section class="ds-hero hero-merged"${bgStyle}>
        <div class="container hero-inner ds-hero__inner">
          <div class="ds-hero__content hero-merged-content">
            ${eyebrowHtml}
            <h1 class="ds-hero__title">${title}</h1>
            ${lead ? `<p class="ds-hero__lead hero-merged-lead">${lead}</p>` : ''}${ctaHtml}${trustHtml}
          </div>
        </div>
      </section>`;
}

function renderHeroCtasFromPageType(pageType) {
  const { primary, secondary } = resolvePageCtas(pageType);
  const buttons = [];
  if (primary) {
    buttons.push(
      renderButton({
        label: primary.label,
        href: primary.url,
        variant: pageType === 'adhd' || pageType === 'landing' ? 'accent' : 'primary',
        external: primary.external,
        track: primary.track,
        location: 'hero',
      }),
    );
  }
  if (secondary) {
    buttons.push(
      renderButton({
        label: secondary.label,
        href: secondary.url,
        variant: 'ghost-on-dark',
        external: secondary.external,
        track: secondary.track,
        location: 'hero',
      }),
    );
  }
  return buttons.length
    ? `\n            <div class="ds-hero__ctas hero-ctas">${buttons.join('\n              ')}</div>`
    : '';
}

/**
 * @param {{ title: string, text?: string, variant?: ''|'lead-magnet'|'newsletter', ctas?: Array<Parameters<typeof renderButton>[0]>, pageType?: string }} opts
 */
export function renderCtaBlock({
  title,
  text = '',
  variant = '',
  ctas = [],
  pageType,
}) {
  const variantClass = variant ? ` ds-cta-${variant}` : '';
  let buttons = ctas;
  if (!buttons.length && pageType) {
    const { primary, secondary } = resolvePageCtas(pageType);
    buttons = [primary, secondary].filter(Boolean).map((c, i) => ({
      label: c.label,
      href: c.url,
      variant: i === 0 ? 'primary' : 'secondary',
      external: c.external,
      track: c.track,
      location: 'cta-block',
    }));
  }

  return `<div class="ds-cta-block cta-band${variantClass}">
            <h3 class="ds-cta-block__title">${escHtml(title)}</h3>
            ${text ? `<p class="ds-cta-block__text">${text}</p>` : ''}
            <div class="ds-cta-block__actions cta-band-buttons">
              ${buttons.map((c) => renderButton(c)).join('\n              ')}
            </div>
          </div>`;
}

export const renderCtaPrimary = (opts) =>
  renderCtaBlock({ ...opts, pageType: opts.pageType ?? 'homepage' });
export const renderCtaSecondary = (opts) =>
  renderCtaBlock({ ...opts, ctas: opts.ctas ?? [renderButtonSlot('secondary')] });
export const renderCtaLeadMagnet = (opts) =>
  renderCtaBlock({ ...opts, variant: 'lead-magnet', pageType: 'adhd' });
export const renderCtaNewsletter = (opts) =>
  renderCtaBlock({
    title: opts.title ?? CTA_SLOTS.newsletter.label,
    text: opts.text ?? CTA_SLOTS.newsletter.microcopy ?? 'Weekly evidence-based health insights.',
    variant: 'newsletter',
    ctas: [
      {
        label: opts.label ?? CTA_SLOTS.newsletter.label,
        href: CTA_SLOTS.newsletter.url,
        external: true,
        track: CTA_SLOTS.newsletter.track,
        location: 'newsletter',
      },
    ],
  });

function renderButtonSlot(slotId) {
  const slot = CTA_SLOTS[slotId];
  return {
    label: slot.label,
    href: slot.url,
    external: slot.external,
    track: slot.track,
  };
}

/**
 * @param {{ id?: string, title: string, lead?: string, body?: string, centered?: boolean }} opts
 */
export function renderSectionHeader({
  id = '',
  title,
  lead = '',
  body = '',
  centered = false,
}) {
  const idAttr = id ? ` id="${escAttr(id)}"` : '';
  const centerClass = centered ? ' ds-section-header--center' : '';
  return `<div class="ds-section-header section-header${centerClass}"${idAttr}>
            <h2 class="ds-section-header__title">${title}</h2>
            ${lead ? `<p class="ds-section-header__lead lead">${lead}</p>` : ''}
            ${body ? `<p class="ds-section-header__body">${body}</p>` : ''}
          </div>`;
}

/**
 * @param {{ provider: object, href?: string, photoHtml?: string }} opts
 */
export function renderProviderCard({ provider, href, photoHtml = '' }) {
  const url = href ?? `/providers/${provider.slug}`;
  const name = provider.displayName || provider.name || `${provider.givenName} ${provider.familyName}`;
  const credential = provider.honorificSuffix || provider.credentials?.[0] || '';
  const specialty = provider.headline || provider.specialty || '';
  const photo =
    photoHtml ||
    (provider.photo
      ? `<img class="ds-provider-card__photo" src="/${escAttr(provider.photo)}" alt="${escAttr(name)}" width="96" height="96" loading="lazy" />`
      : '');

  return `<article class="ds-provider-card provider-card">
            ${photo}
            <h3 class="ds-provider-card__name"><a href="${escAttr(url)}">${escHtml(name)}</a></h3>
            ${credential ? `<span class="ds-provider-card__credential">${escHtml(credential)}</span>` : ''}
            ${specialty ? `<p class="ds-provider-card__specialty">${escHtml(specialty)}</p>` : ''}
            <a class="ds-provider-card__link" href="${escAttr(url)}">View profile →</a>
          </article>`;
}

/**
 * @param {{ columns?: 2|3|4, cards: Array<{ icon?: string, title: string, text: string }> }} opts
 */
export function renderFeatureGrid({ columns = 3, cards }) {
  const colClass = columns === 4 ? ' ds-feature-grid--4' : columns === 3 ? ' ds-feature-grid--3' : '';
  return `<div class="ds-feature-grid${colClass}">
            ${cards
              .map(
                (c) => `<article class="ds-feature-card">
              ${c.icon ? `<div class="ds-feature-card__icon" aria-hidden="true">${c.icon}</div>` : ''}
              <h3 class="ds-feature-card__title">${escHtml(c.title)}</h3>
              <p class="ds-feature-card__text">${c.text}</p>
            </article>`,
              )
              .join('\n            ')}
          </div>`;
}

/**
 * @param {{ id?: string, title?: string, items: Array<{ question: string, answer: string }>, prefix?: string, cta?: { headline?: string, buttons?: Array<Parameters<typeof renderButton>[0]>, subtext?: string } }} opts
 */
export function renderFaq({
  id = 'faq',
  title = 'Frequently Asked Questions',
  items,
  prefix = 'faq',
  cta,
}) {
  const cards = items
    .map((item, i) => {
      const qId = `${prefix}-q-${i}`;
      const aId = `${prefix}-${i}`;
      return `              <div class="ds-faq__item faq-accordion-card" data-faq-item>
                <h3 class="visually-hidden">${escHtml(item.question)}</h3>
                <button type="button" class="ds-faq__trigger faq-accordion-trigger" aria-expanded="false" aria-controls="${aId}" id="${qId}" data-faq-trigger>
                  ${escHtml(item.question)}
                  <span class="ds-faq__icon faq-accordion-icon" aria-hidden="true">+</span>
                </button>
                <div id="${aId}" class="ds-faq__content faq-accordion-content" role="region" aria-labelledby="${qId}" data-faq-content hidden>
                  <div class="ds-faq__inner faq-accordion-inner">
                    <p>${item.answer}</p>
                  </div>
                </div>
              </div>`;
    })
    .join('\n');

  const ctaHtml = cta
    ? `            <div class="ds-faq__cta faq-accordion-cta">
              ${cta.headline ? `<p class="ds-faq__cta-headline faq-accordion-cta-headline">${escHtml(cta.headline)}</p>` : ''}
              ${cta.subtext ? `<p class="ds-faq__cta-subtext faq-accordion-cta-subtext">${escHtml(cta.subtext)}</p>` : ''}
              <div class="ds-faq__cta-actions faq-accordion-cta-buttons">
                ${(cta.buttons ?? []).map((b) => renderButton(b)).join('\n                ')}
              </div>
            </div>`
    : '';

  return `<section class="section faq-accordion-section" id="${escAttr(id)}">
        <div class="container">
          <div class="ds-faq faq-accordion" role="region" aria-label="${escAttr(title)}">
            <div class="ds-faq__header faq-accordion-header section-header">
              <h2>${escHtml(title)}</h2>
            </div>
            <div class="ds-faq__list faq-accordion-list">
${cards}
            </div>
${ctaHtml}
          </div>
        </div>
      </section>`;
}

/** Inline FAQ accordion script — matches existing pages */
export function renderFaqScript(containerSelector = '.faq-accordion') {
  return `<script>
(function () {
  var container = document.querySelector(${JSON.stringify(containerSelector)});
  if (!container) return;
  var triggers = container.querySelectorAll('[data-faq-trigger]');
  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('[data-faq-item]');
      var content = card.querySelector('[data-faq-content]');
      var isOpen = card.classList.contains('is-open');
      container.querySelectorAll('[data-faq-item].is-open').forEach(function (openCard) {
        openCard.classList.remove('is-open');
        var openBtn = openCard.querySelector('[data-faq-trigger]');
        var openContent = openCard.querySelector('[data-faq-content]');
        if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
        if (openContent) openContent.hidden = true;
      });
      if (!isOpen) {
        card.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        content.hidden = false;
      }
    });
  });
})();
</script>`;
}

/**
 * @param {{ metrics?: Array<{ value: string, label: string }>, badges?: string[], scrollItems?: Array<{ strong?: string, text: string }> }} opts
 */
export function renderTrustSection({ metrics = [], badges = [], scrollItems = [] }) {
  const metricsHtml =
    metrics.length > 0
      ? `<div class="ds-trust__grid trust-metrics-grid">
            ${metrics
              .map(
                (m) => `<div class="ds-trust__metric trust-metric-card">
              <span class="ds-trust__value trust-metric-value">${escHtml(m.value)}</span>
              <span class="ds-trust__label trust-metric-label">${escHtml(m.label)}</span>
            </div>`,
              )
              .join('\n            ')}
          </div>`
      : '';

  const badgesHtml =
    badges.length > 0
      ? `<div class="ds-trust__badges trust-badges">
            ${badges.map((b) => `<span class="ds-trust__badge trust-badge">${escHtml(b)}</span>`).join('\n            ')}
          </div>`
      : '';

  const scrollHtml =
    scrollItems.length > 0
      ? `<ul class="ds-trust-scroll lp-trust-scroll" aria-label="Trust highlights">
            ${scrollItems
              .map(
                (item) =>
                  `<li class="ds-trust-scroll__item">${item.strong ? `<strong>${escHtml(item.strong)}</strong> ` : ''}${escHtml(item.text)}</li>`,
              )
              .join('\n            ')}
          </ul>`
      : '';

  return `<section class="ds-trust trust-metrics section">
        <div class="container">
          ${metricsHtml}
          ${badgesHtml}
          ${scrollHtml}
        </div>
      </section>`;
}

export const renderTrustScroll = (scrollItems) =>
  renderTrustSection({ scrollItems });

/**
 * Footer — reference only; full markup from site-chrome.mjs renderLegalFooter().
 */
export function renderFooterReference() {
  return `<!-- DS:FOOTER-REF — Pass 2: inject via site-chrome renderSeoFooterMarkup(relPath) -->
          <div class="ds-footer-ref" data-ds-footer="site-chrome">
            <p>Footer chrome is owned by <code>scripts/site-chrome.mjs</code> (renderLegalFooter, renderSeoFooterMarkup). Do not duplicate legal links here.</p>
          </div>`;
}

/**
 * @param {{ title?: string, text?: string, compliance?: string, label?: string, href?: string }} opts
 */
export function renderNewsletterBlock({
  title = 'Join Our Health Guide',
  text = CTA_SLOTS.newsletter.microcopy ?? 'Weekly evidence-based health insights.',
  compliance = 'General education only—not medical advice or emergency care.',
  label,
  href,
} = {}) {
  const cta = CTA_SLOTS.newsletter;
  return `<aside class="ds-newsletter siya-circle-promo">
            <h2 class="ds-newsletter__title">${escHtml(title)}</h2>
            <p class="ds-newsletter__text">${escHtml(text)}</p>
            ${renderButton({
              label: label ?? cta.label,
              href: href ?? cta.url,
              external: true,
              track: cta.track,
              location: 'newsletter',
            })}
            <p class="ds-newsletter__compliance">${compliance}</p>
            <p class="ds-newsletter__note">You&rsquo;ll be taken to our secure signup form.</p>
          </aside>`;
}

/**
 * @param {{ quote: string, author?: string, verified?: string, stars?: number, tags?: string[] }} opts
 */
export function renderTestimonial({ quote, author = '', verified = '', stars = 5, tags = [] }) {
  const starsHtml = '★'.repeat(Math.min(5, Math.max(0, stars)));
  const tagsHtml =
    tags.length > 0
      ? `<div class="ds-testimonial__tags testimonial-tags">${tags.map((t) => `<span class="ds-testimonial__tag testimonial-tag">${escHtml(t)}</span>`).join('')}</div>`
      : '';

  return `<blockquote class="ds-testimonial testimonial-card-premium">
            <div class="ds-testimonial__stars review-stars" aria-label="${stars} out of 5 stars">${starsHtml}</div>
            ${tagsHtml}
            <p class="ds-testimonial__quote testimonial-text">&ldquo;${quote}&rdquo;</p>
            <footer class="ds-testimonial__footer testimonial-footer">
              ${author ? `<cite class="ds-testimonial__author">${escHtml(author)}</cite>` : ''}
              ${verified ? `<span class="ds-testimonial__verified testimonial-verified">${escHtml(verified)}</span>` : ''}
            </footer>
          </blockquote>`;
}

/**
 * @param {{ headline?: string, lines?: string[], meta?: string, metrics?: Array<{ value: string, label: string }> }} opts
 */
export function renderStatsSection({ headline = '', lines = [], meta = '', metrics = [] }) {
  const linesHtml = lines
    .map(
      (line, i) =>
        `<p class="ds-stats__line${i === lines.length - 1 ? ' ds-stats__line--strong' : ''}">${line}</p>`,
    )
    .join('\n            ');

  const gridHtml =
    metrics.length > 0
      ? `<div class="ds-stats__grid">
            ${metrics
              .map(
                (m) => `<div class="ds-trust__metric trust-metric-card">
              <span class="ds-trust__value trust-metric-value">${escHtml(m.value)}</span>
              <span class="ds-trust__label trust-metric-label">${escHtml(m.label)}</span>
            </div>`,
              )
              .join('\n            ')}
          </div>`
      : '';

  return `<section class="ds-stats trust-metrics-adhd-rewrite section">
        <div class="container">
          <div class="ds-stats__inner trust-metrics-rewrite-inner">
            ${headline ? `<h2 class="ds-stats__headline trust-metrics-rewrite-headline">${escHtml(headline)}</h2>` : ''}
            ${linesHtml}
            ${meta ? `<p class="ds-stats__meta trust-metrics-rewrite-meta">${escHtml(meta)}</p>` : ''}
          </div>
          ${gridHtml}
        </div>
      </section>`;
}

/**
 * @param {{ steps: Array<{ title: string, text: string }>, showConnectors?: boolean }} opts
 */
export function renderTimeline({ steps, showConnectors = true }) {
  const parts = [];
  steps.forEach((step, i) => {
    if (showConnectors && i > 0) {
      parts.push('<div class="ds-timeline__connector process-connector" aria-hidden="true"></div>');
    }
    parts.push(`<div class="ds-timeline__step process-step-inline">
              <span class="ds-timeline__num process-step-num">Step ${i + 1}</span>
              <h3 class="ds-timeline__title">${escHtml(step.title)}</h3>
              <p class="ds-timeline__text">${escHtml(step.text)}</p>
            </div>`);
  });

  return `<div class="ds-timeline process-steps-inline">
            ${parts.join('\n            ')}
          </div>`;
}

/**
 * @param {{ title: string, price: string, period?: string, description?: string, features?: string[], featured?: boolean, cta?: Parameters<typeof renderButton>[0] }} opts
 */
export function renderPricingCard({
  title,
  price,
  period = '',
  description = '',
  features = [],
  featured = false,
  cta,
}) {
  const featuredClass = featured ? ' ds-pricing-card--featured pricing-card-featured' : '';
  const featuresHtml =
    features.length > 0
      ? `<ul class="ds-pricing-card__features pricing-value-stack">
            ${features.map((f) => `<li>${escHtml(f)}</li>`).join('\n            ')}
          </ul>`
      : '';

  const ctaHtml = cta
    ? `<div class="ds-pricing-card__cta pricing-cta">${renderButton({ ...cta, className: 'ds-button--block' })}</div>`
    : '';

  return `<article class="ds-pricing-card pricing-card${featuredClass}">
            <h3 class="ds-pricing-card__title">${escHtml(title)}</h3>
            <p class="ds-pricing-card__price pricing-price">${escHtml(price)}</p>
            ${period ? `<p class="ds-pricing-card__period">${escHtml(period)}</p>` : ''}
            ${description ? `<p class="ds-pricing-card__desc pricing-desc">${escHtml(description)}</p>` : ''}
            ${featuresHtml}
            ${ctaHtml}
          </article>`;
}

/**
 * @param {{ columns?: 2|3, cards: Array<Parameters<typeof renderPricingCard>[0]> }} opts
 */
export function renderPricingGrid({ columns = 3, cards }) {
  const colClass = columns === 2 ? ' ds-pricing-grid--2 pricing-grid-two' : ' ds-pricing-grid--3 pricing-grid-three';
  return `<div class="ds-pricing-grid pricing-grid${colClass}">
            ${cards.map((c) => renderPricingCard(c)).join('\n            ')}
          </div>`;
}

/**
 * @param {{ action?: string, method?: string, fields: Array<{ name: string, label: string, type?: string, required?: boolean, hint?: string }>, submitLabel?: string }} opts
 */
export function renderForm({ action = '#', method = 'post', fields, submitLabel = 'Submit' }) {
  const fieldsHtml = fields
    .map((f) => {
      const type = f.type ?? 'text';
      const req = f.required ? ' required' : '';
      const input =
        type === 'textarea'
          ? `<textarea class="ds-form__textarea" id="${escAttr(f.name)}" name="${escAttr(f.name)}"${req}></textarea>`
          : `<input class="ds-form__input" type="${escAttr(type)}" id="${escAttr(f.name)}" name="${escAttr(f.name)}"${req} />`;
      return `<div class="ds-form__field form-field">
              <label class="ds-form__label" for="${escAttr(f.name)}">${escHtml(f.label)}</label>
              ${input}
              ${f.hint ? `<p class="ds-form__hint">${escHtml(f.hint)}</p>` : ''}
            </div>`;
    })
    .join('\n            ');

  return `<form class="ds-form" action="${escAttr(action)}" method="${escAttr(method)}">
            ${fieldsHtml}
            <button type="submit" class="button ds-button ds-button--primary">${escHtml(submitLabel)}</button>
          </form>`;
}

/** Wrap any block in standard section + container */
export function renderSection({ id = '', className = '', content, tinted = false }) {
  const tint = tinted ? ' section-tinted' : '';
  const idAttr = id ? ` id="${escAttr(id)}"` : '';
  return `<section class="section${tint}${className ? ` ${className}` : ''}"${idAttr}>
        <div class="container">
          ${content}
        </div>
      </section>`;
}

// ── Sitewide chrome helpers (site-chrome.mjs, generators) ──

/** @param {import('./cta-system.mjs').CTA_SLOTS[keyof import('./cta-system.mjs').CTA_SLOTS]} slot */
export function slotToButton(slot, { variant = 'primary', location = 'body', relPath = '' } = {}) {
  if (!slot) return null;
  return {
    label: slot.label,
    href: slot.url,
    variant,
    external: slot.external,
    track: slot.track,
    location,
    relPath,
    ctaSlot: slot.id ?? '',
  };
}

/** Nav / mobile nav CTA button markup */
export function renderNavCtaMarkup(relPath, location = 'nav') {
  const slot = resolveNavCtaSlot(relPath);
  if (!slot) return '';
  return renderButton({ ...slotToButton(slot, { location, relPath }), variant: 'primary', ctaSlot: slot.id });
}

/** Inner FAQ accordion CTA block (not full section) */
export function renderFaqCtaInner(relPath) {
  if (relPath === 'adhd-care.html') {
    const meetBtn = renderButton({
      ...slotToButton(CTA_SLOTS.meetGreet, { location: 'faq-cta', relPath }),
      variant: 'primary',
    });
    return `            <div class="ds-faq__cta faq-accordion-cta">
              <p class="faq-accordion-cta-headline">Still deciding?</p>
              <div class="faq-accordion-cta-buttons">
                ${meetBtn}
                <a class="button ds-button ds-button--secondary secondary" href="tel:+12154451244" data-siya-track="phone_click" data-siya-location="faq-cta" data-page-type="adhd" data-intent="adhd" data-component="button">Call Us (215) 445-1244</a>
              </div>
              <p class="faq-accordion-cta-subtext">Most patients start with a screening or <a href="/pricing">review pricing</a> before booking.</p>
            </div>`;
  }
  const { primary } = resolveConversion(relPath);
  const slot = primary ?? CTA_SLOTS.primary;
  return `            <div class="ds-faq__cta faq-accordion-cta">
              <p class="faq-accordion-cta-headline">Still not sure where to start?</p>
              <p class="faq-accordion-cta-subtext">A short conversation can help determine the right next step.</p>
              <div class="faq-accordion-cta-buttons">
                ${renderButton({ ...slotToButton(slot, { location: 'faq-cta' }), variant: 'primary' })}
              </div>
            </div>`;
}

/** Blog / guide end-of-article CTA section */
export function renderBlogFinalCtaSection(relPath) {
  const { primary, secondary } = resolveConversion(relPath);
  const slot = primary ?? CTA_SLOTS.primary;
  const ctas = [
    slotToButton(slot, { location: 'blog-final-cta', relPath }),
  ].filter(Boolean);
  if (secondary) {
    ctas.push(
      slotToButton(secondary, {
        variant: 'secondary',
        location: 'blog-final-cta',
        relPath,
      }),
    );
  }
  const band = renderCtaBlock({
    title: 'Not sure where to start?',
    text: 'A brief clinician conversation can help you understand your options—no obligation.',
    ctas,
  });
  return `<section class="section blog-final-cta">
        <div class="container">
          ${band.trim()}
        </div>
      </section>`;
}

/** Trust strip from trust-system profile */
export function renderTrustForPath(relPath, opts = {}) {
  const trust = resolveTrust(relPath, opts);
  const props = trustToRenderProps(trust);
  if (opts.variant === 'scroll' || (props.scrollItems.length > 0 && opts.variant !== 'grid')) {
    return renderTrustSection({ scrollItems: props.scrollItems });
  }
  return renderTrustSection({ metrics: props.metrics, badges: props.badges });
}

/**
 * About / homepage care team card — dual-class with legacy markup.
 * @param {object} provider
 * @param {{ variant?: 'homepage'|'about'|'meet', photoHtml?: string, serviceTagline?: string }} opts
 */
export function renderAboutTeamCard(provider, { variant = 'homepage', photoHtml = '', serviceTagline = '' } = {}) {
  const p = provider;
  const displayName = p.name?.replace(/, (MD|PA-C|FNP-C|FNP-BC)$/, '') ?? p.name;
  const photo = photoHtml;
  if (variant === 'homepage') {
    return `            <article class="${dualClass('about-team-card homepage-care-card', 'ds-provider-card')}" data-states="${(p.stateAbbreviations ?? []).join(',')}">
              ${photo}
              <h3><a href="/providers/${p.slug}">${escHtml(p.name)}</a></h3>
              <p class="about-team-role">${escHtml(p.homepageRole ?? p.role ?? '')}</p>
              <p class="about-team-states">Licensed in ${escHtml(p.stateAbbreviations?.join(', ') ?? '')}</p>
              <p class="about-team-bio">${escHtml(p.homepageBio ?? p.servicePageTagline ?? '')}</p>
              <a class="button secondary care-team-profile-btn" href="/providers/${p.slug}">View profile</a>
            </article>`;
  }
  if (variant === 'meet') {
    const tagline = serviceTagline || p.servicePageTagline || '';
    return `            <article class="${dualClass('about-team-card', 'ds-provider-card')}" data-states="${(p.stateAbbreviations ?? []).join(',')}">
              ${photo}
              <h3><a href="/providers/${p.slug}">${escHtml(p.name)}</a></h3>
              <p class="about-team-tagline">${escHtml(tagline)}</p>
              <a class="text-link" href="/providers/${p.slug}">View profile →</a>
            </article>`;
  }
  const tagline = p.homepageBio ?? p.servicePageTagline ?? '';
  const clean = String(tagline).replace(/<[^>]+>/g, '').trim();
  return `            <article class="${dualClass('about-team-card', 'ds-provider-card')}">
              ${photo}
              <h3><a href="/providers/${p.slug}">${escHtml(displayName)}</a></h3>
              <p class="about-team-tagline">${escHtml(clean)}</p>
              <a class="button secondary" href="/providers/${p.slug}">View profile</a>
            </article>`;
}

export { isAdhdFunnelPath, resolveConversion, resolveNavCtaSlot };
