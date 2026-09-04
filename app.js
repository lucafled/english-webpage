const appRoot = document.querySelector('#app');
const sectionLabel = document.querySelector('#current-section');
const toastRoot = document.querySelector('#toast');

const pageNames = {
  inicio: 'Inicio',
  calendario: 'Horarios',
  login: 'Acceso alumno',
  'primer-acceso': 'Primer acceso',
  alumno: 'Mi clase',
  admin: 'Administración',
  'admin-calendario': 'Editar horarios',
  'admin-alumnos': 'Alumnos',
  proyecto: 'Proyecto',
};

const allowedViews = new Set(Object.keys(pageNames));
const state = {
  view: getViewFromHash(),
  firstAccessStep: 1,
  schedules: createDemoSchedules(),
  students: [
    { name: 'María López', username: 'maria.lopez', mode: 'Online', pending: false },
    { name: 'Tomás García', username: 'tomas.garcia', mode: 'Presencial', pending: true },
    { name: 'Sofía Hernández', username: 'sofia.h', mode: 'Online', pending: false },
  ],
};

function getViewFromHash() {
  const candidate = window.location.hash.replace('#', '');
  return allowedViews.has(candidate) ? candidate : 'inicio';
}

function escapeMarkup(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createDemoSchedules() {
  const monday = new Date();
  const daysUntilMonday = (8 - monday.getDay()) % 7 || 7;
  monday.setDate(monday.getDate() + daysUntilMonday);

  return [
    { id: 'slot-1', date: shiftDate(monday, 0), start: '16:00', end: '17:00', mode: 'Online', available: true },
    { id: 'slot-2', date: shiftDate(monday, 1), start: '17:30', end: '18:30', mode: 'Presencial', available: true },
    { id: 'slot-3', date: shiftDate(monday, 2), start: '10:00', end: '11:00', mode: 'Online', available: true },
    { id: 'slot-4', date: shiftDate(monday, 3), start: '18:00', end: '19:00', mode: 'Online', available: false },
    { id: 'slot-5', date: shiftDate(monday, 4), start: '15:00', end: '16:00', mode: 'Presencial', available: true },
  ];
}

function shiftDate(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateParts(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);
  return {
    day: date.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', ''),
    number: date.toLocaleDateString('es-MX', { day: '2-digit' }),
    month: date.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
    long: date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }),
  };
}

function showToast(message) {
  toastRoot.textContent = message;
  toastRoot.classList.add('is-visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toastRoot.classList.remove('is-visible'), 3000);
}

function button(label, view, className = 'button button-outline') {
  return `<button class="${className}" type="button" data-view="${view}">${label}</button>`;
}

function renderHome() {
  const availableCount = state.schedules.filter((schedule) => schedule.available).length;
  return `
    <section class="view">
      <div class="hero-grid">
        <article class="hero-card">
          <div>
            <p class="eyebrow">Tu espacio para aprender</p>
            <h1>Inglés con estructura, práctica y acompañamiento.</h1>
            <p>Clases presenciales u online, para todas las edades. Horarios flexibles y seguimiento personalizado.</p>
          </div>
          <div class="hero-actions">
            ${button('Ver horarios disponibles <span aria-hidden="true">→</span>', 'calendario', 'button button-primary')}
            ${button('Entrar como alumno', 'login', 'button button-secondary')}
          </div>
        </article>

        <div class="hero-side">
          <article class="mini-card accent">
            <p class="mini-card-label">Esta semana</p>
            <p class="mini-number">${availableCount}</p>
            <p class="mini-copy">horarios disponibles para elegir tu próxima clase.</p>
          </article>
          <article class="mini-card">
            <p class="mini-card-label">Próximo paso</p>
            <div class="next-class">
              <div><strong>Conocé tu espacio</strong><span>Empezá por consultar los horarios.</span></div>
              <span class="calendar-mark" aria-hidden="true">▦</span>
            </div>
          </article>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card"><p>Modalidades</p><strong>2</strong><span>Online y presencial</span></div>
        <div class="stat-card"><p>Roles incluidos</p><strong>2</strong><span>Alumno y admin</span></div>
        <div class="stat-card"><p>Seguimiento</p><strong>1:1</strong><span>Personalizado</span></div>
      </div>

      <div class="section-header"><div><h2 class="section-title">Todo lo que necesitás, en un solo lugar</h2><p class="section-subtitle">La estructura de la plataforma original, convertida en una experiencia clara.</p></div></div>
      <div class="feature-grid">
        <article class="feature-card"><div class="feature-icon" aria-hidden="true">◷</div><h3>Horarios flexibles</h3><p>Consultá la disponibilidad pública y encontrá un momento que se adapte a tu semana.</p></article>
        <article class="feature-card"><div class="feature-icon" aria-hidden="true">✦</div><h3>Aprendizaje a tu ritmo</h3><p>Un acceso simple para que cada alumno pueda seguir su agenda y sus próximas clases.</p></article>
        <article class="feature-card"><div class="feature-icon" aria-hidden="true">↗</div><h3>Seguimiento cercano</h3><p>La administración reúne alumnos, agenda y horarios en un mismo panel de trabajo.</p></article>
      </div>
    </section>`;
}

function renderScheduleRow(schedule, admin = false) {
  const parts = dateParts(schedule.date);
  const status = schedule.available ? 'Disponible' : 'Ocupado';
  return `
    <div class="schedule-item">
      <div class="schedule-date">${parts.day}<span>${parts.number} ${parts.month}</span></div>
      <div><div class="schedule-time">${schedule.start} — ${schedule.end}</div><div class="schedule-mode">${schedule.mode}</div></div>
      ${admin
        ? `<button class="tag ${schedule.available ? '' : 'busy'}" type="button" data-action="toggle-slot" data-id="${schedule.id}" aria-label="Cambiar disponibilidad de ${schedule.start}">${status}</button>`
        : `<span class="tag ${schedule.available ? '' : 'busy'}">${status}</span>`}
    </div>`;
}

function renderCalendar() {
  const availableSchedules = state.schedules.filter((schedule) => schedule.available);
  return `
    <section class="view">
      <div class="page-top"><div><p class="eyebrow">Agenda pública</p><h1 class="page-heading">Horarios disponibles</h1><p class="page-lede">Consultá los horarios libres. Para reservar tu clase, escribinos por WhatsApp o email.</p></div><div class="page-top-actions">${button('Soy alumno', 'login', 'button button-primary')}</div></div>
      <div class="panel-grid">
        <article class="panel"><div class="section-header"><div><h2 class="section-title">Próximos espacios</h2><p class="section-subtitle">Una vista rápida de la disponibilidad.</p></div><span class="tag blue">${availableSchedules.length} libres</span></div><div class="schedule-list">${availableSchedules.map((schedule) => renderScheduleRow(schedule)).join('')}</div><div class="info-note"><span aria-hidden="true">ⓘ</span><span><strong>¿Encontraste un horario?</strong> Esta versión es una demo estática; el flujo original conecta la reserva con la base de datos.</span></div></article>
        <aside class="panel"><p class="eyebrow">Cómo empezar</p><h2 class="section-title">Tres pasos simples</h2><div class="timeline" style="margin-top:20px"><div class="timeline-item"><div class="timeline-rail"><span class="timeline-dot"></span></div><div><h4>Elegí un horario</h4><p>Revisá los espacios libres en el calendario.</p></div></div><div class="timeline-item"><div class="timeline-rail"><span class="timeline-dot"></span></div><div><h4>Escribinos</h4><p>Coordinamos tu clase por WhatsApp o email.</p></div></div><div class="timeline-item"><div class="timeline-rail"><span class="timeline-dot"></span></div><div><h4>Empezá a aprender</h4><p>Recibí tu acceso y seguí tu agenda.</p></div></div></div><div style="margin-top:22px">${button('Ver mi clase', 'alumno', 'button button-outline')}</div></aside>
      </div>
    </section>`;
}

function renderLogin() {
  return `
    <section class="view">
      <div class="form-panel panel">
        <div class="form-header"><p class="eyebrow">Área privada</p><h1 class="page-heading">Iniciar sesión</h1><p class="page-lede">Entrá para consultar tu próxima clase y tu agenda personal.</p></div>
        <form class="form-stack" id="login-form">
          <div class="field"><label for="login-username">Usuario</label><input id="login-username" name="username" autocomplete="username" required placeholder="tu.usuario" /></div>
          <div class="field"><label for="login-password">Contraseña</label><input id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="••••••••" /></div>
          <div class="form-actions"><button class="button button-primary" type="submit">Entrar <span aria-hidden="true">→</span></button><button class="text-button" type="button" data-view="primer-acceso">¿Es tu primera vez?</button></div>
        </form>
        <div class="form-divider">Accesos de demostración</div>
        <div class="demo-actions"><button class="button button-outline" type="button" data-action="demo-login" data-role="student">Entrar como alumno</button><button class="button button-quiet" type="button" data-action="demo-login" data-role="admin">Ver panel admin</button></div>
      </div>
    </section>`;
}

function renderFirstAccess() {
  const firstStep = state.firstAccessStep === 1;
  return `
    <section class="view">
      <div class="form-panel narrow panel">
        <div class="stepper"><div class="step ${firstStep ? 'is-active' : ''}"><span class="step-number">1</span><span>Usuario</span></div><span class="step-line"></span><div class="step ${firstStep ? '' : 'is-active'}"><span class="step-number">2</span><span>Contraseña</span></div></div>
        <div class="form-header"><p class="eyebrow">Bienvenido/a</p><h1 class="page-heading">Primer acceso</h1><p class="page-lede">Usá el usuario que te dio tu profesor/a para crear tu contraseña.</p></div>
        <form class="form-stack" id="first-access-form">
          ${firstStep
            ? '<div class="field"><label for="first-username">Tu usuario</label><input id="first-username" name="username" required placeholder="tu.usuario" /></div><div class="form-actions"><button class="button button-primary" type="submit">Continuar <span aria-hidden="true">→</span></button></div>'
            : '<div class="field"><label for="new-password">Creá tu contraseña</label><input id="new-password" name="password" type="password" minlength="6" required placeholder="Mínimo 6 caracteres" /></div><div class="field"><label for="confirm-password">Confirmala</label><input id="confirm-password" name="confirm" type="password" minlength="6" required placeholder="Repetí tu contraseña" /></div><div class="form-actions"><button class="button button-primary" type="submit">Crear contraseña y entrar</button><button class="text-button" type="button" data-action="reset-first-access">Volver</button></div>'}
        </form>
      </div>
    </section>`;
}

function renderStudent() {
  const nextSchedule = state.schedules.find((schedule) => schedule.available) || state.schedules[0];
  const parts = dateParts(nextSchedule.date);
  return `
    <section class="view">
      <div class="page-top"><div><p class="eyebrow">Área del alumno</p><h1 class="page-heading">Mi clase de inglés</h1><p class="page-lede">Todo listo para que puedas enfocarte en aprender.</p></div>${button('Cerrar sesión', 'login', 'button button-outline')}</div>
      <div class="profile-hero"><div class="profile-main"><div class="large-avatar">ML</div><div><h2>María López</h2><p>maria.lopez · Alumna online</p></div></div><span class="tag">Cuenta activa</span></div>
      <div class="dashboard-grid"><article class="class-card"><div class="class-card-header"><div><p class="eyebrow">Próxima clase</p><h3>Conversación y práctica</h3><p>Una hora para seguir avanzando.</p></div><span class="tag blue">Confirmada</span></div><div class="class-detail"><div><span>Fecha</span><strong>${parts.long}</strong></div><div><span>Horario</span><strong>${nextSchedule.start} — ${nextSchedule.end}</strong></div><div><span>Modalidad</span><strong>${nextSchedule.mode}</strong></div><div><span>Estado</span><strong>Confirmada</strong></div></div><button class="button button-primary" type="button" data-action="meet">Unirme a mi clase por Google Meet <span aria-hidden="true">↗</span></button></article><aside class="panel"><p class="eyebrow">Tu recorrido</p><h2 class="section-title">Seguimiento</h2><div class="timeline" style="margin-top:20px"><div class="timeline-item"><div class="timeline-rail"><span class="timeline-dot"></span></div><div><h4>Cuenta creada</h4><p>Tu acceso ya está listo.</p></div></div><div class="timeline-item"><div class="timeline-rail"><span class="timeline-dot"></span></div><div><h4>Próxima clase</h4><p>${parts.long} · ${nextSchedule.start}</p></div></div><div class="timeline-item"><div class="timeline-rail"><span class="timeline-dot"></span></div><div><h4>Próximo objetivo</h4><p>Seguir practicando conversación.</p></div></div></div></aside></div>
    </section>`;
}

function renderAdminTabs(active) {
  return `<div class="admin-nav"><button class="admin-tab ${active === 'agenda' ? 'is-active' : ''}" type="button" data-view="admin">Mi agenda</button><button class="admin-tab ${active === 'calendario' ? 'is-active' : ''}" type="button" data-view="admin-calendario">Editar horarios</button><button class="admin-tab ${active === 'alumnos' ? 'is-active' : ''}" type="button" data-view="admin-alumnos">Alumnos</button></div>`;
}

function renderAdmin() {
  const confirmed = state.schedules.filter((schedule) => !schedule.available);
  return `
    <section class="view">
      <div class="admin-hero"><div><p class="eyebrow">Espacio de gestión</p><h1 class="page-heading">Panel de administración</h1><p class="page-lede">Agenda, horarios y alumnos en un mismo lugar.</p></div><span class="tag pending">Vista admin</span></div>
      ${renderAdminTabs('agenda')}
      <div class="admin-grid"><article class="panel"><div class="section-header"><div><h2 class="section-title">Mi agenda de clases confirmadas</h2><p class="section-subtitle">Una vista rápida de las próximas sesiones.</p></div><span class="tag blue">${confirmed.length} confirmada${confirmed.length === 1 ? '' : 's'}</span></div>${confirmed.length ? confirmed.map((schedule, index) => { const parts = dateParts(schedule.date); return `<div class="agenda-row"><div class="agenda-date">${parts.day}<span>${parts.number} ${parts.month}</span></div><div><div class="agenda-name">${index === 0 ? 'María López' : 'Tomás García'}</div><div class="agenda-meta">${schedule.start} — ${schedule.end} · ${schedule.mode}</div></div><span class="tag">Confirmada</span></div>`; }).join('') : '<div class="empty-state"><strong>Todavía no hay clases</strong>Las clases confirmadas aparecerán acá.</div>'}</article><aside class="panel"><p class="eyebrow">Resumen</p><h2 class="section-title">La semana en números</h2><div class="stats-row" style="grid-template-columns:1fr; margin:20px 0 0"><div class="stat-card"><p>Alumnos activos</p><strong>${state.students.length}</strong><span>En seguimiento</span></div><div class="stat-card"><p>Horarios publicados</p><strong>${state.schedules.filter((schedule) => schedule.available).length}</strong><span>Disponibles</span></div></div></aside></div>
    </section>`;
}

function renderAdminCalendar() {
  const base = new Date(`${state.schedules[0].date}T12:00:00`);
  const calendarDays = Array.from({ length: 35 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - base.getDay() + 1 + index);
    const dateValue = date.toISOString().slice(0, 10);
    const slots = state.schedules.filter((schedule) => schedule.date === dateValue);
    const isCurrent = dateValue === new Date().toISOString().slice(0, 10);
    return `<div class="calendar-day ${isCurrent ? 'today' : ''}"><div class="calendar-day-number">${date.getDate()}</div>${slots.map((slot) => `<span class="slot ${slot.available ? '' : 'busy'}">${slot.start}<br>${slot.available ? 'libre' : 'ocupado'}</span>`).join('')}</div>`;
  }).join('');
  return `
    <section class="view">
      <div class="admin-hero"><div><p class="eyebrow">Espacio de gestión</p><h1 class="page-heading">Editar horarios</h1><p class="page-lede">Hacé clic en un horario para cambiar su disponibilidad o agregá un nuevo espacio.</p></div>${button('+ Agregar horario', 'admin-calendario', 'button button-primary')}</div>
      ${renderAdminTabs('calendario')}
      <div class="panel"><div class="section-header"><div><h2 class="section-title">Calendario de disponibilidad</h2><p class="section-subtitle">Vista de demostración inspirada en `CalendarioAdmin`.</p></div><button class="button button-outline" type="button" data-action="add-slot">+ Nuevo espacio</button></div><div class="calendar-grid"><div class="calendar-day-name">Lun</div><div class="calendar-day-name">Mar</div><div class="calendar-day-name">Mié</div><div class="calendar-day-name">Jue</div><div class="calendar-day-name">Vie</div><div class="calendar-day-name">Sáb</div><div class="calendar-day-name">Dom</div>${calendarDays}</div><div class="calendar-legend"><span><i class="legend-dot"></i>Disponible</span><span><i class="legend-dot busy"></i>Ocupado</span><span><i class="legend-dot today"></i>Hoy</span></div><div class="info-note"><span aria-hidden="true">ⓘ</span><span>En la aplicación original, estos cambios se guardan mediante las rutas protegidas de Supabase.</span></div></div>
    </section>`;
}

function renderAdminStudents() {
  return `
    <section class="view">
      <div class="admin-hero"><div><p class="eyebrow">Espacio de gestión</p><h1 class="page-heading">Alumnos</h1><p class="page-lede">Creá alumnos y compartiles su usuario para el primer acceso.</p></div></div>
      ${renderAdminTabs('alumnos')}
      <div class="admin-grid"><article class="panel"><p class="eyebrow">Alta rápida</p><h2 class="section-title">Nuevo alumno</h2><form class="student-form" id="student-form" style="margin-top:18px"><div class="field"><label for="student-name">Nombre completo</label><input id="student-name" name="name" required placeholder="Nombre y apellido" /></div><div class="field"><label for="student-username">Username</label><input id="student-username" name="username" required placeholder="nombre.apellido" /></div><div class="field"><label for="student-mode">Modalidad</label><select id="student-mode" name="mode"><option>Online</option><option>Presencial</option></select></div><button class="button button-primary" type="submit">Crear alumno</button></form></article><article class="panel"><div class="section-header"><div><h2 class="section-title">Alumnos actuales</h2><p class="section-subtitle">${state.students.length} perfiles en seguimiento.</p></div></div><div class="student-list">${state.students.map((student) => `<div class="student-row"><div class="student-id"><div class="student-avatar">${student.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</div><div><strong>${escapeMarkup(student.name)}</strong><span>${escapeMarkup(student.username)} · ${escapeMarkup(student.mode)}</span></div></div>${student.pending ? '<span class="tag pending">Primer acceso</span>' : '<span class="tag">Activo</span>'}</div>`).join('')}</div></article></div>
    </section>`;
}

function renderProject() {
  const routes = [
    ['/','Landing pública'],
    ['/calendario','Horarios públicos'],
    ['/login','Acceso con roles'],
    ['/primer-acceso','Creación de contraseña'],
    ['/alumno/dashboard','Panel del alumno'],
    ['/admin/agenda','Agenda confirmada'],
    ['/admin/calendario','Gestión de horarios'],
    ['/admin/alumnos','Alta y seguimiento'],
  ];
  return `
    <section class="view">
      <div class="page-top"><div><p class="eyebrow">Contenido de plataforma-ingles</p><h1 class="page-heading">El proyecto, convertido en sitio.</h1><p class="page-lede">Esta vista reúne la estructura y la intención de la carpeta que señalaste, sin perder sus piezas importantes.</p></div><span class="tag blue">Static edition</span></div>
      <div class="project-grid"><article class="panel"><p class="eyebrow">Stack original</p><h2 class="section-title">Una base lista para crecer</h2><p class="section-subtitle">La aplicación de origen combina una interfaz clara con un backend preparado para roles y agenda.</p><div class="tech-list"><span class="tech-tag">Next.js 14</span><span class="tech-tag">React 18</span><span class="tech-tag">Supabase</span><span class="tech-tag">NextAuth</span><span class="tech-tag">Tailwind CSS</span></div><div class="project-note"><strong>Qué cambia en GitHub Pages:</strong> el hosting es estático, por eso esta publicación muestra y recorre los flujos de la plataforma, mientras que login, escritura de datos y seguridad quedan documentados como capacidades del proyecto original.</div></article><article class="panel"><div class="section-header"><div><h2 class="section-title">Rutas incluidas</h2><p class="section-subtitle">Las pantallas que estaban dentro de `src/app`.</p></div></div><table class="route-table"><thead><tr><th>Ruta</th><th>Qué hace</th></tr></thead><tbody>${routes.map(([route, description]) => `<tr><td>${route}</td><td>${description}</td></tr>`).join('')}</tbody></table></article></div>
      <article class="panel" style="margin-top:18px"><div class="section-header"><div><p class="eyebrow">Modelo de datos</p><h2 class="section-title">Cuatro tablas para sostener la experiencia</h2><p class="section-subtitle">Tomadas del esquema SQL incluido en la carpeta original.</p></div></div><div class="data-model"><div class="data-card"><strong>usuarios</strong><span>Roles y credenciales.</span></div><div class="data-card"><strong>alumnos</strong><span>Datos de cada estudiante.</span></div><div class="data-card"><strong>horarios</strong><span>Disponibilidad pública.</span></div><div class="data-card"><strong>clases</strong><span>Sesiones confirmadas.</span></div></div></article>
    </section>`;
}

function renderView() {
  const renderers = {
    inicio: renderHome,
    calendario: renderCalendar,
    login: renderLogin,
    'primer-acceso': renderFirstAccess,
    alumno: renderStudent,
    admin: renderAdmin,
    'admin-calendario': renderAdminCalendar,
    'admin-alumnos': renderAdminStudents,
    proyecto: renderProject,
  };
  state.view = getViewFromHash();
  appRoot.innerHTML = renderers[state.view]();
  sectionLabel.textContent = pageNames[state.view];
  document.querySelectorAll('.nav-item').forEach((navItem) => {
    navItem.classList.toggle('is-active', navItem.dataset.view === state.view || (state.view.startsWith('admin') && navItem.dataset.view === 'admin'));
    navItem.setAttribute('aria-current', navItem.classList.contains('is-active') ? 'page' : 'false');
  });
}

function navigate(view) {
  if (view === state.view) {
    renderView();
    return;
  }
  window.location.hash = view;
}

document.addEventListener('click', (event) => {
  const viewTarget = event.target.closest('[data-view]');
  if (viewTarget) {
    navigate(viewTarget.dataset.view);
    return;
  }

  const actionTarget = event.target.closest('[data-action]');
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;

  if (action === 'demo-login') {
    showToast(actionTarget.dataset.role === 'admin' ? 'Demo admin lista: abrimos la agenda.' : 'Demo alumno lista: abrimos tu próxima clase.');
    navigate(actionTarget.dataset.role === 'admin' ? 'admin' : 'alumno');
  }

  if (action === 'reset-first-access') {
    state.firstAccessStep = 1;
    renderView();
  }

  if (action === 'meet') {
    showToast('En la aplicación conectada, este botón abre tu enlace de Google Meet.');
  }

  if (action === 'toggle-slot') {
    const schedule = state.schedules.find((item) => item.id === actionTarget.dataset.id);
    if (schedule) {
      schedule.available = !schedule.available;
      showToast(`Horario marcado como ${schedule.available ? 'disponible' : 'ocupado'}.`);
      renderView();
    }
  }

  if (action === 'add-slot') {
    const lastSchedule = state.schedules[state.schedules.length - 1];
    const nextDate = shiftDate(new Date(`${lastSchedule.date}T12:00:00`), 1);
    state.schedules.push({ id: `slot-${Date.now()}`, date: nextDate, start: '17:00', end: '18:00', mode: 'Online', available: true });
    showToast('Nuevo horario agregado a la demo.');
    renderView();
  }
});

document.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;

  if (form.id === 'login-form') {
    const formData = new FormData(form);
    const username = String(formData.get('username') || '').toLowerCase();
    showToast('Acceso de demostración iniciado.');
    navigate(username.includes('admin') ? 'admin' : 'alumno');
  }

  if (form.id === 'first-access-form') {
    const formData = new FormData(form);
    if (state.firstAccessStep === 1) {
      state.firstAccessStep = 2;
      renderView();
      return;
    }
    const password = String(formData.get('password') || '');
    const confirm = String(formData.get('confirm') || '');
    if (password.length < 6 || password !== confirm) {
      showToast('Revisá que ambas contraseñas coincidan y tengan 6 caracteres.');
      return;
    }
    state.firstAccessStep = 1;
    showToast('Contraseña creada en la demo.');
    navigate('alumno');
  }

  if (form.id === 'student-form') {
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const username = String(formData.get('username') || '').trim();
    const mode = String(formData.get('mode') || 'Online');
    state.students.unshift({ name, username, mode, pending: true });
    showToast(`Alumno ${name} agregado a la demo.`);
    renderView();
  }
});

window.addEventListener('hashchange', renderView);
renderView();
