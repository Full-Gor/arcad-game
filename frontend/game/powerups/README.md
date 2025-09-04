# ⚡ Dossier Powerups - Systèmes de Power-ups

Ce dossier contient tous les systèmes de power-ups du jeu, organisés de manière modulaire.

## 📁 Structure des Fichiers

### **Power-ups Principaux :**
- **`powerups.js`** - Système principal de gestion des power-ups (BonusManager)
- **`special_powerups.js`** - Power-ups spéciaux (Santé et IA)
- **`power_icons.js`** - Système d'icônes de pouvoirs

### **Power-ups de Boucliers :**
- **`power_shield_common.js`** - Système commun pour les power-ups de boucliers
- **`power_shield1.js`** - Power-up pour bouclier simple
- **`power_shield2.js`** - Power-up pour bouclier sphérique
- **`power_shield3.js`** - Power-up pour bouclier d'absorption

### **Power-ups Néon :**
- **`neon/`** - Dossier contenant le système de power-ups néon
  - `config.js` - Configuration des power-ups néon
  - `draw.js` - Rendu des power-ups néon
  - `effects.js` - Effets visuels néon
  - `index.js` - Point d'entrée du système néon
  - `spawn.js` - Génération des power-ups néon
  - `state.js` - Gestion de l'état des power-ups néon
  - `update.js` - Mise à jour des power-ups néon
  - `test_integration.js` - Tests d'intégration
  - `README.md` - Documentation du système néon

## 🎮 Types de Power-ups

### **Power-ups de Boucliers :**
- **Shield 1** : Active le bouclier simple
- **Shield 2** : Active le bouclier sphérique
- **Shield 3** : Active le bouclier d'absorption

### **Power-ups Spéciaux :**
- **Santé** : Restaure la vie du joueur
- **IA** : Améliore l'intelligence artificielle

### **Power-ups Néon :**
- Système avancé avec effets visuels néon
- Multiple types de power-ups avec animations

### **Icônes de Pouvoirs :**
- Affichage des pouvoirs actifs
- Interface utilisateur pour les capacités

## 🔧 Fonctionnalités

### **BonusManager :**
- Gestion centralisée de tous les power-ups
- Système de spawn automatique
- Gestion des collisions et collecte

### **Système Modulaire :**
- Chaque type de power-up est indépendant
- Facile d'ajouter de nouveaux types
- Configuration flexible

### **Effets Visuels :**
- Animations et particules
- Effets néon avancés
- Feedback visuel pour la collecte

## 📝 Notes

- Tous les imports ont été mis à jour pour pointer vers `../shield/` pour les boucliers
- Les imports internes entre fichiers de power-ups utilisent des chemins relatifs
- Chaque système est modulaire et peut être activé/désactivé indépendamment
- Le système néon a sa propre documentation dans `neon/README.md`



