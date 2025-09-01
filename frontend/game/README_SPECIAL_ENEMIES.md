# ENNEMIS SPÉCIAUX - ARCHITECTURE MODULAIRE

## Vue d'ensemble

Ce système ajoute trois nouveaux types d'ennemis spéciaux au jeu avec des comportements et des effets visuels uniques :

- **ENEMY11 (Type 10)** : Ennemi orbital qui tourne autour du joueur
- **ENEMY12 (Type 11)** : Escadron droit avec formation et tir alterné
- **ENEMY13 (Type 12)** : Escadron gauche avec formation et tir alterné

## Structure des fichiers

### 1. `orbiting_enemies.js`
Gère les ennemis orbitaux (ENEMY11 - Type 10)

**Fonctionnalités :**
- Mouvement orbital autour du joueur
- Projectiles électriques dirigés vers le joueur
- Effets visuels avec arcs électriques
- Rotation du sprite pour pointer vers le joueur

**Fonctions principales :**
- `createOrbitingEnemy()` : Crée un ennemi orbital
- `updateOrbitingEnemies(player)` : Met à jour le mouvement et les tirs
- `drawOrbitingEnemies(ctx)` : Rendu visuel avec effets

### 2. `squadron_enemies.js`
Gère les escadrons symétriques (ENEMY12/13 - Types 11/12)

**Fonctionnalités :**
- Formation en escadron de 5 vaisseaux de chaque côté
- Mouvement coordonné avec phases (entrée, formation, descente)
- Tir alterné en formation
- Effets de glitch visuels

**Fonctions principales :**
- `createSymmetricSquadron()` : Crée les deux escadrons
- `updateSquadronEnemies()` : Met à jour les mouvements
- `drawSquadronEnemies(ctx)` : Rendu avec effets de glitch

### 3. `special_bullets.js`
Gère les projectiles spéciaux des ennemis

**Types de projectiles :**
- **Électriques** : Pulsation, arcs électriques, trainée lumineuse
- **Glitch** : Téléportation aléatoire, distorsion RGB, corruption

**Fonctions principales :**
- `updateSpecialBullets()` : Mise à jour des projectiles
- `drawSpecialBullets(ctx)` : Rendu avec effets spéciaux

### 4. `special_enemies_manager.js`
Gestionnaire principal qui coordonne tous les modules

**Fonctionnalités :**
- Gestion du cycle d'apparition des ennemis spéciaux
- Intégration avec le système de collisions existant
- Statistiques et monitoring
- Nettoyage et gestion de l'état

**Fonctions principales :**
- `initializeSpecialEnemies()` : Initialisation
- `updateSpecialEnemies(player)` : Mise à jour globale
- `drawSpecialEnemies(ctx)` : Rendu global
- `checkSpecialEnemyCollisions(player)` : Vérification des collisions

## Intégration avec le système existant

### Modifications apportées :

1. **`main_simple.js`** :
   - Import des nouveaux modules
   - Initialisation des ennemis spéciaux
   - Intégration dans la boucle de jeu

2. **`enemies_simple.js`** :
   - Extension de la progression jusqu'au type 12
   - Gestion des ennemis spéciaux dans le rendu
   - Support des types 10-12 dans la logique de progression

### Cycle d'apparition :

Les ennemis spéciaux apparaissent dans un cycle de 15 secondes :
1. **ENEMY11 (Orbital)** - Type 10
2. **ENEMY12 (Escadron droit)** - Type 11
3. **ENEMY13 (Escadron gauche)** - Type 12
4. Retour au début du cycle

## Comportements spécifiques

### ENEMY11 - Orbital
- **Phase d'approche** : Se dirige vers une position au-dessus du joueur
- **Phase d'orbite** : Tourne autour du joueur à 250px de distance
- **Tirs** : Projectiles électriques toutes les 800ms
- **Effets** : Arcs électriques aléatoires, rotation du sprite

### ENEMY12/13 - Escadrons
- **Phase d'entrée** : Arrivent depuis les côtés de l'écran
- **Phase de formation** : Se positionnent en formation symétrique
- **Phase de descente** : Descendent en tirant continuellement
- **Tirs** : Alternance entre les membres de l'escadron

## Effets visuels

### Projectiles électriques
- Pulsation de taille
- Arcs électriques aléatoires
- Trainée lumineuse
- Gradient bleu ciel vers blanc

### Projectiles glitch
- Téléportation aléatoire
- Distorsion RGB
- Changement de couleur aléatoire
- Pixels corrompus

### Effets d'escadron
- Copies décalées pour l'effet glitch
- Lueur selon la phase
- Gradients colorés selon le côté

## Configuration

### Paramètres ajustables :
- `specialEnemySpawnInterval` : Intervalle entre les apparitions (15s par défaut)
- Vitesses de mouvement dans chaque module
- Fréquences de tir
- Intensités des effets visuels

### Difficulté :
Les ennemis spéciaux respectent le système de difficulté existant avec des multiplicateurs de vitesse.

## Utilisation

Pour activer les ennemis spéciaux, le système est automatiquement initialisé dans `main_simple.js`. Aucune configuration supplémentaire n'est nécessaire.

Les ennemis spéciaux apparaîtront automatiquement après la progression normale des ennemis (types 0-9).
