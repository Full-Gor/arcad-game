// config.js - Configuration des Power-ups Néon

export const NEON_TYPES = {
    powerup1: {
        id: 'powerup1',
        name: 'POWER-UP',
        number: '1',
        primaryColor: { r: 255, g: 0, b: 128 },
        secondaryColor: { r: 255, g: 100, b: 200 },
        glowColor: '#ff0080',
        effect: 'speed',
        value: 2
    },
    powerup2: {
        id: 'powerup2',
        name: 'POWER-UP',
        number: '2',
        primaryColor: { r: 0, g: 255, b: 255 },
        secondaryColor: { r: 100, g: 255, b: 255 },
        glowColor: '#00ffff',
        effect: 'multishot',
        value: 3
    },
    powerup3: {
        id: 'powerup3',
        name: 'POWER-UP',
        number: '3',
        primaryColor: { r: 255, g: 0, b: 255 },
        secondaryColor: { r: 200, g: 100, b: 255 },
        glowColor: '#ff00ff',
        effect: 'damage',
        value: 3
    }
};

export const NEON_DEFAULTS = {
    spawnIntervalFrames: 240, // 4s @60fps
    maxPowerups: 3
};



