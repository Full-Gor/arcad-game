// player.js - Logique des vaisseaux joueurs

import { canvas, ctx, multiplayerConfig } from './globals.js';
import { playSound, soundEffects } from './audio.js';

// Configuration des vaisseaux
const SHIP_IMAGES = {
    'Intercepteur': 'starship6.jpg',
    'Croiseur': 'starship1.jpg',
    'Destroyer': 'starship2.jpg',
    'Chasseur': 'starship3.jpg',
    'Éclaireur': 'starship4.jpg',
    'Bombardier': 'starship5.jpg',
    'aéronef': 'starship7.jpg'
};

// Variables des vaisseaux
export let starship = null;
export let starship2 = null;
export let starship3 = null;

// Images des vaisseaux
export let starshipImg = null;
export let starship2Img = null;
export let starship3Img = null;
export let bulletImg = null;

// Fonction pour obtenir le vaisseau sélectionné
export function getSelectedShip() {
    const key = multiplayerConfig.isMultiplayer ? 'vaisseauChoisiP1' : 'vaisseauChoisi';
    const vaisseauChoisi = localStorage.getItem(key);

    if (vaisseauChoisi && SHIP_IMAGES[vaisseauChoisi]) {
        return `/img/${SHIP_IMAGES[vaisseauChoisi]}`;
    }

    return "/img/starship7.jpg";
}

export function getSelectedShipP2() {
    const vaisseauChoisi = localStorage.getItem('vaisseauChoisiP2');

    if (vaisseauChoisi && SHIP_IMAGES[vaisseauChoisi]) {
        return `/img/${SHIP_IMAGES[vaisseauChoisi]}`;
    }

    return "/img/starship6.jpg";
}

export function getSelectedShipP3() {
    const vaisseauChoisi = localStorage.getItem('vaisseauChoisiP3');

    if (vaisseauChoisi && SHIP_IMAGES[vaisseauChoisi]) {
        return `/img/${SHIP_IMAGES[vaisseauChoisi]}`;
    }

    return "/img/starship5.jpg";
}

// Fonction pour créer un vaisseau
function createStarship(x, y, player) {
    return {
        x: x,
        y: y,
        width: 50,
        height: 50,
        bullets: [],
        powerUpLevel: 0,
        player: player,
        powerUpTimeoutId: null,
        lives: 3,
        isActive: true,
        stunned: false,
        stunnedTimeout: null,
        redPointsCollected: 0,
        shield: false,
        shieldTimeout: null
    };
}

// Initialisation des vaisseaux
export function initializePlayers() {
    if (!canvas) return;

    starship = createStarship(canvas.width / 2, canvas.height - 50, 1);
    
    if (multiplayerConfig.isMultiplayer) {
        starship2 = createStarship(canvas.width / 2 + 100, canvas.height - 50, 2);
    }
    
    if (multiplayerConfig.isTriplePlayer) {
        starship3 = createStarship(canvas.width / 2 - 100, canvas.height - 50, 3);
    }

    // Initialisation des images
    starshipImg = new Image();
    starshipImg.src = getSelectedShip();

    if (multiplayerConfig.isMultiplayer) {
        starship2Img = new Image();
        starship2Img.src = getSelectedShipP2();
    }

    if (multiplayerConfig.isTriplePlayer) {
        starship3Img = new Image();
        starship3Img.src = getSelectedShipP3();
    }

    bulletImg = new Image();
    bulletImg.src = "/img/bullets1.jpg";
}

// Fonction pour étourdir un joueur
export function stunPlayer(player, duration = 2000) {
    if (!player || !player.isActive) return;
   
    player.stunned = true;
   
    document.querySelectorAll("#stun-effect-player" + player.player).forEach(e => e.remove());

    // Créer l'effet visuel d'étourdissement
    const stunEffect = document.createElement('div');
    stunEffect.id = "stun-effect-player" + player.player;
    stunEffect.style.cssText = `
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,0,0.8) 0%, rgba(255,255,0,0) 70%);
        border: 3px solid yellow;
        animation: stunPulse 0.5s infinite alternate;
        pointer-events: none;
        z-index: 1000;
        left: ${player.x - 5}px;
        top: ${player.y - 5}px;
        transform: translate(-50%, -50%);
    `;

    document.body.appendChild(stunEffect);

    // Supprimer l'effet après la durée
    if (player.stunnedTimeout) {
        clearTimeout(player.stunnedTimeout);
    }

    player.stunnedTimeout = setTimeout(() => {
        player.stunned = false;
        stunEffect.remove();
    }, duration);
}

// Fonction pour activer le bouclier
export function activateShield(player, duration = 10000) {
    if (!player || !player.isActive) return;
    
    player.shield = true;
    
    // Supprimer le timeout précédent s'il existe
    if (player.shieldTimeout) {
        clearTimeout(player.shieldTimeout);
    }

    // Programmer la désactivation du bouclier
    player.shieldTimeout = setTimeout(() => {
        player.shield = false;
        player.shieldTimeout = null;
    }, duration);
}

// Fonction de mort du joueur
export function playerDeath(player) {
    player.isActive = false;

    let allPlayersDead = !starship.isActive;
    if (multiplayerConfig.isMultiplayer) allPlayersDead = allPlayersDead && !starship2.isActive;
    if (multiplayerConfig.isTriplePlayer) allPlayersDead = allPlayersDead && !starship3.isActive;

    if (allPlayersDead) {
        // Game Over - sera géré par le gameLoop
        return true;
    }

    return false;
}

// Fonction pour dessiner les vaisseaux
export function drawStarship() {
    const drawPlayer = (player, img) => {
        if (!player || !player.isActive) return;

        if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();

            // Effet de bouclier
            if (player.shield) {
                ctx.shadowColor = '#04fbac';
                ctx.shadowBlur = 20;
            }

            // Effet d'étourdissement (clignotement)
            if (player.stunned) {
                ctx.globalAlpha = Math.sin(Date.now() / 100) * 0.5 + 0.5;
            }

            ctx.drawImage(img, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);

            ctx.restore();
        }
    };

    // Dessiner tous les joueurs actifs
    drawPlayer(starship, starshipImg);
    if (multiplayerConfig.isMultiplayer) {
        drawPlayer(starship2, starship2Img);
    }
    if (multiplayerConfig.isTriplePlayer) {
        drawPlayer(starship3, starship3Img);
    }
}

// Fonction pour dessiner les balles des joueurs
export function drawBullets() {
    const drawPlayerBullets = (player) => {
        if (!player || !player.isActive) return;

        player.bullets.forEach(bullet => {
            if (bulletImg && bulletImg.complete && bulletImg.naturalWidth > 0) {
                ctx.drawImage(bulletImg, bullet.x - 5, bullet.y - 10, 10, 20);
            } else {
                // Fallback si l'image n'est pas chargée
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(bullet.x - 2, bullet.y - 5, 4, 10);
            }
        });
    };

    drawPlayerBullets(starship);
    if (multiplayerConfig.isMultiplayer) {
        drawPlayerBullets(starship2);
    }
    if (multiplayerConfig.isTriplePlayer) {
        drawPlayerBullets(starship3);
    }
}

// Fonction pour mettre à jour les balles des joueurs
export function updateBullets() {
    const updatePlayerBullets = (player) => {
        if (!player || !player.isActive) return;

        player.bullets.forEach((bullet, index) => {
            bullet.y -= bullet.speed || 10;
            if (bullet.y < 0) {
                player.bullets.splice(index, 1);
            }
        });
    };

    updatePlayerBullets(starship);
    if (multiplayerConfig.isMultiplayer) {
        updatePlayerBullets(starship2);
    }
    if (multiplayerConfig.isTriplePlayer) {
        updatePlayerBullets(starship3);
    }
}

// Fonction pour tirer
export function shootBullet(player) {
    if (!player || !player.isActive || player.stunned) return;

    const bulletSpeed = 10;
    const currentTime = Date.now();

    // Limitation du taux de tir
    if (player.lastShotTime && currentTime - player.lastShotTime < 100) {
        return;
    }
    player.lastShotTime = currentTime;

    // Tir basé sur le niveau de power-up
    switch (player.powerUpLevel) {
        case 0:
            // Tir simple
            player.bullets.push({
                x: player.x,
                y: player.y - player.height / 2,
                speed: bulletSpeed
            });
            break;
        case 1:
            // Tir double
            player.bullets.push(
                {
                    x: player.x - 10,
                    y: player.y - player.height / 2,
                    speed: bulletSpeed
                },
                {
                    x: player.x + 10,
                    y: player.y - player.height / 2,
                    speed: bulletSpeed
                }
            );
            break;
        case 2:
            // Tir triple
            player.bullets.push(
                {
                    x: player.x - 15,
                    y: player.y - player.height / 2,
                    speed: bulletSpeed
                },
                {
                    x: player.x,
                    y: player.y - player.height / 2,
                    speed: bulletSpeed
                },
                {
                    x: player.x + 15,
                    y: player.y - player.height / 2,
                    speed: bulletSpeed
                }
            );
            break;
        default:
            // Tir multiple avancé
            for (let i = -2; i <= 2; i++) {
                player.bullets.push({
                    x: player.x + i * 8,
                    y: player.y - player.height / 2,
                    speed: bulletSpeed
                });
            }
    }

    playSound(soundEffects.shoot);
}

// Fonction pour obtenir tous les joueurs actifs
export function getActivePlayers() {
    const players = [];
    if (starship && starship.isActive) players.push(starship);
    if (starship2 && starship2.isActive) players.push(starship2);
    if (starship3 && starship3.isActive) players.push(starship3);
    return players;
}

// Fonction pour réinitialiser les joueurs
export function resetPlayers() {
    if (starship) {
        starship.lives = 3;
        starship.isActive = true;
        starship.bullets = [];
        starship.powerUpLevel = 0;
        starship.stunned = false;
        starship.shield = false;
        starship.redPointsCollected = 0;
    }
    
    if (starship2) {
        starship2.lives = 3;
        starship2.isActive = true;
        starship2.bullets = [];
        starship2.powerUpLevel = 0;
        starship2.stunned = false;
        starship2.shield = false;
        starship2.redPointsCollected = 0;
    }
    
    if (starship3) {
        starship3.lives = 3;
        starship3.isActive = true;
        starship3.bullets = [];
        starship3.powerUpLevel = 0;
        starship3.stunned = false;
        starship3.shield = false;
        starship3.redPointsCollected = 0;
    }
}
