// index.js - API publique des Power-ups Néon (aucun branchement automatique)
export { NEON_TYPES, NEON_DEFAULTS } from './config.js';
export { neonState, resetNeonState } from './state.js';
export { initNeonPowerUps, spawnNeonPowerUp } from './spawn.js';
export { updateNeonPowerUps } from './update.js';
export { drawNeonPowerUps } from './draw.js';

// Fonctions de test et d'intégration
export { 
    activateNeonPowerUpsTest, 
    deactivateNeonPowerUpsTest, 
    updateNeonPowerUpsTest, 
    drawNeonPowerUpsTest, 
    areNeonPowerUpsActive, 
    forceSpawnNeonPowerUp 
} from './test_integration.js';


