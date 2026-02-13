// Elements
const envelope = document.getElementById("envelope-container");
const letter = document.getElementById("letter-container");
const noBtn = document.querySelector(".no-btn");
const yesBtn = document.querySelector(".btn[alt='Yes']");

const title = document.getElementById("letter-title");
const catImg = document.getElementById("letter-cat");
const buttons = document.getElementById("letter-buttons");
const finalText = document.getElementById("final-text");

// Background Music
const bgMusic = new Audio("sempurna.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

function playMusic() {
    bgMusic.play().catch(() => {});
}

// ---------- Open Envelope ----------

let envelopeOpened = false;

function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    // Stop all shake listeners
    stopShakeListeners();

    // Play background music
    playMusic();

    envelope.style.display = "none";
    letter.style.display = "flex";

    setTimeout(() => {
        document.querySelector(".letter-window").classList.add("open");
    }, 50);
}

// Click fallback — still works
envelope.addEventListener("click", openEnvelope);

// ========================================
//  SHAKE DETECTION
// ========================================

const SHAKE_THRESHOLD = 15;   // acceleration threshold (m/s²)
const SHAKE_COUNT_NEEDED = 10; // shakes needed to trigger
const SHAKE_RESET_MS = 800;   // reset counter after idle

let shakeCount = 0;
let lastShakeTime = 0;

// ----- Mobile: DeviceMotion -----

function handleMotion(e) {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;

    const total = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);

    // Subtract gravity (~9.8) roughly
    if (total > SHAKE_THRESHOLD + 9.8) {
        const now = Date.now();
        if (now - lastShakeTime > 300) { // debounce each shake
            lastShakeTime = now;
            shakeCount++;

            // Wiggle the envelope visually
            wiggleEnvelope();

            if (shakeCount >= SHAKE_COUNT_NEEDED) {
                openEnvelope();
            }
        }
    }

    // Reset counter if idle
    if (Date.now() - lastShakeTime > SHAKE_RESET_MS && shakeCount > 0) {
        shakeCount = 0;
    }
}

function startMobileShake() {
    window.addEventListener("devicemotion", handleMotion);
}

// iOS 13+ permission request
function requestIOSPermission() {
    const overlay = document.getElementById("ios-permission");
    const btn = document.getElementById("ios-permit-btn");

    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
        // Show overlay for user gesture
        overlay.style.display = "flex";
        btn.addEventListener("click", () => {
            DeviceMotionEvent.requestPermission()
                .then((state) => {
                    overlay.style.display = "none";
                    if (state === "granted") {
                        startMobileShake();
                    }
                })
                .catch(console.error);
        });
    } else if ("DeviceMotionEvent" in window) {
        // Android / older iOS — just listen
        startMobileShake();
    }
}

// ----- Desktop: Window‑position shake -----

let posInterval = null;
let prevX = window.screenX;
let prevY = window.screenY;
let desktopShakeCount = 0;
let lastDesktopShake = 0;
const POS_THRESHOLD = 15;          // pixels of movement
const DESKTOP_SHAKES_NEEDED = 10;  // direction changes needed
const POS_POLL_MS = 60;            // poll interval

function pollWindowPosition() {
    const dx = Math.abs(window.screenX - prevX);
    const dy = Math.abs(window.screenY - prevY);

    if (dx > POS_THRESHOLD || dy > POS_THRESHOLD) {
        const now = Date.now();
        if (now - lastDesktopShake > 100) {
            lastDesktopShake = now;
            desktopShakeCount++;

            wiggleEnvelope();

            if (desktopShakeCount >= DESKTOP_SHAKES_NEEDED) {
                openEnvelope();
            }
        }
    }

    // Reset if idle
    if (Date.now() - lastDesktopShake > SHAKE_RESET_MS && desktopShakeCount > 0) {
        desktopShakeCount = 0;
    }

    prevX = window.screenX;
    prevY = window.screenY;
}

function startDesktopShake() {
    posInterval = setInterval(pollWindowPosition, POS_POLL_MS);
}

// ----- Envelope wiggle feedback -----

function wiggleEnvelope() {
    const img = document.getElementById("envelope");
    img.style.transition = "transform 0.1s ease";
    img.style.transform = "rotate(8deg)";
    setTimeout(() => { img.style.transform = "rotate(-8deg)"; }, 100);
    setTimeout(() => { img.style.transform = "rotate(0deg)"; }, 200);
}

// ----- Cleanup -----

function stopShakeListeners() {
    window.removeEventListener("devicemotion", handleMotion);
    if (posInterval) clearInterval(posInterval);
}

// ----- Init -----

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

if (isMobile) {
    requestIOSPermission();
} else {
    startDesktopShake();
}

// Logic to move the NO btn

noBtn.addEventListener("mouseover", () => {
    const min = 200;
    const max = 200;

    const distance = Math.random() * (max - min) + min;
    const angle = Math.random() * Math.PI * 2;

    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    noBtn.style.transition = "transform 0.3s ease";
    noBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// Logic to make YES btn to grow

// let yesScale = 1;

// yesBtn.style.position = "relative"
// yesBtn.style.transformOrigin = "center center";
// yesBtn.style.transition = "transform 0.3s ease";

// noBtn.addEventListener("click", () => {
//     yesScale += 2;

//     if (yesBtn.style.position !== "fixed") {
//         yesBtn.style.position = "fixed";
//         yesBtn.style.top = "50%";
//         yesBtn.style.left = "50%";
//         yesBtn.style.transform = `translate(-50%, -50%) scale(${yesScale})`;
//     }else{
//         yesBtn.style.transform = `translate(-50%, -50%) scale(${yesScale})`;
//     }
// });

// YES is clicked — show Yippee phase

yesBtn.addEventListener("click", () => {
    document.getElementById("phase-question").style.display = "none";
    document.getElementById("phase-yippee").style.display = "flex";
});

// "Pencet aku" button — flip main card & start carousel
document.getElementById("flip-btn").addEventListener("click", () => {
    document.getElementById("card-flip").classList.add("flipped");
    // Wait for flip to finish, then start carousel
    setTimeout(initCarousel, 1000);
});

// ========================================
//  MESSAGE CAROUSEL
// ========================================

const MESSAGES = [
    { title: "💕 Buat Angel 💕", text: "maaci yaa sayang selalu ada buat akuu selalu sabar sama aku and selalu support akuu meski aku bandel bangettt 🥹" },
    { title: "💕", text: "aku sempet ragu sama diri aku sendiri tapi kamu selalu yakinin kalo aku bisaa. Kamu berarti banget buat akuu 🫂" },
    { title: "🫠", text: "aaa aku terharu nulis ini 🫠" },
    { title: "🩷", text: "AKUUUU SAYAANGG BANGEETTT SAMAA KAMUUUU 🫰🏻😘🩷🫂" },
    { title: "🤭", text: "GABOLE PERGI2 YAAAA XIXIXI 🤭" },
    { title: "🫸", text: "sowyy yaa sayang aku belum ngasi kamu kadooo :) #izin" },
    { title: "💌", text: "— Happy Valentine's Day, Sayangku, kamu sempurna🫰 —" },
];

let currentMsg = 0;
let nextBtnTimer = null;

function buildMsgCard(index) {
    const msg = MESSAGES[index];
    const isLast = index === MESSAGES.length - 1;
    const total = MESSAGES.length;

    const card = document.createElement("div");
    card.className = "msg-card" + (index === 0 ? " active" : "");
    card.dataset.index = index;

    const inner = document.createElement("div");
    inner.className = "msg-card-inner";

    // Front face
    const front = document.createElement("div");
    front.className = "msg-card-face msg-front";
    front.innerHTML = `
        <h2>${msg.title}</h2>
        <p class="msg-text">${msg.text}</p>
        <span class="msg-counter">${index + 1} / ${total}</span>
    `;

    // Button placeholder (added after 5s)
    const btnWrap = document.createElement("div");
    btnWrap.className = "msg-btn-wrap";
    front.appendChild(btnWrap);

    inner.appendChild(front);

    // Back face (empty — next card takes over)
    const back = document.createElement("div");
    back.className = "msg-card-face msg-back";
    inner.appendChild(back);

    card.appendChild(inner);
    return { card, btnWrap, inner, isLast };
}

function showNextButton(btnWrap, isLast, inner, cardIndex) {
    const btn = document.createElement("button");

    if (isLast) {
        btn.className = "yeay-btn";
        btn.textContent = "🎉 Yeayyy! 🎉";
        btn.style.opacity = "0.6";
        btn.style.cursor = "default";

        // Enable after 3s
        setTimeout(() => {
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.addEventListener("click", () => {
                launchConfetti(150);
            });
        }, 3000);
    } else {
        btn.className = "next-btn";
        btn.innerHTML = '<span class="progress-fill"></span><span class="btn-label">Selanjutnya →</span>';

        // Enable after 3s (when progress fill completes)
        setTimeout(() => {
            btn.classList.add("ready");
            btn.addEventListener("click", () => {
                // Flip current card
                inner.classList.add("flipped");

                // After flip, show next card
                setTimeout(() => {
                    const cards = document.querySelectorAll(".msg-card");
                    cards[cardIndex].classList.remove("active");

                    currentMsg++;
                    cards[currentMsg].classList.add("active");

                    scheduleNextButton(currentMsg);
                }, 800);
            });
        }, 3000);
    }

    btnWrap.appendChild(btn);
}

function scheduleNextButton(index) {
    if (nextBtnTimer) clearTimeout(nextBtnTimer);

    const cards = document.querySelectorAll(".msg-card");
    const card = cards[index];
    const btnWrap = card.querySelector(".msg-btn-wrap");
    const inner = card.querySelector(".msg-card-inner");
    const isLast = index === MESSAGES.length - 1;

    // Show button immediately (progress starts right away)
    showNextButton(btnWrap, isLast, inner, index);
}

function initCarousel() {
    const carousel = document.getElementById("msg-carousel");
    carousel.innerHTML = "";

    // Build all cards
    MESSAGES.forEach((_, i) => {
        const { card } = buildMsgCard(i);
        carousel.appendChild(card);
    });

    currentMsg = 0;
    scheduleNextButton(0);
}

// ========================================
//  CONFETTI ENGINE
// ========================================

const confettiCanvas = document.getElementById("confetti-canvas");
const ctx = confettiCanvas.getContext("2d");
let confettiPieces = [];
let confettiRunning = false;

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const CONFETTI_COLORS = [
    "#e74c3c", "#ff6b81", "#ff9ff3", "#f368e0",
    "#ffd32a", "#ff9f43", "#fff200", "#ee5a24",
    "#c0392b", "#fd79a8", "#e84393", "#fab1a0"
];

const SHAPES = ["rect", "circle", "heart", "star"];

function createConfettiPiece() {
    return {
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * 40,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        gravity: 0.05 + Math.random() * 0.05
    };
}

function drawHeart(x, y, size, color) {
    ctx.beginPath();
    const s = size / 2;
    ctx.moveTo(x, y + s * 0.4);
    ctx.bezierCurveTo(x, y - s * 0.2, x - s, y - s * 0.6, x - s, y + s * 0.1);
    ctx.bezierCurveTo(x - s, y + s * 0.7, x, y + s * 1.2, x, y + s * 1.4);
    ctx.bezierCurveTo(x, y + s * 1.2, x + s, y + s * 0.7, x + s, y + s * 0.1);
    ctx.bezierCurveTo(x + s, y - s * 0.6, x, y - s * 0.2, x, y + s * 0.4);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawStar(x, y, size, color) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = size / 2;
        const method = i === 0 ? "moveTo" : "lineTo";
        ctx[method](x + r * Math.cos(angle), y + r * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        if (p.shape === "heart") {
            drawHeart(0, 0, p.w, p.color);
        } else if (p.shape === "star") {
            drawStar(0, 0, p.w * 1.5, p.color);
        } else if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();

        // Physics
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        // Fade out near bottom
        if (p.y > confettiCanvas.height * 0.75) {
            p.opacity -= 0.015;
        }
    });

    // Remove dead pieces
    confettiPieces = confettiPieces.filter(
        (p) => p.opacity > 0 && p.y < confettiCanvas.height + 50
    );

    if (confettiPieces.length > 0) {
        requestAnimationFrame(drawConfetti);
    } else {
        confettiRunning = false;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

function launchConfetti(count = 150) {
    for (let i = 0; i < count; i++) {
        confettiPieces.push(createConfettiPiece());
    }
    if (!confettiRunning) {
        confettiRunning = true;
        drawConfetti();
    }
}
