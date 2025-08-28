// player_simple.js - Version simple avec seulement l'affichage du vaisseau
import { canvas, ctx } from './globals_simple.js';

// Variables du vaisseau
export let starship = null;
export let starshipImg = null;

// Variables pour l'animation d'entrée (copiées de game.html)
let starshipIntroActive = true;
let starshipIntroTimer = 0;
let starshipIntroDuration = 3000; // 3 secondes
let starshipOriginalSize = { width: 50, height: 50 };
let starshipFinalPosition = { x: 0, y: 0 }; // Sera calculé à l'initialisation

// Configuration des vaisseaux
const SHIP_IMAGES = {
    'Intercepteur': 'starship6.jpg',
    'Croiseur': 'starship1.jpg',
    'Destroyer': 'starship2.jpg',
    'Chasseur': 'starship3.jpg',
    'Éclaireur': 'starship4.jpg',
    'Aéronef': 'starship5.jpg',        // CORRECTION: Aéronef = starship5
    'Bombardier': 'starship7.jpg'      // CORRECTION: Bombardier = starship7
};

// Fonction pour obtenir le vaisseau sélectionné
export function getSelectedShip() {
    const vaisseauChoisi = localStorage.getItem('vaisseauChoisi');
    
    if (vaisseauChoisi && SHIP_IMAGES[vaisseauChoisi]) {
        return `/img/${SHIP_IMAGES[vaisseauChoisi]}`;
    }
    
    return "/img/starship7.jpg"; // Vaisseau par défaut
}

// Fonction pour créer un vaisseau simple
function createStarship(x, y) {
    return {
        x: x,
        y: y,
        width: 50,
        height: 50
    };
}

// Initialisation du vaisseau
export function initializePlayer() {
    if (!canvas) return;
    
    // Calculer la position finale du vaisseau
    starshipFinalPosition.x = canvas.width / 2 - 25;
    starshipFinalPosition.y = canvas.height - 100;
    
    // Créer le vaisseau avec taille initiale pour l'animation (4x plus gros)
    starship = createStarship(canvas.width / 2 - 100, canvas.height / 2 - 100);
    starship.width = 200; // 4x plus gros pour l'effet zoom
    starship.height = 200;
    
    // Charger l'image du vaisseau
    starshipImg = new Image();
    starshipImg.src = getSelectedShip();
    
    // Réinitialiser l'animation d'entrée
    starshipIntroActive = true;
    starshipIntroTimer = 0;
}

// Fonction d'animation d'entrée du vaisseau (copiée de game.html)
export function updateStarshipIntro() {
    if (!starshipIntroActive || !canvas) return;
    
    starshipIntroTimer += 16; // ~60fps
    const progress = Math.min(starshipIntroTimer / starshipIntroDuration, 1);
    
    // Interpolation fluide (easing out)
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    // Descente du milieu vers le bas + dézoom
    const startSize = 200; // 4x plus gros pour un zoom important
    const endSize = starshipOriginalSize.width;
    const currentSize = startSize + (endSize - startSize) * easeProgress;
    
    // Position Y : descente du milieu vers le bas
    const startY = canvas.height / 2 - currentSize / 2;
    const endY = canvas.height - currentSize - 25;
    const currentY = startY + (endY - startY) * easeProgress;
    
    starship.width = currentSize;
    starship.height = currentSize;
    starship.x = canvas.width / 2 - currentSize / 2; // Toujours centré en X
    starship.y = currentY;
    
    // Fin de l'animation
    if (progress >= 1) {
        starshipIntroActive = false;
        starship.x = starshipFinalPosition.x;
        starship.y = starshipFinalPosition.y;
        starship.width = starshipOriginalSize.width;
        starship.height = starshipOriginalSize.height;
        console.log("🚀 Animation d'entrée terminée");
    }
}

// Fonction pour vérifier si l'animation d'entrée est active
export function isIntroActive() {
    return starshipIntroActive;
}

// Fonction pour dessiner le vaisseau
export function drawPlayer() {
    if (!starship || !starshipImg || !ctx) return;
    
    ctx.drawImage(starshipImg, starship.x, starship.y, starship.width, starship.height);
}
