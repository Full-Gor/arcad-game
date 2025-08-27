// main.js - Point d'entrée principal modulaire

import { initializeGlobals, resizeCanvas } from './globals.js';
import { initializeUI } from './ui.js';
import { initializeControls } from './input.js';
import { initializePlayers } from './player.js';
import { BonusManager } from './powerups.js';
import { startGameLoop, setupGameIntervals } from './gameLoop.js';
import { initializeStars } from './particles.js';

// Variables globales du jeu
let bonusManager = null;
let gameIntervals = [];

// Fonction principale d'initialisation
async function initializeGame() {
    try {
        console.log("Initialisation du jeu...");

        // 1. Initialiser les variables globales
        initializeGlobals();
        
        // 2. Redimensionner le canvas
        resizeCanvas();
        
        // 3. Initialiser l'interface utilisateur
        initializeUI();
        
        // 4. Initialiser les contrôles
        initializeControls();
        
        // 5. Initialiser les joueurs
        initializePlayers();
        
        // 6. Initialiser le gestionnaire de bonus
        bonusManager = new BonusManager();
        window.bonusManager = bonusManager; // Exposer globalement
        
        // 7. Initialiser les particules de fond
        initializeStars();
        
        // 8. Configurer les intervalles de jeu
        gameIntervals = setupGameIntervals();
        
        // 9. Démarrer la boucle de jeu
        startGameLoop();
        
        console.log("Jeu initialisé avec succès");
        
    } catch (error) {
        console.error("Erreur lors de l'initialisation du jeu:", error);
    }
}

// Fonction de nettoyage
function cleanupGame() {
    // Nettoyer les intervalles
    gameIntervals.forEach(interval => clearInterval(interval));
    gameIntervals = [];
    
    // Nettoyer les variables globales
    if (window.bonusManager) {
        window.bonusManager.clearAll();
        window.bonusManager = null;
    }
    
    if (window.gameManager) {
        window.gameManager = null;
    }
    
    console.log("Jeu nettoyé");
}

// Fonction pour redémarrer le jeu
function restartGame() {
    cleanupGame();
    setTimeout(initializeGame, 100);
}

// Gestion des événements de la page
document.addEventListener('DOMContentLoaded', initializeGame);

window.addEventListener('beforeunload', cleanupGame);

window.addEventListener('resize', resizeCanvas);

// Gestion de la visibilité de la page
document.addEventListener('visibilitychange', () => {
    if (window.gameManager) {
        if (document.hidden) {
            window.gameManager.pause();
        } else {
            window.gameManager.resume();
        }
    }
});

// Exposer certaines fonctions globalement pour la compatibilité
window.restartGame = restartGame;
window.initializeGame = initializeGame;

// Export des fonctions principales
export {
    initializeGame,
    cleanupGame,
    restartGame
};
