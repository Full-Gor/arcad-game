// shield2_geometry.js - Gestion de la géométrie sphérique (CODE ORIGINAL)

// Initialisation de la structure géométrique sphérique (CODE ORIGINAL EXACT)
export function initSphericalGeometry(sphericalShield) {
    console.log('🔧 Initialisation de la géométrie sphérique v2...');
    
    // Créer les méridiens (longitude - lignes verticales)
    const meridianCount = 16;
    for (let i = 0; i < meridianCount; i++) {
        const angle = (i / meridianCount) * Math.PI * 2;
        sphericalShield.gridLines.meridians.push({
            angle: angle,
            opacity: 0,
            segments: []
        });
        
        // Créer les segments pour chaque méridien
        for (let j = 0; j <= 32; j++) {
            const theta = (j / 32) * Math.PI;
            sphericalShield.gridLines.meridians[i].segments.push({
                theta: theta,
                visible: false,
                opacity: 0,
                glowIntensity: 0
            });
        }
    }
    
    // Créer les parallèles (latitude - lignes horizontales)
    const parallelCount = 12;
    for (let i = 0; i < parallelCount; i++) {
        const theta = ((i + 1) / (parallelCount + 1)) * Math.PI;
        sphericalShield.gridLines.parallels.push({
            theta: theta,
            opacity: 0,
            segments: []
        });
        
        // Créer les segments pour chaque parallèle
        for (let j = 0; j <= 32; j++) {
            const phi = (j / 32) * Math.PI * 2;
            sphericalShield.gridLines.parallels[i].segments.push({
                phi: phi,
                visible: false,
                opacity: 0,
                glowIntensity: 0
            });
        }
    }
    
    // Créer les vertices (intersections)
    for (let i = 0; i < meridianCount; i++) {
        for (let j = 0; j < parallelCount; j++) {
            const meridian = sphericalShield.gridLines.meridians[i];
            const parallel = sphericalShield.gridLines.parallels[j];
            
            sphericalShield.gridLines.vertices.push({
                meridianIndex: i,
                parallelIndex: j,
                angle: meridian.angle,
                theta: parallel.theta,
                opacity: 0,
                pulse: 0,
                active: false
            });
        }
    }
    
    console.log(`✅ Géométrie sphérique v2 créée: ${meridianCount} méridiens, ${parallelCount} parallèles, ${sphericalShield.gridLines.vertices.length} vertices`);
}

// Fonction utilitaire pour calculer la distance sphérique (CODE ORIGINAL EXACT)
export function calculateSphericalDistance(phi1, theta1, phi2, theta2) {
    const dPhi = phi2 - phi1;
    const dTheta = theta2 - theta1;
    return Math.sqrt(dPhi * dPhi + dTheta * dTheta);
}

// Révéler les segments de grille dans un rayon donné (NOUVEAU: Visibilité améliorée)
export function revealGridSegments(sphericalShield, revelationPhi, revelationTheta, revelationRadius, intensity) {
    // NOUVEAU: Révéler les segments de grille avec plus de visibilité lors des impacts
    sphericalShield.gridLines.meridians.forEach(meridian => {
        meridian.segments.forEach(segment => {
            const distance = calculateSphericalDistance(
                revelationPhi, revelationTheta,
                meridian.angle, segment.theta
            );
            
            if (distance < revelationRadius) {
                segment.visible = true;
                // NOUVEAU: Opacité et intensité beaucoup plus élevées lors des impacts
                segment.opacity = Math.min(1, segment.opacity + 0.5); // 5x plus rapide
                segment.glowIntensity = Math.max(segment.glowIntensity, intensity * 2.5); // 2.5x plus intense
            }
        });
    });
    
    sphericalShield.gridLines.parallels.forEach(parallel => {
        parallel.segments.forEach(segment => {
            const distance = calculateSphericalDistance(
                revelationPhi, revelationTheta,
                segment.phi, parallel.theta
            );
            
            if (distance < revelationRadius) {
                segment.visible = true;
                // NOUVEAU: Opacité et intensité beaucoup plus élevées lors des impacts
                segment.opacity = Math.min(1, segment.opacity + 0.5); // 5x plus rapide
                segment.glowIntensity = Math.max(segment.glowIntensity, intensity * 2.5); // 2.5x plus intense
            }
        });
    });
}

// Activer les vertices proches d'un impact
export function activateNearbyVertices(sphericalShield, impactPhi, impactTheta) {
    // Créer des points de pulsation aux intersections proches (CODE ORIGINAL EXACT)
    sphericalShield.gridLines.vertices.forEach(vertex => {
        const angleDiff = Math.abs(vertex.angle - impactPhi);
        const thetaDiff = Math.abs(vertex.theta - impactTheta);
        const distance = Math.sqrt(angleDiff * angleDiff + thetaDiff * thetaDiff);
        
        if (distance < 0.5) {
            vertex.active = true;
            vertex.pulse = 1.0;
        }
    });
}
