// ==========================================================================
// Book-Flip Portfolio — Application Controller (v3: Robust & Integrated)
// Handles slide-left/right page transitions, content rendering,
// keyboard/swipe navigation, project filters, blog modal, copy badges.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_PAGES = 8;
  let currentPage = 0;
  let isTransitioning = false;
  const SLIDE_DURATION = 500; // must match CSS --slide-duration

  const book = document.getElementById('book');
  const pages = document.querySelectorAll('.book-page');
  const navPills = document.querySelectorAll('.nav-pill');
  const pageShadow = document.getElementById('page-shadow');

  // ══════════════════════════════════════════════════════════════
  // WEB AUDIO DUAL-LAYER PAPER FLIP SYNTHESIZER
  // ══════════════════════════════════════════════════════════════
  let audioCtx = null;

  function playPaperSlideSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      // Layer 1: High-frequency friction swish (paper rustle)
      const duration1 = 0.12;
      const buf1 = audioCtx.createBuffer(1, audioCtx.sampleRate * duration1, audioCtx.sampleRate);
      const d1 = buf1.getChannelData(0);
      for (let i = 0; i < d1.length; i++) {
        d1[i] = (Math.random() * 2 - 1) * Math.sin((i / d1.length) * Math.PI);
      }
      const noise1 = audioCtx.createBufferSource();
      noise1.buffer = buf1;

      const filter1 = audioCtx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(2400, now);
      filter1.frequency.exponentialRampToValueAtTime(1100, now + duration1);
      filter1.Q.value = 1.8;

      const gain1 = audioCtx.createGain();
      gain1.gain.setValueAtTime(0.14, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + duration1);

      noise1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(audioCtx.destination);
      noise1.start(now);

      // Layer 2: Soft paper drop thud (low-mid resonance)
      const duration2 = 0.08;
      const osc = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now + 0.035);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.035 + duration2);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.06, now + 0.035);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.035 + duration2);

      osc.connect(gain2);
      gain2.connect(audioCtx.destination);

      osc.start(now + 0.035);
      osc.stop(now + 0.035 + duration2);
    } catch (e) {
      // AudioContext fallback
    }
  }

  // ══════════════════════════════════════════════════════════════
  // SLIDE TRANSITION ENGINE
  // ══════════════════════════════════════════════════════════════

  function slideTo(targetIndex) {
    if (isTransitioning || targetIndex === currentPage) return;
    if (targetIndex < 0 || targetIndex >= TOTAL_PAGES) return;

    isTransitioning = true;
    playPaperSlideSound();

    const forward = targetIndex > currentPage;
    const currentEl = pages[currentPage];
    const targetEl = pages[targetIndex];

    // Trigger shadow sweep
    pageShadow.classList.add('sweeping');

    // Current page slides out
    currentEl.classList.add(forward ? 'slide-out-left' : 'slide-out-right');

    // Target page slides in
    setTimeout(() => {
      targetEl.classList.add(forward ? 'slide-in-right' : 'slide-in-left');
      targetEl.style.display = 'flex';
    }, 60);

    // Cleanup after animation
    setTimeout(() => {
      currentEl.classList.remove('active', 'slide-out-left', 'slide-out-right');
      currentEl.style.display = '';

      targetEl.classList.remove('slide-in-right', 'slide-in-left');
      targetEl.classList.add('active');

      pageShadow.classList.remove('sweeping');

      const scrollable = targetEl.querySelector('.page-right');
      if (scrollable) scrollable.scrollTop = 0;

      updateNavbar(targetIndex);
      currentPage = targetIndex;
      isTransitioning = false;
    }, SLIDE_DURATION + 40);
  }

  function updateNavbar(index) {
    if (!navPills || !navPills.length) return;
    navPills.forEach(p => p.classList.remove('active'));
    if (navPills[index]) {
      navPills[index].classList.add('active');
      navPills[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // Navbar click handlers
  navPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const target = parseInt(pill.dataset.page, 10);
      slideTo(target);
    });
  });

  // Page arrow click handlers (top-right ‹ › buttons)
  document.querySelectorAll('.page-arrow').forEach(arrow => {
    arrow.addEventListener('click', () => {
      if (arrow.dataset.dir === 'next') {
        slideTo(currentPage + 1);
      } else {
        slideTo(currentPage - 1);
      }
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const articleModal = document.getElementById('article-modal');
    const contactModal = document.getElementById('contact-modal');
    const lightboxModal = document.getElementById('image-lightbox');
    if ((articleModal && articleModal.classList.contains('open')) ||
        (contactModal && contactModal.classList.contains('open')) ||
        (lightboxModal && lightboxModal.classList.contains('open'))) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      slideTo(currentPage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      slideTo(currentPage - 1);
    }
  });

  // Touch swipe detection
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 50;

  if (book) {
    book.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    book.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;

      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) slideTo(currentPage + 1);
        else slideTo(currentPage - 1);
      }
    }, { passive: true });
  }

  // ══════════════════════════════════════════════════════════════
  // CONTENT RENDERERS
  // ══════════════════════════════════════════════════════════════

  // ── PAGE 1: HEADLINE ──
  function renderHeadline() {
    const d = portfolioData.headline;
    if (!d) return;

    const elGreeting = document.getElementById('hero-greeting');
    const elName = document.getElementById('hero-name');
    const elTagline = document.getElementById('hero-tagline');
    const elBio = document.getElementById('hero-bio');
    const elPhoto = document.getElementById('hero-photo');

    if (elGreeting) elGreeting.textContent = d.greeting;
    if (elName) elName.textContent = d.name;
    if (elTagline) elTagline.textContent = d.tagline;
    if (elBio) elBio.textContent = d.bio;
    if (elPhoto) elPhoto.src = d.photoUrl;

    const badgesContainer = document.getElementById('hero-badges');
    if (badgesContainer) {
      badgesContainer.innerHTML = `
        <div style="display:flex; gap:10px; flex-wrap:wrap; width:100%;">
          <a class="copy-pill action-pill" href="resume.html" target="_blank" id="download-resume-btn" title="View & Download Resume PDF">
            <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            Resume (PDF)
          </a>
        </div>
        <div style="width:100%; margin-top:2px;">
          <div class="copy-pill" data-copy="${escHtml(d.email)}" title="Click to copy email">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
            ${escHtml(d.email)}
            <svg class="copy-symbol-icon" viewBox="0 0 24 24" style="width:14px; height:14px; opacity:0.75; margin-left:6px; fill:currentColor;"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            <span class="toast">Copied!</span>
          </div>
        </div>
      `;
    }

    const socialsContainer = document.getElementById('hero-socials');
    if (socialsContainer) {
      socialsContainer.innerHTML = `
        <a class="social-badge" href="${d.github}" target="_blank" rel="noopener" title="GitHub Profile">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855v2.751c0 .278.168.586.682.486C19.137 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
          <span>GitHub</span>
        </a>
        <a class="social-badge" href="${d.linkedin}" target="_blank" rel="noopener" title="LinkedIn Profile">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
          <span>LinkedIn</span>
        </a>
      `;
    }


  }

  // ── PAGE 2: ABOUT ──
  function renderAbout() {
    const d = portfolioData.about;
    if (!d) return;

    const container = document.getElementById('about-content');
    if (container) {
      container.innerHTML = d.paragraphs.map(p => `<p class="grid-paragraph">${escHtml(p)}</p>`).join('');
    }

    const metaContainer = document.getElementById('about-meta');
    if (metaContainer) metaContainer.innerHTML = '';
  }

  // ── PAGE 3: FEATURED ──
  function renderFeatured() {
    const container = document.getElementById('featured-content');
    if (!container || !portfolioData.featured) return;

    if (!portfolioData.featured.length) {
      container.innerHTML = cookingPlaceholder('Featured Work');
      return;
    }

    container.innerHTML = portfolioData.featured.map(f => `
      <div class="note-card featured-card">
        <div class="featured-subtitle">${escHtml(f.subtitle)}</div>
        <h3>${escHtml(f.title)}</h3>
        <p style="margin:8px 0;">${escHtml(f.description)}</p>
        <div class="tags-row">${f.tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
      </div>
    `).join('');
  }

  // ── PAGE 4: EXPERIENCE ──
  function renderExperience() {
    const container = document.getElementById('experience-content');
    if (!container || !portfolioData.experience) return;

    container.innerHTML = portfolioData.experience.map(exp => {
      let bulletsHtml = '';
      if (exp.bullets && exp.bullets.length > 0) {
        bulletsHtml = `<ul class="tl-bullets">${exp.bullets.map(b => `<li>${escHtml(b)}</li>`).join('')}</ul>`;
      }

      let descHtml = '';
      if (exp.description) {
        descHtml = `<p class="exp-desc" style="margin: 8px 0; font-size:0.9rem; line-height:1.4;">${escHtml(exp.description)}</p>`;
      }

      let projectsHtml = '';
      if (exp.projects && exp.projects.length > 0) {
        projectsHtml = `
          <div class="exp-projects-list">
            ${exp.projects.map(proj => `
              <div class="exp-project-pill" data-project-id="${escHtml(proj.id)}">
                <div class="exp-project-pill-text">
                  <div class="exp-project-pill-title">${escHtml(proj.title)}</div>
                  <div class="exp-project-pill-sub">${escHtml(proj.subtitle)}</div>
                </div>
                <button class="action-pill view-project-btn" data-project-id="${escHtml(proj.id)}">View ↗</button>
              </div>
            `).join('')}
          </div>
        `;
      }

      let skillsHtml = '';
      if (exp.skills && exp.skills.length > 0) {
        skillsHtml = `<div class="exp-skills-row" style="margin-top:12px; font-size:0.82rem; font-weight:600; color:var(--text-teal);">Skills: ${exp.skills.map(s => escHtml(s)).join(', ')}</div>`;
      }

      return `
        <div class="tl-item">
          <div class="tl-dot"></div>
          <div class="tl-header">
            <h3>${escHtml(exp.role)}</h3>
            <span class="tl-period">${escHtml(exp.period)}</span>
          </div>
          <div class="tl-company">${escHtml(exp.company)} — ${escHtml(exp.location)}</div>
          ${descHtml}
          ${bulletsHtml}
          ${projectsHtml}
          ${skillsHtml}
        </div>
      `;
    }).join('');

    container.querySelectorAll('.exp-project-pill, .view-project-btn').forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.stopPropagation();
        const projId = elem.getAttribute('data-project-id');
        openProjectModal(projId);
      });
    });
  }

  function openProjectModal(projId) {
    let targetProj = null;
    portfolioData.experience.forEach(exp => {
      if (exp.projects) {
        const found = exp.projects.find(p => p.id === projId);
        if (found) targetProj = found;
      }
    });
    if (!targetProj) return;

    const articleModal = document.getElementById('article-modal');
    const headerText = document.getElementById('modal-header-text');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalContent = document.getElementById('modal-content');

    if (headerText) headerText.textContent = 'Project Overview';
    if (modalTitle) modalTitle.textContent = targetProj.title;
    if (modalMeta) modalMeta.textContent = targetProj.subtitle;
    if (modalContent) {
      modalContent.innerHTML = `
        <div class="modal-project-view">
          <div class="modal-project-banner">
            <img src="${escHtml(targetProj.imageUrl)}" alt="${escHtml(targetProj.title)}" />
          </div>
          <ul class="modal-project-details">
            ${targetProj.details.map(d => `<li>${escHtml(d)}</li>`).join('')}
          </ul>
          <div class="modal-project-footer">
            <a href="${escHtml(targetProj.liveUrl)}" target="_blank" rel="noopener" class="copy-pill action-pill modal-live-btn">
              Live Link ↗
            </a>
          </div>
        </div>
      `;
    }
    if (articleModal) articleModal.classList.add('open');
  }

  // ── PAGE 5: EDUCATION (with sub-tabs) ──
  function renderEducation() {
    const container = document.getElementById('education-content');
    if (!container || !portfolioData.education) return;

    container.innerHTML = portfolioData.education.map(edu => `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-header">
          <h3>${escHtml(edu.degree)}</h3>
          <span class="tl-period">${escHtml(edu.period)}</span>
        </div>
        <div class="tl-company">${escHtml(edu.institution)} — ${escHtml(edu.location)}</div>
        <p style="font-size:0.9rem; margin-top:4px;">${escHtml(edu.note)}</p>
      </div>
    `).join('');

    // Ensure Degree tab is always the default on render
    const eduEl = document.getElementById('education-content');
    const coursesEl = document.getElementById('courses-content');
    if (eduEl) eduEl.style.display = '';
    if (coursesEl) coursesEl.style.display = 'none';
    document.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
    const degreeTab = document.querySelector('[data-tab="degrees"]');
    if (degreeTab) degreeTab.classList.add('active');

    // Wire up sub-tabs — scoped to [data-tab] only, not project tabs
    document.querySelectorAll('[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const which = tab.dataset.tab;
        if (which === 'degrees') {
          if (eduEl) eduEl.style.display = '';
          if (coursesEl) coursesEl.style.display = 'none';
        } else {
          if (eduEl) eduEl.style.display = 'none';
          if (coursesEl) coursesEl.style.display = '';
        }
      });
    });
  }

  // ── PAGE 6: SKILLS ──
  function renderSkills() {
    const container = document.getElementById('skills-content');
    if (!container || !portfolioData.skills) return;

    container.innerHTML = portfolioData.skills.map(cat => `
      <div class="note-card">
        <div class="skill-cat-title">${escHtml(cat.category)}</div>
        <div class="tags-row">${cat.items.map(s => `<span class="tag">${escHtml(s)}</span>`).join('')}</div>
      </div>
    `).join('');
  }

  // ── PAGE 7: PROJECTS (two tabs: Actual Campus Builds + The Sandbox) ──
  function renderProjectCard(proj) {
    const isSandbox = (proj.ecosystems && proj.ecosystems.length) || (proj.gallery && proj.gallery.length);

    let linksHtml = '';
    if (proj.links && proj.links.length) {
      linksHtml = `<div class="proj-card-links">${proj.links.map(l => {
        if (l.action === 'openModal') {
          return `<button class="copy-pill action-pill proj-link-btn open-sandbox-modal-btn" data-proj-id="${escHtml(l.modalId || proj.id)}">${escHtml(l.label)} ↗</button>`;
        }
        return `<a class="copy-pill action-pill proj-link-btn" href="${escHtml(l.url)}" target="_blank" rel="noopener">${escHtml(l.label)} ↗</a>`;
      }).join('')}</div>`;
    }

    const descHtml = proj.description
      ? `<p class="proj-card-desc">${escHtml(proj.description)}</p>` : '';

    const badgeHtml = proj.badge
      ? `<span class="proj-vibe-badge">${escHtml(proj.badge)}</span>` : '';

    // If it's a Sandbox showcase project like Beam Cast, render ecosystem tags!
    let sandboxExtras = '';
    if (isSandbox) {
      const ecoPills = (proj.ecosystems || []).map(eco => `
        <span class="eco-tag-pill">${getSystemIcon(eco.iconType || 'mobile', 13)} ${escHtml(eco.name)}</span>
      `).join('');

      sandboxExtras = `<div class="sandbox-eco-strip">${ecoPills}</div>`;
    }

    return `
      <div class="proj-card-large ${isSandbox ? 'sandbox-proj-card' : ''}" data-proj-id="${escHtml(proj.id || '')}">
        <div class="proj-card-top">
          <div class="proj-card-title-row">
            <h3 class="proj-card-title">${escHtml(proj.title)}</h3>
          </div>
          ${proj.subtitle ? `<div class="proj-card-sub">${escHtml(proj.subtitle)}</div>` : ''}
        </div>
        ${descHtml}
        ${sandboxExtras}
        <div class="tags-row">${(proj.tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
        ${linksHtml}
      </div>
    `;
  }

  function renderProjects() {
    const actualEl = document.getElementById('actual-projects-content');
    const whiteboardEl = document.getElementById('whiteboard-projects-content');
    if (!actualEl || !whiteboardEl) return;

    const actualIntro = `
      <div class="proj-section-intro">
        <p class="proj-intro-text">
          Built under deadlines, with teammates, inside classrooms and college corridors.
          These are the projects where I learned what it actually means to ship something as a team —
          not just write code, but coordinate, commit, and deliver.
        </p>
      </div>
    `;

    const whiteboardIntro = `
      <div class="proj-section-intro">
        <p class="proj-intro-text">
          No assignment. No rubric. No one asked me to.
          These exist because something annoyed me enough to fix it —
          built with curiosity, AI tools, and zero gatekeeping.
          The logic is mine to know. The result is everyone's to use.
        </p>
      </div>
    `;

    // Actual / Campus Builds
    if (!portfolioData.actualProjects || !portfolioData.actualProjects.length) {
      actualEl.innerHTML = actualIntro + cookingPlaceholder('Campus Builds');
    } else {
      actualEl.innerHTML = actualIntro + `<div class="projects-grid-large">${portfolioData.actualProjects.map(renderProjectCard).join('')}</div>`;
    }

    // Whiteboard / The Sandbox
    if (!portfolioData.whiteboardProjects || !portfolioData.whiteboardProjects.length) {
      whiteboardEl.innerHTML = whiteboardIntro + cookingPlaceholder('The Sandbox');
    } else {
      whiteboardEl.innerHTML = whiteboardIntro + `<div class="projects-grid-large">${portfolioData.whiteboardProjects.map(renderProjectCard).join('')}</div>`;
    }

    // Attach click events for Sandbox interactive triggers
    const attachSandboxEvents = () => {
      document.querySelectorAll('.open-sandbox-modal-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const projId = el.getAttribute('data-proj-id');
          const proj = (portfolioData.whiteboardProjects || []).find(p => p.id === projId);
          if (proj) openSandboxModal(proj);
        });
      });

      document.querySelectorAll('.sandbox-proj-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('a, button')) return;
          const projId = card.getAttribute('data-proj-id');
          const proj = (portfolioData.whiteboardProjects || []).find(p => p.id === projId);
          if (proj) openSandboxModal(proj);
        });
      });
    };
    attachSandboxEvents();

    // Wire up sub-tabs
    document.querySelectorAll('#project-tabs .edu-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#project-tabs .edu-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const which = tab.dataset.ptab;
        if (which === 'actual') {
          actualEl.style.display = '';
          whiteboardEl.style.display = 'none';
        } else {
          actualEl.style.display = 'none';
          whiteboardEl.style.display = '';
        }
      });
    });
  }

  // ── COURSES ──
  function renderCourses() {
    const container = document.getElementById('courses-content');
    if (!container || !portfolioData.courses) return;

    if (!portfolioData.courses.length) {
      container.innerHTML = cookingPlaceholder('Courses & Certifications');
      return;
    }

    container.innerHTML = portfolioData.courses.map(c => `
      <div class="note-card">
        <h3>${escHtml(c.title)}</h3>
        <div class="tl-company" style="margin:4px 0;">${escHtml(c.issuer)}</div>
        <span class="tl-period">${escHtml(c.date)}</span>
        <div class="tags-row">${(c.skills || c.tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
      </div>
    `).join('');
  }

  // ── INK & IDLE BLOG ──
  function renderBlog() {
    const d = portfolioData.blog || portfolioData.inkAndIdle;
    if (!d) return;

    const subtextEl = document.getElementById('blog-subtext');
    if (subtextEl) subtextEl.textContent = d.subtext;

    const container = document.getElementById('blog-content');
    if (!container) return;

    if (!d.posts || !d.posts.length) {
      if (subtextEl) subtextEl.textContent = '';
      container.innerHTML = cookingPlaceholder('Brain Dump');
      return;
    }

    container.innerHTML = d.posts.map(post => `
      <div class="note-card blog-row" data-post-id="${escHtml(post.id)}">
        <div>
          <h3 style="margin-bottom:3px;">${escHtml(post.title)}</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">${escHtml(post.summary || post.excerpt)}</p>
          <div style="margin-top:6px;">
            <span class="tag">${escHtml(post.topic)}</span>
            <span class="tl-period" style="margin-left:8px;">${escHtml(post.date)} · ${escHtml(post.readTime)}</span>
          </div>
        </div>
        <span class="blog-read-link">Read →</span>
      </div>
    `).join('');

    container.querySelectorAll('.blog-row').forEach(row => {
      row.addEventListener('click', () => {
        const postId = row.dataset.postId;
        const post = d.posts.find(p => p.id === postId);
        if (post) openArticleModal(post);
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ARTICLE & SHOWCASE MODALS
  // ══════════════════════════════════════════════════════════════
  const modal = document.getElementById('article-modal');
  const modalClose = document.getElementById('modal-close');

  function openArticleModal(post) {
    if (!modal) return;
    const modalWindow = modal.querySelector('.modal-window');
    if (modalWindow) modalWindow.classList.remove('modal-window-showcase');

    const headerText = document.getElementById('modal-header-text');
    if (headerText) headerText.textContent = 'Brain Dump — Article';
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    if (modalTitle) {
      modalTitle.style.display = '';
      modalTitle.textContent = post.title;
    }
    if (modalMeta) {
      modalMeta.style.display = '';
      modalMeta.textContent = `${post.date}  ·  ${post.readTime}  ·  ${post.topic}`;
    }

    const htmlContent = (post.content || '')
      .replace(/### (.+)/g, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    document.getElementById('modal-content').innerHTML = `<p>${htmlContent}</p>`;

    modal.classList.add('open');
  }

  // ── Professional Vector System Icons (No Emojis) ──
  function getSystemIcon(name, size = 14) {
    const s = size;
    switch (name) {
      case 'mobile':
        return `<svg class="svg-inline-icon" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>`;
      case 'web':
        return `<svg class="svg-inline-icon" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>`;
      case 'cast':
        return `<svg class="svg-inline-icon" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><line x1="2" y1="20" x2="2.01" y2="20"/></svg>`;
      case 'bolt':
        return `<svg class="svg-inline-icon" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>`;
      case 'shield':
        return `<svg class="svg-inline-icon" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`;
      case 'cpu':
        return `<svg class="svg-inline-icon" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>`;
      case 'clock':
        return `<svg class="svg-inline-icon" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;
      case 'gallery':
        return `<svg class="svg-inline-icon" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
      case 'layers':
        return `<svg class="svg-inline-icon" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`;
      default:
        return '';
    }
  }

  // ── Open Sandbox Project Interactive Showcase Modal (Playstore / Ecosystem Theme) ──
  function openSandboxModal(proj) {
    if (!modal) return;
    const modalWindow = modal.querySelector('.modal-window');
    if (modalWindow) modalWindow.classList.add('modal-window-showcase');

    const headerText = document.getElementById('modal-header-text');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalContent = document.getElementById('modal-content');

    if (headerText) headerText.textContent = 'The Sandbox · Project Showcase';
    // Hide default modal title/meta to avoid duplicate headers in showcase view
    if (modalTitle) modalTitle.style.display = 'none';
    if (modalMeta) modalMeta.style.display = 'none';

    const galleryList = proj.gallery || [];
    let activeGalleryIdx = 0;

    // Tabs HTML for Interactive Screen Switcher
    const tabsHtml = galleryList.map((g, idx) => `
      <button class="ps-showcase-tab ${idx === 0 ? 'active' : ''}" data-tab-idx="${idx}" type="button">
        <span class="ps-tab-num">${idx + 1}</span>
        <span class="ps-tab-text">${escHtml(g.tabLabel || g.tag || g.title)}</span>
      </button>
    `).join('');

    // Dots HTML
    const dotsHtml = galleryList.map((_, idx) => `
      <span class="ps-stage-dot ${idx === 0 ? 'active' : ''}" data-dot-idx="${idx}"></span>
    `).join('');

    const initialItem = galleryList[0] || { url: '', title: '', desc: '', tag: '' };

    // Ecosystems HTML
    const ecoHtml = (proj.ecosystems || []).map(eco => `
      <div class="ps-eco-box ${escHtml(eco.id || '')}">
        <div class="ps-eco-header">
          <div class="ps-eco-title-row">
            <span class="ps-eco-icon-badge">${getSystemIcon(eco.iconType || 'mobile', 18)}</span>
            <span class="ps-eco-title">${escHtml(eco.name)}</span>
          </div>
          <div class="ps-eco-sub">${escHtml(eco.tagline || '')}</div>
        </div>
        <ul class="ps-feature-list">
          ${(eco.features || []).map(f => `
            <li>
              <div class="ps-feat-head"><span class="ps-feat-bullet">▸</span> <strong>${escHtml(f.title)}</strong></div>
              <p class="ps-feat-desc">${escHtml(f.desc)}</p>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    if (modalContent) {
      modalContent.innerHTML = `
        <div class="playstore-modal-view">
          
          <!-- Unified Clean App Header (Theme Matched & Properly Aligned) -->
          <div class="ps-header-unified">
            <div class="ps-title-row">
              <span class="ps-app-icon-badge">${getSystemIcon('cast', 20)}</span>
              <div class="ps-app-name">${escHtml(proj.title)}</div>
            </div>
            
            ${proj.subtitle ? `<div class="ps-app-sub">${escHtml(proj.subtitle)}</div>` : ''}

            <div class="ps-badges-strip">
              <span class="ps-badge-pill">${getSystemIcon('bolt', 12)} Peer-to-Peer</span>
              <span class="ps-badge-pill">${getSystemIcon('shield', 12)} Zero-Cloud Sync</span>
              <span class="ps-badge-pill">${getSystemIcon('cpu', 12)} Native Capture</span>
              <span class="ps-badge-pill">${getSystemIcon('clock', 12)} &lt; 35ms Latency</span>
            </div>
          </div>

          <p class="ps-lead-desc">${escHtml(proj.description)}</p>

          <!-- Interactive Showcase Section (Tabbed Screen Switcher) -->
          <div class="ps-showcase-section">
            <div class="ps-section-header">
              <div class="ps-sec-title-group">
                <span class="ps-sec-icon">${getSystemIcon('gallery', 16)}</span>
                <span class="ps-section-title">Visual Demonstration</span>
              </div>
            </div>

            <!-- Segmented Screen Tabs (Desktop) -->
            <div class="ps-showcase-tabs" id="ps-showcase-tabs">
              ${tabsHtml}
            </div>

            <!-- Main Showcase Display Frame with Overlay Arrows -->
            <div class="ps-showcase-stage">
              <div class="ps-screen-frame" id="ps-screen-frame" title="Click to open high-resolution viewer">
                <img id="ps-active-img" src="${escHtml(initialItem.url)}" alt="${escHtml(initialItem.title)}" />
                <div class="ps-stage-badge" id="ps-stage-badge">${escHtml(initialItem.tag || 'Preview')}</div>
                <button class="ps-stage-enlarge-btn" id="ps-stage-enlarge-btn" type="button" title="View Fullscreen in HD">
                  ${getSystemIcon('gallery', 12)}
                  <span>HD</span>
                </button>
                <button class="ps-frame-arrow ps-frame-prev" id="ps-stage-prev" type="button" aria-label="Previous view">‹</button>
                <button class="ps-frame-arrow ps-frame-next" id="ps-stage-next" type="button" aria-label="Next view">›</button>
              </div>

              <!-- Navigation bar below stage -->
              <div class="ps-stage-nav-bar">
                <span class="ps-stage-counter" id="ps-stage-counter">1 of ${galleryList.length}</span>
                <div class="ps-stage-dots" id="ps-stage-dots">
                  ${dotsHtml}
                </div>
              </div>
            </div>

            <!-- Active Screen Explanation Card -->
            <div class="ps-screen-info-card" id="ps-screen-info-card">
              <h4 class="ps-screen-title" id="ps-screen-title">${escHtml(initialItem.title)}</h4>
              <p class="ps-screen-desc" id="ps-screen-desc">${escHtml(initialItem.desc)}</p>
            </div>
          </div>

          <!-- Dual Ecosystem Feature Breakdown -->
          <div class="ps-ecosystems-section">
            <div class="ps-section-header">
              <div class="ps-sec-title-group">
                <span class="ps-sec-icon">${getSystemIcon('layers', 16)}</span>
                <span class="ps-section-title">Ecosystem Breakdown & Core Capabilities</span>
              </div>
            </div>

            <div class="ps-ecosystems-grid">
              ${ecoHtml}
            </div>
          </div>

          <!-- Under the Hood Tech Stack -->
          <div class="ps-tech-section">
            <div class="ps-tech-title">Architecture & Key Technologies</div>
            <div class="tags-row" style="margin-top:8px;">
              ${(proj.tags || []).map(t => `<span class="tag ps-tag">${escHtml(t)}</span>`).join('')}
            </div>
          </div>

        </div>
      `;
    }

    // Attach interactive screen switcher logic
    setTimeout(() => {
      const activeImg = document.getElementById('ps-active-img');
      const stageBadge = document.getElementById('ps-stage-badge');
      const screenTitle = document.getElementById('ps-screen-title');
      const screenDesc = document.getElementById('ps-screen-desc');
      const stageCounter = document.getElementById('ps-stage-counter');
      const tabBtns = modalContent ? modalContent.querySelectorAll('.ps-showcase-tab') : [];
      const dots = modalContent ? modalContent.querySelectorAll('.ps-stage-dot') : [];
      const prevBtn = document.getElementById('ps-stage-prev');
      const nextBtn = document.getElementById('ps-stage-next');
      const frame = document.getElementById('ps-screen-frame');
      const enlargeBtn = document.getElementById('ps-stage-enlarge-btn');

      const setGalleryView = (idx) => {
        if (!galleryList[idx]) return;
        activeGalleryIdx = idx;
        const cur = galleryList[idx];

        if (activeImg) {
          activeImg.style.opacity = '0.4';
          activeImg.src = cur.url;
          activeImg.alt = cur.title;
          setTimeout(() => { activeImg.style.opacity = '1'; }, 60);
        }
        if (stageBadge) stageBadge.textContent = cur.tag || 'Preview';
        if (screenTitle) screenTitle.textContent = cur.title;
        if (screenDesc) screenDesc.textContent = cur.desc;
        if (stageCounter) stageCounter.textContent = `${idx + 1} of ${galleryList.length}`;

        tabBtns.forEach((btn, bIdx) => {
          btn.classList.toggle('active', bIdx === idx);
        });
        dots.forEach((dot, dIdx) => {
          dot.classList.toggle('active', dIdx === idx);
        });
      };

      tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const idx = parseInt(btn.getAttribute('data-tab-idx'), 10);
          setGalleryView(idx);
        });
      });

      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.getAttribute('data-dot-idx'), 10);
          setGalleryView(idx);
        });
      });

      if (prevBtn) {
        prevBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const newIdx = (activeGalleryIdx - 1 + galleryList.length) % galleryList.length;
          setGalleryView(newIdx);
        };
      }

      if (nextBtn) {
        nextBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const newIdx = (activeGalleryIdx + 1) % galleryList.length;
          setGalleryView(newIdx);
        };
      }

      // Enlarge trigger for Lightbox
      const triggerLightbox = () => {
        if (galleryList[activeGalleryIdx]) {
          openLightbox(galleryList[activeGalleryIdx]);
        }
      };

      if (frame) frame.onclick = triggerLightbox;
      if (enlargeBtn) {
        enlargeBtn.onclick = (e) => {
          e.stopPropagation();
          triggerLightbox();
        };
      }
    }, 50);

    if (modal) modal.classList.add('open');
  }

  // ── LIGHTBOX CONTROLLER ──
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(item) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = item.url;
    lightboxImg.alt = item.title;
    if (lightboxTitle) lightboxTitle.textContent = item.title || 'Screenshot Preview';
    if (lightboxCaption) {
      const tagText = item.tag ? `<strong>[${escHtml(item.tag)}]</strong> ` : '';
      lightboxCaption.innerHTML = `${tagText}${escHtml(item.desc || item.title || '')}`;
    }
    lightbox.classList.add('open');
  }

  function closeLightbox() {
    if (lightbox) lightbox.classList.remove('open');
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      const mw = modal.querySelector('.modal-window');
      if (mw) mw.classList.remove('modal-window-showcase');
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('open')) {
        closeLightbox();
        return;
      }
      closeModal();
      if (contactModal) contactModal.classList.remove('open');
    }
  });

  // ══════════════════════════════════════════════════════════════
  // CONTACT MODAL EVENT HANDLERS
  // ══════════════════════════════════════════════════════════════
  const contactModal = document.getElementById('contact-modal');
  const contactClose = document.getElementById('contact-close');
  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-status');

  if (contactClose && contactModal) {
    contactClose.addEventListener('click', () => {
      contactModal.classList.remove('open');
    });
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) contactModal.classList.remove('open');
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      if (contactStatus) {
        contactStatus.style.display = 'block';
        contactStatus.innerHTML = `Thanks ${escHtml(name)}! Your note was received.`;
      }
      contactForm.reset();
      setTimeout(() => {
        if (contactModal) contactModal.classList.remove('open');
        if (contactStatus) contactStatus.style.display = 'none';
      }, 2500);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // COPY-TO-CLIPBOARD
  // ══════════════════════════════════════════════════════════════
  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.copy-pill:not(.action-pill)');
    if (!pill) return;
    const text = pill.dataset.copy;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      pill.classList.add('copied');
      setTimeout(() => pill.classList.remove('copied'), 1500);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      pill.classList.add('copied');
      setTimeout(() => pill.classList.remove('copied'), 1500);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // HOME PAGE INTERACTION: 3D PARALLAX TILT & STAMP
  // ══════════════════════════════════════════════════════════════
  const frame = document.getElementById('hero-frame');
  if (frame) {
    frame.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / rect.height) * 16;
      const rotateY = (x / rect.width) * 16;
      frame.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    frame.addEventListener('mouseleave', () => {
      frame.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });

    const stickyNote = frame.querySelector('.sticky-note');
    if (stickyNote) {
      const statuses = [
        '<span class="status-dot"></span> Available for Hire',
        '<span class="status-dot" style="background:#3B82F6;"></span> Open for Collaborations',
        '<span class="status-dot" style="background:#EC4899;"></span> Building Cool Products'
      ];
      let statusIdx = 0;
      stickyNote.style.cursor = 'pointer';
      stickyNote.title = 'Click to toggle status!';
      stickyNote.addEventListener('click', (e) => {
        e.stopPropagation();
        statusIdx = (statusIdx + 1) % statuses.length;
        stickyNote.style.transform = 'rotate(-4deg) scale(1.15)';
        setTimeout(() => {
          stickyNote.innerHTML = statuses[statusIdx];
          stickyNote.style.transform = 'rotate(3deg) scale(1)';
        }, 120);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // RIBBON BOOKMARK THEME SWITCHER
  // ══════════════════════════════════════════════════════════════
  const themes = ['', 'theme-blueprint', 'theme-darkink'];
  let currentThemeIdx = 0;

  function toggleTheme() {
    document.body.classList.remove('theme-blueprint', 'theme-darkink');
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    if (themes[currentThemeIdx]) {
      document.body.classList.add(themes[currentThemeIdx]);
    }
    playPaperSlideSound();
  }

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

  // ══════════════════════════════════════════════════════════════
  // UTILITY
  // ══════════════════════════════════════════════════════════════
  function escHtml(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function cookingPlaceholder(section) {
    return `
      <div class="cooking-placeholder">
        <div class="cooking-anim">
          <span class="c-dot"></span>
          <span class="c-dot"></span>
          <span class="c-dot"></span>
        </div>
        <div class="cooking-label">Something's Cooking</div>
        <div class="cooking-sub">${section} — coming soon.</div>
      </div>
    `;
  }

  // ══════════════════════════════════════════════════════════════
  // BOOT
  // ══════════════════════════════════════════════════════════════
  renderHeadline();
  renderAbout();
  renderFeatured();
  renderExperience();
  renderEducation();
  renderSkills();
  renderProjects();
  renderCourses();
  renderBlog();
});
