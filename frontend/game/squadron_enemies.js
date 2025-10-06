// squadron_enemies.js - Gestion des escadrons symétriques (types 11 et 12)
import { canvas, ctx } from './globals_simple.js';
import { enemies } from './enemies_simple.js';
import { enemyBullets } from './enemy_bullets_simple.js';

// Variables pour les escadrons
export let squadronEnemies = { left: [], right: [] };

// ========================================
// CRÉATION DES ESCADRONS SYMÉTRIQUES
// ========================================

// Fonction pour créer seulement l'escadron droit
export function createRightSquadron() {
    console.log('🚀 Création de l\'escadron droit...');
    const squadronSize = 5;
    const spacing = 70; // Espacement entre les vaisseaux
    
    // Créer l'escadron droit (ENEMY12 - type 11)
    for (let i = 0; i < squadronSize; i++) {
        const enemy = {
            type: 11, // ENEMY12 (type 11)
            width: 45,
            height: 45,
            x: canvas.width - 100 + (i * 20), // Plus près de l'écran
            y: 50 + (i * 40), // Position échelonnée
            
            // Propriétés de formation
            squadronIndex: i,
            isLeader: i === 0,
            formation: 'right',
            
            // Phases de mouvement
            phase: 'entering',  // 'entering', 'moving_center', 'formation', 'descending'
            targetX: canvas.width * 0.75, // 3/4 de l'écran pour le côté droit
            targetY: canvas.height * 0.3 + (i * 50), // Position en formation
            
            // Vitesse
            vx: -1, // Plus lent pour rester visible
            vy: 0.5, // Descente très lente
            
            // Système de tir alterné
            shotOrder: i,
            lastShot: 0,
            canShoot: false,
            
            // Visuel
            color: '#00FFFF',
            glitchIntensity: 0
        };
        
        squadronEnemies.right.push(enemy);
        enemies.push(enemy);
    }
    console.log(`✅ Escadron droit créé: ${squadronEnemies.right.length} ennemis`);
}

// Fonction pour créer seulement l'escadron gauche
export function createLeftSquadron() {
    console.log('🚀 Création de l\'escadron gauche...');
    const squadronSize = 5;
    const spacing = 70; // Espacement entre les vaisseaux
    
    // Créer l'escadron gauche (ENEMY13 - type 12)
    for (let i = 0; i < squadronSize; i++) {
        const enemy = {
            type: 12, // ENEMY13 (type 12)
            width: 45,
            height: 45,
            x: 100 - (i * 20), // Plus près de l'écran côté gauche
            y: 50 + (i * 40), // Position échelonnée
            
            // Propriétés de formation
            squadronIndex: i,
            isLeader: i === 0,
            formation: 'left',
            
            // Phases de mouvement
            phase: 'entering',
            targetX: canvas.width * 0.25, // 1/4 de l'écran pour le côté gauche
            targetY: canvas.height * 0.3 + (i * 50),
            
            // Vitesse
            vx: 1, // Plus lent pour rester visible
            vy: 0.5, // Descente très lente
            
            // Système de tir alterné
            shotOrder: i,
            lastShot: 0,
            canShoot: false,
            
            // Visuel
            color: '#FF00FF',
            glitchIntensity: 0
        };
        
        squadronEnemies.left.push(enemy);
        enemies.push(enemy);
    }
    console.log(`✅ Escadron gauche créé: ${squadronEnemies.left.length} ennemis`);
}

// Fonction pour créer les deux escadrons en même temps (pour compatibilité)
export function createSymmetricSquadron() {
    createRightSquadron();
    createLeftSquadron();
    console.log(`🎯 Total ennemis spéciaux: ${enemies.filter(e => e.type >= 10).length}`);
}

// ========================================
// MISE À JOUR DES MOUVEMENTS
// ========================================

export function updateSquadronEnemies() {
    // Mise à jour de l'escadron droit
    if (squadronEnemies.right.length > 0) {
        updateSquadron(squadronEnemies.right, 'right');
    }
    
    // Mise à jour de l'escadron gauche
    if (squadronEnemies.left.length > 0) {
        updateSquadron(squadronEnemies.left, 'left');
    }
}

function updateSquadron(squadron, side) {
    let activeShooterIndex = -1;
    
    squadron.forEach((enemy, index) => {
        if (!enemies.includes(enemy)) {
            squadron.splice(index, 1);
            return;
        }
        
        switch(enemy.phase) {
            case 'entering':
                // Entrer dans l'écran
                enemy.x += enemy.vx;
                enemy.y += enemy.vy;
                
                // Vérifier si l'ennemi a atteint le bord visible
                const inScreen = side === 'right' 
                    ? enemy.x < canvas.width - enemy.width
                    : enemy.x > 0;
                    
                if (inScreen && enemy.y > 50) {
                    enemy.phase = 'moving_center';
                }
                break;
                
            case 'moving_center':
                // Se déplacer vers la position de formation
                const dx = enemy.targetX - enemy.x;
                const dy = enemy.targetY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 5) {
                    enemy.x += (dx / dist) * 2;
                    enemy.y += (dy / dist) * 2;
                } else {
                    enemy.x = enemy.targetX;
                    enemy.y = enemy.targetY;
                    enemy.phase = 'formation';
                    enemy.canShoot = true;
                }
                break;
                
            case 'formation':
                // Maintenir la formation et préparer la descente
                // Petit mouvement de flottement
                enemy.y += Math.sin(Date.now() * 0.002 + enemy.squadronIndex) * 0.5;
                
                // Vérifier si tous sont en formation
                const allInFormation = squadron.every(e => e.phase === 'formation' || e.phase === 'descending');
                if (allInFormation && index === 0) { // Le leader décide
                    setTimeout(() => {
                        squadron.forEach(e => {
                            if (e.phase === 'formation') {
                                e.phase = 'descending';
                                e.vy = 3;
                            }
                        });
                    }, 2000); // Attendre 2 secondes en formation
                }
                
                // Tir alterné en formation
                if (enemy.canShoot && activeShooterIndex === -1) {
                    const now = Date.now();
                    const shootInterval = 500; // Intervalle entre les tirs du groupe
                    const lastGroupShot = squadron[0].lastShot || 0;
                    
                    if (now - lastGroupShot > shootInterval) {
                        // Déterminer qui tire
                        const currentShooter = Math.floor((now / shootInterval)) % squadron.length;
                        if (enemy.squadronIndex === currentShooter) {
                            createGlitchBullet(enemy);
                            squadron[0].lastShot = now; // Utiliser le leader pour stocker le temps
                        }
                    }
                }
                break;
                
            case 'descending':
                // Descendre en tirant
                enemy.y += enemy.vy;
                
                // Légère oscillation horizontale pendant la descente
                enemy.x += Math.sin(Date.now() * 0.003 + enemy.squadronIndex * 0.5) * 1.5;
                
                // Tir continu pendant la descente
                if (enemy.canShoot) {
                    const now = Date.now();
                    if (now - enemy.lastShot > 1000) { // Tir toutes les secondes
                        createGlitchBullet(enemy);
                        enemy.lastShot = now;
                    }
                }
                
                // Supprimer si sorti de l'écran
                if (enemy.y > canvas.height + enemy.height) {
                    const idx = squadron.indexOf(enemy);
                    if (idx > -1) squadron.splice(idx, 1);
                    const enemyIdx = enemies.indexOf(enemy);
                    if (enemyIdx > -1) enemies.splice(enemyIdx, 1);
                }
                break;
        }
        
        // Effet de glitch visuel
        if (enemy.phase === 'formation' || enemy.phase === 'descending') {
            enemy.glitchIntensity = Math.random() * 5;
        }
    });
}

// ========================================
// SYSTÈME DE TIR
// ========================================

function createGlitchBullet(enemy) {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;
    
    const bullet = {
        type: 'glitch',
        x: centerX,
        y: centerY,
        width: 10,
        height: 10,
        vx: (Math.random() - 0.5) * 2, // Mouvement latéral aléatoire
        vy: 5,
        
        // Propriétés de glitch
        glitchOffset: { x: 0, y: 0 },
        glitchPhase: 0,
        glitchIntensity: 5,
        glitchColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
        currentColor: '#00FFFF',
        
        // Effet d'instabilité
        instability: 0.1,
        originalX: centerX,
        trail: []
    };
    
    enemyBullets.push(bullet);
}

// ========================================
// RENDU VISUEL
// ========================================

export function drawSquadronEnemies(ctx) {
    let drawnCount = 0;
    
    // Dessiner l'escadron droit
    squadronEnemies.right.forEach((enemy, index) => {
        if (!enemies.includes(enemy)) {
            console.log(`❌ Escadron droit ${index} pas dans enemies[]`);
            return;
        }
        drawSquadronEnemy(ctx, enemy);
        drawnCount++;
    });
    
    // Dessiner l'escadron gauche
    squadronEnemies.left.forEach((enemy, index) => {
        if (!enemies.includes(enemy)) {
            console.log(`❌ Escadron gauche ${index} pas dans enemies[]`);
            return;
        }
        drawSquadronEnemy(ctx, enemy);
        drawnCount++;
    });
    
    // Debug: afficher le nombre d'escadrons actifs (seulement si problème)
    if ((squadronEnemies.right.length > 0 || squadronEnemies.left.length > 0) && drawnCount === 0) {
        console.log(`❌ PROBLÈME: Escadrons présents mais non dessinés: Droit=${squadronEnemies.right.length}, Gauche=${squadronEnemies.left.length}`);
    } else if (drawnCount > 0) {
        console.log(`✅ Escadrons dessinés: ${drawnCount}`);
    }
}

function drawSquadronEnemy(ctx, enemy) {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;
    
    // Effet de glitch
    if (enemy.glitchIntensity > 0) {
        // Dessiner des copies décalées pour l'effet glitch
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FF0000';
        drawShipShape(ctx, enemy.x - enemy.glitchIntensity, enemy.y, enemy.width, enemy.height);
        
        ctx.fillStyle = '#00FF00';
        drawShipShape(ctx, enemy.x + enemy.glitchIntensity, enemy.y, enemy.width, enemy.height);
        
        ctx.fillStyle = '#0000FF';
        drawShipShape(ctx, enemy.x, enemy.y - enemy.glitchIntensity, enemy.width, enemy.height);
    }
    
    ctx.globalAlpha = 1;
    
    // Vaisseau principal
    const gradient = ctx.createLinearGradient(
        enemy.x, enemy.y,
        enemy.x, enemy.y + enemy.height
    );
    gradient.addColorStop(0, enemy.formation === 'right' ? '#00FFFF' : '#FF00FF');
    gradient.addColorStop(0.5, '#FFFFFF');
    gradient.addColorStop(1, enemy.formation === 'right' ? '#0088FF' : '#FF0088');
    
    ctx.fillStyle = gradient;
    drawShipShape(ctx, enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Effet de lueur selon la phase
    if (enemy.phase === 'formation' || enemy.phase === 'descending') {
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

function drawShipShape(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x, y + height * 0.7);
    ctx.lineTo(x + width * 0.2, y + height);
    ctx.lineTo(x + width * 0.8, y + height);
    ctx.lineTo(x + width, y + height * 0.7);
    ctx.closePath();
    ctx.fill();
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

export function clearSquadronEnemies() {
    squadronEnemies.left = [];
    squadronEnemies.right = [];
}

export function getSquadronEnemiesCount() {
    return squadronEnemies.left.length + squadronEnemies.right.length;
}

export function getSquadronEnemies() {
    return squadronEnemies;
}
