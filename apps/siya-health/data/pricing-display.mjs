/**
 * Public pricing display helpers — single consumer API for page generators & chrome.
 * Amounts live only in data/site-standards.mjs → PRICING.
 *
 * Prefer these helpers (or SIYA price tokens) over hard-coded dollar amounts.
 */
import { PRICING } from './site-standards.mjs';

/** @returns {typeof PRICING} */
export function getPricing() {
  return PRICING;
}

/** e.g. "$149" */
export function initialEvaluationPriceDisplay() {
  return PRICING.initialEvaluation.display;
}

/** e.g. 149 */
export function initialEvaluationPriceAmount() {
  return PRICING.initialEvaluation.amount;
}

/** Short patient-facing line without forcing the number into a title. */
export function initialEvaluationPriceLine() {
  return `${PRICING.initialEvaluation.display} initial physician evaluation`;
}

/**
 * Inline HTML span for templates. One place to style/script later if needed.
 * @param {{ className?: string }} [opts]
 */
export function renderInitialEvaluationPrice(opts = {}) {
  const className = ['siya-price', 'siya-price--initial-evaluation', opts.className].filter(Boolean).join(' ');
  return `<span class="${className}" data-siya-price="initialEvaluation">${PRICING.initialEvaluation.display}</span>`;
}

/** Follow-up displays (for generators that should not hard-code). */
export function nonControlledFollowUpDisplay() {
  return PRICING.nonControlledFollowUp.display;
}

export function controlledFollowUpDisplay() {
  return PRICING.controlledFollowUp.display;
}

/**
 * Replace authoring tokens with live prices.
 * Supported:
 *   {{pricing.initialEvaluation}}
 *   {{pricing.nonControlledFollowUp}}
 *   {{pricing.controlledFollowUp}}
 *   <!-- SIYA:PRICE:INITIAL_EVAL -->
 */
const WRAPPED_INITIAL_EVAL_PLACEHOLDER = '___SIYA_WRAPPED_INITIAL_EVAL___';
const MONTHLY_149_SPAN_PLACEHOLDER = '___SIYA_MONTHLY_149_SPAN___';
const MONTHLY_149_PLAIN_PLACEHOLDER = '___SIYA_MONTHLY_149_PLAIN___';

/** Bold initial-evaluation $149 in visible body copy; skip scripts and controlled follow-up $149/month. */
export function wrapInitialEvaluationPrices(html) {
  if (!html || !html.includes('$149')) return html;
  const wrapped = renderInitialEvaluationPrice();
  const bodyMatch = html.match(/(<body[^>]*>)([\s\S]*)(<\/body>)/i);
  if (!bodyMatch) return html;

  const processSegment = (segment) => {
    let s = segment;
    s = s.replace(
      /<span class="siya-price siya-price--initial-evaluation"[^>]*>\$149<\/span>/g,
      WRAPPED_INITIAL_EVAL_PLACEHOLDER,
    );
    s = s.replace(/\$149<span>\/month<\/span>/g, MONTHLY_149_SPAN_PLACEHOLDER);
    s = s.replace(/\$149\/month/g, MONTHLY_149_PLAIN_PLACEHOLDER);
    s = s.replace(/\$149/g, wrapped);
    s = s.replaceAll(MONTHLY_149_SPAN_PLACEHOLDER, '$149<span>/month</span>');
    s = s.replaceAll(MONTHLY_149_PLAIN_PLACEHOLDER, '$149/month');
    s = s.replaceAll(WRAPPED_INITIAL_EVAL_PLACEHOLDER, wrapped);
    return s;
  };

  const parts = bodyMatch[2].split(/(<script[\s\S]*?<\/script>)/gi);
  const processedBody = parts
    .map((part) => (/^<script/i.test(part) ? part : processSegment(part)))
    .join('');

  return html.replace(bodyMatch[0], `${bodyMatch[1]}${processedBody}${bodyMatch[3]}`);
}

export function applyPricingTokens(html) {
  if (!html) return html;
  return wrapInitialEvaluationPrices(
    html
      .replaceAll('{{pricing.initialEvaluation}}', PRICING.initialEvaluation.display)
      .replaceAll('{{pricing.nonControlledFollowUp}}', PRICING.nonControlledFollowUp.display)
      .replaceAll('{{pricing.controlledFollowUp}}', PRICING.controlledFollowUp.display)
      .replaceAll('<!-- SIYA:PRICE:INITIAL_EVAL -->', renderInitialEvaluationPrice())
      .replaceAll('<!--SIYA:PRICE:INITIAL_EVAL-->', renderInitialEvaluationPrice()),
  );
}
