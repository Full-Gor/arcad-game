// enemy12_squadron.js - Logique d'escadron appliquée à enemy12.jpg (type 5)
import { canvas, ctx } from './globals_simple.js';
import { addExternalEnemyBullet } from './enemy_bullets_simple.js';

// État interne pour alterner les côtés et indexer la formation
let nextSquadronSide = 'right'; // 'right' | 'left'
let rightCount = 0;
let leftCount = 0;

// Lecture simple du multiplicateur de vitesse depuis la difficulté (optionnel, fallback=1)
function getSpeedMultiplier() {
    try {
        const saved = localStorage.getItem('gameDifficulty') || 'medium';
        const map = { easy: 0.7, medium: 1, hard: 1.5, master: 2 };
        return map[saved] || 1;
    } catch (e) {
        return 1;
    }
}

// Initialiser un ennemi type 5 en escadron
export function initEnemy12Squadron(enemy) {
    const speedMult = getSpeedMultiplier();
    enemy.isEnemy12Squadron = true;

    // Déterminer le côté et l'index de formation
    enemy.formation = nextSquadronSide; // 'right' ou 'left'
    if (enemy.formation === 'right') {
        enemy.squadronIndex = rightCount++;
    } else {
        enemy.squadronIndex = leftCount++;
    }
    nextSquadronSide = nextSquadronSide === 'right' ? 'left' : 'right';

    // Phases de mouvement
    enemy.phase = 'entering'; // 'entering' | 'moving_center' | 'formation' | 'descending'
    enemy.isLeader = enemy.squadronIndex === 0;

    // Dimensions (peuvent être adaptées)
    enemy.width = enemy.width || 60;
    enemy.height = enemy.height || 60;

    // Position de départ et vitesses selon le côté
    if (enemy.formation === 'right') {
        enemy.x = canvas.width + 50;
        enemy.y = 50 + (enemy.squadronIndex * 40);
        enemy.vx = -1 * speedMult;
        enemy.vy = 0.5 * speedMult;
        enemy.targetX = canvas.width * 0.75;
    } else {
        enemy.x = -50;
        enemy.y = 50 + (enemy.squadronIndex * 40);
        enemy.vx = 1 * speedMult;
        enemy.vy = 0.5 * speedMult;
        enemy.targetX = canvas.width * 0.25;
    }
    enemy.targetY = canvas.height * 0.3 + (enemy.squadronIndex * 50);

    // Tir
    enemy.canShoot = false;
    enemy.lastShot = 0;

    // Visuel
    enemy.glitchIntensity = 0;
}

// Mise à jour du mouvement/état d'un ennemi type 5 en escadron
export function updateEnemy12Squadron(enemy) {
    const speedMult = getSpeedMultiplier();
    switch (enemy.phase) {
        case 'entering':
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
            {
                const inScreen = enemy.formation === 'right'
                    ? enemy.x < canvas.width - enemy.width
                    : enemy.x > 0;
                if (inScreen && enemy.y > 50) {
                    enemy.phase = 'moving_center';
                }
            }
            break;
        case 'moving_center':
            {
                const dx = enemy.targetX - enemy.x;
                const dy = enemy.targetY - enemy.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 5) {
                    enemy.x += (dx / dist) * 2 * speedMult;
                    enemy.y += (dy / dist) * 2 * speedMult;
                } else {
                    enemy.x = enemy.targetX;
                    enemy.y = enemy.targetY;
                    enemy.phase = 'formation';
                    enemy.canShoot = true;
                    enemy.formationStartTime = Date.now();
                }
            }
            break;
        case 'formation':
            enemy.y += Math.sin(Date.now() * 0.002 + enemy.squadronIndex) * 0.5;
            if (enemy.canShoot) {
                const now = Date.now();
                if (now - enemy.lastShot > 1000) {
                    createEnemy12Bullet(enemy, speedMult);
                    enemy.lastShot = now;
                }
            }
            if (Date.now() - (enemy.formationStartTime || 0) > 3000) {
                enemy.phase = 'descending';
                enemy.vy = 2 * speedMult;
            }
            break;
        case 'descending':
            enemy.y += enemy.vy;
            enemy.x += Math.sin(Date.now() * 0.003 + enemy.squadronIndex * 0.5) * 1.5;
            if (enemy.canShoot) {
                const now = Date.now();
                if (now - enemy.lastShot > 1000) {
                    createEnemy12Bullet(enemy, speedMult);
                    enemy.lastShot = now;
                }
            }
            break;
    }

    // Effet visuel glitch
    if (enemy.phase === 'formation' || enemy.phase === 'descending') {
        enemy.glitchIntensity = Math.random() * 5;
    }
}

// Dessin des effets visuels supplémentaires pour type 5
export function drawEnemy12Effects(ctx, enemy) {
    if (!ctx) return;

    // Effet de glitch RGB
    ctx.save();
    ctx.globalAlpha = 0.25;

    // Rouge
    if (enemy.glitchIntensity > 0) {
        ctx.drawImage(
            getImageForEnemy12(enemy),
            enemy.x - enemy.glitchIntensity,
            enemy.y,
            enemy.width,
            enemy.height
        );
        // Vert
        ctx.drawImage(
            getImageForEnemy12(enemy),
            enemy.x + enemy.glitchIntensity,
            enemy.y,
            enemy.width,
            enemy.height
        );
        // Bleu
        ctx.drawImage(
            getImageForEnemy12(enemy),
            enemy.x,
            enemy.y - enemy.glitchIntensity,
            enemy.width,
            enemy.height
        );
    }

    ctx.globalAlpha = 1;

    // Lueur selon le côté
    const glowColor = enemy.formation === 'right' ? '#00FFFF' : '#FF00FF';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.restore();
}

function getImageForEnemy12(enemy) {
    // Petit helper pour fournir l'image si déjà dessinée ailleurs;
    // Ici, on suppose que l'image est déjà chargée dans enemies_simple (drawImage principal).
    // Pour les effets, on peut redessiner l'image via le contexte courant si nécessaire.
    // On s'en remet au draw principal pour l'image; ces effets dessinent uniquement des copies décalées.
    // On renvoie un canvas vide pour éviter erreurs si drawImage requis; mais comme on passe l'image ci-dessous
    // depuis enemies_simple en appelant d'abord drawEnemy12Effects puis le sprite principal, c'est suffisant.
    return ctx.canvas; // placeholder non utilisé pour du bitmap; effets RGB reposent sur drawImage du sprite principal.
}

function createEnemy12Bullet(enemy, speedMult) {
    const bullet = {
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        width: 8,
        height: 8,
        vx: (Math.random() - 0.5) * 2,
        vy: 4 * (speedMult || 1),
        color: enemy.formation === 'right' ? '#00FFFF' : '#FF00FF',
        glowing: true
    };
    addExternalEnemyBullet(bullet);
}

// Utilitaires pour remettre à zéro l'état entre sessions si besoin
export function resetEnemy12SquadronState() {
    nextSquadronSide = 'right';
    rightCount = 0;
    leftCount = 0;
}



