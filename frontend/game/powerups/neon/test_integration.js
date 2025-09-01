// test_integration.js - Intégration des Power-ups Néon pour test
import { initNeonPowerUps, updateNeonPowerUps, drawNeonPowerUps, spawnNeonPowerUp } from './index.js';
import { canvas } from '../../globals_simple.js';

let neonPowerUpsActive = false;

// Fonction pour activer les power-ups Néon
export function activateNeonPowerUpsTest() {
    if (neonPowerUpsActive) return;
    
    console.log('🎯 Activation des Power-ups Néon pour test...');
    
    // Initialiser le système
    initNeonPowerUps(canvas.width, canvas.height);
    
    // Spawn initial de power-ups
    setTimeout(() => spawnNeonPowerUp('powerup1'), 1000);
    setTimeout(() => spawnNeonPowerUp('powerup2'), 3000);
    setTimeout(() => spawnNeonPowerUp('powerup3'), 5000);
    
    neonPowerUpsActive = true;
    console.log('✅ Power-ups Néon activés !');
}

// Fonction pour désactiver les power-ups Néon
export function deactivateNeonPowerUpsTest() {
    neonPowerUpsActive = false;
    console.log('❌ Power-ups Néon désactivés');
}

// Fonction pour mettre à jour (à appeler dans la boucle de jeu)
export function updateNeonPowerUpsTest(playerX, playerY, playerWidth, playerHeight) {
    if (!neonPowerUpsActive) return;
    updateNeonPowerUps(playerX, playerY, playerWidth, playerHeight);
}

// Fonction pour dessiner (à appeler dans la boucle de rendu)
export function drawNeonPowerUpsTest(ctx) {
    if (!neonPowerUpsActive) return;
    drawNeonPowerUps(ctx);
}

// Fonction pour vérifier si les power-ups sont actifs
export function areNeonPowerUpsActive() {
    return neonPowerUpsActive;
}

// Fonction pour forcer le spawn d'un power-up spécifique
export function forceSpawnNeonPowerUp(type) {
    if (!neonPowerUpsActive) {
        console.log('⚠️ Power-ups Néon non activés. Appelez activateNeonPowerUpsTest() d\'abord.');
        return;
    }
    
    spawnNeonPowerUp(type);
    console.log(`🎯 Power-up Néon forcé: ${type}`);
}
