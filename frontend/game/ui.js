// ui.js - Interface utilisateur

import { playerState, multiplayerConfig } from './globals.js';

// Éléments de l'interface
let livesCountElement = null;
let enemiesKilledCountElement = null;
let redPointsCountElement = null;
let coinsCountElement = null;
let playerModeElement = null;
let playerStatsElement = null;
let bossHealthBar = null;
let bossHealthFill = null;
let stageTitle = null;

// Fonction d'initialisation des éléments UI
export function initializeUI() {
    livesCountElement = document.getElementById("livesCount");
    enemiesKilledCountElement = document.getElementById("enemiesKilledCount");
    redPointsCountElement = document.getElementById("redPointsCount");
    coinsCountElement = document.getElementById("coinsCount");
    playerModeElement = document.getElementById("playerModeIndicator");
    playerStatsElement = document.getElementById("playerStats");
    bossHealthBar = document.getElementById("bossHealthBar");
    bossHealthFill = document.getElementById("bossHealthFill");
    stageTitle = document.getElementById("stageTitle");

    // Configurer le mode de jeu
    updatePlayerModeDisplay();
    updatePlayerStats();
}

// Fonction pour mettre à jour l'affichage du mode de jeu
export function updatePlayerModeDisplay() {
    if (!playerModeElement) return;

    if (multiplayerConfig.isTriplePlayer) {
        playerModeElement.textContent = "Mode 3 joueurs";
        playerModeElement.style.color = "#FFFF50";
    } else if (multiplayerConfig.isMultiplayer) {
        playerModeElement.textContent = "Mode 2 joueurs";
        playerModeElement.style.color = "#FF7F50";
    } else {
        playerModeElement.textContent = "Mode 1 joueur";
        playerModeElement.style.color = "#04fbac";
    }

    // Afficher/masquer les statistiques multijoueur
    if (playerStatsElement) {
        playerStatsElement.style.display = multiplayerConfig.isMultiplayer ? "block" : "none";
    }
}

// Fonction pour mettre à jour les statistiques des joueurs
export function updatePlayerStats() {
    // Mise à jour des statistiques générales
    if (livesCountElement) {
        livesCountElement.textContent = playerState.lives;
    }
    
    if (enemiesKilledCountElement) {
        enemiesKilledCountElement.textContent = playerState.enemiesKilled;
    }
    
    if (redPointsCountElement) {
        redPointsCountElement.textContent = `${playerState.redPointsTotal}/100`;
    }
    
    if (coinsCountElement) {
        coinsCountElement.textContent = playerState.coins;
    }

    // Mise à jour des statistiques multijoueur
    if (multiplayerConfig.isMultiplayer) {
        updateMultiplayerStats();
    }
}

// Fonction pour mettre à jour les statistiques multijoueur
function updateMultiplayerStats() {
    // Player 1
    const p1LivesElement = document.getElementById("p1Lives");
    const p1PointsElement = document.getElementById("p1Points");
    const p1KillsElement = document.getElementById("p1Kills");
    
    if (window.starship) {
        if (p1LivesElement) p1LivesElement.textContent = window.starship.lives || 3;
        if (p1PointsElement) p1PointsElement.textContent = window.starship.points || 0;
        if (p1KillsElement) p1KillsElement.textContent = window.starship.kills || 0;
    }

    // Player 2
    if (multiplayerConfig.isMultiplayer && window.starship2) {
        const p2LivesElement = document.getElementById("p2Lives");
        const p2PointsElement = document.getElementById("p2Points");
        const p2KillsElement = document.getElementById("p2Kills");
        
        if (p2LivesElement) p2LivesElement.textContent = window.starship2.lives || 3;
        if (p2PointsElement) p2PointsElement.textContent = window.starship2.points || 0;
        if (p2KillsElement) p2KillsElement.textContent = window.starship2.kills || 0;
    }

    // Player 3
    if (multiplayerConfig.isTriplePlayer && window.starship3) {
        const p3LivesElement = document.getElementById("p3Lives");
        const p3PointsElement = document.getElementById("p3Points");
        const p3KillsElement = document.getElementById("p3Kills");
        
        if (p3LivesElement) p3LivesElement.textContent = window.starship3.lives || 3;
        if (p3PointsElement) p3PointsElement.textContent = window.starship3.points || 0;
        if (p3KillsElement) p3KillsElement.textContent = window.starship3.kills || 0;
    }
}

// Fonction pour afficher/masquer la barre de vie du boss
export function showBossHealthBar(show = true) {
    if (bossHealthBar) {
        bossHealthBar.style.display = show ? "block" : "none";
    }
}

// Fonction pour mettre à jour la barre de vie du boss
export function updateBossHealthBar(currentHealth, maxHealth) {
    if (bossHealthFill && maxHealth > 0) {
        const percentage = (currentHealth / maxHealth) * 100;
        bossHealthFill.style.width = `${Math.max(0, percentage)}%`;
    }
}

// Fonction pour afficher un message de stage
export function showStageMessage(message, duration = 3000, color = "#ff0000") {
    if (!stageTitle) return;

    stageTitle.textContent = message;
    stageTitle.style.color = color;
    stageTitle.style.display = "block";
    stageTitle.style.opacity = "0";

    // Animation de fade-in
    setTimeout(() => {
        stageTitle.style.opacity = "1";

        // Animation de fade-out après la durée spécifiée
        setTimeout(() => {
            stageTitle.style.opacity = "0";

            // Masquer l'élément après la transition
            setTimeout(() => {
                stageTitle.style.display = "none";
            }, 2000);
        }, duration);
    }, 100);
}

// Fonction pour afficher le Game Over
export function showGameOver() {
    const gameOverContainer = document.getElementById("gameOverContainer");
    const gameOverMessage = document.getElementById("gameOverMessage");

    if (gameOverContainer) {
        gameOverContainer.style.display = "block";
    }

    if (gameOverMessage) {
        gameOverMessage.style.display = "block";
    }
}

// Fonction pour masquer le Game Over
export function hideGameOver() {
    const gameOverContainer = document.getElementById("gameOverContainer");
    const gameOverMessage = document.getElementById("gameOverMessage");

    if (gameOverContainer) {
        gameOverContainer.style.display = "none";
    }

    if (gameOverMessage) {
        gameOverMessage.style.display = "none";
    }
}

// Fonction pour afficher le compteur de continuation
export function showContinueCounter(count) {
    const continueCounter = document.getElementById("continueCounter");
    if (continueCounter) {
        continueCounter.textContent = count;
        continueCounter.style.display = "block";
    }
}

// Fonction pour masquer le compteur de continuation
export function hideContinueCounter() {
    const continueCounter = document.getElementById("continueCounter");
    if (continueCounter) {
        continueCounter.style.display = "none";
    }
}

// Fonction pour mettre à jour le score d'un joueur
export function updatePlayerScore(playerNumber, score) {
    const scoreElement = document.getElementById(`p${playerNumber}Points`);
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

// Fonction pour mettre à jour les kills d'un joueur
export function updatePlayerKills(playerNumber, kills) {
    const killsElement = document.getElementById(`p${playerNumber}Kills`);
    if (killsElement) {
        killsElement.textContent = kills;
    }
}

// Fonction pour mettre à jour les vies d'un joueur
export function updatePlayerLives(playerNumber, lives) {
    const livesElement = document.getElementById(`p${playerNumber}Lives`);
    if (livesElement) {
        livesElement.textContent = lives;
    }

    // Mettre à jour aussi les statistiques générales si c'est le joueur 1
    if (playerNumber === 1) {
        playerState.lives = lives;
        if (livesCountElement) {
            livesCountElement.textContent = lives;
        }
    }
}

// Fonction pour incrémenter les ennemis tués
export function incrementEnemiesKilled(amount = 1) {
    playerState.enemiesKilled += amount;
    if (enemiesKilledCountElement) {
        enemiesKilledCountElement.textContent = playerState.enemiesKilled;
    }
}

// Fonction pour mettre à jour les pièces
export function updateCoins(coins) {
    playerState.coins = coins;
    if (coinsCountElement) {
        coinsCountElement.textContent = coins;
    }
}

// Fonction pour mettre à jour les points rouges
export function updateRedPoints(points) {
    playerState.redPointsTotal = points;
    if (redPointsCountElement) {
        redPointsCountElement.textContent = `${points}/100`;
    }
}

// Fonction pour créer un indicateur de toucher tactile
export function createTouchIndicator(x, y) {
    const touchIndicator = document.getElementById("touchIndicator");
    if (touchIndicator) {
        touchIndicator.style.left = `${x}px`;
        touchIndicator.style.top = `${y}px`;
        touchIndicator.style.display = "block";
        
        setTimeout(() => {
            touchIndicator.style.display = "none";
        }, 200);
    }
}

// Fonction pour afficher un message de victoire
export function showVictoryMessage() {
    showStageMessage("VICTOIRE ! FÉLICITATIONS !", 10000, "#00ff00");
}

// Fonction pour réinitialiser l'interface
export function resetUI() {
    playerState.lives = 3;
    playerState.enemiesKilled = 0;
    playerState.coins = 0;
    playerState.redPointsTotal = 0;
    
    updatePlayerStats();
    hideGameOver();
    hideContinueCounter();
    showBossHealthBar(false);
}

// Fonction pour obtenir les éléments de l'interface (pour les tests)
export function getUIElements() {
    return {
        livesCountElement,
        enemiesKilledCountElement,
        redPointsCountElement,
        coinsCountElement,
        playerModeElement,
        playerStatsElement,
        bossHealthBar,
        bossHealthFill,
        stageTitle
    };
}
