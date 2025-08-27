// enemies.js - Gestion des ennemis et leurs balles

import { canvas, ctx, CONFIG, stageState, gameEntities } from './globals.js';
import { playSound, soundEffects } from './audio.js';

// Images des ennemis
export let enemyImgs = [];
export let enemyBulletImgs = [];

// Fonction d'initialisation des images
export function initializeEnemyImages() {
    enemyImgs = Array(18).fill().map(() => new Image()); // 18 types d'ennemis
    enemyBulletImgs = Array(3).fill().map(() => new Image());

    // Chargement des images d'ennemis
    enemyImgs.forEach((img, i) => {
        if (i < 6) {
            img.src = `/img/enemy${i ? i + 1 : ""}.jpg`;
        } else {
            img.src = `/img/enemy${i + 1}.jpg`;
        }
    });

    // Chargement des images de balles ennemies
    enemyBulletImgs.forEach((img, i) => img.src = `/img/bullets${i + 2}.jpg`);
}

// Fonction pour générer des ennemis normaux
export function generateEnemies() {
    if (!canvas || gameEntities.enemies.length > 30) return;

    const count = Math.min(7, 30 - gameEntities.enemies.length);

    for (let i = 0; i < count; i++) {
        gameEntities.enemies.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height / 3),
            width: 60,
            height: 60,
            vx: (Math.random() * 2 - 1) * 2 * CONFIG.ENEMY_SPEED_MULTIPLIER,
            vy: Math.random() * 1.5 * CONFIG.ENEMY_SPEED_MULTIPLIER,
            type: Math.floor(Math.random() * 6)
        });
    }
}

// Fonction pour générer des ennemis du stage 3
export function generateStage3Enemies() {
    if (!stageState.isStage3) return;
    
    // Vérifier si nous devons passer au prochain type d'ennemi
    if (stageState.stage3EnemiesSpawned >= 5) {
        stageState.stage3CurrentEnemyType++;
        stageState.stage3EnemiesSpawned = 0;
        
        // Revenir au premier type si on a parcouru tous les types
        if (stageState.stage3CurrentEnemyType >= stageState.stage3EnemyTypes.length) {
            stageState.stage3CurrentEnemyType = 0;
        }
    }
    
    // Générer des ennemis du type actuel (tous les mêmes pour chaque vague)
    if (stageState.stage3EnemiesSpawned < 5 && gameEntities.enemies.length < 30) {
        const enemyType = stageState.stage3EnemyTypes[stageState.stage3CurrentEnemyType] - 10; // Ajuster l'index
        
        // Générer 5 ennemis à la fois
        for (let i = 0; i < 5; i++) {
            gameEntities.enemies.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height / 3),
                width: 60,
                height: 60,
                vx: (Math.random() * 2 - 1) * 3 * CONFIG.ENEMY_SPEED_MULTIPLIER, // Plus rapide
                vy: Math.random() * 2 * CONFIG.ENEMY_SPEED_MULTIPLIER,
                type: enemyType
            });
        }
        
        stageState.stage3EnemiesSpawned += 5;
    }
}

// Fonction pour dessiner les ennemis
export function drawEnemies() {
    gameEntities.enemies = gameEntities.enemies.filter(enemy => {
        try {
            if (enemyImgs[enemy.type] && enemyImgs[enemy.type].complete) {
                ctx.drawImage(enemyImgs[enemy.type], enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                // Fallback si l'image n'est pas chargée
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }

            // Mise à jour de la position
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;

            // Rebond sur les bords
            if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                enemy.vx *= -1;
            }
            if (enemy.y <= 0) {
                enemy.vy *= -1;
            }

            return enemy.y < canvas.height;
        } catch (error) {
            console.error("Erreur lors du dessin d'un ennemi:", error);
            return false;
        }
    });
}

// Fonction pour tirer les balles ennemies
export function shootEnemyBullets() {
    const maxNewBullets = 10;
    let newBullets = 0;

    for (let i = 0; i < gameEntities.enemies.length && newBullets < maxNewBullets; i++) {
        const enemy = gameEntities.enemies[i];

        if (Math.random() > 0.2) continue;

        // Cas spécial pour enemy8 - tire une boule de chaque côté
        if (enemy.type === 7) { // enemy8 (index commence à 0)
            // Boule gauche
            gameEntities.enemyBullets.push({
                x: enemy.x - 15,
                y: enemy.y + enemy.height/2 - 7.5,
                width: 15,
                height: 15,
                speed: 0,
                vx: -2,
                vy: 0,
                isSpecialEnemyBullet: true,
                enemyType: 8,
                color: "cyan",
                isMiniBossBullet: true,
                isRedBall: true,
                type: 0
            });
 
            // Boule droite
            gameEntities.enemyBullets.push({
                x: enemy.x + enemy.width,
                y: enemy.y + enemy.height/2 - 7.5,
                width: 15,
                height: 15,
                speed: 0,
                vx: -2,
                vy: 0,
                isSpecialEnemyBullet: true,
                enemyType: 8,
                color: "cyan",
                isMiniBossBullet: true,
                isRedBall: true,
                type: 0
            });
            
            playSound(soundEffects.shoot);
        }
        // Cas spécial pour enemy12 - tir horizontal
        else if (enemy.type === 11) { // enemy12 (index commence à 0)
            // Tir vers la gauche
            gameEntities.enemyBullets.push({
                x: enemy.x,
                y: enemy.y + enemy.height / 2,
                width: 15,
                height: 15,
                speed: 0,
                vx: -3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                vy: 0,
                isSpecialEnemyBullet: true,
                enemyType: 12,
                type: 2
            });
            
            // Tir vers la droite
            gameEntities.enemyBullets.push({
                x: enemy.x + enemy.width,
                y: enemy.y + enemy.height / 2,
                width: 15,
                height: 15,
                speed: 0,
                vx: -3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                vy: 0,
                isSpecialEnemyBullet: true,
                enemyType: 12,
                type: 2
            });
        } 
        // Traitement normal pour les autres types d'ennemis
        else {
            gameEntities.enemyBullets.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height,
                width: 8,
                height: 8,
                speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                type: Math.floor(Math.random() * 3)
            });
        }

        newBullets++;
    }
}

// Fonction pour dessiner les balles ennemies
export function drawEnemyBullets() {
    gameEntities.enemyBullets = gameEntities.enemyBullets.filter(bullet => {
        try {
            if (bullet.isMiniBossBullet) {
                // Sauvegarde le contexte
                ctx.save();
                
                if (bullet.isRedBall) {
                    // Dessiner une boule avec la taille spécifiée
                    ctx.fillStyle = bullet.color || "red";
                    ctx.shadowColor = bullet.color || "red";
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(
                        bullet.x + bullet.width/2, 
                        bullet.y + bullet.height/2, 
                        bullet.width/2,
                        0, 
                        Math.PI * 2
                    );
                    ctx.fill();
                } else {
                    // Dessiner les lasers du mini-boss
                    ctx.fillStyle = bullet.color || "red";
                    ctx.shadowColor = bullet.color || "red";
                    ctx.shadowBlur = 10;
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                }
                
                ctx.restore();
            } else {
                // Pour les balles ennemies normales
                let bulletColor;
                if (bullet.type === 0) bulletColor = "cyan"; 
                else if (bullet.type === 1) bulletColor = "magenta";
                else if (bullet.type === 2) bulletColor = "gold";
                else bulletColor = "white";
                
                // Dessiner une boule colorée
                ctx.save();
                ctx.fillStyle = bulletColor;
                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(
                    bullet.x + bullet.width/2, 
                    bullet.y + bullet.height/2, 
                    bullet.width/2,
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
                ctx.restore();
            }
            
            // Mettre à jour la position
            if (bullet.vx !== undefined) {
                bullet.x += bullet.vx;
            }
           
            if (bullet.vy !== undefined) {
                bullet.y += bullet.vy;
            } else if (bullet.speed) {
                bullet.y += bullet.speed;
            }

            return bullet.y < canvas.height && bullet.y > 0 && bullet.x > 0 && bullet.x < canvas.width;
        } catch (error) {
            console.error("Erreur lors du dessin d'une balle ennemie:", error);
            return false;
        }
    });
}

// Fonction pour mettre à jour les ennemis
export function updateEnemies() {
    // Génération des ennemis selon le stage
    if (stageState.isStage3) {
        generateStage3Enemies();
    } else {
        generateEnemies();
    }
}

// Fonction pour supprimer un ennemi
export function removeEnemy(index) {
    if (index >= 0 && index < gameEntities.enemies.length) {
        gameEntities.enemies.splice(index, 1);
        return true;
    }
    return false;
}

// Fonction pour supprimer une balle ennemie
export function removeEnemyBullet(index) {
    if (index >= 0 && index < gameEntities.enemyBullets.length) {
        gameEntities.enemyBullets.splice(index, 1);
        return true;
    }
    return false;
}

// Fonction pour obtenir les ennemis
export function getEnemies() {
    return gameEntities.enemies;
}

// Fonction pour obtenir les balles ennemies
export function getEnemyBullets() {
    return gameEntities.enemyBullets;
}

// Fonction pour vider tous les ennemis
export function clearAllEnemies() {
    gameEntities.enemies = [];
    gameEntities.enemyBullets = [];
}

// Fonction pour compter les ennemis par type
export function countEnemiesByType(type) {
    return gameEntities.enemies.filter(enemy => enemy.type === type).length;
}

// Initialisation
initializeEnemyImages();
