// thunder.js - Projectile électrique amélioré
// Import retiré car on retourne le bullet maintenant au lieu de le pousser

export function createElectricBullet(enemy, speedMult = 1) {
  const centerX = enemy.x + enemy.width / 2;
  const centerY = enemy.y + enemy.height / 2;
  const bullet = {
    type: 'electric_bullet_mod',
    x: centerX,
    y: centerY,
    width: 14,
    height: 14,
    vx: 0,
    vy: 5 * speedMult,
    color: '#00EAFF',        // Cyan électrique principal
    coreColor: '#FFFFFF',     // Blanc brillant pour le centre
    glowColor: '#00AAFF',     // Bleu lumineux pour l'aura
    arcColor: '#66FFFF',      // Cyan clair pour les arcs
    electricArcs: [],
    trail: [],
    pulsePhase: 0,
    rotationAngle: 0,
    sparkles: [],            // Nouvelles étincelles
    energyRings: []          // Nouveaux anneaux d'énergie
  };
  
  // ✅ RETOURNER le bullet au lieu de le pousser dans enemyBullets
  return bullet;
}

export function updateElectricBullet(bullet) {
  // Mouvement
  bullet.x += bullet.vx;
  bullet.y += bullet.vy;
  
  // Animation de pulsation plus fluide
  bullet.pulsePhase += 0.12;
  const pulseEffect = Math.sin(bullet.pulsePhase) * 4;
  bullet.width = 14 + pulseEffect;
  bullet.height = bullet.width;
  
  // Rotation continue pour effet dynamique
  bullet.rotationAngle += 0.08;
  
  // Arcs électriques plus fréquents et variés
  if (Math.random() < 0.5) {
    bullet.electricArcs.push({
      angle: Math.random() * Math.PI * 2,
      length: 18 + Math.random() * 15,
      lifetime: 6 + Math.floor(Math.random() * 4),
      segments: 4 + Math.floor(Math.random() * 3),
      offset: Math.random() * Math.PI * 2,
      thickness: 1 + Math.random() * 1.5
    });
  }
  
  // Mise à jour des arcs avec animation
  bullet.electricArcs = bullet.electricArcs.filter(arc => {
    arc.lifetime--;
    arc.offset += 0.3; // Animation de l'arc
    return arc.lifetime > 0;
  });
  
  // Étincelles périphériques
  if (Math.random() < 0.3) {
    bullet.sparkles.push({
      x: bullet.x + (Math.random() - 0.5) * 20,
      y: bullet.y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 2 + Math.random() * 3,
      lifetime: 8 + Math.floor(Math.random() * 5),
      opacity: 0.8
    });
  }
  
  // Mise à jour des étincelles
  bullet.sparkles = bullet.sparkles.filter(sparkle => {
    sparkle.x += sparkle.vx;
    sparkle.y += sparkle.vy;
    sparkle.lifetime--;
    sparkle.opacity = sparkle.lifetime / 12;
    sparkle.size *= 0.95;
    return sparkle.lifetime > 0;
  });
  
  // Anneaux d'énergie qui s'expandent
  if (Math.random() < 0.15) {
    bullet.energyRings.push({
      radius: bullet.width / 2,
      maxRadius: bullet.width * 3,
      opacity: 0.7,
      thickness: 2
    });
  }
  
  // Mise à jour des anneaux
  bullet.energyRings = bullet.energyRings.filter(ring => {
    ring.radius += 1.5;
    ring.opacity = 1 - (ring.radius / ring.maxRadius);
    ring.thickness *= 0.98;
    return ring.radius < ring.maxRadius;
  });
  
  // Traînée améliorée avec dégradé
  bullet.trail.push({
    x: bullet.x,
    y: bullet.y,
    size: bullet.width * 0.8,
    opacity: 0.7,
    phase: bullet.pulsePhase
  });
  
  if (bullet.trail.length > 12) bullet.trail.shift();
  
  // Fade progressif de la traînée
  bullet.trail.forEach((t, i) => {
    t.opacity = (i / bullet.trail.length) * 0.7;
  });
}

export function drawElectricBullet(ctx, bullet) {
  ctx.save();
  
  // Dessiner les anneaux d'énergie en premier (arrière-plan)
  bullet.energyRings.forEach(ring => {
    ctx.globalAlpha = ring.opacity * 0.5;
    ctx.strokeStyle = bullet.glowColor;
    ctx.lineWidth = ring.thickness;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, ring.radius, 0, Math.PI * 2);
    ctx.stroke();
  });
  
  // Dessiner la traînée avec dégradé
  bullet.trail.forEach((t, i) => {
    ctx.globalAlpha = t.opacity;
    const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.size);
    gradient.addColorStop(0, bullet.coreColor);
    gradient.addColorStop(0.4, bullet.color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.globalAlpha = 1;
  
  // Aura externe pulsante
  const auraSize = bullet.width * 1.8;
  const auraGradient = ctx.createRadialGradient(bullet.x, bullet.y, 0, bullet.x, bullet.y, auraSize);
  auraGradient.addColorStop(0, 'transparent');
  auraGradient.addColorStop(0.5, bullet.glowColor + '40');
  auraGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = auraGradient;
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, auraSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Arcs électriques avec segments en zigzag
  bullet.electricArcs.forEach(arc => {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(arc.angle + arc.offset);
    
    ctx.strokeStyle = bullet.arcColor;
    ctx.lineWidth = arc.thickness;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 6;
    ctx.globalAlpha = arc.lifetime / 8;
    
    ctx.beginPath();
    let currentX = 0;
    let currentY = 0;
    ctx.moveTo(currentX, currentY);
    
    // Créer un zigzag pour l'arc
    for (let i = 0; i < arc.segments; i++) {
      const segmentLength = arc.length / arc.segments;
      currentY += segmentLength;
      currentX += (Math.random() - 0.5) * 8;
      ctx.lineTo(currentX, currentY);
    }
    
    ctx.stroke();
    ctx.restore();
  });
  
  // Étincelles périphériques
  bullet.sparkles.forEach(sparkle => {
    ctx.globalAlpha = sparkle.opacity;
    ctx.fillStyle = bullet.coreColor;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.globalAlpha = 1;
  
  // Corps principal avec rotation
  ctx.save();
  ctx.translate(bullet.x, bullet.y);
  ctx.rotate(bullet.rotationAngle);
  
  // Glow externe
  ctx.shadowColor = bullet.color;
  ctx.shadowBlur = 20;
  
  // Dégradé radial pour le corps
  const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bullet.width / 2);
  bodyGradient.addColorStop(0, bullet.coreColor);
  bodyGradient.addColorStop(0.3, bullet.color);
  bodyGradient.addColorStop(0.7, bullet.glowColor);
  bodyGradient.addColorStop(1, bullet.color + '80');
  
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(0, 0, bullet.width / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Croix électrique centrale rotative
  ctx.strokeStyle = bullet.coreColor;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(-bullet.width / 3, 0);
  ctx.lineTo(bullet.width / 3, 0);
  ctx.moveTo(0, -bullet.width / 3);
  ctx.lineTo(0, bullet.width / 3);
  ctx.stroke();
  
  // Noyau ultra brillant
  ctx.fillStyle = bullet.coreColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, 0, bullet.width / 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  ctx.restore();
}
