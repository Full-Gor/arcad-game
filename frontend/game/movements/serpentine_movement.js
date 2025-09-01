// serpentine_movement.js - Mouvement serpentin générique et circulaire (sans attribution)
import { canvas } from '../globals_simple.js';

export function createSerpentineParams(options = {}) {
    const {
        baseX = canvas.width * 0.5,
        baseY = 100,
        waveAmplitude = 100,
        waveFrequency = 0.02,
        wavePhase = 0,
        vy = 1.2,
        circle = false,
        maxCircleRadius = 80,
        circleSpeed = 0.05
    } = options;
    return {
        baseX,
        baseY,
        waveAmplitude,
        waveFrequency,
        wavePhase,
        vy,
        // cercle
        isCircling: circle,
        circleCenter: { x: baseX, y: baseY },
        circlePhase: 0,
        circleRadius: 0,
        maxCircleRadius,
        circleSpeed,
        phase: circle ? 'circling' : 'serpentine',
        glowIntensity: 5
    };
}

export function updateSerpentineMovement(entity, params) {
    params.wavePhase += params.waveFrequency;
    entity.x = params.baseX + Math.sin(params.wavePhase) * params.waveAmplitude;
    entity.y = params.baseY;
    // descente lente de la base
    params.baseY += params.vy * 0.3;
}

export function updateCircularMovement(entity, params) {
    params.circlePhase += params.circleSpeed;
    if (params.circleRadius < params.maxCircleRadius) params.circleRadius += 2;
    entity.x = params.circleCenter.x + Math.cos(params.circlePhase) * params.circleRadius;
    entity.y = params.circleCenter.y + Math.sin(params.circlePhase) * params.circleRadius;
    // après 2 tours, retour serpentin
    if (params.circlePhase > Math.PI * 4) {
        params.phase = 'serpentine';
        params.isCircling = false;
        params.circleRadius = 0;
        params.baseX = entity.x;
        params.baseY = entity.y;
        params.glowIntensity = 5;
    }
}

export function updateSerpentineState(entity, params) {
    if (params.phase === 'serpentine') {
        updateSerpentineMovement(entity, params);
        // déclenchement optionnel du cercle
        if (Math.random() < 0.002 && !params.isCircling) {
            params.phase = 'circling';
            params.isCircling = true;
            params.circleCenter = { x: entity.x, y: entity.y };
            params.circlePhase = 0;
            params.glowIntensity = 20;
        }
    } else if (params.phase === 'circling') {
        updateCircularMovement(entity, params);
    }
}



