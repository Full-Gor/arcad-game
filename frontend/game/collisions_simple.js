// collisions_simple.js - Gestion des collisions de façon modulaire
import { canvas, ctx } from './globals_simple.js';
import { starship } from './player_simple.js';
import { bullets } from './bullets_simple.js';
import { enemies, progressEnemyType, incrementPostMiniBossKills, activatePostMiniBossPhase } from './enemies_simple.js';
import { playHitSound, playCoinSound } from './audio_simple.js';
import { handleKill } from './score_simple.js';
import { isMiniBossActive, getMiniBosses, damageMiniBoss, createMiniBoss } from './miniboss_simple.js';
import { isBossActive, getBoss, damageBoss, createBoss } from './boss_simple.js';

import { revealFullShield, isSphericalShieldActive, createSphericalImpact } from './shield2_main.js';
import { isSimpleShieldActive, absorbProjectile } from './shield_simple.js';
import { isShield3Active, createShield3AbsorptionImpact } from './shield3_main.js';
import { enemyBullets, enemyLasers, pulsingLasers, waveBullets } from './enemy_bullets_simple.js';
import { checkLaserCollision } from './funnel_laser_simple.js';

// Variables pour les effets visuels
let redPoints = [];
let coins = 0;

// NOUVEAU: Compteur de points rouges pour le bouclier
let redPointsCollected = 0;
const SHIELD_ACTIVATION_THRESHOLD = 20; // 20 points rouges pour activer le bouclier

// Fonction de détection de collision (copiée de game.html ligne 3147-3162)
function checkCollision(rect1, rect2) {
    // Vérification que les objets existent et ont des coordonnées valides
    if (!rect1 || !rect2 ||
        typeof rect1.x !== 'number' || typeof rect1.y !== 'number' ||
        typeof rect2.x !== 'number' || typeof rect2.y !== 'number' ||
        typeof rect1.width !== 'number' || typeof rect1.height !== 'number' ||
        typeof rect2.width !== 'number' || typeof rect2.height !== 'number') {
        return false;
    }

    // Utilisation de la méthode AABB (Axis-Aligned Bounding Box) plus précise
    return (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y);
}

// Helpers bouclier sphérique
function getShieldCircle() {
    const centerX = starship.x + starship.width / 2;
    const centerY = starship.y + starship.height / 2;
    const radius = 55; // Doit correspondre à sphericalShield.radius
    return { centerX, centerY, radius };
}

function getShieldZoneRect() {
    const r = 55;
    return {
        x: starship.x - r,
        y: starship.y - r,
        width: starship.width + r * 2,
        height: starship.height + r * 2
    };
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function circleRectIntersects(cx, cy, r, rect) {
    const closestX = clamp(cx, rect.x, rect.x + rect.width);
    const closestY = clamp(cy, rect.y, rect.y + rect.height);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return { hit: (dx * dx + dy * dy) <= r * r, px: closestX, py: closestY };
}

// Fonction pour créer des particules d'explosion (copiée de game.html ligne 5326-5338)
function createExplosionParticles(enemy) {
    // Explosion spectaculaire
    for (let k = 0; k < 100; k++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        redPoints.push({
            x: enemy.x + enemy.width/2,
            y: enemy.y + enemy.height/2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30 + Math.floor(Math.random() * 20),
            isExplosion: true,
            color: ["red", "orange", "yellow"][Math.floor(Math.random() * 3)]
        });
    }
    
    // Points rouges récoltables (copiée de game.html ligne 5341-5347)
    for (let k = 0; k < 10; k++) {
        redPoints.push({
            x: enemy.x + Math.random() * enemy.width,
            y: enemy.y + Math.random() * enemy.height,
            isCollectible: true
        });
    }
}

// Fonction principale de vérification des collisions (copiée de game.html ligne 5316-5357)
export function checkCollisions() {
    if (!starship) return;
    
    // Vérifier les collisions bullets vs enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!enemy) continue;
        
        let enemyHit = false;
        
        // Vérifier chaque projectile du joueur
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (!bullet || !enemy) continue;
            
            if (checkCollision(bullet, enemy)) {
                console.log('Ennemi touché !');
                
                // Supprimer le projectile
                bullets.splice(j, 1);
                enemyHit = true;
                
                // Créer les effets d'explosion
                createExplosionParticles(enemy);
                
                // Son de coup (copiée de game.html ligne 5321)
                playHitSound();
                
                break;
            }
        }
        
        // Supprimer l'ennemi s'il a été touché
        if (enemyHit) {
            enemies.splice(i, 1);
            // Spawn d'un power-up aléatoire (1/3 pour chaque bouclier)
            try {
                const r = Math.floor(Math.random() * 3);
                if (r === 0 && window.spawnPowerShield1) window.spawnPowerShield1();
                else if (r === 1 && window.spawnPowerShield2) window.spawnPowerShield2();
                else if (window.spawnPowerShield3) window.spawnPowerShield3();
            } catch (_) {}
            
            // NOUVEAU: Faire progresser le type d'ennemi (phase normale)
            progressEnemyType();
            
            // NOUVEAU: Gérer les kills post-mini-boss
            const postMiniBossResult = incrementPostMiniBossKills();
            
            // NOUVEAU: Comptabiliser le kill (copiée de game.html)
            handleKill(1); // Joueur 1
            
            console.log('Ennemi détruit ! Ennemis restants:', enemies.length);
            
            // Déclencher les événements spéciaux
            if (postMiniBossResult.shouldSpawnBoss) {
                // Créer le boss principal
                createBoss();
                console.log('🔥 BOSS PRINCIPAL CRÉÉ !');
            } else if (postMiniBossResult.shouldSpawnMiniBoss) {
                // Respawner le mini-boss
                createMiniBoss();
                console.log('⚡ MINI-BOSS RESPAWNÉ !');
            }
            
            continue;
        }
        
        // NOUVEAU: Vérifier collision avec laser entonnoir
        if (checkLaserCollision(starship)) {
            console.log('Joueur touché par le laser entonnoir !');
            
            // Vérifier si le bouclier est actif
            if (isSphericalShieldActive()) {
                console.log('🛡️ Bouclier actif ! Laser absorbé !');
                // Créer un effet d'impact sur le bouclier
                createSphericalImpact(starship.x + starship.width/2, starship.y + starship.height/2, starship);
            } else {
                console.log('💥 Pas de bouclier ! Dégâts du laser entonnoir !');
                // starship.lives--; // À implémenter plus tard
                playHitSound();
            }
        }
        
        // Vérifier collision ennemi vs joueur
        if (checkCollision(starship, enemy)) {
            console.log('Joueur touché par un ennemi !');
            
            // NOUVEAU: Vérifier si le bouclier est actif (copiée de game.html)
            if (isSphericalShieldActive()) {  // NOUVEAU: Utiliser le bouclier sphérique v2
                console.log('🛡️ Bouclier actif ! Collision absorbée !');
                // Le bouclier absorbe les dégâts, mais l'ennemi est quand même détruit
            } else {
                console.log('💥 Pas de bouclier ! Dégâts subis !');
                // Ici on pourrait réduire les vies du joueur (à implémenter plus tard)
                // starship.lives--;
            }
            
            // CORRECTION: Créer les effets d'explosion avant de supprimer l'ennemi
            createExplosionParticles(enemy);
            
            // Supprimer l'ennemi
            enemies.splice(i, 1);
            
            // NOUVEAU: Faire progresser le type d'ennemi (même pour collision joueur-ennemi)
            progressEnemyType();
            
            // NOUVEAU: Comptabiliser le kill même en collision joueur-ennemi
            handleKill(1); // Joueur 1
            
            // Son de coup (copiée de game.html ligne 5360)
            playHitSound();
        }
    }
    
    // NOUVEAU: Vérifier les collisions avec le mini-boss
    if (isMiniBossActive()) {
        const miniBosses = getMiniBosses();
        
        for (let i = miniBosses.length - 1; i >= 0; i--) {
            const miniBoss = miniBosses[i];
            if (!miniBoss) continue;
            
            // Vérifier collision bullets vs mini-boss
            for (let j = bullets.length - 1; j >= 0; j--) {
                const bullet = bullets[j];
                if (!bullet || !miniBoss) continue;
                
                if (checkCollision(bullet, miniBoss)) {
                    console.log('Mini-boss touché !');
                    
                    // Supprimer le projectile
                    bullets.splice(j, 1);
                    
                    // Endommager le mini-boss
                    const destroyed = damageMiniBoss(i, 1);
                    
                    // Son de coup
                    playHitSound();
                    
                    if (destroyed) {
                        // CORRECTION: Particules d'explosion seulement quand complètement détruit
                        createExplosionParticles(miniBoss);
                        
                        // Mini-boss détruit, ajouter un bonus de score
                        handleKill(1);
                        
                        // NOUVEAU: Si c'est le premier mini-boss détruit, activer la phase post-mini-boss
                        activatePostMiniBossPhase();
                        
                        console.log('🎆 Mini-boss complètement détruit ! Phase post-mini-boss activée !');
                    }
                    
                    break;
                }
            }
            
            // Vérifier collision mini-boss vs joueur
            if (checkCollision(starship, miniBoss)) {
                console.log('Joueur touché par le mini-boss !');
                
                // Endommager le mini-boss même en collision
                const destroyed = damageMiniBoss(i, 1);
                
                if (destroyed) {
                    // CORRECTION: Particules d'explosion seulement quand complètement détruit
                    createExplosionParticles(miniBoss);
                    console.log('🎆 Mini-boss détruit par collision avec particules !');
                }
                
                // Réduire les vies du joueur (à implémenter plus tard)
                // starship.lives--;
                
                // Son de coup
                playHitSound();
            }
        }
    }
    
    // NOUVEAU: Vérifier les collisions avec le boss principal
    if (isBossActive()) {
        const boss = getBoss();
        if (boss) {
            // Vérifier collision bullets vs boss
            for (let j = bullets.length - 1; j >= 0; j--) {
                const bullet = bullets[j];
                if (!bullet || !boss) continue;
                
                if (checkCollision(bullet, boss)) {
                    console.log('Boss principal touché !');
                    
                    // Supprimer le projectile
                    bullets.splice(j, 1);
                    
                    // Endommager le boss
                    const destroyed = damageBoss(1);
                    
                    // Son de coup
                    playHitSound();
                    
                    if (destroyed) {
                        // Boss détruit, créer une explosion massive
                        for (let k = 0; k < 50; k++) {
                            const angle = Math.random() * Math.PI * 2;
                            const speed = 2 + Math.random() * 4;
                            redPoints.push({
                                x: boss.x + Math.random() * boss.width,
                                y: boss.y + Math.random() * boss.height,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed,
                                life: 50 + Math.floor(Math.random() * 30),
                                isExplosion: true,
                                color: ["red", "orange", "yellow", "white"][Math.floor(Math.random() * 4)]
                            });
                        }
                        
                        // Boss détruit, bonus de score massif
                        handleKill(1);
                        console.log('🎆 BOSS PRINCIPAL DÉTRUIT ! VICTOIRE !');
                    }
                    
                    break;
                }
            }
            
            // Vérifier collision boss vs joueur (CORRECTION: pas de dégâts au boss)
            if (checkCollision(starship, boss)) {
                console.log('Joueur touché par le boss principal !');
                
                // CORRECTION: Le boss ne subit AUCUN dégât quand touché par le starship
                // Seulement le joueur subit les conséquences
                
                // Réduire les vies du joueur (à implémenter plus tard)
                // starship.lives--;
                
                // Son de coup
                playHitSound();
                
                console.log('⚠️ Boss touché par starship mais AUCUN dégât infligé au boss !');
            }
        }
    }
    
    // NOUVEAU: Vérifier les collisions entre projectiles ennemis et joueur/bouclier
    // 1) Projectiles standards (enemyBullets) déjà gérés ci-dessous
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const enemyBullet = enemyBullets[i];
        if (!enemyBullet || !starship) continue;
        
        let collisionDetected = false;
        
        // NOUVEAU: Priorité bouclier simple (ESPACE)
        if (isSimpleShieldActive()) {
            if (absorbProjectile(enemyBullet)) {
                console.log('🛡️ Projectile absorbé par le bouclier simple (ESPACE) !');
                collisionDetected = true;
            }
        }
        // Puis bouclier 3 (C) absorption + riposte
        else if (isShield3Active()) {
            const { centerX, centerY, radius } = getShieldCircle();
            const px = enemyBullet.x + (enemyBullet.width ? enemyBullet.width / 2 : 0);
            const py = enemyBullet.y + (enemyBullet.height ? enemyBullet.height / 2 : 0);
            const dx = px - centerX;
            const dy = py - centerY;
            if (dx * dx + dy * dy <= radius * radius) {
                createShield3AbsorptionImpact(px, py, starship, 10);
                collisionDetected = true;
            }
        }
        // Sinon, bouclier sphérique (20 points rouges)
        else {
            const shieldActive = isSphericalShieldActive();
            console.log('🔍 DEBUG: isSphericalShieldActive() =', shieldActive);
            
            if (shieldActive) {  // NOUVEAU: Utiliser le bouclier sphérique v2
                console.log('🔍 DEBUG: Bouclier actif, vérification collision...');
            
                // BOUCLIER ACTIF: Collision cercle vs formes
                const { centerX, centerY, radius } = getShieldCircle();

                // Cas onde sonique suiveuse (ENEMY6)
                if (enemyBullet.type === 'following_sonic_wave') {
                    // Collision si l'un des anneaux touche le cercle du bouclier
                    const hitRing = enemyBullet.rings?.some(r => {
                        if (r.radius <= 0) return false;
                        const dx = enemyBullet.x - centerX;
                        const dy = enemyBullet.y - centerY;
                        const dist = Math.hypot(dx, dy);
                        return Math.abs(dist - r.radius) <= radius; // anneau croise le cercle de bouclier
                    });
                    if (hitRing) {
                        const impactX = centerX;
                        const impactY = centerY;
                        createSphericalImpact(impactX, impactY, starship);
                        collisionDetected = true;
                    }
                }
                // Projectiles rectangulaires/points
                else {
                    const px = enemyBullet.x + (enemyBullet.width ? enemyBullet.width / 2 : 0);
                    const py = enemyBullet.y + (enemyBullet.height ? enemyBullet.height / 2 : 0);
                    const dx = px - centerX;
                    const dy = py - centerY;
                    if (dx * dx + dy * dy <= radius * radius) {
                        const impactX = px;
                        const impactY = py;
                        createSphericalImpact(impactX, impactY, starship);
                        collisionDetected = true;
                    }
                }

                if (collisionDetected) {
                    console.log('🛡️ Projectile ennemi touche le bouclier ! (55px du starship)');
                    // Le bouclier absorbe le projectile - pas de dégâts
                    console.log('🛡️ Projectile absorbé par le bouclier avec effet d\'impact !');
                } else {
                    console.log('🔍 DEBUG: Projectile ne touche pas la zone bouclier');
                }
            } else {
                // PAS DE BOUCLIER: Collision directe avec le starship
                if (checkCollision(enemyBullet, starship)) {
                    console.log('💥 Projectile ennemi touche directement le starship !');
                    collisionDetected = true;
                    
                    // Dégâts infligés
                    console.log('💥 Projectile inflige des dégâts !');
                    // starship.lives--; // À implémenter plus tard
                    
                    // Son de dégât
                    playHitSound();
                }
            }
        }
        
        // Supprimer le projectile si collision détectée
        if (collisionDetected) {
            enemyBullets.splice(i, 1);
        }
    }

    // 2) Lasers avancés (enemyLasers: ENEMY7+)
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        const laser = enemyLasers[i];
        if (!laser || !starship) continue;
        let collisionDetected = false;
        if (isSimpleShieldActive()) {
            // Absorption simple: si la base du laser croise le cercle
            const { centerX, centerY, radius } = getShieldCircle();
            const rect = { x: laser.x - laser.width/2, y: laser.y, width: laser.width, height: laser.length };
            const hitInfo = circleRectIntersects(centerX, centerY, radius, rect);
            if (hitInfo.hit) {
                collisionDetected = true;
            }
        } else if (isShield3Active()) {
            const { centerX, centerY, radius } = getShieldCircle();
            const rect = { x: laser.x - laser.width/2, y: laser.y, width: laser.width, height: laser.length };
            const hitInfo = circleRectIntersects(centerX, centerY, radius, rect);
            if (hitInfo.hit) {
                collisionDetected = true;
                createShield3AbsorptionImpact(hitInfo.px, hitInfo.py, starship, 12);
            }
        } else if (isSphericalShieldActive()) {
            const { centerX, centerY, radius } = getShieldCircle();
            const rect = { x: laser.x - laser.width/2, y: laser.y, width: laser.width, height: laser.length };
            const hitInfo = circleRectIntersects(centerX, centerY, radius, rect);
            if (hitInfo.hit) {
                collisionDetected = true;
                createSphericalImpact(hitInfo.px, hitInfo.py, starship);
            }
        } else {
            // Pas de bouclier → collision rect vs starship (approximation)
            const laserRect = { x: laser.x - laser.width/2, y: laser.y, width: laser.width, height: laser.length };
            if (checkCollision(laserRect, starship)) {
                collisionDetected = true;
                playHitSound();
            }
        }
        if (collisionDetected) {
            enemyLasers.splice(i, 1);
        }
    }

    // 3) Anciens types: pulsingLasers (ENEMY1/5) et waveBullets (ENEMY2/4)
    const shieldActive = isSphericalShieldActive();
    const simpleActive = isSimpleShieldActive();
    const s3Active = isShield3Active();
    if (shieldActive || simpleActive || s3Active) {
        const { centerX, centerY, radius } = getShieldCircle();
        // pulsingLasers: rectangle centré
        for (let i = pulsingLasers.length - 1; i >= 0; i--) {
            const l = pulsingLasers[i];
            const rect = { x: l.x, y: l.y, width: l.currentWidth || l.width || l.minWidth, height: l.height };
            // Test cercle-rectangle
            const closestX = clamp(centerX, rect.x, rect.x + rect.width);
            const closestY = clamp(centerY, rect.y, rect.y + rect.height);
            const dx = centerX - closestX;
            const dy = centerY - closestY;
            if (dx * dx + dy * dy <= radius * radius) {
                if (s3Active) createShield3AbsorptionImpact(closestX, closestY, starship, 10);
                else createSphericalImpact(closestX, closestY, starship);
                pulsingLasers.splice(i, 1);
            }
        }
        // waveBullets: petits cercles
        for (let i = waveBullets.length - 1; i >= 0; i--) {
            const b = waveBullets[i];
            const px = b.x + b.width / 2;
            const py = b.y + b.height / 2;
            const dx = px - centerX;
            const dy = py - centerY;
            if (dx * dx + dy * dy <= radius * radius) {
                if (s3Active) createShield3AbsorptionImpact(px, py, starship, 8);
                else createSphericalImpact(px, py, starship);
                waveBullets.splice(i, 1);
            }
        }
    }
}

// Fonction pour mettre à jour les particules d'explosion et la collecte des points (copiée de game.html ligne 5069-5195)
export function updateExplosionParticles() {
    // Limiter le nombre de particules pour les performances
    if (redPoints.length > 500) {
        redPoints = redPoints.slice(0, 500);
    }
    
    // Mettre à jour chaque particule
    redPoints = redPoints.filter((point) => {
        if (point.isExplosion) {
            // Mettre à jour la position avec la vélocité
            point.x += point.vx;
            point.y += point.vy;
            
            // Ralentir progressivement
            point.vx *= 0.95;
            point.vy *= 0.95;
            
            // Réduire la durée de vie
            point.life--;
            
            return point.life > 0;
        } else if (point.isCollectible) {
            // Points récoltables - comportement d'origine (copiée de game.html ligne 5094-5156)
            point.y += 1; // Tombent vers le bas
            
            // Vérifier attraction et collecte par le joueur
            if (starship) {
                const dx = starship.x + starship.width/2 - point.x;
                const dy = starship.y + starship.height/2 - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Zone d'attraction (100 pixels)
                if (distance < 100) {
                    // Attraction vers le joueur
                    const attractionForce = 3;
                    point.x += (dx / distance) * attractionForce;
                    point.y += (dy / distance) * attractionForce;
                    
                    // Zone de collecte (30 pixels)
                    if (distance < 30) {
                        // Collecter le point
                        coins += 0.5;
                        redPointsCollected++; // NOUVEAU: Compteur local pour le bouclier
                        console.log(`Point rouge collecté ! Coins: ${coins.toFixed(1)}, Points bouclier: ${redPointsCollected}/${SHIELD_ACTIVATION_THRESHOLD}`);
                        
                        // Son de collecte (copiée de game.html ligne 5118)
                        playCoinSound();
                        
                        // NOUVEAU: Vérifier activation du bouclier sphérique v2 (CODE ORIGINAL)
                        if (redPointsCollected >= SHIELD_ACTIVATION_THRESHOLD && !isSimpleShieldActive()) {
                            console.log('🛡️ Activation du bouclier sphérique v2 (code original) ! Points collectés:', redPointsCollected);
                            
                            // NOUVEAU: Ne plus désactiver starship.shield pour éviter le conflit
                            // Le bouclier sphérique et le bouclier simple sont maintenant indépendants
                            
                            // Activer le nouveau bouclier sphérique v2 (CODE ORIGINAL)
                            revealFullShield();
                            
                            // Réinitialiser le compteur
                            redPointsCollected = 0;
                            
                            console.log('🛡️ Bouclier sphérique v2 (code original) actif !');
                        }
                        
                        return false; // Supprimer ce point (collecté)
                    }
                }
            }
            
            // Supprimer s'ils sortent de l'écran
            return point.y < canvas.height + 50;
        }
        
        return false;
    });
}

// Fonction pour dessiner les particules d'explosion
export function drawExplosionParticles() {
    if (!ctx) return;
    
    redPoints.forEach((point) => {
        if (point.isExplosion) {
            ctx.fillStyle = point.color || "red";
            ctx.fillRect(point.x, point.y, 3, 3);
        } else if (point.isCollectible) {
            ctx.fillStyle = "red";
            ctx.fillRect(point.x, point.y, 2, 2);
        }
    });
}

// Fonction pour obtenir le nombre de particules (debug)
export function getParticleCount() {
    return redPoints.length;
}

// Fonction pour obtenir le nombre de coins collectés
export function getCoinsCount() {
    return coins;
}

// Fonction pour obtenir les points rouges collectés par le joueur
export function getRedPointsCollected() {
    return starship ? (starship.redPointsCollected || 0) : 0;
}
