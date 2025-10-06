# 🛡️ Dossier Shield - Systèmes de Boucliers

Ce dossier contient tous les systèmes de boucliers du jeu, organisés de manière modulaire.

## 📁 Structure des Fichiers

### **Boucliers Principaux :**
- **`shield_simple.js`** - Bouclier simple (activé avec ESPACE)
- **`shield2_main.js`** - Bouclier sphérique avec révélation progressive
- **`shield3_main.js`** - Bouclier d'absorption + riposte
- **`golden_shield_system.js`** - Bouclier doré alvéolaire avec réflexion

### **Power-ups de Boucliers :**
- **`power_shield_common.js`** - Système commun pour les power-ups
- **`power_shield1.js`** - Power-up pour shield simple
- **`power_shield2.js`** - Power-up pour shield sphérique
- **`power_shield3.js`** - Power-up pour shield d'absorption

### **Modules de Support :**
- **`shield_geometry.js`** - Géométrie du bouclier simple
- **`shield_effects.js`** - Effets visuels du bouclier simple
- **`shield2_geometry.js`** - Géométrie du bouclier sphérique
- **`shield2_effects.js`** - Effets visuels du bouclier sphérique
- **`shield2_impacts.js`** - Gestion des impacts du bouclier sphérique
- **`shield3_geometry.js`** - Géométrie du bouclier d'absorption
- **`shield3_effects.js`** - Effets visuels du bouclier d'absorption
- **`shield3_lasers.js`** - Système de lasers de riposte

## 🎮 Contrôles

- **ESPACE** : Active/désactive le bouclier simple
- **V** : Active/désactive le bouclier doré (toggle)
- **C** : Active/désactive le bouclier d'absorption (toggle)

## 🔧 Fonctionnalités

### **Bouclier Simple :**
- Protection basique
- Activation temporaire avec ESPACE

### **Bouclier Sphérique :**
- Révélation progressive des segments
- Effets visuels avancés
- Gestion des impacts

### **Bouclier d'Absorption :**
- Absorbe les projectiles ennemis
- Riposte avec lasers automatiques
- Système de charge

### **Bouclier Doré :**
- Structure alvéolaire hexagonale
- Réflexion des projectiles (comme un miroir)
- Rotation 3D continue
- Effets de brillance et particules

## 📝 Notes

- Tous les imports ont été mis à jour pour pointer vers `../` pour les fichiers externes
- Les imports internes entre fichiers de shields utilisent des chemins relatifs
- Chaque système est modulaire et peut être activé/désactivé indépendamment



