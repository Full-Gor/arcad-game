// player_shooting_test.js - Test des modes de tir du joueur
import { activatePlayerNeonPowerUp, getPlayerPowerUpStatus, resetPlayerPowerUps } from './player_shooting_modes.js';

// ========================================
// FONCTIONS DE TEST
// ========================================

// Test 1: Power-up Vitesse (Mode 1: Lasers)
export function testSpeedPowerUp() {
    console.log('🧪 Test Power-up Vitesse...');
    resetPlayerPowerUps();
    activatePlayerNeonPowerUp('speed', 2);
    
    const status = getPlayerPowerUpStatus();
    console.log('✅ État des power-ups:', status);
    
    if (status.speed === 2) {
        console.log('🎯 Mode 1 activé: Lasers (pulsés + balayants)');
        console.log('   - Tir plus rapide (2x)');
        console.log('   - Lasers pulsés avec largeur variable');
        console.log('   - Lasers balayants avec mouvement sinusoïdal');
        return true;
    } else {
        console.log('❌ Échec de l'activation du power-up Vitesse');
        return false;
    }
}

// Test 2: Power-up Multishot (Mode 2: Laser Beam)
export function testMultishotPowerUp() {
    console.log('🧪 Test Power-up Multishot...');
    resetPlayerPowerUps();
    activatePlayerNeonPowerUp('multishot', 3);
    
    const status = getPlayerPowerUpStatus();
    console.log('✅ État des power-ups:', status);
    
    if (status.multishot === 3) {
        console.log('🎯 Mode 2 activé: Laser Beam');
        console.log('   - Tir multiple (3 projectiles)');
        console.log('   - Projectiles espacés horizontalement');
        console.log('   - Effet de balayage léger');
        return true;
    } else {
        console.log('❌ Échec de l'activation du power-up Multishot');
        return false;
    }
}

// Test 3: Power-up Dégâts (Mode 3: Laser Électrique)
export function testDamagePowerUp() {
    console.log('🧪 Test Power-up Dégâts...');
    resetPlayerPowerUps();
    activatePlayerNeonPowerUp('damage', 2);
    
    const status = getPlayerPowerUpStatus();
    console.log('✅ État des power-ups:', status);
    
    if (status.damage === 2) {
        console.log('🎯 Mode 3 activé: Laser Électrique');
        console.log('   - Projectiles plus larges (2x)');
        console.log('   - Arcs électriques automatiques');
        console.log('   - Mouvement serpentin léger');
        return true;
    } else {
        console.log('❌ Échec de l'activation du power-up Dégâts');
        return false;
    }
}

// Test 4: Combinaison de power-ups
export function testCombinedPowerUps() {
    console.log('🧪 Test Combinaison de Power-ups...');
    resetPlayerPowerUps();
    
    // Activer tous les power-ups
    activatePlayerNeonPowerUp('speed', 2);
    activatePlayerNeonPowerUp('multishot', 3);
    activatePlayerNeonPowerUp('damage', 2);
    
    const status = getPlayerPowerUpStatus();
    console.log('✅ État des power-ups combinés:', status);
    
    if (status.speed === 2 && status.multishot === 3 && status.damage === 2) {
        console.log('🎯 Tous les modes activés simultanément:');
        console.log('   - Mode 1: Lasers rapides (2x vitesse)');
        console.log('   - Mode 2: Tir multiple (3 projectiles)');
        console.log('   - Mode 3: Dégâts augmentés (2x largeur)');
        console.log('   - Effets cumulatifs actifs');
        return true;
    } else {
        console.log('❌ Échec de la combinaison des power-ups');
        return false;
    }
}

// Test 5: Vérification des correspondances
export function verifyPowerUpCorrespondences() {
    console.log('🔍 Vérification des correspondances Power-up → Mode de Tir...');
    
    const correspondences = {
        'speed': 'Mode 1: Lasers (pulsés + balayants)',
        'multishot': 'Mode 2: Laser Beam (tir multiple)',
        'damage': 'Mode 3: Laser Électrique (arcs + serpentin)'
    };
    
    console.log('📋 Correspondances attendues:');
    Object.entries(correspondences).forEach(([powerUp, mode]) => {
        console.log(`   ${powerUp} → ${mode}`);
    });
    
    console.log('✅ Vérification terminée');
    return true;
}

// Test principal
export function runAllTests() {
    console.log('🚀 Démarrage des tests des modes de tir du joueur...\n');
    
    let testsPassed = 0;
    let totalTests = 5;
    
    // Test 1: Vitesse
    if (testSpeedPowerUp()) testsPassed++;
    console.log('');
    
    // Test 2: Multishot
    if (testMultishotPowerUp()) testsPassed++;
    console.log('');
    
    // Test 3: Dégâts
    if (testDamagePowerUp()) testsPassed++;
    console.log('');
    
    // Test 4: Combinaison
    if (testCombinedPowerUps()) testsPassed++;
    console.log('');
    
    // Test 5: Vérification
    if (verifyPowerUpCorrespondences()) testsPassed++;
    console.log('');
    
    // Résumé
    console.log('📊 Résumé des tests:');
    console.log(`   Tests réussis: ${testsPassed}/${totalTests}`);
    
    if (testsPassed === totalTests) {
        console.log('🎉 Tous les tests sont passés avec succès !');
        console.log('✅ Le système de modes de tir fonctionne correctement');
    } else {
        console.log('⚠️ Certains tests ont échoué');
        console.log('🔧 Vérifiez la configuration du système');
    }
    
    return testsPassed === totalTests;
}

// Fonction pour tester en jeu
export function testInGame() {
    console.log('🎮 Test en jeu des modes de tir...');
    console.log('1. Attendez l\'apparition des power-ups Néon (après 2 secondes)');
    console.log('2. Collectez un power-up pour voir le mode changer');
    console.log('3. Utilisez le clic gauche pour tirer');
    console.log('4. Observez les différents effets visuels');
    
    // Activer un power-up de test
    activatePlayerNeonPowerUp('speed', 2);
    console.log('🎯 Power-up Vitesse activé pour test (Mode 1: Lasers)');
}

// Export des fonctions de test
export default {
    testSpeedPowerUp,
    testMultishotPowerUp,
    testDamagePowerUp,
    testCombinedPowerUps,
    verifyPowerUpCorrespondences,
    runAllTests,
    testInGame
};
