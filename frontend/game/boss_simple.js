// boss_simple.js - Gestion du boss principal de façon modulaire
import { canvas, ctx } from './globals_simple.js';
import { enemyBullets } from './enemy_bullets_simple.js';
import { playShootSound } from './audio_simple.js';
import { enemies, setBossActive } from './enemies_simple.js';

// Variables pour le boss principal (copiées de game.html)
let bossActive = false;
let boss = null;
let bossHealth = 0;
let bossImg = null;
let bossShootTimer = 0;

// Initialiser l'image du boss
export function initializeBoss() {
    console.log('Initialisation du boss principal...');
    
    // Charger l'image du boss
    bossImg = new Image();
    bossImg.src = '/img/boss.jpg';
    
    console.log('Module boss principal initialisé');
}

// Fonction pour créer le boss principal (copiée de game.html ligne 3767-3796)
export function createBoss() {
    if (bossActive) return;
    
    console.log('🔥 CRÉATION DU BOSS PRINCIPAL !');
    
    bossActive = true;
    bossHealth = 200; // Santé du boss principal
    
    // CORRECTION: Notifier le module enemies que le boss est actif
    setBossActive(true);
    
    // Afficher la barre de vie du boss
    const bossHealthBar = document.getElementById("bossHealthBar");
    const bossHealthFill = document.getElementById("bossHealthFill");
    if (bossHealthBar && bossHealthFill) {
        bossHealthBar.style.display = "block";
        bossHealthFill.style.width = "100%";
    }
    
    boss = {
        x: canvas.width / 2 - 75,
        y: 50,
        width: 150,
        height: 150,
        vx: 1, // Vitesse horizontale
        vy: 1.5, // Vitesse verticale
        rotation: 0,
        movePattern: 0, // Pattern de mouvement
        moveTimer: 0,
        lastMoveChange: Date.now()
    };
    
    // Son d'apparition du boss
    // playSound(soundEffects.bossAppear); // À implémenter plus tard
    console.log('🎵 Son d\'apparition du boss (bossAppear) à jouer');
    
    // CORRECTION: Vider tous les ennemis normaux quand le boss apparaît
    enemies.length = 0;
    console.log('🧹 Boss créé ! TOUS les ennemis normaux supprimés.');
}

// Fonction pour mettre à jour le boss (copiée de game.html ligne 4070-4137)
export function updateBoss() {
    if (!bossActive || !boss) return;
    
    // Rotation continue du boss
    boss.rotation += 2;
    
    // Changer de pattern de mouvement toutes les 3 secondes
    const currentTime = Date.now();
    if (currentTime - boss.lastMoveChange > 3000) {
        boss.movePattern = (boss.movePattern + 1) % 4; // 4 patterns différents
        boss.lastMoveChange = currentTime;
        boss.moveTimer = 0;
    }
    
    // Mouvement selon le pattern actuel
    switch (boss.movePattern) {
        case 0: // Mouvement en cercle
            boss.moveTimer += 0.02;
            boss.x = canvas.width/2 + Math.cos(boss.moveTimer) * 200;
            boss.y = canvas.height/4 + Math.sin(boss.moveTimer) * 100;
            break;
        case 1: // Zigzag
            boss.x += boss.vx;
            if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
                boss.vx *= -1;
                boss.y += 50;
                if (boss.y > canvas.height/2) boss.y = 50;
            }
            break;
        case 2: // Mouvement en 8
            boss.moveTimer += 0.02;
            boss.x = canvas.width/2 + Math.cos(boss.moveTimer) * 200;
            boss.y = canvas.height/4 + Math.sin(boss.moveTimer * 2) * 100;
            break;
        case 3: // Dash aléatoire
            if (Math.random() < 0.02) {
                boss.vx = (Math.random() - 0.5) * 8;
                boss.vy = (Math.random() - 0.5) * 6;
            }
            boss.x += boss.vx;
            boss.y += boss.vy;
            break;
    }
    
    // Maintenir le boss dans les limites
    boss.x = Math.max(0, Math.min(canvas.width - boss.width, boss.x));
    boss.y = Math.max(0, Math.min(canvas.height/2 - boss.height, boss.y));
    
    // CORRECTION: Tirs plus fréquents - délai réduit
    bossShootTimer++;
    if (bossShootTimer >= 15) { // CORRECTION: 15 frames au lieu de 30 (environ 0.25s)
        shootBossBullets();
        bossShootTimer = 0;
    }
}

// Fonction pour dessiner le boss (copiée de game.html ligne 4139-4181)
export function drawBoss() {
    if (!bossActive || !boss) return;
    
    ctx.save();
    
    // Opacité normale
    ctx.globalAlpha = 1;
    
    // Centrer le boss
    ctx.translate(boss.x + boss.width/2, boss.y + boss.height/2);
    
    // Rotation du boss
    ctx.rotate(boss.rotation * Math.PI / 180);
    
    // Dessiner le boss
    if (bossImg && bossImg.complete) {
        ctx.drawImage(bossImg, -boss.width/2, -boss.height/2, boss.width, boss.height);
    } else {
        // Image de secours
        ctx.fillStyle = "red";
        ctx.fillRect(-boss.width/2, -boss.height/2, boss.width, boss.height);
    }
    
    ctx.restore();
    ctx.globalAlpha = 1.0; // Réinitialiser l'opacité
}

// Fonction pour les tirs du boss (copiée de game.html ligne 4182-4233)
function shootBossBullets() {
    if (!bossActive || !boss) return;
    
    // CORRECTION: Tirer dans 16 directions avec vitesse augmentée
    for (let i = 0; i < 16; i++) {
        const angle = (i * 22.5) * Math.PI / 180; // 360/16 = 22.5 degrés
        const speed = 3; // CORRECTION: Vitesse augmentée de 1 à 3
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        enemyBullets.push({
            x: boss.x + boss.width/2,
            y: boss.y + boss.height/2,
            width: 10,
            height: 10,
            speed: 3, // CORRECTION: Définir speed pour cohérence
            vx: vx,
            vy: vy,
            color: "yellow",
            type: 2,
            isBossBullet: true
        });
    }
    
    // CORRECTION: Tirs verticaux avec vitesse cohérente
    // Tirs vers le bas
    enemyBullets.push({
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        width: 5,
        height: 5,
        speed: 5, // Vitesse verticale rapide
        vx: 0,
        vy: 5,
        color: "red",
        type: 2,
        isBossBullet: true
    });
    
    // Tirs vers le haut
    enemyBullets.push({
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        width: 8,
        height: 8,
        speed: 5, // CORRECTION: speed cohérent avec vy
        vx: 0,
        vy: -5,
        color: "red",
        type: 2,
        isBossBullet: true
    });
    
    // Son de tir
    playShootSound();
}

// Fonction pour vérifier si le boss est actif
export function isBossActive() {
    return bossActive;
}

// Fonction pour obtenir le boss
export function getBoss() {
    return boss;
}

// Fonction pour endommager le boss
export function damageBoss(damage = 1) {
    if (!bossActive || !boss) return false;
    
    bossHealth -= damage;
    
    // Mettre à jour la barre de vie
    const bossHealthFill = document.getElementById("bossHealthFill");
    if (bossHealthFill) {
        const healthPercent = Math.max(0, (bossHealth / 200) * 100);
        bossHealthFill.style.width = healthPercent + "%";
    }
    
    console.log(`Boss endommagé ! Santé: ${bossHealth}/200`);
    
    // Vérifier si le boss est détruit
    if (bossHealth <= 0) {
        console.log('🎆 BOSS PRINCIPAL DÉTRUIT !');
        
        // Désactiver le boss
        bossActive = false;
        boss = null;
        
        // CORRECTION: Notifier le module enemies que le boss n'est plus actif
        setBossActive(false);
        
        // Cacher la barre de vie
        const bossHealthBar = document.getElementById("bossHealthBar");
        if (bossHealthBar) {
            bossHealthBar.style.display = "none";
        }
        
        return true; // Boss détruit
    }
    
    return false; // Boss endommagé mais pas détruit
}

// Fonction pour désactiver le boss
export function deactivateBoss() {
    bossActive = false;
    boss = null;
    bossHealth = 0;
    
    // CORRECTION: Notifier le module enemies que le boss n'est plus actif
    setBossActive(false);
    
    // Cacher la barre de vie
    const bossHealthBar = document.getElementById("bossHealthBar");
    if (bossHealthBar) {
        bossHealthBar.style.display = "none";
    }
    
    console.log('Boss principal désactivé');
}
