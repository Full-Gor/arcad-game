# Guerre Galactique - Version Modulaire

## Structure du projet

Ce projet a été modularisé pour améliorer la maintenabilité et l'organisation du code. Voici la nouvelle structure :

```
arcad-game/
├── frontend/
│   ├── original_reference.html          # Fichier original de référence (5157 lignes)
│   ├── README.md                        # Ce fichier
│   └── game/                            # Dossier des modules du jeu
│       ├── globals.js                   # Variables globales et fonctions utilitaires
│       ├── audio.js                     # Gestion des sons et musiques
│       ├── player.js                    # Logique des vaisseaux joueurs
│       ├── enemies.js                   # Gestion des ennemis et leurs balles
│       ├── boss.js                      # Logique des boss et mini-boss
│       ├── powerups.js                  # Gestion des power-ups et bonus
│       ├── particles.js                 # Effets visuels et particules
│       ├── ui.js                        # Interface utilisateur
│       ├── input.js                     # Gestion des entrées (clavier, souris, tactile)
│       ├── collisions.js                # Gestion des collisions
│       ├── gameLoop.js                  # Boucle principale du jeu
│       └── main.js                      # Point d'entrée principal (nouveau)
├── pages/
│   ├── game.html                        # Page HTML originale
│   ├── game_modular.html               # Nouvelle page HTML modulaire
│   └── garage.html                      # Page du garage
├── img/                                 # Dossier des images
├── audio/                               # Dossier des sons
└── README.md                            # Documentation principale
```

## Description des modules

### 1. `globals.js` - Variables globales et configuration
- Configuration du jeu (FPS, difficulté, etc.)
- Variables d'état globales
- Fonctions utilitaires (distance, clamp, lerp, etc.)
- Initialisation du canvas

### 2. `audio.js` - Gestion audio
- Définition et chargement des effets sonores
- Fonctions pour jouer des sons spécifiques
- Gestion du volume et des paramètres audio
- Sons contextuels (tirs, explosions, boss, etc.)

### 3. `player.js` - Logique des joueurs
- Gestion des vaisseaux (1, 2 ou 3 joueurs)
- Système de tir et power-ups
- Gestion des vies et des boucliers
- Fonctions de dessin des vaisseaux
- Sélection des vaisseaux depuis le localStorage

### 4. `enemies.js` - Gestion des ennemis
- Génération et gestion des ennemis
- Système de tir ennemi
- Gestion des différents types d'ennemis
- Ennemis spéciaux pour les stages 2 et 3

### 5. `boss.js` - Logique des boss
- Gestion des 3 types de boss
- Patterns de mouvement et d'attaque
- Système de vie et de collisions
- Transitions entre les stages

### 6. `powerups.js` - Power-ups et bonus
- Classe BonusManager pour gérer les power-ups
- Différents types de power-ups (armes, bouclier, éclair)
- Gestion des vies bonus
- Effets spéciaux (vidéo, thunder)

### 7. `particles.js` - Effets visuels
- Système de particules pour les explosions
- Étoiles de fond animées
- Effets de bouclier
- Particules d'impact et trails

### 8. `ui.js` - Interface utilisateur
- Gestion des éléments d'interface (vies, score, etc.)
- Affichage des statistiques multijoueur
- Messages de stage et game over
- Barre de vie des boss

### 9. `input.js` - Gestion des entrées
- Contrôles clavier (flèches, WASD, IJKL)
- Support souris et tactile
- Gestion des manettes de jeu
- Système de pause

### 10. `collisions.js` - Détection de collisions
- Algorithmes de détection de collision
- Gestion des collisions joueur/ennemi
- Collisions balles/ennemis
- Collisions avec les power-ups

### 11. `gameLoop.js` - Boucle principale
- Boucle de jeu optimisée avec requestAnimationFrame
- Gestion du FPS et du deltaTime
- Coordination de tous les systèmes
- Gestion de la pause et du game over

### 12. `main.js` - Point d'entrée principal
- Initialisation de tous les modules
- Coordination du démarrage du jeu
- Gestion des événements de la page
- Fonctions de nettoyage

## Utilisation

### Démarrer le jeu modulaire
Ouvrez le fichier `pages/game_modular.html` dans votre navigateur.

### Développement
1. Modifiez les modules individuels selon vos besoins
2. Les modules utilisent ES6 imports/exports
3. Le fichier `main.js` coordonne l'initialisation
4. Utilisez les outils de développement du navigateur pour déboguer

### Compatibilité
- Le jeu fonctionne dans tous les navigateurs modernes
- Support des modules ES6 requis
- Compatible mobile avec contrôles tactiles

## Avantages de la modularisation

1. **Maintenabilité** : Code organisé en modules logiques
2. **Réutilisabilité** : Modules indépendants réutilisables
3. **Lisibilité** : Code plus facile à comprendre
4. **Débogage** : Isolation des problèmes par module
5. **Collaboration** : Plusieurs développeurs peuvent travailler simultanément
6. **Performance** : Chargement optimisé des modules

## Migration depuis l'ancien code

Le fichier original `original_reference.html` est conservé comme référence. La nouvelle version modulaire offre les mêmes fonctionnalités avec une architecture améliorée.

## Notes techniques

- Utilise ES6 modules avec `import`/`export`
- Gestion d'état centralisée dans `globals.js`
- Architecture orientée composants
- Séparation claire des responsabilités
- Code documenté et commenté
