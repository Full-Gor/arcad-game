// power_shield3.js - Power-up pour shield3 (absorption)
import { shieldPowerUps, spawnPowerUpBase, updatePowerUpsBase, drawPowerUpsBase } from './power_shield_common.js';
import { activateShield3 } from './shield3_main.js';
import { deactivateSphericalShield } from './shield2_main.js';
import { deactivateSimpleShield } from './shield_simple.js';

const cfg = {
    id: 'absorption',
    color: { r: 255, g: 0, b: 255 },
    glowColor: '#ff00ff',
    name: 'Absorption Shield',
    gridColor: 'rgba(255, 0, 255, 0.8)',
    coreColor: 'rgba(255, 100, 255, 0.9)'
};

export function spawnPowerShield3() { return spawnPowerUpBase(cfg.id, cfg); }

export function updatePowerShield3(playerRect) {
    updatePowerUpsBase(playerRect, () => {
        try { deactivateSphericalShield(); } catch (_) {}
        try { deactivateSimpleShield(); } catch (_) {}
        activateShield3();
    });
}

export function drawPowerShield3(ctx) {
    drawPowerUpsBase(ctx, drawGrid, () => shieldPowerUps.time);
}

function drawGrid(ctx, p) {
    const radius = p.size; const meridians = 8; const parallels = 6;
    ctx.strokeStyle = p.config.gridColor; ctx.lineWidth = 1; ctx.shadowBlur = 5; ctx.shadowColor = p.config.glowColor;
    for (let i = 0; i < meridians; i++) {
        const angle = (i / meridians) * Math.PI * 2 + p.rotationY;
        ctx.beginPath();
        for (let j = 0; j <= 20; j++) {
            const theta = (j / 20) * Math.PI;
            const x3d = radius * Math.sin(theta) * Math.cos(angle);
            const y3d = radius * Math.cos(theta);
            const z3d = radius * Math.sin(theta) * Math.sin(angle);
            const rotX = p.rotationX; const y2 = y3d * Math.cos(rotX) - z3d * Math.sin(rotX); const z2 = y3d * Math.sin(rotX) + z3d * Math.cos(rotX);
            const perspective = 1 + z2 / 100; const x2d = x3d * perspective; const y2d = y2 * perspective;
            if (z2 > -radius * 0.5) { if (j === 0) ctx.moveTo(x2d, y2d); else ctx.lineTo(x2d, y2d); }
        }
        ctx.stroke();
    }
    for (let i = 1; i < parallels; i++) {
        const theta = (i / parallels) * Math.PI; ctx.beginPath();
        for (let j = 0; j <= 20; j++) {
            const phi = (j / 20) * Math.PI * 2 + p.rotationY;
            const x3d = radius * Math.sin(theta) * Math.cos(phi);
            const y3d = radius * Math.cos(theta);
            const z3d = radius * Math.sin(theta) * Math.sin(phi);
            const rotX = p.rotationX; const y2 = y3d * Math.cos(rotX) - z3d * Math.sin(rotX); const z2 = y3d * Math.sin(rotX) + z3d * Math.cos(rotX);
            const perspective = 1 + z2 / 100; const x2d = x3d * perspective; const y2d = y2 * perspective;
            if (z2 > -radius * 0.5) { if (j === 0) ctx.moveTo(x2d, y2d); else ctx.lineTo(x2d, y2d); }
        }
        ctx.stroke();
    }
}


