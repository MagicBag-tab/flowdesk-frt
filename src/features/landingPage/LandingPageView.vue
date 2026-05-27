<template>
  <div class="landing">

    <header class="navbar" :class="{ 'navbar--scrolled': scrolled }">
      <div class="navbar__logo">
        
          <img src="../../logo/logo.png" alt="FlowDesk" class="navbar__logo-img" />
       
      </div>
      <nav class="navbar__actions">
        <RouterLink to="/login" class="btn-ghost">Iniciar sesión</RouterLink>
        <RouterLink to="/register" class="btn-cta">Registrarse</RouterLink>
      </nav>
    </header>

    <section class="hero">
      <div class="hero__bg">
      </div>

      <div class="hero__content">

        <h1 class="hero__heading">
          Todo tu negocio,<br />
          <em>en un solo lugar</em>
        </h1>

        <p class="hero__sub">
          FlowDesk centraliza la gestión de inventarios, empleados, movimientos y análisis de tu empresa.
          Menos herramientas, más control, mejores decisiones.
        </p>

        <div class="hero__actions">
          <RouterLink to="/register" class="btn-hero-primary">Comenzar ahora</RouterLink>
          <RouterLink to="/login" class="btn-hero-ghost">Iniciar sesión</RouterLink>
        </div>

      </div>
    </section>

    <section class="features">
      <p class="section-eyebrow">Lo que puedes hacer</p>
      <h2 class="section-title">Una plataforma, muchas soluciones</h2>
      <p class="section-sub">
        Diseñada para que los negocios de todos los tamaños operen con claridad, eficiencia y sin fricciones.
      </p>

      <div class="features__grid">
        <div v-for="feat in features" :key="feat.title" class="feature-card">
          <div class="feature-card__icon" v-html="feat.icon" />
          <p class="feature-card__title">{{ feat.title }}</p>
          <p class="feature-card__desc">{{ feat.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ── MISSION & VISION ──────────────────────────────── -->
    <section class="mission">
      <div class="mission__inner">
        <div v-for="block in missionBlocks" :key="block.label" class="mission__block">
          <p class="mission__block-label">{{ block.label }}</p>
          <h3 class="mission__block-title">{{ block.title }}</h3>
          <p class="mission__block-text">{{ block.text }}</p>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ───────────────────────────────────────── -->
    <footer class="footer">
      <span class="footer__copy">© 2025 FlowDesk. Todos los derechos reservados.</span>

    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';

const scrolled = ref(false);

function onScroll() {
  scrolled.value = window.scrollY > 20;
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));

const features = [
  {
    title: 'Inventario inteligente',
    desc: 'Controla tu stock en tiempo real. Recibe alertas de bajo inventario, importa productos desde Excel y visualiza el estado de cada artículo al instante.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-structure-base)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>`,
  },
  {
    title: 'Movimientos de inventario',
    desc: 'Registra entradas, salidas, ajustes y devoluciones. Mantén un historial completo y filtra por fecha, tipo o producto con facilidad.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-structure-base)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16v16H4z"/>
      <path d="M8 2v4M16 2v4M8 18v4M16 18v4M2 8h4M2 16h4M18 8h4M18 16h4"/>
    </svg>`,
  },
  {
    title: 'Análisis y reportes',
    desc: 'Visualiza tendencias de entradas y salidas, identifica productos de alto riesgo y toma decisiones basadas en datos reales de tu operación.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-structure-base)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>`,
  },
  {
    title: 'Gestión de empleados',
    desc: 'Agrega colaboradores, asigna roles y controla el acceso según responsabilidades. Administra tu equipo desde un único panel centralizado.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-structure-base)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
  },
  {
    title: 'Roles y permisos',
    desc: 'Define quién puede ver qué. Administradores, managers y empleados tienen vistas y acciones adaptadas a su nivel de responsabilidad.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-structure-base)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`,
  },
  {
    title: 'Datos siempre actualizados',
    desc: 'Cada acción se refleja de inmediato en toda la plataforma. Sin desincronizaciones, sin datos viejos. Tu operación, en vivo.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-structure-base)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>`,
  },
];

const missionBlocks = [
  {
    label: 'Nuestra misión',
    title: 'Darle a cada negocio el control que merece',
    text: 'Creemos que la claridad operacional no debería ser exclusiva de las grandes empresas. FlowDesk nació para que cualquier negocio, sin importar su tamaño, pueda tomar decisiones informadas con las herramientas adecuadas. Simplificamos la complejidad para que tú te enfoques en crecer.',
  },
  {
    label: 'Nuestra visión',
    title: 'La plataforma que conecta cada parte de tu empresa',
    text: 'Imaginamos un futuro donde gestionar inventarios, equipos, clientes y finanzas ocurre desde un solo lugar, sin fricciones ni silos de información. FlowDesk será la columna vertebral operacional de los negocios modernos de Latinoamérica.',
  },
];
</script>

<style scoped>

.landing {
  font-family: 'DM Sans', var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg-app);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── NAVBAR ─────────────────────────────────────────────── */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(30, 39, 56, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 48px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.25s, box-shadow 0.25s;
  animation: slideDown 0.5s ease both;
}

.navbar--scrolled {
  background: rgba(30, 39, 56, 0.98);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}

@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}

/* Logo placeholder — el usuario reemplaza con <img> */
.navbar__logo-placeholder {
  width: 160px;
  height: 38px;
  border: 1.5px dashed rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.06em;
}

.navbar__logo-img {
  height: 38px;
  width: auto;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-ghost {
  padding: 8px 20px;
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'DM Sans', var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.btn-ghost:hover {
  border-color: rgba(255, 255, 255, 0.55);
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.btn-cta {
  padding: 9px 22px;
  border: none;
  border-radius: 8px;
  background: var(--color-warning);
  box-shadow: 0 2px 8px rgba(255, 167, 38, 0.35);
  color: #fff;
  font-family: 'DM Sans', var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s, transform 0.12s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.btn-cta:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}
.btn-cta:active { transform: translateY(0); }

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px 80px;
  position: relative;
  overflow: hidden;
  background: var(--color-structure-base);
}

.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.hero__bg::before {
  content: '';
  position: absolute;
  top: -20%; left: -10%;
  width: 60%; height: 80%;
  background: radial-gradient(ellipse at center, rgba(45, 88, 120, 0.55) 0%, transparent 70%);
  border-radius: 50%;
}
.hero__bg::after {
  content: '';
  position: absolute;
  bottom: -20%; right: -10%;
  width: 55%; height: 75%;
  background: radial-gradient(ellipse at center, rgba(197, 79, 68, 0.18) 0%, transparent 65%);
  border-radius: 50%;
}

.hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero__content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 820px;
  animation: fadeUp 0.8s ease 0.2s both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 99px;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 32px;
}

.hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  background: #4caf50;
  border-radius: 50%;
  box-shadow: 0 0 6px #4caf50;
  animation: pulse 2s infinite;
  flex-shrink: 0;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

.hero__heading {
  font-family: 'DM Serif Display', var(--font-sans);
  font-size: clamp(2.6rem, 6vw, 4.5rem);
  font-weight: 400;
  color: #fff;
  line-height: 1.12;
  margin-bottom: 24px;
  letter-spacing: -0.01em;
}
.hero__heading em {
  font-style: italic;
  color: var(--color-warning-hover);
}

.hero__sub {
  font-size: clamp(1rem, 2vw, 1.18rem);
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.7;
  max-width: 580px;
  margin: 0 auto 44px;
  font-weight: 300;
}

.hero__actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 72px;
}

.btn-hero-primary {
  padding: 14px 36px;
  border: none;
  border-radius: 10px;
  background: var(--color-warning);
  color: #fff;
  font-family: 'DM Sans', var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s, transform 0.12s, box-shadow 0.15s;
  box-shadow: 0 4px 16px rgba(197, 79, 68, 0.4);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.btn-hero-primary:hover {
  filter: brightness(1.12);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 167, 38, 0.45);
}

.btn-hero-ghost {
  padding: 13px 32px;
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  border-radius: 10px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'DM Sans', var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.btn-hero-ghost:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.hero__stats {
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  animation: fadeUp 0.8s ease 0.5s both;
}

.hero__stat {
  padding: 20px 40px;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.15s;
  flex: 1;
}
.hero__stat:last-child { border-right: none; }
.hero__stat:hover { background: rgba(255, 255, 255, 0.06); }

.hero__stat-number {
  font-family: 'DM Serif Display', var(--font-sans);
  font-size: 1.9rem;
  color: #fff;
  line-height: 1;
  margin: 0 0 4px;
}
.hero__stat-label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.38);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
}

/* ── FEATURES ───────────────────────────────────────────── */
.features {
  background: var(--color-bg-app);
  padding: 100px 24px;
}

.section-eyebrow {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0 0 12px;
}

.section-title {
  font-family: 'DM Serif Display', var(--font-sans);
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 400;
  color: var(--color-structure-base);
  text-align: center;
  margin: 0 0 16px;
  line-height: 1.2;
}

.section-sub {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 1rem;
  max-width: 520px;
  margin: 0 auto 64px;
  line-height: 1.7;
  font-weight: 300;
}

.features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1060px;
  margin: 0 auto;
}

.feature-card {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 16px;
  padding: 28px;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: var(--shadow-card);
}
.feature-card:hover {
  border-color: #b0bbd4;
  box-shadow: 0 8px 40px rgba(13, 17, 24, 0.14);
  transform: translateY(-3px);
}

.feature-card__icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--color-structure-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  flex-shrink: 0;
}

.feature-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-structure-base);
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.feature-card__desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.65;
  font-weight: 300;
  margin: 0;
}

.mission {
  background: var(--color-structure-base);
  padding: 100px 24px;
  position: relative;
  overflow: hidden;
}
.mission::before {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 40%; height: 100%;
  background: radial-gradient(ellipse at right, rgba(45, 88, 120, 0.4) 0%, transparent 60%);
  pointer-events: none;
}

.mission__inner {
  max-width: 1060px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: start;
  position: relative;
  z-index: 1;
}

.mission__block-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.mission__block-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.mission__block-title {
  font-family: 'DM Serif Display', var(--font-sans);
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  font-weight: 400;
  color: #fff;
  margin: 0 0 18px;
  line-height: 1.25;
}

.mission__block-text {
  font-size: 0.975rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.75;
  font-weight: 300;
  margin: 0;
}

.footer {
  background: #161d2a;
  padding: 28px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer__copy {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.28);
}

.footer__links {
  display: flex;
  gap: 20px;
}

.footer__link {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.28);
  transition: color 0.15s;
  text-decoration: none;
}
.footer__link:hover { color: rgba(255, 255, 255, 0.65); }

@media (max-width: 900px) {
  .features__grid { grid-template-columns: repeat(2, 1fr); }
  .mission__inner { grid-template-columns: 1fr; gap: 40px; }
}

@media (max-width: 600px) {
  .navbar { padding: 0 20px; }
  .features__grid { grid-template-columns: 1fr; }
  .hero__stats { flex-direction: column; }
  .hero__stat {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .hero__stat:last-child { border-bottom: none; }
  .footer { padding: 24px 20px; }
}
</style>