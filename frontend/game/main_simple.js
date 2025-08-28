// main_simple.js - Point d'entrée principal simplifié
import { initializeCanvas, setupCanvasResize, canvas, ctx } from './globals_simple.js';
import { initializePlayer, drawPlayer, updateStarshipIntro, isIntroActive } from './player_simple.js';
import { initializeInput } from './input_simple.js';
import { initializeBullets, handleShooting, drawBullets } from './bullets_simple.js';
import { initializeEnemies, startEnemyGeneration, updateEnemies, drawEnemies, stopEnemyGeneration, areAllWavesCompleted } from './enemies_simple.js';
import { checkCollisions, updateExplosionParticles, drawExplosionParticles } from './collisions_simple.js';
import { initializeAudio } from './audio_simple.js';
import { startEnemyShooting, updateEnemyBullets, drawEnemyBullets, stopEnemyShooting } from './enemy_bullets_simple.js';
import { updateFunnelLasers, drawFunnelLasers, clearFunnelLasers } from './funnel_laser_simple.js';
import { initializeScore, shouldSpawnBossGlobal } from './score_simple.js';
import { initializeMiniBoss, createMiniBoss, updateMiniBoss, drawMiniBoss, isMiniBossActive } from './miniboss_simple.js';
import { initializeBoss, createBoss, updateBoss, drawBoss, isBossActive } from './boss_simple.js';
import { initSphericalShield, updateSphericalShield, drawSphericalShield, revealFullShield, createSphericalImpact, isSphericalShieldActive } from './shield2_main.js';
import { updateEnemyInfoDisplay, drawEnemyInfoDisplay } from './enemy_info_display.js';
import { updateSimpleShield, drawSimpleShield, initShieldSystem } from './shield_simple.js';

// Variables du jeu
let gameRunning = false;
let animationId = null;
let miniBossTriggered = false; // Flag pour éviter de déclencher le mini-boss plusieurs fois
let bossTriggered = false; // NOUVEAU: Flag pour éviter de déclencher le boss plusieurs fois

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
    
    // Initialiser les projectiles
    initializeBullets();
    
    // Initialiser les ennemis
    initializeEnemies();
    
    // Initialiser l'audio
    initializeAudio();
    
    // Initialiser le système de score
    initializeScore();
    
    // Initialiser le mini-boss
    initializeMiniBoss();
    
    // Initialiser le boss principal
    initializeBoss();
    
    // Initialiser les systèmes de bouclier
    initShieldSystem();        // NOUVEAU: Bouclier simple activé avec ESPACE
    initSphericalShield();     // NOUVEAU: Système sphérique v2 (code original)
    
    // Initialiser les contrôles
    initializeInput();
    
    // Démarrer la génération automatique d'ennemis
    startEnemyGeneration();
    
    // Démarrer le tir automatique des ennemis
    startEnemyShooting();
    
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
        
        // Mettre à jour les ennemis (le setInterval gère la génération)
        updateEnemies();
        
        // Mettre à jour le mini-boss
        updateMiniBoss();
        
        // Mettre à jour le boss principal
        updateBoss();
        
        // Mettre à jour les projectiles des ennemis
        updateEnemyBullets();
        
        // NOUVEAU: Mettre à jour les lasers entonnoir
        updateFunnelLasers();
        
        // Mettre à jour l'affichage des informations sur les ennemis
        updateEnemyInfoDisplay();
        
        // Gérer les tirs (seulement après l'animation d'entrée)
        if (!isIntroActive()) {
            handleShooting();
        }
        
        // Vérifier les collisions (seulement après l'animation d'entrée)
        if (!isIntroActive()) {
            checkCollisions();
        }
        
        // Mettre à jour les particules d'explosion
        updateExplosionParticles();
        
        // Mettre à jour les systèmes de bouclier
        updateSimpleShield();      // NOUVEAU: Bouclier simple activé avec ESPACE
        updateSphericalShield();   // NOUVEAU: Système sphérique v2 (code original)
        
        // NOUVEAU: Vérifier si le boss doit apparaître (priorité absolue)
        if (shouldSpawnBossGlobal() && !bossTriggered && !isBossActive()) {
            console.log('🔥 100 ENNEMIS TUÉS ! BOSS PRINCIPAL DÉCLENCHÉ !');
            createBoss();
            bossTriggered = true;
        }
        // Sinon, vérifier si toutes les vagues sont terminées pour déclencher le mini-boss
        else if (areAllWavesCompleted() && !miniBossTriggered && !isMiniBossActive() && !bossTriggered) {
            console.log('🎊 Toutes les vagues terminées ! Déclenchement du mini-boss...');
            createMiniBoss();
            miniBossTriggered = true;
        }
        
        // Dessiner les ennemis
        if (!isIntroActive()) {
            drawEnemies();
        }
        
        // Dessiner le mini-boss
        drawMiniBoss();
        
        // Dessiner le boss principal
        drawBoss();
        
        // Dessiner le vaisseau
        drawPlayer();
        
        // Dessiner les particules d'explosion
        drawExplosionParticles();
        
        // Dessiner les systèmes de bouclier
        drawSimpleShield();        // NOUVEAU: Bouclier simple activé avec ESPACE
        drawSphericalShield(ctx);  // NOUVEAU: Système sphérique v2 (code original)
        
        // Dessiner les lasers entonnoir (derrière)
        drawFunnelLasers(ctx);
        
        // Dessiner les projectiles des ennemis
        drawEnemyBullets();
        
        // Dessiner les projectiles (seulement après l'animation d'entrée)
        if (!isIntroActive()) {
            drawBullets();
        }
        
        // Dessiner l'affichage des informations sur les ennemis (toujours au-dessus)
        drawEnemyInfoDisplay();
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
    
    // Arrêter la génération d'ennemis
    stopEnemyGeneration();
    
    // Arrêter le tir des ennemis
    stopEnemyShooting();
}

// Démarrage automatique quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initGame);

// Nettoyage lors de la fermeture de la page
window.addEventListener('beforeunload', stopGame);
