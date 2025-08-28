// enemies_simple.js - Gestion des ennemis de façon modulaire
import { canvas, ctx } from './globals_simple.js';
import { isIntroActive } from './player_simple.js';
import { showEnemyInfo } from './enemy_info_display.js';

// Variable globale pour vérifier si le boss est actif
let bossIsActive = false;

// Fonction pour définir l'état du boss (appelée depuis boss_simple.js)
export function setBossActive(active) {
    bossIsActive = active;
    console.log(`Boss state changed: ${active ? 'ACTIF' : 'INACTIF'}`);
}

// Variables pour les ennemis
export let enemies = [];
let enemyImgs = [];
let enemyGenerationInterval = null;

// Variables de configuration (copiées de game.html + difficulté)
let enemySpeedMultiplier = 1;
const maxEnemies = 30;
const enemySpawnCount = 5; // Apparition par vague de 5 comme dans le stage 3

// NOUVEAU: Variables de difficulté (intégrées depuis option.html)
let difficultySettings = {
    enemySpeed: 1,
    enemyBulletSpeed: 3,
    powerUpFrequency: 5,
    livesFrequency: 5
};

// Variables pour la progression séquentielle des ennemis (MODE TEST: tous les types)
let currentEnemyType = 0; // MODE TEST: Commencer par enemy1 (type 0)
let enemiesKilledOfCurrentType = 0; // Compteur d'ennemis tués du type actuel
const ENEMIES_PER_TYPE = 1; // MODE TEST: 1 ennemi de chaque type pour tester TRÈS rapidement
let allWavesCompleted = false; // Flag pour savoir si toutes les vagues sont terminées
const MAX_ENEMY_TYPE = 8; // MODE TEST: Aller jusqu'à enemy9 (type 8)

// Variables pour la phase post-mini-boss
let postMiniBossPhase = false; // Phase après destruction du mini-boss
let totalEnemiesKilledPostMiniBoss = 0; // Compteur total d'ennemis tués après mini-boss
const MAX_RANDOM_ENEMIES = 15; // Maximum 15 ennemis aléatoires simultanés
const MINIBOSS_RESPAWN_INTERVAL = 30; // CORRECTION: Mini-boss tous les 30 ennemis (pas 20)
const BOSS_SPAWN_THRESHOLD = 100; // Boss après 100 ennemis

// Initialiser les images des ennemis (copiée de game.html)
export function initializeEnemies() {
    console.log('Initialisation des ennemis...');
    
    // NOUVEAU: Charger la difficulté depuis localStorage
    loadDifficultySettings();
    
    // MODE TEST: Charger les images des ennemis avec mapping correct
    for (let i = 0; i < 9; i++) {
        enemyImgs[i] = new Image();
        if (i < 6) {
            // Types 0-5 = ENEMY1-6 (images existantes)
            enemyImgs[i].src = `/img/enemy${i + 1}.jpg`;
            console.log(`🎯 Type ${i} (ENEMY${i + 1}) → enemy${i + 1}.jpg`);
        } else {
            // Types 6-8 = ENEMY7-9 (images de substitution)
            const substituteImages = ['enemy4.jpg', 'enemy5.jpg', 'enemy6.jpg'];  // Utiliser 4,5,6 pour différencier
            enemyImgs[i].src = `/img/${substituteImages[i - 6]}`;
            console.log(`🎯 Type ${i} (ENEMY${i + 1}) → ${substituteImages[i - 6]} (substitut)`);
        }
    }
    
    console.log('Module enemies initialisé avec difficulté:', difficultySettings);
}

// NOUVEAU: Fonction pour charger les paramètres de difficulté
function loadDifficultySettings() {
    const savedDifficulty = localStorage.getItem('gameDifficulty') || 'medium';
    
    // Valeurs de difficulté (copiées de option.html)
    const difficultyValues = {
        'easy': {
            enemySpeed: 0.7,
            enemyBulletSpeed: 2,
            powerUpFrequency: 3,
            livesFrequency: 3
        },
        'medium': {
            enemySpeed: 1,
            enemyBulletSpeed: 3,
            powerUpFrequency: 5,
            livesFrequency: 5
        },
        'hard': {
            enemySpeed: 1.5,
            enemyBulletSpeed: 4,
            powerUpFrequency: 8,
            livesFrequency: 8
        },
        'master': {
            enemySpeed: 2,
            enemyBulletSpeed: 5,
            powerUpFrequency: 12,
            livesFrequency: 15
        }
    };
    
    difficultySettings = difficultyValues[savedDifficulty];
    enemySpeedMultiplier = difficultySettings.enemySpeed;
    
    console.log(`🎯 Difficulté chargée: ${savedDifficulty.toUpperCase()}`);
}

// Démarrer la génération automatique d'ennemis (copiée de game.html ligne 5726)
export function startEnemyGeneration() {
    if (enemyGenerationInterval) return; // Éviter les doublons
    
    // Afficher les informations du premier type d'ennemi
    showEnemyInfo(currentEnemyType);
    
    // Générer des ennemis toutes les 2 secondes comme dans l'original
    enemyGenerationInterval = setInterval(() => {
        if (!isIntroActive()) {
            generateEnemies();
        }
    }, 2000);
    
    console.log('Génération automatique des ennemis démarrée (toutes les 2s)');
}

// Arrêter la génération automatique
export function stopEnemyGeneration() {
    if (enemyGenerationInterval) {
        clearInterval(enemyGenerationInterval);
        enemyGenerationInterval = null;
        console.log('Génération automatique des ennemis arrêtée');
    }
}

// Fonction pour créer un ennemi depuis les bords de l'écran
function createEnemyFromEdges() {
    if (!canvas) return null;
    
    const enemy = {
        width: 60,
        height: 60,
        type: currentEnemyType, // Progression séquentielle : enemy1, puis enemy2, etc.
        vx: 0,
        vy: 0,
        x: 0,
        y: 0
    };
    
    // Choisir aléatoirement d'où l'ennemi apparaît
    const spawnSide = Math.random();
    
    if (spawnSide < 0.5) {
        // Apparition depuis le haut de l'écran (50% de chance)
        enemy.x = Math.random() * (canvas.width - enemy.width);
        enemy.y = -enemy.height; // Juste au-dessus de l'écran
        enemy.vx = (Math.random() * 2 - 1) * 1 * enemySpeedMultiplier; // Mouvement horizontal léger
        enemy.vy = (Math.random() * 1.5 + 0.5) * enemySpeedMultiplier; // Descente vers le bas
    } else if (spawnSide < 0.75) {
        // Apparition depuis le côté gauche (25% de chance)
        enemy.x = -enemy.width; // Juste à gauche de l'écran
        enemy.y = Math.random() * (canvas.height / 2); // Partie supérieure
        enemy.vx = (Math.random() * 1.5 + 0.5) * enemySpeedMultiplier; // Mouvement vers la droite
        enemy.vy = (Math.random() * 2 - 1) * 1 * enemySpeedMultiplier; // Mouvement vertical léger
    } else {
        // Apparition depuis le côté droit (25% de chance)
        enemy.x = canvas.width; // Juste à droite de l'écran
        enemy.y = Math.random() * (canvas.height / 2); // Partie supérieure
        enemy.vx = -(Math.random() * 1.5 + 0.5) * enemySpeedMultiplier; // Mouvement vers la gauche
        enemy.vy = (Math.random() * 2 - 1) * 1 * enemySpeedMultiplier; // Mouvement vertical léger
    }
    
    return enemy;
}

// Ancienne fonction pour référence (non utilisée)
function createEnemy() {
    if (!canvas) return null;
    
    return {
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height / 3),
        width: 60,
        height: 60,
        vx: (Math.random() * 2 - 1) * 2 * enemySpeedMultiplier,
        vy: Math.random() * 1.5 * enemySpeedMultiplier,
        type: Math.floor(Math.random() * 6) // 6 types d'ennemis (0-5)
    };
}

// Fonction principale de génération des ennemis (copiée de game.html ligne 843-868)
export function generateEnemies() {
    // Pas d'ennemis pendant l'animation d'entrée
    if (isIntroActive()) return;
    
    // CORRECTION: Pas d'ennemis si le boss principal est actif
    if (bossIsActive) {
        console.log('Boss principal actif, pas de génération d\'ennemis');
        return;
    }
    
    // NOUVEAU: Phase post-mini-boss - ennemis aléatoires
    if (postMiniBossPhase) {
        generateRandomEnemies();
        return;
    }
    
    // MODE TEST: Désactivé pour permettre le cycle continu de tous les types
    // if (allWavesCompleted) {
    //     console.log('Toutes les vagues terminées, plus de génération d\'ennemis normaux');
    //     return;
    // }
    
    // NOUVEAU: Vérifier s'il reste des ennemis du type actuel à générer
    const currentTypeEnemiesOnScreen = enemies.filter(enemy => enemy.type === currentEnemyType).length;
    const currentTypeEnemiesRemaining = ENEMIES_PER_TYPE - enemiesKilledOfCurrentType;
    const maxCurrentTypeOnScreen = Math.min(currentTypeEnemiesRemaining, 5); // Maximum 5 à l'écran
    
    // Si on a déjà assez d'ennemis du type actuel à l'écran, ne pas en générer plus
    if (currentTypeEnemiesOnScreen >= maxCurrentTypeOnScreen) {
        console.log(`Pas de génération : ${currentTypeEnemiesOnScreen} enemy${currentEnemyType + 1} à l'écran (max: ${maxCurrentTypeOnScreen})`);
        return;
    }
    
    // CORRECTION: Limiter strictement le nombre total d'ennemis à l'écran
    if (enemies.length >= maxEnemies) {
        return; // Ne pas générer si on a déjà 30 ennemis
    }
    
    // CORRECTION: Calculer combien d'ennemis ajouter du type actuel uniquement
    const neededEnemies = maxCurrentTypeOnScreen - currentTypeEnemiesOnScreen;
    const count = Math.min(neededEnemies, maxEnemies - enemies.length, enemySpawnCount);
    
    // Ne générer que s'il y a vraiment besoin
    if (count <= 0) return;
    
    console.log(`Génération de ${count} enemy${currentEnemyType + 1} (${currentTypeEnemiesOnScreen} déjà à l'écran, ${enemiesKilledOfCurrentType}/${ENEMIES_PER_TYPE} tués)`);
    
    // Créer les nouveaux ennemis du type actuel uniquement
    for (let i = 0; i < count; i++) {
        const enemy = createEnemyFromEdges(); // CORRECTION: Apparition depuis les bords
        if (enemy) {
            enemies.push(enemy);
        }
    }
}

// Fonction pour mettre à jour les ennemis
export function updateEnemies() {
    if (!canvas) return;
    
    // Mettre à jour la position de chaque ennemi
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Déplacer l'ennemi
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        
        // CORRECTION: Supprimer les ennemis qui sortent complètement de l'écran par n'importe quel côté
        if (enemy.y > canvas.height + enemy.height ||  // Sort par le bas
            enemy.y < -enemy.height ||                  // Sort par le haut
            enemy.x > canvas.width + enemy.width ||     // Sort par la droite
            enemy.x < -enemy.width) {                   // Sort par la gauche
            enemies.splice(i, 1);
            console.log('Ennemi supprimé (sorti de l\'écran). Ennemis restants:', enemies.length);
        }
    }
}

// Fonction pour dessiner les ennemis
export function drawEnemies() {
    if (!ctx) return;
    
    // Dessiner chaque ennemi
    enemies.forEach(enemy => {
        // Vérifier que l'image est chargée
        if (enemyImgs[enemy.type] && enemyImgs[enemy.type].complete) {
            ctx.drawImage(
                enemyImgs[enemy.type], 
                enemy.x, 
                enemy.y, 
                enemy.width, 
                enemy.height
            );
        } else {
            // Fallback: dessiner un rectangle coloré si l'image n'est pas chargée
            ctx.save();
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            ctx.restore();
        }
    });
}

// Fonction pour obtenir le nombre d'ennemis
export function getEnemyCount() {
    return enemies.length;
}

// Fonction pour vider tous les ennemis
export function clearEnemies() {
    enemies = [];
}

// Fonction pour faire progresser le type d'ennemi (appelée quand un ennemi est tué)
// CORRECTION: Progression après 5 ennemis du type actuel tués
export function progressEnemyType() {
    enemiesKilledOfCurrentType++;
    
    console.log(`Enemy${currentEnemyType + 1} tué ! Compteur: ${enemiesKilledOfCurrentType}/${ENEMIES_PER_TYPE}`);
    
    // MODE TEST: Progression après 2 ennemis du type actuel tués, passer au type suivant
    if (enemiesKilledOfCurrentType >= ENEMIES_PER_TYPE) {
        // Réinitialiser le compteur pour le nouveau type
        enemiesKilledOfCurrentType = 0;
        
        // MODE TEST: Passer au type suivant (1 → 2 → 3 → ... → 9)
        currentEnemyType++;
        
        // MODE TEST: Si on dépasse enemy9, recommencer à enemy1
        if (currentEnemyType > MAX_ENEMY_TYPE) {
            currentEnemyType = 0; // Recommencer à enemy1
            console.log(`🔄 CYCLE COMPLET ! Redémarrage à enemy1 pour continuer le test`);
            // Déclencher l'affichage des informations pour le redémarrage
            showEnemyInfo(currentEnemyType);
        } else {
            console.log(`🎯 PROGRESSION TEST ! Maintenant : enemy${currentEnemyType + 1}.jpg`);
            // Déclencher l'affichage des informations pour le nouveau type
            showEnemyInfo(currentEnemyType);
        }
    }
}

// Fonction pour obtenir le type d'ennemi actuel
export function getCurrentEnemyType() {
    return currentEnemyType;
}

// Fonction pour obtenir le nombre d'ennemis tués du type actuel
export function getEnemiesKilledOfCurrentType() {
    return enemiesKilledOfCurrentType;
}

// Fonction pour obtenir le nombre d'ennemis requis par type
export function getEnemiesPerType() {
    return ENEMIES_PER_TYPE;
}

// Fonction pour vérifier si toutes les vagues d'ennemis sont terminées
export function areAllWavesCompleted() {
    return allWavesCompleted;
}

// Fonction pour générer des ennemis aléatoires (phase post-mini-boss)
function generateRandomEnemies() {
    // Maintenir maximum 15 ennemis à l'écran
    if (enemies.length >= MAX_RANDOM_ENEMIES) {
        return;
    }
    
    // Générer 1-3 ennemis aléatoires à la fois
    const count = Math.min(
        Math.floor(Math.random() * 3) + 1, // 1 à 3 ennemis
        MAX_RANDOM_ENEMIES - enemies.length
    );
    
    for (let i = 0; i < count; i++) {
        const enemy = createEnemyFromEdges();
        if (enemy) {
            // Type complètement aléatoire (0-5 pour enemy1-6)
            enemy.type = Math.floor(Math.random() * 6);
            enemies.push(enemy);
        }
    }
    
    console.log(`Génération aléatoire : ${count} ennemis (${enemies.length}/${MAX_RANDOM_ENEMIES})`);
}

// Fonction pour activer la phase post-mini-boss
export function activatePostMiniBossPhase() {
    postMiniBossPhase = true;
    totalEnemiesKilledPostMiniBoss = 0;
    console.log('🎯 Phase post-mini-boss activée ! Ennemis aléatoires (max 15)');
}

// Fonction pour incrémenter le compteur post-mini-boss et vérifier les seuils
export function incrementPostMiniBossKills() {
    if (!postMiniBossPhase) return { shouldSpawnMiniBoss: false, shouldSpawnBoss: false };
    
    totalEnemiesKilledPostMiniBoss++;
    console.log(`Ennemis tués post-mini-boss: ${totalEnemiesKilledPostMiniBoss}`);
    
    // Vérifier si il faut spawner le boss (priorité sur mini-boss)
    if (totalEnemiesKilledPostMiniBoss >= BOSS_SPAWN_THRESHOLD) {
        console.log('🔥 100 ennemis tués ! Boss doit apparaître !');
        return { shouldSpawnMiniBoss: false, shouldSpawnBoss: true };
    }
    
    // Vérifier si il faut respawner un mini-boss
    if (totalEnemiesKilledPostMiniBoss % MINIBOSS_RESPAWN_INTERVAL === 0) {
        console.log('⚡ 30 ennemis tués ! Mini-boss doit réapparaître !');
        return { shouldSpawnMiniBoss: true, shouldSpawnBoss: false };
    }
    
    return { shouldSpawnMiniBoss: false, shouldSpawnBoss: false };
}

// Fonction pour obtenir les stats post-mini-boss
export function getPostMiniBossStats() {
    return {
        isActive: postMiniBossPhase,
        enemiesKilled: totalEnemiesKilledPostMiniBoss,
        nextMiniBossIn: MINIBOSS_RESPAWN_INTERVAL - (totalEnemiesKilledPostMiniBoss % MINIBOSS_RESPAWN_INTERVAL),
        bossIn: BOSS_SPAWN_THRESHOLD - totalEnemiesKilledPostMiniBoss
    };
}

// Fonction pour réinitialiser les vagues (utile pour restart)
export function resetWaves() {
    currentEnemyType = 5;
    enemiesKilledOfCurrentType = 0;
    allWavesCompleted = false;
    postMiniBossPhase = false;
    totalEnemiesKilledPostMiniBoss = 0;
    console.log('Vagues réinitialisées : recommence à enemy6');
}
