// input.js - Gestion des entrées (clavier, souris, tactile)

import { canvas, controlState, multiplayerConfig } from './globals.js';
import { shootBullet, getActivePlayers } from './player.js';
import { createTouchIndicator } from './ui.js';

// Variables de contrôle
let gamepadConnected = false;
let gamepadIndex = null;

// Variables pour les contrôles tactiles
let touchStartX = 0;
let touchStartY = 0;
let lastTouchTime = 0;

// Fonction d'initialisation des contrôles
export function initializeControls() {
    setupKeyboardControls();
    setupMouseControls();
    setupTouchControls();
    setupGamepadControls();
}

// Configuration des contrôles clavier
function setupKeyboardControls() {
    window.addEventListener("keydown", function(e) {
        handleKeyDown(e.key);
        e.preventDefault();
    });

    window.addEventListener("keyup", function(e) {
        handleKeyUp(e.key);
        e.preventDefault();
    });
}

// Gestion des touches pressées
function handleKeyDown(key) {
    switch(key.toLowerCase()) {
        // Joueur 1 (flèches)
        case "arrowup":
            controlState.keys.up = true;
            break;
        case "arrowdown":
            controlState.keys.down = true;
            break;
        case "arrowleft":
            controlState.keys.left = true;
            break;
        case "arrowright":
            controlState.keys.right = true;
            break;
        case " ": // Espace
            controlState.keys.space = true;
            controlState.shooting = true;
            break;

        // Joueur 2 (WASD)
        case "w":
            controlState.keys.w = true;
            break;
        case "s":
            controlState.keys.s = true;
            break;
        case "a":
            controlState.keys.a = true;
            break;
        case "d":
            controlState.keys.d = true;
            break;
        case "e":
            controlState.keys.e = true;
            break;

        // Joueur 3 (IJKL)
        case "i":
            controlState.keys.i = true;
            break;
        case "k":
            controlState.keys.k = true;
            break;
        case "j":
            controlState.keys.j = true;
            break;
        case "l":
            controlState.keys.l = true;
            break;
        case "o":
            controlState.keys.o = true;
            break;

        // Touches spéciales
        case "p":
            togglePause();
            break;
        case "escape":
            togglePause();
            break;
    }
}

// Gestion des touches relâchées
function handleKeyUp(key) {
    switch(key.toLowerCase()) {
        // Joueur 1
        case "arrowup":
            controlState.keys.up = false;
            break;
        case "arrowdown":
            controlState.keys.down = false;
            break;
        case "arrowleft":
            controlState.keys.left = false;
            break;
        case "arrowright":
            controlState.keys.right = false;
            break;
        case " ":
            controlState.keys.space = false;
            controlState.shooting = false;
            break;

        // Joueur 2
        case "w":
            controlState.keys.w = false;
            break;
        case "s":
            controlState.keys.s = false;
            break;
        case "a":
            controlState.keys.a = false;
            break;
        case "d":
            controlState.keys.d = false;
            break;
        case "e":
            controlState.keys.e = false;
            break;

        // Joueur 3
        case "i":
            controlState.keys.i = false;
            break;
        case "k":
            controlState.keys.k = false;
            break;
        case "j":
            controlState.keys.j = false;
            break;
        case "l":
            controlState.keys.l = false;
            break;
        case "o":
            controlState.keys.o = false;
            break;
    }
}

// Configuration des contrôles souris
function setupMouseControls() {
    window.addEventListener("mousedown", (e) => {
        if (e.button === 0) { // Clic gauche
            controlState.shooting = true;
            updateStarshipPosition(e.clientX, e.clientY);
        }
    });

    window.addEventListener("mouseup", (e) => {
        if (e.button === 0) {
            controlState.shooting = false;
        }
    });

    window.addEventListener("mousemove", (e) => {
        if (controlState.shooting) {
            updateStarshipPosition(e.clientX, e.clientY);
        }
    });
}

// Configuration des contrôles tactiles
function setupTouchControls() {
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    lastTouchTime = Date.now();
    
    controlState.shooting = true;
    updateStarshipPosition(touch.clientX, touch.clientY);
    createTouchIndicator(touch.clientX, touch.clientY);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    updateStarshipPosition(touch.clientX, touch.clientY);
}

function handleTouchEnd(e) {
    e.preventDefault();
    controlState.shooting = false;
}

// Configuration des contrôles manette
function setupGamepadControls() {
    window.addEventListener("gamepadconnected", function(e) {
        console.log("Manette connectée à l'indice %d: %s. %d boutons, %d axes.",
            e.gamepad.index, e.gamepad.id,
            e.gamepad.buttons.length, e.gamepad.axes.length);
        gamepadConnected = true;
        gamepadIndex = e.gamepad.index;
    });

    window.addEventListener("gamepaddisconnected", function(e) {
        if (gamepadIndex === e.gamepad.index) {
            gamepadConnected = false;
            gamepadIndex = null;
        }
    });
}

// Fonction pour mettre à jour la position du vaisseau principal
function updateStarshipPosition(x, y) {
    if (window.starship && window.starship.isActive && !window.starship.stunned) {
        window.starship.x = x - window.starship.width / 2;
        window.starship.y = y - window.starship.height / 2;
        
        // Maintenir le vaisseau dans les limites de l'écran
        window.starship.x = Math.max(0, Math.min(canvas.width - window.starship.width, window.starship.x));
        window.starship.y = Math.max(0, Math.min(canvas.height - window.starship.height, window.starship.y));
    }
}

// Fonction pour mettre à jour les contrôles multijoueur
export function updateMultiplayerControls() {
    const players = getActivePlayers();
    
    players.forEach(player => {
        if (player.stunned) return;

        const moveSpeed = 15;
        
        // Joueur 1 - Flèches
        if (player.player === 1) {
            if (controlState.keys.up && player.y > 0) {
                player.y -= moveSpeed;
            }
            if (controlState.keys.down && player.y < canvas.height - player.height) {
                player.y += moveSpeed;
            }
            if (controlState.keys.left && player.x > 0) {
                player.x -= moveSpeed;
            }
            if (controlState.keys.right && player.x < canvas.width - player.width) {
                player.x += moveSpeed;
            }
            if (controlState.keys.space) {
                shootBullet(player);
            }
        }
        
        // Joueur 2 - WASD + manette
        else if (player.player === 2) {
            // Contrôles clavier
            if (controlState.keys.w && player.y > 0) {
                player.y -= moveSpeed;
            }
            if (controlState.keys.s && player.y < canvas.height - player.height) {
                player.y += moveSpeed;
            }
            if (controlState.keys.a && player.x > 0) {
                player.x -= moveSpeed;
            }
            if (controlState.keys.d && player.x < canvas.width - player.width) {
                player.x += moveSpeed;
            }
            if (controlState.keys.e) {
                shootBullet(player);
            }

            // Contrôles manette
            if (gamepadConnected) {
                updateGamepadControls(player);
            }
        }
        
        // Joueur 3 - IJKL
        else if (player.player === 3) {
            if (controlState.keys.i && player.y > 0) {
                player.y -= moveSpeed;
            }
            if (controlState.keys.k && player.y < canvas.height - player.height) {
                player.y += moveSpeed;
            }
            if (controlState.keys.j && player.x > 0) {
                player.x -= moveSpeed;
            }
            if (controlState.keys.l && player.x < canvas.width - player.width) {
                player.x += moveSpeed;
            }
            if (controlState.keys.o) {
                shootBullet(player);
            }
        }
    });

    // Tir automatique pour le joueur 1 si contrôle souris/tactile
    if (controlState.shooting && window.starship) {
        shootBullet(window.starship);
    }
}

// Fonction pour mettre à jour les contrôles de manette
function updateGamepadControls(player) {
    try {
        const gamepad = navigator.getGamepads()[gamepadIndex];
        if (!gamepad) return;

        const moveSpeed = 15;
        const axisX = gamepad.axes[0];
        const axisY = gamepad.axes[1];

        // Mouvement avec les sticks analogiques
        if (Math.abs(axisX) > 0.1) {
            player.x += axisX * moveSpeed;
            player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        }

        if (Math.abs(axisY) > 0.1) {
            player.y += axisY * moveSpeed;
            player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
        }

        // Boutons de tir
        if (gamepad.buttons[0] && gamepad.buttons[0].pressed) { // Bouton A/X
            shootBullet(player);
        }
    } catch (error) {
        console.error("Erreur contrôles manette:", error);
    }
}

// Fonction pour basculer la pause
function togglePause() {
    if (window.gameManager) {
        window.gameManager.isPaused = !window.gameManager.isPaused;
        console.log("Pause:", window.gameManager.isPaused ? "ON" : "OFF");
    }
}

// Fonction pour obtenir l'état des contrôles
export function getControlState() {
    return {
        keys: { ...controlState.keys },
        shooting: controlState.shooting,
        gamepadConnected: gamepadConnected
    };
}

// Fonction pour réinitialiser les contrôles
export function resetControls() {
    controlState.keys = {};
    controlState.shooting = false;
    touchStartX = 0;
    touchStartY = 0;
    lastTouchTime = 0;
}

// Fonction pour désactiver temporairement les contrôles
export function disableControls() {
    controlState.keys = {};
    controlState.shooting = false;
}

// Fonction pour vérifier si une touche est pressée
export function isKeyPressed(key) {
    return controlState.keys[key] || false;
}

// Fonction pour simuler une pression de touche (pour les tests)
export function simulateKeyPress(key, pressed = true) {
    if (pressed) {
        handleKeyDown(key);
    } else {
        handleKeyUp(key);
    }
}

// Fonctions d'exportation pour la compatibilité
export { gamepadConnected, gamepadIndex };
