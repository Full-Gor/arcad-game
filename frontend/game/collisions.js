// collisions.js - Gestion des collisions

import { gameEntities, playerState } from './globals.js';
import { playSound, soundEffects } from './audio.js';
import { getActivePlayers, stunPlayer, playerDeath, activateShield } from './player.js';
import { removeEnemy, removeEnemyBullet } from './enemies.js';
import { createExplosion, createHitEffect, createCollectibleRedPoint } from './particles.js';
import { incrementEnemiesKilled, updateRedPoints } from './ui.js';

// Fonction principale de vérification des collisions
export function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Fonction pour vérifier les collisions entre joueurs et ennemis
export function checkPlayerEnemyCollisions() {
    const players = getActivePlayers();
    
    players.forEach(player => {
        if (!player.isActive || player.stunned) return;

        gameEntities.enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(player, enemy)) {
                if (player.shield) {
                    // Le joueur a un bouclier - détruire l'ennemi
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    removeEnemy(enemyIndex);
                    playSound(soundEffects.hit);
                } else {
                    // Le joueur n'a pas de bouclier - il perd une vie
                    player.lives--;
                    createExplosion(player.x + player.width/2, player.y + player.height/2, 15);
                    
                    if (player.lives <= 0) {
                        if (playerDeath(player)) {
                            // Tous les joueurs sont morts
                            return true;
                        }
                    } else {
                        // Étourdir le joueur temporairement
                        stunPlayer(player, 1000);
                    }
                    
                    playSound(soundEffects.hit);
                }
            }
        });
    });
    
    return false;
}

// Fonction pour vérifier les collisions entre balles des joueurs et ennemis
export function checkBulletEnemyCollisions() {
    const players = getActivePlayers();
    
    players.forEach(player => {
        if (!player.isActive) return;

        for (let bulletIndex = player.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
            const bullet = player.bullets[bulletIndex];
            
            for (let enemyIndex = gameEntities.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
                const enemy = gameEntities.enemies[enemyIndex];
                
                if (checkCollision(bullet, enemy)) {
                    // Supprimer la balle
                    player.bullets.splice(bulletIndex, 1);
                    
                    // Créer des effets visuels
                    createHitEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 8);
                    
                    // Ajouter des points rouges collectibles avec le pool
                    for (let i = 0; i < 3; i++) {
                        createCollectibleRedPoint(
                            enemy.x + Math.random() * enemy.width,
                            enemy.y + Math.random() * enemy.height
                        );
                    }
                    
                    // Supprimer l'ennemi
                    removeEnemy(enemyIndex);
                    
                    // Mettre à jour les statistiques
                    incrementEnemiesKilled(1);
                    
                    // Sons et effets
                    playSound(soundEffects.hit);
                    
                    break; // Sortir de la boucle des ennemis pour cette balle
                }
            }
        }
    });
}

// Fonction pour vérifier les collisions entre joueurs et balles ennemies
export function checkPlayerEnemyBulletCollisions() {
    const players = getActivePlayers();
    
    players.forEach(player => {
        if (!player.isActive) return;

        for (let bulletIndex = gameEntities.enemyBullets.length - 1; bulletIndex >= 0; bulletIndex--) {
            const bullet = gameEntities.enemyBullets[bulletIndex];
            
            if (checkCollision(player, bullet)) {
                // Supprimer la balle ennemie
                removeEnemyBullet(bulletIndex);
                
                if (player.shield) {
                    // Le bouclier absorbe le coup
                    createHitEffect(player.x + player.width/2, player.y + player.height/2, '#04fbac');
                    playSound(soundEffects.hit);
                } else {
                    // Le joueur prend des dégâts
                    player.lives--;
                    createExplosion(player.x + player.width/2, player.y + player.height/2, 10, ['red', 'orange']);
                    
                    if (player.lives <= 0) {
                        if (playerDeath(player)) {
                            // Tous les joueurs sont morts
                            return true;
                        }
                    } else {
                        // Étourdir le joueur temporairement
                        stunPlayer(player, 1500);
                    }
                    
                    playSound(soundEffects.hit);
                }
            }
        }
    });
    
    return false;
}

// Fonction pour vérifier les collisions entre joueurs et points rouges
export function checkPlayerRedPointCollisions() {
    const players = getActivePlayers();
    
    players.forEach(player => {
        if (!player.isActive) return;

        for (let pointIndex = gameEntities.redPoints.length - 1; pointIndex >= 0; pointIndex--) {
            const point = gameEntities.redPoints[pointIndex];
            
            // Ignorer les particules d'explosion
            if (point.isExplosion) continue;
            
            if (checkCollision(player, point)) {
                // Supprimer le point rouge
                gameEntities.redPoints.splice(pointIndex, 1);
                
                // Incrémenter le compteur du joueur
                player.redPointsCollected = (player.redPointsCollected || 0) + 1;
                playerState.redPointsTotal++;
                
                // Vérifier si le joueur a collecté 100 points rouges
                if (player.redPointsCollected >= 100) {
                    // Activer le bouclier comme prévu à l'origine
                    activateShield(player);
                    player.redPointsCollected = 0;
                    updateRedPoints(playerState.redPointsTotal);
                    console.log("Bouclier activé pour le joueur", player.player);
                }
                
                // Mettre à jour l'affichage
                updateRedPoints(playerState.redPointsTotal);
                
                playSound(soundEffects.coin);
            }
        }
    });
}

// Fonction pour vérifier les collisions joueur vs joueur (mode multijoueur)
export function checkPlayerVsPlayerCollisions() {
    const players = getActivePlayers();
    
    if (players.length < 2) return;

    for (let i = 0; i < players.length; i++) {
        const player1 = players[i];
        if (!player1.isActive || player1.stunned) continue;

        for (let j = i + 1; j < players.length; j++) {
            const player2 = players[j];
            if (!player2.isActive || player2.stunned) continue;

            // Vérifier collision entre les joueurs
            if (checkCollision(player1, player2)) {
                // Les deux joueurs sont étourdis
                stunPlayer(player1, 1000);
                stunPlayer(player2, 1000);
                playSound(soundEffects.hit);
            }

            // Vérifier collision entre balles du joueur 1 et joueur 2
            player1.bullets.forEach((bullet, bulletIndex) => {
                if (checkCollision(bullet, player2)) {
                    player1.bullets.splice(bulletIndex, 1);
                    if (!player2.shield) {
                        stunPlayer(player2);
                        playSound(soundEffects.hit);
                    }
                }
            });

            // Vérifier collision entre balles du joueur 2 et joueur 1
            player2.bullets.forEach((bullet, bulletIndex) => {
                if (checkCollision(bullet, player1)) {
                    player2.bullets.splice(bulletIndex, 1);
                    if (!player1.shield) {
                        stunPlayer(player1);
                        playSound(soundEffects.hit);
                    }
                }
            });
        }
    }
}

// Fonction principale pour vérifier toutes les collisions
export function checkAllCollisions() {
    // Vérifier les collisions dans l'ordre de priorité
    
    // 1. Collisions joueur vs ennemi
    if (checkPlayerEnemyCollisions()) {
        return true; // Game Over
    }
    
    // 2. Collisions balles joueur vs ennemis
    checkBulletEnemyCollisions();
    
    // 3. Collisions joueur vs balles ennemies
    if (checkPlayerEnemyBulletCollisions()) {
        return true; // Game Over
    }
    
    // 4. Collisions joueur vs points rouges
    checkPlayerRedPointCollisions();
    
    // 5. Collisions joueur vs joueur (mode multijoueur)
    checkPlayerVsPlayerCollisions();
    
    return false;
}

// Fonction pour vérifier les collisions avec les power-ups (sera appelée depuis le BonusManager)
export function checkPowerUpCollisions(powerUps, lives, players, handlePowerUp, handleLife) {
    players.forEach(player => {
        if (!player.isActive) return;

        // Vérifier collisions avec les power-ups
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            if (checkCollision(player, powerUp)) {
                handlePowerUp(powerUp.type);
                powerUps.splice(i, 1);
            }
        }

        // Vérifier collisions avec les vies
        for (let i = lives.length - 1; i >= 0; i--) {
            const life = lives[i];
            if (checkCollision(player, life)) {
                handleLife();
                lives.splice(i, 1);
            }
        }
    });
}

// Fonction utilitaire pour calculer la distance entre deux points
export function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

// Fonction pour vérifier une collision circulaire
export function checkCircularCollision(obj1, obj2, radius1, radius2) {
    const distance = getDistance(
        obj1.x + obj1.width/2, obj1.y + obj1.height/2,
        obj2.x + obj2.width/2, obj2.y + obj2.height/2
    );
    return distance < (radius1 + radius2);
}

// Fonction pour vérifier si un point est dans un rectangle
export function pointInRect(pointX, pointY, rect) {
    return pointX >= rect.x && 
           pointX <= rect.x + rect.width && 
           pointY >= rect.y && 
           pointY <= rect.y + rect.height;
}

// Fonction pour obtenir le rectangle de collision d'un objet
export function getCollisionRect(obj) {
    return {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height
    };
}

// (activateShield est importée depuis player.js)
