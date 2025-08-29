// input_simple.js - Gestion des contrôles souris et clavier de façon modulaire
import { canvas } from './globals_simple.js';
import { starship } from './player_simple.js';
import { startShooting, stopShooting } from './bullets_simple.js';
import { createPlayerFunnelLaser } from './funnel_laser_simple.js';
import { startShootSound, stopShootSound } from './audio_simple.js';
import { activateSimpleShield, deactivateSimpleShield } from './shield_simple.js';
import { activateShield3, deactivateShield3, isShield3Active } from './shield3_main.js';

// Variables pour gérer l'état des contrôles
let inputInitialized = false;

// Fonction pour initialiser les contrôles souris
export function initializeInput() {
    if (inputInitialized || !canvas) return;
    
    console.log('Initialisation des contrôles souris...');
    
    // Contrôles souris - déplacement du vaisseau
    window.addEventListener("mousemove", handleMouseMove);
    
    // Contrôles souris - tir
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    
    // Contrôles clavier - bouclier
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    inputInitialized = true;
    console.log('Contrôles souris initialisés !');
}

// Fonction de gestion du mouvement de la souris
function handleMouseMove(event) {
    if (!starship || !canvas) return;
    
    // Calculer la nouvelle position du vaisseau en suivant la souris
    starship.x = Math.max(
        0,
        Math.min(
            canvas.width - starship.width,
            event.clientX - starship.width / 2
        )
    );
    
    starship.y = Math.max(
        0,
        Math.min(
            canvas.height - starship.height,
            event.clientY - starship.height / 2 + 20
        )
    );
}

// Fonction de gestion du clic souris (commencer à tirer)
function handleMouseDown(event) {
    if (event.button === 0) { // Clic gauche
        startShooting();
        startShootSound(); // Démarrer le son de tir en continu
        console.log('Début du tir');
    }
}

// Fonction de gestion du relâchement souris (arrêter de tirer)
function handleMouseUp(event) {
    if (event.button === 0) { // Clic gauche
        stopShooting();
        stopShootSound(); // Arrêter le son de tir (copiée de game.html ligne 3104-3105)
        console.log('Arrêt du tir');
    }
}

// Fonction de gestion des touches pressées
function handleKeyDown(event) {
    if (event.code === 'Space') {
        event.preventDefault(); // Empêcher le scroll de la page
        activateSimpleShield();
    } else if (event.code === 'KeyF') { // F pour Funnel laser joueur
        event.preventDefault();
        createPlayerFunnelLaser();
    } else if (event.code === 'KeyC' || event.key === 'c' || event.key === 'C') {
        // Toggle Shield3 avec la touche C
        event.preventDefault();
        if (isShield3Active()) {
            deactivateShield3();
        } else {
            activateShield3();
        }
    } else if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        createPlayerFunnelLaser();
    }
}

// Fonction de gestion des touches relâchées
function handleKeyUp(event) {
    if (event.code === 'Space') {
        deactivateSimpleShield();
    } else if (event.code === 'KeyC' || event.key === 'c' || event.key === 'C') {
        // Mode toggle: ne rien faire au relâchement
    }
}

// Fonction pour nettoyer les event listeners (optionnel)
export function cleanupInput() {
    if (!inputInitialized) return;
    
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    inputInitialized = false;
    console.log('Contrôles nettoyés');
}
