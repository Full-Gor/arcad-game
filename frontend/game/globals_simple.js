// globals_simple.js - Variables globales simplifiées
export let canvas = null;
export let ctx = null;

// Initialisation du canvas et du contexte
export function initializeCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas non trouvé !');
        return false;
    }
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Impossible d\'obtenir le contexte 2D !');
        return false;
    }
    
    // Ajuster la taille du canvas à la fenêtre
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    return true;
}

// Redimensionnement automatique du canvas
export function setupCanvasResize() {
    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
}

