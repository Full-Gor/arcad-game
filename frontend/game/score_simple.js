// score_simple.js - Gestion du comptage des ennemis abattus de façon modulaire

// Variables pour le comptage (copiées de game.html)
let enemiesKilled = 0;
let killsWithoutDeath = 0;
let simultaneousKills = 0;
let lastKillTime = 0;
let enemiesDestroyedWithoutHit = 0;

// NOUVEAU: Compteur global pour le boss
let totalEnemiesKilledGlobal = 0;
const BOSS_SPAWN_GLOBAL_THRESHOLD = 100;

// Fonction principale de gestion des kills (copiée de game.html ligne 3326-3380)
export function handleKill(playerNumber = 1) {
    lastKillTime = Date.now();
    simultaneousKills++;
    enemiesKilled++;
    killsWithoutDeath++;
    
    // NOUVEAU: Incrémenter le compteur global
    totalEnemiesKilledGlobal++;
    console.log(`📊 Total ennemis tués: ${totalEnemiesKilledGlobal}/${BOSS_SPAWN_GLOBAL_THRESHOLD}`);
    
    // Mettre à jour l'affichage (copiée de game.html ligne 3331)
    updateEnemiesKilledDisplay();
    
    // Incrémenter le compteur d'ennemis détruits sans être touché
    enemiesDestroyedWithoutHit++;
    
    // Si 10 ennemis ont été détruits sans être touché, créer une étoile
    if (enemiesDestroyedWithoutHit >= 10) {
        // createStar(); // À implémenter plus tard si nécessaire
        console.log('10 ennemis détruits sans être touché ! Étoile à créer.');
        enemiesDestroyedWithoutHit = 0; // Réinitialiser
    }
    
    // Logique de progression selon le stage (copiée de game.html ligne 3342-3380)
    // Stage 1 uniquement pour le moment
    if (enemiesKilled === 200) {
        console.log('200 ennemis tués ! Boss à créer.');
        // createBoss(); // À implémenter plus tard
    }
    else if (enemiesKilled % 30 === 0) {
        console.log(`${enemiesKilled} ennemis tués ! Mini-boss à créer.`);
        // createMiniBoss(); // À implémenter plus tard
    }
    
    console.log(`Ennemi abattu ! Total: ${enemiesKilled}, Sans mort: ${killsWithoutDeath}, Sans touche: ${enemiesDestroyedWithoutHit}`);
}

// Fonction pour mettre à jour l'affichage du compteur (copiée de game.html ligne 3331)
function updateEnemiesKilledDisplay() {
    const enemiesKilledElement = document.getElementById("enemiesKilledCount");
    if (enemiesKilledElement) {
        enemiesKilledElement.innerText = enemiesKilled;
    } else {
        console.warn('Élément enemiesKilledCount non trouvé dans le DOM');
    }
}

// Fonction pour obtenir le nombre d'ennemis tués
export function getEnemiesKilled() {
    return enemiesKilled;
}

// Fonction pour obtenir les kills sans mort
export function getKillsWithoutDeath() {
    return killsWithoutDeath;
}

// Fonction pour obtenir les kills simultanés
export function getSimultaneousKills() {
    return simultaneousKills;
}

// Fonction pour obtenir le nombre d'ennemis détruits sans être touché
export function getEnemiesDestroyedWithoutHit() {
    return enemiesDestroyedWithoutHit;
}

// Fonction pour réinitialiser les compteurs (utile pour restart)
export function resetScoreCounters() {
    enemiesKilled = 0;
    killsWithoutDeath = 0;
    simultaneousKills = 0;
    lastKillTime = 0;
    enemiesDestroyedWithoutHit = 0;
    
    updateEnemiesKilledDisplay();
    console.log('Compteurs de score réinitialisés');
}

// NOUVEAU: Fonction pour vérifier si le boss doit apparaître
export function shouldSpawnBossGlobal() {
    if (totalEnemiesKilledGlobal >= BOSS_SPAWN_GLOBAL_THRESHOLD) {
        console.log(`🔥 ${totalEnemiesKilledGlobal} ennemis tués ! Boss doit apparaître !`);
        return true;
    }
    return false;
}

// NOUVEAU: Fonction pour obtenir le compteur global
export function getTotalEnemiesKilledGlobal() {
    return totalEnemiesKilledGlobal;
}

// NOUVEAU: Fonction pour réinitialiser le compteur global
export function resetGlobalKillCounter() {
    totalEnemiesKilledGlobal = 0;
    console.log('Compteur global d\'ennemis réinitialisé');
}

// Fonction pour ajouter des points bonus (copiée des fonctions de boss)
export function addBonusKills(bonusAmount) {
    enemiesKilled += bonusAmount;
    updateEnemiesKilledDisplay();
    console.log(`Bonus de ${bonusAmount} ennemis ajouté ! Total: ${enemiesKilled}`);
}

// Fonction pour initialiser l'affichage du score
export function initializeScore() {
    updateEnemiesKilledDisplay();
    console.log('Module score initialisé');
}
