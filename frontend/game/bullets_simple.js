// bullets_simple.js - Gestion des projectiles de façon modulaire
import { canvas, ctx } from './globals_simple.js';
import { starship } from './player_simple.js';

// Variables pour les projectiles
export let bullets = [];

// Variables pour contrôler le tir
let shooting = false;
let lastShootTime = 0;
const shootInterval = 100; // Intervalle entre les tirs en ms

// Initialiser le module bullets
export function initializeBullets() {
    console.log('Module bullets initialisé');
}

// Variables pour les power-ups de tir
let currentShootingMode = 'enemy5'; // Mode par défaut: laser vert pulsant

// Fonction pour convertir une couleur en rgba transparent
function getTransparentColor(color, alpha = 0.3) {
    const colorMap = {
        'green': 'rgba(0, 255, 0, ' + alpha + ')',
        '#FFD700': 'rgba(255, 215, 0, ' + alpha + ')',
        'cyan': 'rgba(0, 255, 255, ' + alpha + ')',
        'red': 'rgba(255, 0, 0, ' + alpha + ')',
        'purple': 'rgba(128, 0, 128, ' + alpha + ')'
    };
    return colorMap[color] || 'rgba(0, 255, 0, ' + alpha + ')';
}

// Fonction pour changer le mode de tir selon le power-up
export function setShootingMode(mode) {
    currentShootingMode = mode;
    console.log(`🎯 Mode de tir changé: ${mode}`);
}

// Exposer la fonction globalement pour les power-ups
window.setShootingMode = setShootingMode;

// Fonctions pour activer les différents modes de tir selon les power-ups
export function activateEnemy1Mode() {
    setShootingMode('enemy1'); // Laser jaune pulsant
}

export function activateEnemy2Mode() {
    setShootingMode('enemy2'); // Spirale cyan
}

export function activateEnemy3Mode() {
    setShootingMode('enemy3'); // Double laser rouge
}

export function activateEnemy4Mode() {
    setShootingMode('enemy4'); // Tir violet ondulant
}

export function activateEnemy5Mode() {
    setShootingMode('enemy5'); // Laser vert pulsant (par défaut)
}

// Fonction pour obtenir le mode de tir actuel
export function getCurrentShootingMode() {
    return currentShootingMode;
}

// Fonction pour créer un projectile selon le mode de tir actif
function createBullet(x, y) {
    const centerX = x - 4; // Centrer le projectile
    const baseY = y; // Position de base
    
    switch(currentShootingMode) {
        case 'enemy1': // Laser jaune pulsant
            return {
                x: centerX,
                y: baseY - 120,
                width: 2,
                height: 120,
                speed: 20,
                color: "#FFD700", // Jaune vif
                isPulsingLaser: true,
                minWidth: 2,
                maxWidth: 6,
                currentWidth: 2,
                startTime: Date.now(),
                pulseDuration: 2500,
                glowIntensity: 15
            };
            
        case 'enemy2': // Spirale cyan
            return {
                x: centerX - 4,
                y: baseY - 8,
                width: 8,
                height: 8,
                speed: 20,
                color: "cyan",
                isWaveBullet: true,
                startX: centerX - 4,
                amplitude: 30,
                frequency: 0.006,
                startTime: Date.now(),
                glowIntensity: 5
            };
            
        case 'enemy3': // Double laser rouge
            return {
                x: centerX,
                y: baseY - 80,
                width: 3,
                height: 80,
                speed: 20,
                color: "red",
                isFollowingLaser: true,
                glowIntensity: 10
            };
            
        case 'enemy4': // Tir violet ondulant
            return {
                x: centerX - 7,
                y: baseY - 14,
                width: 14,
                height: 14,
                speed: 20,
                color: "purple",
                isWaveBullet: true,
                startX: centerX - 7,
                amplitude: 50,
                frequency: 0.005,
                startTime: Date.now(),
                glowIntensity: 5
            };
            
        case 'enemy5': // Laser vert pulsant (par défaut)
        default:
            return {
                x: centerX,
                y: baseY - 90,
                width: 8,
                height: 90,
                speed: 20,
                color: "green",
                isPulsingLaser: true,
                minWidth: 8,
                maxWidth: 24,
                currentWidth: 8,
                startTime: Date.now(),
                pulseDuration: 1500,
                glowIntensity: 15
            };
    }
}

// Fonction pour tirer un projectile
export function shootBullet() {
    if (!starship || !canvas) return;
    
    const currentTime = Date.now();
    
    // Vérifier l'intervalle de tir
    if (currentTime - lastShootTime < shootInterval) return;
    
    // Créer le projectile au centre du vaisseau (copié de l'original)
    const bullet = createBullet(
        starship.x + starship.width / 2 - 2, // Centré horizontalement
        starship.y // Position Y du vaisseau
    );
    
    bullets.push(bullet);
    lastShootTime = currentTime;
}

// Fonction pour mettre à jour les projectiles
export function updateBullets() {
    if (!canvas) return;
    
    // Déplacer les projectiles vers le haut
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        
        // Supprimer les projectiles qui sortent de l'écran
        if (bullet.y + bullet.height < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Fonction pour dessiner tous les types de projectiles
export function drawBullets() {
    if (!ctx) return;
    
    // Filtrer et dessiner les projectiles
    bullets = bullets.filter(bullet => {
        const isOnScreen = bullet.y > -20 && bullet.y < canvas.height + 20 &&
                         bullet.x > -20 && bullet.x < canvas.width + 20;
        
        if (isOnScreen) {
            ctx.save();
            
            if (bullet.isPulsingLaser) {
                // Dessiner un laser pulsant (enemy1, enemy5)
                const elapsed = Date.now() - bullet.startTime;
                const pulseProgress = (elapsed % bullet.pulseDuration) / bullet.pulseDuration;
                const pulseWidth = bullet.minWidth + (bullet.maxWidth - bullet.minWidth) * Math.sin(pulseProgress * Math.PI * 2);
                
                ctx.shadowColor = bullet.color;
                ctx.shadowBlur = bullet.glowIntensity;
                
                const gradient = ctx.createLinearGradient(
                    bullet.x, bullet.y, 
                    bullet.x + pulseWidth, bullet.y
                );
                gradient.addColorStop(0, getTransparentColor(bullet.color));
                gradient.addColorStop(0.5, bullet.color);
                gradient.addColorStop(1, getTransparentColor(bullet.color));
                
                ctx.fillStyle = gradient;
                ctx.fillRect(bullet.x, bullet.y, pulseWidth, bullet.height);
                
            } else if (bullet.isWaveBullet) {
                // Dessiner un projectile ondulant (enemy2, enemy4)
                const elapsed = Date.now() - bullet.startTime;
                const waveOffset = Math.sin(elapsed * bullet.frequency) * bullet.amplitude;
                const currentX = bullet.startX + waveOffset;
                
                ctx.shadowColor = bullet.color;
                ctx.shadowBlur = bullet.glowIntensity;
                ctx.fillStyle = bullet.color;
                ctx.fillRect(currentX, bullet.y, bullet.width, bullet.height);
                
            } else if (bullet.isFollowingLaser) {
                // Dessiner un laser simple (enemy3)
                ctx.shadowColor = bullet.color;
                ctx.shadowBlur = bullet.glowIntensity;
                ctx.fillStyle = bullet.color;
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
            } else {
                // Fallback pour les anciens projectiles
                ctx.fillStyle = bullet.color;
                ctx.shadowColor = bullet.color;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(
                    bullet.x + bullet.width/2, 
                    bullet.y + bullet.width/2, 
                    bullet.width/2,
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        return isOnScreen;
    });
}

// Fonctions pour contrôler l'état du tir
export function startShooting() {
    shooting = true;
}

export function stopShooting() {
    shooting = false;
}

export function isShooting() {
    return shooting;
}

// Fonction principale pour gérer les tirs (appelée dans la boucle de jeu)
export function handleShooting() {
    if (shooting) {
        shootBullet();
    }
    updateBullets();
}
