// draw.js - Rendu des Power-ups Néon
import { neonState } from './state.js';

export function drawNeonPowerUps(ctx) {
    neonState.powerups.forEach(powerup => {
        ctx.save();
        ctx.translate(powerup.x, powerup.y);
        ctx.rotate(powerup.rotation);
        if (powerup.collected) {
            ctx.globalAlpha = powerup.opacity;
            ctx.scale(powerup.scale, powerup.scale);
        }
        if (powerup.glitchIntensity > 0.1) {
            ctx.translate(
                (Math.random() - 0.5) * powerup.glitchIntensity * 5,
                (Math.random() - 0.5) * powerup.glitchIntensity * 5
            );
        }

        const flickerOpacity = powerup.flickerState;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(-powerup.width/2, -powerup.height/2, powerup.width, powerup.height);
        drawNeonBorder(ctx, powerup, flickerOpacity);

        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 20;
        ctx.shadowColor = powerup.config.glowColor;

        const textGradient = ctx.createLinearGradient(0, -10, 0, 10);
        textGradient.addColorStop(0, `rgba(${powerup.config.secondaryColor.r}, ${powerup.config.secondaryColor.g}, ${powerup.config.secondaryColor.b}, ${flickerOpacity})`);
        textGradient.addColorStop(0.5, `rgba(255, 255, 255, ${flickerOpacity})`);
        textGradient.addColorStop(1, `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, ${flickerOpacity})`);
        ctx.fillStyle = textGradient;
        ctx.fillText(powerup.config.name, 0, -5);

        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillStyle = `rgba(255, 255, 255, ${flickerOpacity})`;
        ctx.fillText(powerup.config.number, 0, 15);

        drawLightningBolt(ctx, 35, 0, powerup, flickerOpacity);
        powerup.electricArcs.forEach(arc => drawElectricArcEffect(ctx, powerup, arc));

        powerup.sparks.forEach(spark => {
            if (spark.trail.length > 1) {
                ctx.strokeStyle = `rgba(${spark.color.r}, ${spark.color.g}, ${spark.color.b}, 0.5)`;
                ctx.lineWidth = spark.size * 0.5;
                ctx.beginPath();
                spark.trail.forEach((point, i) => {
                    const worldX = point.x - powerup.x;
                    const worldY = point.y - powerup.y;
                    if (i === 0) ctx.moveTo(worldX, worldY);
                    else ctx.lineTo(worldX, worldY);
                });
                ctx.stroke();
            }
            const sparkX = spark.x - powerup.x;
            const sparkY = spark.y - powerup.y;
            const sparkOpacity = spark.life / spark.maxLife;
            const sparkGradient = ctx.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, spark.size);
            sparkGradient.addColorStop(0, `rgba(255, 255, 255, ${sparkOpacity})`);
            sparkGradient.addColorStop(0.5, `rgba(${spark.color.r}, ${spark.color.g}, ${spark.color.b}, ${sparkOpacity})`);
            sparkGradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            ctx.fillStyle = sparkGradient;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, spark.size, 0, Math.PI * 2);
            ctx.fill();
        });

        if (Math.random() < 0.05) {
            ctx.strokeStyle = `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, 0.2)`;
            ctx.lineWidth = 1;
            const scanY = -powerup.height/2 + Math.random() * powerup.height;
            ctx.beginPath();
            ctx.moveTo(-powerup.width/2, scanY);
            ctx.lineTo(powerup.width/2, scanY);
            ctx.stroke();
        }

        ctx.restore();
    });
}

function drawNeonBorder(ctx, powerup, opacity) {
    const w = powerup.width / 2;
    const h = powerup.height / 2;
    const segmentLength = (powerup.width * 2 + powerup.height * 2) / powerup.borderSegments.length;
    powerup.borderSegments.forEach((segment, i) => {
        const startPos = i * segmentLength;
        const endPos = (i + 1) * segmentLength;
        const perimeter = powerup.width * 2 + powerup.height * 2;
        function getCoordFromPos(pos) {
            pos = pos % perimeter;
            if (pos < powerup.width) return { x: -w + pos, y: -h };
            if (pos < powerup.width + powerup.height) return { x: w, y: -h + (pos - powerup.width) };
            if (pos < powerup.width * 2 + powerup.height) return { x: w - (pos - powerup.width - powerup.height), y: h };
            return { x: -w, y: h - (pos - powerup.width * 2 - powerup.height) };
        }
        const start = getCoordFromPos(startPos);
        const end = getCoordFromPos(endPos);
        const segmentOpacity = opacity * segment.intensity * (segment.glitching ? Math.random() : 1);
        ctx.strokeStyle = `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, ${segmentOpacity * 0.5})`;
        ctx.lineWidth = 6;
        ctx.shadowBlur = 15;
        ctx.shadowColor = powerup.config.glowColor;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${segmentOpacity})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    });
}

function drawLightningBolt(ctx, x, y, powerup, opacity) {
    ctx.save();
    ctx.translate(x, y);
    const points = [
        { x: -8, y: -12 }, { x: -3, y: -2 }, { x: -6, y: -2 },
        { x: 2, y: 12 }, { x: 0, y: 2 }, { x: 4, y: 2 }, { x: -3, y: -12 }
    ];
    ctx.shadowBlur = 10;
    ctx.shadowColor = powerup.config.glowColor;
    ctx.fillStyle = `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, ${opacity * 0.8})`;
    ctx.beginPath();
    points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.beginPath();
    points.forEach((p, i) => {
        const q = { x: p.x * 0.6, y: p.y * 0.6 };
        if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawElectricArcEffect(ctx, powerup, arc) {
    ctx.strokeStyle = `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, ${arc.intensity})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = powerup.config.glowColor;
    ctx.beginPath();
    arc.segments.forEach((segment, i) => {
        const t = i / (arc.segments.length - 1);
        const x = -powerup.width/2 + t * powerup.width;
        const y = -powerup.height/2 + segment.offset;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${arc.intensity * 0.5})`;
    ctx.lineWidth = 1;
    ctx.stroke();
}








