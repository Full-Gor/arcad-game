    // player_shooting_adapter.js - Adaptateur universel pour les systèmes de tir ennemis
    import { canvas, ctx } from './globals_simple.js';
    import { starship } from './player_simple.js';

    // ==============================
    // 🎯 CONFIGURATION DU TIR
    // ==============================
    // Change juste cette ligne pour tester un autre tir !

// Test : Genkidama (Boule qui grossit)
import { createPulsingLaserSimple, updatePulsingLaserSimple, drawPulsingLaserSimple } from './Shoot/Genkidama/genkidama.js';
const SHOOT_CONFIG = {
    createFunction: createPulsingLaserSimple,
    updateFunction: updatePulsingLaserSimple,
    drawFunction: drawPulsingLaserSimple,
    shootInterval: 100,
    color: 'gold'
};

    // ==============================
    // 🔧 SYSTÈME INTERNE
    // ==============================

    // Stockage des projectiles du joueur
    export let playerBullets = [];

// Variables de contrôle
let shooting = false;
let lastShootTime = 0;
let tunnelActive = false;
let tunnelShots = [];
let tunnelIndex = 0;
let lastTunnelTime = 0;

    // Créer un faux ennemi pour adapter les fonctions
    function createFakeEnemy() {
        if (!starship) return null;
        
        return {
            x: starship.x,
            y: starship.y,
            width: starship.width,
            height: starship.height,
            isPlayer: true // Marqueur pour adaptation
        };
    }

    // ==============================
    // 📤 API PUBLIQUE
    // ==============================

    export function startShooting() {
        shooting = true;
        console.log('🔫 Tir activé :', SHOOT_CONFIG.createFunction.name);
    }

    export function stopShooting() {
        shooting = false;
        console.log('🛑 Tir désactivé');
    }

    export function isShooting() {
        return shooting;
    }

// Fonction principale de tir
export function shootBullet() {
    if (!starship || !canvas || !SHOOT_CONFIG.createFunction) return;
    
    const currentTime = Date.now();
    
    // Vérifier le délai de 3 secondes entre les tunnels
    if (currentTime - lastTunnelTime < 3000) return;
    
    // Démarrer un nouveau tunnel de 7 tirs
    if (!tunnelActive) {
        tunnelActive = true;
        tunnelIndex = 0;
        lastTunnelTime = currentTime;
        console.log('🚀 Tunnel de 7 tirs démarré !');
    }
    
    // Créer les 7 tirs du tunnel avec délai
    if (tunnelActive && tunnelIndex < 7) {
        const fakeEnemy = createFakeEnemy();
        if (fakeEnemy) {
            const bullet = SHOOT_CONFIG.createFunction(fakeEnemy);
            if (bullet) {
                bullet.isPlayerBullet = true;
                bullet.fromPlayer = true;
                bullet.tunnelIndex = tunnelIndex;
                bullet.tunnelDelay = tunnelIndex * 100; // 100ms entre chaque tir
                
                // Inverser la direction
                if (bullet.vy && bullet.vy > 0) {
                    bullet.vy = -bullet.vy;
                }
                
                playerBullets.push(bullet);
                tunnelIndex++;
                
                console.log(`🎯 Tir ${tunnelIndex}/7 du tunnel créé !`);
            }
        }
        
        // Fin du tunnel
        if (tunnelIndex >= 7) {
            tunnelActive = false;
            tunnelIndex = 0;
            console.log('✅ Tunnel terminé ! Attente 3 secondes...');
        }
    }
}

    // Mise à jour des projectiles
    export function updateBullets() {
        if (!SHOOT_CONFIG.updateFunction) return;
        
        // Mettre à jour chaque projectile
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            
            if (bullet && bullet.isPlayerBullet) {
                // Utiliser la fonction de mise à jour du module
                SHOOT_CONFIG.updateFunction(bullet);
                
                // Supprimer les projectiles sortis de l'écran
                if (bullet.y < 0 || bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
                    playerBullets.splice(i, 1);
                }
            }
        }
    }

    // Dessin des projectiles
    export function drawBullets() {
        if (!ctx) return;
        
        playerBullets.forEach(bullet => {
            if (bullet && bullet.isPlayerBullet) {
                // Utiliser la fonction de dessin du module si disponible
                if (SHOOT_CONFIG.drawFunction) {
                    SHOOT_CONFIG.drawFunction(ctx, bullet);
                } else {
                    // Dessin par défaut
                    ctx.fillStyle = SHOOT_CONFIG.color || 'white';
                    ctx.fillRect(bullet.x, bullet.y, bullet.width || 4, bullet.height || 4);
                }
            }
        });
    }

    // Fonction de gestion du tir (appelée par input_simple.js)
    export function handleShooting() {
        if (shooting && starship) {
            shootBullet();
        }
    }

    // Nettoyer les projectiles
    export function clearBullets() {
        playerBullets = [];
    }

  
