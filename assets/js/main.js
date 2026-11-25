/* =========================================================
   Fast Spa Asa Sul — landing page
   - intro, smooth scroll, animações de entrada e de scroll
   - status "aberto agora" pelo horário de Brasília
   - experiências com rolagem horizontal, depoimentos, vídeo
   - formulário qualificador que termina no WhatsApp
   ========================================================= */

// >>> TROCAR pelo WhatsApp da unidade Asa Sul (DDI + DDD + número, só dígitos)
const FASTSPA_WHATSAPP = "5561000000000";
// Endereço opcional para receber o lead (CRM, planilha, e-mail). Vazio = não envia.
const FASTSPA_LEAD_ENDPOINT = "";

// Horário da unidade (0 = domingo). Fonte: cadastro TotalPass da unidade.
const HORARIOS = { 0: [10, 16], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: [8, 20] };

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;
root.classList.add("js");
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) window.scrollTo(0, 0);

const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
if (!hasGsap) root.classList.add("no-gsap");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = matchMedia("(hover: none)").matches;
const track = (name, data = {}) => {
  try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: name, ...data }); } catch (_) {}
};

/* ---------- Smooth scroll (Lenis) ---------- */
let lenis = null;
if (hasGsap) gsap.registerPlugin(ScrollTrigger);
if (window.Lenis && !reduce) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
  if (hasGsap) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}
const scrollToY = (y, dur = 1.4) => {
  if (lenis) lenis.scrollTo(y, { duration: dur });
  else window.scrollTo({ top: y, behavior: "smooth" });
};
const scrollToEl = (el) => {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.5 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 20, behavior: "smooth" });
};
$$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
  const id = a.getAttribute("href");
  if (id === "#") return;
  e.preventDefault();
  if (root.classList.contains("menu-open")) closeMenu();
  if (id === "#topo") { scrollToY(0, 1.6); return; }
  scrollToEl($(id));
}));

function lockScroll(on) {
  root.classList.toggle("is-locked", on);
  if (lenis) on ? lenis.stop() : lenis.start();
}

/* ---------- Quebra de texto em palavras (máscara) ---------- */
function splitWords(el) {
  if (el.dataset.split) return $$(".wi", el);
  el.dataset.split = "1";
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span"); w.className = "w";
          const wi = document.createElement("span"); wi.className = "wi"; wi.textContent = p;
          w.appendChild(wi); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return $$(".wi", el);
}

/* =========================================================
   STATUS: aberto agora (horário de Brasília)
   ========================================================= */
function agoraBrasilia() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { dia, min: (+get("hour")) * 60 + (+get("minute")) };
}
const hh = (h) => `${h}h`;
function statusLoja() {
  const { dia, min } = agoraBrasilia();
  const [ab, fe] = HORARIOS[dia];
  if (min >= ab * 60 && min < fe * 60) {
    const falta = fe * 60 - min;
    return { open: true, title: "Aberto agora", sub: falta <= 60 ? `Fecha às ${hh(fe)}. Ainda dá tempo, é só chegar!` : `Até as ${hh(fe)} · sem hora marcada`, short: `Aberto agora · até ${hh(fe)}`, dia };
  }
  if (min < ab * 60) return { open: false, title: "Fechado agora", sub: `Abre hoje às ${hh(ab)} · sem hora marcada`, short: `Abre hoje às ${hh(ab)}`, dia };
  const amanha = (dia + 1) % 7;
  return { open: false, title: "Fechado agora", sub: `Abre amanhã às ${hh(HORARIOS[amanha][0])} · sem hora marcada`, short: `Abre amanhã às ${hh(HORARIOS[amanha][0])}`, dia };
}
function pintarStatus() {
  const s = statusLoja();
  $$(".js-status-card").forEach((c) => {
    c.classList.toggle("is-open", s.open); c.classList.toggle("is-closed", !s.open);
    $(".js-status-title", c).textContent = s.title;
    $(".js-status-sub", c).textContent = s.sub;
  });
  const hs = $(".js-status");
  if (hs) { hs.classList.toggle("is-open", s.open); hs.classList.toggle("is-closed", !s.open); $("span", hs).textContent = s.short; }
  $$(".hours tr").forEach((tr) => tr.classList.toggle("is-today", tr.dataset.days.split(",").map(Number).includes(s.dia)));
}
pintarStatus();
setInterval(pintarStatus, 60000);

/* =========================================================
   INTRO + HERO
   ========================================================= */
const intro = $(".intro");
const heroWords = [...$$(".hero__title .js-split")].map((el) => splitWords(el));

function heroIn() {
  if (!hasGsap) return;
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
  tl.from(".hero__chip", { y: 20, opacity: 0, duration: 1 }, 0)
    .from(heroWords[0], { yPercent: 115, duration: 1.2, stagger: 0.07 }, 0.05)
    .from(heroWords[1], { yPercent: 115, duration: 1.2, stagger: 0.07 }, 0.2)
    .from(".hero__lead", { y: 24, opacity: 0, duration: 1.1 }, 0.5)
    .from(".hero__ctas > *", { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.62)
    .from(".hero__foot > *", { y: 20, opacity: 0, duration: 1, stagger: 0.1 }, 0.8)
    .from(".hero__badge", { scale: 0.6, opacity: 0, rotate: -60, duration: 1.4 }, 0.7)
    .from(".hero__scroll", { opacity: 0, duration: 1 }, 1)
    .from(".hd__bar", { y: -30, opacity: 0, duration: 1.1 }, 0.3);
}

if (hasGsap && !reduce && intro) {
  lockScroll(true);
  const leaves = $$(".intro__petals use");
  gsap.timeline()
    .from(leaves, { scale: 0, rotate: -90, opacity: 0, duration: 0.9, stagger: 0.09, ease: "back.out(1.7)" })
    .to(".intro__petals", { rotate: 90, duration: 1.1, ease: "power3.inOut" }, 0.3)
    .to(".intro__logo", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.55)
    .to(intro, { yPercent: -100, duration: 1, ease: "power4.inOut" }, 1.55)
    .add(() => { lockScroll(false); heroIn(); }, 1.75)
    .add(() => intro.classList.add("is-gone"));
} else if (intro) {
  intro.classList.add("is-gone");
}

/* ---------- Slides do topo ---------- */
const slides = $$(".hero__slide"), dots = $$(".hero__dots button");
const SLIDE_MS = 6500;
root.style.setProperty("--slide", `${SLIDE_MS / 1000}s`);
let cur = 0, slideTimer = null;
function goSlide(i) {
  cur = (i + slides.length) % slides.length;
  slides.forEach((s, k) => {
    const on = k === cur;
    if (on) { const img = $("img", s); img.style.animation = "none"; void img.offsetWidth; img.style.animation = ""; }
    s.classList.toggle("is-on", on);
  });
  dots.forEach((d, k) => {
    d.classList.toggle("is-done", k < cur);
    d.classList.remove("is-on"); void d.offsetWidth;
    d.classList.toggle("is-on", k === cur);
    d.setAttribute("aria-selected", k === cur);
  });
  clearTimeout(slideTimer);
  if (!reduce) slideTimer = setTimeout(() => goSlide(cur + 1), SLIDE_MS);
}
dots.forEach((d, k) => d.addEventListener("click", () => goSlide(k)));
if (slides.length) goSlide(0);

/* =========================================================
   HEADER + MENU
   ========================================================= */
const hd = $(".hd"), burger = $(".hd__burger"), mnav = $("#mnav");
let lastY = 0;
function onScroll(y) {
  if (root.classList.contains("menu-open")) return;
  hd.classList.toggle("is-hidden", y > 300 && y > lastY + 2);
  if (y < lastY - 2 || y < 300) hd.classList.remove("is-hidden");
  lastY = y;
}
if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
else addEventListener("scroll", () => onScroll(scrollY), { passive: true });

function openMenu() { root.classList.add("menu-open"); burger.setAttribute("aria-expanded", "true"); mnav.setAttribute("aria-hidden", "false"); lockScroll(true); }
function closeMenu() { root.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); mnav.setAttribute("aria-hidden", "true"); lockScroll(false); }
burger.addEventListener("click", () => (root.classList.contains("menu-open") ? closeMenu() : openMenu()));

/* =========================================================
   ANIMAÇÕES DE SCROLL
   ========================================================= */
if (hasGsap && !reduce) {
  // títulos: palavras sobem de dentro da máscara
  $$(".js-reveal").forEach((h) => {
    const w = splitWords(h);
    gsap.from(w, { yPercent: 115, duration: 1.15, stagger: 0.045, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 86%" } });
  });
  $$(".rise").forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  $$(".rise-list").forEach((ul) => gsap.from(ul.children, { y: 26, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ul, start: "top 88%" } }));
  $$(".eyebrow").forEach((el) => gsap.from(el, { x: -20, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" } }));

  // topo: conteúdo sobe e some, foto aproxima
  gsap.to(".hero__in", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__media", { scale: 1.08, yPercent: 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // faixa: acelera com a velocidade da rolagem
  const bandTween = gsap.to(".band__track", { xPercent: -50, repeat: -1, duration: 32, ease: "none" });
  ScrollTrigger.create({
    trigger: ".band", start: "top bottom", end: "bottom top",
    onUpdate: (self) => {
      const v = Math.abs(self.getVelocity());
      gsap.to(bandTween, { timeScale: 1 + Math.min(v / 260, 5), duration: 0.25, overwrite: true });
      gsap.to(bandTween, { timeScale: 1, duration: 1.2, delay: 0.25, ease: "power2.out" });
    },
  });

  // sobre: palavra gigante desliza, fotos em parallax
  gsap.fromTo(".sobre__word", { xPercent: 4 }, { xPercent: -26, ease: "none", scrollTrigger: { trigger: ".sobre", start: "top bottom", end: "bottom top", scrub: true } });
  $$("[data-speed]").forEach((el) => {
    const s = parseFloat(el.dataset.speed);
    gsap.fromTo(el, { y: -s * 160 }, { y: s * 160, ease: "none", scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.from(".sobre__ph", { clipPath: "inset(100% 0 0 0 round 22px)", duration: 1.4, stagger: 0.18, ease: "power4.inOut", scrollTrigger: { trigger: ".sobre__media", start: "top 80%" } });

  // como funciona: linha desenha, passos acendem
  gsap.to(".passos__line i", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".passos__list", start: "top 85%", end: "bottom 60%", scrub: true } });
  $$(".passo").forEach((p, i) => {
    gsap.from(p, { y: 50, opacity: 0, duration: 1.1, delay: i * 0.08, ease: "power3.out", scrollTrigger: { trigger: ".passos__list", start: "top 85%" } });
    ScrollTrigger.create({ trigger: p, start: "top 70%", onEnter: () => p.classList.add("is-on"), onLeaveBack: () => p.classList.remove("is-on") });
  });

  // diferenciais
  gsap.from(".dif__list li", { y: 30, opacity: 0, duration: 0.9, stagger: 0.09, ease: "power3.out", scrollTrigger: { trigger: ".dif__list", start: "top 85%" } });
  gsap.from(".dif__ph--1", { x: -80, opacity: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: ".dif__media", start: "top 80%" } });
  gsap.from(".dif__ph--2", { y: -70, opacity: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: ".dif__media", start: "top 80%" } });
  gsap.from(".dif__ph--3", { x: 100, opacity: 0, duration: 1.4, delay: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".dif__media", start: "top 80%" } });
  gsap.fromTo(".dif__ph--1 img", { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: ".dif__media", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".dif__ph--3", { y: 50 }, { y: -50, ease: "none", scrollTrigger: { trigger: ".dif__media", start: "top bottom", end: "bottom top", scrub: true } });

  // contadores
  $$(".js-count").forEach((el) => {
    const to = +el.dataset.to, o = { v: 0 };
    el.textContent = "0";
    gsap.to(o, { v: to, duration: 1.8, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)), scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  gsap.from(".num", { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".nums", start: "top 90%" } });

  // manifesto: a foto se abre até ocupar a tela
  const mm0 = gsap.matchMedia();
  mm0.add("(min-width: 761px)", () => {
    gsap.fromTo(".manif__frame", { clipPath: "inset(0% 6% round 28px)" }, { clipPath: "inset(0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: ".manif", start: "top 85%", end: "top 10%", scrub: true } });
  });
  gsap.fromTo(".manif__frame > img", { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".manif", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".manif__pattern svg", { scale: 0, rotate: -120, opacity: 0, duration: 0.9, stagger: 0.06, ease: "back.out(1.8)", scrollTrigger: { trigger: ".manif__pattern", start: "top 85%" } });
  gsap.from([".manif__sub", ".manif__play"], { y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: ".manif__t", start: "top 80%" } });

  // depoimentos
  gsap.from(".dep__card", { y: 60, opacity: 0, duration: 1.1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".dep__track", start: "top 88%" } });

  // rede: mapa flutua
  gsap.from(".rede__map", { y: 60, opacity: 0, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: ".rede", start: "top 75%" } });
  gsap.to(".rede__map img", { y: -14, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.from(".rede__pin", { scale: 0, opacity: 0, duration: 0.8, ease: "back.out(2)", scrollTrigger: { trigger: ".rede", start: "top 60%" } });

  // unidade
  gsap.from([".uni__open", ".uni__row", ".uni__tp", ".uni__ctas"], { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".uni__txt", start: "top 75%" } });
  gsap.from(".uni__map", { y: 80, rotate: 2, opacity: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: ".uni__map", start: "top 88%" } });

  // faq
  gsap.from(".acc__it", { y: 24, opacity: 0, duration: 0.9, stagger: 0.07, ease: "power3.out", scrollTrigger: { trigger: ".acc", start: "top 85%" } });

  // CTA final
  $$(".cta__t .js-split").forEach((el, i) => {
    const w = splitWords(el);
    gsap.from(w, { yPercent: 115, duration: 1.3, stagger: 0.06, delay: i * 0.12, ease: "power4.out", scrollTrigger: { trigger: ".cta__t", start: "top 85%" } });
  });
  gsap.from(".cta__side > *", { y: 30, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".cta__side", start: "top 90%" } });

  // menu: link da seção atual
  const links = $$(".hd__nav a");
  links.forEach((a) => {
    const sec = $(a.getAttribute("href"));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top 45%", end: "bottom 45%", onToggle: (self) => a.classList.toggle("is-active", self.isActive) });
  });
}

/* =========================================================
   EXPERIÊNCIAS: rolagem horizontal (desktop) / arraste (mobile)
   ========================================================= */
const exp = $(".exp"), expVp = $(".exp__viewport"), expTrack = $(".exp__track");
const cards = $$(".card", expTrack);
const expI = $(".js-exp-i"), expBar = $(".js-exp-bar");
const N = 9;
let expST = null;
function setExpProgress(p) {
  const idx = Math.min(N, Math.max(1, Math.round(p * (N - 1)) + 1));
  expI.textContent = String(idx).padStart(2, "0");
  expBar.style.transform = `scaleX(${Math.max(1 / N, Math.min(1, p))})`;
}
if (hasGsap) {
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1081px) and (prefers-reduced-motion: no-preference)", () => {
    const dist = () => expTrack.scrollWidth - innerWidth;
    const tween = gsap.to(expTrack, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: exp, pin: ".exp__pin", start: "top top", end: () => "+=" + dist(), scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => setExpProgress(self.progress),
      },
    });
    expST = tween.scrollTrigger;
    cards.forEach((c) => {
      const fig = $("figure", c);
      if (!fig) return;
      gsap.fromTo(fig, { xPercent: 7 }, { xPercent: -7, ease: "none", scrollTrigger: { trigger: c, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
    });
    gsap.from(cards, { x: 160, opacity: 0, duration: 1.3, stagger: 0.07, ease: "power3.out", scrollTrigger: { trigger: exp, start: "top 70%" } });
    return () => { expST = null; };
  });
}
expVp.addEventListener("scroll", () => {
  if (expST) return;
  const max = expVp.scrollWidth - expVp.clientWidth;
  setExpProgress(max > 0 ? expVp.scrollLeft / max : 0);
}, { passive: true });
$$(".exp__arrow[data-dir]").forEach((b) => b.addEventListener("click", () => {
  const dir = +b.dataset.dir;
  if (expST) {
    const span = expST.end - expST.start;
    const step = span / (N - 1);
    const now = Math.min(span, Math.max(0, scrollY - expST.start));
    const target = Math.round(now / step + dir) * step;
    scrollToY(expST.start + Math.min(span, Math.max(0, target)), 1.1);
  } else {
    const w = cards[0].getBoundingClientRect().width + 22;
    expVp.scrollBy({ left: dir * w, behavior: "smooth" });
  }
}));

/* =========================================================
   DEPOIMENTOS: setas + arrastar com o mouse
   ========================================================= */
const depVp = $(".dep__viewport");
$$("[data-dep]").forEach((b) => b.addEventListener("click", () => {
  const w = $(".dep__card").getBoundingClientRect().width + 24;
  depVp.scrollBy({ left: +b.dataset.dep * w, behavior: "smooth" });
}));
if (!isTouch) {
  let down = false, sx = 0, sl = 0, moved = false;
  depVp.addEventListener("pointerdown", (e) => { down = true; moved = false; sx = e.clientX; sl = depVp.scrollLeft; depVp.style.scrollSnapType = "none"; depVp.style.cursor = "grabbing"; });
  addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; depVp.scrollLeft = sl - dx; });
  addEventListener("pointerup", () => { if (!down) return; down = false; depVp.style.cursor = ""; depVp.style.scrollSnapType = ""; });
  depVp.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  depVp.style.cursor = "grab";
}

/* ---------- Mapa carrega só quando chega perto ---------- */
const mapFrame = $(".uni__map iframe");
if (mapFrame) {
  const io = new IntersectionObserver((ents) => {
    if (ents.some((e) => e.isIntersecting)) { mapFrame.src = mapFrame.dataset.src; io.disconnect(); }
  }, { rootMargin: "600px 0px" });
  io.observe(mapFrame);
}

/* ---------- FAQ (acordeão animado) ---------- */
const ease = "cubic-bezier(.22,1,.36,1)";
$$(".acc__it").forEach((d) => {
  const s = $("summary", d), b = $(".acc__b", d);
  s.addEventListener("click", (e) => {
    e.preventDefault();
    if (d.open) {
      const a = b.animate([{ height: b.scrollHeight + "px" }, { height: "0px" }], { duration: 450, easing: ease });
      a.onfinish = () => { d.open = false; hasGsap && ScrollTrigger.refresh(); };
    } else {
      $$(".acc__it[open]").forEach((o) => o !== d && $("summary", o).click());
      d.open = true;
      const a = b.animate([{ height: "0px" }, { height: b.scrollHeight + "px" }], { duration: 550, easing: ease });
      a.onfinish = () => hasGsap && ScrollTrigger.refresh();
      track("faq_open", { q: s.textContent.trim() });
    }
  });
});

/* ---------- Botão magnético ---------- */
// usa xPercent/yPercent para não brigar com o "y" das animações de entrada
if (hasGsap && !isTouch && !reduce) {
  $$(".magnet, .hero__ctas .btn, .manif__play-btn").forEach((el) => {
    const qx = gsap.quickTo(el, "xPercent", { duration: 0.6, ease: "power3.out" });
    const qy = gsap.quickTo(el, "yPercent", { duration: 0.6, ease: "power3.out" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      qx(((e.clientX - r.left) / r.width - 0.5) * 18);
      qy(((e.clientY - r.top) / r.height - 0.5) * 30);
    });
    el.addEventListener("pointerleave", () => { qx(0); qy(0); });
  });
}

/* ---------- WhatsApp flutuante ---------- */
const fab = $(".fab");
setTimeout(() => { fab.classList.add("show-tip"); setTimeout(() => fab.classList.remove("show-tip"), 4500); }, 7000);

/* ---------- Vídeo ---------- */
const vid = $("#vid");
function openVid(id) {
  $(".vid__frame", vid).innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Vídeo do Fast Spa" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  vid.classList.add("is-open"); vid.setAttribute("aria-hidden", "false"); lockScroll(true);
  track("video_open", { id });
}
function closeVid() {
  vid.classList.remove("is-open"); vid.setAttribute("aria-hidden", "true"); lockScroll(false);
  setTimeout(() => { $(".vid__frame", vid).innerHTML = ""; }, 400);
}
$$("[data-video]").forEach((b) => b.addEventListener("click", () => openVid(b.dataset.video)));
$$("[data-close-vid]").forEach((b) => b.addEventListener("click", closeVid));

$$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));

/* =========================================================
   FORMULÁRIO QUALIFICADOR → WhatsApp
   ========================================================= */
const lead = $("#lead"), form = $(".lead__form", lead);
const fsets = $$(".q[data-q]", form);
const nextBtn = $(".lead__next", lead), backBtn = $(".lead__back", lead);
const FLOW = ["experiencia", "objetivo", "quando", "conhece", "contato"];
let pos = 0, leadTrigger = null;
form.setAttribute("data-lenis-prevent", "");

const val = (name) => $(`input[name="${name}"]:checked`, form)?.value || "";
const answered = (name) => name === "contato" || !!val(name);

function showStep(i) {
  pos = Math.max(0, Math.min(i, FLOW.length - 1));
  const name = FLOW[pos];
  fsets.forEach((q) => q.classList.toggle("is-on", q.dataset.q === name));
  $(".q--done", form).classList.remove("is-on");
  $(".lead__progress i").style.width = `${((pos + 1) / (FLOW.length + 1)) * 100}%`;
  $(".js-step", lead).textContent = pos + 1;
  $(".js-total", lead).textContent = FLOW.length;
  backBtn.classList.toggle("is-on", pos > 0);
  nextBtn.disabled = !answered(name);
  $("span", nextBtn).textContent = name === "contato" ? "Continuar no WhatsApp" : "Continuar";
  form.scrollTop = 0;
  track("lead_step", { step: pos + 1, pergunta: name });
}
function openLead(exp, trigger) {
  leadTrigger = trigger || document.activeElement;
  form.reset();
  $(".err", form).textContent = "";
  $$(".is-bad", form).forEach((x) => x.classList.remove("is-bad"));
  lead.classList.remove("is-done");
  let start = 0;
  if (exp) {
    const r = $$('input[name="experiencia"]', form).find((x) => x.value === exp);
    if (r) { r.checked = true; start = 1; }
  }
  showStep(start);
  lead.classList.add("is-open");
  lead.setAttribute("aria-hidden", "false");
  fab.classList.add("is-off");
  lockScroll(true);
  track("lead_open", { experiencia: exp || "", origem: trigger?.className || "" });
  setTimeout(() => $(".q.is-on input", form)?.focus({ preventScroll: true }), 450);
}
function closeLead() {
  lead.classList.remove("is-open");
  lead.setAttribute("aria-hidden", "true");
  fab.classList.remove("is-off");
  lockScroll(false);
  leadTrigger?.focus?.({ preventScroll: true });
}
$$("[data-open-lead]").forEach((b) => b.addEventListener("click", (e) => {
  e.preventDefault();
  if (root.classList.contains("menu-open")) closeMenu();
  openLead(b.dataset.exp || null, b);
}));
$$("[data-close-lead]", lead).forEach((b) => b.addEventListener("click", closeLead));

form.addEventListener("change", (e) => {
  if (e.target.type !== "radio") return;
  nextBtn.disabled = false;
  const at = pos;
  setTimeout(() => { if (pos === at && lead.classList.contains("is-open")) showStep(at + 1); }, 380);
});
backBtn.addEventListener("click", () => pos > 0 && showStep(pos - 1));
nextBtn.addEventListener("click", () => {
  if (pos < FLOW.length - 1) { if (answered(FLOW[pos])) showStep(pos + 1); return; }
  submitLead();
});
form.addEventListener("submit", (e) => { e.preventDefault(); if (FLOW[pos] === "contato") submitLead(); });
$$(".q--form input[type=text], .q--form input[type=tel]", form).forEach((inp) => inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submitLead(); } }));

// máscara de telefone (Brasil)
const tel = $('input[name="whatsapp"]', form);
tel.addEventListener("input", () => {
  const d = tel.value.replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  tel.value = out;
});

function submitLead() {
  const fd = new FormData(form);
  const nome = (fd.get("nome") || "").trim();
  const fone = (fd.get("whatsapp") || "").replace(/\D/g, "");
  const err = $(".err", form);
  $$(".is-bad", form).forEach((x) => x.classList.remove("is-bad"));
  if (nome.length < 2) { $('input[name="nome"]', form).classList.add("is-bad"); err.textContent = "Conte pra gente como podemos chamar você."; return; }
  if (fone.length < 10) { tel.classList.add("is-bad"); err.textContent = "Confira o seu WhatsApp com DDD."; return; }
  if (!fd.get("lgpd")) { err.textContent = "Precisamos da sua autorização para entrar em contato."; return; }
  err.textContent = "";

  const payload = {
    nome, whatsapp: fone,
    experiencia: val("experiencia"), objetivo: val("objetivo"), quando: val("quando"), conhece: val("conhece"),
    totalpass: !!fd.get("totalpass"), obs: (fd.get("obs") || "").trim(),
    unidade: "Asa Sul", origem: "Site Fast Spa Asa Sul", pagina: location.href, data: new Date().toISOString(),
  };
  const linhas = [
    "Olá, Fast Spa Asa Sul! Vim pelo site e quero viver a minha pausa.",
    "",
    `• Experiência: ${payload.experiencia || "-"}`,
    payload.objetivo ? `• O que eu mais preciso: ${payload.objetivo}` : null,
    payload.quando ? `• Quando quero ir: ${payload.quando}` : null,
    payload.conhece ? `• Fast Spa: ${payload.conhece}` : null,
    payload.totalpass ? "• Sou usuário(a) TotalPass" : null,
    payload.obs ? `• Observação: ${payload.obs}` : null,
    "",
    `Meu nome é ${nome}.`,
  ].filter((l) => l !== null);
  const url = `https://wa.me/${FASTSPA_WHATSAPP}?text=${encodeURIComponent(linhas.join("\n"))}`;
  $(".js-wa", form).href = url;
  $(".js-name", form).textContent = nome.split(" ")[0];

  if (FASTSPA_LEAD_ENDPOINT) {
    fetch(FASTSPA_LEAD_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
  } else {
    console.info("[lead]", payload);
  }
  track("lead_submit", { experiencia: payload.experiencia, objetivo: payload.objetivo, quando: payload.quando, conhece: payload.conhece, totalpass: payload.totalpass });

  fsets.forEach((q) => q.classList.remove("is-on"));
  $(".q--done", form).classList.add("is-on");
  $(".lead__progress i").style.width = "100%";
  $(".js-step", lead).textContent = FLOW.length;
  lead.classList.add("is-done");
  window.open(url, "_blank", "noopener");
}

/* ---------- Esc fecha o que estiver aberto ---------- */
addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (vid.classList.contains("is-open")) return closeVid();
  if (lead.classList.contains("is-open")) return closeLead();
  if (root.classList.contains("menu-open")) closeMenu();
});

addEventListener("load", () => hasGsap && ScrollTrigger.refresh());
