// Script 2 - À coller ici  
// Ce fichier est prêt pour recevoir votre deuxième script
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bouclier Géodésique - Structure Alvéolaire</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background: radial-gradient(ellipse at center, #000033 0%, #000000 100%);
            font-family: 'Courier New', monospace;
        }
        
        canvas {
            display: block;
        }
        
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: #00ffff;
            text-shadow: 0 0 20px #00ffff, 0 0 40px #0088ff;
            font-size: 11px;
            user-select: none;
            opacity: 0.9;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <script>
        // Configuration de la scène
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000011, 5, 50);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(5, 2, 5);
        camera.lookAt(0, 0, 0);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0.9);
        document.body.appendChild(renderer.domElement);
        
        // Contrôles OrbitControls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 3;
        controls.maxDistance = 15;
        controls.maxPolarAngle = Math.PI;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        
        // Lumières
        const ambientLight = new THREE.AmbientLight(0x001155, 0.4);
        scene.add(ambientLight);
        
        const coreLight = new THREE.PointLight(0x00ddff, 3, 10);
        coreLight.position.set(0, 0, 0);
        scene.add(coreLight);
        
        const rimLight = new THREE.DirectionalLight(0x00ffff, 0.5);
        rimLight.position.set(5, 5, 5);
        scene.add(rimLight);
        
        // Groupe principal pour la sphère
        const shieldGroup = new THREE.Group();
        scene.add(shieldGroup);
        
        // Création de la structure géodésique avec hexagones et pentagones
        // Utilisation d'une géométrie icosaédrique subdivisée (structure de type football)
        const geodesicGeometry = new THREE.IcosahedronGeometry(2, 2);
        
        // Matériau pour les facettes plates avec effet énergétique
        const faceMaterial = new THREE.MeshPhongMaterial({
            color: 0x0099ff,
            emissive: 0x004488,
            emissiveIntensity: 0.3,
            flatShading: true, // IMPORTANT: Facettes plates, pas lissées
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        // Mesh principal avec les facettes
        const geodesicMesh = new THREE.Mesh(geodesicGeometry, faceMaterial);
        shieldGroup.add(geodesicMesh);
        
        // Création des arêtes lumineuses entre les alvéoles
        const edgeGeometry = new THREE.EdgesGeometry(geodesicGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            linewidth: 2,
            transparent: true,
            opacity: 0.9
        });
        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        shieldGroup.add(edgeLines);
        
        // Ajout d'une seconde couche d'arêtes pour effet de lueur
        const glowEdgeMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            transparent: true,
            opacity: 0.3
        });
        const glowEdges = new THREE.LineSegments(edgeGeometry, glowEdgeMaterial);
        glowEdges.scale.set(1.01, 1.01, 1.01);
        shieldGroup.add(glowEdges);
        
        // Points lumineux aux sommets (vertices)
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
        shieldGroup.add(vertexPoints);
        
        // Noyau énergétique central
        const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        shieldGroup.add(core);
        
        // Anneaux d'énergie par VAGUES - PLUS ESPACÉS de la sphère
        const rings = [];
        const ringsPerWave = 5;
        const totalWaves = 6;
        const ringCount = ringsPerWave * totalWaves;
        
        for(let i = 0; i < ringCount; i++) {
            const ringGroup = new THREE.Group();
            
            const minRadius = 0.3;  // Plus espacé du pôle (était 0.05)
            const maxRadius = 2.5;  // Plus espacé de l'équateur (était 2.0)
            
            const ringGeometry = new THREE.TorusGeometry(minRadius, 0.025, 4, 40);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            
            ringGroup.add(ring);
            ringGroup.position.y = -2;
            
            const waveIndex = Math.floor(i / ringsPerWave);
            const indexInWave = i % ringsPerWave;
            
            ringGroup.userData = { 
                waveIndex: waveIndex,
                indexInWave: indexInWave,
                waveDelay: waveIndex * 3,
                ringDelay: indexInWave * 0.08,
                isActive: false,
                ring: ring,
                minRadius: minRadius,
                maxRadius: maxRadius,
                currentY: -2
            };
            
            rings.push(ringGroup);
            scene.add(ringGroup);
        }
        
        // Système de particules ULTRA DENSE avec branches LARGES
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 50000;
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);
        const sizes = new Float32Array(particlesCount);
        const particleData = [];
        
        // Créer une spirale galactique avec branches DEUX FOIS PLUS LARGES
        for(let i = 0; i < particlesCount; i++) {
            const t = Math.random();
            const spiralArms = 3;
            const armIndex = Math.floor(Math.random() * spiralArms);
            const armOffset = (armIndex * 2 * Math.PI) / spiralArms;
            
            // Spirale avec le même espacement mais branches plus larges
            const spiralTightness = 0.05;
            const baseAngle = t * Math.PI * 3;
            const angle = baseAngle + armOffset;
            
            // Spirale plus VASTE
            const minRadius = 2.3;
            const maxRadius = 8; // Plus étendu (était 5)
            const baseRadius = minRadius + t * (maxRadius - minRadius);
            
            // Triple couche avec branches BEAUCOUP plus larges
            const layer = Math.random();
            let finalRadius, finalAngle;
            
            if(layer < 0.7) {
                // Couche principale - bras TRÈS larges
                const armThickness = 1.6; // DOUBLÉ (était 0.8)
                const spread = (Math.random() - 0.5) * armThickness * Math.exp(-t * 1.2);
                finalRadius = baseRadius + spread;
                // Dispersion angulaire plus large pour épaissir les branches
                finalAngle = angle + (Math.random() - 0.5) * 0.6 / baseRadius; // DOUBLÉ
            } else if(layer < 0.9) {
                // Couche intermédiaire - zone de transition élargie
                const spread = (Math.random() - 0.5) * 3 * Math.exp(-t * 1.5); // DOUBLÉ
                finalRadius = baseRadius + spread;
                finalAngle = angle + (Math.random() - 0.5) * 1.0 / baseRadius; // DOUBLÉ
            } else {
                // Halo externe - matière noire
                finalRadius = baseRadius + (Math.random() - 0.5) * 3;
                finalAngle = angle + Math.random() * Math.PI * 2;
            }
            
            // Position PLATE
            positions[i * 3] = Math.cos(finalAngle) * finalRadius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
            positions[i * 3 + 2] = Math.sin(finalAngle) * finalRadius;
            
            // Couleurs avec gradient ajusté pour la nouvelle taille
            const normalizedRadius = (finalRadius - minRadius) / (maxRadius - minRadius);
            const intensity = Math.max(0, 1 - normalizedRadius * 0.6);
            
            if(layer < 0.7) {
                // Particules brillantes dans les bras (plus nombreuses)
                const cyanIntensity = 0.6 + intensity * 0.4;
                colors[i * 3] = 0.0;
                colors[i * 3 + 1] = 0.5 * cyanIntensity;
                colors[i * 3 + 2] = 1.0 * cyanIntensity;
                sizes[i] = 0.008 + intensity * 0.012;
            } else if(layer < 0.9) {
                // Zone de transition - cyan sombre
                colors[i * 3] = 0.0;
                colors[i * 3 + 1] = 0.1 + intensity * 0.2;
                colors[i * 3 + 2] = 0.3 + intensity * 0.3;
                sizes[i] = 0.006 + intensity * 0.008;
            } else {
                // Halo - matière noire
                colors[i * 3] = 0.0;
                colors[i * 3 + 1] = 0.02;
                colors[i * 3 + 2] = 0.05;
                sizes[i] = 0.005;
            }
            
            particleData.push({
                angle: finalAngle,
                radius: finalRadius,
                speed: 0.08 / (1 + normalizedRadius * 3),
                layer: layer
            });
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.01,
            transparent: true,
            opacity: 0.98,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: false
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        particles.position.y = 0;
        scene.add(particles);
        
        // Grille hexagonale au sol
        const gridHelper = new THREE.GridHelper(20, 40, 0x00ffff, 0x003366);
        gridHelper.position.y = -4;
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);
        
        // Anneaux d'onde au sol
        const groundRings = [];
        for(let i = 0; i < 4; i++) {
            const groundRingGeometry = new THREE.RingGeometry(2 + i * 1.2, 2.1 + i * 1.2, 6);
            const groundRingMaterial = new THREE.MeshBasicMaterial({
                color: 0x0088ff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.15 - i * 0.03
            });
            const groundRing = new THREE.Mesh(groundRingGeometry, groundRingMaterial);
            groundRing.rotation.x = -Math.PI / 2;
            groundRing.position.y = -3.99;
            groundRings.push(groundRing);
            scene.add(groundRing);
        }
        
        // Variables d'animation
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            
            const elapsedTime = clock.getElapsedTime();
            
            // Mise à jour des contrôles
            controls.update();
            
            // Rotation verticale de la structure géodésique PLUS RAPIDE
            shieldGroup.rotation.y = elapsedTime * 0.8; // Vitesse x4 (était 0.2)
            
            // Pulsation subtile de la structure
            const structurePulse = 1 + Math.sin(elapsedTime * 2) * 0.02;
            geodesicMesh.scale.set(structurePulse, structurePulse, structurePulse);
            edgeLines.scale.set(structurePulse, structurePulse, structurePulse);
            vertexPoints.scale.set(structurePulse, structurePulse, structurePulse);
            
            // Animation du noyau
            const corePulse = 0.5 + Math.sin(elapsedTime * 3) * 0.1;
            core.scale.set(corePulse, corePulse, corePulse);
            core.material.opacity = 0.6 + Math.sin(elapsedTime * 4) * 0.2;
            
            // Opacité FIXE des facettes (pas d'oscillation)
            faceMaterial.opacity = 0.5; // Opacité constante
            faceMaterial.emissiveIntensity = 0.5; // Intensité émissive constante
            
            // Animation des arêtes (garde une légère variation pour l'effet énergétique)
            edgeMaterial.opacity = 0.9 + Math.sin(elapsedTime * 4) * 0.05;
            glowEdgeMaterial.opacity = 0.3 + Math.sin(elapsedTime * 5) * 0.05;
            
            // Animation des anneaux par VAGUES successives
            rings.forEach((ringGroup) => {
                const userData = ringGroup.userData;
                const waveStartTime = userData.waveDelay + userData.ringDelay;
                
                // Activation par vague
                if(elapsedTime > waveStartTime && !userData.isActive) {
                    userData.isActive = true;
                    userData.currentY = -2;
                    ringGroup.position.y = -2;
                }
                
                if(userData.isActive) {
                    // Montée PLUS DOUCE
                    userData.currentY += 0.015; // Vitesse réduite (était 0.025)
                    ringGroup.position.y = userData.currentY;
                    
                    // Calcul du rayon avec développement progressif
                    const normalizedY = (userData.currentY + 2) / 4;
                    const sphereProfile = Math.sqrt(1 - Math.pow(normalizedY * 2 - 1, 2));
                    
                    // Développement progressif de l'anneau
                    const developmentFactor = Math.min(1, (userData.currentY + 2) / 0.5); // Croissance progressive
                    const targetRadius = userData.minRadius + sphereProfile * userData.maxRadius;
                    const currentRadius = targetRadius * developmentFactor;
                    
                    // Mise à jour douce de la géométrie
                    ringGroup.userData.ring.geometry.dispose();
                    ringGroup.userData.ring.geometry = new THREE.TorusGeometry(
                        currentRadius, 
                        0.025 * developmentFactor, // L'épaisseur grandit aussi
                        4, 
                        40
                    );
                    
                    // Fade in/out progressif
                    let opacity;
                    if(normalizedY < 0.1) {
                        // Fade in au début
                        opacity = normalizedY * 10 * 0.7;
                    } else if(normalizedY > 0.9) {
                        // Fade out à la fin
                        opacity = (1 - normalizedY) * 10 * 0.7;
                    } else {
                        // Opacité maximale au milieu
                        opacity = 0.7;
                    }
                    ringGroup.userData.ring.material.opacity = opacity;
                    
                    // Reset et désactivation quand l'anneau atteint le pôle nord
                    if(userData.currentY > 2) {
                        userData.isActive = false;
                        userData.currentY = -2;
                        ringGroup.position.y = -2;
                        
                        // Réactiver après toutes les vagues
                        userData.waveDelay = elapsedTime + totalWaves * 3 - userData.waveIndex * 3;
                    }
                }
            });
            
            // Animation de la galaxie de particules
            const particlePositions = particles.geometry.attributes.position.array;
            for(let i = 0; i < particlesCount; i++) {
                const data = particleData[i];
                
                // Rotation lente de la galaxie
                data.angle += data.speed * 0.01;
                
                // Mise à jour de la position (reste plate)
                particlePositions[i * 3] = Math.cos(data.angle) * data.radius;
                // Y reste proche de 0 pour garder la galaxie plate
                particlePositions[i * 3 + 2] = Math.sin(data.angle) * data.radius;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            
            // Rotation lente de la galaxie entière
            particles.rotation.y += 0.002;
            
            // Animation des anneaux au sol
            groundRings.forEach((ring, index) => {
                const scale = 1 + Math.sin(elapsedTime * 2 - index * 0.5) * 0.05;
                ring.scale.set(scale, scale, 1);
                ring.material.opacity = 0.15 - index * 0.03 + Math.sin(elapsedTime * 3 - index) * 0.02;
                ring.rotation.z = elapsedTime * 0.1 * (index % 2 === 0 ? 1 : -1);
            });
            
            // Variation de l'intensité lumineuse
            coreLight.intensity = 3 + Math.sin(elapsedTime * 4) * 0.5;
            rimLight.intensity = 0.5 + Math.sin(elapsedTime * 3) * 0.2;
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Gestion du redimensionnement
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>