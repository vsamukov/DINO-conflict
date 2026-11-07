import { Egg, FallingRock, GiantDino, MudPatch, Raptor } from '../types/game';
import { ARENA_HEIGHT, ARENA_WIDTH, BURROW_RADIUS, BURROW_X, BURROW_Y, GameEngine, NEST_RADIUS, NEST_X, NEST_Y } from './physics';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: GameEngine) {
    const ctx = this.ctx;
    ctx.save();

    // Apply screen shake
    if (engine.screenShake > 0) {
      const sx = (Math.random() - 0.5) * engine.screenShake * 1.5;
      const sy = (Math.random() - 0.5) * engine.screenShake * 1.5;
      ctx.translate(sx, sy);
    }

    // 1. Draw Jungle Ground & Clearing
    this.drawBackground();

    // 2. Draw Sticky Mud Patches (Environmental Hazard)
    this.drawMudPatches(engine.mudPatches);

    // 3. Draw Burrow (Egg Stealer Safe Zone)
    this.drawBurrow(engine.eggsBanked);

    // 4. Draw Nest
    this.drawNest();

    // 5. Draw Loose & Nest Eggs
    this.drawEggs(engine.eggs.filter((e) => e.state !== 'carried'));

    // 6. Draw Bushes Behind
    this.drawBushes(engine);

    // 7. Draw Giant Dinosaur Body, Neck, Head & Articulated Tail
    this.drawGiantDino(engine.giant);

    // 8. Draw Raptor Stealer (With safe rolling flight & invulnerability aura)
    this.drawRaptor(engine.raptor, engine.eggs.find((e) => e.id === engine.raptor.heldEggId));

    // 9. Draw Falling Rocks Hazard (Warning targets & flying boulders)
    this.drawFallingRocks(engine.fallingRocks);

    // 10. Draw Shockwaves
    this.drawShockwaves(engine);

    // 11. Draw Particles (Dust, Rubble, Mud Splatters, Stars)
    this.drawParticles(engine);

    // 12. Draw Comic Popups
    this.drawComicTexts(engine);

    ctx.restore();
  }

  // Prehistoric Arena Background
  private drawBackground() {
    const ctx = this.ctx;

    const bgGrad = ctx.createRadialGradient(
      ARENA_WIDTH * 0.45,
      ARENA_HEIGHT * 0.5,
      120,
      ARENA_WIDTH * 0.5,
      ARENA_HEIGHT * 0.5,
      750
    );
    bgGrad.addColorStop(0, '#4d7c0f');
    bgGrad.addColorStop(0.45, '#3f6212');
    bgGrad.addColorStop(0.85, '#27440d');
    bgGrad.addColorStop(1, '#1a2e05');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Dirt trail connecting nest to burrow
    ctx.beginPath();
    ctx.ellipse(NEST_X + 240, NEST_Y - 20, 320, 160, 0.08, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(120, 53, 15, 0.18)';
    ctx.fill();

    // Stone markings
    ctx.save();
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.06)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(NEST_X, NEST_Y, 130 + i * 70, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    this.drawPerimeterFerns();
  }

  // Corner jungle leaves
  private drawPerimeterFerns() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#142a04';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(180, 40, 240, 160);
    ctx.quadraticCurveTo(80, 120, 0, 180);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, ARENA_HEIGHT);
    ctx.quadraticCurveTo(190, ARENA_HEIGHT - 60, 220, ARENA_HEIGHT - 170);
    ctx.quadraticCurveTo(70, ARENA_HEIGHT - 100, 0, ARENA_HEIGHT - 150);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ARENA_WIDTH, 0);
    ctx.quadraticCurveTo(ARENA_WIDTH - 150, 40, ARENA_WIDTH - 210, 140);
    ctx.quadraticCurveTo(ARENA_WIDTH - 60, 100, ARENA_WIDTH, 160);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ARENA_WIDTH, ARENA_HEIGHT);
    ctx.quadraticCurveTo(ARENA_WIDTH - 140, ARENA_HEIGHT - 50, ARENA_WIDTH - 180, ARENA_HEIGHT - 130);
    ctx.quadraticCurveTo(ARENA_WIDTH - 40, ARENA_HEIGHT - 90, ARENA_WIDTH, ARENA_HEIGHT - 110);
    ctx.fill();

    ctx.restore();
  }

  // Sticky Mud Patches (Slows Raptor & Dampens Giant Tail Whip)
  private drawMudPatches(mudPatches: MudPatch[]) {
    const ctx = this.ctx;

    for (const patch of mudPatches) {
      ctx.save();
      ctx.translate(patch.x, patch.y);
      ctx.rotate(patch.rotation);

      // Outer wet mud soak edge
      ctx.fillStyle = 'rgba(46, 25, 12, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 4, patch.radiusX + 16, patch.radiusY + 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main deep viscous mud puddle
      const mudGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, patch.radiusX);
      mudGrad.addColorStop(0, '#2b170b');
      mudGrad.addColorStop(0.65, '#3e2723');
      mudGrad.addColorStop(0.92, '#4e342e');
      mudGrad.addColorStop(1, '#6d4c41');

      ctx.fillStyle = mudGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, patch.radiusX, patch.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mud puddle rim
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#2b170b';
      ctx.stroke();

      // Animated popping mud bubbles
      for (const b of patch.bubbles) {
        const bubbleR = b.size * (1 - Math.abs(b.progress - 0.5) * 0.4);
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.arc(b.relX, b.relY, bubbleR, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#2b170b';
        ctx.stroke();

        // Bubble highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(b.relX - bubbleR * 0.3, b.relY - bubbleR * 0.3, bubbleR * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Visual warning text
      ctx.fillStyle = 'rgba(254, 215, 170, 0.75)';
      ctx.font = 'bold 12px Fredoka, Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('STICKY MUD (SLOWS)', 0, 4);

      ctx.restore();
    }
  }

  // Falling Rocks Hazard (Warning ground marker & incoming boulders)
  private drawFallingRocks(fallingRocks: FallingRock[]) {
    const ctx = this.ctx;

    for (const rock of fallingRocks) {
      if (rock.state === 'warning') {
        ctx.save();
        ctx.translate(rock.x, rock.y);

        const prog = 1 - (rock.warningTimer / rock.warningDuration);
        const pulse = 1 + Math.sin(Date.now() / 60) * 0.15;

        // Ground shadow growing
        ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + prog * 0.45})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, rock.radius * (0.5 + prog * 0.5), rock.radius * 0.6 * (0.5 + prog * 0.5), 0, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing hazard danger ring
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, (rock.radius + 14) * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target crosshair
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 2.5;
        const crossLen = rock.radius + 18;
        ctx.beginPath();
        ctx.moveTo(-crossLen, 0);
        ctx.lineTo(crossLen, 0);
        ctx.moveTo(0, -crossLen);
        ctx.lineTo(0, crossLen);
        ctx.stroke();

        // Warning Label
        ctx.fillStyle = '#fef08a';
        ctx.font = '900 13px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ ROCK INCOMING!', 0, -rock.radius - 22);

        ctx.restore();
      } else if (rock.state === 'falling') {
        ctx.save();

        // 1. Ground shadow under rock
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(rock.x, rock.y, rock.radius * 1.1, rock.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Fiery smoke trail
        const rockY = rock.y - rock.height;
        const trailGrad = ctx.createLinearGradient(rock.x, rockY, rock.x, rockY - 140);
        trailGrad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        trailGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
        trailGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.moveTo(rock.x - rock.radius * 0.8, rockY);
        ctx.lineTo(rock.x + rock.radius * 0.8, rockY);
        ctx.lineTo(rock.x, rockY - 140);
        ctx.closePath();
        ctx.fill();

        // 3. Falling Craggy Boulder
        ctx.translate(rock.x, rockY);
        ctx.rotate(rock.rotation);

        const boulderGrad = ctx.createRadialGradient(-rock.radius * 0.3, -rock.radius * 0.3, 5, 0, 0, rock.radius * 1.2);
        boulderGrad.addColorStop(0, '#a8a29e');
        boulderGrad.addColorStop(0.45, '#78716c');
        boulderGrad.addColorStop(0.85, '#44403c');
        boulderGrad.addColorStop(1, '#1c1917');

        ctx.fillStyle = boulderGrad;
        ctx.beginPath();
        const pts = 8;
        for (let p = 0; p < pts; p++) {
          const a = (p / pts) * Math.PI * 2;
          const varR = rock.radius * (0.85 + Math.sin(p * 2.3) * 0.15);
          const px = Math.cos(a) * varR;
          const py = Math.sin(a) * varR;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#292524';
        ctx.stroke();

        // Boulder cracks
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-rock.radius * 0.4, -rock.radius * 0.3);
        ctx.lineTo(0, 0);
        ctx.lineTo(rock.radius * 0.5, rock.radius * 0.2);
        ctx.stroke();

        ctx.restore();
      } else if (rock.state === 'impact') {
        // Impact crater cracks
        ctx.save();
        ctx.translate(rock.x, rock.y);
        ctx.strokeStyle = `rgba(41, 37, 36, ${1 - rock.impactProgress})`;
        ctx.lineWidth = 4 * (1 - rock.impactProgress);
        for (let c = 0; c < 6; c++) {
          const a = (c / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * (rock.radius + 20), Math.sin(a) * (rock.radius + 20));
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  // Raptor Burrow (Goal / Sanctuary)
  private drawBurrow(bankedCount: number) {
    const ctx = this.ctx;
    ctx.save();

    const burrowGrad = ctx.createRadialGradient(BURROW_X, BURROW_Y, 20, BURROW_X, BURROW_Y, BURROW_RADIUS + 30);
    burrowGrad.addColorStop(0, '#291b0f');
    burrowGrad.addColorStop(0.6, '#451a03');
    burrowGrad.addColorStop(1, 'rgba(69, 26, 3, 0)');
    ctx.fillStyle = burrowGrad;
    ctx.beginPath();
    ctx.arc(BURROW_X, BURROW_Y, BURROW_RADIUS + 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(BURROW_X, BURROW_Y, 48, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#78350f';
    ctx.stroke();

    ctx.fillStyle = '#65a30d';
    ctx.beginPath();
    ctx.arc(BURROW_X - 25, BURROW_Y - 45, 14, 0, Math.PI * 2);
    ctx.arc(BURROW_X + 15, BURROW_Y - 48, 18, 0, Math.PI * 2);
    ctx.arc(BURROW_X + 38, BURROW_Y - 20, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 15px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RAPTOR DEN', BURROW_X, BURROW_Y - 68);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px Fredoka, sans-serif';
    ctx.fillText(`STOLEN: ${bankedCount}/3`, BURROW_X, BURROW_Y + 74);

    ctx.restore();
  }

  // Dino Nest
  private drawNest() {
    const ctx = this.ctx;
    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(NEST_X, NEST_Y + 15, NEST_RADIUS + 15, NEST_RADIUS * 0.75 + 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(NEST_X, NEST_Y, NEST_RADIUS, NEST_RADIUS * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    const bedGrad = ctx.createRadialGradient(NEST_X, NEST_Y, 10, NEST_X, NEST_Y, NEST_RADIUS * 0.75);
    bedGrad.addColorStop(0, '#65a30d');
    bedGrad.addColorStop(0.7, '#4d7c0f');
    bedGrad.addColorStop(1, '#854d0e');
    ctx.fillStyle = bedGrad;
    ctx.beginPath();
    ctx.ellipse(NEST_X, NEST_Y, NEST_RADIUS * 0.75, NEST_RADIUS * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const rInner = NEST_RADIUS * 0.7;
      const rOuter = NEST_RADIUS + 12 + Math.sin(i * 3) * 8;
      const x1 = NEST_X + Math.cos(angle) * rInner;
      const y1 = NEST_Y + Math.sin(angle) * rInner * 0.72;
      const x2 = NEST_X + Math.cos(angle + 0.15) * rOuter;
      const y2 = NEST_Y + Math.sin(angle + 0.15) * rOuter * 0.72;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Dinosaur Eggs
  private drawEggs(eggs: Egg[]) {
    const ctx = this.ctx;
    for (const egg of eggs) {
      if (egg.state === 'banked') {
        this.renderSingleEgg(ctx, egg, 0.85);
      } else {
        this.renderSingleEgg(ctx, egg, 1.0);
      }
    }
  }

  private renderSingleEgg(ctx: CanvasRenderingContext2D, egg: Egg, scale: number = 1.0) {
    ctx.save();
    ctx.translate(egg.x, egg.y);
    ctx.rotate(egg.wobble);
    ctx.scale(scale, scale);

    const r = egg.radius;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.8, r * 0.85, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -r * 1.35);
    ctx.bezierCurveTo(r * 1.15, -r * 1.1, r * 1.25, r * 0.9, 0, r * 1.1);
    ctx.bezierCurveTo(-r * 1.25, r * 0.9, -r * 1.15, -r * 1.1, 0, -r * 1.35);
    ctx.closePath();

    const eggGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.15, 0, 0, r * 1.4);
    eggGrad.addColorStop(0, '#ffffff');
    eggGrad.addColorStop(0.2, egg.color);
    eggGrad.addColorStop(0.85, egg.accentColor);
    eggGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = eggGrad;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.stroke();

    ctx.fillStyle = egg.accentColor;
    if (egg.pattern === 'dots') {
      ctx.beginPath();
      ctx.arc(-r * 0.3, 0, 3.5, 0, Math.PI * 2);
      ctx.arc(r * 0.35, r * 0.3, 4, 0, Math.PI * 2);
      ctx.arc(0, r * 0.5, 3, 0, Math.PI * 2);
      ctx.arc(r * 0.2, -r * 0.4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (egg.pattern === 'stripes') {
      ctx.strokeStyle = egg.accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, -0.6, 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, r * 0.4, r * 0.6, -0.7, 0.7);
      ctx.stroke();
    } else if (egg.pattern === 'stars') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -r * 0.2, 3, 0, Math.PI * 2);
      ctx.arc(-r * 0.3, r * 0.2, 2.5, 0, Math.PI * 2);
      ctx.arc(r * 0.3, r * 0.3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.32, -r * 0.65, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Fern Bushes
  private drawBushes(engine: GameEngine) {
    const ctx = this.ctx;

    for (const bush of engine.bushes) {
      ctx.save();
      ctx.translate(bush.x, bush.y);

      if (bush.rustle > 0) {
        const shakeX = Math.sin(Date.now() / 60) * bush.rustle * 4;
        ctx.translate(shakeX, 0);
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, bush.radius * 0.35, bush.radius * 0.9, bush.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      const lobeCount = 7;
      for (let i = 0; i < lobeCount; i++) {
        const angle = (i / lobeCount) * Math.PI * 2;
        const lx = Math.cos(angle) * (bush.radius * 0.55);
        const ly = Math.sin(angle) * (bush.radius * 0.45);
        const lRad = bush.radius * 0.55;

        const grad = ctx.createRadialGradient(lx, ly, 5, lx, ly, lRad);
        grad.addColorStop(0, '#4ade80');
        grad.addColorStop(0.7, '#15803d');
        grad.addColorStop(1, '#14532d');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(lx, ly, lRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#14532d';
        ctx.stroke();
      }

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, -5, bush.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Giant Mother Dinosaur (Titan) & Articulated Tail
  private drawGiantDino(giant: GiantDino) {
    const ctx = this.ctx;
    ctx.save();

    // 1. Draw Tail Motion Trail
    if (giant.tailTipTrail.length > 1 && !giant.isDazed) {
      ctx.save();
      for (let i = 0; i < giant.tailTipTrail.length - 1; i++) {
        const t1 = giant.tailTipTrail[i];
        const t2 = giant.tailTipTrail[i + 1];
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.strokeStyle = `rgba(250, 204, 21, ${t1.alpha * 0.8})`;
        ctx.lineWidth = t1.radius * 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${t1.alpha * 0.95})`;
        ctx.lineWidth = t1.radius * 0.7;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Draw Articulated Tail
    this.drawTail(giant);

    // 3. Draw Sauropod Body & Legs
    const bodyX = giant.x;
    const bodyY = giant.y;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyY + 60, 95, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.roundRect(bodyX - 70, bodyY + 10, 36, 65, 16);
    ctx.roundRect(bodyX + 35, bodyY + 15, 36, 60, 16);
    ctx.fill();

    const bodyGrad = ctx.createRadialGradient(bodyX - 25, bodyY - 20, 25, bodyX, bodyY, 110);
    bodyGrad.addColorStop(0, '#34d399');
    bodyGrad.addColorStop(0.5, '#059669');
    bodyGrad.addColorStop(1, '#064e3b');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyY, 88, 68, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#064e3b';
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(bodyX - 20, bodyY - 12, 14, 22, 0.3, 0, Math.PI * 2);
    ctx.ellipse(bodyX + 15, bodyY - 18, 12, 18, -0.2, 0, Math.PI * 2);
    ctx.ellipse(bodyX - 5, bodyY + 14, 10, 14, 0.1, 0, Math.PI * 2);
    ctx.fill();

    const stompLift = giant.isStomping ? Math.sin((giant.stompTimer / 0.55) * Math.PI) * 45 : 0;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(bodyX - 25, bodyY + 20 - stompLift, 40, 68, 18);
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#064e3b';
    ctx.stroke();

    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.arc(bodyX - 18, bodyY + 84 - stompLift, 6, 0, Math.PI);
    ctx.arc(bodyX - 5, bodyY + 84 - stompLift, 6, 0, Math.PI);
    ctx.arc(bodyX + 8, bodyY + 84 - stompLift, 6, 0, Math.PI);
    ctx.fill();

    // 4. Long Graceful Neck
    const neckBaseX = bodyX - 45;
    const neckBaseY = bodyY - 30;
    const headX = giant.headX;
    const headY = giant.headY;

    ctx.beginPath();
    ctx.moveTo(neckBaseX - 20, neckBaseY);
    ctx.quadraticCurveTo(neckBaseX - 35, headY + 70, headX - 10, headY + 30);
    ctx.lineTo(headX + 22, headY + 28);
    ctx.quadraticCurveTo(neckBaseX + 15, headY + 80, neckBaseX + 22, neckBaseY);
    ctx.closePath();
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#064e3b';
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    for (let i = 0; i < 5; i++) {
      const t = 0.2 + (i / 5) * 0.7;
      const spikeX = neckBaseX - 26 + (headX - neckBaseX) * t;
      const spikeY = neckBaseY + (headY - neckBaseY) * t;
      ctx.beginPath();
      ctx.moveTo(spikeX - 4, spikeY);
      ctx.lineTo(spikeX - 14, spikeY - 10);
      ctx.lineTo(spikeX + 4, spikeY - 2);
      ctx.fill();
    }

    // 5. Giant Head & Expressive Face
    ctx.save();
    ctx.translate(headX, headY);

    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 26, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#064e3b';
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.ellipse(18, 5, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.arc(28, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    const eyeDx = giant.lookTargetX - (headX);
    const eyeDy = giant.lookTargetY - (headY);
    const eyeLen = Math.sqrt(eyeDx * eyeDx + eyeDy * eyeDy) || 1;
    const pupilOffX = (eyeDx / eyeLen) * 5;
    const pupilOffY = (eyeDy / eyeLen) * 4;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(2, -7, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#064e3b';
    ctx.stroke();

    if (giant.isDazed) {
      // Swirly dizzy eyes (@_@) when hit by rock!
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      const tSpin = Date.now() * 0.01;
      ctx.beginPath();
      for (let th = 0; th < Math.PI * 4; th += 0.2) {
        const rr = 1.2 * th;
        const sx = 2 + Math.cos(th + tSpin) * rr;
        const sy = -7 + Math.sin(th + tSpin) * rr;
        if (th === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    } else if (giant.isBlinking) {
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(2, -7, 10, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(2 + pupilOffX, -7 + pupilOffY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0 + pupilOffX, -10 + pupilOffY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    if (giant.isDazed) {
      // Wavy dizzy eyebrows & mouth
      ctx.strokeStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(-8, -20);
      ctx.quadraticCurveTo(2, -26, 12, -18);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.quadraticCurveTo(18, 5, 24, 12);
      ctx.stroke();
    } else if (giant.expression === 'angry') {
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-8, -20);
      ctx.lineTo(12, -15);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(14, 8, 8, 0.2, Math.PI - 0.3);
      ctx.stroke();
    } else if (giant.expression === 'surprised') {
      ctx.strokeStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(-7, -24);
      ctx.lineTo(11, -22);
      ctx.stroke();

      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(16, 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#065f46';
      ctx.beginPath();
      ctx.arc(2, -18, 9, Math.PI + 0.3, Math.PI * 2 - 0.3);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(14, 8, 8, 0.2, Math.PI - 0.3);
      ctx.stroke();
    }

    // Revolving dizzy stars over Giant's head when dazed by rock!
    if (giant.isDazed) {
      const starRot = Date.now() * 0.006;
      for (let s = 0; s < 4; s++) {
        const sa = (s / 4) * Math.PI * 2 + starRot;
        const sx = 2 + Math.cos(sa) * 28;
        const sy = -32 + Math.sin(sa) * 10;
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', sx, sy);
      }
    }

    ctx.restore();
    ctx.restore();
  }

  // Articulated Tail with Spines & Mud Coating
  private drawTail(giant: GiantDino) {
    const ctx = this.ctx;
    const nodes = giant.tailNodes;
    if (nodes.length < 2) return;

    ctx.save();

    for (let i = 0; i < nodes.length - 1; i++) {
      const cur = nodes[i];
      const next = nodes[i + 1];
      const prog = i / (nodes.length - 1);

      const tailGrad = ctx.createLinearGradient(cur.x, cur.y, next.x, next.y);
      if (giant.tailInMud && i > 6) {
        tailGrad.addColorStop(0, '#3e2723');
        tailGrad.addColorStop(1, '#4e342e');
      } else {
        tailGrad.addColorStop(0, '#059669');
        tailGrad.addColorStop(1, '#10b981');
      }

      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.arc(cur.x, cur.y, cur.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = cur.radius * 1.85;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cur.x, cur.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();

      if (i % 2 === 0) {
        const perpX = -(next.y - cur.y);
        const perpY = next.x - cur.x;
        const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
        const spineH = 14 * (1 - prog * 0.4);
        const sx = cur.x + (perpX / len) * (cur.radius + spineH);
        const sy = cur.y + (perpY / len) * (cur.radius + spineH);

        ctx.fillStyle = giant.tailInMud && i > 6 ? '#5d4037' : '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(cur.x - (next.x - cur.x) * 0.2, cur.y - (next.y - cur.y) * 0.2);
        ctx.lineTo(sx, sy);
        ctx.lineTo(cur.x + (next.x - cur.x) * 0.2, cur.y + (next.y - cur.y) * 0.2);
        ctx.fill();
      }
    }

    // Tip Club Bulb
    const tip = nodes[nodes.length - 1];
    ctx.save();
    ctx.translate(tip.x, tip.y);

    const tipGrad = ctx.createRadialGradient(-5, -5, 4, 0, 0, tip.radius);
    if (giant.tailInMud) {
      tipGrad.addColorStop(0, '#5d4037');
      tipGrad.addColorStop(0.5, '#3e2723');
      tipGrad.addColorStop(1, '#1c1917');
    } else {
      tipGrad.addColorStop(0, '#fde047');
      tipGrad.addColorStop(0.4, '#f59e0b');
      tipGrad.addColorStop(1, '#b45309');
    }

    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.arc(0, 0, tip.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#78350f';
    ctx.stroke();

    const spikeCount = 6;
    ctx.fillStyle = giant.tailInMud ? '#4e342e' : '#ef4444';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    for (let s = 0; s < spikeCount; s++) {
      const sAngle = (s / spikeCount) * Math.PI * 2 + Date.now() * 0.002;
      const baseR = tip.radius * 0.8;
      const spikeLen = tip.radius * 1.55;
      const p1x = Math.cos(sAngle - 0.25) * baseR;
      const p1y = Math.sin(sAngle - 0.25) * baseR;
      const p2x = Math.cos(sAngle) * spikeLen;
      const p2y = Math.sin(sAngle) * spikeLen;
      const p3x = Math.cos(sAngle + 0.25) * baseR;
      const p3y = Math.sin(sAngle + 0.25) * baseR;

      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }

  // Agile Raptor Bandit (Pip) with Rolling Flight & Invulnerability Auror
  private drawRaptor(raptor: Raptor, heldEgg: Egg | undefined) {
    const ctx = this.ctx;
    ctx.save();

    // 1. If currently in rolling recovery flight:
    if (raptor.isRolling) {
      const jumpHeight = Math.sin(raptor.rollProgress * Math.PI) * 65;

      // Ground shadow under rolling raptor
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(raptor.x, raptor.y, 24, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spinning tumbling raptor in mid-air
      ctx.translate(raptor.x, raptor.y - jumpHeight);
      ctx.rotate(raptor.rollAngle);
      this.renderRaptorGeometry(ctx, raptor, false);

      // Dizzy stars around tumbling raptor
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⭐', 20, -20);
      ctx.fillText('⭐', -20, 20);

      ctx.restore();

      this.drawRaptorHearts(ctx, raptor);
      return;
    }

    // 2. Normal / walking / sneaking / stunned state
    ctx.translate(raptor.x, raptor.y);
    ctx.rotate(raptor.angle);

    // Iframes flashing effect during recovery period
    let alpha = raptor.stealthAlpha;
    if (raptor.invulnerableTimer > 0) {
      const flash = Math.sin(Date.now() / 35) > 0;
      alpha *= (flash ? 0.4 : 1.0);
    }
    ctx.globalAlpha = alpha;

    // Dodge blur
    if (raptor.isDodging) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.translate(-25, 0);
      this.renderRaptorGeometry(ctx, raptor, false);
      ctx.restore();
    }

    this.renderRaptorGeometry(ctx, raptor, true);

    ctx.restore();

    // Invulnerability shield aura ring if recovering
    if (raptor.invulnerableTimer > 0 && !raptor.isRolling) {
      ctx.save();
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + 0.3 * Math.sin(Date.now() / 80)})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(raptor.x, raptor.y, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // If carrying an egg, draw it clamped in arms
    if (heldEgg) {
      this.renderSingleEgg(ctx, heldEgg, 1.05);
    }

    this.drawRaptorHearts(ctx, raptor);

    if (raptor.isStunned && !raptor.isRolling) {
      this.drawStunnedStars(ctx, raptor);
    }
  }

  // Raptor body vector drawing
  private renderRaptorGeometry(ctx: CanvasRenderingContext2D, raptor: Raptor, showEffects: boolean) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const legPhase = Math.sin(raptor.runCycle);
    ctx.fillStyle = raptor.inMud ? '#3e2723' : '#c2410c';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-4 + legPhase * 14, 18);
    ctx.lineTo(2 + legPhase * 16, 22);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.lineTo(4 - legPhase * 14, 18);
    ctx.lineTo(10 - legPhase * 16, 22);
    ctx.stroke();

    // Tail
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    const tailWag = Math.sin(raptor.runCycle * 1.2) * 8;
    ctx.quadraticCurveTo(-26, tailWag, -38, tailWag * 1.5);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(-40, tailWag * 1.5, 6, 12, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    const raptorGrad = ctx.createRadialGradient(2, -2, 4, 0, 0, 24);
    raptorGrad.addColorStop(0, '#fb923c');
    raptorGrad.addColorStop(0.7, '#ea580c');
    raptorGrad.addColorStop(1, '#9a3412');

    ctx.fillStyle = raptorGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#7c2d12';
    ctx.stroke();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(4, 3, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(15, -4, 12, 9, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.moveTo(22, -6);
    ctx.lineTo(30, -2);
    ctx.lineTo(21, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(17, -7, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#7c2d12';
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(18, -7, 2.5, 0, Math.PI * 2);
    ctx.fill();

    const featherColors = ['#f43f5e', '#38bdf8', '#facc15'];
    featherColors.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(8 - idx * 5, -12 - idx * 2, 4, 9, -0.6 - idx * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (raptor.heldEggId !== null) {
      ctx.moveTo(10, -1);
      ctx.lineTo(20, 3);
      ctx.lineTo(16, 7);
    } else {
      ctx.moveTo(8, -1);
      ctx.lineTo(14, 5);
      ctx.lineTo(18, 2);
    }
    ctx.stroke();
  }

  // Floating Hearts above Raptor
  private drawRaptorHearts(ctx: CanvasRenderingContext2D, raptor: Raptor) {
    ctx.save();
    const total = raptor.maxHearts;
    const startX = raptor.x - ((total - 1) * 16) / 2;
    const heartY = raptor.y - 42;

    for (let i = 0; i < total; i++) {
      const hx = startX + i * 16;
      const isFull = i < raptor.hearts;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isFull ? '❤️' : '🖤', hx, heartY);
    }
    ctx.restore();
  }

  private drawStunnedStars(ctx: CanvasRenderingContext2D, raptor: Raptor) {
    ctx.save();
    ctx.translate(raptor.x, raptor.y - 32);
    const starCount = 4;
    const radius = 22;
    const rotSpeed = Date.now() * 0.008;

    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2 + rotSpeed;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * (radius * 0.45);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', sx, sy);
    }
    ctx.restore();
  }

  private drawShockwaves(engine: GameEngine) {
    const ctx = this.ctx;
    ctx.save();
    for (const sw of engine.shockwaves) {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(245, 158, 11, ${sw.alpha})`;
      ctx.lineWidth = 14 * sw.alpha;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius * 0.85, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(254, 240, 138, ${sw.alpha * 0.8})`;
      ctx.lineWidth = 6 * sw.alpha;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Dust, Mud, Leaf, Rock Rubble, Star Particles
  private drawParticles(engine: GameEngine) {
    const ctx = this.ctx;
    ctx.save();
    for (const p of engine.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;

      if (p.type === 'star') {
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, 0);
      } else if (p.type === 'dust' || p.type === 'mud') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'rock_rubble') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-p.size / 2, -p.size / 3);
        ctx.lineTo(p.size / 2, -p.size / 2);
        ctx.lineTo(p.size / 3, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 3);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#1c1917';
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  private drawComicTexts(engine: GameEngine) {
    const ctx = this.ctx;
    ctx.save();
    for (const ct of engine.comicTexts) {
      ctx.save();
      ctx.translate(ct.x, ct.y);
      ctx.scale(ct.scale, ct.scale);
      ctx.globalAlpha = ct.alpha;

      ctx.font = '900 24px Fredoka, Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.lineWidth = 6;
      ctx.strokeStyle = ct.stroke;
      ctx.strokeText(ct.text, 0, 0);

      ctx.fillStyle = ct.color;
      ctx.fillText(ct.text, 0, 0);

      ctx.restore();
    }
    ctx.restore();
  }
}
