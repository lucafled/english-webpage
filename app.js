const appRoot = document.querySelector('#app');
const toastRoot = document.querySelector('#toast');
const siteNav = document.querySelector('#site-nav');
const menuToggle = document.querySelector('.menu-toggle');
const resourceDialog = document.querySelector('#resource-dialog');

const pageNames = {
  inicio: 'Inicio',
  clases: 'Clases',
  espacio: 'Mi espacio',
  recursos: 'Recursos',
  proyecto: 'Proyecto',
  acceso: 'Acceso',
};

const resources = [
  { id: 'pronunciacion', category: 'Pronunciación', title: 'Sonidos que cambian el significado', description: 'Una guía breve para escuchar, repetir y ganar confianza con los sonidos más comunes.', tag: 'Hablar', icon: '◌', tone: 'teal', body: '<p>Empieza con tres pasos sencillos: escucha una frase corta, repítela lentamente y vuelve a decirla a velocidad natural.</p><ul><li>Marca la sílaba que recibe más fuerza.</li><li>Grábate durante 30 segundos.</li><li>Compara tu ritmo, no solo cada sonido.</li></ul>' },
  { id: 'frases', category: 'Conversación', title: 'Frases para tu próxima clase', description: 'Expresiones útiles para pedir aclaraciones, compartir una opinión y mantener la conversación.', tag: 'Práctica', icon: '✦', tone: 'sun', body: '<p>Guarda estas frases para usarlas en clase: <em>Could you say that again?</em>, <em>In my opinion…</em> y <em>What I mean is…</em>.</p><ul><li>Úsala una vez durante la sesión.</li><li>Escribe una variación propia.</li><li>Vuelve a practicarla al día siguiente.</li></ul>' },
  { id: 'gramatica', category: 'Gramática', title: 'Presente simple sin complicaciones', description: 'Una explicación visual para hablar de rutinas, hábitos y hechos generales.', tag: 'Fundamentos', icon: 'Aa', tone: 'blue', body: '<p>Usamos el presente simple para rutinas y hechos. Recuerda: con <em>he, she, it</em>, el verbo suele llevar <em>-s</em>.</p><ul><li>I work online every Tuesday.</li><li>She studies in the afternoon.</li><li>Do you practice at home?</li></ul>' },
  { id: 'vocabulario', category: 'Vocabulario', title: 'Aprende en bloques pequeños', description: 'Un método fácil para convertir palabras nuevas en vocabulario que sí usas.', tag: 'Hábitos', icon: '＋', tone: 'coral', body: '<p>Elige cinco palabras relacionadas y crea una frase real para cada una. El objetivo es usarlas, no solo reconocerlas.</p><ul><li>Relaciona cada palabra con una imagen.</li><li>Escríbela en una frase propia.</li><li>Repásala después de 1, 3 y 7 días.</li></ul>' },
  { id: 'primer-acceso', category: 'Orientación', title: 'Tu primer acceso', description: 'Qué puedes hacer en tu espacio y cómo se vería el recorrido de una clase.', tag: 'Bienvenida', icon: '→', tone: 'teal', body: '<p>Esta versión usa un acceso de demostración. En la aplicación completa, aquí crearías tu contraseña y entrarías a tu agenda personal.</p><ul><li>Consulta tu próxima clase.</li><li>Revisa tu progreso.</li><li>Abre el enlace de videollamada cuando esté conectado.</li></ul>' },
  { id: 'estudio', category: 'Organización', title: 'Plan de estudio semanal', description: 'Una estructura ligera para practicar sin llenar tu semana de tareas.', tag: 'Plan', icon: '▦', tone: 'blue', body: '<p>Reserva tres momentos breves: una sesión de clase, una práctica de escucha y un repaso de vocabulario.</p><ul><li>Clase: 50–60 minutos.</li><li>Escucha: 10 minutos.</li><li>Repaso: 10 minutos.</li></ul>' },
];

const state = {
  route: getRoute(),
  role: localStorage.getItem('nexo-role') || '',
  firstAccessStep: 1,
  search: '',
  level: 'Todos',
  mode: 'Todos',
  resourceSearch: '',
  schedules: createSchedules(),
  bookings: JSON.parse(localStorage.getItem('nexo-bookings') || '[]'),
};

function getRoute() {
  const route = window.location.hash.replace('#', '').split('?')[0];
  return Object.hasOwn(pageNames, route) ? route : 'inicio';
}

function escapeMarkup(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function dateAtNoon(value) {
  return new Date(`${value}T12:00:00`);
}

function shiftDate(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createSchedules() {
  const today = new Date();
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysUntilMonday);
  return [
    { id: 'slot-1', date: shiftDate(monday, 0), start: '16:00', end: '17:00', mode: 'Online', level: 'A1–A2', available: true },
    { id: 'slot-2', date: shiftDate(monday, 1), start: '17:30', end: '18:30', mode: 'Presencial', level: 'B1', available: true },
    { id: 'slot-3', date: shiftDate(monday, 2), start: '10:00', end: '11:00', mode: 'Online', level: 'A2–B1', available: true },
    { id: 'slot-4', date: shiftDate(monday, 3), start: '18:00', end: '19:00', mode: 'Online', level: 'B2', available: false },
    { id: 'slot-5', date: shiftDate(monday, 4), start: '15:00', end: '16:00', mode: 'Presencial', level: 'A1–A2', available: true },
  ];
}

function formatDate(dateValue, options = {}) {
  return dateAtNoon(dateValue).toLocaleDateString('es-MX', { ...options });
}

function formatScheduleDate(dateValue) {
  return {
    number: formatDate(dateValue, { day: '2-digit' }),
    day: formatDate(dateValue, { weekday: 'short' }).replace('.', ''),
    long: formatDate(dateValue, { weekday: 'long', day: 'numeric', month: 'long' }),
  };
}

function showToast(message) {
  toastRoot.textContent = message;
  toastRoot.classList.add('is-visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toastRoot.classList.remove('is-visible'), 3200);
}

function routeLink(label, route, className = 'button button-secondary') {
  return `<a class="${className}" href="#${route}" data-route="${route}">${label}</a>`;
}

function renderHome() {
  const availableCount = state.schedules.filter((schedule) => schedule.available).length;
  const weekRows = state.schedules.slice(0, 4).map((schedule) => {
    const date = formatScheduleDate(schedule.date);
    return `<div class="week-row"><div class="week-day">${escapeMarkup(date.day)}</div><div><strong>${escapeMarkup(schedule.level)} · ${escapeMarkup(schedule.mode)}</strong><span>${escapeMarkup(date.long)}</span></div><div class="week-time">${escapeMarkup(schedule.start)}</div></div>`;
  }).join('');

  return `<section class="view home-view">
    <div class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Una ruta clara para aprender</p>
        <h1>Inglés con <em>estructura</em>, práctica y acompañamiento.</h1>
        <p class="hero-lede">Clases presenciales u online para distintas edades y niveles. Consulta horarios, encuentra recursos y sigue tu avance desde un solo lugar.</p>
        <div class="hero-actions">${routeLink('Explorar clases <span aria-hidden="true">→</span>', 'clases', 'button button-primary')}${routeLink('Entrar a mi espacio', 'acceso', 'button button-secondary')}</div>
      </div>
      <div class="hero-visual" aria-label="Vista previa de horarios disponibles">
        <div class="visual-heading"><div><small>Agenda de esta semana</small><strong>Encuentra tu ritmo</strong></div><span class="visual-badge">${availableCount} espacios</span></div>
        <div class="week-card">${weekRows}</div>
        <div class="visual-foot"><span>Online + presencial</span><strong>1:1</strong></div>
      </div>
    </div>
    <div class="trust-strip"><div class="trust-item"><span class="trust-icon" aria-hidden="true">◌</span><div><strong>Dos modalidades</strong><span>Elige cómo prefieres aprender.</span></div></div><div class="trust-item"><span class="trust-icon" aria-hidden="true">✦</span><div><strong>Seguimiento personal</strong><span>Un espacio pensado para tu avance.</span></div></div><div class="trust-item"><span class="trust-icon" aria-hidden="true">▦</span><div><strong>Horarios visibles</strong><span>Consulta opciones antes de reservar.</span></div></div></div>
    <div class="section-block"><div class="section-intro"><div><p class="eyebrow">Un solo lugar</p><h2 class="section-title">Todo lo que necesitas para avanzar.</h2><p class="section-subtitle">La estructura de la carpeta original convertida en una experiencia pública, clara y fácil de recorrer.</p></div>${routeLink('Ver mi espacio →', 'espacio', 'section-link')}</div><div class="feature-grid"><article class="feature-card"><div class="feature-number"><span>01</span><span aria-hidden="true">↗</span></div><h3>Clases</h3><p>Explora niveles, modalidades y horarios disponibles sin perderte.</p></article><article class="feature-card"><div class="feature-number"><span>02</span><span aria-hidden="true">↗</span></div><h3>Mi espacio</h3><p>Una vista de alumno con próxima clase, avance y agenda confirmada.</p></article><article class="feature-card"><div class="feature-number"><span>03</span><span aria-hidden="true">↗</span></div><h3>Recursos</h3><p>Guías breves para practicar conversación, gramática y vocabulario.</p></article><article class="feature-card"><div class="feature-number"><span>04</span><span aria-hidden="true">↗</span></div><h3>Administración</h3><p>Una previsualización del panel para gestionar horarios y alumnos.</p></article></div></div>
    <div class="section-block"><div class="section-intro"><div><p class="eyebrow">Empieza por aquí</p><h2 class="section-title">Clases pensadas para la vida real.</h2></div>${routeLink('Ver todos los horarios →', 'clases', 'section-link')}</div><div class="class-grid"><article class="class-card"><div class="class-card-top"><span class="class-icon" aria-hidden="true">◌</span><span class="tag">A1–A2</span></div><h3>Fundamentos</h3><p>Construye una base práctica para presentarte, describir rutinas y sentirte cómodo en clase.</p><div class="class-meta"><span>◷ 50 min</span><span>⌁ Online</span></div></article><article class="class-card"><div class="class-card-top"><span class="class-icon" aria-hidden="true">✦</span><span class="tag blue">A2–B1</span></div><h3>Conversación</h3><p>Practica ideas, preguntas y respuestas con acompañamiento para ganar fluidez.</p><div class="class-meta"><span>◷ 60 min</span><span>⌁ Flexible</span></div></article><article class="class-card"><div class="class-card-top"><span class="class-icon" aria-hidden="true">Aa</span><span class="tag coral">B1–B2</span></div><h3>Inglés para tus objetivos</h3><p>Organiza tu práctica alrededor de trabajo, estudios, viajes o una meta concreta.</p><div class="class-meta"><span>◷ 60 min</span><span>⌁ 1:1</span></div></article></div></div>
    <div class="section-block"><div class="cta-panel"><div><h2>Tu próxima conversación puede empezar hoy.</h2><p>Consulta los espacios disponibles o entra a la demo para conocer el recorrido completo de la plataforma.</p></div>${routeLink('Ver horarios', 'clases', 'button button-secondary')}</div></div>
  </section>`;
}

function filteredSchedules() {
  const query = state.search.trim().toLowerCase();
  return state.schedules.filter((schedule) => {
    const matchesQuery = !query || `${schedule.mode} ${schedule.level} ${schedule.date}`.toLowerCase().includes(query);
    const matchesLevel = state.level === 'Todos' || schedule.level === state.level;
    const matchesMode = state.mode === 'Todos' || schedule.mode === state.mode;
    return matchesQuery && matchesLevel && matchesMode;
  });
}

function renderScheduleRow(schedule) {
  const date = formatScheduleDate(schedule.date);
  const booked = state.bookings.includes(schedule.id);
  const actionLabel = booked ? 'Guardado' : schedule.available ? 'Elegir' : 'No disponible';
  return `<div class="schedule-row"><div class="schedule-date"><strong>${escapeMarkup(date.number)}</strong><span>${escapeMarkup(date.day)}</span></div><div class="schedule-info"><strong>Clase de inglés · ${escapeMarkup(schedule.level)}</strong><span>${escapeMarkup(schedule.mode)} · ${escapeMarkup(date.long)}</span></div><div><span class="schedule-time">${escapeMarkup(schedule.start)}–${escapeMarkup(schedule.end)}</span><span class="availability ${schedule.available ? '' : 'busy'}">${schedule.available ? 'Disponible' : 'Ocupado'}</span></div><button class="button ${booked ? 'button-secondary' : 'button-primary'}" type="button" data-action="book-slot" data-id="${schedule.id}" ${!schedule.available || booked ? 'disabled' : ''}>${actionLabel}</button></div>`;
}

function renderClasses() {
  const schedules = filteredSchedules();
  const levels = ['Todos', 'A1–A2', 'A2–B1', 'B1', 'B2'];
  return `<section class="view"><div class="page-head"><div><p class="eyebrow">Clases y horarios</p><h1 class="page-heading">Encuentra un espacio que te funcione.</h1><p class="page-lede">Filtra por nivel o modalidad y guarda una opción en esta demo local. En la aplicación completa, el horario se confirmaría desde la base de datos.</p></div><div class="page-actions">${routeLink('Entrar a mi espacio', 'acceso', 'button button-primary')}</div></div><div class="section-block"><div class="section-intro"><div><p class="eyebrow">Catálogo</p><h2 class="section-title">Elige cómo quieres practicar.</h2></div></div><div class="class-grid"><article class="class-card"><div class="class-card-top"><span class="class-icon" aria-hidden="true">◌</span><span class="tag">A1–A2</span></div><h3>Fundamentos</h3><p>Una base para comunicarte con más seguridad en situaciones cotidianas.</p><div class="class-meta"><span>◷ 50 min</span><span>⌁ Online</span></div></article><article class="class-card"><div class="class-card-top"><span class="class-icon" aria-hidden="true">✦</span><span class="tag blue">A2–B1</span></div><h3>Conversación</h3><p>Más práctica guiada para participar, preguntar y expresar tus ideas.</p><div class="class-meta"><span>◷ 60 min</span><span>⌁ Online o presencial</span></div></article><article class="class-card"><div class="class-card-top"><span class="class-icon" aria-hidden="true">Aa</span><span class="tag coral">B1–B2</span></div><h3>Objetivos específicos</h3><p>Sesiones adaptadas a tu trabajo, estudios, viajes o proyecto personal.</p><div class="class-meta"><span>◷ 60 min</span><span>⌁ 1:1</span></div></article></div></div><div class="schedule-panel"><div class="schedule-head"><div><h2>Horarios visibles</h2><p>La semana de <span id="schedule-week">${escapeMarkup(formatDate(state.schedules[0].date, { day: 'numeric', month: 'long' }))}</span> · hora local de tu navegador.</p></div><span class="tag blue">${schedules.filter((schedule) => schedule.available).length} disponibles</span></div><div class="filter-bar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="schedule-search" type="search" placeholder="Buscar por nivel o modalidad" value="${escapeMarkup(state.search)}" /></label><label class="filter-select"><span class="sr-only">Filtrar por nivel</span><select id="level-filter">${levels.map((level) => `<option ${state.level === level ? 'selected' : ''}>${level}</option>`).join('')}</select></label><label class="filter-select"><span class="sr-only">Filtrar por modalidad</span><select id="mode-filter"><option ${state.mode === 'Todos' ? 'selected' : ''}>Todos</option><option ${state.mode === 'Online' ? 'selected' : ''}>Online</option><option ${state.mode === 'Presencial' ? 'selected' : ''}>Presencial</option></select></label><span class="results-count">${schedules.length} horarios mostrados</span></div><div class="schedule-list">${schedules.length ? schedules.map(renderScheduleRow).join('') : '<div class="resource-empty">No encontramos horarios con esos filtros. Prueba con otra búsqueda.</div>'}</div><div class="schedule-note"><span aria-hidden="true">ⓘ</span><span><strong>Demo estática:</strong> el botón “Elegir” guarda tu selección en este navegador para que puedas probar el recorrido, pero no envía una reserva real.</span></div></div></section>`;
}

function getNextSchedule() {
  return state.schedules.find((schedule) => state.bookings.includes(schedule.id)) || state.schedules.find((schedule) => schedule.available) || state.schedules[0];
}

function renderStudentWorkspace() {
  const next = getNextSchedule();
  const date = formatScheduleDate(next.date);
  return `<div class="workspace-grid"><div class="panel"><div class="panel-head"><div><p class="eyebrow">Vista de alumno</p><h2>Hola, Luka.</h2><p class="panel-copy">Este es el recorrido de tu espacio personal en la demo.</p></div><span class="tag">Activo</span></div><div class="next-class-card"><div class="next-date"><strong>${escapeMarkup(date.number)}</strong><span>${escapeMarkup(date.day)}</span></div><div><strong>Tu próxima clase</strong><span>${escapeMarkup(next.mode)} · ${escapeMarkup(next.start)}–${escapeMarkup(next.end)} · ${escapeMarkup(next.level)}</span></div><button class="button button-secondary" type="button" data-action="meet">Abrir Meet <span aria-hidden="true">↗</span></button></div><div class="progress-block"><div class="progress-line"><span>Ruta de aprendizaje</span><span>68%</span></div><div class="progress-track" aria-label="Progreso 68%"><span></span></div></div><ul class="checklist"><li>Completar tu primer acceso</li><li>Elegir una modalidad</li><li class="pending">Practicar con un recurso esta semana</li></ul></div><aside class="panel"><div class="panel-head"><div><p class="eyebrow">Resumen</p><h2>Tu avance</h2></div><span aria-hidden="true">↗</span></div><div class="stat-grid"><div class="stat-panel"><strong>4</strong><span>clases completadas</span></div><div class="stat-panel"><strong>2</strong><span>recursos guardados</span></div><div class="stat-panel"><strong>1</strong><span>meta activa</span></div><div class="stat-panel"><strong>68%</strong><span>avance general</span></div></div><div class="mini-list"><div class="mini-list-item"><strong>Próximo paso</strong><span>Conversación</span></div><div class="mini-list-item"><strong>Modalidad</strong><span>${escapeMarkup(next.mode)}</span></div><div class="mini-list-item"><strong>Estado</strong><span>En seguimiento</span></div></div></aside></div><div class="section-block"><div class="section-intro"><div><p class="eyebrow">Tu agenda</p><h2 class="section-title">Clases confirmadas.</h2><p class="section-subtitle">Las selecciones que guardaste mientras pruebas la demo aparecen aquí.</p></div>${routeLink('Explorar horarios →', 'clases', 'section-link')}</div>${state.bookings.length ? `<div class="schedule-list">${state.bookings.map((id) => state.schedules.find((schedule) => schedule.id === id)).filter(Boolean).map(renderScheduleRow).join('')}</div>` : '<div class="resource-empty">Todavía no guardaste un horario. Explora las clases para elegir una opción.</div>'}</div>`;
}

function renderAdminWorkspace() {
  return `<div class="workspace-grid"><div class="panel"><div class="panel-head"><div><p class="eyebrow">Vista de administración</p><h2>Tu agenda de clases.</h2><p class="panel-copy">Una previsualización del panel que estaba descrito en la carpeta original.</p></div><span class="tag blue">Demo admin</span></div><div class="admin-tools"><div class="admin-tool-row"><div><strong>Agenda confirmada</strong><span>Revisa las clases que ya tienen alumno.</span></div><button class="button button-secondary" type="button" data-action="admin-toast">Abrir agenda</button></div><div class="admin-tool-row"><div><strong>Editar horarios</strong><span>Activa o desactiva espacios públicos.</span></div><button class="button button-secondary" type="button" data-action="admin-toast">Gestionar</button></div><div class="admin-tool-row"><div><strong>Alumnos</strong><span>Consulta altas y primeros accesos.</span></div><button class="button button-secondary" type="button" data-action="admin-toast">Ver alumnos</button></div></div></div><aside class="panel"><div class="panel-head"><div><p class="eyebrow">Esta semana</p><h2>Resumen</h2></div></div><div class="stat-grid"><div class="stat-panel"><strong>5</strong><span>horarios creados</span></div><div class="stat-panel"><strong>3</strong><span>alumnos de demo</span></div><div class="stat-panel"><strong>2</strong><span>modalidades</span></div><div class="stat-panel"><strong>0</strong><span>incidencias</span></div></div><div class="demo-note"><span aria-hidden="true">ⓘ</span><span>La edición de datos se queda en esta sesión. Supabase y las rutas protegidas pertenecen al proyecto original.</span></div></aside></div>`;
}

function renderWorkspace() {
  const isAdmin = state.role === 'admin';
  return `<section class="view"><div class="page-head"><div><p class="eyebrow">Espacio personal</p><h1 class="page-heading">Tu aprendizaje, en contexto.</h1><p class="page-lede">Entra como alumno para ver tu agenda o cambia a la vista admin para conocer el flujo de gestión.</p></div><div class="role-switch" aria-label="Cambiar vista"><button type="button" class="${!isAdmin ? 'is-active' : ''}" data-action="set-role" data-role="student">Alumno</button><button type="button" class="${isAdmin ? 'is-active' : ''}" data-action="set-role" data-role="admin">Admin</button></div></div>${state.role ? (isAdmin ? renderAdminWorkspace() : renderStudentWorkspace()) : `<div class="access-layout"><div class="access-card"><p class="eyebrow">Demo navegable</p><h2>Prueba tu espacio.</h2><p>Elige uno de los accesos de ejemplo para recorrer la plataforma sin crear una cuenta real.</p><div class="demo-login-grid"><button class="demo-login" type="button" data-action="set-role" data-role="student"><span><strong>Entrar como alumno</strong><span>Agenda, avance y próxima clase</span></span><b aria-hidden="true">→</b></button><button class="demo-login" type="button" data-action="set-role" data-role="admin"><span><strong>Ver vista de administración</strong><span>Horarios, agenda y alumnos</span></span><b aria-hidden="true">→</b></button></div></div><aside class="access-side"><h3>Qué puedes probar</h3><p>Los botones están conectados a interacciones locales para que la experiencia se sienta completa, incluso sin backend.</p><ul><li>Guardar un horario desde Clases.</li><li>Ver el cambio en tu agenda.</li><li>Simular un acceso por rol.</li><li>Consultar recursos y guías.</li></ul></aside></div>`}</section>`;
}

function filteredResources() {
  const query = state.resourceSearch.trim().toLowerCase();
  return resources.filter((resource) => !query || `${resource.title} ${resource.category} ${resource.description}`.toLowerCase().includes(query));
}

function renderResourceCard(resource) {
  return `<article class="resource-card"><div class="resource-card-top"><span class="class-icon ${resource.tone}" aria-hidden="true">${resource.icon}</span><span class="tag ${resource.tone === 'blue' ? 'blue' : resource.tone === 'coral' ? 'coral' : ''}">${resource.tag}</span></div><h3>${resource.title}</h3><p>${resource.description}</p><button class="button button-secondary" type="button" data-action="open-resource" data-id="${resource.id}">Abrir guía <span aria-hidden="true">↗</span></button></article>`;
}

function renderResources() {
  const filtered = filteredResources();
  return `<section class="view"><div class="page-head"><div><p class="eyebrow">Biblioteca de práctica</p><h1 class="page-heading">Pequeños recursos, avances reales.</h1><p class="page-lede">Una colección estática inspirada en el área de recursos del proyecto. Busca una guía y ábrela sin salir de la página.</p></div><div class="page-actions">${routeLink('Ir a mi espacio', 'espacio', 'button button-primary')}</div></div><div class="resource-search"><label class="search-field"><span aria-hidden="true">⌕</span><input id="resource-search" type="search" placeholder="Buscar un recurso" value="${escapeMarkup(state.resourceSearch)}" /></label></div><div class="resource-grid">${filtered.length ? filtered.map(renderResourceCard).join('') : '<div class="resource-empty">No encontramos ese recurso. Prueba con otra palabra.</div>'}</div><div class="study-plan"><div class="study-plan-intro"><p class="eyebrow" style="color:#b9ded8">Una semana ligera</p><h2>Practica sin saturarte.</h2><p>Combina una clase con dos momentos breves de escucha y repaso. La constancia importa más que llenar tu agenda.</p></div><div class="study-plan-list"><div class="study-step"><strong>01</strong><div><h3>Clase guiada</h3><p>Habla, pregunta y recibe correcciones.</p></div><span>50–60 min</span></div><div class="study-step"><strong>02</strong><div><h3>Escucha activa</h3><p>Escucha una conversación corta.</p></div><span>10 min</span></div><div class="study-step"><strong>03</strong><div><h3>Repaso rápido</h3><p>Usa cinco palabras nuevas.</p></div><span>10 min</span></div></div></div></section>`;
}

function renderProject() {
  const routes = [['#inicio', 'Landing pública'], ['#clases', 'Horarios y filtros'], ['#acceso', 'Acceso de demostración'], ['#espacio', 'Panel de alumno o admin'], ['#recursos', 'Biblioteca estática']];
  return `<section class="view"><div class="page-head"><div><p class="eyebrow">Contenido de plataforma-ingles</p><h1 class="page-heading">La carpeta, convertida en sitio.</h1><p class="page-lede">Esta publicación conserva las ideas centrales del proyecto original y las presenta en un recorrido estático que sí funciona en GitHub Pages.</p></div><span class="tag blue">Static edition</span></div><div class="project-grid"><article class="project-card"><p class="eyebrow">Qué se mejoró</p><h2>Una base lista para crecer.</h2><p>La navegación ahora tiene una portada pública, áreas diferenciadas para clases, espacio, recursos y proyecto, además de interacciones locales para probar el recorrido.</p><div class="tech-list"><span class="tech-tag">HTML semántico</span><span class="tech-tag">CSS responsive</span><span class="tech-tag">JavaScript vanilla</span><span class="tech-tag">GitHub Pages</span><span class="tech-tag">Accesibilidad básica</span></div><div class="project-alert"><strong>Importante:</strong> login, Supabase, NextAuth y la escritura segura de datos siguen siendo demo-only en GitHub Pages. Para producción, el proyecto original necesita un entorno con backend.</div></article><article class="project-card"><div class="panel-head"><div><p class="eyebrow">Mapa del sitio</p><h2>Rutas incluidas</h2><p class="panel-copy">Cada área tiene una entrada visible y una acción clara para volver a empezar.</p></div></div><table class="route-table"><thead><tr><th>Sección</th><th>Qué puedes hacer</th></tr></thead><tbody>${routes.map(([route, description]) => `<tr><td>${route}</td><td>${description}</td></tr>`).join('')}</tbody></table></article></div><div class="section-block"><div class="section-intro"><div><p class="eyebrow">Modelo original</p><h2 class="section-title">Las piezas que sostienen la idea.</h2><p class="section-subtitle">Estas entidades estaban previstas para la aplicación conectada y ahora quedan explicadas sin fingir que están activas.</p></div></div><div class="data-model"><div class="data-card"><strong>usuarios</strong><span>Roles y credenciales.</span></div><div class="data-card"><strong>alumnos</strong><span>Datos del estudiante.</span></div><div class="data-card"><strong>horarios</strong><span>Disponibilidad pública.</span></div><div class="data-card"><strong>clases</strong><span>Sesiones confirmadas.</span></div></div></div><div class="section-block"><div class="cta-panel"><div><h2>¿Quieres conectar la versión completa?</h2><p>Usa el proyecto original con un backend compatible o reemplaza el correo de ejemplo antes de publicar una versión comercial.</p></div><a class="button button-secondary" href="mailto:clases@nexo-ingles.example">Escribir a clases <span aria-hidden="true">↗</span></a></div></div></section>`;
}

function renderAccess() {
  return `<section class="view"><div class="page-head"><div><p class="eyebrow">Acceso al espacio</p><h1 class="page-heading">Entra a tu siguiente paso.</h1><p class="page-lede">Usa un acceso de demostración o revisa cómo sería el primer ingreso de un alumno.</p></div></div><div class="access-layout"><div class="access-card"><p class="eyebrow">Acceso de demo</p><h2>Bienvenido de vuelta.</h2><p>Estos datos solo cambian la vista local. No se envían a ningún servidor.</p><form class="form-stack" id="login-form"><div class="field"><label for="login-username">Usuario</label><input id="login-username" name="username" autocomplete="username" placeholder="maria.lopez o admin" required /></div><div class="field"><label for="login-password">Contraseña</label><input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Cualquier texto de demo" required /></div><div class="form-actions"><button class="button button-primary" type="submit">Entrar <span aria-hidden="true">→</span></button><button class="button button-text" type="button" data-action="toggle-first-access">¿Es tu primera vez?</button></div></form><div class="first-access" id="first-access-panel" hidden><p class="eyebrow">Primer acceso</p><p>En la aplicación conectada aquí crearías una contraseña propia. En esta edición, el flujo es solo visual.</p><button class="button button-secondary" type="button" data-action="first-access-demo">Comenzar primer acceso</button></div><div class="demo-login-grid"><button class="demo-login" type="button" data-action="set-role" data-role="student"><span><strong>Usar demo alumno</strong><span>Abre tu agenda personal</span></span><b aria-hidden="true">→</b></button><button class="demo-login" type="button" data-action="set-role" data-role="admin"><span><strong>Usar demo admin</strong><span>Abre la gestión de la plataforma</span></span><b aria-hidden="true">→</b></button></div></div><aside class="access-side"><h3>Qué queda conectado en producción</h3><p>La interfaz ya deja claro qué está disponible y qué necesita un backend real.</p><ul><li>Identidad y roles con NextAuth.</li><li>Horarios y alumnos en Supabase.</li><li>Rutas protegidas de administración.</li><li>Enlaces reales de videollamada.</li></ul></aside></div></section>`;
}

function render() {
  state.route = getRoute();
  const renderers = { inicio: renderHome, clases: renderClasses, espacio: renderWorkspace, recursos: renderResources, proyecto: renderProject, acceso: renderAccess };
  appRoot.innerHTML = renderers[state.route]();
  document.querySelectorAll('[data-route]').forEach((link) => link.classList.toggle('is-active', link.dataset.route === state.route));
  siteNav.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  document.title = `${pageNames[state.route]} · Nexo`;
}

function navigate(route) {
  window.location.hash = route;
}

function persistBookings() {
  localStorage.setItem('nexo-bookings', JSON.stringify(state.bookings));
}

function setRole(role) {
  state.role = role;
  localStorage.setItem('nexo-role', role);
  navigate('espacio');
  showToast(role === 'admin' ? 'Vista de administración activada.' : 'Tu espacio de alumno está listo.');
}

function openResource(id) {
  const resource = resources.find((item) => item.id === id);
  if (!resource) return;
  document.querySelector('#resource-dialog-kicker').textContent = resource.category;
  document.querySelector('#resource-dialog-title').textContent = resource.title;
  document.querySelector('#resource-dialog-body').innerHTML = resource.body;
  if (typeof resourceDialog.showModal === 'function') resourceDialog.showModal();
}

document.addEventListener('click', (event) => {
  const routeTarget = event.target.closest('[data-route]');
  if (routeTarget) {
    siteNav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    return;
  }

  const actionTarget = event.target.closest('[data-action]');
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;

  if (action === 'set-role') setRole(actionTarget.dataset.role);
  if (action === 'meet') showToast('En la aplicación conectada, aquí se abriría tu enlace de Google Meet.');
  if (action === 'admin-toast') showToast('Esta herramienta está lista como previsualización estática.');
  if (action === 'toggle-first-access') {
    const panel = document.querySelector('#first-access-panel');
    if (panel) panel.hidden = !panel.hidden;
  }
  if (action === 'first-access-demo') {
    showToast('Primer acceso iniciado en modo demo.');
    setRole('student');
  }
  if (action === 'close-dialog' && resourceDialog.open) resourceDialog.close();
  if (action === 'open-resource') openResource(actionTarget.dataset.id);
  if (action === 'book-slot') {
    const schedule = state.schedules.find((item) => item.id === actionTarget.dataset.id);
    if (!schedule || !schedule.available || state.bookings.includes(schedule.id)) return;
    state.bookings.push(schedule.id);
    persistBookings();
    showToast('Horario guardado en tu demo.');
    render();
  }
});

document.addEventListener('submit', (event) => {
  if (event.target.id !== 'login-form') return;
  event.preventDefault();
  const username = String(new FormData(event.target).get('username') || '').toLowerCase();
  setRole(username.includes('admin') ? 'admin' : 'student');
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'schedule-search') { state.search = event.target.value; render(); document.querySelector('#schedule-search')?.focus(); }
  if (event.target.id === 'resource-search') { state.resourceSearch = event.target.value; render(); document.querySelector('#resource-search')?.focus(); }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'level-filter') { state.level = event.target.value; render(); }
  if (event.target.id === 'mode-filter') { state.mode = event.target.value; render(); }
});

menuToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

window.addEventListener('hashchange', render);
document.querySelector('#current-year').textContent = new Date().getFullYear();
render();
