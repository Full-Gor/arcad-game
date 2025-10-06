/**
 * Bouclier Géodésique - Version Canvas 2D Corrigée
 * Adaptation du bouclier Three.js pour le système Canvas 2D du jeu
 * Version corrigée avec meilleure visibilité des arêtes
 */

export class GeodesicShieldCanvas {
    constructor() {
        this.isActive = false;
        this.x = 0;
        this.y = 0;
        this.radius = 48.75; // Taille agrandie de 30% supplémentaires (37.5 * 1.3)
        this.rotation = 0;
        this.pulsePhase = 0;
        this.ringPhase = 0;
        this.opacity = 0.1;
        
        // Structure géodésique avec hexagones et pentagones
        this.faces = this.generateGeodesicFaces();
        
        // Arêtes multiples pour garantir la visibilité
        this.edges = this.generateEdges();
        
        // Anneaux d'énergie par vagues
        this.rings = [];
        this.initEnergyRings();
        
        // Points lumineux aux sommets
        this.vertices = this.generateVertices();
        
        // Noyau énergétique central
        this.core = {
            radius: this.radius * 0.15,
            opacity: 0.2,
            pulsePhase: 0
        };
        
        // Couleurs améliorées
        this.primaryColor = '#00ffff';
        this.secondaryColor = '#0099ff';
        this.coreColor = '#00ffff';
        this.edgeColor = '#00ffff';
        this.glowColor = '#ffffff';
    }
    
    generateGeodesicFaces() {
        const faces = [];
        const layers = 4; // Plus de couches pour plus de détail
        
        for (let layer = 0; layer < layers; layer++) {
            const layerRadius = (this.radius * 0.3) + (layer * this.radius * 0.15);
            const faceCount = layer === 0 ? 1 : layer * 6;
            
            if (layer === 0) {
                // Face centrale
                faces.push({
                    x: 0,
                    y: 0,
                    size: layerRadius,
                    opacity: 0.1, // Très transparent pour voir le vaisseau
                    type: 'hexagon'
                });
            } else {
                // Faces en couches avec hexagones et pentagones
                for (let i = 0; i < faceCount; i++) {
                    const angle = (i / faceCount) * Math.PI * 2;
                    const isPentagon = (i % 7 === 0); // Mélange hexagones/pentagones
                    
                    faces.push({
                        x: Math.cos(angle) * layerRadius,
                        y: Math.sin(angle) * layerRadius,
                        size: this.radius * 0.12,
                        opacity: 0.1 - (layer * 0.02), // Très transparent pour voir le vaisseau
                        type: isPentagon ? 'pentagon' : 'hexagon'
                    });
                }
            }
        }
        
        return faces;
    }
    
    generateEdges() {
        const edges = [];
        const edgeCount = 24; // Plus d'arêtes pour plus de détail
        
        for (let i = 0; i < edgeCount; i++) {
            const angle = (i / edgeCount) * Math.PI * 2;
            const radius = this.radius * (0.4 + Math.sin(angle * 3) * 0.1);
            
            edges.push({
                x1: Math.cos(angle) * radius,
                y1: Math.sin(angle) * radius,
                x2: Math.cos(angle + 0.3) * radius * 0.8,
                y2: Math.sin(angle + 0.3) * radius * 0.8,
                opacity: 1.0,
                phase: i * Math.PI / 12
            });
        }
        
        return edges;
    }
    
    generateVertices() {
        const vertices = [];
        const vertexCount = 16;
        
        for (let i = 0; i < vertexCount; i++) {
            const angle = (i / vertexCount) * Math.PI * 2;
            const radius = this.radius * (0.3 + Math.sin(angle * 2) * 0.2);
            
            vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                size: 2,
                opacity: 0.3,
                phase: i * Math.PI / 8
            });
        }
        
        return vertices;
    }
    
    initEnergyRings() {
        const ringsPerWave = 5;
        const totalWaves = 6;
        const ringCount = ringsPerWave * totalWaves;
        
        for (let i = 0; i < ringCount; i++) {
            const waveIndex = Math.floor(i / ringsPerWave);
            const indexInWave = i % ringsPerWave;
            
            this.rings.push({
                radius: 0,
                targetRadius: this.radius * (0.3 + (i % ringsPerWave) * 0.15),
                phase: 0,
                speed: 0.015,
                opacity: 0.3,
                waveIndex: waveIndex,
                indexInWave: indexInWave,
                waveDelay: waveIndex * 3,
                ringDelay: indexInWave * 0.08,
                isActive: false,
                currentY: -2,
                minRadius: 0.3,
                maxRadius: 2.5
            });
        }
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        const elapsedTime = deltaTime / 1000; // Convertir en secondes
        
        // Rotation générale plus rapide
        this.rotation += 0.8 * deltaTime / 1000;
        
        // Pulsation de la structure
        this.pulsePhase += 2 * deltaTime / 1000;
        const structurePulse = 1 + Math.sin(this.pulsePhase) * 0.02;
        
        // Animation du noyau
        this.core.pulsePhase += 3 * deltaTime / 1000;
        const corePulse = 0.5 + Math.sin(this.core.pulsePhase) * 0.1;
        this.core.currentRadius = this.core.radius * corePulse;
        this.core.currentOpacity = 0.6 + Math.sin(this.core.pulsePhase * 4) * 0.2;
        
        // Animation des arêtes - toujours visibles
        this.edges.forEach((edge, index) => {
            edge.phase += 0.05 * deltaTime / 1000;
            edge.opacity = 1.0; // Toujours complètement opaque
        });
        
        // Animation des sommets
        this.vertices.forEach((vertex, index) => {
            vertex.phase += 0.03 * deltaTime / 1000;
            vertex.currentOpacity = 0.8 + Math.sin(vertex.phase) * 0.2;
        });
        
        // Animation des anneaux par vagues
        this.rings.forEach((ring) => {
            const waveStartTime = ring.waveDelay + ring.ringDelay;
            
            if (elapsedTime > waveStartTime && !ring.isActive) {
                ring.isActive = true;
                ring.currentY = -2;
            }
            
            if (ring.isActive) {
                ring.currentY += 0.015;
                
                // Calcul du rayon avec développement progressif
                const normalizedY = (ring.currentY + 2) / 4;
                const sphereProfile = Math.sqrt(Math.max(0, 1 - Math.pow(normalizedY * 2 - 1, 2)));
                
                const developmentFactor = Math.min(1, (ring.currentY + 2) / 0.5);
                const targetRadius = ring.minRadius + sphereProfile * ring.maxRadius;
                ring.currentRadius = targetRadius * developmentFactor;
                
                // Opacité avec fade in/out
                let opacity;
                if (normalizedY < 0.1) {
                    opacity = normalizedY * 10 * 0.7;
                } else if (normalizedY > 0.9) {
                    opacity = (1 - normalizedY) * 10 * 0.7;
                } else {
                    opacity = 0.7;
                }
                ring.opacity = opacity;
                
                // Reset quand l'anneau atteint le pôle nord
                if (ring.currentY > 2) {
                    ring.isActive = false;
                    ring.currentY = -2;
                    ring.waveDelay = elapsedTime + 6 * 3 - ring.waveIndex * 3;
                }
            }
        });
    }
    
    drawFace(ctx, face) {
        ctx.save();
        ctx.translate(face.x, face.y);
        ctx.rotate(this.rotation);
        
        const sides = face.type === 'pentagon' ? 5 : 6;
        const angleStep = (Math.PI * 2) / sides;
        
        // Remplissage semi-transparent
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = i * angleStep;
            const px = Math.cos(angle) * face.size;
            const py = Math.sin(angle) * face.size;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        
        ctx.fillStyle = `rgba(0, 153, 255, ${face.opacity * 0.05})`; // Très transparent pour voir le vaisseau
        ctx.fill();
        
        // Contour lumineux
        ctx.strokeStyle = `rgba(0, 255, 255, ${face.opacity * this.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawEdge(ctx, edge) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Calculer la direction de l'arête pour le gradient
        const dx = edge.x2 - edge.x1;
        const dy = edge.y2 - edge.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Gradient linéaire le long de l'arête
        const gradient = ctx.createLinearGradient(edge.x1, edge.y1, edge.x2, edge.y2);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${edge.opacity * 0.8})`);
        gradient.addColorStop(0.3, `rgba(0, 255, 255, ${edge.opacity})`);
        gradient.addColorStop(0.7, `rgba(0, 255, 255, ${edge.opacity})`);
        gradient.addColorStop(1, `rgba(0, 255, 255, ${edge.opacity * 0.8})`);
        
        // Arête principale avec gradient
        ctx.beginPath();
        ctx.moveTo(edge.x1, edge.y1);
        ctx.lineTo(edge.x2, edge.y2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Halo lumineux externe
        const glowGradient = ctx.createLinearGradient(edge.x1, edge.y1, edge.x2, edge.y2);
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${edge.opacity * 0.3})`);
        glowGradient.addColorStop(0.5, `rgba(255, 255, 255, ${edge.opacity * 0.6})`);
        glowGradient.addColorStop(1, `rgba(255, 255, 255, ${edge.opacity * 0.3})`);
        
        ctx.beginPath();
        ctx.moveTo(edge.x1, edge.y1);
        ctx.lineTo(edge.x2, edge.y2);
        ctx.strokeStyle = glowGradient;
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // Arête interne avec gradient plus intense
        const innerGradient = ctx.createLinearGradient(edge.x1 * 0.98, edge.y1 * 0.98, edge.x2 * 0.98, edge.y2 * 0.98);
        innerGradient.addColorStop(0, `rgba(0, 136, 255, ${edge.opacity * 0.6})`);
        innerGradient.addColorStop(0.5, `rgba(0, 136, 255, ${edge.opacity})`);
        innerGradient.addColorStop(1, `rgba(0, 136, 255, ${edge.opacity * 0.6})`);
        
        ctx.beginPath();
        ctx.moveTo(edge.x1 * 0.98, edge.y1 * 0.98);
        ctx.lineTo(edge.x2 * 0.98, edge.y2 * 0.98);
        ctx.strokeStyle = innerGradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Points lumineux aux extrémités
        const endPointGradient = ctx.createRadialGradient(edge.x1, edge.y1, 0, edge.x1, edge.y1, 3);
        endPointGradient.addColorStop(0, `rgba(0, 255, 255, ${edge.opacity})`);
        endPointGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = endPointGradient;
        ctx.beginPath();
        ctx.arc(edge.x1, edge.y1, 3, 0, Math.PI * 2);
        ctx.fill();
        
        const endPointGradient2 = ctx.createRadialGradient(edge.x2, edge.y2, 0, edge.x2, edge.y2, 3);
        endPointGradient2.addColorStop(0, `rgba(0, 255, 255, ${edge.opacity})`);
        endPointGradient2.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = endPointGradient2;
        ctx.beginPath();
        ctx.arc(edge.x2, edge.y2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawVertex(ctx, vertex) {
        ctx.save();
        ctx.translate(this.x + vertex.x, this.y + vertex.y);
        
        // Point lumineux
        ctx.fillStyle = `rgba(0, 255, 255, ${vertex.currentOpacity * this.opacity})`;
        ctx.beginPath();
        ctx.arc(0, 0, vertex.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Halo
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, vertex.size * 3);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${vertex.currentOpacity * 0.8})`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, vertex.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawRing(ctx, ring) {
        if (ring.currentRadius <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Anneau principal
        ctx.beginPath();
        ctx.arc(0, 0, ring.currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${ring.opacity * this.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Anneau interne
        ctx.beginPath();
        ctx.arc(0, 0, ring.currentRadius * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ring.opacity * 0.3 * this.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawCore(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Halo du noyau
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.core.currentRadius * 3);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${this.core.currentOpacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(0, 255, 255, ${this.core.currentOpacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.core.currentRadius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Noyau central
        ctx.fillStyle = `rgba(0, 255, 255, ${this.core.currentOpacity * this.opacity})`;
        ctx.beginPath();
        ctx.arc(0, 0, this.core.currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    draw(ctx) {
        if (!this.isActive) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Effet de pulsation
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.02;
        ctx.scale(pulse, pulse);
        
        // Dessiner les anneaux d'énergie
        this.rings.forEach(ring => {
            this.drawRing(ctx, ring);
        });
        
        // Dessiner les faces géodésiques
        this.faces.forEach(face => {
            this.drawFace(ctx, face);
        });
        
        // Dessiner les arêtes (toujours visibles)
        this.edges.forEach(edge => {
            this.drawEdge(ctx, edge);
        });
        
        // Dessiner les sommets
        this.vertices.forEach(vertex => {
            this.drawVertex(ctx, vertex);
        });
        
        // Dessiner le noyau central
        this.drawCore(ctx);
        
        ctx.restore();
    }
    
    activate() {
        this.isActive = true;
    }
    
    deactivate() {
        this.isActive = false;
    }
    
    setPosition(x, y) {
        // Centrer le bouclier sur le vaisseau spatial
        this.x = x + 25; // +25 pour centrer sur la largeur du vaisseau (50px)
        this.y = y + 25; // +25 pour centrer sur la hauteur du vaisseau (50px)
    }
    
    // Vérification de collision pour les projectiles
    checkCollision(projectileX, projectileY, projectileRadius = 2) {
        if (!this.isActive) return false;
        
        const distance = Math.sqrt(
            Math.pow(projectileX - this.x, 2) + 
            Math.pow(projectileY - this.y, 2)
        );
        
        return distance <= (this.radius + projectileRadius);
    }
    
    // Effet d'impact sur le bouclier
    createImpact(impactX, impactY) {
        // Effet visuel d'impact
        this.pulsePhase += Math.PI / 4;
        
        // Intensifier temporairement les anneaux
        this.rings.forEach(ring => {
            ring.opacity = Math.min(1, ring.opacity + 0.3);
        });
    }
}