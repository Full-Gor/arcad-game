// miniboss_simple.js - Gestion du mini-boss de façon modulaire
import { canvas, ctx } from './globals_simple.js';
import { enemyBullets } from './enemy_bullets_simple.js';
import { playShootSound } from './audio_simple.js';

// Variables pour le mini-boss (copiées de game.html)
let miniBossActive = false;
let miniBosses = [];
let miniBossImg = null;

// Variables pour les balles spéciales du mini-boss
let miniBossGrowingBullets = [];
let miniBossGrowingRectangles = [];

// Initialiser l'image du mini-boss
export function initializeMiniBoss() {
    console.log('Initialisation du mini-boss...');
    
    // Charger l'image du mini-boss
    miniBossImg = new Image();
    miniBossImg.src = '/img/miniBoss.jpg';
    
    console.log('Module mini-boss initialisé');
}

// Fonction pour créer le mini-boss (copiée de game.html ligne 4415-4444)
export function createMiniBoss() {
    if (miniBossActive) return;
    
    console.log('🔥 CRÉATION DU MINI-BOSS !');
    
    miniBossActive = true;
    miniBosses = []; // Réinitialiser le tableau
    
    // Créer un seul mini-boss pour le stage 1 (pas deux comme les stages 2 et 3)
    const bossCount = 1;
    
    for (let i = 0; i < bossCount; i++) {
        // Positionner le mini-boss au centre-haut
        const xPosition = canvas.width / 2 - 50; // Centré
        
        miniBosses.push({
            x: xPosition,
            y: 80,
            width: 100,
            height: 100,
            vx: 0.5 * (i === 0 ? 1 : -1), // Direction pour le mouvement
            vy: 0.3,
            health: 50, // Santé du mini-boss
            lastShootTime: Date.now() - 6000 // CORRECTION: Commencer à tirer immédiatement
        });
    }
    
    // Jouer un son d'alerte pour l'apparition du mini-boss
    // playSound(soundEffects.king); // À implémenter plus tard
    console.log('🎵 Son d\'alerte du mini-boss (king) à jouer');
}

// Fonction pour mettre à jour le mini-boss (copiée de game.html ligne 4447-4472)
export function updateMiniBoss() {
    if (!miniBossActive || miniBosses.length === 0) return;
    
    // Mettre à jour les balles et rectangles qui grossissent
    updateMiniBossGrowingBullets();
    updateMiniBossGrowingRectangles();
    
    for (let i = 0; i < miniBosses.length; i++) {
        const miniBoss = miniBosses[i];
        
        // Mouvement lent
        miniBoss.x += miniBoss.vx;
        miniBoss.y += miniBoss.vy;
        
        // Rebondir aux bords
        if (miniBoss.x <= 0 || miniBoss.x + miniBoss.width >= canvas.width) {
            miniBoss.vx *= -1;
        }
        if (miniBoss.y <= 0 || miniBoss.y + miniBoss.height >= canvas.height / 2) {
            miniBoss.vy *= -1;
        }
        
        // CORRECTION: Tir toutes les 6 secondes (3s pour grossir + 1s rectangles + 2s pause)
        const currentTime = Date.now();
        if (currentTime - miniBoss.lastShootTime > 6000) {
            shootMiniBossBullets(miniBoss, i);
            miniBoss.lastShootTime = currentTime;
        }
    }
}

// Fonction pour mettre à jour les balles qui grossissent du mini-boss
function updateMiniBossGrowingBullets() {
    for (let i = miniBossGrowingBullets.length - 1; i >= 0; i--) {
        const growingBullet = miniBossGrowingBullets[i];
        const elapsed = Date.now() - growingBullet.startTime;
        
        // Suivre le mini-boss
        if (growingBullet.miniBossReference && miniBosses.includes(growingBullet.miniBossReference)) {
            growingBullet.x = growingBullet.miniBossReference.x + growingBullet.miniBossReference.width / 2;
            growingBullet.y = growingBullet.miniBossReference.y + growingBullet.offsetY;
        } else {
            miniBossGrowingBullets.splice(i, 1);
            continue;
        }
        
        if (elapsed >= growingBullet.duration) {
            // Tirer la grosse balle
            enemyBullets.push({
                x: growingBullet.x - growingBullet.maxSize / 2,
                y: growingBullet.y,
                width: growingBullet.maxSize,
                height: growingBullet.maxSize,
                speed: 3,
                color: growingBullet.color,
                isMiniBossBullet: true
            });
            
            miniBossGrowingBullets.splice(i, 1);
            console.log(`Mini-boss grosse balle (40px) tirée !`);
        } else {
            // Continuer à grossir
            const progress = elapsed / growingBullet.duration;
            growingBullet.currentSize = growingBullet.startSize + 
                (growingBullet.maxSize - growingBullet.startSize) * progress;
        }
    }
}

// Fonction pour mettre à jour les rectangles qui grossissent du mini-boss
function updateMiniBossGrowingRectangles() {
    for (let i = miniBossGrowingRectangles.length - 1; i >= 0; i--) {
        const growingRect = miniBossGrowingRectangles[i];
        const elapsed = Date.now() - growingRect.startTime;
        
        // Suivre le mini-boss
        if (growingRect.miniBossReference && miniBosses.includes(growingRect.miniBossReference)) {
            growingRect.x = growingRect.miniBossReference.x + growingRect.offsetX;
            growingRect.y = growingRect.miniBossReference.y + growingRect.offsetY;
        } else {
            miniBossGrowingRectangles.splice(i, 1);
            continue;
        }
        
        if (elapsed >= growingRect.duration) {
            // Tirer le rectangle
            enemyBullets.push({
                x: growingRect.x,
                y: growingRect.y,
                width: growingRect.maxWidth,
                height: growingRect.maxHeight,
                speed: 3,
                color: growingRect.color,
                isMiniBossBullet: true,
                isRectangle: true
            });
            
            miniBossGrowingRectangles.splice(i, 1);
            console.log(`Rectangle mini-boss (4x100px) tiré !`);
        } else {
            // Continuer à grandir
            const progress = elapsed / growingRect.duration;
            growingRect.currentWidth = growingRect.startWidth + 
                (growingRect.maxWidth - growingRect.startWidth) * progress;
            growingRect.currentHeight = growingRect.startHeight + 
                (growingRect.maxHeight - growingRect.startHeight) * progress;
        }
    }
}

// Fonction pour dessiner le mini-boss (copiée de game.html ligne 4475-4499)
export function drawMiniBoss() {
    if (!miniBossActive || miniBosses.length === 0) return;
    
    // Dessiner les balles et rectangles qui grossissent
    drawMiniBossGrowingBullets();
    drawMiniBossGrowingRectangles();
    
    for (let i = 0; i < miniBosses.length; i++) {
        const miniBoss = miniBosses[i];
        
        ctx.save();
        
        // Dessiner le mini-boss
        if (miniBossImg && miniBossImg.complete) {
            ctx.drawImage(miniBossImg, miniBoss.x, miniBoss.y, miniBoss.width, miniBoss.height);
        } else {
            // Image de secours si l'image n'est pas chargée
            ctx.fillStyle = "orange"; // Couleur orange pour le mini-boss
            ctx.fillRect(miniBoss.x, miniBoss.y, miniBoss.width, miniBoss.height);
        }
        
        // Afficher la santé du mini-boss
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(miniBoss.health + "/50", miniBoss.x + miniBoss.width/2 - 20, miniBoss.y - 10);
        
        ctx.restore();
    }
}

// Fonction pour dessiner les balles qui grossissent du mini-boss
function drawMiniBossGrowingBullets() {
    if (!ctx) return;
    
    miniBossGrowingBullets.forEach(growingBullet => {
        ctx.save();
        
        ctx.fillStyle = growingBullet.color;
        ctx.shadowColor = growingBullet.color;
        ctx.shadowBlur = 8; // Plus de lueur pour le mini-boss
        
        // Dessiner la balle qui grossit comme un cercle
        ctx.beginPath();
        ctx.arc(
            growingBullet.x, 
            growingBullet.y, 
            growingBullet.currentSize / 2, // Rayon
            0, 
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    });
}

// Fonction pour dessiner les rectangles qui grossissent du mini-boss
function drawMiniBossGrowingRectangles() {
    if (!ctx) return;
    
    miniBossGrowingRectangles.forEach(growingRect => {
        ctx.save();
        
        ctx.fillStyle = growingRect.color;
        ctx.shadowColor = growingRect.color;
        ctx.shadowBlur = 5;
        
        // Dessiner le rectangle qui grossit
        ctx.fillRect(
            growingRect.x - growingRect.currentWidth / 2, // Centré
            growingRect.y,
            growingRect.currentWidth,
            growingRect.currentHeight
        );
        
        ctx.restore();
    });
}

// NOUVELLE fonction pour les tirs du mini-boss avec balle qui grossit
function shootMiniBossBullets(miniBoss, index) {
    if (!miniBossActive || !miniBoss) return;
    
    // CORRECTION: Nouveau pattern - Balle qui grossit (40px en 3s) + rectangles qui grandissent
    createMiniBossGrowingBullet(miniBoss, index);
    
    // Son de tir
    playShootSound();
}

// Fonction pour créer une balle qui grossit pour le mini-boss
function createMiniBossGrowingBullet(miniBoss, index) {
    const growingBullet = {
        x: miniBoss.x + miniBoss.width / 2,
        y: miniBoss.y + miniBoss.height + 7, // 7px devant le nez
        startSize: 4, // Taille initiale
        currentSize: 4,
        maxSize: 40, // CORRECTION: Taille finale 40px (au lieu de 20px)
        color: index === 0 ? "red" : "orange",
        startTime: Date.now(),
        duration: 3000, // CORRECTION: 3 secondes (au lieu de 2s)
        miniBossReference: miniBoss, // Référence au mini-boss pour le suivre
        offsetX: 0,
        offsetY: miniBoss.height + 7, // 7px devant le nez
        index: index,
        isGrowing: true
    };
    
    miniBossGrowingBullets.push(growingBullet);
    
    // CORRECTION: Créer 5 rectangles qui grandissent APRÈS la balle qui grossit
    setTimeout(() => {
        createMiniBossGrowingRectangles(miniBoss, index);
    }, 3000); // Après que la balle soit tirée
    
    console.log(`Mini-boss balle qui grossit créée ! 40px en 3s, puis rectangles`);
}

// Fonction pour créer les rectangles qui grandissent
function createMiniBossGrowingRectangles(miniBoss, index) {
    if (!miniBossActive || !miniBoss) return;
    
    // Créer 5 rectangles qui grandissent petit à petit
    for (let i = 0; i < 5; i++) {
        const growingRect = {
            x: miniBoss.x + (miniBoss.width / 5) * i,
            y: miniBoss.y + miniBoss.height,
            startWidth: 1, // Largeur initiale très petite
            startHeight: 1, // Hauteur initiale très petite
            currentWidth: 1,
            currentHeight: 1,
            maxWidth: 4, // CORRECTION: Largeur finale 4px
            maxHeight: 100, // CORRECTION: Hauteur finale 100px
            color: index === 0 ? "red" : "orange",
            startTime: Date.now(),
            duration: 1000, // 1 seconde pour grandir
            miniBossReference: miniBoss,
            offsetX: (miniBoss.width / 5) * i,
            offsetY: miniBoss.height,
            index: index,
            isGrowing: true
        };
        
        miniBossGrowingRectangles.push(growingRect);
    }
    
    console.log(`5 rectangles qui grandissent créés ! 4x100px en 1s`);
}

// Fonction pour vérifier si le mini-boss est actif
export function isMiniBossActive() {
    return miniBossActive;
}

// Fonction pour obtenir les mini-bosses
export function getMiniBosses() {
    return miniBosses;
}

// Fonction pour endommager le mini-boss
export function damageMiniBoss(miniBossIndex, damage = 1) {
    if (!miniBossActive || !miniBosses[miniBossIndex]) return false;
    
    const miniBoss = miniBosses[miniBossIndex];
    miniBoss.health -= damage;
    
    console.log(`Mini-boss ${miniBossIndex} endommagé ! Santé: ${miniBoss.health}/50`);
    
    // Vérifier si le mini-boss est détruit
    if (miniBoss.health <= 0) {
        console.log(`🎆 Mini-boss ${miniBossIndex} détruit !`);
        
        // Supprimer ce mini-boss
        miniBosses.splice(miniBossIndex, 1);
        
        // Si plus de mini-boss, désactiver le mode mini-boss
        if (miniBosses.length === 0) {
            miniBossActive = false;
            console.log('🎊 TOUS LES MINI-BOSS DÉTRUITS !');
        }
        
        return true; // Mini-boss détruit
    }
    
    return false; // Mini-boss endommagé mais pas détruit
}

// Fonction pour désactiver le mini-boss
export function deactivateMiniBoss() {
    miniBossActive = false;
    miniBosses = [];
    miniBossGrowingBullets = []; // Nettoyer les balles qui grossissent
    miniBossGrowingRectangles = []; // Nettoyer les rectangles qui grossissent
    console.log('Mini-boss désactivé avec nettoyage des effets spéciaux');
}
