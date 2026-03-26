/* ════════════════════════════════════════════
   app.js — Género y Número
   ════════════════════════════════════════════ */

/* ── STATE ── */
let allWords   = [];
let playerName = "";
let questions  = [];
let current    = 0;
let score      = 0;
let selGenero  = null;
let selNumero  = null;
let selectedQ  = 10;   // default: Normal
let TOTAL      = 10;
let deferredPrompt = null;

/* ════════════════════════════════════════════
   INIT — cargar palabras.json al arrancar
   ════════════════════════════════════════════ */
async function init() {
  try {
    const res  = await fetch("palabras.json");
    allWords   = await res.json();
    showScreen("welcome");
  } catch (err) {
    console.error("Error cargando palabras.json:", err);
    // Mensaje de error amigable en pantalla
    document.getElementById("loadingText").textContent = "⚠️ Error cargando las palabras. Recarga la página.";
  }
}

/* ════════════════════════════════════════════
   UTILS
   ════════════════════════════════════════════ */
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ── Floating stars background ── */
function initStars() {
  const starEmojis     = ["⭐","✨","🌟","💫","🎈","🌈","🦋","🍀","🎀","🎁"];
  const starsContainer = document.getElementById("starsContainer");
  for (let i = 0; i < 22; i++) {
    const s       = document.createElement("div");
    s.className   = "star";
    s.textContent = starEmojis[Math.floor(Math.random() * starEmojis.length)];
    s.style.left            = Math.random() * 100 + "vw";
    s.style.animationDuration = (12 + Math.random() * 20) + "s";
    s.style.animationDelay    = (Math.random() * 20) + "s";
    s.style.fontSize          = (0.8 + Math.random() * 1.1) + "rem";
    starsContainer.appendChild(s);
  }
}

/* ════════════════════════════════════════════
   QUESTION COUNT SELECTOR
   ════════════════════════════════════════════ */
function selectQ(val) {
  selectedQ = val;
  document.querySelectorAll(".q-btn").forEach(b => {
    b.classList.toggle("selected", parseInt(b.dataset.q) === val);
  });
}

/* ════════════════════════════════════════════
   GAME FLOW
   ════════════════════════════════════════════ */
function startGame() {
  const inp = document.getElementById("playerName").value.trim();
  if (!inp) {
    const el = document.getElementById("playerName");
    el.focus();
    el.style.borderColor = "#EF5350";
    setTimeout(() => el.style.borderColor = "", 1000);
    return;
  }

  playerName = inp;
  TOTAL      = selectedQ;
  questions  = shuffle(allWords).slice(0, TOTAL);
  current    = 0;
  score      = 0;
  selGenero  = null;
  selNumero  = null;

  showScreen("game");
  document.getElementById("displayName").textContent = "👤 " + playerName;

  // Botón "Repasar" visible solo en Rápido (5) y Normal (10)
  document.getElementById("inGameReviewBtn")
    .classList.toggle("hidden", TOTAL === 20);

  loadQuestion();
}

function loadQuestion() {
  selGenero = null;
  selNumero = null;

  const q = questions[current];

  document.getElementById("questionCount").textContent = (current + 1) + " / " + TOTAL;
  document.getElementById("scoreDisplay").textContent  = score;
  document.getElementById("progressBar").style.width  = ((current / TOTAL) * 100) + "%";
  document.getElementById("wordDisplay").textContent  = q.word;
  document.getElementById("wordArticle").textContent  = "(" + q.article + " " + q.word.toLowerCase() + ")";

  // Resetear botones de opciones
  document.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("selected"));

  // Resetear botón confirmar
  const confirmBtn     = document.getElementById("confirmBtn");
  confirmBtn.classList.remove("ready");
  confirmBtn.disabled  = true;

  // Animación de entrada de la card
  const card           = document.getElementById("wordCard");
  card.style.animation = "none";
  void card.offsetWidth;                           // force reflow
  card.style.animation = "cardIn 0.45s cubic-bezier(.68,-0.55,.27,1.55)";
}

/* ── SELECCIÓN DE OPCIONES ── */
function selectGenero(val) {
  selGenero = val;
  document.querySelectorAll(".opt-btn[data-genero]").forEach(b => {
    b.classList.toggle("selected", b.dataset.genero === val);
  });
  tryEnableConfirm();
}

function selectNumero(val) {
  selNumero = val;
  document.querySelectorAll(".opt-btn[data-numero]").forEach(b => {
    b.classList.toggle("selected", b.dataset.numero === val);
  });
  tryEnableConfirm();
}

function tryEnableConfirm() {
  const btn = document.getElementById("confirmBtn");
  if (selGenero && selNumero) {
    btn.classList.add("ready");
    btn.disabled = false;
  }
}

/* ── COMPROBAR RESPUESTA ── */
function checkAnswer() {
  const q              = questions[current];
  const correctGenero  = selGenero === q.genero;
  const correctNumero  = selNumero === q.numero;
  const bothCorrect    = correctGenero && correctNumero;
  const partialCorrect = correctGenero || correctNumero;

  let pts = 0;
  if (bothCorrect)         pts = 10;
  else if (partialCorrect) pts = 5;
  score += pts;

  // Badges con la respuesta correcta
  const genLabel  = q.genero === "masculino" ? "🔵 Masculino" : "🩷 Femenino";
  const numLabel  = q.numero === "singular"  ? "🧍 Singular"  : "👨‍👩‍👧‍👦 Plural";
  const genClass  = q.genero === "masculino" ? "badge-masc" : "badge-fem";
  const numClass  = q.numero === "singular"  ? "badge-sing" : "badge-plur";

  document.getElementById("feedbackBadges").innerHTML =
    `<span class="badge ${genClass}">${genLabel}</span>` +
    `<span class="badge ${numClass}">${numLabel}</span>`;

  if (bothCorrect) {
    const emojis = ["🎉","🏆","⭐","🌟","🔥"];
    const titles  = ["¡Correcto! 🎊","¡Genial! 🔥","¡Exacto! 💪","¡Campeón! 🌟"];
    document.getElementById("feedbackEmoji").textContent        = emojis[Math.floor(Math.random() * emojis.length)];
    document.getElementById("feedbackTitle").textContent        = titles[Math.floor(Math.random() * titles.length)];
    document.getElementById("feedbackTitle").className          = "feedback-title correct";
    document.getElementById("feedbackExplanation").innerHTML    =
      `<strong>${q.article.toUpperCase()} ${q.word}</strong> → ${genLabel} · ${numLabel}<br>+10 puntos 🎯`;
    spawnConfetti();
  } else if (partialCorrect) {
    document.getElementById("feedbackEmoji").textContent        = "🤔";
    document.getElementById("feedbackTitle").textContent        = "¡Casi! La mitad bien 💡";
    document.getElementById("feedbackTitle").className          = "feedback-title wrong";
    document.getElementById("feedbackExplanation").innerHTML    =
      `La respuesta correcta es:<br><strong>${q.article.toUpperCase()} ${q.word}</strong> → ${genLabel} · ${numLabel}<br>+5 puntos`;
  } else {
    const emojis = ["😅","💡","🧐"];
    document.getElementById("feedbackEmoji").textContent        = emojis[Math.floor(Math.random() * emojis.length)];
    document.getElementById("feedbackTitle").textContent        = "¡Sigue intentando! 💪";
    document.getElementById("feedbackTitle").className          = "feedback-title wrong";
    document.getElementById("feedbackExplanation").innerHTML    =
      `La respuesta correcta es:<br><strong>${q.article.toUpperCase()} ${q.word}</strong> → ${genLabel} · ${numLabel}`;
  }

  document.getElementById("feedbackOverlay").classList.add("show");
}

/* ── SIGUIENTE PREGUNTA ── */
function nextQuestion() {
  document.getElementById("feedbackOverlay").classList.remove("show");
  current++;
  if (current >= TOTAL) showResults();
  else loadQuestion();
}

/* ════════════════════════════════════════════
   RESULTS
   ════════════════════════════════════════════ */
function showResults() {
  showScreen("results");

  const maxScore = TOTAL * 10;
  const pct      = score / maxScore;

  document.getElementById("scoreBig").textContent   = score;
  document.getElementById("scoreLabel").textContent  = "puntos de " + maxScore;

  let mascot, stars, msg;

  if (pct === 1) {
    mascot = "🏆"; stars = "⭐⭐⭐⭐⭐";
    msg = `¡PERFECTO, ${playerName}! ¡Eres un auténtico genio! ¡Todo correcto! 🎊🎊🎊`;
  } else if (pct >= 0.9) {
    mascot = "🦸"; stars = "⭐⭐⭐⭐⭐";
    msg = `¡Increíble, ${playerName}! ¡Casi perfecto! Eres un superhéroe del lenguaje 💪`;
  } else if (pct >= 0.8) {
    mascot = "🌟"; stars = "⭐⭐⭐⭐";
    msg = `¡Muy bien, ${playerName}! ¡Lo has hecho genial! Con un poco más lo bordas 🚀`;
  } else if (pct >= 0.6) {
    mascot = "😊"; stars = "⭐⭐⭐";
    msg = `¡Buen trabajo, ${playerName}! Vas por buen camino. ¡Practica un poco más! 🌈`;
  } else if (pct >= 0.4) {
    mascot = "🐣"; stars = "⭐⭐";
    msg = `¡Ánimo, ${playerName}! Estás aprendiendo. Repasa el tema y vuelve a intentarlo 📚`;
  } else {
    mascot = "🌱"; stars = "⭐";
    msg = `¡No te rindas, ${playerName}! Todos empezamos desde el principio. ¡Repasa y vuelve! 💡`;
  }

  document.getElementById("resultMascot").textContent  = mascot;
  document.getElementById("resultName").textContent    = playerName;
  document.getElementById("resultMessage").textContent = msg;
  document.getElementById("starsRow").textContent      = stars;

  if (pct >= 0.8) spawnConfetti(60);
}

function resetGame() {
  showScreen("welcome");
  document.getElementById("playerName").value = playerName;
}

/* ════════════════════════════════════════════
   CONFETTI
   ════════════════════════════════════════════ */
function spawnConfetti(count = 30) {
  const colors = ["#4FC3F7","#F48FB1","#A5D6A7","#FFD54F","#7C4DFF","#66BB6A","#FF7043"];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el              = document.createElement("div");
      el.className          = "confetti-piece";
      el.style.left         = Math.random() * 100 + "vw";
      el.style.top          = "-20px";
      el.style.background   = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (1.2 + Math.random() * 1.2) + "s";
      el.style.animationDelay    = (Math.random() * 0.5) + "s";
      el.style.borderRadius      = Math.random() > 0.5 ? "50%" : "3px";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 30);
  }
}

/* ════════════════════════════════════════════
   MODAL
   ════════════════════════════════════════════ */
function openModal()  { document.getElementById("modalOverlay").classList.add("show"); }
function closeModal() { document.getElementById("modalOverlay").classList.remove("show"); }
function closeModalOnBg(e) {
  if (e.target === document.getElementById("modalOverlay")) closeModal();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registrado con éxito:', reg))
      .catch(err => console.warn('Service Worker no pudo registrarse:', err));
  }
}

function promptInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    if (choice.outcome === 'accepted') {
      console.log('Instalación aceptada');
    } else {
      console.log('Instalación rechazada');
    }
    deferredPrompt = null;
    document.getElementById('installBtn').classList.add('hidden');
  });
}

/* ════════════════════════════════════════════
   EVENT LISTENERS
   ════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initStars();
  init();   // carga palabras.json y muestra welcome
  registerServiceWorker();

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('installBtn');
    if (installBtn) installBtn.classList.remove('hidden');
  });

  window.addEventListener('appinstalled', () => {
    console.log('App instalada correctamente.');
  });

  document.getElementById("playerName").addEventListener("keydown", e => {
    if (e.key === "Enter") startGame();
  });
});
