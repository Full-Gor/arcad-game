// special_enemies_manager.js - Gestionnaire principal des ennemis spéciaux
import { canvas, ctx } from './globals_simple.js';
import { enemies } from './enemies_simple.js';
import { createOrbitingEnemy, updateOrbitingEnemies, drawOrbitingEnemies, updateElectricEffects, drawElectricEffects, clearOrbitingEnemies } from './orbiting_enemies.js';
import { createSymmetricSquadron, createRightSquadron, createLeftSquadron, updateSquadronEnemies, drawSquadronEnemies, clearSquadronEnemies } from './squadron_enemies.js';
import { updateSpecialBullets, drawSpecialBullets, clearSpecialBullets } from './special_bullets.js';

// Variables de gestion
let specialEnemiesActive = false;
let currentSpecialEnemyType = 10; // Commencer par ENEMY11 (type 10) - SEULEMENT 11, 12, 13
let specialEnemySpawnTimer = 0;
let specialEnemySpawnInterval = 500; // 0.5 seconde après destruction pour spawner le suivant

// ========================================
// INITIALISATION
// ========================================

export function initializeSpecialEnemies() {
    console.log('Initialisation des ennemis spéciaux...');
    specialEnemiesActive = false; // Par défaut OFF: activation seulement par branchement explicite
    currentSpecialEnemyType = 10;
    specialEnemySpawnTimer = 0;
    console.log(`Module ennemis spéciaux initialisé - Type initial: ${currentSpecialEnemyType}, Intervalle: ${specialEnemySpawnInterval}ms`);
}

// ========================================
// GESTION PRINCIPALE
// ========================================

export function updateSpecialEnemies(player) {
    if (!specialEnemiesActive) return;
    
    // Mise à jour des ennemis orbitaux
    updateOrbitingEnemies(player);
    
    // Mise à jour des escadrons
    updateSquadronEnemies();
    
    // Mise à jour des projectiles spéciaux
    updateSpecialBullets();
    
    // Mise à jour des effets électriques
    updateElectricEffects();
    
    // Gestion de l'apparition des ennemis spéciaux
    manageSpecialEnemySpawning();
}

export function drawSpecialEnemies(ctx) {
    if (!specialEnemiesActive) return;
    
    // Dessiner les ennemis orbitaux
    drawOrbitingEnemies(ctx);
    
    // Dessiner les escadrons
    drawSquadronEnemies(ctx);
    
    // Dessiner les projectiles spéciaux
    drawSpecialBullets(ctx);
    
    // Dessiner les effets électriques
    drawElectricEffects(ctx);
}

// ========================================
// SYSTÈME D'APPARITION
// ========================================

function manageSpecialEnemySpawning() {
    // Vérifier s'il y a encore des ennemis spéciaux du type actuel
    const currentSpecialEnemiesCount = enemies.filter(e => 
        (currentSpecialEnemyType === 10 && e.type === 10) ||
        (currentSpecialEnemyType === 11 && (e.type === 11 || e.type === 12))
    ).length;
    
    // Seulement spawner le prochain type si le type actuel est terminé
    if (currentSpecialEnemiesCount === 0) {
        specialEnemySpawnTimer += 16; // ~60 FPS
        
        if (specialEnemySpawnTimer >= specialEnemySpawnInterval) {
            console.log(`⏰ Type ${currentSpecialEnemyType} terminé, spawn du prochain type`);
            spawnSpecialEnemy();
            specialEnemySpawnTimer = 0;
        }
    } else {
        // Réinitialiser le timer tant qu'il y a des ennemis du type actuel
        specialEnemySpawnTimer = 0;
    }
}

function spawnSpecialEnemy() {
    switch (currentSpecialEnemyType) {
        case 10: // ENEMY11 - Orbital
            console.log('🎯 Apparition ENEMY11 (Orbital)');
            createOrbitingEnemy();
            break;
            
        case 11: // ENEMY12 - Escadron droit seulement
            console.log('🎯 Apparition ENEMY12 (Escadron droit)');
            createRightSquadron();
            break;
            
        case 12: // ENEMY13 - Escadron gauche seulement
            console.log('🎯 Apparition ENEMY13 (Escadron gauche)');
            createLeftSquadron();
            break;
            
        default:
            console.log('🎯 Type d\'ennemi spécial inconnu:', currentSpecialEnemyType);
            break;
    }
    
    // Passer au type suivant (SEULEMENT 11, 12, 13)
    console.log(`📈 Progression: ${currentSpecialEnemyType} → ${currentSpecialEnemyType + 1}`);
    currentSpecialEnemyType++;
    if (currentSpecialEnemyType > 12) {
        currentSpecialEnemyType = 10; // Recommencer le cycle (11, 12, 13)
        console.log('🔄 Cycle des ennemis spéciaux terminé, redémarrage (11, 12, 13)');
    }
    console.log(`🎯 Prochain type: ${currentSpecialEnemyType}`);
}

// ========================================
// INTÉGRATION AVEC LE SYSTÈME EXISTANT
// ========================================

// Fonction pour vérifier si un ennemi est spécial
export function isSpecialEnemy(enemy) {
    return enemy.type >= 10 && enemy.type <= 12;
}

// Fonction pour obtenir le nombre d'ennemis spéciaux actifs
export function getSpecialEnemiesCount() {
    return enemies.filter(enemy => isSpecialEnemy(enemy)).length;
}

// Fonction pour obtenir les statistiques des ennemis spéciaux
export function getSpecialEnemiesStats() {
    const stats = {
        total: getSpecialEnemiesCount(),
        orbital: enemies.filter(e => e.type === 10).length,
        squadronRight: enemies.filter(e => e.type === 11).length,
        squadronLeft: enemies.filter(e => e.type === 12).length,
        specialBullets: getSpecialBulletsCount()
    };
    
    return stats;
}

// ========================================
// GESTION DES COLLISIONS
// ========================================

// Fonction pour vérifier les collisions avec les ennemis spéciaux
export function checkSpecialEnemyCollisions(player) {
    const specialEnemies = enemies.filter(enemy => isSpecialEnemy(enemy));
    
    for (const enemy of specialEnemies) {
        if (checkCollision(player, enemy)) {
            return {
                enemy: enemy,
                type: getEnemyTypeName(enemy.type),
                damage: getEnemyDamage(enemy.type)
            };
        }
    }
    
    return null;
}

function checkCollision(player, enemy) {
    return player.x < enemy.x + enemy.width &&
           player.x + player.width > enemy.x &&
           player.y < enemy.y + enemy.height &&
           player.y + player.height > enemy.y;
}

function getEnemyTypeName(type) {
    switch (type) {
        case 10: return 'ENEMY11 (Orbital)';
        case 11: return 'ENEMY12 (Escadron droit)';
        case 12: return 'ENEMY13 (Escadron gauche)';
        default: return 'Ennemi spécial inconnu';
    }
}

function getEnemyDamage(type) {
    switch (type) {
        case 10: return 2; // Orbital plus dangereux
        case 11: return 1; // Escadron normal
        case 12: return 1; // Escadron normal
        default: return 1;
    }
}

// ========================================
// FONCTIONS DE NETTOYAGE
// ========================================

export function clearAllSpecialEnemies() {
    console.log('🧹 Nettoyage de tous les ennemis spéciaux...');
    
    // Supprimer les ennemis spéciaux du tableau principal
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (isSpecialEnemy(enemies[i])) {
            enemies.splice(i, 1);
        }
    }
    
    // Nettoyer les modules spécifiques
    clearOrbitingEnemies();
    clearSquadronEnemies();
    clearSpecialBullets();
    
    console.log('✅ Nettoyage terminé');
}

export function deactivateSpecialEnemies() {
    specialEnemiesActive = false;
    clearAllSpecialEnemies();
    console.log('Ennemis spéciaux désactivés');
}

export function activateSpecialEnemies() {
    specialEnemiesActive = true;
    console.log('Ennemis spéciaux activés');
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

export function getSpecialBulletsCount() {
    // Cette fonction sera implémentée dans special_bullets.js
    return 0; // Placeholder
}

export function isSpecialEnemiesActive() {
    return specialEnemiesActive;
}

export function getCurrentSpecialEnemyType() {
    return currentSpecialEnemyType;
}

export function setSpecialEnemySpawnInterval(interval) {
    specialEnemySpawnInterval = interval;
    console.log(`Intervalle d'apparition des ennemis spéciaux: ${interval}ms`);
}
