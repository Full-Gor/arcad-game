// orbiting_enemies.js - Gestion des ennemis orbitaux (type 10)
import { canvas, ctx } from './globals_simple.js';
import { enemies } from './enemies_simple.js';
import { enemyBullets } from './enemy_bullets_simple.js';

// Variables pour les ennemis orbitaux
export let orbitingEnemies = [];
let electricEffects = [];

// ========================================
// CRÉATION DE L'ENNEMI ORBITAL
// ========================================

export function createOrbitingEnemy() {
    const enemy = {
        type: 10, // ENEMY11 (type 10)
        width: 50,
        height: 50,
        x: canvas.width / 2,
        y: -60,
        
        // Propriétés orbitales
        orbitRadius: 250,        // Rayon de 250px (diamètre 500px)
        orbitAngle: 0,          // Angle initial
        orbitSpeed: 0.02,       // Vitesse de rotation
        orbitCenter: { x: 0, y: 0 }, // Centre calculé dynamiquement
        
        // Phases de mouvement
        phase: 'approaching',   // 'approaching', 'orbiting'
        approachSpeed: 3,
        
        // Rotation du sprite
        rotation: 0,           // Angle de rotation du sprite
        
        // Système de tir
        lastShot: Date.now(),
        shotInterval: 800,    // Tire toutes les 800ms
        
        // Visuel
        color: '#FF00FF',
        glowColor: '#FF88FF',
        electricArcs: []
    };
    
    orbitingEnemies.push(enemy);
    enemies.push(enemy);
    return enemy;
}

// ========================================
// MISE À JOUR DES MOUVEMENTS
// ========================================

export function updateOrbitingEnemies(player) {
    orbitingEnemies.forEach((enemy, index) => {
        if (!enemies.includes(enemy)) {
            orbitingEnemies.splice(index, 1);
            return;
        }
        
        // Phase d'approche
        if (enemy.phase === 'approaching') {
            // Calculer la position du joueur
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;
            
            // Se diriger vers une position au-dessus du joueur
            const targetX = playerCenterX;
            const targetY = playerCenterY - enemy.orbitRadius;
            
            // Déplacement vers la position initiale d'orbite
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                enemy.x += (dx / distance) * enemy.approachSpeed;
                enemy.y += (dy / distance) * enemy.approachSpeed;
            } else {
                // Commencer l'orbite
                enemy.phase = 'orbiting';
                enemy.orbitCenter = { x: playerCenterX, y: playerCenterY };
                enemy.orbitAngle = -Math.PI / 2; // Commencer en haut
            }
        }
        
        // Phase d'orbite
        else if (enemy.phase === 'orbiting') {
            // Mettre à jour le centre d'orbite (suivre le joueur)
            enemy.orbitCenter.x = player.x + player.width / 2;
            enemy.orbitCenter.y = player.y + player.height / 2;
            
            // Calculer la nouvelle position sur l'orbite
            enemy.orbitAngle += enemy.orbitSpeed;
            enemy.x = enemy.orbitCenter.x + Math.cos(enemy.orbitAngle) * enemy.orbitRadius - enemy.width / 2;
            enemy.y = enemy.orbitCenter.y + Math.sin(enemy.orbitAngle) * enemy.orbitRadius - enemy.height / 2;
            
            // Calculer la rotation pour pointer vers le joueur
            const angleToPlayer = Math.atan2(
                enemy.orbitCenter.y - (enemy.y + enemy.height / 2),
                enemy.orbitCenter.x - (enemy.x + enemy.width / 2)
            );
            enemy.rotation = angleToPlayer + Math.PI / 2;
            
            // Tir de projectiles électriques
            const now = Date.now();
            if (now - enemy.lastShot > enemy.shotInterval) {
                createElectricBullet(enemy, player);
                enemy.lastShot = now;
            }
        }
        
        // Générer des arcs électriques aléatoires
        if (Math.random() < 0.1) {
            enemy.electricArcs.push({
                angle: Math.random() * Math.PI * 2,
                length: 20 + Math.random() * 15,
                lifetime: 5,
                segments: 3 + Math.floor(Math.random() * 3)
            });
        }
        
        // Mise à jour des arcs électriques
        enemy.electricArcs = enemy.electricArcs.filter(arc => {
            arc.lifetime--;
            return arc.lifetime > 0;
        });
    });
}

// ========================================
// SYSTÈME DE TIR
// ========================================

function createElectricBullet(enemy, player) {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;
    
    // Direction vers le joueur
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const angle = Math.atan2(playerCenterY - centerY, playerCenterX - centerX);
    
    const bullet = {
        type: 'electric',
        x: centerX,
        y: centerY,
        width: 12,
        height: 12,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        color: '#FF00FF',
        coreColor: '#FFFFFF',
        electricArcs: [],
        trail: [],
        pulsePhase: 0
    };
    
    enemyBullets.push(bullet);
    
    // Créer un effet électrique au point de tir
    createElectricEffect(centerX, centerY);
}

// ========================================
// RENDU VISUEL
// ========================================

export function drawOrbitingEnemies(ctx) {
    orbitingEnemies.forEach(enemy => {
        if (!enemies.includes(enemy)) return;
        
        ctx.save();
        
        // Appliquer la rotation pour pointer vers le joueur
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        ctx.rotate(enemy.rotation);
        ctx.translate(-enemy.width / 2, -enemy.height / 2);
        
        // Corps de l'ennemi avec gradient
        const gradient = ctx.createRadialGradient(
            enemy.width / 2, enemy.height / 2, 0,
            enemy.width / 2, enemy.height / 2, enemy.width / 2
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, enemy.color);
        gradient.addColorStop(1, '#800080');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Forme triangulaire pointue
        ctx.moveTo(enemy.width / 2, 0); // Pointe avant
        ctx.lineTo(0, enemy.height); // Coin arrière gauche
        ctx.lineTo(enemy.width, enemy.height); // Coin arrière droit
        ctx.closePath();
        ctx.fill();
        
        // Contour lumineux
        ctx.strokeStyle = enemy.glowColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = enemy.glowColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        ctx.restore();
        
        // Dessiner les arcs électriques autour
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.shadowColor = '#FF00FF';
        ctx.shadowBlur = 5;
        
        enemy.electricArcs.forEach(arc => {
            ctx.globalAlpha = arc.lifetime / 5;
            ctx.beginPath();
            
            const startX = enemy.x + enemy.width / 2;
            const startY = enemy.y + enemy.height / 2;
            const endX = startX + Math.cos(arc.angle) * arc.length;
            const endY = startY + Math.sin(arc.angle) * arc.length;
            
            ctx.moveTo(startX, startY);
            
            // Créer un arc électrique segmenté
            for (let i = 1; i <= arc.segments; i++) {
                const t = i / arc.segments;
                const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 10;
                const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 10;
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
        });
    });
}

// ========================================
// EFFETS VISUELS
// ========================================

function createElectricEffect(x, y) {
    electricEffects.push({
        x: x,
        y: y,
        radius: 5,
        maxRadius: 30,
        lifetime: 15,
        arcs: []
    });
}

export function updateElectricEffects() {
    for (let i = electricEffects.length - 1; i >= 0; i--) {
        const effect = electricEffects[i];
        effect.radius += 2;
        effect.lifetime--;
        
        if (effect.lifetime <= 0 || effect.radius > effect.maxRadius) {
            electricEffects.splice(i, 1);
        }
    }
}

export function drawElectricEffects(ctx) {
    electricEffects.forEach(effect => {
        ctx.save();
        ctx.globalAlpha = effect.lifetime / 15;
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FF00FF';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    });
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

export function clearOrbitingEnemies() {
    orbitingEnemies = [];
    electricEffects = [];
}

export function getOrbitingEnemiesCount() {
    return orbitingEnemies.length;
}
