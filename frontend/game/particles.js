// particles.js - Effets visuels et particules

import { canvas, ctx, gameEntities } from './globals.js';

// Configuration des particules de bouclier
const shieldParticles = {
    particleCount: 25,
    particles: [],
    orbitalParticles: [],
    colors: ["#04fbac", "#00ffff", "#0088ff", "#80ffff"],
    maxDistance: 35,
    minDistance: 25
};

// Variables pour les étoiles de fond
export let stars = [];

// Fonction pour initialiser les étoiles
export function initializeStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 2 + 1
        });
    }
}

// Fonction pour dessiner et mettre à jour les étoiles
export function drawStars() {
    if (!stars.length) initializeStars();
    
    ctx.fillStyle = 'white';
    for (let star of stars) {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += star.speed;
        
        if (star.y > canvas.height) {
            star.y = -star.size;
            star.x = Math.random() * canvas.width;
        }
    }
}

// Fonction pour créer des particules d'explosion
export function createExplosion(x, y, count = 10, colors = ['red', 'orange', 'yellow']) {
    for (let i = 0; i < count; i++) {
        gameEntities.redPoints.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            isExplosion: true,
            vx: (Math.random() * 2 - 1) * 4,
            vy: (Math.random() * 2 - 1) * 4,
            life: 20 + Math.floor(Math.random() * 20),
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

// Fonction pour dessiner les points rouges/particules
export function drawRedPoints() {
    if (gameEntities.redPoints.length > 500) {
        gameEntities.redPoints = gameEntities.redPoints.slice(0, 500);
    }

    for (let i = gameEntities.redPoints.length - 1; i >= 0; i--) {
        const point = gameEntities.redPoints[i];

        if (point.isExplosion) {
            // Particule d'explosion
            ctx.save();
            ctx.fillStyle = point.color || "red";
            ctx.globalAlpha = point.life / 40;
            ctx.beginPath();
            ctx.arc(point.x, point.y, Math.max(1, point.life / 10), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            point.x += point.vx;
            point.y += point.vy;
            point.life--;

            if (point.life <= 0) {
                gameEntities.redPoints.splice(i, 1);
            }
        } else {
            // Point rouge collectible
            const size = 8 + Math.sin(Date.now() * 0.01 + i) * 2;
            ctx.fillStyle = "red";
            ctx.fillRect(point.x - size/2, point.y - size/2, size, size);

            point.y += 1;
            if (point.y > canvas.height) {
                gameEntities.redPoints.splice(i, 1);
            }
        }
    }
}

// Fonction pour créer des particules de bouclier
export function createShieldParticles(player) {
    if (!player || !player.shield) return;

    const playerCenterX = player.x;
    const playerCenterY = player.y;
    
    // Créer des particules orbitales si nécessaire
    while (shieldParticles.orbitalParticles.length < shieldParticles.particleCount) {
        const angle = Math.random() * Math.PI * 2;
        const distance = shieldParticles.minDistance + Math.random() * (shieldParticles.maxDistance - shieldParticles.minDistance);
        
        shieldParticles.orbitalParticles.push({
            angle: angle,
            distance: distance,
            speed: 0.02 + Math.random() * 0.03,
            size: 2 + Math.random() * 3,
            color: shieldParticles.colors[Math.floor(Math.random() * shieldParticles.colors.length)],
            opacity: 0.5 + Math.random() * 0.5,
            player: player.player
        });
    }
}

// Fonction pour dessiner les particules de bouclier
export function drawShieldParticles() {
    const players = [];
    if (window.starship && window.starship.shield) players.push(window.starship);
    if (window.starship2 && window.starship2.shield) players.push(window.starship2);
    if (window.starship3 && window.starship3.shield) players.push(window.starship3);

    players.forEach(player => {
        createShieldParticles(player);
        
        const playerCenterX = player.x;
        const playerCenterY = player.y;

        // Dessiner les particules orbitales
        shieldParticles.orbitalParticles.forEach((particle, index) => {
            if (particle.player !== player.player) return;

            particle.angle += particle.speed;
            
            const x = playerCenterX + Math.cos(particle.angle) * particle.distance;
            const y = playerCenterY + Math.sin(particle.angle) * particle.distance;

            ctx.save();
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Dessiner l'effet de bouclier principal
        ctx.save();
        ctx.strokeStyle = shieldParticles.colors[0];
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.shadowColor = shieldParticles.colors[0];
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(playerCenterX, playerCenterY, shieldParticles.maxDistance, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    });

    // Nettoyer les particules des joueurs inactifs
    shieldParticles.orbitalParticles = shieldParticles.orbitalParticles.filter(particle => {
        const player = players.find(p => p.player === particle.player);
        return player && player.shield;
    });
}

// Fonction pour créer un effet de trail/traînée
export function createTrail(x, y, color = 'white', size = 2, life = 10) {
    gameEntities.redPoints.push({
        x: x,
        y: y,
        isTrail: true,
        life: life,
        maxLife: life,
        size: size,
        color: color,
        vx: 0,
        vy: 0
    });
}

// Fonction pour dessiner les effets de trail
export function drawTrails() {
    for (let i = gameEntities.redPoints.length - 1; i >= 0; i--) {
        const trail = gameEntities.redPoints[i];
        
        if (trail.isTrail) {
            ctx.save();
            ctx.fillStyle = trail.color;
            ctx.globalAlpha = trail.life / trail.maxLife;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            trail.life--;
            if (trail.life <= 0) {
                gameEntities.redPoints.splice(i, 1);
            }
        }
    }
}

// Fonction pour créer un effet de flash/éclair d'écran
export function createScreenFlash(color = 'white', duration = 100) {
    const flashElement = document.createElement('div');
    flashElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: ${color};
        opacity: 0.8;
        z-index: 9999;
        pointer-events: none;
        animation: flashFade ${duration}ms ease-out forwards;
    `;

    // Ajouter l'animation CSS si elle n'existe pas
    if (!document.getElementById('flash-animation-style')) {
        const style = document.createElement('style');
        style.id = 'flash-animation-style';
        style.textContent = `
            @keyframes flashFade {
                0% { opacity: 0.8; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(flashElement);
    
    setTimeout(() => {
        if (flashElement.parentNode) {
            flashElement.parentNode.removeChild(flashElement);
        }
    }, duration);
}

// Fonction pour créer des particules de hit/impact
export function createHitEffect(x, y, color = 'yellow') {
    for (let i = 0; i < 5; i++) {
        gameEntities.redPoints.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            isHitEffect: true,
            vx: (Math.random() * 2 - 1) * 2,
            vy: (Math.random() * 2 - 1) * 2,
            life: 15,
            color: color,
            size: 3
        });
    }
}

// Fonction pour dessiner tous les effets de particules
export function drawAllParticleEffects() {
    drawStars();
    drawRedPoints();
    drawTrails();
    drawShieldParticles();
}

// Fonction pour nettoyer toutes les particules
export function clearAllParticles() {
    gameEntities.redPoints = [];
    shieldParticles.particles = [];
    shieldParticles.orbitalParticles = [];
    stars = [];
}

// Fonction pour obtenir le nombre de particules actives
export function getParticleCount() {
    return gameEntities.redPoints.length + shieldParticles.particles.length + stars.length;
}
