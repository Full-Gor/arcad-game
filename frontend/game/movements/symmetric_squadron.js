// symmetric_squadron.js - Mouvement d'escadrons symétriques (non attribué)
import { canvas } from '../globals_simple.js';

export function createSymmetricParams(options = {}) {
    const {
        side = 'right', // 'right' | 'left'
        index = 0,
        startY = 50,
        targetX = side === 'right' ? canvas.width * 0.75 : canvas.width * 0.25,
        targetY = canvas.height * 0.3 + (index * 50),
        vx = side === 'right' ? -2 : 2,
        vy = 1
    } = options;
    return {
        side,
        index,
        phase: 'entering', // 'entering' | 'formation' | 'descending'
        targetX,
        targetY,
        vx,
        vy,
        descentTimer: 0,
        canShoot: false,
        rotation: 0,
        glitchIntensity: 0,
        glitchOffset: { x: 0, y: 0 }
    };
}

export function initSymmetricStartPosition(entity, params) {
    entity.width = entity.width || 50;
    entity.height = entity.height || 50;
    if (params.side === 'right') {
        entity.x = canvas.width - 60;
        entity.y = 50 + (params.index * 40);
    } else {
        entity.x = 10;
        entity.y = 50 + (params.index * 40);
    }
}

export function updateSymmetricMovement(entity, params) {
    switch (params.phase) {
        case 'entering':
            entity.x += params.vx;
            entity.y += params.vy;
            if (Math.abs(params.targetX - entity.x) < 5 && Math.abs(params.targetY - entity.y) < 5) {
                params.phase = 'formation';
                params.canShoot = true;
                params.vx = 0;
                params.vy = 0;
                params.descentTimer = Date.now();
            }
            break;
        case 'formation':
            entity.y = params.targetY + Math.sin(Date.now() * 0.002 + params.index) * 5;
            entity.x = params.targetX + Math.cos(Date.now() * 0.0015 + params.index) * 3;
            params.rotation = Math.sin(Date.now() * 0.001) * 0.1;
            // Séparation après tir
            if (entity._separate) {
                params.phase = 'separating';
            }
            if (Date.now() - (params.descentTimer || 0) > 5000) {
                params.phase = 'descending';
                params.vy = 3;
            }
            break;
        case 'separating':
            entity.x += entity._sepVx || 0;
            entity.y += entity._sepVy || 0;
            // ralentir progressivement
            entity._sepVx *= 0.98; entity._sepVy *= 0.98;
            break;
        case 'descending':
            entity.y += params.vy;
            entity.x += Math.sin(Date.now() * 0.003 + params.index) * 2;
            params.glitchIntensity = Math.min(8, (params.glitchIntensity || 0) + 0.1);
            break;
    }
}


