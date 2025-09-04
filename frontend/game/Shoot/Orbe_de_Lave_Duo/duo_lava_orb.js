// duo_lava_orb.js - Balle de lave unique issue de deux ennemis (grandit + électricité noire)
import { enemyBullets } from '../../enemy_bullets_simple.js';
import { canvas } from '../../globals_simple.js';

export function createDuoLavaOrb(enemyA, enemyB, options = {}) {
    if (!enemyA || !enemyB) return null;
    const ax = enemyA.x + enemyA.width / 2;
    const ay = enemyA.y + enemyA.height / 2;
    const bx = enemyB.x + enemyB.width / 2;
    const by = enemyB.y + enemyB.height / 2;
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const {
        initialRadius = 8,
        growthRate = 0.35,
        vy = 1.8,
        maxRadius = 60
    } = options;
    const orb = {
        type: 'duo_lava_orb',
        x: mx,
        y: my,
        radius: initialRadius,
        growthRate,
        vy,
        maxRadius,
        coreColor: '#fff6a8', // coeur jaune clair
        hotColor: '#ffa000',  // orange chaud
        lavaColor: '#b31b00', // rouge lave
        darkArcs: [],
        pulsePhase: 0,
        opacity: 1
    };
    enemyBullets.push(orb);
    return orb;
}

export function updateDuoLavaOrb(orb) {
    // Mouvement vertical lent
    if (!isFinite(orb.y)) orb.y = 0;
    orb.y += orb.vy;
    // Croissance progressive jusqu'à maxRadius
    if (!isFinite(orb.radius) || orb.radius <= 0) orb.radius = 1;
    if (orb.radius < orb.maxRadius) orb.radius += orb.growthRate;
    // Pulsation légère (garde-fou)
    if (!isFinite(orb.pulsePhase)) orb.pulsePhase = 0;
    orb.pulsePhase += 0.05;

    // Générer des arcs d'électricité (bleu clair) autour du pourtour
    if (Math.random() < 0.7 && orb.darkArcs.length < 12) {
        orb.darkArcs.push({
            angle: Math.random() * Math.PI * 2,
            length: 8 + Math.random() * 14,
            lifetime: 10 + Math.floor(Math.random() * 10),
            segments: 3 + Math.floor(Math.random() * 3)
        });
    }
    // Mettre à jour les arcs
    orb.darkArcs = orb.darkArcs.filter(arc => {
        arc.lifetime--;
        return arc.lifetime > 0;
    });
    // Condition de sortie hors écran
    if (canvas && (orb.y - orb.radius > canvas.height + 50)) {
        return true; // demander suppression
    }
    return false;
}

export function drawDuoLavaOrb(ctx, orb) {
    ctx.save();
    // Garde-fous pour éviter les NaN/Infinity
    if (!isFinite(orb.x) || !isFinite(orb.y) || !isFinite(orb.radius) || orb.radius <= 0.1) {
        ctx.restore();
        return;
    }
    // Gradient lava (centre très chaud, bords rouges)
    const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
    g.addColorStop(0.0, orb.coreColor);
    g.addColorStop(0.35, orb.hotColor);
    g.addColorStop(1.0, orb.lavaColor);
    ctx.fillStyle = g;
    ctx.shadowColor = orb.hotColor;
    ctx.shadowBlur = 20;
    ctx.globalAlpha = orb.opacity;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fill();

    // Coeur vibrant
    const coreR = Math.max(2, orb.radius * (0.25 + 0.05 * Math.sin(orb.pulsePhase)));
    const cg = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, coreR);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(1, 'rgba(33, 5, 251, 0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Arcs d'électricité bleu clair autour
    ctx.shadowColor = '#87CEFA'; // light sky blue
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#87CEFA';
    ctx.lineWidth = 1.6;
    orb.darkArcs.forEach(arc => {
        const startX = orb.x + Math.cos(arc.angle) * (orb.radius - 2);
        const startY = orb.y + Math.sin(arc.angle) * (orb.radius - 2);
        const endX = startX + Math.cos(arc.angle) * arc.length;
        const endY = startY + Math.sin(arc.angle) * arc.length;
        ctx.globalAlpha = Math.max(0.1, arc.lifetime / 20);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        for (let s = 1; s <= arc.segments; s++) {
            const t = s / arc.segments;
            const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 3;
            const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 3;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    });

    ctx.restore();
}


