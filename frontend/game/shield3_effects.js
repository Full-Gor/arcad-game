// shield3_effects.js - Effets visuels du bouclier 3

export function updateShield3Spheres(absorptionShield3) {
    absorptionShield3.energySpheres = absorptionShield3.energySpheres.filter(sphere => {
        // 5x plus vite autour du shield
        sphere.spiralAngle += 0.75;
        sphere.spiralRadius *= 0.92;
        sphere.x = sphere.targetX + Math.cos(sphere.spiralAngle) * sphere.spiralRadius;
        sphere.y = sphere.targetY + Math.sin(sphere.spiralAngle) * sphere.spiralRadius;
        if (sphere.trail.length > 6) sphere.trail.shift();
        sphere.trail.push({ x: sphere.x, y: sphere.y, size: sphere.radius });
        sphere.radius *= 0.95;
        sphere.life--;
        sphere.opacity = sphere.life / 60;
        return sphere.life > 0 && sphere.radius > 0.5;
    });
}

export function updateShield3Trails(absorptionShield3) {
    absorptionShield3.energyTrails = absorptionShield3.energyTrails.filter(trail => {
        trail.x += trail.vx;
        trail.y += trail.vy;
        trail.vx *= 0.95;
        trail.vy *= 0.95;
        trail.life--;
        trail.size *= 0.97;
        if (trail.trail.length > 5) trail.trail.shift();
        trail.trail.push({ x: trail.x, y: trail.y, size: trail.size });
        return trail.life > 0 && trail.size > 0.5;
    });
}

export function updateShield3Residuals(absorptionShield3) {
    absorptionShield3.residualParticles = absorptionShield3.residualParticles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1;
        particle.vx *= 0.98;
        particle.life--;
        particle.opacity = particle.life / particle.maxLife;
        particle.size *= 0.98;
        return particle.life > 0 && particle.size > 0.5;
    });
}

export function drawShield3Spheres(ctx, absorptionShield3) {
    absorptionShield3.energySpheres.forEach(sphere => {
        if (sphere.trail.length > 1) {
            ctx.strokeStyle = `rgba(255, 0, 255, ${sphere.opacity * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            sphere.trail.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
        const sphereGradient = ctx.createRadialGradient(sphere.x, sphere.y, 0, sphere.x, sphere.y, sphere.radius);
        sphereGradient.addColorStop(0, `rgba(255, 255, 255, ${sphere.opacity})`);
        sphereGradient.addColorStop(0.3, `rgba(255, 0, 255, ${sphere.opacity * 0.8})`);
        sphereGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = sphereGradient;
        ctx.beginPath();
        ctx.arc(sphere.x, sphere.y, sphere.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

export function drawShield3Charging(ctx, absorptionShield3) {
    absorptionShield3.chargingLasers.forEach(particle => {
        if (particle.trail.length > 1) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            particle.trail.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

export function drawShield3Trails(ctx, absorptionShield3) {
    absorptionShield3.energyTrails.forEach(trail => {
        if (trail.trail.length > 1) {
            trail.trail.forEach((point, i) => {
                const opacity = (i / trail.trail.length) * 0.5;
                ctx.fillStyle = `rgba(${trail.color.r}, ${trail.color.g}, ${trail.color.b}, ${opacity})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        const gradient = ctx.createRadialGradient(trail.x, trail.y, 0, trail.x, trail.y, trail.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${trail.life / 40})`);
        gradient.addColorStop(0.5, `rgba(${trail.color.r}, ${trail.color.g}, ${trail.color.b}, ${trail.life / 40})`);
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

export function drawShield3Residuals(ctx, absorptionShield3) {
    absorptionShield3.residualParticles.forEach(particle => {
        const floatY = particle.y + Math.sin(absorptionShield3.time * 0.1 + particle.x) * 2;
        const particleGradient = ctx.createRadialGradient(particle.x, floatY, 0, particle.x, floatY, particle.size);
        particleGradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity})`);
        particleGradient.addColorStop(0.5, `rgba(${particle.color.r}, ${particle.color.g * 0.5}, ${particle.color.b}, ${particle.opacity * 0.5})`);
        particleGradient.addColorStop(1, 'rgba(255, 0, 100, 0)');
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(particle.x, floatY, particle.size, 0, Math.PI * 2);
        ctx.fill();
        if (particle.opacity > 0.5) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.5)`;
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(particle.x, floatY, particle.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

export function drawShield3EnergyBar(ctx, absorptionShield3, centerX, centerY) {
    if (absorptionShield3.energyStored <= 0) return;
    const barWidth = 100;
    const barHeight = 6;
    const barX = centerX - barWidth / 2;
    const barY = centerY + absorptionShield3.radius + 30;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    const energyPercent = absorptionShield3.energyStored / absorptionShield3.maxEnergy;
    const energyGradient = ctx.createLinearGradient(barX, barY, barX + barWidth * energyPercent, barY);
    energyGradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
    energyGradient.addColorStop(0.5, 'rgba(255, 100, 255, 0.9)');
    energyGradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
    ctx.fillStyle = energyGradient;
    ctx.fillRect(barX, barY, barWidth * energyPercent, barHeight);
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

export function createShield3Shockwave(x, y, absorptionShield3) {
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const speed = 3 + Math.random() * 2;
        absorptionShield3.residualParticles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            life: 30,
            maxLife: 30,
            opacity: 1,
            color: { r: 255, g: 255, b: 255 }
        });
    }
}

export function createShield3ResidualParticles(laser, absorptionShield3) {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const distance = Math.random() * laser.length;
        const spread = (Math.random() - 0.5) * laser.width;
        const x = laser.x + Math.cos(laser.direction) * distance + Math.cos(laser.direction + Math.PI/2) * spread;
        const y = laser.y + Math.sin(laser.direction) * distance + Math.sin(laser.direction + Math.PI/2) * spread;
        absorptionShield3.residualParticles.push({
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 1,
            size: 3 + Math.random() * 4,
            life: 60 + Math.random() * 40,
            maxLife: 100,
            opacity: 1,
            color: Math.random() > 0.5 ? { r: 255, g: 0, b: 100 } : { r: 255, g: 255, b: 255 }
        });
    }
}


