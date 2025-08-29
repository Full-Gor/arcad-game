// power_shield2.js - Power-up pour shield2 (sphérique)
import { shieldPowerUps, spawnPowerUpBase, updatePowerUpsBase, drawPowerUpsBase } from './power_shield_common.js';
import { initSphericalShield, revealFullShield, deactivateSphericalShield } from './shield2_main.js';
import { deactivateShield3 } from './shield3_main.js';
import { deactivateSimpleShield } from './shield_simple.js';

const cfg = {
    id: 'spherical',
    color: { r: 100, g: 200, b: 255 },
    glowColor: '#64c8ff',
    name: 'Spherical Shield',
    gridColor: 'rgba(100, 200, 255, 0.8)',
    coreColor: 'rgba(150, 220, 255, 0.9)'
};

export function spawnPowerShield2() { return spawnPowerUpBase(cfg.id, cfg); }

export function updatePowerShield2(playerRect) {
    updatePowerUpsBase(playerRect, () => {
        // Désactiver les autres boucliers
        try { deactivateSimpleShield(); } catch (_) {}
        try { deactivateShield3(); } catch (_) {}
        // Activer shield2
        initSphericalShield(); revealFullShield(180);
    });
}

export function drawPowerShield2(ctx) {
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


