// power_shield_common.js - Base commune des power-ups de bouclier

export const shieldPowerUps = {
    powerups: [],
    spawnTimer: 0,
    spawnInterval: 300,  // ~5s à 60fps
    maxPowerups: 3,
    canvasWidth: 0,
    canvasHeight: 0,
    time: 0,
};

export function initPowerUpSystem(canvasWidth, canvasHeight) {
    shieldPowerUps.canvasWidth = canvasWidth;
    shieldPowerUps.canvasHeight = canvasHeight;
    shieldPowerUps.powerups = [];
}

export function spawnPowerUpBase(typeId, config) {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    switch(edge) {
        case 0: x = Math.random() * shieldPowerUps.canvasWidth; y = -50; break;
        case 1: x = shieldPowerUps.canvasWidth + 50; y = Math.random() * shieldPowerUps.canvasHeight; break;
        case 2: x = Math.random() * shieldPowerUps.canvasWidth; y = shieldPowerUps.canvasHeight + 50; break;
        case 3: x = -50; y = Math.random() * shieldPowerUps.canvasHeight; break;
    }
    const p = {
        id: Date.now() + Math.random(),
        type: typeId,
        config,
        x, y,
        size: 30,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        targetX: Math.random() * shieldPowerUps.canvasWidth,
        targetY: Math.random() * shieldPowerUps.canvasHeight,
        moveSpeed: 0.02,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: 0.05,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        rotSpeedX: 0.02 + Math.random() * 0.02,
        rotSpeedY: 0.03 + Math.random() * 0.02,
        rotSpeedZ: 0.01 + Math.random() * 0.01,
        pulse: 0,
        pulseSpeed: 0.05 + Math.random() * 0.03,
        opacity: 1,
        collected: false,
        orbitalParticles: [],
        gridSegments: { meridians: 8, parallels: 6 },
    };
    for (let i = 0; i < 6; i++) {
        p.orbitalParticles.push({
            angle: (i / 6) * Math.PI * 2,
            distance: 20 + Math.random() * 10,
            size: 1 + Math.random() * 2,
            speed: 0.02 + Math.random() * 0.03,
            height: (Math.random() - 0.5) * 20
        });
    }
    shieldPowerUps.powerups.push(p);
    return p;
}

export function updatePowerUpsBase(playerRect, onPickup) {
    shieldPowerUps.time++;
    shieldPowerUps.spawnTimer++;
    shieldPowerUps.powerups = shieldPowerUps.powerups.filter(p => {
        if (p.collected) {
            p.opacity -= 0.05;
            p.size *= 1.1;
            return p.opacity > 0;
        }
        p.wanderAngle += (Math.random() - 0.5) * p.wanderSpeed;
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 50) {
            p.targetX = 50 + Math.random() * (shieldPowerUps.canvasWidth - 100);
            p.targetY = 50 + Math.random() * (shieldPowerUps.canvasHeight - 100);
        }
        const targetAngle = Math.atan2(dy, dx);
        const moveAngle = targetAngle + Math.sin(p.wanderAngle) * 0.5;
        p.vx += Math.cos(moveAngle) * p.moveSpeed;
        p.vy += Math.sin(moveAngle) * p.moveSpeed;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 3) { p.vx = (p.vx / speed) * 3; p.vy = (p.vy / speed) * 3; }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > shieldPowerUps.canvasWidth) { p.vx *= -1; p.x = Math.max(0, Math.min(shieldPowerUps.canvasWidth, p.x)); }
        if (p.y < 0 || p.y > shieldPowerUps.canvasHeight) { p.vy *= -1; p.y = Math.max(0, Math.min(shieldPowerUps.canvasHeight, p.y)); }
        p.rotationX += p.rotSpeedX; p.rotationY += p.rotSpeedY; p.rotationZ += p.rotSpeedZ;
        p.pulse += p.pulseSpeed;
        p.orbitalParticles.forEach(op => { op.angle += op.speed; });
        const playerCenterX = playerRect.x + playerRect.width / 2;
        const playerCenterY = playerRect.y + playerRect.height / 2;
        const distToPlayer = Math.hypot(p.x - playerCenterX, p.y - playerCenterY);
        if (distToPlayer < p.size + 20) { p.collected = true; onPickup(p); }
        return true;
    });
}

export function drawPowerUpsBase(ctx, drawGrid, getTime) {
    shieldPowerUps.powerups.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.collected) { ctx.globalAlpha = p.opacity; const s = 1 + (1 - p.opacity) * 2; ctx.scale(s, s); }
        const ps = 1 + Math.sin(p.pulse) * 0.1; ctx.scale(ps, ps);
        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
        halo.addColorStop(0, `rgba(${p.config.color.r}, ${p.config.color.g}, ${p.config.color.b}, 0.3)`);
        halo.addColorStop(0.5, `rgba(${p.config.color.r}, ${p.config.color.g}, ${p.config.color.b}, 0.1)`);
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2); ctx.fill();
        drawGrid(ctx, p);
        const core = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.4);
        core.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        core.addColorStop(0.5, p.config.coreColor);
        core.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2); ctx.fill();
        p.orbitalParticles.forEach(op => {
            const x = Math.cos(op.angle) * op.distance;
            const y = Math.sin(op.angle) * op.distance * 0.5 + op.height * 0.3;
            ctx.fillStyle = `rgba(${p.config.color.r}, ${p.config.color.g}, ${p.config.color.b}, 0.8)`;
            ctx.beginPath(); ctx.arc(x, y, op.size, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = `rgba(${p.config.color.r}, ${p.config.color.g}, ${p.config.color.b}, 0.3)`;
            ctx.lineWidth = op.size * 0.5; ctx.beginPath();
            const px = Math.cos(op.angle - 0.2) * op.distance;
            const py = Math.sin(op.angle - 0.2) * op.distance * 0.5 + op.height * 0.3;
            ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
        });
        ctx.strokeStyle = p.config.gridColor; ctx.lineWidth = 1; ctx.shadowBlur = 6; ctx.shadowColor = p.config.glowColor;
        ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
        const sa = getTime() * 0.05; const sx = Math.cos(sa) * p.size * 0.5; const sy = Math.sin(sa) * p.size * 0.5 * 0.3;
        const shine = ctx.createRadialGradient(sx, sy, 0, sx, sy, p.size * 0.3);
        shine.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shine; ctx.beginPath(); ctx.arc(sx, sy, p.size * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
}


