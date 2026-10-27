const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const subtitulos = document.getElementById('subtitulos');
const playButton = document.getElementById('playButton');
const continuarButton = document.getElementById('continuarButton');

const audio = new Audio('Liana Flores.mp3');
audio.preload = 'auto';
audio.loop = false;

// Configuración del movimiento
let moonSwaying = false;
let moonSwayAmplitude = 12;
let moonSwaySpeed = 0.02;

let subtitulosIniciados = false;
let versoActual = 0;
let animationId = null;

const petalos = [];
const lunas = [];
const flores = [];

const coloresFlores = [
    '#ff6b6b',
    '#ffd166',
    '#c4a1ff',
    '#ff9fba',
    '#f7b267'
];

// Ajustar Canvas a la pantalla
function ajustarCanvas() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

ajustarCanvas();

// Mezclar colores hexadecimales
function mezclarColor(color1, color2, progreso) {
    const t = Math.max(0, Math.min(1, progreso));

    const a = color1.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16));
    const b = color2.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16));

    const resultado = a.map((v, i) =>
        Math.round(v + (b[i] - v) * t)
    );

    return '#' + resultado
        .map(v => v.toString(16).padStart(2, '0'))
        .join('');
}

// Fondo: azul oscuro -> rojizo cálido
function actualizarAmbiente(progreso) {
    const fondoAbajo = mezclarColor(
        '#1a1a2e',
        '#321526',
        progreso
    );

    const fondoArriba = mezclarColor(
        '#16213e',
        '#25172f',
        progreso
    );

    document.body.style.background =
        `linear-gradient(to top, ${fondoAbajo} 80%, ${fondoArriba} 100%)`;
}

// Crear pétalos
function randomColor() {
    const colores = [
        '#ffe6f7',
        '#f7cac9',
        '#ffffff',
        '#e0c3fc',
        '#b5ead7'
    ];

    return colores[Math.floor(Math.random() * colores.length)];
}

function crearPetalo() {
    return {
        x: Math.random() * window.innerWidth,
        y: -20,
        r: 8 + Math.random() * 8,
        speed: 1 + Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        color: randomColor(),
        drift: (Math.random() - 0.5) * 1.5
    };
}

// Crear flores
function crearFlor() {
    return {
        x: Math.random() * window.innerWidth,
        y: window.innerHeight - 80 - Math.random() * 120,
        r: 18 + Math.random() * 12,
        color: randomColor(),
        targetColor: coloresFlores[
            Math.floor(Math.random() * coloresFlores.length)
        ],
        opacity: 0.7 + Math.random() * 0.3,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.008,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.5
    };
}

// Corazón principal: comienza arriba
lunas.push({
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.22,
    r: Math.min(window.innerWidth, window.innerHeight) * 0.13,
    opacity: 1,
    isMain: true,
    swayPhase: 0,
    colorProgress: 0,
    centerReached: false
});

// Crear cinco flores
for (let i = 0; i < 5; i++) {
    flores.push(crearFlor());
}

// Dibujar pétalos
function dibujarPetalo(p) {
    ctx.save();

    ctx.globalAlpha = 0.85;
    ctx.beginPath();

    ctx.ellipse(
        p.x, p.y,
        p.r, p.r / 2,
        p.angle,
        0, Math.PI * 2
    );

    ctx.fillStyle = p.color;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 16;
    ctx.fill();

    ctx.restore();
}

// Dibujar corazón violeta que se transforma en rojo
function dibujarLuna(l) {
    ctx.save();

    const tiempo = performance.now() * 0.001;

    const latido = l.isMain
        ? 1 + Math.sin(tiempo * 2.5) * 0.035
        : 1;

    ctx.translate(l.x, l.y);

    ctx.rotate(
        l.isMain
            ? Math.sin(tiempo * 0.8) * 0.025
            : 0
    );

    ctx.scale((l.r / 80) * latido, (l.r / 80) * latido);
    ctx.globalAlpha = l.opacity;

    function trazarCorazon() {
        ctx.beginPath();
        ctx.moveTo(0, 72);

        ctx.bezierCurveTo(-15, 58, -80, 18, -80, -25);
        ctx.bezierCurveTo(-80, -65, -30, -78, 0, -38);
        ctx.bezierCurveTo(30, -78, 80, -65, 80, -25);
        ctx.bezierCurveTo(80, 18, 15, 58, 0, 72);

        ctx.closePath();
    }

    const t = l.isMain ? l.colorProgress : 0;

    const c1 = mezclarColor('#f3e8ff', '#ffe4ec', t);
    const c2 = mezclarColor('#c4b5fd', '#ff8fa3', t);
    const c3 = mezclarColor('#a78bfa', '#ff4d6d', t);
    const c4 = mezclarColor('#818cf8', '#e11d48', t);
    const c5 = mezclarColor('#6366f1', '#9f1239', t);

    const brillo = mezclarColor('#a78bfa', '#ff1744', t);
    const borde = mezclarColor('#f5efff', '#ffe4e8', t);

    // Resplandor exterior
    trazarCorazon();

    ctx.fillStyle = brillo;
    ctx.shadowColor = brillo;
    ctx.shadowBlur = 45;
    ctx.fill();

    // Degradado interior
    const gradiente = ctx.createLinearGradient(
        -60, -60,
        60, 70
    );

    gradiente.addColorStop(0, c1);
    gradiente.addColorStop(0.25, c2);
    gradiente.addColorStop(0.55, c3);
    gradiente.addColorStop(0.8, c4);
    gradiente.addColorStop(1, c5);

    trazarCorazon();

    ctx.fillStyle = gradiente;
    ctx.shadowColor = brillo;
    ctx.shadowBlur = 24;
    ctx.fill();

    // Borde luminoso
    trazarCorazon();

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = borde;
    ctx.shadowColor = borde;
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Reflejo de luz
    ctx.beginPath();

    ctx.ellipse(
        -30, -35,
        12, 5,
        -0.7,
        0, Math.PI * 2
    );

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.restore();
}

// Dibujar flores con transición de color
function dibujarFlor(f) {
    ctx.save();

    const progreso =
        lunas.find(l => l.isMain)?.colorProgress || 0;

    const colorFlor = mezclarColor(
        f.color,
        f.targetColor,
        progreso
    );

    ctx.globalAlpha = f.opacity;
    ctx.translate(f.x, f.y);
    ctx.rotate(f.angle);

    const grad = ctx.createRadialGradient(
        0, 0, f.r / 6,
        0, 0, f.r / 2
    );

    grad.addColorStop(0, '#fffbe6');
    grad.addColorStop(1, colorFlor);

    // Centro
    ctx.beginPath();
    ctx.arc(0, 0, f.r / 2.8, 0, Math.PI * 2);

    ctx.fillStyle = grad;
    ctx.shadowColor = colorFlor;
    ctx.shadowBlur = 18;
    ctx.fill();

    // Pétalos de cada flor
    for (let i = 0; i < 7; i++) {
        ctx.save();

        const angulo = i * Math.PI / 3.5;
        const px = Math.cos(angulo) * f.r;
        const py = Math.sin(angulo) * f.r;

        ctx.beginPath();

        ctx.ellipse(
            px, py,
            f.r / 2.1,
            f.r / 3.2,
            angulo,
            0, Math.PI * 2
        );

        ctx.fillStyle = colorFlor;
        ctx.shadowColor = colorFlor;
        ctx.shadowBlur = 14;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fffbe6';
        ctx.stroke();

        ctx.restore();
    }

    ctx.restore();
}

// Animación principal
function animar() {
    const ancho = window.innerWidth;
    const alto = window.innerHeight;

    ctx.clearRect(0, 0, ancho, alto);

    lunas.forEach(l => {
        if (!l.isMain || !moonSwaying) return;

        const centroY = alto * 0.5;

        if (!l.centerReached) {
            // Bajar suavemente desde arriba al centro
            l.y += (centroY - l.y) * 0.03;

            if (Math.abs(centroY - l.y) < 0.8) {
                l.y = centroY;
                l.centerReached = true;
            }
        } else {
            // Transformación progresiva a rojo
            l.colorProgress = Math.min(
                1,
                l.colorProgress + 0.003
            );

            // Fondo cálido
            actualizarAmbiente(l.colorProgress);

            // Balanceo lateral
            l.swayPhase += moonSwaySpeed;

            l.x = ancho / 2 +
                Math.sin(l.swayPhase) * moonSwayAmplitude;

            // Mostrar Continuar al terminar la transformación
            if (
                l.colorProgress >= 1 &&
                continuarButton &&
                !continuarButton.classList.contains('visible')
            ) {
                continuarButton.classList.add('visible');
            }
        }
    });

    lunas.forEach(dibujarLuna);

    // Animar flores
    flores.forEach(f => {
        dibujarFlor(f);

        f.angle += f.spin;
        f.x += f.vx;
        f.y += f.vy;

        if (f.x < f.r) {
            f.x = f.r;
            f.vx *= -1;
        }

        if (f.x > ancho - f.r) {
            f.x = ancho - f.r;
            f.vx *= -1;
        }

        if (f.y < f.r) {
            f.y = f.r;
            f.vy *= -1;
        }

        if (f.y > alto - f.r) {
            f.y = alto - f.r;
            f.vy *= -1;
        }
    });

    // Crear y animar pétalos que caen
    if (Math.random() < 0.08) {
        petalos.push(crearPetalo());
    }

    for (let i = petalos.length - 1; i >= 0; i--) {
        const p = petalos[i];

        p.y += p.speed;
        p.x += p.drift;
        p.angle += 0.01 * p.drift;

        dibujarPetalo(p);

        if (p.y > alto + 20) {
            petalos.splice(i, 1);
        }
    }

    animationId = requestAnimationFrame(animar);
}

animar();

// Poema
const poema = [
    "Holaaaaaaaaaaaaaaaaaa,",
    "¿cómo estás? ¿Qué? ¿Qué qué hago aquí?",
    "Pues hoy es un día especial,",
    "¡porque es tu cumpleañooooooos!",
    "Wiiiiiiiiiiiiiiiiiiii, ¡felicidadeeeeees!",
    "JSJSJSJSJSJSJS, ❤️",

    "Espero que la puedas pasar súper bien,",
    "y que puedas sonreír wiiiiiiii :)",
    "Aunque seguramente haya sido un día bastante duro y difícil,",
    "y quizás estés muy cansadita,",
    "aun así quiero desearte lo mejor de lo mejor,",
    "porque hoy es el día en que nació una personita muy especial.",
    "Y esa personita eres tú, María.",

    "MARÍA, TE AMO MUCHO, MI AMOOOOOR.",
    "Quiero que sepas que me haces la persona más feliz del mundo,",
    "y que tenerte en mi vida es algo que agradezco muchísimo.",
    "Te amo tanto, mi amor, JSJSJSJSJS,",
    "que quisiera estar ahí contigo ahora mismo,",
    "abrazarte muy fuerte,",
    "llenarte de besitos,",
    "desearte un feliz cumpleaños cerquita de ti,",
    "y no soltarte por un buen ratito.",
    "WIIIIIIIIIIIIIIII, JSJSJSJSJS. ❤️",

    "Ya pasaron tres meses, WAOOOOOS,",
    "¿puedes creerlo, mi amor?",
    "Tres meses siendo pareja WAOOOS,",
    "Sí que pasa el tiempo volando,",
    "jsjsjsjsj,",

    "Y quisiera decirte, mi amor,",
    "Que me haces muy feliz, la persona más feliz del mundo,",
    "jsjsjsjs MARÍA, TE AMO MUCHO",

    "Feliz cumpleaños, mi amorcito hermoso.",
    "Gracias por estos tres meses,",
    "por permitirme conocerte,",
    "por compartir conmigo una parte de tu vida,",
    "y por regalarme tantos motivos para sonreír.",
    "Espero que este sea el primero de muchos cumpleaños",
    "en los que pueda recordarte lo especial que eres para mí.",
    "Y si algún día volvemos a leer estas palabras,",
    "espero que podamos sonreír al recordar",
    "lo felices que nos hacía compartir estos pequeños momentos.",

    "TE AMO MUCHÍSIMOOOOOO, MARÍA.",
    "¡FELIZ CUMPLEAÑOOOOOOOS, MI AMOOOOOR!",
    "WIIIIIIIIIIIIIIIIIIIIIIIIIIII.",
    "JSJSJSJSJSJSJSJSJS. ❤️🎂",

    "Con todo mi amor,",
    "para mi personita favorita. ❤️",
    "ATT: ALEX"
];

// Mostrar subtítulos
function mostrarVerso() {
    if (!subtitulos) return;

    subtitulos.style.opacity = 0;

    setTimeout(() => {
        subtitulos.textContent = poema[versoActual];
        subtitulos.style.opacity = 1;

        versoActual++;

        if (versoActual < poema.length) {
            setTimeout(() => {
                subtitulos.style.opacity = 0;
                setTimeout(mostrarVerso, 600);
            }, 2600);
        } else {
            // Al finalizar el poema, iniciar animación del corazón
            setTimeout(() => {
                subtitulos.style.opacity = 0;
            }, 3200);

            moonSwaying = true;

            moonSwayAmplitude = Math.max(
                8,
                Math.min(24, window.innerWidth * 0.012)
            );

            if (playButton) {
                playButton.disabled = false;
                playButton.textContent = 'Reproducir';
            }
        }
    }, 300);
}

// Iniciar música y subtítulos
async function iniciarSubtitulosYAudio() {
    if (subtitulosIniciados) return;

    subtitulosIniciados = true;
    versoActual = 0;

    if (playButton) {
        playButton.disabled = true;
        playButton.textContent = 'Reproduciendo...';
    }

    try {
        await audio.play();
    } catch (err) {
        console.warn(
            'No se pudo reproducir el audio. Los subtítulos continuarán:',
            err
        );
    }

    mostrarVerso();
}

// Tecla X
window.addEventListener('keydown', e => {
    if (e.key === 'x' || e.key === 'X') {
        iniciarSubtitulosYAudio();
    }
});

window.iniciarSubtitulosYAudio = iniciarSubtitulosYAudio;

// Botón de reproducción
if (playButton) {
    playButton.addEventListener('click', iniciarSubtitulosYAudio);
}

// Elementos de la segunda escena: video
const escenaVideo = document.getElementById('escenaVideo');
const videoSorpresa = document.getElementById('videoSorpresa');

// Botón Continuar: mostrar y reproducir el video
if (continuarButton) {
    continuarButton.addEventListener('click', async () => {
        if (!escenaVideo || !videoSorpresa) {
            console.warn(
                'No se encontró #escenaVideo o #videoSorpresa. Añade el contenedor del video en index.html.'
            );
            return;
        }

        // Ocultar el botón Continuar
        continuarButton.classList.remove('visible');

        // Mostrar la escena del video
        escenaVideo.style.display = 'flex';

        // Permitir que display se aplique antes de iniciar la transición
        requestAnimationFrame(() => {
            escenaVideo.classList.add('visible');
        });

        // Detener la música de fondo al comenzar el video
        audio.pause();

        // Intentar reproducir el video
        try {
            await videoSorpresa.play();
        } catch (err) {
            console.warn(
                'El navegador no permitió la reproducción automática. Pulsa reproducir en el video.',
                err
            );
        }
    });
}

// Redimensionar sin reiniciar la animación
window.addEventListener('resize', () => {
    ajustarCanvas();

    const corazon = lunas.find(l => l.isMain);

    if (corazon) {
        if (!moonSwaying) {
            corazon.x = window.innerWidth / 2;
            corazon.y = window.innerHeight * 0.22;
        } else if (!corazon.centerReached) {
            corazon.x = window.innerWidth / 2;
        } else {
            corazon.y = window.innerHeight * 0.5;
        }
    }

    flores.forEach(f => {
        f.x = Math.max(
            f.r,
            Math.min(f.x, window.innerWidth - f.r)
        );

        f.y = Math.max(
            f.r,
            Math.min(f.y, window.innerHeight - f.r)
        );
    });
});