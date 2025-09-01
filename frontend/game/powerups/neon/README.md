# Power-ups Néon - Guide de Test

## 🎯 Vue d'ensemble
Les power-ups Néon sont maintenant intégrés et associés aux modules de lasers suivants :
- `lasers.js` - Lasers pulsés et balayés
- `laser_beam.js` - Laser balayé (beam)
- `electric_laser_serpentine.js` - Laser électrique serpentin

## 🚀 Activation Automatique
Les power-ups Néon s'activent automatiquement 2 secondes après le démarrage du jeu.

## 💎 Types de Power-ups

### 1. POWER-UP 1 (Rose Néon)
- **Effet** : `speed` +2
- **Impact** : Vitesse des lasers doublée
- **Couleur** : Rose néon (#FF0080)

### 2. POWER-UP 2 (Cyan Néon)
- **Effet** : `multishot` +3
- **Impact** : Tir multiple activé (chance de créer des lasers supplémentaires)
- **Couleur** : Cyan néon (#00FFFF)

### 3. POWER-UP 3 (Violet Néon)
- **Effet** : `damage` +3
- **Impact** : Largeur et puissance des lasers triplées
- **Couleur** : Violet néon (#FF00FF)

## 🎮 Comment Tester

### Test Automatique
1. Démarrer le jeu
2. Attendre 2 secondes
3. Les power-ups apparaissent automatiquement
4. Collecter les power-ups avec le vaisseau
5. Observer les effets sur les lasers des ennemis

### Test Manuel (Console)
```javascript
// Activer manuellement
activateNeonPowerUpsTest();

// Forcer le spawn d'un power-up spécifique
forceSpawnNeonPowerUp('powerup1'); // Speed
forceSpawnNeonPowerUp('powerup2'); // Multishot
forceSpawnNeonPowerUp('powerup3'); // Damage

// Désactiver
deactivateNeonPowerUpsTest();
```

## 🔧 Effets sur les Lasers

### Lasers Pulsés (ENEMY1, ENEMY5)
- **Speed** : Vitesse de descente multipliée
- **Damage** : Largeur et intensité de lueur multipliées

### Laser Balayé (ENEMY7)
- **Speed** : Vitesse de balayage multipliée
- **Damage** : Largeur du faisceau multipliée

### Laser Électrique Serpentin (ENEMY14)
- **Speed** : Vitesse de traversée multipliée
- **Damage** : Largeur et longueur multipliées

## 🎨 Effets Visuels
- **Bordure néon segmentée** avec clignotement
- **Étincelles** qui jaillissent des bords
- **Arcs électriques** aléatoires
- **Glitch RGB** lors des rebonds
- **Scanlines** occasionnelles
- **Éclair** à côté du texte

## 📁 Structure des Modules
```
powerups/neon/
├── config.js          # Configuration des types
├── state.js           # État global
├── effects.js         # Génération des effets
├── spawn.js           # Création et spawn
├── update.js          # Mise à jour et collisions
├── draw.js            # Rendu visuel
├── test_integration.js # Intégration pour test
└── index.js           # API publique
```

## ⚠️ Notes Importantes
- **Aucun branchement automatique** : Les power-ups ne s'activent que par collecte
- **Effets temporaires** : Les power-ups restent actifs jusqu'à la fin de la partie
- **Compatibilité** : Fonctionne avec tous les types de lasers modulaires
- **Performance** : Optimisé pour 60 FPS

## 🐛 Dépannage
Si les power-ups n'apparaissent pas :
1. Vérifier la console pour les erreurs
2. S'assurer que `activateNeonPowerUpsTest()` est appelé
3. Vérifier que le canvas est initialisé
4. Utiliser `forceSpawnNeonPowerUp()` pour forcer l'apparition
