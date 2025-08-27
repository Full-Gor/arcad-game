// gameLoop.js - Boucle principale du jeu

import { canvas, ctx, gameState, CONFIG } from './globals.js';
import { drawStarship, updateBullets } from './player.js';
import { drawEnemies, drawEnemyBullets, shootEnemyBullets, updateEnemies } from './enemies.js';
import { updateBoss, drawBoss, checkBossCollisions, checkBossSpawn } from './boss.js';
import { drawAllParticleEffects } from './particles.js';
import { updateMultiplayerControls } from './input.js';
import { checkAllCollisions } from './collisions.js';
import { updatePlayerStats, showGameOver } from './ui.js';
import { playGameOverSound } from './audio.js';

// Variables de la boucle de jeu
let animationFrameId = null;
let gameManager = null;

// Gestionnaire de jeu
class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.isPaused = false;
        this.gameOverShown = false;
        this.setupPauseControl();
    }

    setupPauseControl() {
        // Configuration des contrôles de pause
        window.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.isPaused = true;
            }
        });
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    gameOver() {
        if (this.gameOverShown) return;
        
        this.gameOverShown = true;
        playGameOverSound();
        showGameOver();
        
        // Arrêter la boucle de jeu
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        console.log("Game Over");
    }

    restart() {
        this.gameOverShown = false;
        this.isPaused = false;
        // La logique de redémarrage sera implémentée dans le module principal
        startGameLoop();
    }
}

// Fonction principale de la boucle de jeu
function gameLoop(currentTime = 0) {
    // Calcul du deltaTime
    gameState.deltaTime = currentTime - gameState.lastFrameTime;
    gameState.lastFrameTime = currentTime;

    // Limitation du FPS
    if (gameState.deltaTime < CONFIG.FRAME_DURATION) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }

    // Vérifier si le jeu est en pause
    if (gameManager && gameManager.isPaused) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
        // 1. Mettre à jour les contrôles
        updateMultiplayerControls();

        // 2. Mettre à jour les entités du jeu
        updateBullets();
        updateEnemies();
        updateBoss();

        // 3. Générer les tirs ennemis périodiquement
        if (Math.random() < 0.02) { // 2% de chance à chaque frame
            shootEnemyBullets();
        }

        // 4. Vérifier les collisions
        const gameOverResult = checkAllCollisions();
        if (gameOverResult && gameManager) {
            gameManager.gameOver();
            return;
        }

        // 5. Vérifier l'apparition des boss
        checkBossSpawn();

        // 6. Vérifier les collisions avec les boss
        checkBossCollisions();

        // 7. Dessiner tous les éléments
        drawAllParticleEffects(); // Étoiles et particules de fond
        drawStarship(); // Vaisseaux des joueurs
        drawEnemies(); // Ennemis
        drawEnemyBullets(); // Balles ennemies
        drawBoss(); // Boss si actif

        // 8. Gérer les power-ups
        if (window.bonusManager) {
            window.bonusManager.update();
            window.bonusManager.draw();
            window.bonusManager.checkAllCollisions();
        }

        // 9. Mettre à jour l'interface utilisateur
        updatePlayerStats();

        // 10. Compter les FPS
        gameState.fpsCounter++;
        gameState.fpsTimer += gameState.deltaTime;
        
        if (gameState.fpsTimer >= 1000) {
            // console.log("FPS:", gameState.fpsCounter);
            gameState.fpsCounter = 0;
            gameState.fpsTimer = 0;
        }

    } catch (error) {
        console.error("Erreur dans la boucle de jeu:", error);
    }

    // Programmer la prochaine frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Fonction pour démarrer la boucle de jeu
export function startGameLoop() {
    if (!canvas || !ctx) {
        console.error("Canvas ou contexte non initialisé");
        return;
    }

    // Créer le gestionnaire de jeu s'il n'existe pas
    if (!gameManager) {
        gameManager = new GameManager(canvas);
        // Exposer globalement pour l'accès depuis d'autres modules
        window.gameManager = gameManager;
    }

    // Réinitialiser l'état du jeu
    gameState.isRunning = true;
    gameState.lastFrameTime = 0;
    gameState.deltaTime = 0;
    gameState.fpsCounter = 0;
    gameState.fpsTimer = 0;

    // Démarrer la boucle
    animationFrameId = requestAnimationFrame(gameLoop);
    console.log("Boucle de jeu démarrée");
}

// Fonction pour arrêter la boucle de jeu
export function stopGameLoop() {
    gameState.isRunning = false;
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    console.log("Boucle de jeu arrêtée");
}

// Fonction pour mettre en pause/reprendre
export function togglePause() {
    if (gameManager) {
        gameManager.isPaused = !gameManager.isPaused;
        console.log("Jeu", gameManager.isPaused ? "en pause" : "repris");
    }
}

// Fonction pour redémarrer le jeu
export function restartGame() {
    if (gameManager) {
        gameManager.restart();
    }
}

// Fonction pour obtenir l'état du jeu
export function getGameState() {
    return {
        isRunning: gameState.isRunning,
        isPaused: gameManager ? gameManager.isPaused : false,
        fps: gameState.fpsCounter,
        deltaTime: gameState.deltaTime
    };
}

// Fonction pour obtenir le gestionnaire de jeu
export function getGameManager() {
    return gameManager;
}

// Fonction pour configurer les intervalles de jeu
export function setupGameIntervals() {
    const intervals = [
        // Génération d'ennemis
        setInterval(() => {
            if (!gameManager || !gameManager.isPaused) {
                updateEnemies();
            }
        }, 2000),
        
        // Tirs ennemis
        setInterval(() => {
            if (!gameManager || !gameManager.isPaused) {
                shootEnemyBullets();
            }
        }, 1000),
        
        // Tirs spéciaux des ennemis de type 1
        setInterval(() => {
            if (!gameManager || !gameManager.isPaused) {
                // Logique pour les tirs spéciaux
                shootEnemyBullets();
            }
        }, 500)
    ];

    // Nettoyer les intervalles quand la page se ferme
    window.addEventListener("beforeunload", () => {
        intervals.forEach(interval => clearInterval(interval));
    });

    return intervals;
}

// Export du GameManager pour l'utilisation dans d'autres modules
export { GameManager };
