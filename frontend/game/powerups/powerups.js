// powerups.js - Gestion des power-ups et bonus

import { canvas, ctx, stageState, CONFIG, multiplayerConfig } from './globals.js';
import { playSound, soundEffects } from './audio.js';
import { checkCollision } from './collisions.js';
import { getActivePlayers } from './player.js';
import { createExplosion } from './particles.js';

// Images des power-ups
export let powerUpImgs = [];
export let livesImg = null;

// Variables pour les effets spéciaux
let powerUpTimeoutId = null;
let videoContainer = null;
let powerUpVideo = null;

// Gestionnaire de bonus
export class BonusManager {
    constructor() {
        this.powerUps = [];
        this.lives = [];
    }

    addPowerUp(type) {
        if (this.powerUps.length >= 5) return;

        // Si le type n'est pas spécifié, on le détermine en fonction du stage
        if (type === undefined) {
            if (stageState.isStage2) {
                // En stage 2, possibilité d'obtenir le powerup.jpg (type 0) ou le powerup1.jpg (type 1)
                type = Math.floor(Math.random() * 2);
            } else {
                // En stage 1 ou autres, uniquement le powerup1.jpg (type 1)
                type = 1;
            }
        }

        this.powerUps.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: -50,
            width: 40,
            height: 40,
            speed: 1,
            type: type
        });
    }

    addLife() {
        if (this.lives.length >= 3) return;

        this.lives.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: -50,
            width: 40,
            height: 40,
            speed: 2
        });
    }

    update() {
        // Mise à jour des power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed;
            powerUp.x += Math.sin(Date.now() * 0.002) * 2;
            powerUp.x = Math.max(0, Math.min(canvas.width - powerUp.width, powerUp.x));

            if (powerUp.y >= canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }

        // Mise à jour des vies
        for (let i = this.lives.length - 1; i >= 0; i--) {
            const life = this.lives[i];
            life.y += life.speed;
            life.x += Math.sin(Date.now() * 0.001) * 1.5;
            life.x = Math.max(0, Math.min(canvas.width - life.width, life.x));

            if (life.y >= canvas.height) {
                this.lives.splice(i, 1);
            }
        }
    }

    draw() {
        // Dessin des power-ups
        this.powerUps.forEach(powerUp => {
            try {
                if (powerUpImgs[powerUp.type] && powerUpImgs[powerUp.type].complete) {
                    ctx.drawImage(
                        powerUpImgs[powerUp.type],
                        powerUp.x, powerUp.y,
                        powerUp.width, powerUp.height
                    );
                } else {
                    // Fallback si l'image n'est pas chargée
                    ctx.fillStyle = '#00ff00';
                    ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                }

                // Effet de lueur
                if (Math.random() > 0.7) {
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = "#04fbac";
                    ctx.beginPath();
                    ctx.arc(
                        powerUp.x + powerUp.width/2,
                        powerUp.y + powerUp.height/2,
                        powerUp.width/2 + 5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.restore();
                }
            } catch (error) {
                console.error("Erreur lors du dessin d'un power-up:", error);
            }
        });

        // Dessin des vies
        this.lives.forEach(life => {
            try {
                if (livesImg && livesImg.complete) {
                    ctx.drawImage(
                        livesImg,
                        life.x, life.y,
                        life.width, life.height
                    );
                } else {
                    // Fallback si l'image n'est pas chargée
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(life.x, life.y, life.width, life.height);
                }

                // Effet de pulsation
                const pulseFactor = Math.sin(Date.now() * 0.005) * 0.2 + 1;

                ctx.save();
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(
                    life.x + life.width/2,
                    life.y + life.height/2,
                    life.width/2 * pulseFactor,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.restore();
            } catch (error) {
                console.error("Erreur lors du dessin d'une vie:", error);
            }
        });
    }

    checkAllCollisions() {
        const players = getActivePlayers();
        
        players.forEach(player => {
            this.checkCollisions(
                player,
                type => activatePowerUp(player, type),
                () => {
                    player.lives++;
                    playSound(soundEffects.perfect);
                    console.log(`Joueur ${player.player} a gagné une vie!`);
                }
            );
        });
    }

    checkCollisions(ship, handlePowerUp, handleLife) {
        if (!ship || !ship.isActive) return;

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (checkCollision(ship, powerUp)) {
                handlePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
            }
        }

        for (let i = this.lives.length - 1; i >= 0; i--) {
            const life = this.lives[i];
            if (checkCollision(ship, life)) {
                handleLife();
                this.lives.splice(i, 1);
            }
        }
    }

    // Getters
    getPowerUps() {
        return this.powerUps;
    }

    getLives() {
        return this.lives;
    }

    // Méthodes utilitaires
    clearAll() {
        this.powerUps = [];
        this.lives = [];
    }

    getPowerUpCount() {
        return this.powerUps.length;
    }

    getLifeCount() {
        return this.lives.length;
    }
}

// Fonction pour activer un power-up
export function activatePowerUp(ship, powerUpType) {
    if (powerUpType === 2) {
        // Power-up vidéo spécial
        try {
            // Cette fonction sera implémentée dans le module principal
            activateVideoPowerUp();
        } catch (error) {
            console.error("Erreur powerup vidéo:", error);
        }
    } else if (powerUpType === 0) { // powerUp.jpg (type 0)
        // Activer l'éclair
        activateThunder(ship);
    } else if (powerUpType === 1) { // powerUp1.jpg (type 1)
        if (ship.powerUpTimeoutId) {
            clearTimeout(ship.powerUpTimeoutId);
            ship.powerUpTimeoutId = null;
        }

        // Incrémenter le niveau de powerUp
        ship.powerUpLevel = Math.min(9, ship.powerUpLevel + 1);

        ship.powerUpTimeoutId = setTimeout(() => {
            ship.powerUpLevel = Math.max(0, ship.powerUpLevel - 1);
            ship.powerUpTimeoutId = null;
        }, 6000);
    }
}

// Fonction pour activer l'éclair (thunder)
export function activateThunder(ship) {
    console.log("Activation de l'éclair pour le joueur", ship.player);
    
    // Créer l'effet d'éclair
    const thunder = {
        active: true,
        startTime: Date.now(),
        duration: 2000, // 2 secondes
        player: ship.player,
        x: ship.x,
        y: ship.y,
        width: canvas.width,
        height: canvas.height
    };

    // Ajouter l'éclair à la liste des effets actifs
    if (!window.activeThunders) {
        window.activeThunders = [];
    }
    window.activeThunders.push(thunder);

    // Détruire tous les ennemis visibles - OPTIMISÉ avec Object Pool
    const enemies = window.gameEntities ? window.gameEntities.enemies : [];
    if (enemies && enemies.length > 0) {
        console.log(`🌩️ Thunder détruit ${enemies.length} ennemis avec explosions optimisées`);
        
        enemies.forEach((enemy, index) => {
            // Utiliser createExplosion qui utilise le pool - BEAUCOUP PLUS PERFORMANT
            createExplosion(
                enemy.x + enemy.width/2, 
                enemy.y + enemy.height/2, 
                8, // Réduire de 10 à 8 particules par ennemi
                ["yellow", "white", "blue", "cyan"]
            );
        });
        
        // Vider le tableau des ennemis
        enemies.length = 0;
    }

    playSound(soundEffects.awesome);
}

// Fonction pour dessiner les éclairs
export function drawThunder() {
    if (!window.activeThunders) return;

    const currentTime = Date.now();
    
    for (let i = window.activeThunders.length - 1; i >= 0; i--) {
        const thunder = window.activeThunders[i];
        
        if (currentTime - thunder.startTime > thunder.duration) {
            window.activeThunders.splice(i, 1);
            continue;
        }

        // Calculer l'intensité basée sur le temps restant
        const timeLeft = thunder.duration - (currentTime - thunder.startTime);
        const intensity = timeLeft / thunder.duration;

        ctx.save();
        ctx.globalAlpha = intensity * 0.8;
        
        // Dessiner plusieurs éclairs
        for (let j = 0; j < 5; j++) {
            ctx.strokeStyle = j % 2 === 0 ? '#ffffff' : '#00ffff';
            ctx.lineWidth = Math.random() * 3 + 1;
            ctx.beginPath();
            
            let x = Math.random() * canvas.width;
            let y = 0;
            ctx.moveTo(x, y);
            
            // Créer un chemin d'éclair zigzagué
            while (y < canvas.height) {
                x += (Math.random() - 0.5) * 100;
                y += Math.random() * 50 + 20;
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Fonction pour mettre à jour et dessiner les éclairs
export function updateAndDrawThunder() {
    drawThunder();
}

// Fonction pour activer le power-up vidéo (à implémenter dans le module principal)
function activateVideoPowerUp() {
    console.log("Activation du power-up vidéo");
    // Cette fonction sera implémentée dans le module principal
}

// Fonction de mise à jour des statistiques des joueurs (à implémenter dans le module UI)
function updatePlayerStats() {
    // Cette fonction sera implémentée dans le module UI
    console.log("Mise à jour des statistiques des joueurs");
}

// Fonction d'initialisation des images
export function initializePowerUpImages() {
    powerUpImgs = Array(3).fill().map(() => new Image());
    powerUpImgs.forEach((img, i) => img.src = `/img/powerUp${i ? i : ""}.jpg`);
    
    livesImg = new Image();
    livesImg.src = "/img/lives.jpg";
}

// Fonction d'initialisation des éléments vidéo
export function initializeVideoPowerUp() {
    videoContainer = document.getElementById("videoContainer");
    powerUpVideo = document.getElementById("powerUpVideo");
    
    if (powerUpVideo) {
        powerUpVideo.onended = endPowerUpVideo;
    }
}

// Fonction pour terminer le power-up vidéo
export function endPowerUpVideo() {
    if (videoContainer) {
        videoContainer.style.display = "none";
    }
    
    // Cette fonction sera complétée dans le module principal
    console.log("Fin du power-up vidéo");
}

// Initialisation
initializePowerUpImages();
