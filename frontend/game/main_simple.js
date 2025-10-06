// main_simple.js - Point d'entrée principal simplifié
import { initializeCanvas, setupCanvasResize, canvas, ctx } from './globals_simple.js';
import { initializePlayer, drawPlayer, updateStarshipIntro, isIntroActive, starship } from './player_simple.js';
import { initializeInput } from './input_simple.js';
import { handleShooting, drawBullets, updateBullets } from './player_shooting_adapter.js';
import { initializeAudio } from './audio_simple.js';
import { updateSimpleShield, drawSimpleShield, initShieldSystem } from './shield/shield_simple.js';

// Variables du jeu
let gameRunning = false;
let animationId = null;

// NOUVEAU: Module de tir spécial du joueur (importé dynamiquement)
let playerShootingModule = null;

// Fonction d'initialisation du jeu
function initGame() {
    console.log('Initialisation du jeu...');
    
    // Initialiser le canvas
    if (!initializeCanvas()) {
        console.error('Erreur lors de l\'initialisation du canvas');
        return;
    }
    
    // Configurer le redimensionnement
    setupCanvasResize();
    
    // Initialiser le joueur
    initializePlayer();
    
    // NOUVEAU: Importer player_shooting_modes.js APRÈS l'initialisation du joueur
    // pour que canvas, ctx et starship soient disponibles
    import('./player_shooting_modes.js').then(module => {
        playerShootingModule = module;
        // Exposer le module globalement pour input_simple.js
        window.playerShootingModule = module;
        console.log('✅ player_shooting_modes.js importé avec succès après initialisation');
        console.log('🔍 Canvas disponible:', !!canvas);
        console.log('🔍 CTX disponible:', !!ctx);
        console.log('🔍 Starship disponible:', !!starship);
    }).catch(error => {
        console.error('❌ Erreur import player_shooting_modes.js:', error);
    });
    
    // Les projectiles sont gérés par player_shooting_adapter.js
    
    // Initialiser l'audio
    initializeAudio();
    
    // Initialiser les systèmes de bouclier
    initShieldSystem();
    
    // Initialiser les contrôles
    initializeInput();
    
    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        if (canvas && ctx) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
    
    // Démarrer la boucle de jeu
    gameRunning = true;
    gameLoop();
    
    console.log('Jeu initialisé avec succès !');
}

// Boucle de jeu principale
function gameLoop() {
    if (!gameRunning) return;
    
    // Effacer l'écran
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dessiner un fond noir
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Mettre à jour l'animation d'entrée du vaisseau
        updateStarshipIntro();
        
        // Mettre à jour les projectiles du joueur
        updateBullets();
        
        // Gérer les tirs (seulement après l'animation d'entrée)
        if (!isIntroActive()) {
            handleShooting();
            // NOUVEAU: Gérer les tirs spéciaux du joueur (appelé à chaque frame pour tir continu)
            // shootPlayerSpecialBullet(); // DÉSACTIVÉ: Appelé seulement au clic, pas en continu
        }
        
        // Mettre à jour les systèmes de bouclier
        updateSimpleShield();
        
        // Dessiner le vaisseau
        drawPlayer();
        
        // Dessiner les systèmes de bouclier
        drawSimpleShield();
        
        // Dessiner les projectiles (seulement après l'animation d'entrée)
        if (!isIntroActive()) {
            drawBullets();
        }
        
    }
    
    // Continuer la boucle
    animationId = requestAnimationFrame(gameLoop);
}

// Fonction pour arrêter le jeu
function stopGame() {
    gameRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Démarrage automatique quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initGame);

// Nettoyage lors de la fermeture de la page
window.addEventListener('beforeunload', stopGame);
