// Système d'icônes de pouvoirs spéciaux
let powerIconsSystem = {
    icons: [],
    position: { x: 20, y: 0 }, // y sera calculé selon la hauteur du canvas
    spacing: 70,
    iconSize: 60,
    
    // Configuration des contrôles
    controls: {
        keyboard: {
            laser: 'e',      // Touche E pour laser (Laser Pulsé Advanced)
            bomb: 'w',       // Touche W pour bombe
            lightning: 'q'   // Touche Q pour foudre (désactivé côté tir)
        },
        mouse: {
            button: 0        // 0 = clic gauche, 1 = milieu, 2 = droit
        },
        gamepad: {
            laser: 0,        // Bouton A (Xbox) / X (PlayStation)
            bomb: 1,         // Bouton B (Xbox) / Cercle (PlayStation)
            lightning: 2     // Bouton X (Xbox) / Carré (PlayStation)
        }
    },
    
    // État global
    mouseX: 0,
    mouseY: 0,
    hoveredIcon: null,
    activeGamepad: null,
    
    // Animations
    time: 0,
    glitchTimer: 0
};

// Types d'icônes
const iconTypes = {
    laser: {
        id: 'laser',
        color: { r: 255, g: 50, b: 50 },      // Rouge
        glowColor: '#ff3232',
        secondaryColor: { r: 255, g: 255, b: 255 },
        cooldown: 180,  // 3 secondes à 60fps
        particles: []
    },
    bomb: {
        id: 'bomb',
        color: { r: 255, g: 150, b: 0 },      // Orange
        glowColor: '#ff9600',
        secondaryColor: { r: 255, g: 200, b: 100 },
        cooldown: 300,  // 5 secondes
        particles: []
    },
    lightning: {
        id: 'lightning',
        color: { r: 100, g: 200, b: 255 },    // Bleu électrique
        glowColor: '#64c8ff',
        secondaryColor: { r: 255, g: 255, b: 255 },
        cooldown: 240,  // 4 secondes
        particles: []
    }
};

// Initialiser le système d'icônes
export function initPowerIcons(canvasWidth, canvasHeight) {
    powerIconsSystem.canvasWidth = canvasWidth;
    powerIconsSystem.canvasHeight = canvasHeight;
    powerIconsSystem.position.y = canvasHeight - 100;
    
    // Créer les 3 icônes
    const types = ['laser', 'bomb', 'lightning'];
    types.forEach((type, index) => {
        const config = iconTypes[type];
        const icon = {
            type: type,
            config: config,
            x: powerIconsSystem.position.x + index * powerIconsSystem.spacing,
            y: powerIconsSystem.position.y,
            size: powerIconsSystem.iconSize,
            
            // États
            isHovered: false,
            isPressed: false,
            isActive: false,
            isOnCooldown: false,
            
            // Animation
            scale: 1,
            rotation: 0,
            pulse: 0,
            glowIntensity: 0.5,
            
            // Cooldown
            cooldownTimer: 0,
            maxCooldown: config.cooldown,
            chargeLevel: 1, // 0 = vide, 1 = plein
            
            // Effets visuels
            particles: [],
            lightningBolts: [],
            shockwaves: [],
            borderSegments: [],
            
            // Activation
            activationAnimation: 0,
            lastActivation: 0
        };
        
        // Initialiser les segments de bordure
        initializeBorderSegments(icon);
        
        // Initialiser les particules d'ambiance
        initializeAmbientParticles(icon);
        
        powerIconsSystem.icons.push(icon);
    });
    
    // Configurer les événements
    setupEventListeners();
}

// Initialiser les segments de bordure pour effet néon
function initializeBorderSegments(icon) {
    const segments = 12;
    for (let i = 0; i < segments; i++) {
        icon.borderSegments.push({
            angle: (i / segments) * Math.PI * 2,
            intensity: 1,
            flickering: false,
            flickerTimer: 0
        });
    }
}

// Initialiser les particules d'ambiance
function initializeAmbientParticles(icon) {
    for (let i = 0; i < 5; i++) {
        icon.particles.push({
            x: (Math.random() - 0.5) * icon.size,
            y: (Math.random() - 0.5) * icon.size,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: 1 + Math.random() * 2,
            opacity: Math.random(),
            life: 100
        });
    }
}

// Configuration des événements
function setupEventListeners() {
    // Événements souris
    document.addEventListener('mousemove', (e) => {
        powerIconsSystem.mouseX = e.clientX;
        powerIconsSystem.mouseY = e.clientY;
    });
    
    document.addEventListener('mousedown', (e) => {
        if (e.button === powerIconsSystem.controls.mouse.button) {
            const clickedIcon = getIconAtPosition(e.clientX, e.clientY);
            if (clickedIcon && !clickedIcon.isOnCooldown) {
                activateIcon(clickedIcon);
            }
        }
    });
    
    // Événements clavier
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        Object.entries(powerIconsSystem.controls.keyboard).forEach(([type, assignedKey]) => {
            if (key === assignedKey) {
                const icon = powerIconsSystem.icons.find(i => i.type === type);
                if (icon && !icon.isOnCooldown) {
                    activateIcon(icon);
                }
            }
        });
    });
    
    // Support manette (Gamepad API)
    window.addEventListener('gamepadconnected', (e) => {
        console.log('Manette connectée:', e.gamepad.id);
        powerIconsSystem.activeGamepad = e.gamepad.index;
    });
    
    window.addEventListener('gamepaddisconnected', (e) => {
        console.log('Manette déconnectée');
        powerIconsSystem.activeGamepad = null;
    });
}

// Vérifier quelle icône est sous la position donnée
function getIconAtPosition(x, y) {
    return powerIconsSystem.icons.find(icon => {
        const dx = x - icon.x;
        const dy = y - icon.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= icon.size / 2;
    });
}

// Activer une icône
function activateIcon(icon) {
    if (icon.isOnCooldown) return;
    
    icon.isActive = true;
    icon.isOnCooldown = true;
    icon.cooldownTimer = icon.maxCooldown;
    icon.activationAnimation = 1;
    icon.lastActivation = powerIconsSystem.time;
    
    // Créer des effets visuels d'activation
    createActivationEffect(icon);
    
    // Déclencher le callback du pouvoir (à implémenter selon vos besoins)
    triggerPower(icon.type);
    
    console.log(`Power activated: ${icon.type}`);
}

// Créer l'effet visuel d'activation
function createActivationEffect(icon) {
    // Onde de choc
    icon.shockwaves.push({
        radius: 0,
        maxRadius: 100,
        opacity: 1,
        speed: 5
    });
    
    // Explosion de particules
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        
        icon.particles.push({
            x: 0,
            y: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 3,
            opacity: 1,
            life: 60,
            trail: []
        });
    }
    
    // Effets spécifiques selon le type
    if (icon.type === 'lightning') {
        createLightningEffect(icon);
    } else if (icon.type === 'laser') {
        createLaserEffect(icon);
    } else if (icon.type === 'bomb') {
        createBombEffect(icon);
    }
}

// Effet spécifique pour la foudre
function createLightningEffect(icon) {
    for (let i = 0; i < 5; i++) {
        icon.lightningBolts.push({
            points: generateLightningPath(),
            opacity: 1,
            life: 20
        });
    }
}

// Générer un chemin d'éclair
function generateLightningPath() {
    const points = [];
    const segments = 8;
    for (let i = 0; i <= segments; i++) {
        const y = -30 + (i / segments) * 60;
        const x = (Math.random() - 0.5) * 20;
        points.push({ x, y });
    }
    return points;
}

// Effet laser
function createLaserEffect(icon) {
    // Animation spécifique au laser
}

// Effet bombe
function createBombEffect(icon) {
    // Animation spécifique à la bombe
}

// Fonction de déclenchement du pouvoir (à customiser)
function triggerPower(type) {
    // Cette fonction sera appelée quand un pouvoir est activé
    // Vous pouvez la personnaliser selon vos besoins
    
    if (window.onPowerActivated) {
        window.onPowerActivated(type);
    }
    
    // NOUVEAU: Activer les pouvoirs du starship (ne pas bloquer sur window.starship)
    if (window.playerShootingModule) {
        switch(type) {
            case 'laser':
                // Touche E → Electric Laser Serpentine
                window.playerShootingModule.activateElectricLaserSerpentineMode();
                break;
            case 'bomb':
                // Touche W → Electric Glitch
                window.playerShootingModule.activateElectricGlitchMode();
                break;
            case 'lightning':
                // Touche Q → Electric Bullet (au lieu de Laser Beam)
                window.playerShootingModule.activateElectricBulletMode();
                break;
        }
    }
}

// Mise à jour du système
export function updatePowerIcons() {
    powerIconsSystem.time++;
    powerIconsSystem.glitchTimer++;
    
    // Vérifier les inputs manette
    if (powerIconsSystem.activeGamepad !== null) {
        const gamepad = navigator.getGamepads()[powerIconsSystem.activeGamepad];
        if (gamepad) {
            checkGamepadInputs(gamepad);
        }
    }
    
    // Mise à jour de chaque icône
    powerIconsSystem.icons.forEach(icon => {
        // Vérifier le survol
        const dx = powerIconsSystem.mouseX - icon.x;
        const dy = powerIconsSystem.mouseY - icon.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        icon.isHovered = distance <= icon.size / 2 && !icon.isOnCooldown;
        
        // Animation de survol
        if (icon.isHovered) {
            icon.scale = Math.min(1.2, icon.scale + 0.05);
            icon.glowIntensity = Math.min(1, icon.glowIntensity + 0.1);
        } else {
            icon.scale = Math.max(1, icon.scale - 0.05);
            icon.glowIntensity = Math.max(0.5, icon.glowIntensity - 0.05);
        }
        
        // Gestion du cooldown
        if (icon.isOnCooldown) {
            icon.cooldownTimer--;
            icon.chargeLevel = 1 - (icon.cooldownTimer / icon.maxCooldown);
            
            if (icon.cooldownTimer <= 0) {
                icon.isOnCooldown = false;
                icon.chargeLevel = 1;
                
                // Effet de recharge complète
                createRechargeEffect(icon);
            }
        }
        
        // Animation de pulsation
        icon.pulse += 0.05;
        icon.rotation += icon.isActive ? 0.1 : 0.01;
        
        // Réduction de l'animation d'activation
        icon.activationAnimation *= 0.95;
        if (icon.activationAnimation < 0.01) {
            icon.isActive = false;
        }
        
        // Mise à jour des particules
        icon.particles = icon.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life--;
            particle.opacity = particle.life / 100;
            
            // Garder les particules dans une zone
            if (Math.abs(particle.x) > icon.size || Math.abs(particle.y) > icon.size) {
                return false;
            }
            
            return particle.life > 0;
        });
        
        // Régénérer des particules d'ambiance
        if (icon.particles.length < 5 && !icon.isOnCooldown) {
            icon.particles.push({
                x: (Math.random() - 0.5) * icon.size,
                y: icon.size / 2,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 1,
                size: 1 + Math.random() * 2,
                opacity: 0,
                life: 100
            });
        }
        
        // Mise à jour des ondes de choc
        icon.shockwaves = icon.shockwaves.filter(wave => {
            wave.radius += wave.speed;
            wave.opacity = 1 - (wave.radius / wave.maxRadius);
            return wave.radius < wave.maxRadius;
        });
        
        // Mise à jour des éclairs
        icon.lightningBolts = icon.lightningBolts.filter(bolt => {
            bolt.life--;
            bolt.opacity = bolt.life / 20;
            return bolt.life > 0;
        });
        
        // Mise à jour des segments de bordure (effet néon)
        icon.borderSegments.forEach(segment => {
            if (Math.random() < 0.01) {
                segment.flickering = true;
                segment.flickerTimer = 5 + Math.random() * 10;
            }
            
            if (segment.flickering) {
                segment.flickerTimer--;
                segment.intensity = 0.3 + Math.random() * 0.7;
                if (segment.flickerTimer <= 0) {
                    segment.flickering = false;
                    segment.intensity = 1;
                }
            }
        });
    });
}

// Vérifier les inputs de la manette
function checkGamepadInputs(gamepad) {
    Object.entries(powerIconsSystem.controls.gamepad).forEach(([type, buttonIndex]) => {
        if (gamepad.buttons[buttonIndex] && gamepad.buttons[buttonIndex].pressed) {
            const icon = powerIconsSystem.icons.find(i => i.type === type);
            if (icon && !icon.isOnCooldown && !icon.isActive) {
                activateIcon(icon);
            }
        }
    });
}

// Créer l'effet de recharge complète
function createRechargeEffect(icon) {
    // Flash lumineux
    icon.glowIntensity = 2;
    
    // Particules de célébration
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        icon.particles.push({
            x: Math.cos(angle) * 20,
            y: Math.sin(angle) * 20,
            vx: Math.cos(angle) * 0.5,
            vy: Math.sin(angle) * 0.5,
            size: 2,
            opacity: 1,
            life: 40
        });
    }
}

// Fonction de rendu
export function drawPowerIcons(ctx) {
    powerIconsSystem.icons.forEach(icon => {
        ctx.save();
        ctx.translate(icon.x, icon.y);
        
        // Appliquer l'échelle et la rotation
        ctx.scale(icon.scale, icon.scale);
        ctx.rotate(icon.rotation * 0.1);
        
        // 1. Halo de fond
        if (!icon.isOnCooldown) {
            const haloGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, icon.size);
            haloGradient.addColorStop(0, `rgba(${icon.config.color.r}, ${icon.config.color.g}, ${icon.config.color.b}, ${icon.glowIntensity * 0.2})`);
            haloGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = haloGradient;
            ctx.beginPath();
            ctx.arc(0, 0, icon.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 2. Cercle de fond
        ctx.fillStyle = icon.isOnCooldown ? 'rgba(30, 30, 30, 0.8)' : 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, icon.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 3. Bordure néon segmentée
        drawNeonBorder(ctx, icon);
        
        // 4. Icône spécifique
        ctx.save();
        if (icon.isOnCooldown) {
            ctx.globalAlpha = 0.3;
        }
        
        switch(icon.type) {
            case 'laser':
                drawLaserIcon(ctx, icon);
                break;
            case 'bomb':
                drawBombIcon(ctx, icon);
                break;
            case 'lightning':
                drawLightningIcon(ctx, icon);
                break;
        }
        ctx.restore();
        
        // 5. Barre de cooldown
        if (icon.isOnCooldown) {
            drawCooldownBar(ctx, icon);
        }
        
        // 6. Particules
        icon.particles.forEach(particle => {
            ctx.fillStyle = `rgba(${icon.config.color.r}, ${icon.config.color.g}, ${icon.config.color.b}, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 7. Ondes de choc
        icon.shockwaves.forEach(wave => {
            ctx.strokeStyle = `rgba(${icon.config.color.r}, ${icon.config.color.g}, ${icon.config.color.b}, ${wave.opacity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // 8. Éclairs (pour l'icône foudre)
        if (icon.type === 'lightning') {
            icon.lightningBolts.forEach(bolt => {
                ctx.strokeStyle = `rgba(100, 200, 255, ${bolt.opacity})`;
                ctx.lineWidth = 2;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#64c8ff';
                
                ctx.beginPath();
                bolt.points.forEach((point, i) => {
                    if (i === 0) ctx.moveTo(point.x, point.y);
                    else ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
            });
        }
        
        // 9. Indicateur de touche
        if (!icon.isOnCooldown) {
            ctx.font = 'bold 12px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            const key = powerIconsSystem.controls.keyboard[icon.type].toUpperCase();
            ctx.fillText(key, 0, icon.size / 2 + 15);
        }
        
        ctx.restore();
    });
}

// Dessiner la bordure néon
function drawNeonBorder(ctx, icon) {
    const radius = icon.size / 2;
    
    icon.borderSegments.forEach((segment, i) => {
        const startAngle = segment.angle;
        const endAngle = startAngle + (Math.PI * 2 / icon.borderSegments.length);
        
        const opacity = icon.isOnCooldown ? 0.2 : segment.intensity;
        
        // Ligne externe (glow)
        ctx.strokeStyle = `rgba(${icon.config.color.r}, ${icon.config.color.g}, ${icon.config.color.b}, ${opacity * 0.5})`;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = icon.config.glowColor;
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.stroke();
        
        // Ligne interne (bright)
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.stroke();
    });
}

// Dessiner l'icône laser
function drawLaserIcon(ctx, icon) {
    const size = icon.size * 0.3;
    
    // Faisceau laser
    const gradient = ctx.createLinearGradient(-size, 0, size, 0);
    gradient.addColorStop(0, 'rgba(255, 50, 50, 0.5)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 50, 50, 0.5)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-size, -3, size * 2, 6);
    
    // Centre lumineux
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(-2, -5, 4, 10);
    
    // Points d'émission
    ctx.beginPath();
    ctx.arc(-size, 0, 5, 0, Math.PI * 2);
    ctx.arc(size, 0, 5, 0, Math.PI * 2);
    ctx.fill();
}

// Dessiner l'icône bombe
function drawBombIcon(ctx, icon) {
    const size = icon.size * 0.25;
    
    // Corps de la bombe
    const bombGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    bombGradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
    bombGradient.addColorStop(0.5, 'rgba(255, 150, 0, 1)');
    bombGradient.addColorStop(1, 'rgba(200, 100, 0, 1)');
    
    ctx.fillStyle = bombGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Mèche
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size * 0.7, -size * 0.7);
    ctx.lineTo(size * 1.2, -size * 1.2);
    ctx.stroke();
    
    // Étincelle sur la mèche
    const sparkle = 1 + Math.sin(powerIconsSystem.time * 0.3) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 0, ${sparkle})`;
    ctx.beginPath();
    ctx.arc(size * 1.2, -size * 1.2, 4, 0, Math.PI * 2);
    ctx.fill();
}

// Dessiner l'icône foudre
function drawLightningIcon(ctx, icon) {
    const size = icon.size * 0.3;
    
    // Éclair principal
    ctx.fillStyle = `rgba(${icon.config.color.r}, ${icon.config.color.g}, ${icon.config.color.b}, 1)`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = icon.config.glowColor;
    
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, -size);
    ctx.lineTo(size * 0.2, -size * 0.2);
    ctx.lineTo(-size * 0.1, -size * 0.2);
    ctx.lineTo(size * 0.4, size);
    ctx.lineTo(0, 0);
    ctx.lineTo(size * 0.1, 0);
    ctx.closePath();
    ctx.fill();
    
    // Centre blanc
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.5);
    ctx.lineTo(size * 0.1, -size * 0.1);
    ctx.lineTo(size * 0.2, size * 0.5);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
}

// Dessiner la barre de cooldown
function drawCooldownBar(ctx, icon) {
    const barRadius = icon.size / 2 - 5;
    const progress = icon.chargeLevel;
    
    ctx.strokeStyle = `rgba(${icon.config.color.r}, ${icon.config.color.g}, ${icon.config.color.b}, 0.5)`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.arc(0, 0, barRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
    ctx.stroke();
    
    // Texte du cooldown
    if (icon.cooldownTimer > 0) {
        const seconds = Math.ceil(icon.cooldownTimer / 60);
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(seconds, 0, 0);
    }
}

// Fonction pour changer les contrôles
export function setPowerIconControl(iconType, controlType, value) {
    if (controlType === 'keyboard') {
        powerIconsSystem.controls.keyboard[iconType] = value;
    } else if (controlType === 'gamepad') {
        powerIconsSystem.controls.gamepad[iconType] = value;
    } else if (controlType === 'mouse') {
        powerIconsSystem.controls.mouse.button = value;
    }
}

// Fonction pour récupérer l'état d'une icône
export function getIconState(iconType) {
    const icon = powerIconsSystem.icons.find(i => i.type === type);
    return icon ? {
        ready: !icon.isOnCooldown,
        cooldownRemaining: icon.cooldownTimer,
        chargeLevel: icon.chargeLevel
    } : null;
}
