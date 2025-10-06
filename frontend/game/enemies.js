// enemies.js - Gestion des ennemis et leurs balles

import { canvas, ctx, CONFIG, stageState, waveState, gameEntities } from './globals.js';
import { playSound, soundEffects } from './audio.js';

// Images des ennemis
export let enemyImgs = [];
export let enemyBulletImgs = [];

// Fonction d'initialisation des images
export function initializeEnemyImages() {
    enemyImgs = Array(15).fill().map(() => new Image()); // 15 types d'ennemis (enemy1.jpg à enemy15.jpg)
    enemyBulletImgs = Array(3).fill().map(() => new Image());

    // Chargement des images d'ennemis (enemy1.jpg à enemy15.jpg)
    enemyImgs.forEach((img, i) => {
        img.src = `/img/enemy${i + 1}.jpg`;
    });

    // Chargement des images de balles ennemies
    enemyBulletImgs.forEach((img, i) => img.src = `/img/bullets${i + 2}.jpg`);
}

// Fonction pour générer des vagues d'ennemis
export function generateWaveEnemies() {
    if (!canvas) return;
    
    // Si aucune vague n'est en cours, commencer une nouvelle vague
    if (!waveState.waveInProgress && gameEntities.enemies.length === 0) {
        startNewWave();
    }
    
    // Si une vague est en cours et qu'il reste des ennemis à générer
    if (waveState.waveInProgress && 
        waveState.enemiesSpawnedInWave < waveState.enemiesPerWave && 
        gameEntities.enemies.length < 10) {
        
        // Générer un ennemi du type actuel
        gameEntities.enemies.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height / 3),
            width: 60,
            height: 60,
            vx: (Math.random() * 2 - 1) * 2 * CONFIG.ENEMY_SPEED_MULTIPLIER,
            vy: Math.random() * 1.5 * CONFIG.ENEMY_SPEED_MULTIPLIER,
            type: waveState.currentEnemyType
        });
        
        waveState.enemiesSpawnedInWave++;
        
        // Si tous les ennemis de la vague sont générés, marquer la vague comme en cours
        if (waveState.enemiesSpawnedInWave >= waveState.enemiesPerWave) {
            waveState.waveInProgress = true;
        }
    }
}

// Fonction pour commencer une nouvelle vague
export function startNewWave() {
    waveState.waveInProgress = true;
    waveState.enemiesSpawnedInWave = 0;
    waveState.waveComplete = false;
    
    console.log(`Début de la vague ${waveState.currentWave} - Type d'ennemi: ${waveState.currentEnemyType + 1}`);
}

// Fonction pour passer à la vague suivante
export function nextWave() {
    waveState.currentWave++;
    waveState.currentEnemyType = (waveState.currentEnemyType + 1) % waveState.totalWaves;
    waveState.waveInProgress = false;
    waveState.waveComplete = true;
    
    console.log(`Vague ${waveState.currentWave - 1} terminée. Prochaine vague: ${waveState.currentWave} - Type d'ennemi: ${waveState.currentEnemyType + 1}`);
    
    // Attendre un peu avant de commencer la prochaine vague
    setTimeout(() => {
        if (gameEntities.enemies.length === 0) {
            startNewWave();
        }
    }, 2000);
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

// Fonction pour tirer les balles ennemies selon le type d'ennemi
export function shootEnemyBullets() {
    const maxNewBullets = 10;
    let newBullets = 0;

    for (let i = 0; i < gameEntities.enemies.length && newBullets < maxNewBullets; i++) {
        const enemy = gameEntities.enemies[i];

        if (Math.random() > 0.2) continue;

        // Tirs différents selon le type d'ennemi (0-14 pour enemy1.jpg à enemy15.jpg)
        switch (enemy.type) {
            case 0: // enemy1.jpg - Tir simple
                gameEntities.enemyBullets.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height,
                    width: 8,
                    height: 8,
                    speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                    type: 0,
                    color: "cyan"
                });
                break;

            case 1: // enemy2.jpg - Tir double
                gameEntities.enemyBullets.push(
                    {
                        x: enemy.x + enemy.width / 2 - 10,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 1,
                        color: "magenta"
                    },
                    {
                        x: enemy.x + enemy.width / 2 + 10,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 1,
                        color: "magenta"
                    }
                );
                break;

            case 2: // enemy3.jpg - Tir triple
                gameEntities.enemyBullets.push(
                    {
                        x: enemy.x + enemy.width / 2 - 15,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 2,
                        color: "gold"
                    },
                    {
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 2,
                        color: "gold"
                    },
                    {
                        x: enemy.x + enemy.width / 2 + 15,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 2,
                        color: "gold"
                    }
                );
                break;

            case 3: // enemy4.jpg - Tir en éventail
                for (let angle = -Math.PI/4; angle <= Math.PI/4; angle += Math.PI/8) {
                    gameEntities.enemyBullets.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: Math.sin(angle) * 2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: Math.cos(angle) * 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 0,
                        color: "orange"
                    });
                }
                break;

            case 4: // enemy5.jpg - Tir en spirale
                const spiralAngle = (Date.now() / 100) % (Math.PI * 2);
                for (let i = 0; i < 3; i++) {
                    const angle = spiralAngle + (i * Math.PI * 2 / 3);
                    gameEntities.enemyBullets.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: Math.sin(angle) * 2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: Math.cos(angle) * 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 1,
                        color: "purple"
                    });
                }
                break;

            case 5: // enemy6.jpg - Tir horizontal double
                gameEntities.enemyBullets.push(
                    {
                        x: enemy.x - 15,
                        y: enemy.y + enemy.height / 2,
                        width: 15,
                        height: 8,
                        vx: -3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: 0,
                        type: 2,
                        color: "red"
                    },
                    {
                        x: enemy.x + enemy.width,
                        y: enemy.y + enemy.height / 2,
                        width: 15,
                        height: 8,
                        vx: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: 0,
                        type: 2,
                        color: "red"
                    }
                );
                break;

            case 6: // enemy7.jpg - Tir laser vertical
                gameEntities.enemyBullets.push({
                    x: enemy.x + enemy.width / 2 - 2,
                    y: enemy.y + enemy.height,
                    width: 4,
                    height: 30,
                    speed: 4 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                    type: 0,
                    color: "yellow",
                    isLaser: true
                });
                break;

            case 7: // enemy8.jpg - Tir en croix
                gameEntities.enemyBullets.push(
                    {
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 0,
                        color: "cyan"
                    },
                    {
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: -2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: 0,
                        type: 1,
                        color: "cyan"
                    },
                    {
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: 2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: 0,
                        type: 1,
                        color: "cyan"
                    }
                );
                break;

            case 8: // enemy9.jpg - Tir en cercle
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    gameEntities.enemyBullets.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: Math.sin(angle) * 2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: Math.cos(angle) * 2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 0,
                        color: "lime"
                    });
                }
                break;

            case 9: // enemy10.jpg - Tir en vague
                const waveOffset = Math.sin(Date.now() / 200) * 20;
                gameEntities.enemyBullets.push({
                    x: enemy.x + enemy.width / 2 + waveOffset,
                    y: enemy.y + enemy.height,
                    width: 8,
                    height: 8,
                    speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                    type: 1,
                    color: "pink"
                });
                break;

            case 10: // enemy11.jpg - Tir en barrage
                for (let i = 0; i < 5; i++) {
                    gameEntities.enemyBullets.push({
                        x: enemy.x + (i * enemy.width / 4),
                        y: enemy.y + enemy.height,
                        width: 6,
                        height: 6,
                        speed: 2.5 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 2,
                        color: "white"
                    });
                }
                break;

            case 11: // enemy12.jpg - Tir diagonal
                gameEntities.enemyBullets.push(
                    {
                        x: enemy.x + enemy.width / 2 - 10,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: -1 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 0,
                        color: "aqua"
                    },
                    {
                        x: enemy.x + enemy.width / 2 + 10,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: 1 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 0,
                        color: "aqua"
                    }
                );
                break;

            case 12: // enemy13.jpg - Tir en étoile
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    gameEntities.enemyBullets.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: Math.sin(angle) * 2.5 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: Math.cos(angle) * 2.5 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 1,
                        color: "yellow"
                    });
                }
                break;

            case 13: // enemy14.jpg - Tir en ligne
                for (let i = 0; i < 3; i++) {
                    gameEntities.enemyBullets.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height + (i * 15),
                        width: 8,
                        height: 8,
                        speed: 3 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 2,
                        color: "silver"
                    });
                }
                break;

            case 14: // enemy15.jpg - Tir spécial final
                gameEntities.enemyBullets.push(
                    {
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 12,
                        height: 12,
                        speed: 4 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 0,
                        color: "red",
                        isSpecial: true
                    },
                    {
                        x: enemy.x + enemy.width / 2 - 20,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: -2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: 2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 1,
                        color: "red"
                    },
                    {
                        x: enemy.x + enemy.width / 2 + 20,
                        y: enemy.y + enemy.height,
                        width: 8,
                        height: 8,
                        vx: 2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        vy: 2 * CONFIG.ENEMY_BULLET_SPEED_MULTIPLIER,
                        type: 1,
                        color: "red"
                    }
                );
                break;
        }

        newBullets++;
        playSound(soundEffects.shoot);
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
                let bulletColor = bullet.color || "white";
                
                // Effet spécial pour les lasers
                if (bullet.isLaser) {
                    ctx.save();
                    ctx.fillStyle = bulletColor;
                    ctx.shadowColor = bulletColor;
                    ctx.shadowBlur = 15;
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    ctx.restore();
                } else if (bullet.isSpecial) {
                    // Effet spécial pour les balles spéciales
                    ctx.save();
                    ctx.fillStyle = bulletColor;
                    ctx.shadowColor = bulletColor;
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
                    ctx.restore();
                } else {
                    // Dessiner une boule colorée normale
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
        generateWaveEnemies();
    }
    
    // Vérifier si la vague actuelle est terminée
    if (waveState.waveInProgress && gameEntities.enemies.length === 0) {
        nextWave();
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
