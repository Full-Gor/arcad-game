// effects.js - Génération des flickers, arcs et étincelles

export function generateFlickerPattern() {
    const pattern = [];
    const length = 20 + Math.floor(Math.random() * 40);
    for (let i = 0; i < length; i++) {
        if (Math.random() > 0.3) pattern.push(1);
        else pattern.push(Math.random() > 0.5 ? 0 : 0.5);
    }
    return pattern;
}

export function initializeBorderSegments(powerup) {
    const segmentCount = 16;
    for (let i = 0; i < segmentCount; i++) {
        powerup.borderSegments.push({
            index: i,
            intensity: 1,
            glitching: false,
            glitchTimer: 0,
            offset: Math.random() * 0.2,
            flickerSpeed: 0.05 + Math.random() * 0.1
        });
    }
}

export function createSparks(powerup) {
    const sparkCount = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < sparkCount; i++) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch(side) {
            case 0: x = powerup.x - powerup.width/2 + Math.random() * powerup.width; y = powerup.y - powerup.height/2; break;
            case 1: x = powerup.x + powerup.width/2; y = powerup.y - powerup.height/2 + Math.random() * powerup.height; break;
            case 2: x = powerup.x - powerup.width/2 + Math.random() * powerup.width; y = powerup.y + powerup.height/2; break;
            default: x = powerup.x - powerup.width/2; y = powerup.y - powerup.height/2 + Math.random() * powerup.height; break;
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        powerup.sparks.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            size: 1 + Math.random() * 2,
            life: 20 + Math.random() * 20,
            maxLife: 40,
            trail: [],
            color: Math.random() > 0.5 ? powerup.config.primaryColor : { r: 255, g: 255, b: 255 }
        });
    }
}

export function createElectricArc(powerup) {
    const arc = {
        segments: [],
        life: 10 + Math.random() * 10,
        maxLife: 20,
        intensity: 1
    };
    const segmentCount = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i <= segmentCount; i++) {
        const t = i / segmentCount;
        const offset = (Math.random() - 0.5) * 20 * Math.sin(t * Math.PI);
        arc.segments.push({ x: 0, y: 0, offset });
    }
    powerup.electricArcs.push(arc);
}








