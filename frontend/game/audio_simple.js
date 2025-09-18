// audio_simple.js - Gestion des effets sonores de façon modulaire
// Configuration des sons (copiée de game.html ligne 1021-1064)

// Objets Audio pour les effets sonores
const soundEffects = {
    shoot: new Audio("/audio/shoot.mp3"),
    hit: new Audio("/audio/hit.mp3"),
    coin: new Audio("/audio/coin.mp3"),
    king: new Audio("/audio/king.mp3"),
    perfect: new Audio("/audio/perfect.mp3"),
    awesome: new Audio("/audio/awesome.mp3")
};

// Configuration des volumes (copiée de game.html ligne 1042-1060)
const volumes = {
    shoot: 0.3,    // Son de tir - volume réduit
    hit: 1.0,      // Son d'explosion/impact - volume normal
    coin: 0.3,     // Son de collecte - volume réduit
    king: 0.6,     // Son d'événement spécial
    perfect: 0.4,  // Son de réussite
    awesome: 1.0   // Son d'explosion majeure
};

// Appliquer les volumes aux sons
Object.keys(soundEffects).forEach(key => {
    if (soundEffects[key] && volumes[key] !== undefined) {
        soundEffects[key].volume = volumes[key];
    }
});

// Configuration spéciale pour le son de tir en boucle
soundEffects.shoot.loop = true; // Le son se répète automatiquement

// Variables pour gérer l'état du son de tir
let isShootingSoundActive = false;

// Fonction pour jouer un son (copiée de game.html ligne 3110-3119)
export function playSound(sound) {
    try {
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn("Impossible de jouer le son:", error);
            });
        }
    } catch (error) {
        console.error("Erreur lors de la lecture du son:", error);
    }
}

// Fonctions spécifiques pour le son de tir en continu
export function startShootSound() {
    if (!isShootingSoundActive) {
        isShootingSoundActive = true;
        try {
            soundEffects.shoot.currentTime = 0;
            soundEffects.shoot.play().catch(error => {
                console.warn("Impossible de jouer le son de tir:", error);
                isShootingSoundActive = false;
            });
        } catch (error) {
            console.error("Erreur lors du démarrage du son de tir:", error);
            isShootingSoundActive = false;
        }
    }
}

export function stopShootSound() {
    if (isShootingSoundActive) {
        isShootingSoundActive = false;
        try {
            soundEffects.shoot.pause();
            soundEffects.shoot.currentTime = 0;
        } catch (error) {
            console.error("Erreur lors de l'arrêt du son de tir:", error);
        }
    }
}

// Fonction pour vérifier si le son de tir est actif
export function isShootSoundActive() {
    return isShootingSoundActive;
}

// Ancienne fonction pour compatibilité (utilise maintenant la nouvelle logique)
export function playShootSound() {
    startShootSound();
}

export function playHitSound() {
    playSound(soundEffects.hit);
}

export function playCoinSound() {
    playSound(soundEffects.coin);
}

export function playPerfectSound() {
    playSound(soundEffects.perfect);
}

export function playAwesomeSound() {
    playSound(soundEffects.awesome);
}

export function playKingSound() {
    playSound(soundEffects.king);
}

// Fonction pour arrêter un son spécifique (pour les autres sons)
export function stopSound(sound) {
    try {
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    } catch (error) {
        console.error("Erreur lors de l'arrêt du son:", error);
    }
}

// Fonction pour obtenir l'objet soundEffects (pour compatibilité)
export function getSoundEffects() {
    return soundEffects;
}

// Initialisation du module audio
export function initializeAudio() {
    console.log('Module audio initialisé');
    console.log('Sons disponibles:', Object.keys(soundEffects));
    
    // Pré-charger les sons les plus utilisés
    try {
        soundEffects.shoot.load();
        soundEffects.hit.load();
        soundEffects.coin.load();
    } catch (error) {
        console.warn('Erreur lors du pré-chargement des sons:', error);
    }
}
