// enemy_info_display.js - Affichage des informations sur les ennemis
import { canvas, ctx } from './globals_simple.js';

// Variables pour l'affichage des informations
let currentEnemyInfo = {
    type: -1,
    name: '',
    shootPattern: '',
    displayTime: 0,
    fadeOpacity: 0
};

const DISPLAY_DURATION = 4000; // 4 secondes d'affichage
const FADE_DURATION = 1000; // 1 seconde de fade

// Informations détaillées sur chaque type d'ennemi
const ENEMY_INFO = {
    0: {
        name: "ENEMY1",
        shootPattern: "🟡 Laser Jaune Pulsant",
        description: "Laser fin qui pulse (2→6px) toutes les 3 secondes",
        color: "#FFD700"
    },
    1: {
        name: "ENEMY2", 
        shootPattern: "🔵 Spirale Cyan",
        description: "3 tirs ondulants en spirale décalés de 200ms",
        color: "#00FFFF"
    },
    2: {
        name: "ENEMY3",
        shootPattern: "🔴 Double Laser Rouge QUI SUIT",
        description: "2 lasers (rouge + orange) qui suivent à 7px du nez",
        color: "#FF4444"
    },
    3: {
        name: "ENEMY4",
        shootPattern: "🟣 Tir Violet Ondulant", 
        description: "Cercle violet qui ondule avec grande amplitude",
        color: "#AA44FF"
    },
    4: {
        name: "ENEMY5",
        shootPattern: "🟢 Laser Vert Pulsant",
        description: "Laser épais qui pulse énormément (8→24px)",
        color: "#44FF44"
    },
    5: {
        name: "ENEMY6",
        shootPattern: "🔵 Onde Sonique QUI SUIT",
        description: "2 anneaux expansifs qui suivent à 7px du nez",
        color: "#4488FF"
    },
    6: {
        name: "ENEMY7",
        shootPattern: "⚡ Laser Pulsé Cyan Ultra-Avancé",
        description: "Utilise enemy4.jpg - Charge 0.5s → Laser avec particules et effets",
        color: "#00DDFF"
    },
    7: {
        name: "ENEMY8",
        shootPattern: "🌊 Onde Sinusoïdale Magenta",
        description: "Utilise enemy5.jpg - 8 projectiles en formation serpentine avec traînées",
        color: "#FF44AA"
    },
    8: {
        name: "ENEMY9",
        shootPattern: "🌈 Spirale Arc-en-Ciel FRÉQUENTE",
        description: "Utilise enemy6.jpg - 36 projectiles multicolores toutes les 0.8s !",
        color: "#FF8844"
    },
    9: {
        name: "ENEMY10",
        shootPattern: "🔵 Laser Entonnoir Massif",
        description: "Entonnoir bleu ciel qui croît 3s puis se désintègre 1.5s",
        color: "#87CEEB"
    }
};

// Fonction pour déclencher l'affichage d'informations sur un ennemi
export function showEnemyInfo(enemyType) {
    // Mode test: possibilité de couper l'affichage via variable importée
    if (ENEMY_INFO[enemyType]) {
        currentEnemyInfo.type = enemyType;
        currentEnemyInfo.name = ENEMY_INFO[enemyType].name;
        currentEnemyInfo.shootPattern = ENEMY_INFO[enemyType].shootPattern;
        currentEnemyInfo.description = ENEMY_INFO[enemyType].description;
        currentEnemyInfo.color = ENEMY_INFO[enemyType].color;
        currentEnemyInfo.displayTime = Date.now();
        currentEnemyInfo.fadeOpacity = 1;
        // Log coupé pour ne pas polluer la console pendant test
    }
}

// Fonction pour mettre à jour l'affichage
export function updateEnemyInfoDisplay() {
    if (currentEnemyInfo.type === -1) return;
    
    const elapsed = Date.now() - currentEnemyInfo.displayTime;
    
    // Gestion du fade out
    if (elapsed > DISPLAY_DURATION) {
        const fadeProgress = (elapsed - DISPLAY_DURATION) / FADE_DURATION;
        currentEnemyInfo.fadeOpacity = Math.max(0, 1 - fadeProgress);
        
        // Arrêter l'affichage après le fade
        if (currentEnemyInfo.fadeOpacity <= 0) {
            currentEnemyInfo.type = -1;
        }
    }
}

// Fonction pour dessiner l'affichage des informations
export function drawEnemyInfoDisplay() {
    if (!ctx || currentEnemyInfo.type === -1 || currentEnemyInfo.fadeOpacity <= 0) return;
    
    ctx.save();
    
    // Position de l'affichage (coin supérieur droit)
    const panelX = canvas.width - 400;
    const panelY = 20;
    const panelWidth = 380;
    const panelHeight = 120;
    
    // Fond semi-transparent
    ctx.globalAlpha = currentEnemyInfo.fadeOpacity * 0.9;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Bordure colorée selon le type d'ennemi
    ctx.strokeStyle = currentEnemyInfo.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Titre principal
    ctx.globalAlpha = currentEnemyInfo.fadeOpacity;
    ctx.fillStyle = currentEnemyInfo.color;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(currentEnemyInfo.name, panelX + 15, panelY + 30);
    
    // Pattern de tir
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(currentEnemyInfo.shootPattern, panelX + 15, panelY + 55);
    
    // Description détaillée
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '12px Arial';
    
    // Diviser la description en lignes si elle est trop longue
    const words = currentEnemyInfo.description.split(' ');
    const maxWidth = panelWidth - 30;
    let line = '';
    let y = panelY + 75;
    
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, panelX + 15, y);
            line = words[i] + ' ';
            y += 15;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, panelX + 15, y);
    
    // Indicateur de progression (barre de temps)
    const elapsed = Date.now() - currentEnemyInfo.displayTime;
    const progress = Math.min(elapsed / DISPLAY_DURATION, 1);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(panelX + 15, panelY + panelHeight - 15, panelWidth - 30, 4);
    
    ctx.fillStyle = currentEnemyInfo.color;
    ctx.fillRect(panelX + 15, panelY + panelHeight - 15, (panelWidth - 30) * progress, 4);
    
    ctx.restore();
}

// Fonction pour vérifier si un affichage est actif
export function isEnemyInfoDisplayActive() {
    return currentEnemyInfo.type !== -1 && currentEnemyInfo.fadeOpacity > 0;
}

// Fonction pour forcer l'arrêt de l'affichage
export function hideEnemyInfo() {
    currentEnemyInfo.type = -1;
    currentEnemyInfo.fadeOpacity = 0;
}

// Fonction pour obtenir les informations sur un type d'ennemi
export function getEnemyInfo(enemyType) {
    return ENEMY_INFO[enemyType] || null;
}
