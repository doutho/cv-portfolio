/* Local interactions: copy controls and project navigation. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
  }
  async function copy(text, success) {
    try { await navigator.clipboard.writeText(text); toast(success); }
    catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.style.cssText = 'position:fixed;top:-1000px;left:0';
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand('copy');
      field.remove();
      toast(ok ? success : 'Copy unavailable. Select and copy the text directly.');
    }
  }
  $('#copy-email')?.addEventListener('click', () => copy('jonathanthomson.arbete@gmail.com', 'Email address copied'));
  $('.copy-template')?.addEventListener('click', () => {
    const heading = $('h1').textContent;
    const body = [...document.querySelectorAll('.project-outline > div')].map(row => `## ${row.querySelector('dt').textContent}\n${row.querySelector('dd').textContent}`).join('\n\n');
    copy(`# ${heading}\n\n${body}\n`, 'Project outline copied');
  });
  const projectLinks = [...document.querySelectorAll('[data-project-link]')];
  if (!projectLinks.length) return;
  // A visual transition; project pages are ordinary, directly accessible URLs.
  const loader = document.createElement('div');
  loader.className = 'epoch-loader';
  loader.hidden = true;
  loader.innerHTML = '<div class="epoch-content"><p class="epoch-heading" role="status">Opening project</p><div class="epoch-status"><span class="epoch-count"></span><span class="epoch-percent" aria-hidden="true">0%</span></div><div class="epoch-track" role="progressbar" aria-label="Project loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="epoch-fill"></div></div><p class="epoch-destination"></p></div>';
  document.body.appendChild(loader);
  const count = loader.querySelector('.epoch-count');
  const percent = loader.querySelector('.epoch-percent');
  const track = loader.querySelector('.epoch-track');
  const fill = loader.querySelector('.epoch-fill');
  const workspace = $('.workspace');
  let navigating = false;
  let frame;
  let previousOverflow = '';
  function resetLoader() {
    cancelAnimationFrame(frame);
    if (navigating) document.body.style.overflow = previousOverflow;
    navigating = false;
    loader.hidden = true;
    workspace.inert = false;
    fill.style.width = '0%';
  }
  window.addEventListener('pageshow', resetLoader);
  projectLinks.forEach(link => link.addEventListener('click', event => {
    // Preserve modified clicks and native links for reduced-motion visitors.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    const total = 3 + Math.floor(Math.random() * 3);
    const duration = 450 + total * 75;
    const destination = link.href;
    loader.querySelector('.epoch-destination').textContent = link.dataset.projectTitle || link.textContent.trim();
    count.textContent = `Epoch 1 / ${total}`;
    percent.textContent = '0%';
    track.setAttribute('aria-valuenow', '0');
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    workspace.inert = true;
    loader.hidden = false;
    let started;
    function advance(now) {
      if (started === undefined) started = now;
      const progress = Math.min((now - started) / duration, 1);
      const value = Math.round(progress * 100);
      count.textContent = `Epoch ${Math.min(total, 1 + Math.floor(progress * total))} / ${total}`;
      percent.textContent = `${value}%`;
      fill.style.width = `${progress * 100}%`;
      track.setAttribute('aria-valuenow', String(value));
      if (progress < 1) frame = requestAnimationFrame(advance);
      else window.location.assign(destination);
    }
    frame = requestAnimationFrame(advance);
  }));
})();
