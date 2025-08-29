// shield3_geometry.js - Géométrie du bouclier 3

export function initShield3Geometry(absorptionShield3) {
    absorptionShield3.grid.segments = [];
    for (let i = 0; i < absorptionShield3.grid.meridians; i++) {
        for (let j = 0; j < absorptionShield3.grid.parallels; j++) {
            absorptionShield3.grid.segments.push({
                meridian: i,
                parallel: j,
                phi: (i / absorptionShield3.grid.meridians) * Math.PI * 2,
                theta: (j / absorptionShield3.grid.parallels) * Math.PI,
                opacity: 0,
                energyLevel: 0,
                activated: false
            });
        }
    }
}

export function activateShield3Segments(absorptionShield3, phi, theta) {
    // Révélation progressive jusqu'à recouvrir toute la sphère
    const maxDist = 2.8; // rayon de couverture plus large
    absorptionShield3.grid.segments.forEach(segment => {
        const angleDiff = Math.abs(segment.phi - phi);
        const thetaDiff = Math.abs(segment.theta - theta);
        const dist = Math.sqrt(angleDiff * angleDiff + thetaDiff * thetaDiff);
        const influence = Math.max(0, 1 - dist / maxDist);
        if (influence > 0.1) {
            segment.activated = true;
            segment.energyLevel = Math.min(1, segment.energyLevel + influence * 0.4);
            segment.opacity = Math.min(1, segment.opacity + influence * 0.5);
        }
    });
}

export function updateShield3GridRotation(absorptionShield3) {
    // Rotation plus rapide (x2 supplémentaire par rapport à l'étape précédente)
    absorptionShield3.grid.rotation.y += 0.03;
    absorptionShield3.grid.rotation.x = Math.sin(absorptionShield3.time * 0.08) * 0.25;
}

export function drawShield3Grid(ctx, absorptionShield3, centerX, centerY) {
    if (absorptionShield3.visibility <= 0.1) return;
    const segments = absorptionShield3.grid.segments;
    const MAX_PER_FRAME = 160; // budget de rendu par frame
    if (absorptionShield3.grid.drawCursor === undefined) absorptionShield3.grid.drawCursor = 0;
    let drawn = 0;
    let idx = absorptionShield3.grid.drawCursor;
    const n = segments.length;
    while (drawn < MAX_PER_FRAME && drawn < n) {
        const segment = segments[idx];
        idx = (idx + 1) % n;
        if (!segment || segment.opacity <= 0.05) { drawn++; continue; }
        const x3d = absorptionShield3.radius * Math.sin(segment.theta) * Math.cos(segment.phi);
        const y3d = absorptionShield3.radius * Math.cos(segment.theta);
        const z3d = absorptionShield3.radius * Math.sin(segment.theta) * Math.sin(segment.phi);
        const rotY = absorptionShield3.grid.rotation.y;
        const rotX = absorptionShield3.grid.rotation.x;
        const rotatedX = x3d * Math.cos(rotY) - z3d * Math.sin(rotY);
        const rotatedZ = x3d * Math.sin(rotY) + z3d * Math.cos(rotY);
        const rotatedY = y3d * Math.cos(rotX) - rotatedZ * Math.sin(rotX);
        const finalZ = y3d * Math.sin(rotX) + rotatedZ * Math.cos(rotX);
        const perspective = 1 + finalZ / 200;
        const projX = centerX + rotatedX * perspective;
        const projY = centerY + rotatedY * perspective;
        const size = 3 * segment.energyLevel;
        const gradient = ctx.createRadialGradient(projX, projY, 0, projX, projY, size * 2);
        const r = Math.floor(200 + segment.energyLevel * 55);
        const g = 0;
        const b = Math.floor(255 * segment.energyLevel);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${segment.opacity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(projX, projY, size * 2, 0, Math.PI * 2);
        ctx.fill();
        drawn++;
    }
    absorptionShield3.grid.drawCursor = idx;
}


