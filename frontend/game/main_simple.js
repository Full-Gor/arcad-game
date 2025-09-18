// main_simple.js - Point d'entrée principal simplifié
import { initializeCanvas, setupCanvasResize, canvas, ctx } from './globals_simple.js';
import { initializePlayer, drawPlayer, updateStarshipIntro, isIntroActive, starship } from './player_simple.js';
import { initializeInput } from './input_simple.js';
import { initializeBullets, handleShooting, drawBullets } from './bullets_simple.js';
import { initializeEnemies, startEnemyGeneration, updateEnemies, drawEnemies, stopEnemyGeneration, areAllWavesCompleted, spawnTestEnemy5WithPulsingLaser, enemies } from './enemies_simple.js';
import { checkCollisions, updateExplosionParticles, drawExplosionParticles } from './collisions_simple.js';
import { initializeAudio } from './audio_simple.js';
import { startEnemyShooting, updateEnemyBullets, drawEnemyBullets, stopEnemyShooting } from './enemy_bullets_simple.js';
import { updateFunnelLasers, drawFunnelLasers, clearFunnelLasers } from './funnel_laser_simple.js';
import { initializeScore, shouldSpawnBossGlobal } from './score_simple.js';
import { initializeMiniBoss, createMiniBoss, updateMiniBoss, drawMiniBoss, isMiniBossActive } from './miniboss_simple.js';
import { initializeBoss, createBoss, updateBoss, drawBoss, isBossActive } from './boss_simple.js';
import { initSphericalShield, updateSphericalShield, drawSphericalShield, revealFullShield, createSphericalImpact, isSphericalShieldActive } from './shield/shield2_main.js';
import { initShield3, updateShield3, drawShield3 } from './shield/shield3_main.js';
import { initPowerUpSystem } from './powerups/power_shield_common.js';
import { updatePowerShield1, drawPowerShield1, spawnPowerShield1 } from './powerups/power_shield1.js';
import { updatePowerShield2, drawPowerShield2, spawnPowerShield2 } from './powerups/power_shield2.js';
import { updatePowerShield3, drawPowerShield3, spawnPowerShield3 } from './powerups/power_shield3.js';
import { updateEnemyInfoDisplay, drawEnemyInfoDisplay, hideEnemyInfo } from './enemy_info_display.js';
import { updateSimpleShield, drawSimpleShield, initShieldSystem } from './shield/shield_simple.js';
import { initializeSpecialEnemies, updateSpecialEnemies, drawSpecialEnemies, checkSpecialEnemyCollisions, deactivateSpecialEnemies } from './special_enemies_manager.js';
import { updateSpecialBullets, drawSpecialBullets } from './special_bullets.js';
import { activateNeonPowerUpsTest, updateNeonPowerUpsTest, drawNeonPowerUpsTest } from './powerups/neon/test_integration.js';
// import { initSpecialPowerUps, updateSpecialPowerUps, drawSpecialPowerUps } from './powerups/special_powerups.js';
import { initPowerIcons, updatePowerIcons, drawPowerIcons } from './powerups/power_icons.js';
// import { initSpaceRiftSystem, updateSpaceRiftSystem, drawSpaceRiftSystem, forceCreateRiftPair } from './space_rift_system.js';
import { initGoldenHoneycombShield, updateGoldenHoneycombShield, drawGoldenHoneycombShield, toggleGoldenShield, createGoldenShieldImpact, getReflectedProjectiles } from './shield/golden_shield_system.js';
import { GeodesicShieldCanvas } from './shield/geodesic_shield_canvas.js';
import { ThreeJSManager } from './Effects/ThreeJSManager.js';

// Variables du jeu
let gameRunning = false;
let animationId = null;
let miniBossTriggered = false; // Flag pour éviter de déclencher le mini-boss plusieurs fois
let bossTriggered = false; // NOUVEAU: Flag pour éviter de déclencher le boss plusieurs fois

// NOUVEAU: Module de tir spécial du joueur (importé dynamiquement)
let playerShootingModule = null;

// NOUVEAU: Bouclier géodésique
let geodesicShield = null;

// NOUVEAU: Gestionnaire Three.js
let threeJSManager = null;

// Activation des power-ups pour tester les différents modes de tir
const POWERUPS_DISABLED_FOR_TEST = false;
// Désactiver les ennemis spéciaux pour ne montrer que ENEMY4.jpg
const SPECIAL_ENEMIES_DISABLED_FOR_TEST = true;

// Mode test strict: n'activer que le harness de test demandé
const STRICT_TEST_MODE = true;
// Couper boss/mini-boss pendant le test
const DISABLE_BOSS_MINIBOSS_FOR_TEST = true;
// Couper l'affichage d'infos ennemis pendant le test
const INFO_DISPLAY_DISABLED_FOR_TEST = true;

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
    
    // Initialiser les projectiles
    initializeBullets();
    
    // Initialiser les ennemis
    initializeEnemies();
    
    // Initialiser l'audio
    initializeAudio();
    
    // Initialiser le système de score
    initializeScore();
    
    // Initialiser mini-boss / boss (désactivés en mode test strict)
    if (!DISABLE_BOSS_MINIBOSS_FOR_TEST) {
        initializeMiniBoss();
        initializeBoss();
    }
    
    // Initialiser les systèmes de bouclier
    initShieldSystem();        // NOUVEAU: Bouclier simple activé avec ESPACE
    initSphericalShield();     // NOUVEAU: Système sphérique v2 (code original)
    initShield3();             // NOUVEAU: Bouclier 3 (absorption + riposte)
    if (!POWERUPS_DISABLED_FOR_TEST) {
        initPowerUpSystem(canvas.width, canvas.height);
    }
    
    if (!SPECIAL_ENEMIES_DISABLED_FOR_TEST) {
        initializeSpecialEnemies();
    }
    
    // Initialiser les contrôles
    initializeInput();
    
    // Exposer les spawns power-ups pour collisions
    window.spawnPowerShield1 = spawnPowerShield1;
    window.spawnPowerShield2 = spawnPowerShield2;
    window.spawnPowerShield3 = spawnPowerShield3;
    
    // Démarrer la génération automatique d'ennemis (coupée en test strict)
    if (!STRICT_TEST_MODE) {
        startEnemyGeneration();
    }
    
    // TEST: N'afficher qu'ENEMY5 avec laser vert pulsant - TEMPORAIREMENT DÉSACTIVÉ
    // spawnTestEnemy5WithPulsingLaser();
    if (INFO_DISPLAY_DISABLED_FOR_TEST) {
        try { hideEnemyInfo(); } catch (e) {}
    }
    
    // Démarrer le tir automatique des ennemis (activé pour voir enemy5 tirer) - TEMPORAIREMENT DÉSACTIVÉ
    // startEnemyShooting();
    
    // NOUVEAU: Activer les power-ups Néon pour test
    setTimeout(() => {
        activateNeonPowerUpsTest();
    }, 2000);
    
    // NOUVEAU: Initialiser les power-ups spéciaux (Santé et IA) - DÉSACTIVÉ
    // initSpecialPowerUps(canvas.width, canvas.height);
    
    // NOUVEAU: Initialiser le système d'icônes de pouvoirs
    initPowerIcons(canvas.width, canvas.height);
    
    // NOUVEAU: Initialiser le système de failles spatiales - DÉSACTIVÉ
    // initSpaceRiftSystem(canvas.width, canvas.height);
    
    // NOUVEAU: Initialiser le gestionnaire Three.js
    threeJSManager = new ThreeJSManager();
    console.log('Three.js Manager initialisé !');
    
    // NOUVEAU: Initialiser le bouclier géodésique Canvas 2D (fallback)
    geodesicShield = new GeodesicShieldCanvas();
    
    // Activer le bouclier géodésique Three.js par défaut en version beta
    threeJSManager.activateShield();
    
    // Désactiver le bouclier doré en version beta
    // initGoldenHoneycombShield(starship); // DÉSACTIVÉ
    
    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        if (canvas && ctx) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        // NOUVEAU: Redimensionner le gestionnaire Three.js
        if (threeJSManager) {
            threeJSManager.resize();
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
        
        // Mettre à jour les ennemis (le setInterval gère la génération)
        updateEnemies();
        
        // Mettre à jour les ennemis spéciaux (désactivés pour ce test)
        if (!SPECIAL_ENEMIES_DISABLED_FOR_TEST) {
            updateSpecialEnemies(starship);
        }
        
        // Mise à jour mini-boss / boss (coupés en test strict)
        if (!DISABLE_BOSS_MINIBOSS_FOR_TEST) {
            updateMiniBoss();
            updateBoss();
        }
        
        // Mettre à jour les projectiles des ennemis
        updateEnemyBullets();
        // Mettre à jour les projectiles spéciaux (électrique / glitch) même sans ennemis spéciaux
        updateSpecialBullets();
        // NOUVEAU: Mettre à jour les projectiles spéciaux du joueur
        if (playerShootingModule) {
            playerShootingModule.updatePlayerSpecialBullets();
        }
        
        // NOUVEAU: Mettre à jour les power-ups Néon
        if (starship) {
            updateNeonPowerUpsTest(starship.x, starship.y, starship.width, starship.height);
        }
        
        // NOUVEAU: Mettre à jour les power-ups spéciaux (Santé et IA) - DÉSACTIVÉ
        // if (starship) {
        //     updateSpecialPowerUps(starship.x, starship.y, starship.width, starship.height);
        // }
        
        // NOUVEAU: Mettre à jour le système d'icônes de pouvoirs
        updatePowerIcons();
        
        // NOUVEAU: Mettre à jour les lasers entonnoir
        updateFunnelLasers();
        
        // NOUVEAU: Mettre à jour le système de failles spatiales (inclut les ennemis ET le joueur) - DÉSACTIVÉ
        // const allEntities = [...enemies, starship];
        // updateSpaceRiftSystem(allEntities);
        
        // NOUVEAU: Mettre à jour le gestionnaire Three.js
        if (threeJSManager) {
            threeJSManager.setShieldPosition(starship.x + 25, starship.y + 25);
            threeJSManager.update();
        }
        
        // NOUVEAU: Mettre à jour le bouclier géodésique Canvas 2D (fallback)
        if (geodesicShield) {
            geodesicShield.setPosition(starship.x, starship.y);
            geodesicShield.update();
        }
        
        // NOUVEAU: Mettre à jour le bouclier doré - DÉSACTIVÉ
        // updateGoldenHoneycombShield();
        
        // Mettre à jour l'affichage des informations sur les ennemis (coupé en test)
        if (!INFO_DISPLAY_DISABLED_FOR_TEST) {
            updateEnemyInfoDisplay();
        }
        
        // Gérer les tirs (seulement après l'animation d'entrée)
        if (!isIntroActive()) {
            handleShooting();
            // NOUVEAU: Gérer les tirs spéciaux du joueur (appelé à chaque frame pour tir continu)
            // shootPlayerSpecialBullet(); // DÉSACTIVÉ: Appelé seulement au clic, pas en continu
        }
        
        // Vérifier les collisions (seulement après l'animation d'entrée)
        if (!isIntroActive()) {
            checkCollisions(geodesicShield);
        }
        
        // Mettre à jour les particules d'explosion
        updateExplosionParticles();
        
        // Mettre à jour les systèmes de bouclier
        updateSimpleShield();      // NOUVEAU: Bouclier simple activé avec ESPACE
        updateSphericalShield();   // NOUVEAU: Système sphérique v2 (code original)
        updateShield3();           // NOUVEAU: Bouclier 3 (absorption + riposte)
        // Power-ups
        if (!POWERUPS_DISABLED_FOR_TEST) {
            updatePowerShield1(starship);
            updatePowerShield2(starship);
            updatePowerShield3(starship);
        }
        
        // NOUVEAU: Vérifier boss/mini-boss (coupé en test strict)
        if (!DISABLE_BOSS_MINIBOSS_FOR_TEST) {
            if (shouldSpawnBossGlobal() && !bossTriggered && !isBossActive()) {
                console.log('🔥 100 ENNEMIS TUÉS ! BOSS PRINCIPAL DÉCLENCHÉ !');
                createBoss();
                bossTriggered = true;
            } else if (areAllWavesCompleted() && !miniBossTriggered && !isMiniBossActive() && !bossTriggered) {
                console.log('🎊 Toutes les vagues terminées ! Déclenchement du mini-boss...');
                createMiniBoss();
                miniBossTriggered = true;
            }
        }
        
        // Dessiner les ennemis - TEMPORAIREMENT DÉSACTIVÉ
        // if (!isIntroActive()) {
        //     drawEnemies();
        // }
        
        // Dessiner les ennemis spéciaux (désactivés pour ce test)
        if (!SPECIAL_ENEMIES_DISABLED_FOR_TEST) {
            drawSpecialEnemies(ctx);
        }
        
        // Dessiner mini-boss / boss (coupés en test strict)
        if (!DISABLE_BOSS_MINIBOSS_FOR_TEST) {
            drawMiniBoss();
            drawBoss();
        }
        
        // Dessiner le vaisseau
        drawPlayer();
        
        // Dessiner les particules d'explosion
        drawExplosionParticles();
        
        // Dessiner les systèmes de bouclier
        drawSimpleShield();        // NOUVEAU: Bouclier simple activé avec ESPACE
        drawSphericalShield(ctx);  // NOUVEAU: Système sphérique v2 (code original)
        drawShield3(ctx);          // NOUVEAU: Bouclier 3 (absorption + riposte)
        // Dessiner les power-ups
        if (!POWERUPS_DISABLED_FOR_TEST) {
            drawPowerShield1(ctx);
            drawPowerShield2(ctx);
            drawPowerShield3(ctx);
        }
        
        // Dessiner les lasers entonnoir (derrière)
        drawFunnelLasers(ctx);
        
        // NOUVEAU: Dessiner le système de failles spatiales - DÉSACTIVÉ
        // drawSpaceRiftSystem(ctx);
        
        // NOUVEAU: Le bouclier géodésique Three.js est rendu automatiquement
        // Pas besoin de le dessiner ici car il est sur un canvas séparé
        
        // NOUVEAU: Dessiner le bouclier géodésique Canvas 2D (fallback si Three.js échoue)
        if (geodesicShield) {
            geodesicShield.draw(ctx);
        }
        
        // NOUVEAU: Dessiner le bouclier doré - DÉSACTIVÉ
        // drawGoldenHoneycombShield(ctx, starship);
        
        // Dessiner les projectiles des ennemis
        drawEnemyBullets();
        // Dessiner les projectiles spéciaux (électrique / glitch)
        drawSpecialBullets(ctx);
        
        // NOUVEAU: Dessiner les power-ups Néon
        drawNeonPowerUpsTest(ctx);
        
        // NOUVEAU: Dessiner les power-ups spéciaux (Santé et IA) - DÉSACTIVÉ
        // drawSpecialPowerUps(ctx);
        
        // NOUVEAU: Dessiner le système d'icônes de pouvoirs
        drawPowerIcons(ctx);
        
        // Dessiner les projectiles (seulement après l'animation d'entrée)
        if (!isIntroActive()) {
            drawBullets();
                    // NOUVEAU: Dessiner les projectiles spéciaux du joueur
        if (playerShootingModule) {
            playerShootingModule.drawPlayerSpecialBullets();
        }
        }
        
        // Dessiner l'affichage des informations sur les ennemis (coupé en test)
        if (!INFO_DISPLAY_DISABLED_FOR_TEST) {
            drawEnemyInfoDisplay();
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
    
    // Arrêter la génération d'ennemis
    stopEnemyGeneration();
    
    // Arrêter le tir des ennemis
    stopEnemyShooting();
}

// Démarrage automatique quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initGame);

// Nettoyage lors de la fermeture de la page
window.addEventListener('beforeunload', stopGame);
