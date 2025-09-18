




<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bouclier d'Énergie - Vortex Galactique</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background: radial-gradient(ellipse at center, #000033 0%, #000000 100%);
            font-family: Arial, sans-serif;
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
            font-size: 12px;
            user-select: none;
            opacity: 0.8;
            font-weight: bold;
            letter-spacing: 2px;
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
        camera.position.set(4, 1, 4);
        camera.lookAt(0, 0, 0);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0.8);
        document.body.appendChild(renderer.domElement);
        
        // Contrôles OrbitControls pour interaction utilisateur
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 2;
        controls.maxDistance = 15;
        controls.maxPolarAngle = Math.PI;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        
        // Lumières
        const ambientLight = new THREE.AmbientLight(0x001155, 0.5);
        scene.add(ambientLight);
        
        const coreLight = new THREE.PointLight(0x00ddff, 3, 8);
        coreLight.position.set(0, 0, 0);
        scene.add(coreLight);
        
        const topLight = new THREE.PointLight(0x00ffff, 2, 5);
        topLight.position.set(0, 2, 0);
        scene.add(topLight);
        
        // Groupe principal pour la sphère
        const shieldGroup = new THREE.Group();
        scene.add(shieldGroup);
        
        // Création de la sphère hexagonale principale (structure alvéolaire)
        const sphereGeometry = new THREE.IcosahedronGeometry(1.5, 1);
        
        // Matériau pour les arêtes hexagonales
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            linewidth: 2,
            transparent: true,
            opacity: 0.9
        });
        
        // Créer les arêtes pour effet alvéolaire
        const edges = new THREE.EdgesGeometry(sphereGeometry);
        const wireframe = new THREE.LineSegments(edges, edgeMaterial);
        shieldGroup.add(wireframe);
        
        // Sphère avec faces hexagonales semi-transparentes
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x0099ff,
            emissive: 0x004488,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            flatShading: true
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        shieldGroup.add(sphere);
        
        // Sphère intérieure lumineuse (noyau)
        const coreGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.4
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        shieldGroup.add(core);
        
        // Anneaux d'énergie qui montent du pôle sud au pôle nord
        const rings = [];
        const ringCount = 12;
        
        for(let i = 0; i < ringCount; i++) {
            const ringGroup = new THREE.Group();
            
            // Taille variable : petit aux pôles, large au milieu
            const t = i / (ringCount - 1); // 0 à 1
            const sizeMultiplier = Math.sin(t * Math.PI); // Courbe en cloche
            const radius = 0.2 + sizeMultiplier * 1.8;
            
            const ringGeometry = new THREE.TorusGeometry(radius, 0.02 + sizeMultiplier * 0.03, 6, 40);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0.0, 0.5 + sizeMultiplier * 0.5, 1.0),
                transparent: true,
                opacity: 0.4 + sizeMultiplier * 0.4
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            
            // Position verticale du pôle sud (-1.5) au pôle nord (1.5)
            const yPos = -1.5 + (i / (ringCount - 1)) * 3;
            ringGroup.position.y = yPos;
            
            ringGroup.add(ring);
            ringGroup.userData = { 
                baseY: yPos,
                phase: i * 0.5,
                radius: radius,
                speed: 1 + i * 0.1
            };
            
            rings.push(ringGroup);
            scene.add(ringGroup);
        }
        
        // Système de particules en spirale galactique
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2000;
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);
        const particleData = [];
        
        // Créer une spirale galactique
        for(let i = 0; i < particlesCount; i++) {
            // Paramètres de la spirale
            const t = i / particlesCount;
            const spiralArms = 3; // Nombre de bras de la spirale
            const angle = t * Math.PI * 8 + (Math.floor(i / (particlesCount / spiralArms)) * 2 * Math.PI / spiralArms);
            const radius = 0.5 + t * 3;
            const height = (t - 0.5) * 6;
            
            // Position avec variation aléatoire
            const randomRadius = radius + (Math.random() - 0.5) * 0.5;
            positions[i * 3] = Math.cos(angle) * randomRadius;
            positions[i * 3 + 1] = height + (Math.random() - 0.5) * 0.3;
            positions[i * 3 + 2] = Math.sin(angle) * randomRadius;
            
            // Couleur gradient du bleu au cyan
            colors[i * 3] = 0.0;
            colors[i * 3 + 1] = 0.5 + t * 0.5;
            colors[i * 3 + 2] = 1.0;
            
            // Stocker les données pour l'animation
            particleData.push({
                angle: angle,
                radius: randomRadius,
                baseHeight: height,
                speed: 0.5 + Math.random() * 0.5,
                verticalSpeed: 0.01 + Math.random() * 0.02
            });
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.03,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);
        
        // Grille au sol avec effet d'énergie
        const gridHelper = new THREE.GridHelper(15, 30, 0x00ffff, 0x003366);
        gridHelper.position.y = -3;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);
        
        // Anneaux de sol (effet d'onde)
        const groundRings = [];
        for(let i = 0; i < 3; i++) {
            const groundRingGeometry = new THREE.RingGeometry(2 + i * 1.5, 2.2 + i * 1.5, 32);
            const groundRingMaterial = new THREE.MeshBasicMaterial({
                color: 0x0088ff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2 - i * 0.05
            });
            const groundRing = new THREE.Mesh(groundRingGeometry, groundRingMaterial);
            groundRing.rotation.x = -Math.PI / 2;
            groundRing.position.y = -2.99;
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
            
            // Rotation verticale de la sphère uniquement
            shieldGroup.rotation.y = elapsedTime * 0.3;
            
            // Pulsation du noyau
            const corePulse = 0.8 + Math.sin(elapsedTime * 3) * 0.2;
            core.scale.set(corePulse, corePulse, corePulse);
            
            // Animation de l'opacité du bouclier
            sphereMaterial.opacity = 0.3 + Math.sin(elapsedTime * 2) * 0.1;
            wireframe.material.opacity = 0.9 + Math.sin(elapsedTime * 4) * 0.1;
            
            // Animation des anneaux montant du sud au nord
            rings.forEach((ringGroup, index) => {
                // Mouvement vertical continu
                ringGroup.userData.phase += 0.02;
                let newY = ringGroup.userData.baseY + ringGroup.userData.phase;
                
                // Reset quand l'anneau atteint le pôle nord
                if(newY > 1.5) {
                    ringGroup.userData.phase = -3;
                    newY = ringGroup.userData.baseY + ringGroup.userData.phase;
                }
                
                ringGroup.position.y = newY;
                
                // Ajuster la taille en fonction de la position
                const normalizedY = (newY + 1.5) / 3; // 0 à 1
                const scale = Math.sin(normalizedY * Math.PI) * 0.8 + 0.2;
                ringGroup.scale.set(scale, scale, 1);
                
                // Rotation des anneaux
                ringGroup.rotation.y = elapsedTime * ringGroup.userData.speed;
                
                // Variation d'opacité
                const ring = ringGroup.children[0];
                ring.material.opacity = 0.2 + scale * 0.5 + Math.sin(elapsedTime * 3 + index) * 0.1;
            });
            
            // Animation des particules en vortex galactique
            const particlePositions = particles.geometry.attributes.position.array;
            for(let i = 0; i < particlesCount; i++) {
                const data = particleData[i];
                
                // Rotation de la spirale
                data.angle += data.speed * 0.02;
                
                // Mouvement vertical cyclique
                data.baseHeight += data.verticalSpeed;
                if(data.baseHeight > 3) {
                    data.baseHeight = -3;
                }
                
                // Mise à jour de la position
                particlePositions[i * 3] = Math.cos(data.angle) * data.radius;
                particlePositions[i * 3 + 1] = data.baseHeight;
                particlePositions[i * 3 + 2] = Math.sin(data.angle) * data.radius;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            
            // Rotation des anneaux au sol (effet d'onde)
            groundRings.forEach((ring, index) => {
                ring.scale.set(
                    1 + Math.sin(elapsedTime * 2 - index * 0.5) * 0.1,
                    1 + Math.sin(elapsedTime * 2 - index * 0.5) * 0.1,
                    1
                );
                ring.material.opacity = 0.2 - index * 0.05 + Math.sin(elapsedTime * 3 - index) * 0.05;
            });
            
            // Variation de l'intensité lumineuse
            coreLight.intensity = 3 + Math.sin(elapsedTime * 4) * 1;
            topLight.intensity = 2 + Math.sin(elapsedTime * 3) * 0.5;
            
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