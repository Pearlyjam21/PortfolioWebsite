import { animate, stagger } from 'motion';

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const transitionGrid = qs('.transition-grid');
  const loader = qs('.site-loader');
  const transitionBlocks = [];
  let resetCursor = () => {};

  document.documentElement.classList.remove('no-js');

  if (transitionGrid) {
    for (let index = 0; index < 12; index += 1) {
      const block = document.createElement('span');
      transitionGrid.appendChild(block);
      transitionBlocks.push(block);
    }
  }

  qsa('[data-image]').forEach((card) => {
    const media = qs('.project-image,.board-card-image', card);
    if (media && !media.classList.contains('board-video') && !media.classList.contains('project-image-video')) {
      media.style.setProperty('--image', `url('${card.dataset.image}')`);
    }
  });

  const runWipe = (bright = false) => {
    if (!transitionBlocks.length || reduceMotion) return Promise.resolve();
    transitionGrid.classList.toggle('is-bright', bright);
    return animate(transitionBlocks, { scaleY: [0, 1, 0] }, {
      duration: 1.05,
      delay: stagger(0.035, { start: 0.02, from: 'first' }),
      ease: 'easeInOut'
    }).finished;
  };

  const enterPage = async () => {
    if (!loader) return;
    if (reduceMotion) {
      loader.remove();
      return;
    }
    const line = qs('.loader-line span', loader);
    await animate(line, { scaleX: 1 }, { duration: 0.85, ease: 'easeInOut' }).finished;
    await animate(loader, { opacity: 0, y: '-100%' }, { duration: 0.75, ease: 'easeInOut' }).finished;
    loader.remove();
  };

  const leavePage = async (url) => {
    resetCursor();
    if (reduceMotion) {
      window.location.href = url;
      return;
    }
    await runWipe(false);
    window.location.href = url;
  };

  enterPage().catch(() => loader?.remove());
  window.setTimeout(() => loader?.remove(), 4000);

  qsa('a[href$=".html"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || target.pathname === window.location.pathname) return;
      event.preventDefault();
      leavePage(target.href);
    });
  });

  const header = qs('.site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 32);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  qsa('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      if (reduceMotion || !window.gsap) return;
      const bounds = element.getBoundingClientRect();
      window.gsap.to(element, {
        x: (event.clientX - bounds.left - bounds.width / 2) * 0.12,
        y: (event.clientY - bounds.top - bounds.height / 2) * 0.12,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
    element.addEventListener('pointerleave', () => {
      window.gsap?.to(element, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)', overwrite: 'auto' });
    });
  });

  const cursorTargets = qsa('a,button,.project-card,.board-card');
  cursorTargets.forEach((element) => {
    if (element.dataset.cursorLabel) return;
    if (element.classList.contains('drawer-close')) element.dataset.cursorLabel = 'Close';
    else if (element.matches('[data-project]')) element.dataset.cursorLabel = 'Open';
    else if (element.matches('a[href^="mailto:"]')) element.dataset.cursorLabel = 'Send';
    else if (element.closest('.site-nav') || element.classList.contains('brand')) element.dataset.cursorLabel = 'Go';
    else element.dataset.cursorLabel = 'View';
  });
  qs('.workboard-viewport')?.setAttribute('data-cursor-label', 'Drag');

  const cursor = qs('.cursor');
  if (cursor && !reduceMotion && window.gsap && window.matchMedia('(pointer:fine) and (min-width:900px)').matches) {
    document.body.classList.add('cursor-ready');
    const cursorLabel = qs('.cursor-label', cursor);
    cursor.setAttribute('aria-hidden', 'true');
    cursorLabel.setAttribute('aria-hidden', 'true');
    const cursorX = window.gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power2.out' });
    const cursorY = window.gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power2.out' });
    const cursorRotation = window.gsap.quickTo(cursor, 'rotation', { duration: 0.42, ease: 'power3.out' });
    let activeTarget = null;
    const setCursorState = (target) => {
      const label = target?.dataset.cursorLabel || '';
      activeTarget = target || null;
      cursorLabel.textContent = label;
      cursor.classList.toggle('is-interactive', Boolean(label));
      cursor.classList.toggle('is-drag', label === 'Drag');
      cursor.classList.toggle('is-close', label === 'Close');
      cursorRotation(label === 'Drag' ? 8 : label === 'Close' ? 45 : 0);
    };
    resetCursor = () => setCursorState(null);
    window.addEventListener('pointermove', (event) => {
      cursorX(event.clientX);
      cursorY(event.clientY);
      cursor.classList.remove('is-hidden');
      const target = event.target.closest?.('[data-cursor-label]');
      if (target !== activeTarget) setCursorState(target);
    });
    document.addEventListener('mouseleave', () => {
      resetCursor();
      cursor.classList.add('is-hidden');
    });
    window.addEventListener('blur', resetCursor);
  }

  qsa('[data-glitch]').forEach((element) => {
    const text = element.textContent.trim();
    const heading = element.closest('h1,h2,h3');
    if (heading && !heading.hasAttribute('aria-label')) heading.setAttribute('aria-label', heading.textContent.trim().replace(/\s+/g, ' '));
    element.dataset.glitchText = text;
    element.setAttribute('aria-label', text);
    element.tabIndex = 0;
    ['a', 'b'].forEach((suffix) => {
      const copy = document.createElement('span');
      copy.className = `glitch-copy glitch-copy-${suffix}`;
      copy.setAttribute('aria-hidden', 'true');
      copy.textContent = text;
      element.appendChild(copy);
    });
    const sweep = document.createElement('span');
    sweep.className = 'glitch-sweep';
    sweep.setAttribute('aria-hidden', 'true');
    element.appendChild(sweep);
    if (reduceMotion || !window.gsap) return;

    let glitchTimeline = null;
    const playGlitch = () => {
      glitchTimeline?.kill();
      window.gsap.set(element, {
        '--glitch-alpha': 0,
        '--glitch-x-a': '0px',
        '--glitch-x-b': '0px',
        '--glitch-sweep': '-130%',
        skewX: 0,
        transformOrigin: 'center'
      });
      glitchTimeline = window.gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => window.gsap.set(element, { clearProps: 'transform', '--glitch-alpha': 0, '--glitch-x-a': '0px', '--glitch-x-b': '0px' })
      })
        .to(element, { '--glitch-alpha': 0.72, '--glitch-x-a': '6px', '--glitch-x-b': '-5px', skewX: -1.8, duration: 0.08, ease: 'none' }, 0)
        .to(element, { '--glitch-x-a': '-3px', '--glitch-x-b': '4px', skewX: 1.2, duration: 0.08, ease: 'none' }, 0.08)
        .to(element, { '--glitch-sweep': '330%', duration: 0.34, ease: 'power2.inOut' }, 0.04)
        .to(element, { '--glitch-alpha': 0, '--glitch-x-a': '0px', '--glitch-x-b': '0px', skewX: 0, duration: 0.18, ease: 'power3.out' }, 0.18);
    };
    element.addEventListener('pointerenter', playGlitch);
    element.addEventListener('focus', playGlitch);
  });

  const createBoundaryTransition = (section, previousSection) => {
    const cover = document.createElement('div');
    cover.className = 'section-cover';
    if (previousSection?.classList.contains('section-light')) cover.classList.add('from-light');
    else if (previousSection?.classList.contains('section-acid')) cover.classList.add('from-metal');
    else cover.classList.add('from-dark');

    const transition = document.createElement('div');
    transition.className = 'section-transition';
    transition.setAttribute('aria-hidden', 'true');
    const blocks = Array.from({ length: 16 }, (_, index) => {
      const block = document.createElement('span');
      block.style.setProperty('--block-height', `${62 + ((index * 23) % 39)}%`);
      return block;
    });
    blocks.forEach((block) => transition.appendChild(block));
    section.prepend(cover);
    section.prepend(transition);

    window.gsap.set(transition, { autoAlpha: 0 });
    window.gsap.set(blocks, { scaleY: 0, transformOrigin: 'bottom' });
    window.gsap.set(cover, { scaleY: 1, transformOrigin: 'top' });

    return window.gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 90%',
        end: 'top top',
        scrub: 0.55,
        invalidateOnRefresh: true
      }
    })
      .to(transition, { autoAlpha: 1, duration: 0.02, ease: 'none' }, 0.01)
      .to(blocks, { scaleY: 1, duration: 0.8, stagger: 0.035, ease: 'power2.inOut' }, 0.02)
      .to(cover, { scaleY: 0, duration: 0.58, ease: 'power2.inOut' }, 0.2);
  };

  const createHeroScene = () => {
    const hero = qs('.hero');
    if (!hero) return;
    window.gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.85 }
    })
      .to('.hero-media', { scale: 1.12, yPercent: 7, ease: 'none' }, 0)
      .to('.hero-copy', { yPercent: -12, autoAlpha: 0.12, ease: 'none' }, 0)
      .to('.hero-orbit', { rotation: 95, scale: 1.12, autoAlpha: 0.2, ease: 'none' }, 0);
  };

  const createSoftSnap = (getPoints, threshold = 0.11) => ({
    snapTo: (value) => {
      if (document.body.classList.contains('drawer-open')) return value;
      const points = typeof getPoints === 'function' ? getPoints() : getPoints;
      if (!points?.length) return value;
      const nearest = window.gsap.utils.snap(points, value);
      return Math.abs(nearest - value) <= threshold ? nearest : value;
    },
    delay: 0.15,
    duration: { min: 0.2, max: 0.55 },
    ease: 'power2.inOut',
    inertia: false
  });

  const createHorizontalScene = (section, options = {}) => {
    const track = qs('.horizontal-track', section);
    const progress = qs('.scene-progress span', section);
    if (!track) return;
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const reverse = Boolean(options.reverse);
    const panels = qsa(':scope > *', track);
    const snapPoints = () => {
      const travel = distance();
      if (!travel) return [0, 1];
      const points = panels.map((panel) => {
        const centered = window.gsap.utils.clamp(0, 1, (panel.offsetLeft + panel.offsetWidth / 2 - window.innerWidth / 2) / travel);
        return reverse ? 1 - centered : centered;
      });
      return [...new Set([0, ...points, 1].map((point) => Number(point.toFixed(4))))].sort((a, b) => a - b);
    };
    if (reverse) window.gsap.set(track, { x: () => -distance() });

    const timeline = window.gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.max(window.innerHeight, distance() * (options.pace || 1))}`,
        scrub: options.scrub || 0.9,
        pin: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        ...(options.snap ? { snap: createSoftSnap(snapPoints, 0.11) } : {}),
        onUpdate: (self) => window.gsap.set(progress, { scaleX: self.progress })
      }
    });

    timeline.to(track, { x: () => (reverse ? 0 : -distance()), ease: 'none', duration: 1 }, 0);
    const ghosts = qsa('.panel-ghost', section);
    if (ghosts.length) timeline.fromTo(ghosts, { xPercent: 12 }, { xPercent: -18, ease: 'none', duration: 1 }, 0);
    const media = qsa('.project-image', section);
    if (media.length) timeline.fromTo(media, { scale: 1.08 }, { scale: 1, ease: 'none', duration: 1 }, 0);
  };

  const createAboutScene = (section, compact = false, enableSnap = false) => {
    const stage = qs('.about-stage', section);
    const panels = qsa('.about-panel', section);
    const portrait = qs('.portrait-anchor', section);
    const foil = qs('.portrait-foil', section);
    const principles = qsa('.principle-frame', section);
    const years = qs('.timeline-years', section);
    const roles = qsa('.timeline-role', section);
    const tools = qsa('.tool-constellation span', section);
    const chapterNumber = qs('.about-chapter-number', section);
    const chapterName = qs('.about-chapter-name', section);
    const progress = qs('.about-progress i', section);
    if (!stage || panels.length !== 4) return;

    const chapters = ['Identity', 'Principles', 'Timeline', 'Toolkit'];
    const updateChapter = (value) => {
      const index = value < 0.2 ? 0 : value < 0.48 ? 1 : value < 0.88 ? 2 : 3;
      chapterNumber.textContent = `0${index + 1}`;
      chapterName.textContent = chapters[index];
      window.gsap.set(progress, { scaleX: value });
    };

    window.gsap.set(panels, { autoAlpha: 0 });
    window.gsap.set(panels[0], { autoAlpha: 1 });
    window.gsap.set(roles, { autoAlpha: 0, y: 24 });
    window.gsap.set(roles[0], { autoAlpha: 1, y: 0 });
    window.gsap.set(principles, { autoAlpha: 0, y: 72 });
    window.gsap.set(tools, { autoAlpha: 0, scale: 0.82, y: 20 });

    const timeline = window.gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'about-cinema',
        trigger: section,
        start: 'top top',
        end: () => `+=${compact ? 3800 : 5200}`,
        scrub: compact ? 0.65 : 0.85,
        pin: stage,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        ...(enableSnap ? { snap: createSoftSnap([0, 0.19, 0.49, 0.9, 1], 0.11) } : {}),
        onUpdate: (self) => updateChapter(self.progress)
      }
    });

    timeline
      .to(panels[0], { autoAlpha: 0, yPercent: -7, duration: 0.55 }, 0.8)
      .to(portrait, { xPercent: compact ? -108 : -118, yPercent: 3, scale: compact ? 0.88 : 0.8, rotation: -2.5, filter: 'brightness(.86)', duration: 0.9 }, 0.65)
      .to(foil, { xPercent: 230, duration: 0.7 }, 0.72)
      .to(panels[1], { autoAlpha: 1, duration: 0.35 }, 1.15)
      .to(principles, { autoAlpha: 1, y: 0, stagger: 0.18, duration: 0.68, ease: 'power3.out' }, 1.2)
      .to(principles, { y: (index) => -18 * (principles.length - index), duration: 0.55, stagger: 0.08 }, 2.25)
      .to(panels[1], { autoAlpha: 0, xPercent: -5, duration: 0.5 }, 2.75)
      .to(portrait, { xPercent: compact ? 55 : 73, yPercent: -12, scale: 0.48, rotation: 5, autoAlpha: 0.44, duration: 0.8 }, 2.65)
      .to(panels[2], { autoAlpha: 1, duration: 0.4 }, 3.05)
      .to(years, { x: () => -(years.scrollWidth - window.innerWidth * (compact ? 0.42 : 0.35)), duration: 2.1 }, 3.18)
      .to(roles[0], { autoAlpha: 0, y: -20, duration: 0.3 }, 3.75)
      .to(roles[1], { autoAlpha: 1, y: 0, duration: 0.3 }, 3.95)
      .to(roles[1], { autoAlpha: 0, y: -20, duration: 0.3 }, 4.55)
      .to(roles[2], { autoAlpha: 1, y: 0, duration: 0.3 }, 4.75)
      .to(panels[2], { autoAlpha: 0, yPercent: -4, duration: 0.5 }, 5.35)
      .to(portrait, { xPercent: -18, yPercent: -35, scale: 0.23, rotation: 0, autoAlpha: 0.18, duration: 0.7 }, 5.28)
      .to(panels[3], { autoAlpha: 1, duration: 0.42 }, 5.65)
      .to(tools, { autoAlpha: 1, scale: 1, y: 0, stagger: { amount: 0.72, from: 'center' }, duration: 0.55, ease: 'power3.out' }, 5.74);
  };

  const createAboutMobileScene = (section) => {
    qsa('.principle-frame,.timeline-role,.tool-constellation span', section).forEach((element) => {
      window.gsap.from(element, {
        y: 32,
        autoAlpha: 0,
        duration: 0.72,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true }
      });
    });
  };

  const createWorkboardScene = (section, compact = false, enableSnap = false) => {
    const viewport = qs('.workboard-viewport', section);
    const camera = qs('.workboard-camera', section);
    const inspectLayer = qs('.workboard-inspect', section);
    const wall = qs('.evidence-wall', section);
    const progress = qs('.board-map-line i', section);
    const mapItems = qsa('[data-map-cluster]', section);
    const artifacts = qsa('.artifact', section);
    if (!viewport || !camera || !inspectLayer || !wall) return;

    const scale = () => compact ? 0.62 : Math.max(0.7, Math.min(0.8, window.innerHeight / 1120));
    const centers = compact
      ? [{ x: 500, y: 450 }, { x: 1030, y: 560 }, { x: 1510, y: 500 }]
      : [{ x: 505, y: 430 }, { x: 1050, y: 555 }, { x: 1515, y: 500 }];
    const target = (index, axis) => {
      const center = centers[index];
      return axis === 'x'
        ? window.innerWidth / 2 - center.x * scale()
        : window.innerHeight / 2 - center.y * scale();
    };
    const setActiveCluster = (index) => {
      const cluster = ['web', 'data', 'ml'][index];
      mapItems.forEach((item) => item.classList.toggle('is-active', item.dataset.mapCluster === cluster));
      artifacts.forEach((artifact) => artifact.classList.toggle('is-cluster-active', artifact.dataset.cluster === cluster));
    };

    window.gsap.set(camera, { x: () => target(0, 'x'), y: () => target(0, 'y'), scale });
    setActiveCluster(0);
    const timeline = window.gsap.timeline({
      scrollTrigger: {
        id: 'workboard-camera',
        trigger: section,
        start: 'top top',
        end: () => `+=${compact ? 2500 : 3900}`,
        scrub: compact ? 0.65 : 0.9,
        pin: viewport,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        ...(enableSnap ? { snap: createSoftSnap([0, 0.5, 1], 0.14) } : {}),
        onUpdate: (self) => {
          window.gsap.set(progress, { scaleX: self.progress });
          setActiveCluster(self.progress < 0.31 ? 0 : self.progress < 0.66 ? 1 : 2);
        }
      }
    });
    timeline
      .to(camera, { x: () => target(1, 'x'), y: () => target(1, 'y'), scale: () => scale() * 1.03, duration: 1, ease: 'none' })
      .to(camera, { x: () => target(2, 'x'), y: () => target(2, 'y'), scale, duration: 1, ease: 'none' });

    const maxX = compact ? 70 : 130;
    const maxY = compact ? 28 : 72;
    let dragging = false;
    let pointerId = null;
    let originX = 0;
    let originY = 0;
    const xTo = window.gsap.quickTo(inspectLayer, 'x', { duration: 0.18, ease: 'power2.out' });
    const yTo = window.gsap.quickTo(inspectLayer, 'y', { duration: 0.18, ease: 'power2.out' });
    const onPointerDown = (event) => {
      if ((event.pointerType !== 'mouse' && event.pointerType !== 'pen') || event.button !== 0 || event.target.closest('.artifact')) return;
      dragging = true;
      pointerId = event.pointerId;
      originX = event.clientX;
      originY = event.clientY;
      viewport.setPointerCapture(pointerId);
      viewport.classList.add('is-inspecting');
    };
    const onPointerMove = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      xTo(window.gsap.utils.clamp(-maxX, maxX, event.clientX - originX));
      yTo(window.gsap.utils.clamp(-maxY, maxY, event.clientY - originY));
    };
    const release = (event) => {
      if (!dragging || (event && event.pointerId !== pointerId)) return;
      dragging = false;
      viewport.classList.remove('is-inspecting');
      window.gsap.to(inspectLayer, { x: 0, y: 0, duration: 0.85, ease: 'elastic.out(1,.55)', overwrite: true });
      if (pointerId !== null && viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId);
      pointerId = null;
    };
    const preventDrag = (event) => event.preventDefault();
    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', release);
    viewport.addEventListener('pointercancel', release);
    wall.addEventListener('dragstart', preventDrag);
    return () => {
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', release);
      viewport.removeEventListener('pointercancel', release);
      wall.removeEventListener('dragstart', preventDrag);
    };
  };

  const createWorkboardMobileScene = (section) => {
    qsa('.artifact', section).forEach((artifact) => {
      window.gsap.from(artifact, {
        y: 36,
        autoAlpha: 0,
        duration: 0.72,
        ease: 'power3.out',
        scrollTrigger: { trigger: artifact, start: 'top 90%', once: true }
      });
    });
  };

  const createApertureScene = (section) => {
    const aperture = qs('.aperture', section);
    if (!aperture) return;
    window.gsap.fromTo(aperture, { scaleX: 1 }, {
      scaleX: 0,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 20%', scrub: 0.7 }
    });
  };

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    const removeBoundaryElements = () => qsa('.section-cover,.section-transition').forEach((element) => element.remove());
    removeBoundaryElements();

    if (!reduceMotion) window.gsap.from('.site-header', { y: -30, autoAlpha: 0, duration: 0.8, ease: 'power3.out' });
    const heroReveal = qsa('.hero .reveal');
    if (heroReveal.length) window.gsap.from(heroReveal, { y: 55, autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: 'power4.out', delay: 0.1 });

    const motionMedia = window.gsap.matchMedia();
    motionMedia.add({
      desktop: '(min-width: 1200px)',
      tablet: '(min-width: 900px) and (max-width: 1199px)',
      mobile: '(max-width: 899px)',
      finePointer: '(pointer: fine)',
      reduce: '(prefers-reduced-motion: reduce)'
    }, (context) => {
      const { desktop, tablet, mobile, finePointer, reduce } = context.conditions;
      const enableSnap = desktop && finePointer;
      removeBoundaryElements();
      if (reduce) return removeBoundaryElements;
      const cleanups = [];
      const sections = qsa('main > section');
      sections.forEach((section, index) => {
        if (index === 0) createHeroScene();
        else createBoundaryTransition(section, sections[index - 1]);

        if ((desktop || tablet) && section.classList.contains('pov-scene')) createHorizontalScene(section, { pace: 1.04, scrub: 0.85, snap: enableSnap });
        if ((desktop || tablet) && section.classList.contains('work-section')) createHorizontalScene(section, { pace: 1.08, scrub: 0.9, snap: enableSnap });
        if ((desktop || tablet) && section.classList.contains('process-scene')) createHorizontalScene(section, { reverse: true, pace: 0.88, scrub: 0.8, snap: enableSnap });
        if (section.classList.contains('about-cinema')) {
          if (desktop || tablet) createAboutScene(section, tablet, enableSnap);
          else if (mobile) createAboutMobileScene(section);
        }
        if (section.classList.contains('workboard-section')) {
          if (desktop || tablet) cleanups.push(createWorkboardScene(section, tablet, enableSnap));
          else if (mobile) createWorkboardMobileScene(section);
        }
        if (section.classList.contains('statement')) createApertureScene(section);
      });
      return () => {
        cleanups.filter(Boolean).forEach((cleanup) => cleanup());
        removeBoundaryElements();
      };
    });

    if (!reduceMotion) qsa('.reveal').forEach((element) => {
      if (element.closest('.hero') || element.closest('.cinema-scene')) return;
      window.gsap.from(element, {
        y: 42,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true }
      });
    });

    qsa('.project-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        if (!window.matchMedia('(pointer:fine)').matches) return;
        const bounds = card.getBoundingClientRect();
        window.gsap.to(card, {
          rotationY: (event.clientX - bounds.left - bounds.width / 2) / 85,
          rotationX: -(event.clientY - bounds.top - bounds.height / 2) / 120,
          transformPerspective: 1100,
          duration: 0.45,
          overwrite: 'auto'
        });
      });
      card.addEventListener('pointerleave', () => window.gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto' }));
    });
  }

  const drawer = qs('.project-drawer');
  if (drawer) {
    const closeButton = qs('.drawer-close', drawer);
    const drawerScrim = qs('.drawer-scrim');
    let lastTrigger = null;
    const close = () => {
      if (!drawer.classList.contains('is-open')) return;
      resetCursor();
      drawer.setAttribute('aria-hidden', 'true');
      drawer.classList.remove('is-open');
      drawerScrim?.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
      if (window.gsap) {
        window.gsap.to(drawer, { x: '100%', duration: reduceMotion ? 0 : 0.65, ease: 'power4.inOut', onComplete: () => lastTrigger?.focus() });
        if (drawerScrim) window.gsap.to(drawerScrim, { autoAlpha: 0, duration: reduceMotion ? 0 : 0.35 });
      } else {
        lastTrigger?.focus();
      }
    };
    const open = (card) => {
      resetCursor();
      lastTrigger = card;
      qs('.drawer-title', drawer).textContent = card.dataset.project;
      qs('.drawer-year', drawer).textContent = card.dataset.year;
      qs('.drawer-description', drawer).textContent = card.dataset.description;
      const drawerImage = qs('.drawer-image', drawer);
      drawerImage.replaceChildren();
      drawerImage.style.backgroundImage = '';
      if (card.dataset.image.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.src = card.dataset.image;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('aria-label', `${card.dataset.project} preview`);
        drawerImage.appendChild(video);
      } else {
        drawerImage.style.backgroundImage = `url('${card.dataset.image}')`;
      }
      drawer.setAttribute('aria-hidden', 'false');
      drawer.classList.add('is-open');
      drawerScrim?.classList.add('is-open');
      document.body.classList.add('drawer-open');
      if (window.gsap) {
        window.gsap.fromTo(drawer, { x: '100%' }, { x: 0, duration: reduceMotion ? 0 : 0.75, ease: 'power4.out', onComplete: () => closeButton?.focus() });
        if (drawerScrim) window.gsap.fromTo(drawerScrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduceMotion ? 0 : 0.35 });
      } else {
        closeButton?.focus();
      }
    };
    qsa('.project-card,.board-card').forEach((card) => {
      if (card.tagName !== 'BUTTON') {
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
      }
      card.addEventListener('click', () => open(card));
      if (card.tagName !== 'BUTTON') {
        card.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open(card);
          }
        });
      }
    });
    closeButton?.addEventListener('click', close);
    drawerScrim?.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) close();
      if (event.key === 'Tab' && drawer.classList.contains('is-open')) {
        const focusable = qsa('button,a[href],[tabindex]:not([tabindex="-1"])', drawer).filter((element) => !element.disabled);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  window.addEventListener('load', () => window.ScrollTrigger?.refresh());
})();
