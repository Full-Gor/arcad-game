/**
 * Module du Bouclier Géodésique - Structure Alvéolaire
 * Effet visuel Three.js pour le jeu Space Shooter
 * Version adaptée pour le jeu (vue du haut, taille vaisseau)
 */
export class GeodesicShield {
    constructor(scene) {
        this.scene = scene;
        this.shieldGroup = null;
        this.rings = [];
        this.particles = null;
        this.clock = new THREE.Clock();
        this.isActive = false;
        this.scale = 0.15; // Échelle réduite pour s'adapter au vaisseau
        
        this.init();
    }

    init() {
        // Créer le groupe principal pour la sphère
        this.shieldGroup = new THREE.Group();
        this.shieldGroup.scale.set(this.scale, this.scale, this.scale);
        this.scene.add(this.shieldGroup);

        // Créer la structure géodésique
        this.createGeodesicStructure();
        
        // Créer les anneaux d'énergie (réduits)
        this.createEnergyRings();
        
        // Pas de particules galactiques ni d'effets au sol pour le jeu
        // this.createGalaxyParticles();
        // this.createGroundEffects();
    }

    createGeodesicStructure() {
        // Géométrie icosaédrique subdivisée (structure de type football)
        const geodesicGeometry = new THREE.IcosahedronGeometry(2, 2);
        
        // Matériau pour les facettes plates avec effet énergétique
        const faceMaterial = new THREE.MeshPhongMaterial({
            color: 0x0099ff,
            emissive: 0x004488,
            emissiveIntensity: 0.3,
            flatShading: true,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        // Mesh principal avec les facettes
        const geodesicMesh = new THREE.Mesh(geodesicGeometry, faceMaterial);
        this.shieldGroup.add(geodesicMesh);
        
        // Arêtes lumineuses entre les alvéoles
        const edgeGeometry = new THREE.EdgesGeometry(geodesicGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            linewidth: 2,
            transparent: true,
            opacity: 0.9
        });
        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        this.shieldGroup.add(edgeLines);
        
        // Seconde couche d'arêtes pour effet de lueur
        const glowEdgeMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            transparent: true,
            opacity: 0.3
        });
        const glowEdges = new THREE.LineSegments(edgeGeometry, glowEdgeMaterial);
        glowEdges.scale.set(1.01, 1.01, 1.01);
        this.shieldGroup.add(glowEdges);
        
        // Points lumineux aux sommets
        const vertices = geodesicGeometry.attributes.position.array;
        const vertexGeometry = new THREE.BufferGeometry();
        vertexGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        const vertexMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const vertexPoints = new THREE.Points(vertexGeometry, vertexMaterial);
        this.shieldGroup.add(vertexPoints);
        
        // Noyau énergétique central
        const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        this.shieldGroup.add(core);
        
        // Stocker les références pour l'animation
        this.geodesicMesh = geodesicMesh;
        this.edgeLines = edgeLines;
        this.vertexPoints = vertexPoints;
        this.core = core;
        this.faceMaterial = faceMaterial;
        this.edgeMaterial = edgeMaterial;
        this.glowEdgeMaterial = glowEdgeMaterial;
    }

    createEnergyRings() {
        const ringsPerWave = 3; // Réduit pour le jeu
        const totalWaves = 3;   // Réduit pour le jeu
        const ringCount = ringsPerWave * totalWaves;
        
        for(let i = 0; i < ringCount; i++) {
            const ringGroup = new THREE.Group();
            
            const minRadius = 0.1;  // Adapté à la taille du bouclier
            const maxRadius = 1.0;  // Adapté à la taille du bouclier
            
            const ringGeometry = new THREE.TorusGeometry(minRadius, 0.01, 4, 20); // Plus simple
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.6
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            
            ringGroup.add(ring);
            ringGroup.position.y = -1;
            
            const waveIndex = Math.floor(i / ringsPerWave);
            const indexInWave = i % ringsPerWave;
            
            ringGroup.userData = { 
                waveIndex: waveIndex,
                indexInWave: indexInWave,
                waveDelay: waveIndex * 2, // Plus rapide
                ringDelay: indexInWave * 0.1,
                isActive: false,
                ring: ring,
                minRadius: minRadius,
                maxRadius: maxRadius,
                currentY: -1
            };
            
            this.rings.push(ringGroup);
            this.shieldGroup.add(ringGroup); // Ajouté au groupe du bouclier
        }
    }

    // Méthodes supprimées pour la version jeu

    update() {
        if (!this.isActive) return;
        
        const elapsedTime = this.clock.getElapsedTime();
        
        // Rotation de la structure géodésique
        this.shieldGroup.rotation.y = elapsedTime * 0.8;
        
        // Pulsation de la structure
        const structurePulse = 1 + Math.sin(elapsedTime * 2) * 0.02;
        this.geodesicMesh.scale.set(structurePulse, structurePulse, structurePulse);
        this.edgeLines.scale.set(structurePulse, structurePulse, structurePulse);
        this.vertexPoints.scale.set(structurePulse, structurePulse, structurePulse);
        
        // Animation du noyau
        const corePulse = 0.5 + Math.sin(elapsedTime * 3) * 0.1;
        this.core.scale.set(corePulse, corePulse, corePulse);
        this.core.material.opacity = 0.6 + Math.sin(elapsedTime * 4) * 0.2;
        
        // Opacité fixe des facettes
        this.faceMaterial.opacity = 0.5;
        this.faceMaterial.emissiveIntensity = 0.5;
        
        // Animation des arêtes
        this.edgeMaterial.opacity = 0.9 + Math.sin(elapsedTime * 4) * 0.05;
        this.glowEdgeMaterial.opacity = 0.3 + Math.sin(elapsedTime * 5) * 0.05;
        
        // Animation des anneaux par vagues
        this.updateRings(elapsedTime);
        
        // Pas d'animation des particules ni des anneaux au sol dans le jeu
    }

    updateRings(elapsedTime) {
        this.rings.forEach((ringGroup) => {
            const userData = ringGroup.userData;
            const waveStartTime = userData.waveDelay + userData.ringDelay;
            
            if(elapsedTime > waveStartTime && !userData.isActive) {
                userData.isActive = true;
                userData.currentY = -2;
                ringGroup.position.y = -2;
            }
            
            if(userData.isActive) {
                userData.currentY += 0.015;
                ringGroup.position.y = userData.currentY;
                
                const normalizedY = (userData.currentY + 2) / 4;
                const sphereProfile = Math.sqrt(1 - Math.pow(normalizedY * 2 - 1, 2));
                
                const developmentFactor = Math.min(1, (userData.currentY + 2) / 0.5);
                const targetRadius = userData.minRadius + sphereProfile * userData.maxRadius;
                const currentRadius = targetRadius * developmentFactor;
                
                ringGroup.userData.ring.geometry.dispose();
                ringGroup.userData.ring.geometry = new THREE.TorusGeometry(
                    currentRadius, 
                    0.025 * developmentFactor,
                    4, 
                    40
                );
                
                let opacity;
                if(normalizedY < 0.1) {
                    opacity = normalizedY * 10 * 0.7;
                } else if(normalizedY > 0.9) {
                    opacity = (1 - normalizedY) * 10 * 0.7;
                } else {
                    opacity = 0.7;
                }
                ringGroup.userData.ring.material.opacity = opacity;
                
                if(userData.currentY > 1) { // Adapté à la nouvelle taille
                    userData.isActive = false;
                    userData.currentY = -1;
                    ringGroup.position.y = -1;
                    userData.waveDelay = elapsedTime + 3 * 2 - userData.waveIndex * 2;
                }
            }
        });
    }

    // Méthodes supprimées pour la version jeu - pas de particules ni d'effets au sol

    activate() {
        this.isActive = true;
        this.shieldGroup.visible = true;
    }

    deactivate() {
        this.isActive = false;
        this.shieldGroup.visible = false;
    }

    setPosition(x, y, z) {
        this.shieldGroup.position.set(x, y, z);
    }

    dispose() {
        // Nettoyer les ressources Three.js
        this.scene.remove(this.shieldGroup);
        // Les anneaux sont maintenant dans shieldGroup, donc supprimés automatiquement
    }
}
