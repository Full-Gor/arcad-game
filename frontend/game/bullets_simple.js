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

// Fonction pour créer un projectile simple (rond comme dans l'original)
function createBullet(x, y) {
    return {
        x: x,
        y: y,
        width: 4,  // Diamètre du cercle
        height: 4, // Diamètre du cercle (pour garder un cercle)
        speed: 20,
        color: "#04fbac" // Vert-bleu comme le joueur principal
    };
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

// Fonction pour dessiner les projectiles (ronds comme dans l'original)
export function drawBullets() {
    if (!ctx) return;
    
    // Filtrer et dessiner les projectiles
    bullets = bullets.filter(bullet => {
        const isOnScreen = bullet.y > -20 && bullet.y < canvas.height + 20 &&
                         bullet.x > -20 && bullet.x < canvas.width + 20;
        
        if (isOnScreen) {
            // Dessiner une boule ronde avec effet de lueur (comme l'original)
            ctx.save();
            ctx.fillStyle = bullet.color;
            ctx.shadowColor = bullet.color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(
                bullet.x + bullet.width/2, 
                bullet.y + bullet.width/2, 
                bullet.width/2, // Rayon = moitié du diamètre
                0, 
                Math.PI * 2
            );
            ctx.fill();
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
