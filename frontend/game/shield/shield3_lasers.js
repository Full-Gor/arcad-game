// shield3_lasers.js - Laser de riposte vertical unique (suivi du bouclier)
import { starship } from '../player_simple.js';

export function fireShield3LaserRiposte(absorptionShield3, _direction, _originX, _originY) {
    if (!starship) return;
    const now = Date.now();
    // Remplacer tout laser existant par un seul
    absorptionShield3.laserBlasts = [{
        startTime: now,
        phase: 'grow', // grow -> vanish
        growthDuration: 1500,
        vanishDuration: 1500,
        width: 0,
        maxWidth: 200,
        opacity: 1
    }];
}

export function updateShield3Lasers(absorptionShield3) {
    if (!starship) {
        absorptionShield3.laserBlasts = [];
        return;
    }
    const now = Date.now();
    absorptionShield3.laserBlasts = absorptionShield3.laserBlasts.filter(laser => {
        const centerX = starship.x + starship.width / 2;
        const originY = starship.y - 50; // remonter le laser de 50px
        laser.x = centerX;
        laser.y = originY;
        // Longueur jusqu'en haut de l'écran
        laser.length = Math.max(0, originY);
        const elapsed = now - laser.startTime;
        if (laser.phase === 'grow') {
            const t = Math.min(1, elapsed / laser.growthDuration);
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
            laser.width = laser.maxWidth * ease;
            if (t >= 1) {
                laser.phase = 'vanish';
                laser.startTime = now; // réutiliser pour la phase vanish
            }
        } else if (laser.phase === 'vanish') {
            const t = Math.min(1, elapsed / laser.vanishDuration);
            laser.opacity = 1 - t;
            if (t >= 1) {
                return false; // supprimer
            }
        }
        return true;
    });
}

export function updateShield3Charging(absorptionShield3) {
    // Désactiver la charge coûteuse pour alléger: vider rapidement
    if (absorptionShield3.chargingLasers.length > 0) {
        absorptionShield3.chargingLasers.length = 0;
    }
}

export function drawShield3Lasers(ctx, absorptionShield3) {
    const laser = absorptionShield3.laserBlasts[0];
    if (!laser) return;
    ctx.save();
    ctx.globalAlpha = laser.opacity;
    // Base incurvée: dessiner une capsule (corps rect + demi-cercle en bas)
    const x0 = laser.x - laser.width / 2;
    const y0 = laser.y - laser.length;
    const y1 = laser.y;
    // Corps
    const grad = ctx.createLinearGradient(x0, y1, x0 + laser.width, y1);
    grad.addColorStop(0, 'rgba(255,0,100,0.6)');
    grad.addColorStop(0.2, 'rgba(255,0,150,0.9)');
    grad.addColorStop(0.5, 'rgba(255,255,255,1)');
    grad.addColorStop(0.8, 'rgba(255,0,150,0.9)');
    grad.addColorStop(1, 'rgba(255,0,100,0.6)');
    ctx.fillStyle = grad;
    // Rect principal (sans empiéter sur la demi-capsule)
    // Dome de base: rayon suit la largeur du laser et est relevé de 50px
    const capRadius = Math.max(20, laser.width / 2);
    const capCenterY = y1 - 50; // base relevée de 50px
    // Rect jusqu'à la ligne de diamètre de la calotte
    const rectHeight = capCenterY - y0;
    ctx.fillRect(x0, y0, laser.width, rectHeight);
    // Demi-cercle incurvé (vers le bas) centré 50px au-dessus du bas
    ctx.beginPath();
    ctx.arc(laser.x, capCenterY, capRadius, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

export function drawShield3Charging(_ctx, _absorptionShield3) {
    // Allégé: visuel de charge supprimé pour performance
}


