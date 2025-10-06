/**
 * Gestionnaire Three.js pour les effets visuels
 * Système hybride : Canvas 2D (jeu) + Three.js (effets)
 */
export class ThreeJSManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.geodesicShield = null;
        this.isInitialized = false;
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        // Récupérer le canvas Three.js
        this.canvas = document.getElementById('threeCanvas');
        if (!this.canvas) {
            console.error('Canvas Three.js non trouvé !');
            return;
        }
        
        // Configuration de la scène
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000011, 5, 50);
        
        // Caméra orthographique pour correspondre au Canvas 2D
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -width / 2, width / 2,
            height / 2, -height / 2,
            0.1, 1000
        );
        this.camera.position.z = 10;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0); // Transparent
        this.renderer.setClearAlpha(0); // Alpha à 0 pour transparence totale
        
        
        // Lumières
        const ambientLight = new THREE.AmbientLight(0x001155, 0.4);
        this.scene.add(ambientLight);
        
        const coreLight = new THREE.PointLight(0x00ddff, 3, 10);
        coreLight.position.set(0, 0, 0);
        this.scene.add(coreLight);
        
        // Créer le bouclier géodésique
        this.createGeodesicShield();
        
        this.isInitialized = true;
        console.log('Three.js Manager initialisé !');
    }
    
    createGeodesicShield() {
        // Groupe principal pour la sphère
        this.geodesicShield = new THREE.Group();
        this.scene.add(this.geodesicShield);
        
        // Créer la structure géodésique
        this.createGeodesicStructure();
        
        // Créer les anneaux d'énergie
        this.createEnergyRings();
        
        // Créer le système de particules galactiques - DÉSACTIVÉ
        // this.createGalaxyParticles();
        
        // Position initiale (sera mise à jour)
        this.geodesicShield.position.set(0, 0, 0);
        this.geodesicShield.visible = false;
    }
    
    
    createGeodesicStructure() {
        // Géométrie icosaédrique subdivisée (structure de type football) - GIGANTESQUE
        const geodesicGeometry = new THREE.IcosahedronGeometry(45.0, 2); // 30x plus grand !
        
        // Matériau pour les facettes plates avec effet énergétique - PLUS VISIBLE
        const faceMaterial = new THREE.MeshPhongMaterial({
            color: 0x0099ff,
            emissive: 0x004488,
            emissiveIntensity: 0.8, // Plus lumineux
            flatShading: true,
            transparent: true,
            opacity: 0.95, // Plus opaque
            side: THREE.DoubleSide
        });
        
        // Mesh principal avec les facettes
        const geodesicMesh = new THREE.Mesh(geodesicGeometry, faceMaterial);
        this.geodesicShield.add(geodesicMesh);
        
        // Arêtes lumineuses entre les alvéoles - CYLINDRES VISIBLES
        this.createCylinderEdges(geodesicGeometry);
        
        // Seconde couche d'arêtes pour effet de lueur - CYLINDRES VISIBLES
        this.createGlowCylinderEdges(geodesicGeometry);
        
        // Points lumineux aux sommets
        const vertices = geodesicGeometry.attributes.position.array;
        const vertexGeometry = new THREE.BufferGeometry();
        vertexGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        const vertexMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 1.5, // 9x plus gros !
            transparent: true,
            opacity: 1.0, // Plus opaque
            blending: THREE.AdditiveBlending
        });
        const vertexPoints = new THREE.Points(vertexGeometry, vertexMaterial);
        this.geodesicShield.add(vertexPoints);
        
        // Noyau énergétique central - SUPPRIMÉ
        // const coreGeometry = new THREE.SphereGeometry(15.0, 32, 32);
        // const coreMaterial = new THREE.MeshBasicMaterial({
        //     color: 0x00ffff,
        //     transparent: true,
        //     opacity: 0.9
        // });
        // const core = new THREE.Mesh(coreGeometry, coreMaterial);
        // this.geodesicShield.add(core);
        
        // Stocker les références pour l'animation
        this.geodesicMesh = geodesicMesh;
        // this.edgeLines = edgeLines; // Remplacé par des cylindres
        this.vertexPoints = vertexPoints;
        // this.core = core; // Supprimé
        this.faceMaterial = faceMaterial;
        // this.edgeMaterial = edgeMaterial; // Remplacé par des cylindres
        // this.glowEdgeMaterial = glowEdgeMaterial; // Remplacé par des cylindres
        
    }
    
    createCylinderEdges(geodesicGeometry) {
        const edges = new THREE.EdgesGeometry(geodesicGeometry);
        const positions = edges.attributes.position.array;
        this.edgeCylinders = [];
        
        // Matériau pour les cylindres d'arêtes
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 1.0,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide
        });
        
        // Créer un cylindre pour chaque arête
        for (let i = 0; i < positions.length; i += 6) {
            const start = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const end = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
            
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            
            const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
            const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            
            cylinder.frustumCulled = false;
            cylinder.renderOrder = 1000;
            
            const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            cylinder.position.copy(midpoint);
            
            cylinder.lookAt(end);
            cylinder.rotateX(Math.PI / 2);
            
            this.geodesicShield.add(cylinder);
            this.edgeCylinders.push(cylinder);
        }
    }
    
    createGlowCylinderEdges(geodesicGeometry) {
        const edges = new THREE.EdgesGeometry(geodesicGeometry);
        const positions = edges.attributes.position.array;
        this.glowCylinders = [];
        
        // Matériau pour les cylindres de lueur
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            depthWrite: false, // Important pour la visibilité
            depthTest: false,  // Ignore le test de profondeur
            side: THREE.DoubleSide // Rendu des deux côtés
        });
        
        // Créer un cylindre plus épais pour chaque arête
        for (let i = 0; i < positions.length; i += 6) {
            const start = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const end = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
            
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            
            const cylinderGeometry = new THREE.CylinderGeometry(0.15, 0.15, length, 8);
            const cylinder = new THREE.Mesh(cylinderGeometry, glowMaterial);
            
            cylinder.frustumCulled = false;
            cylinder.renderOrder = 999;
            
            const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            cylinder.position.copy(midpoint);
            
            cylinder.lookAt(end);
            cylinder.rotateX(Math.PI / 2);
            
            cylinder.scale.setScalar(1.02);
            
            this.geodesicShield.add(cylinder);
            this.glowCylinders.push(cylinder);
        }
    }
    
    createEnergyRings() {
        const ringsPerWave = 3;
        const totalWaves = 3;
        const ringCount = ringsPerWave * totalWaves;
        
        for(let i = 0; i < ringCount; i++) {
            const ringGroup = new THREE.Group();
            
            const minRadius = 3.0; // 30x plus gros !
            const maxRadius = 30.0; // 30x plus gros !
            
            const ringGeometry = new THREE.TorusGeometry(minRadius, 0.3, 4, 20); // 15x plus épais !
            
            // Vérifier que les valeurs ne sont pas NaN
            if (isNaN(minRadius) || isNaN(maxRadius)) {
                console.warn('Valeurs NaN détectées dans les anneaux, utilisation de valeurs par défaut');
                minRadius = 3.0;
                maxRadius = 30.0;
            }
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.9 // Plus opaque
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
                waveDelay: waveIndex * 2,
                ringDelay: indexInWave * 0.1,
                isActive: false,
                ring: ring,
                minRadius: minRadius,
                maxRadius: maxRadius,
                currentY: -1
            };
            
            this.energyRings = this.energyRings || [];
            this.energyRings.push(ringGroup);
            this.scene.add(ringGroup);
        }
    }
    
    createGalaxyParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 50000; // ENCORE plus de particules pour une galaxie dense !
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);
        this.particleData = [];
        
        // Créer une spirale galactique
        for(let i = 0; i < particlesCount; i++) {
            const t = Math.random();
            const spiralArms = 3;
            const armIndex = Math.floor(Math.random() * spiralArms);
            const armOffset = (armIndex * 2 * Math.PI) / spiralArms;
            
            const baseAngle = t * Math.PI * 3;
            const angle = baseAngle + armOffset;
            
            const minRadius = 20.0; // Plus proche du bouclier
            const maxRadius = 60.0; // Plus compact pour une galaxie dense
            const baseRadius = minRadius + t * (maxRadius - minRadius);
            
            const layer = Math.random();
            let finalRadius, finalAngle;
            
            if(layer < 0.7) {
                const armThickness = 0.8;
                const spread = (Math.random() - 0.5) * armThickness * Math.exp(-t * 1.2);
                finalRadius = baseRadius + spread;
                finalAngle = angle + (Math.random() - 0.5) * 0.3 / baseRadius;
            } else if(layer < 0.9) {
                const spread = (Math.random() - 0.5) * 1.5 * Math.exp(-t * 1.5);
                finalRadius = baseRadius + spread;
                finalAngle = angle + (Math.random() - 0.5) * 0.5 / baseRadius;
            } else {
                finalRadius = baseRadius + (Math.random() - 0.5) * 1.5;
                finalAngle = angle + Math.random() * Math.PI * 2;
            }
            
            positions[i * 3] = Math.cos(finalAngle) * finalRadius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 4.0; // Encore plus de hauteur pour l'effet 3D
            positions[i * 3 + 2] = Math.sin(finalAngle) * finalRadius;
            
            const normalizedRadius = (finalRadius - minRadius) / (maxRadius - minRadius);
            const intensity = Math.max(0, 1 - normalizedRadius * 0.6);
            
            if(layer < 0.7) {
                const cyanIntensity = 0.6 + intensity * 0.4;
                colors[i * 3] = 0.0;
                colors[i * 3 + 1] = 0.5 * cyanIntensity;
                colors[i * 3 + 2] = 1.0 * cyanIntensity;
            } else if(layer < 0.9) {
                colors[i * 3] = 0.0;
                colors[i * 3 + 1] = 0.1 + intensity * 0.2;
                colors[i * 3 + 2] = 0.3 + intensity * 0.3;
            } else {
                colors[i * 3] = 0.0;
                colors[i * 3 + 1] = 0.02;
                colors[i * 3 + 2] = 0.05;
            }
            
            this.particleData.push({
                angle: finalAngle,
                radius: finalRadius,
                speed: 0.04 / (1 + normalizedRadius * 3),
                layer: layer
            });
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 2.0, // BEAUCOUP plus gros pour être visible !
            transparent: true,
            opacity: 0.8, // Bien visible
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: false
        });
        
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.particles.position.y = 0;
        this.particles.rotation.x = Math.PI / 2; // Rotation de 90° pour voir la spirale du dessus
        this.scene.add(this.particles);
    }
    
    update() {
        if (!this.isInitialized) return;
        
        const elapsedTime = this.clock.getElapsedTime();
        
        // Rotation de la structure géodésique
        this.geodesicShield.rotation.y = elapsedTime * 0.8;
        
        // Pulsation de la structure - PLUS VISIBLE
        const structurePulse = 1 + Math.sin(elapsedTime * 2) * 0.1; // Plus prononcée
        this.geodesicMesh.scale.set(structurePulse, structurePulse, structurePulse);
        // this.edgeLines.scale.set(structurePulse, structurePulse, structurePulse); // SUPPRIMÉ - arêtes fixes
        this.vertexPoints.scale.set(structurePulse, structurePulse, structurePulse);
        
        // Animation du noyau - SUPPRIMÉ
        // const corePulse = 0.8 + Math.sin(elapsedTime * 3) * 0.3;
        // this.core.scale.set(corePulse, corePulse, corePulse);
        // this.core.material.opacity = 0.9 + Math.sin(elapsedTime * 4) * 0.3;
        
        // Opacité fixe des facettes
        this.faceMaterial.opacity = 0.9;
        this.faceMaterial.emissiveIntensity = 0.8;
        
        // Arêtes CYAN FIXES - CYLINDRES VISIBLES
        // Les cylindres gardent leur couleur fixe automatiquement
        
        // Animation des anneaux par vagues
        this.updateRings(elapsedTime);
        
        // Animation des particules galactiques - DÉSACTIVÉ
        // this.updateParticles();
        
        // Rendu
        this.renderer.render(this.scene, this.camera);
    }
    
    updateRings(elapsedTime) {
        if (!this.energyRings) return;
        
        this.energyRings.forEach((ringGroup) => {
            const userData = ringGroup.userData;
            const waveStartTime = userData.waveDelay + userData.ringDelay;
            
            if(elapsedTime > waveStartTime && !userData.isActive) {
                userData.isActive = true;
                userData.currentY = -1;
                ringGroup.position.y = -1;
            }
            
            if(userData.isActive) {
                userData.currentY += 0.015;
                ringGroup.position.y = userData.currentY;
                
                const normalizedY = Math.max(0, Math.min(1, (userData.currentY + 1) / 2));
                const sphereProfile = Math.sqrt(Math.max(0, 1 - Math.pow(normalizedY * 2 - 1, 2)));
                
                const developmentFactor = Math.min(1, Math.max(0, (userData.currentY + 1) / 0.5));
                const targetRadius = userData.minRadius + sphereProfile * (userData.maxRadius - userData.minRadius);
                let currentRadius = targetRadius * developmentFactor;
                
                // Vérifier que currentRadius n'est pas NaN ou invalide
                if (isNaN(currentRadius) || currentRadius <= 0 || !isFinite(currentRadius)) {
                    currentRadius = userData.minRadius;
                }
                
                ringGroup.userData.ring.geometry.dispose();
                ringGroup.userData.ring.geometry = new THREE.TorusGeometry(
                    currentRadius, 
                    0.01 * developmentFactor,
                    4, 
                    20
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
                
                if(userData.currentY > 1) {
                    userData.isActive = false;
                    userData.currentY = -1;
                    ringGroup.position.y = -1;
                    userData.waveDelay = elapsedTime + 3 * 2 - userData.waveIndex * 2;
                }
            }
        });
    }
    
    updateParticles() {
        if (!this.particles || !this.particleData) return;
        
        const particlePositions = this.particles.geometry.attributes.position.array;
        for(let i = 0; i < this.particleData.length; i++) {
            const data = this.particleData[i];
            data.angle += data.speed * 0.01;
            
            particlePositions[i * 3] = Math.cos(data.angle) * data.radius;
            particlePositions[i * 3 + 2] = Math.sin(data.angle) * data.radius;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.rotation.y += 0.005; // Rotation plus rapide pour la spirale vue du dessus
    }
    
    setShieldPosition(x, y) {
        if (!this.geodesicShield) return;
        
        // Convertir les coordonnées Canvas 2D vers Three.js
        const centerX = x - window.innerWidth / 2;
        const centerY = -(y - window.innerHeight / 2);
        
        this.geodesicShield.position.set(centerX, centerY, 0);
    }
    
    activateShield() {
        if (this.geodesicShield) {
            this.geodesicShield.visible = true;
            console.log('🛡️ Bouclier géodésique Three.js activé !');
        }
    }
    
    deactivateShield() {
        if (this.geodesicShield) {
            this.geodesicShield.visible = false;
        }
    }
    
    resize() {
        if (!this.isInitialized) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.left = -width / 2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = -height / 2;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
    }
    
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.scene) {
            this.scene.clear();
        }
    }
}
