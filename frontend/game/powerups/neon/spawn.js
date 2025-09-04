// spawn.js - Création et initialisation des Power-ups Néon
import { neonState } from './state.js';
import { NEON_TYPES } from './config.js';
import { generateFlickerPattern, initializeBorderSegments } from './effects.js';

export function initNeonPowerUps(canvasWidth, canvasHeight) {
    neonState.canvasWidth = canvasWidth;
    neonState.canvasHeight = canvasHeight;
    neonState.powerups = [];
}

export function spawnNeonPowerUp(typeId = null) {
    const types = Object.keys(NEON_TYPES);
    if (!typeId) typeId = types[Math.floor(Math.random() * types.length)];
    const type = NEON_TYPES[typeId];

    const x = 100 + Math.random() * (neonState.canvasWidth - 200);
    const y = -80;

    const powerup = {
        id: Date.now() + Math.random(),
        type: typeId,
        config: type,
        x, y,
        width: 120,
        height: 60,
        vx: (Math.random() - 0.5) * 1,
        vy: 0.5 + Math.random() * 0.5,
        rotation: (Math.random() - 0.5) * 0.1,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
        floatOffset: Math.random() * Math.PI * 2,
        flickerState: 1,
        flickerTimer: 0,
        flickerPattern: generateFlickerPattern(),
        currentFlickerIndex: 0,
        glitchIntensity: 0,
        sparks: [],
        nextSparkTime: 30 + Math.random() * 60,
        borderSegments: [],
        borderGlitch: false,
        collected: false,
        opacity: 1,
        scale: 1,
        electricArcs: [],
        arcTimer: 0
    };

    initializeBorderSegments(powerup);
    neonState.powerups.push(powerup);
    return powerup;
}








