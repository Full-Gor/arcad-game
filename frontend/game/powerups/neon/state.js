// state.js - État global du système de Power-ups Néon

export const neonState = {
    powerups: [],
    spawnTimer: 0,
    spawnInterval: 240,
    maxPowerups: 3,
    canvasWidth: 0,
    canvasHeight: 0,
    time: 0,
    glitchTimer: 0
};

export function resetNeonState() {
    neonState.powerups = [];
    neonState.spawnTimer = 0;
    neonState.time = 0;
    neonState.glitchTimer = 0;
}



