// boss.js - Logique des boss et mini-boss

import { canvas, ctx, bossState, miniBossState, gameEntities, stageState, playerState } from './globals.js';
import { playSound, soundEffects } from './audio.js';
import { checkCollision } from './collisions.js';
import { getActivePlayers } from './player.js';

// Images des boss
export let bossImg = null;
export let boss2Img = null;
export let boss3Img = null;
export let miniBossImg = null;

// Variables des boss
export let bossShootTimer = 0;
export let bossHitEffect = false;
export let bossHitEffectTimer = 0;

// Variables des mini-boss
export let miniBossHealth = 50;
export let miniBossShootTimer = 0;

// Fonction d'initialisation des images
export function initializeBossImages() {
    bossImg = new Image();
    bossImg.src = "/img/boss.jpg";
    
    boss2Img = new Image();
    boss2Img.src = "/img/boss2.jpg";
    
    boss3Img = new Image();
    boss3Img.src = "/img/boss3.png";
    
    miniBossImg = new Image();
    miniBossImg.src = "/img/miniBoss.jpg";
}

// Fonction pour créer le boss 1
export function createBoss() {
    if (bossState.active) return;
   
    bossState.active = true;
    bossState.health = 500;
   
    document.getElementById("bossHealthBar").style.display = "block";
    document.getElementById("bossHealthFill").style.width = "100%";
   
    bossState.boss = {
        x: canvas.width / 2 - 75,
        y: 50,
        width: 150,
        height: 150,
        vx: 1,
        vy: 1.5,
        rotation: 0,
        movePattern: 0,
        moveTimer: 0,
        lastMoveChange: Date.now()
    };
   
    playSound(soundEffects.bossAppear);
    gameEntities.enemies = [];
    ctx.globalAlpha = 0.7;
}

// Fonction pour créer le boss 2
export function createBoss2() {
    console.log("Création du boss 2");
    if (bossState.active) return;
   
    bossState.active = true;
    bossState.health = 1500;
   
    document.getElementById("bossHealthBar").style.display = "block";
    document.getElementById("bossHealthFill").style.width = "100%";
   
    bossState.boss = {
        x: canvas.width / 2 - 125,
        y: 50,
        width: 250,
        height: 250,
        vx: 0.5,
        vy: 0.5,
        movePattern: 0,
        moveTimer: 0,
        lastMoveChange: Date.now(),
        isBoss2: true
    };
   
    playSound(soundEffects.bossAppear);
    gameEntities.enemies = [];
    
    // Afficher un message pour le boss 2
    showBossMessage("BOSS FINAL !");
}

// Fonction pour créer le boss 3
export function createBoss3() {
    console.log("Création du boss 3");
    if (bossState.active) return;
   
    bossState.active = true;
    bossState.health = 2000;
   
    document.getElementById("bossHealthBar").style.display = "block";
    document.getElementById("bossHealthFill").style.width = "100%";
   
    bossState.boss = {
        x: canvas.width / 2 - 225,
        y: 100,
        width: 450,
        height: 450,
        vx: 0,
        vy: 0,
        isBoss3: true,
        shootCount: 0,
        lastShootTime: Date.now(),
        shootSide: 0
    };
   
    playSound(soundEffects.bossAppear);
    gameEntities.enemies = [];
   
    showBossMessage("BOSS FINAL 3: ANNIHILATEUR");
}

// Fonction utilitaire pour afficher les messages de boss
function showBossMessage(message) {
    const stageTitle = document.getElementById("stageTitle");
    stageTitle.textContent = message;
    stageTitle.style.display = "block";
    stageTitle.style.opacity = "0";
   
    // Animation de fade-in
    setTimeout(() => {
        stageTitle.style.opacity = "1";
       
        // Animation de fade-out après 2 secondes
        setTimeout(() => {
            stageTitle.style.opacity = "0";
           
            // Masquer l'élément après la transition
            setTimeout(() => {
                stageTitle.style.display = "none";
            }, 2000);
        }, 2000);
    }, 100);
}

// Fonction pour mettre à jour le boss
export function updateBoss() {
    if (!bossState.active || !bossState.boss) return;
   
    const boss = bossState.boss;
    
    // Rotation continue pour le boss 1
    if (!boss.isBoss2 && !boss.isBoss3) {
        boss.rotation += 2;
        if (boss.rotation >= 360) boss.rotation = 0;
    }
   
    // Mouvement dynamique
    const currentTime = Date.now();
    if (currentTime - boss.lastMoveChange > 3000) {
        boss.movePattern = Math.floor(Math.random() * 4);
        boss.lastMoveChange = currentTime;
    }
   
    // Patterns de mouvement selon le type de boss
    if (boss.isBoss3) {
        // Boss 3 ne bouge pas
        return;
    }
    
    switch(boss.movePattern) {
        case 0: // Mouvement circulaire
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
   
    // Tirs plus fréquents
    bossShootTimer++;
    if (bossShootTimer >= 30) {
        shootBossBullets();
        bossShootTimer = 0;
    }
}

// Fonction pour dessiner le boss
export function drawBoss() {
    if (!bossState.active || !bossState.boss) return;
   
    const boss = bossState.boss;
    ctx.save();
   
    // Opacité normale
    ctx.globalAlpha = 1;
    
    // Centrer le boss
    ctx.translate(boss.x + boss.width/2, boss.y + boss.height/2);
    
    // Dessiner le boss selon son type
    if (boss.isBoss3) {
        // Boss 3 - pas de rotation
        if (boss3Img && boss3Img.complete) {
            ctx.drawImage(boss3Img, -boss.width/2, -boss.height/2, boss.width, boss.height);
        } else {
            // Image de secours
            ctx.fillStyle = "blue";
            ctx.fillRect(-boss.width/2, -boss.height/2, boss.width, boss.height);
        }
    } else if (boss.isBoss2) {
        // Boss 2
        if (boss2Img && boss2Img.complete) {
            ctx.drawImage(boss2Img, -boss.width/2, -boss.height/2, boss.width, boss.height);
        } else {
            ctx.fillStyle = "purple";
            ctx.fillRect(-boss.width/2, -boss.height/2, boss.width, boss.height);
        }
    } else {
        // Boss 1
        ctx.rotate(boss.rotation * Math.PI / 180);
        if (bossImg && bossImg.complete) {
            ctx.drawImage(bossImg, -boss.width/2, -boss.height/2, boss.width, boss.height);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(-boss.width/2, -boss.height/2, boss.width, boss.height);
        }
    }
   
    ctx.restore();
    ctx.globalAlpha = 1.0;
}

// Fonction pour tirer les balles du boss
export function shootBossBullets() {
    if (!bossState.active || !bossState.boss) return;
   
    const boss = bossState.boss;
    const isBoss2 = boss.isBoss2 || false;
    const bulletSpeed = isBoss2 ? 1.5 : 1;
   
    // Tirer dans 16 directions
    for (let i = 0; i < 16; i++) {
        const angle = (i * 22.5) * Math.PI / 180;
        const speed = bulletSpeed;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
       
        gameEntities.enemyBullets.push({
            x: boss.x + boss.width/2,
            y: boss.y + boss.height/2,
            width: 8,
            height: 8,
            speed: 0,
            vx: vx,
            vy: vy,
            type: isBoss2 ? 0 : 2
        });
    }
   
    // Ajouter des tirs verticaux supplémentaires
    gameEntities.enemyBullets.push({
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        width: 8,
        height: 8,
        speed: 5 * (isBoss2 ? 1.5 : 1),
        vx: 0,
        vy: 5 * (isBoss2 ? 1.5 : 1),
        type: isBoss2 ? 0 : 2
    });
   
    gameEntities.enemyBullets.push({
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        width: 8,
        height: 8,
        speed: 0,
        vx: 0,
        vy: -5 * (isBoss2 ? 1.5 : 1),
        type: isBoss2 ? 0 : 2
    });
   
    playSound(soundEffects.shoot);
}

// Fonction pour vérifier les collisions avec le boss
export function checkBossCollisions() {
    if (!bossState.active || !bossState.boss) return;
   
    const boss = bossState.boss;
    const players = getActivePlayers();
    
    players.forEach(player => {
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            const bullet = player.bullets[i];
           
            // Rectangle de collision ajusté selon le type de boss
            const bossRect = {
                x: boss.isBoss3 ? boss.x : (boss.isBoss2 ? boss.x - boss.width/2 : boss.x),
                y: boss.isBoss3 ? boss.y : (boss.isBoss2 ? boss.y - boss.height/2 : boss.y),
                width: boss.isBoss3 ? boss.width : (boss.isBoss2 ? boss.width * 2 : boss.width),
                height: boss.isBoss3 ? boss.height : (boss.isBoss2 ? boss.height * 2 : boss.height)
            };
           
            if (checkCollision(bullet, bossRect)) {
                // Supprimer la balle
                player.bullets.splice(i, 1);
               
                // Effet de hit
                bossHitEffect = true;
                bossHitEffectTimer = 0;
               
                // Diminuer la vie du boss
                bossState.health--;
               
                // Mettre à jour la barre de vie
                const maxHealth = boss.isBoss3 ? 2000 : (boss.isBoss2 ? 1500 : 500);
                document.getElementById("bossHealthFill").style.width = (bossState.health / maxHealth * 100) + "%";
               
                playSound(soundEffects.bossHit);
               
                // Vérifier si le boss est détruit
                if (bossState.health <= 0) {
                    if (boss.isBoss3) {
                        defeatBoss3();
                    } else if (boss.isBoss2) {
                        defeatBoss2();
                    } else {
                        defeatBoss();
                    }
                }
            }
        }
    });
}

// Fonction de défaite du boss 1
export function defeatBoss() {
    console.log("Défaite du boss 1");
    
    playSound(soundEffects.bossDeath);
    
    // Créer un effet d'explosion
    for (let i = 0; i < 100; i++) {
        gameEntities.redPoints.push({
            x: bossState.boss.x + Math.random() * bossState.boss.width,
            y: bossState.boss.y + Math.random() * bossState.boss.height,
            isExplosion: true,
            vx: (Math.random() * 2 - 1) * 3,
            vy: (Math.random() * 2 - 1) * 3,
            life: 30 + Math.floor(Math.random() * 20),
            color: ["red", "orange", "yellow", "white"][Math.floor(Math.random() * 4)]
        });
    }
   
    // Désactiver le boss
    bossState.active = false;
    bossState.boss = null;
   
    // Cacher la barre de vie
    document.getElementById("bossHealthBar").style.display = "none";
   
    // Réinitialiser l'opacité
    ctx.globalAlpha = 1.0;
   
    // Bonus de points
    playerState.enemiesKilled += 5;
    document.getElementById("enemiesKilledCount").innerText = playerState.enemiesKilled;
    
    // Démarrer le stage 2
    startStage2();
}

// Fonction de défaite du boss 2
export function defeatBoss2() {
    console.log("Création du stage 3 après défaite du boss 2");
   
    playSound(soundEffects.bossDeath);
    
    // Créer un effet d'explosion
    for (let i = 0; i < 150; i++) {
        gameEntities.redPoints.push({
            x: bossState.boss.x + Math.random() * bossState.boss.width,
            y: bossState.boss.y + Math.random() * bossState.boss.height,
            isExplosion: true,
            vx: (Math.random() * 2 - 1) * 4,
            vy: (Math.random() * 2 - 1) * 4,
            life: 30 + Math.floor(Math.random() * 30),
            color: ["red", "orange", "yellow", "white"][Math.floor(Math.random() * 4)]
        });
    }
   
    // Désactiver le boss
    bossState.active = false;
    bossState.boss = null;
   
    // Cacher la barre de vie
    document.getElementById("bossHealthBar").style.display = "none";
   
    // Réinitialiser l'opacité
    ctx.globalAlpha = 1.0;
   
    // Donner un bonus de points
    playerState.enemiesKilled += 10;
    document.getElementById("enemiesKilledCount").innerText = playerState.enemiesKilled;
   
    // Démarrer le stage 3
    startStage3();
}

// Fonction de défaite du boss 3
export function defeatBoss3() {
    console.log("Défaite du boss 3");
    
    playSound(soundEffects.bossDeath);
    
    // Explosion massive
    for (let i = 0; i < 300; i++) {
        gameEntities.redPoints.push({
            x: bossState.boss.x + Math.random() * bossState.boss.width,
            y: bossState.boss.y + Math.random() * bossState.boss.height,
            isExplosion: true,
            vx: (Math.random() * 2 - 1) * 5,
            vy: (Math.random() * 2 - 1) * 5,
            life: 40 + Math.floor(Math.random() * 40),
            color: ["red", "orange", "yellow", "white", "blue"][Math.floor(Math.random() * 5)]
        });
    }
   
    // Désactiver le boss
    bossState.active = false;
    bossState.boss = null;
   
    // Cacher la barre de vie
    document.getElementById("bossHealthBar").style.display = "none";
   
    // Réinitialiser l'opacité
    ctx.globalAlpha = 1.0;
   
    // Bonus de points final
    playerState.enemiesKilled += 20;
    document.getElementById("enemiesKilledCount").innerText = playerState.enemiesKilled;
   
    // Fin du jeu - victoire
    showVictoryMessage();
}

// Fonction pour afficher le message de victoire
function showVictoryMessage() {
    const stageTitle = document.getElementById("stageTitle");
    stageTitle.textContent = "VICTOIRE ! FÉLICITATIONS !";
    stageTitle.style.display = "block";
    stageTitle.style.opacity = "1";
    stageTitle.style.color = "#00ff00";
}

// Fonctions pour démarrer les stages (à implémenter dans le module principal)
function startStage2() {
    // Cette fonction sera implémentée dans le module principal
    console.log("Démarrage du stage 2");
    stageState.isStage2 = true;
}

function startStage3() {
    // Cette fonction sera implémentée dans le module principal
    console.log("Démarrage du stage 3");
    stageState.isStage3 = true;
    stageState.isStage2 = false;
}

// Fonction pour vérifier si un boss doit apparaître
export function checkBossSpawn() {
    if (bossState.active || miniBossState.active) return;
    
    // Boss 1 - après 25 ennemis tués
    if (playerState.enemiesKilled >= 25 && playerState.enemiesKilled % 25 === 0 && !stageState.isStage2 && !stageState.isStage3) {
        createBoss();
    }
    // Boss 2 - stage 2, après 40 ennemis tués
    else if (stageState.isStage2 && stageState.stage2EnemiesKilled >= 40 && stageState.stage2EnemiesKilled % 40 === 0) {
        createBoss2();
    }
    // Boss 3 - stage 3, après 60 ennemis tués
    else if (stageState.isStage3 && stageState.stage3EnemiesKilled >= 60 && stageState.stage3EnemiesKilled % 60 === 0) {
        createBoss3();
    }
}

// Initialisation
initializeBossImages();
