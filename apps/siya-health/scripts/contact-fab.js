/**
 * Floating contact choice: Facebook Messenger + Secure Medical Chat.
 * LeadConnector widget remains optional; Messenger is the primary social chat CTA.
 */
(function () {
  if (document.getElementById('siya-contact-fab')) return;
  var fab = document.createElement('div');
  fab.id = 'siya-contact-fab';
  fab.className = 'siya-contact-fab';
  fab.setAttribute('role', 'navigation');
  fab.setAttribute('aria-label', 'Quick contact');
  fab.innerHTML =
    '<a class="siya-contact-fab__btn siya-contact-fab__btn--messenger" href="https://m.me/siyahealthofficial" target="_blank" rel="noopener noreferrer" data-siya-track="facebook_messenger_click" aria-label="Message us on Facebook Messenger">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17V22l3.05-1.67c.95.26 1.95.4 2.99.4 5.64 0 10.18-4.13 10.18-9.7C21.36 6.13 17.64 2 12 2zm1.01 13.06l-2.61-2.79-5.09 2.79 5.6-5.95 2.67 2.79 5.03-2.79-5.6 5.95z"/></svg>' +
    '<span>Messenger</span></a>' +
    '<a class="siya-contact-fab__btn siya-contact-fab__btn--chat" href="/redirect/chat" data-siya-track="secure_chat_click" data-siya-location="contact-fab" aria-label="Start secure medical chat">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>' +
    '<span>Secure Chat</span></a>';
  document.body.appendChild(fab);
})();
