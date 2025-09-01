// update.js - Mise à jour, collisions et collecte
import { neonState } from './state.js';
import { createSparks, createElectricArc } from './effects.js';
import { spawnNeonPowerUp } from './spawn.js';

export function updateNeonPowerUps(playerX, playerY, playerWidth, playerHeight) {
    neonState.time++;
    neonState.glitchTimer++;
    neonState.spawnTimer++;

    if (neonState.spawnTimer >= neonState.spawnInterval &&
        neonState.powerups.length < neonState.maxPowerups) {
        spawnNeonPowerUp();
        neonState.spawnTimer = 0;
    }

    neonState.powerups = neonState.powerups.filter(powerup => {
        if (powerup.collected) {
            powerup.opacity -= 0.05;
            powerup.scale += 0.1;
            powerup.rotation += 0.2;
            return powerup.opacity > 0;
        }

        powerup.x += powerup.vx;
        powerup.y += powerup.vy;
        powerup.rotation += powerup.rotationSpeed;
        const floatY = Math.sin(neonState.time * 0.02 + powerup.floatOffset) * 5;
        powerup.y += floatY * 0.1;

        if (powerup.x < powerup.width/2 || powerup.x > neonState.canvasWidth - powerup.width/2) {
            powerup.vx *= -1;
            createSparks(powerup);
        }

        if (powerup.y > neonState.canvasHeight + 100) return false;

        powerup.flickerTimer++;
        if (powerup.flickerTimer > 2) {
            powerup.flickerTimer = 0;
            powerup.currentFlickerIndex = (powerup.currentFlickerIndex + 1) % powerup.flickerPattern.length;
            powerup.flickerState = powerup.flickerPattern[powerup.currentFlickerIndex];
            if (Math.random() < 0.1) {
                powerup.glitchIntensity = 1;
                powerup.borderGlitch = true;
                createElectricArc(powerup);
            }
        }

        powerup.glitchIntensity *= 0.9;
        if (powerup.glitchIntensity < 0.1) powerup.borderGlitch = false;

        powerup.borderSegments.forEach(segment => {
            if (segment.glitching) {
                segment.glitchTimer--;
                if (segment.glitchTimer <= 0) {
                    segment.glitching = false;
                    segment.intensity = 1;
                }
            } else if (Math.random() < 0.01) {
                segment.glitching = true;
                segment.glitchTimer = 5 + Math.random() * 10;
                segment.intensity = Math.random();
            }
            segment.intensity = 0.7 + Math.sin(neonState.time * segment.flickerSpeed) * 0.3;
        });

        powerup.nextSparkTime--;
        if (powerup.nextSparkTime <= 0) {
            createSparks(powerup);
            powerup.nextSparkTime = 60 + Math.random() * 120;
        }

        powerup.sparks = powerup.sparks.filter(spark => {
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.vy += 0.2;
            spark.vx *= 0.95;
            spark.life--;
            if (spark.trail.length > 5) spark.trail.shift();
            spark.trail.push({ x: spark.x, y: spark.y });
            return spark.life > 0;
        });

        powerup.electricArcs = powerup.electricArcs.filter(arc => {
            arc.life--;
            arc.intensity = arc.life / arc.maxLife;
            return arc.life > 0;
        });

        powerup.arcTimer++;
        if (powerup.arcTimer > 100 && Math.random() < 0.02) {
            createElectricArc(powerup);
            powerup.arcTimer = 0;
        }

        const playerCenterX = playerX + playerWidth / 2;
        const playerCenterY = playerY + playerHeight / 2;
        if (Math.abs(powerup.x - playerCenterX) < (powerup.width + playerWidth) / 2 &&
            Math.abs(powerup.y - playerCenterY) < (powerup.height + playerHeight) / 2) {
            powerup.collected = true;
            onNeonPowerUpCollected(powerup);
            for (let i = 0; i < 30; i++) createSparks(powerup);
        }

        return true;
    });
}

function onNeonPowerUpCollected(powerup) {
    // Activer les power-ups dans les modules de lasers
    try {
        // Importer et activer les power-ups dans les modules de lasers
        import('../../bullets/types/lasers.js').then(lasersModule => {
            if (lasersModule.activateNeonPowerUp) {
                lasersModule.activateNeonPowerUp(powerup.config.effect, powerup.config.value);
            }
        });
        
        import('../../bullets/types/laser_beam.js').then(laserBeamModule => {
            if (laserBeamModule.activateNeonPowerUp) {
                laserBeamModule.activateNeonPowerUp(powerup.config.effect, powerup.config.value);
            }
        });
        
        import('../../bullets/types/electric_laser_serpentine.js').then(electricLaserModule => {
            if (electricLaserModule.activateNeonPowerUp) {
                electricLaserModule.activateNeonPowerUp(powerup.config.effect, powerup.config.value);
            }
        });
        
        // NOUVEAU: Activer les modes de tir du joueur
        import('../../player_shooting_modes.js').then(playerShootingModule => {
            if (playerShootingModule.activatePlayerNeonPowerUp) {
                playerShootingModule.activatePlayerNeonPowerUp(powerup.config.effect, powerup.config.value);
            }
        });
        
        console.log(`🎯 Power-up Néon collecté: ${powerup.config.effect} +${powerup.config.value}`);
    } catch (error) {
        console.log(`🎯 Power-up Néon collecté: ${powerup.config.effect} +${powerup.config.value}`);
    }

    // Appliquer aussi au vaisseau si disponible
    if (window && window.starship) {
        switch(powerup.config.effect) {
            case 'speed':
                window.starship.speed = (window.starship.speed || 5) * powerup.config.value;
                break;
            case 'multishot':
                window.starship.multishot = powerup.config.value;
                break;
            case 'damage':
                window.starship.damage = (window.starship.damage || 10) * powerup.config.value;
                break;
        }
    }
}


