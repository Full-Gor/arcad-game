// audio.js - Gestion des sons et musiques

// Définition des effets sonores
export const soundEffects = {
    shoot: new Audio("/audio/shoot.mp3"),
    hit: new Audio("/audio/hit.mp3"),
    coin: new Audio("/audio/coin.mp3"),
    king: new Audio("/audio/king.mp3"),
    perfect: new Audio("/audio/perfect.mp3"),
    doubleKill: new Audio("/audio/doubleKill.mp3"),
    tripleKill: new Audio("/audio/tripleKill.mp3"),
    humiliation: new Audio("/audio/humiliation.mp3"),
    brutal: new Audio("/audio/brutal.mp3"),
    super: new Audio("/audio/super.mp3"),
    master: new Audio("/audio/master.mp3"),
    awesome: new Audio("/audio/awesome.mp3"),
    bossAppear: new Audio("/audio/king.mp3"),
    bossHit: new Audio("/audio/hit.mp3"),
    bossDeath: new Audio("/audio/awesome.mp3"),
    continue: new Audio("/audio/continue.mp3"),
    gameOver: new Audio("/audio/gameOver.mp3")
};

// Configuration des volumes
const volumes = {
    shoot: 0.3,
    hit: 1.0,
    coin: 0.3,
    king: 0.6,
    perfect: 0.4,
    doubleKill: 0.7,
    tripleKill: 0.5,
    humiliation: 1.0,
    brutal: 1.0,
    super: 1.0,
    master: 1.0,
    awesome: 1.0,
    bossAppear: 1.0,
    bossHit: 0.5,
    bossDeath: 1.0,
    continue: 1.0,
    gameOver: 1.0
};

// Application des volumes aux sons
Object.keys(soundEffects).forEach(key => {
    soundEffects[key].volume = volumes[key] || 1.0;
});

// Fonction principale pour jouer un son
export function playSound(sound) {
    try {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.warn("Impossible de jouer le son:", error);
        });
    } catch (error) {
        console.error("Erreur lors de la lecture du son:", error);
    }
}

// Fonctions utilitaires pour jouer des sons spécifiques
export function playShootSound() {
    playSound(soundEffects.shoot);
}

export function playHitSound() {
    playSound(soundEffects.hit);
}

export function playCoinSound() {
    playSound(soundEffects.coin);
}

export function playKillSound(killCount) {
    switch (killCount) {
        case 2:
            playSound(soundEffects.doubleKill);
            break;
        case 3:
            playSound(soundEffects.tripleKill);
            break;
        case 4:
            playSound(soundEffects.humiliation);
            break;
        case 5:
            playSound(soundEffects.brutal);
            break;
        case 6:
            playSound(soundEffects.super);
            break;
        case 7:
            playSound(soundEffects.master);
            break;
        case 8:
        default:
            playSound(soundEffects.awesome);
            break;
    }
}

export function playBossSound(type) {
    switch (type) {
        case 'appear':
            playSound(soundEffects.bossAppear);
            break;
        case 'hit':
            playSound(soundEffects.bossHit);
            break;
        case 'death':
            playSound(soundEffects.bossDeath);
            break;
    }
}

export function playGameOverSound() {
    playSound(soundEffects.gameOver);
}

export function playContinueSound() {
    playSound(soundEffects.continue);
}

export function playPerfectSound() {
    playSound(soundEffects.perfect);
}

// Fonction pour ajuster le volume global
export function setMasterVolume(volume) {
    Object.keys(soundEffects).forEach(key => {
        const originalVolume = volumes[key] || 1.0;
        soundEffects[key].volume = originalVolume * volume;
    });
}

// Fonction pour couper/rétablir tous les sons
export function muteAll(muted = true) {
    Object.keys(soundEffects).forEach(key => {
        soundEffects[key].muted = muted;
    });
}

// Fonction pour précharger tous les sons
export function preloadSounds() {
    Object.keys(soundEffects).forEach(key => {
        soundEffects[key].load();
    });
}

// Initialisation
preloadSounds();
