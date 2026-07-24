// ==========================================================================
// Book-Flip Portfolio — Application Controller (v3: Robust & Integrated)
// Handles slide-left/right page transitions, content rendering,
// keyboard/swipe navigation, project filters, blog modal, copy badges.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_PAGES = 9;
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
    if ((articleModal && articleModal.classList.contains('open')) || (contactModal && contactModal.classList.contains('open'))) return;

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
          <div style="border-radius:10px; overflow:hidden; border:2px solid var(--border-dark); margin-bottom:18px; box-shadow:4px 4px 0px rgba(14,10,66,0.15);">
            <img src="${escHtml(targetProj.imageUrl)}" alt="${escHtml(targetProj.title)}" style="width:100%; display:block; object-fit:cover;" />
          </div>
          <p style="font-weight:700; font-size:1.05rem; color:var(--text-navy); margin-bottom:12px;">${escHtml(targetProj.subtitle)}</p>
          <ul style="padding-left:20px; margin-bottom:24px; line-height:1.6;">
            ${targetProj.details.map(d => `<li style="margin-bottom:10px; color:var(--text-body);">${escHtml(d)}</li>`).join('')}
          </ul>
          <div style="margin-top:20px; padding-top:16px; border-top:1px dashed var(--border-light);">
            <a href="${escHtml(targetProj.liveUrl)}" target="_blank" rel="noopener" class="copy-pill action-pill" style="display:inline-flex; align-items:center; gap:8px; padding:10px 24px; text-decoration:none; border-radius:8px; font-weight:800; font-size:0.92rem;">
              Visit Live Festival Website ↗
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

    // Wire up sub-tabs
    document.querySelectorAll('.edu-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.edu-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const which = tab.dataset.tab;
        const eduEl = document.getElementById('education-content');
        const coursesEl = document.getElementById('courses-content');
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

  // ── PAGE 7: PROJECTS (with filter) ──
  let activeFilter = 'All';

  function renderProjects() {
    const filterBar = document.getElementById('project-filters');
    const grid = document.getElementById('projects-content');
    if (!filterBar || !grid || !portfolioData.projects) return;

    if (!portfolioData.projects.length) {
      filterBar.innerHTML = '';
      grid.innerHTML = cookingPlaceholder('Projects');
      return;
    }

    const categories = ['All', ...new Set(portfolioData.projects.map(p => p.category))];
    filterBar.innerHTML = categories.map(c =>
      `<button class="filter-chip${c === activeFilter ? ' active' : ''}" data-cat="${escHtml(c)}">${escHtml(c)}</button>`
    ).join('');

    filterBar.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.cat;
        renderProjects();
      });
    });

    const filtered = activeFilter === 'All'
      ? portfolioData.projects
      : portfolioData.projects.filter(p => p.category === activeFilter);

    grid.innerHTML = filtered.map(proj => `
      <div class="note-card">
        <h3>${escHtml(proj.title)}</h3>
        <p style="font-size:0.88rem; margin:6px 0;">${escHtml(proj.description)}</p>
        <div class="tags-row">${proj.tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
      </div>
    `).join('');
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
  // ARTICLE MODAL
  // ══════════════════════════════════════════════════════════════
  const modal = document.getElementById('article-modal');
  const modalClose = document.getElementById('modal-close');

  function openArticleModal(post) {
    if (!modal) return;
    const headerText = document.getElementById('modal-header-text');
    if (headerText) headerText.textContent = 'Brain Dump — Article';
    document.getElementById('modal-title').textContent = post.title;
    document.getElementById('modal-meta').textContent = `${post.date}  ·  ${post.readTime}  ·  ${post.topic}`;

    const htmlContent = (post.content || '')
      .replace(/### (.+)/g, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    document.getElementById('modal-content').innerHTML = `<p>${htmlContent}</p>`;

    modal.classList.add('open');
  }

  function closeModal() { if (modal) modal.classList.remove('open'); }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

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
