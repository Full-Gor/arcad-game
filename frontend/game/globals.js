// globals.js - Variables globales et fonctions utilitaires

// Configuration du canvas
export let canvas = null;
export let ctx = null;

// Configuration du jeu
export const CONFIG = {
    FPS_LIMIT: 60,
    FRAME_DURATION: 1000 / 60,
    
    // Paramètres de difficulté récupérés du localStorage
    ENEMY_SPEED_MULTIPLIER: parseFloat(localStorage.getItem('enemySpeed')) || 1,
    ENEMY_BULLET_SPEED_MULTIPLIER: parseFloat(localStorage.getItem('enemyBulletSpeed')) || 3,
    POWER_UP_FREQUENCY: parseInt(localStorage.getItem('powerUpFrequency')) || 5,
    LIVES_FREQUENCY: parseInt(localStorage.getItem('livesFrequency')) || 5
};

// Variables de l'état du jeu
export let gameState = {
    isRunning: true,
    lastFrameTime: 0,
    deltaTime: 0,
    fpsCounter: 0,
    fpsTimer: 0
};

// Variables des stages
export let stageState = {
    isStage2: false,
    stage2EnemiesKilled: 0,
    isStage3: false,
    stage3Phase: 0,
    stage3EnemyTypes: [10, 11, 12, 13, 14, 15, 16, 17],
    stage3CurrentEnemyType: 0,
    stage3EnemiesSpawned: 0,
    stage3EnemiesKilled: 0
};

// Variables du système de vagues
export let waveState = {
    currentWave: 1,
    enemiesPerWave: 5,
    currentEnemyType: 0, // 0-14 pour enemy1.jpg à enemy15.jpg
    enemiesSpawnedInWave: 0,
    waveInProgress: false,
    waveComplete: false,
    totalWaves: 15 // 15 types d'ennemis
};

// Variables du joueur
export let playerState = {
    lives: 3,
    enemiesKilled: 0,
    simultaneousKills: 0,
    killTimer: null,
    coins: 0,
    killsWithoutDeath: 0,
    lastKillTime: Date.now(),
    lastEnemyCount: 0,
    powerUpTimeoutId: null,
    redPointsTotal: 0
};

// Variables du boss
export let bossState = {
    active: false,
    boss: null,
    health: 500,
    rotation: 0,
    shootTimer: 0,
    hitEffect: false,
    hitEffectTimer: 0
};

// Variables des mini-boss
export let miniBossState = {
    active: false,
    miniBosses: []
};

// Variables de l'arrière-plan
export let backgroundState = {
    active: false
};

// Configuration multijoueur
export let multiplayerConfig = {
    playersCount: '1',
    isMultiplayer: false,
    isTriplePlayer: false
};

// Tableaux des entités du jeu
export let gameEntities = {
    enemies: [],
    enemyBullets: [],
    stars: [],
    redPoints: [],
    bullets: []
};

// Variables de contrôle
export let controlState = {
    shooting: false,
    keys: {}
};

// Fonction d'initialisation
export function initializeGlobals() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    
    // Configuration multijoueur
    const urlParams = new URLSearchParams(window.location.search);
    multiplayerConfig.playersCount = urlParams.get('players') || '1';
    multiplayerConfig.isMultiplayer = multiplayerConfig.playersCount !== '1';
    multiplayerConfig.isTriplePlayer = multiplayerConfig.playersCount === '3';
}

// Fonctions utilitaires
export function getRandomColor() {
    const colors = ['red', 'orange', 'yellow', 'white', 'blue', 'green', 'purple'];
    return colors[Math.floor(Math.random() * colors.length)];
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

export function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Fonction pour redimensionner le canvas
export function resizeCanvas() {
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialisation au chargement
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeGlobals);
    window.addEventListener('resize', resizeCanvas);
}
