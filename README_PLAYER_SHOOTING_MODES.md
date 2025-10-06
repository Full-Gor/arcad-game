# 🎯 Modes de Tir du Joueur - Système Néon

## 📋 **Vue d'ensemble**

Ce système permet au joueur (`starship`) d'utiliser **3 modes de tir spéciaux** selon les power-ups Néon collectés. Chaque power-up active automatiquement un mode de tir correspondant.

## 🔧 **Fichiers créés/modifiés**

### **Nouveau fichier :**
- `frontend/game/player_shooting_modes.js` - Système de tir spécial du joueur

### **Fichiers modifiés :**
- `frontend/game/main_simple.js` - Intégration dans la boucle de jeu
- `frontend/game/input_simple.js` - Contrôles pour le tir spécial
- `frontend/game/powerups/neon/update.js` - Activation automatique des modes

## 🎮 **Les 3 Modes de Tir - Correspondances Exactes**

### **1. 🚀 Power-up 1 (Vitesse) → Mode 1: Lasers**
- **Laser Pulsé** : Largeur variable avec pulsation (comme dans `lasers.js`)
- **Laser Balayant** : Mouvement de balayage horizontal (comme dans `lasers.js`)
- **Effet** : `neonPowerUps.speed` appliqué à la vitesse (`vy`)
- **Correspondance** : Utilise la logique de `bullets/types/lasers.js`

### **2. 🔫 Power-up 2 (Multishot) → Mode 2: Laser Beam**
- **Laser Beam** : Projectile énergétique avec balayage (comme dans `laser_beam.js`)
- **Effet** : `neonPowerUps.multishot` pour créer plusieurs projectiles
- **Décalage** : Les projectiles sont espacés horizontalement
- **Correspondance** : Utilise la logique de `bullets/types/laser_beam.js`

### **3. ⚡ Power-up 3 (Dégâts) → Mode 3: Laser Électrique**
- **Laser Électrique** : Avec arcs électriques et trainée (comme dans `electric_laser_serpentine.js`)
- **Effet** : `neonPowerUps.damage` appliqué à la largeur et longueur
- **Arcs** : Génération automatique d'arcs électriques
- **Mouvement** : Léger mouvement serpentin
- **Correspondance** : Utilise la logique de `bullets/types/electric_laser_serpentine.js`

## 🎯 **Comment ça fonctionne**

### **Activation automatique :**
1. Le joueur collecte un power-up Néon
2. Le système active automatiquement le mode correspondant
3. Le joueur tire maintenant avec le nouveau mode
4. Les effets s'accumulent si plusieurs power-ups sont collectés

### **Contrôles :**
- **Clic gauche** : Active le tir spécial
- **Relâchement** : Désactive le tir
- **Tir automatique** : Se déclenche selon l'intervalle configuré

## 🔄 **Intégration dans le jeu**

### **Dans `main_simple.js` :**
```javascript
// Import du nouveau système
import { shootPlayerSpecialBullet, updatePlayerSpecialBullets, drawPlayerSpecialBullets } from './player_shooting_modes.js';

// Dans la boucle de jeu
shootPlayerSpecialBullet();        // Gestion des tirs
updatePlayerSpecialBullets();      // Mise à jour des projectiles
drawPlayerSpecialBullets();        // Rendu des projectiles
```

### **Dans `input_simple.js` :**
```javascript
// Import de la fonction de tir
import { shootPlayerSpecialBullet } from './player_shooting_modes.js';

// Le clic gauche active maintenant le tir spécial
```

## 🎨 **Effets visuels**

### **Laser Pulsé :**
- Largeur qui pulse selon `pulsePhase`
- Trainée avec effet de transparence
- Lueur configurable selon les dégâts

### **Laser Balayant :**
- Mouvement sinusoïdal horizontal
- Couleur cyan avec lueur
- Balayage fluide et continu

### **Laser Beam :**
- Projectile fin et énergétique
- Couleur magenta avec lueur intense
- Balayage léger pour l'effet

### **Laser Électrique :**
- Arcs électriques aléatoires
- Trainée avec effet de transparence
- Largeur pulsante selon les dégâts

## ⚙️ **Configuration**

### **Intervalles de tir :**
- **Base** : 200ms entre chaque tir
- **Modifié par** : `neonPowerUps.speed`
- **Formule** : `baseShootInterval / speed`

### **Multiplicateurs :**
- **Vitesse** : Affecte `vy` des projectiles
- **Dégâts** : Affecte largeur et longueur
- **Multishot** : Nombre de projectiles créés

## 🧪 **Test du système**

### **Activation automatique :**
1. Démarrer le jeu
2. Attendre l'apparition des power-ups Néon (après 2 secondes)
3. Collecter un power-up pour voir le mode de tir changer
4. Utiliser le clic gauche pour tirer

### **Vérification des modes :**
- **Power-up 1** : Tir plus rapide avec lasers pulsés/balayants
- **Power-up 2** : Tir multiple avec laser beam
- **Power-up 3** : Tir plus large avec laser électrique

### **Tests automatisés :**
```javascript
// Importer le module de test
import { runAllTests, testInGame } from './player_shooting_test.js';

// Lancer tous les tests
runAllTests();

// Ou tester en jeu
testInGame();
```

### **Vérification des correspondances :**
- ✅ **Power-up Vitesse** → **Mode 1: Lasers** (pulsés + balayants)
- ✅ **Power-up Multishot** → **Mode 2: Laser Beam** (tir multiple)
- ✅ **Power-up Dégâts** → **Mode 3: Laser Électrique** (arcs + serpentin)

## 🔧 **Fonctions exportées**

### **Principales :**
- `shootPlayerSpecialBullet()` - Gère le tir
- `updatePlayerSpecialBullets()` - Met à jour les projectiles
- `drawPlayerSpecialBullets()` - Dessine les projectiles

### **Utilitaires :**
- `activatePlayerNeonPowerUp(type, value)` - Active un power-up
- `getPlayerPowerUpStatus()` - Retourne l'état des power-ups
- `resetPlayerPowerUps()` - Remet à zéro les power-ups
- `clearPlayerSpecialBullets()` - Nettoie tous les projectiles

## 🎯 **Compatibilité**

- ✅ **Système existant** : Ne remplace pas le système de tir normal
- ✅ **Power-ups Néon** : Intégration complète
- ✅ **Contrôles** : Utilise le même système d'input
- ✅ **Performance** : Optimisé pour la boucle de jeu

## 🚀 **Prochaines étapes possibles**

1. **Combinaisons** : Permettre la combinaison de plusieurs modes
2. **Animations** : Ajouter des transitions entre les modes
3. **Sons** : Intégrer des sons spécifiques à chaque mode
4. **Particules** : Ajouter des effets de particules avancés
5. **Upgrades** : Système de progression des power-ups
