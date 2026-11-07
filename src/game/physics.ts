import { Bush, ComicText, Egg, FallingRock, GameDifficulty, GameMode, GiantDino, MudPatch, Particle, Raptor, Shockwave, TailNode } from '../types/game';
import { sfx } from '../utils/audio';

export const ARENA_WIDTH = 1200;
export const ARENA_HEIGHT = 800;

export const NEST_X = 520;
export const NEST_Y = 480;
export const NEST_RADIUS = 95;

export const BURROW_X = 1080;
export const BURROW_Y = 400;
export const BURROW_RADIUS = 80;

export function initEggs(): Egg[] {
  const eggConfigs = [
    { color: '#38bdf8', accentColor: '#0284c7', pattern: 'dots' as const },
    { color: '#facc15', accentColor: '#d97706', pattern: 'stars' as const },
    { color: '#f43f5e', accentColor: '#be123c', pattern: 'stripes' as const },
    { color: '#34d399', accentColor: '#059669', pattern: 'swirl' as const },
    { color: '#c084fc', accentColor: '#7e22ce', pattern: 'dots' as const },
  ];

  const offsets = [
    { x: -35, y: -15 },
    { x: 30, y: -20 },
    { x: -18, y: 25 },
    { x: 28, y: 22 },
    { x: 2, y: -5 },
  ];

  return eggConfigs.map((cfg, i) => ({
    id: i,
    x: NEST_X + offsets[i].x,
    y: NEST_Y + offsets[i].y,
    baseX: NEST_X + offsets[i].x,
    baseY: NEST_Y + offsets[i].y,
    vx: 0,
    vy: 0,
    radius: 17,
    state: 'nest',
    color: cfg.color,
    accentColor: cfg.accentColor,
    pattern: cfg.pattern,
    wobble: 0,
  }));
}

export function initBushes(): Bush[] {
  return [
    { id: 1, x: 800, y: 200, radius: 68, rustle: 0 },
    { id: 2, x: 860, y: 620, radius: 72, rustle: 0 },
    { id: 3, x: 710, y: 440, radius: 56, rustle: 0 },
  ];
}

export function initMudPatches(): MudPatch[] {
  const makeBubbles = (rx: number, ry: number) => {
    return Array.from({ length: 7 }, () => ({
      relX: (Math.random() - 0.5) * rx * 1.4,
      relY: (Math.random() - 0.5) * ry * 1.4,
      progress: Math.random(),
      size: 3 + Math.random() * 5,
      speed: 0.6 + Math.random() * 0.8,
    }));
  };

  return [
    {
      id: 1,
      x: 700,
      y: 290,
      radiusX: 95,
      radiusY: 55,
      rotation: -0.18,
      bubbles: makeBubbles(95, 55),
    },
    {
      id: 2,
      x: 770,
      y: 580,
      radiusX: 105,
      radiusY: 60,
      rotation: 0.22,
      bubbles: makeBubbles(105, 60),
    },
  ];
}

export function initGiantDino(): GiantDino {
  const rootX = 350;
  const rootY = 440;
  const segmentCount = 13;
  const segmentLength = 34;

  const tailNodes: TailNode[] = [];
  let curX = rootX;
  let curY = rootY;
  for (let i = 0; i < segmentCount; i++) {
    const angle = (Math.PI * 0.25) + (i * 0.14);
    curX += Math.cos(angle) * segmentLength;
    curY += Math.sin(angle) * segmentLength;
    const progress = i / (segmentCount - 1);
    const radius = i === segmentCount - 1 ? 26 : Math.max(16, 42 - progress * 24);
    tailNodes.push({
      x: curX,
      y: curY,
      vx: 0,
      vy: 0,
      radius,
      angle,
    });
  }

  return {
    x: 370,
    y: 420,
    baseAngle: 0,
    targetAngle: 0,
    neckAngle: -0.4,
    headX: 300,
    headY: 210,
    lookTargetX: 700,
    lookTargetY: 400,
    blinkTimer: 0,
    isBlinking: false,
    tailNodes,
    tailTipSpeed: 0,
    tailTipTrail: [],
    stompCooldown: 0,
    stompMaxCooldown: 8.0,
    isStomping: false,
    stompTimer: 0,
    tailTargetX: curX,
    tailTargetY: curY,
    tailImpulseX: 0,
    tailImpulseY: 0,
    expression: 'neutral',
    isDazed: false,
    dazedTimer: 0,
    tailInMud: false,
  };
}

export function initRaptor(mode: GameMode): Raptor {
  return {
    x: BURROW_X - 40,
    y: BURROW_Y,
    vx: 0,
    vy: 0,
    angle: Math.PI,
    speed: mode === 'BANDIT' ? 360 : 310,
    targetX: BURROW_X,
    targetY: BURROW_Y,
    heldEggId: null,
    hearts: 3,
    maxHearts: 3,
    isDodging: false,
    dodgeTimer: 0,
    dodgeCooldown: 0,
    dodgeMaxCooldown: 2.2,
    isStunned: false,
    stunnedTimer: 0,
    runCycle: 0,
    inBush: false,
    inMud: false,
    stealthAlpha: 1,
    isRolling: false,
    rollStartX: 0,
    rollStartY: 0,
    rollTargetX: 0,
    rollTargetY: 0,
    rollProgress: 0,
    rollAngle: 0,
    invulnerableTimer: 0,
    aiState: 'stalking',
    aiTimer: 2.0,
    aiTargetEggId: null,
  };
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function distPointToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return {
      distance: dist(px, py, x1, y1),
      projX: x1,
      projY: y1,
      t: 0,
    };
  }
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return {
    distance: dist(px, py, projX, projY),
    projX,
    projY,
    t,
  };
}

export class GameEngine {
  public giant: GiantDino;
  public raptor: Raptor;
  public eggs: Egg[];
  public bushes: Bush[];
  public mudPatches: MudPatch[];
  public fallingRocks: FallingRock[] = [];
  public shockwaves: Shockwave[] = [];
  public particles: Particle[] = [];
  public comicTexts: ComicText[] = [];
  public mode: GameMode;
  public difficulty: GameDifficulty;
  public roundTimeLeft: number = 60;
  public eggsBanked: number = 0;
  public raptorWhacks: number = 0;
  public screenShake: number = 0;
  public isGameOver: boolean = false;
  public winner: 'GUARDIAN' | 'BANDIT' | null = null;
  public swipePrevPoint: { x: number; y: number; time: number } | null = null;
  public tailWhipVelocity: { vx: number; vy: number } = { vx: 0, vy: 0 };
  private comicIdCounter = 0;
  private rockIdCounter = 0;
  private rockSpawnTimer = 3.5;

  constructor(mode: GameMode, difficulty: GameDifficulty) {
    this.mode = mode;
    this.difficulty = difficulty;
    this.giant = initGiantDino();
    this.raptor = initRaptor(mode);
    this.eggs = initEggs();
    this.bushes = initBushes();
    this.mudPatches = initMudPatches();

    if (difficulty === 'JUNIOR') {
      this.raptor.speed *= 0.85;
      this.giant.stompMaxCooldown = 6.0;
    } else {
      this.raptor.speed *= 1.1;
      this.giant.stompMaxCooldown = 7.5;
    }
  }

  // Trigger ground stomp
  public triggerStomp(): boolean {
    if (this.giant.isDazed || this.giant.stompCooldown > 0 || this.giant.isStomping) return false;

    this.giant.isStomping = true;
    this.giant.stompTimer = 0.55;
    this.giant.stompCooldown = this.giant.stompMaxCooldown;
    sfx.stomp();

    setTimeout(() => {
      this.screenShake = 16;
      this.shockwaves.push({
        x: this.giant.x + 40,
        y: this.giant.y + 60,
        radius: 20,
        maxRadius: 360,
        alpha: 1,
        color: '#f59e0b',
      });

      this.addComicText('STOMP!!', this.giant.x + 40, this.giant.y - 20, '#f59e0b');

      const d = dist(this.giant.x + 40, this.giant.y + 60, this.raptor.x, this.raptor.y);
      if (d < 360 && !this.raptor.isDodging && !this.raptor.isRolling && this.raptor.invulnerableTimer <= 0) {
        this.stunRaptor(1.8, 'STUNNED!');
      }

      for (let i = 0; i < 26; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 220;
        this.particles.push({
          x: this.giant.x + 40,
          y: this.giant.y + 60,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 6 + Math.random() * 12,
          color: Math.random() > 0.5 ? '#d97706' : '#92400e',
          alpha: 0.9,
          life: 0,
          maxLife: 0.7 + Math.random() * 0.4,
          type: 'dust',
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 4,
        });
      }
    }, 280);

    return true;
  }

  // Stun raptor and drop egg if held
  public stunRaptor(duration: number, comic: string = 'BONK!') {
    this.raptor.isStunned = true;
    this.raptor.stunnedTimer = Math.max(this.raptor.stunnedTimer, duration);
    this.raptor.vx = 0;
    this.raptor.vy = 0;
    this.screenShake = Math.max(this.screenShake, 14);

    if (this.raptor.heldEggId !== null) {
      const egg = this.eggs.find((e) => e.id === this.raptor.heldEggId);
      if (egg) {
        egg.state = 'loose';
        egg.vx = (Math.random() - 0.5) * 220;
        egg.vy = -160 + (Math.random() - 0.5) * 80;
        this.addComicText('DROPPED!', egg.x, egg.y - 30, '#ef4444');
      }
      this.raptor.heldEggId = null;
    }

    // Spawn stars
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      this.particles.push({
        x: this.raptor.x,
        y: this.raptor.y - 25,
        vx: Math.cos(a) * 80,
        vy: Math.sin(a) * 80 - 40,
        size: 14,
        color: '#facc15',
        alpha: 1,
        life: 0,
        maxLife: 0.8,
        type: 'star',
        rotation: 0,
        vRot: 6,
      });
    }

    this.addComicText(comic, this.raptor.x, this.raptor.y - 40, '#f43f5e');
  }

  // Roll bandit to a safe random location out of tail reach!
  public rollRaptorToSafety(comic: string = 'TUMBLE!!') {
    // Choose candidate safe spots far away from Giant (Giant is at 370, 420; tail reach is ~400px)
    const safeZones = [
      { x: BURROW_X - 60 + (Math.random() - 0.5) * 80, y: BURROW_Y + (Math.random() - 0.5) * 100 },
      { x: 840 + (Math.random() - 0.5) * 80, y: 190 + (Math.random() - 0.5) * 50 },
      { x: 880 + (Math.random() - 0.5) * 80, y: 640 + (Math.random() - 0.5) * 60 },
      { x: 990 + (Math.random() - 0.5) * 60, y: 250 + (Math.random() - 0.5) * 80 },
      { x: 980 + (Math.random() - 0.5) * 60, y: 560 + (Math.random() - 0.5) * 80 },
    ];

    const pick = safeZones[Math.floor(Math.random() * safeZones.length)];
    const pad = 60;
    const targetX = Math.max(pad, Math.min(ARENA_WIDTH - pad, pick.x));
    const targetY = Math.max(pad, Math.min(ARENA_HEIGHT - pad, pick.y));

    this.raptor.isRolling = true;
    this.raptor.rollStartX = this.raptor.x;
    this.raptor.rollStartY = this.raptor.y;
    this.raptor.rollTargetX = targetX;
    this.raptor.rollTargetY = targetY;
    this.raptor.rollProgress = 0;
    this.raptor.rollAngle = 0;
    this.raptor.invulnerableTimer = 2.6; // 2.6 seconds of iframes!
    this.raptor.isStunned = true;
    this.raptor.stunnedTimer = 1.6;

    sfx.tumble();
    this.stunRaptor(1.6, comic);
  }

  // Raptor dodge roll
  public triggerRaptorDodge(): boolean {
    if (this.raptor.dodgeCooldown > 0 || this.raptor.isDodging || this.raptor.isStunned || this.raptor.isRolling) return false;

    this.raptor.isDodging = true;
    this.raptor.dodgeTimer = 0.42;
    this.raptor.dodgeCooldown = this.raptor.dodgeMaxCooldown;
    sfx.dodge();

    const dashSpeed = 460;
    this.raptor.vx = Math.cos(this.raptor.angle) * dashSpeed;
    this.raptor.vy = Math.sin(this.raptor.angle) * dashSpeed;

    this.addComicText('DODGE!', this.raptor.x, this.raptor.y - 30, '#38bdf8');

    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.raptor.x - Math.cos(this.raptor.angle) * 15,
        y: this.raptor.y - Math.sin(this.raptor.angle) * 15,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        size: 8,
        color: '#fef08a',
        alpha: 0.8,
        life: 0,
        maxLife: 0.4,
        type: 'dust',
        rotation: 0,
        vRot: 0,
      });
    }

    return true;
  }

  // Handle player swipe input for Giant's tail
  public handleTailSwipe(x: number, y: number, isDown: boolean) {
    if (this.giant.isDazed) return;
    const now = performance.now();

    if (isDown) {
      if (this.swipePrevPoint) {
        const dt = (now - this.swipePrevPoint.time) / 1000;
        if (dt > 0.005) {
          const dx = x - this.swipePrevPoint.x;
          const dy = y - this.swipePrevPoint.y;
          const speed = Math.sqrt(dx * dx + dy * dy) / dt;

          this.tailWhipVelocity.vx = (dx / dt);
          this.tailWhipVelocity.vy = (dy / dt);

          this.giant.tailTargetX = x;
          this.giant.tailTargetY = y;
          const speedMultiplier = this.giant.tailInMud ? 0.22 : 0.45;
          this.giant.tailImpulseX = this.tailWhipVelocity.vx * speedMultiplier;
          this.giant.tailImpulseY = this.tailWhipVelocity.vy * speedMultiplier;

          if (speed > 850 && !this.giant.tailInMud) {
            sfx.whoosh(Math.min(2.0, speed / 850));
          }
        }
      }
      this.swipePrevPoint = { x, y, time: now };
    } else {
      this.swipePrevPoint = null;
    }
  }

  public addComicText(text: string, x: number, y: number, color: string = '#facc15', stroke: string = '#78350f') {
    this.comicTexts.push({
      id: ++this.comicIdCounter,
      text,
      x,
      y,
      vy: -60,
      scale: 1.4,
      color,
      stroke,
      alpha: 1,
    });
  }

  // Main simulation tick
  public update(dt: number, raptorInput: { dx: number; dy: number } | null) {
    if (this.isGameOver) return;

    if (this.mode === 'GUARDIAN' || this.mode === 'VERSUS') {
      this.roundTimeLeft = Math.max(0, this.roundTimeLeft - dt);
      if (this.roundTimeLeft <= 0) {
        this.finishGame('GUARDIAN');
        return;
      }
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 28);
    }

    // Giant Dazed timer (from rock hits)
    if (this.giant.dazedTimer > 0) {
      this.giant.dazedTimer = Math.max(0, this.giant.dazedTimer - dt);
      if (this.giant.dazedTimer <= 0) {
        this.giant.isDazed = false;
        this.giant.expression = 'neutral';
      }
    }

    // Update cooldowns
    if (this.giant.stompCooldown > 0) {
      this.giant.stompCooldown = Math.max(0, this.giant.stompCooldown - dt);
    }
    if (this.giant.stompTimer > 0) {
      this.giant.stompTimer = Math.max(0, this.giant.stompTimer - dt);
      if (this.giant.stompTimer <= 0) {
        this.giant.isStomping = false;
      }
    }

    if (this.raptor.dodgeCooldown > 0) {
      this.raptor.dodgeCooldown = Math.max(0, this.raptor.dodgeCooldown - dt);
    }
    if (this.raptor.dodgeTimer > 0) {
      this.raptor.dodgeTimer = Math.max(0, this.raptor.dodgeTimer - dt);
      if (this.raptor.dodgeTimer <= 0) {
        this.raptor.isDodging = false;
      }
    }
    if (this.raptor.stunnedTimer > 0) {
      this.raptor.stunnedTimer = Math.max(0, this.raptor.stunnedTimer - dt);
      if (this.raptor.stunnedTimer <= 0) {
        this.raptor.isStunned = false;
      }
    }
    if (this.raptor.invulnerableTimer > 0) {
      this.raptor.invulnerableTimer = Math.max(0, this.raptor.invulnerableTimer - dt);
    }

    // Bush concealment for Raptor
    let insideBush = false;
    for (const bush of this.bushes) {
      const d = dist(this.raptor.x, this.raptor.y, bush.x, bush.y);
      if (d < bush.radius * 0.85) {
        insideBush = true;
        bush.rustle = Math.min(1, bush.rustle + dt * 4);
        break;
      } else {
        bush.rustle = Math.max(0, bush.rustle - dt * 2);
      }
    }
    this.raptor.inBush = insideBush;
    this.raptor.stealthAlpha += ((insideBush ? 0.45 : 1.0) - this.raptor.stealthAlpha) * dt * 8;

    // Mud Patches check for Raptor & Tail
    this.updateMudHazards(dt);

    // Falling Rocks Hazard Lifecycle
    this.updateFallingRocks(dt);

    // Head look
    this.giant.blinkTimer += dt;
    if (this.giant.blinkTimer > 3.5) {
      this.giant.isBlinking = true;
      if (this.giant.blinkTimer > 3.65) {
        this.giant.isBlinking = false;
        this.giant.blinkTimer = 0;
      }
    }

    const lookTarget = insideBush
      ? { x: NEST_X, y: NEST_Y }
      : { x: this.raptor.x, y: this.raptor.y };
    this.giant.lookTargetX += (lookTarget.x - this.giant.lookTargetX) * dt * 4;
    this.giant.lookTargetY += (lookTarget.y - this.giant.lookTargetY) * dt * 4;

    // Update Raptor Movement & Rolling Tumble
    this.updateRaptor(dt, raptorInput);

    // Update Giant Tail Physics
    this.updateTail(dt);

    // Update Eggs Physics & Interactions
    this.updateEggs(dt);

    // Check Tail vs Raptor Collisions
    this.checkTailCollision();

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * dt * 10;
      sw.alpha -= dt * 1.8;
      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.rotation += p.vRot * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Comic Texts
    for (let i = this.comicTexts.length - 1; i >= 0; i--) {
      const ct = this.comicTexts[i];
      ct.y += ct.vy * dt;
      ct.alpha -= dt * 1.1;
      ct.scale = Math.max(1, ct.scale - dt * 0.8);
      if (ct.alpha <= 0) {
        this.comicTexts.splice(i, 1);
      }
    }
  }

  // Update Mud Patches & their effects on both dinosaurs
  private updateMudHazards(dt: number) {
    // 1. Mud Bubbles Animation
    for (const patch of this.mudPatches) {
      for (const b of patch.bubbles) {
        b.progress += dt * b.speed;
        if (b.progress > 1) {
          b.progress = 0;
          b.relX = (Math.random() - 0.5) * patch.radiusX * 1.4;
          b.relY = (Math.random() - 0.5) * patch.radiusY * 1.4;
          b.size = 3 + Math.random() * 5;
        }
      }
    }

    // 2. Check if Raptor is in Mud
    let raptorInMud = false;
    for (const patch of this.mudPatches) {
      const cos = Math.cos(-patch.rotation);
      const sin = Math.sin(-patch.rotation);
      const dx = this.raptor.x - patch.x;
      const dy = this.raptor.y - patch.y;
      const rx = (dx * cos - dy * sin) / patch.radiusX;
      const ry = (dx * sin + dy * cos) / patch.radiusY;
      if (rx * rx + ry * ry <= 1.0) {
        raptorInMud = true;
        break;
      }
    }
    this.raptor.inMud = raptorInMud;

    if (raptorInMud && !this.raptor.isRolling && (Math.abs(this.raptor.vx) > 20 || Math.abs(this.raptor.vy) > 20)) {
      if (Math.random() < 0.25) {
        sfx.mudSquish();
        this.particles.push({
          x: this.raptor.x + (Math.random() - 0.5) * 16,
          y: this.raptor.y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          size: 5 + Math.random() * 4,
          color: '#3e2723',
          alpha: 0.8,
          life: 0,
          maxLife: 0.35,
          type: 'mud',
          rotation: 0,
          vRot: 0,
        });
      }
    }

    // 3. Check if Giant's Tail passes through Mud
    let tailInMud = false;
    const nodes = this.giant.tailNodes;
    for (let i = 4; i < nodes.length; i++) {
      const node = nodes[i];
      for (const patch of this.mudPatches) {
        const cos = Math.cos(-patch.rotation);
        const sin = Math.sin(-patch.rotation);
        const dx = node.x - patch.x;
        const dy = node.y - patch.y;
        const rx = (dx * cos - dy * sin) / patch.radiusX;
        const ry = (dx * sin + dy * cos) / patch.radiusY;
        if (rx * rx + ry * ry <= 1.0) {
          tailInMud = true;
          node.vx *= Math.pow(0.15, dt);
          node.vy *= Math.pow(0.15, dt);
          if (Math.random() < 0.2) {
            this.particles.push({
              x: node.x,
              y: node.y,
              vx: (Math.random() - 0.5) * 60,
              vy: (Math.random() - 0.5) * 60,
              size: 7,
              color: '#4e342e',
              alpha: 0.8,
              life: 0,
              maxLife: 0.4,
              type: 'mud',
              rotation: 0,
              vRot: 0,
            });
          }
        }
      }
    }
    this.giant.tailInMud = tailInMud;
  }

  // Update Falling Rocks (Volcanic/Geyser hazards that threaten BOTH players)
  private updateFallingRocks(dt: number) {
    this.rockSpawnTimer -= dt;
    if (this.rockSpawnTimer <= 0) {
      this.rockSpawnTimer = 4.8 + Math.random() * 2.8;

      // Spawn target location offering strategic opportunities
      const targetRoll = Math.random();
      let tx = 600;
      let ty = 400;

      if (targetRoll < 0.45) {
        // Target near Giant / Nest area (hazards for Giant!)
        tx = 340 + Math.random() * 260;
        ty = 260 + Math.random() * 260;
      } else if (targetRoll < 0.85) {
        // Target midfield / mud corridors (hazards for Bandit)
        tx = 640 + Math.random() * 280;
        ty = 200 + Math.random() * 420;
      } else {
        // Target near burrow or southern bush
        tx = 850 + Math.random() * 200;
        ty = 350 + Math.random() * 200;
      }

      this.fallingRocks.push({
        id: ++this.rockIdCounter,
        x: tx,
        y: ty,
        height: 520,
        radius: 32,
        warningTimer: 1.35,
        warningDuration: 1.35,
        state: 'warning',
        impactProgress: 0,
        rotation: Math.random() * Math.PI * 2,
      });

      sfx.rockWarning();
    }

    // Process existing falling rocks
    for (let i = this.fallingRocks.length - 1; i >= 0; i--) {
      const rock = this.fallingRocks[i];

      if (rock.state === 'warning') {
        rock.warningTimer -= dt;
        if (rock.warningTimer <= 0) {
          rock.state = 'falling';
        }
      } else if (rock.state === 'falling') {
        rock.height -= dt * 1100;
        rock.rotation += dt * 4;

        if (rock.height <= 0) {
          rock.height = 0;
          rock.state = 'impact';
          rock.impactProgress = 0;

          // Impact effects
          sfx.rockCrash();
          this.screenShake = 22;

          this.shockwaves.push({
            x: rock.x,
            y: rock.y,
            radius: 15,
            maxRadius: 180,
            alpha: 1,
            color: '#ef4444',
          });

          this.addComicText('CRASH!!', rock.x, rock.y - 45, '#ef4444', '#7f1d1d');

          // Scatter rock rubble particles
          for (let p = 0; p < 14; p++) {
            const a = Math.random() * Math.PI * 2;
            const spd = 80 + Math.random() * 220;
            this.particles.push({
              x: rock.x,
              y: rock.y,
              vx: Math.cos(a) * spd,
              vy: Math.sin(a) * spd,
              size: 8 + Math.random() * 10,
              color: Math.random() > 0.5 ? '#78716c' : '#44403c',
              alpha: 0.9,
              life: 0,
              maxLife: 0.6 + Math.random() * 0.4,
              type: 'rock_rubble',
              rotation: Math.random() * Math.PI,
              vRot: (Math.random() - 0.5) * 8,
            });
          }

          // 1. Check if rock hits Raptor
          const dRaptor = dist(rock.x, rock.y, this.raptor.x, this.raptor.y);
          if (dRaptor < rock.radius + 28 && !this.raptor.isDodging && !this.raptor.isRolling && this.raptor.invulnerableTimer <= 0) {
            this.raptor.hearts = Math.max(0, this.raptor.hearts - 1);
            this.rollRaptorToSafety('ROCK HIT!!');
            if (this.raptor.hearts <= 0) {
              this.finishGame('GUARDIAN');
            }
          }

          // 2. Check if rock hits Giant Dinosaur (Dazes the Giant!)
          const dGiantBody = dist(rock.x, rock.y, this.giant.x, this.giant.y);
          const dGiantHead = dist(rock.x, rock.y, this.giant.headX, this.giant.headY);
          if (dGiantBody < rock.radius + 85 || dGiantHead < rock.radius + 45) {
            this.giant.isDazed = true;
            this.giant.dazedTimer = 2.4;
            this.giant.expression = 'dazed';
            sfx.bonk(true);
            this.addComicText('DIZZY DINO!!', this.giant.x, this.giant.y - 75, '#f59e0b', '#78350f');

            // Stars over giant head
            for (let s = 0; s < 6; s++) {
              this.particles.push({
                x: this.giant.headX,
                y: this.giant.headY - 20,
                vx: (Math.random() - 0.5) * 70,
                vy: (Math.random() - 0.5) * 70 - 30,
                size: 16,
                color: '#facc15',
                alpha: 1,
                life: 0,
                maxLife: 1.2,
                type: 'star',
                rotation: 0,
                vRot: 4,
              });
            }
          }

          // 3. Bounce loose eggs if near rock impact
          for (const egg of this.eggs) {
            if (egg.state === 'loose') {
              const dEgg = dist(rock.x, rock.y, egg.x, egg.y);
              if (dEgg < rock.radius + 40) {
                const ang = Math.atan2(egg.y - rock.y, egg.x - rock.x);
                egg.vx = Math.cos(ang) * 240;
                egg.vy = Math.sin(ang) * 240;
              }
            }
          }
        }
      } else if (rock.state === 'impact') {
        rock.impactProgress += dt * 3.5;
        if (rock.impactProgress >= 1) {
          this.fallingRocks.splice(i, 1);
        }
      }
    }
  }

  // Raptor update including rolling recovery
  private updateRaptor(dt: number, raptorInput: { dx: number; dy: number } | null) {
    // 1. If currently in rolling recovery flight
    if (this.raptor.isRolling) {
      this.raptor.rollProgress += dt * 1.55;
      const p = Math.min(1, this.raptor.rollProgress);
      // Smooth ease out trajectory
      const ease = 1 - Math.pow(1 - p, 2);
      this.raptor.x = this.raptor.rollStartX + (this.raptor.rollTargetX - this.raptor.rollStartX) * ease;
      this.raptor.y = this.raptor.rollStartY + (this.raptor.rollTargetY - this.raptor.rollStartY) * ease;
      this.raptor.rollAngle += dt * 16;

      // Tumbling dust trail
      if (Math.random() < 0.45) {
        this.particles.push({
          x: this.raptor.x,
          y: this.raptor.y,
          vx: (Math.random() - 0.5) * 50,
          vy: (Math.random() - 0.5) * 50,
          size: 7 + Math.random() * 5,
          color: '#d97706',
          alpha: 0.8,
          life: 0,
          maxLife: 0.35,
          type: 'dust',
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 4,
        });
      }

      if (p >= 1) {
        this.raptor.isRolling = false;
        this.raptor.x = this.raptor.rollTargetX;
        this.raptor.y = this.raptor.rollTargetY;
        this.screenShake = 6;
        this.addComicText('SAFE SPOT!', this.raptor.x, this.raptor.y - 30, '#38bdf8');
      }
      return;
    }

    if (this.raptor.isStunned) {
      return;
    }

    let moveX = 0;
    let moveY = 0;

    if (this.mode === 'BANDIT' || this.mode === 'VERSUS') {
      if (raptorInput && (Math.abs(raptorInput.dx) > 0.05 || Math.abs(raptorInput.dy) > 0.05)) {
        moveX = raptorInput.dx;
        moveY = raptorInput.dy;
        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        if (len > 1) {
          moveX /= len;
          moveY /= len;
        }
      }
    } else {
      const aiMove = this.computeRaptorAI(dt);
      moveX = aiMove.dx;
      moveY = aiMove.dy;
    }

    if (this.raptor.isDodging) {
      this.raptor.x += this.raptor.vx * dt;
      this.raptor.y += this.raptor.vy * dt;
      this.raptor.runCycle += dt * 18;
    } else {
      // Speed modifiers: held egg (-22%), sticky mud (-50%)
      let speedModifier = this.raptor.heldEggId !== null ? 0.78 : 1.0;
      if (this.raptor.inMud) {
        speedModifier *= 0.5;
      }
      const targetSpeed = this.raptor.speed * speedModifier;

      if (Math.abs(moveX) > 0.05 || Math.abs(moveY) > 0.05) {
        this.raptor.angle = Math.atan2(moveY, moveX);
        this.raptor.vx += (moveX * targetSpeed - this.raptor.vx) * dt * 10;
        this.raptor.vy += (moveY * targetSpeed - this.raptor.vy) * dt * 10;
        this.raptor.runCycle += dt * (this.raptor.inMud ? 8 : 14);

        if (Math.random() < 0.2) {
          this.particles.push({
            x: this.raptor.x - Math.cos(this.raptor.angle) * 16,
            y: this.raptor.y - Math.sin(this.raptor.angle) * 16 + 8,
            vx: -Math.cos(this.raptor.angle) * 20 + (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: 5 + Math.random() * 4,
            color: this.raptor.inMud ? '#451a03' : '#a16207',
            alpha: 0.6,
            life: 0,
            maxLife: 0.35,
            type: 'dust',
            rotation: 0,
            vRot: 0,
          });
        }
      } else {
        this.raptor.vx *= Math.pow(0.001, dt);
        this.raptor.vy *= Math.pow(0.001, dt);
      }

      this.raptor.x += this.raptor.vx * dt;
      this.raptor.y += this.raptor.vy * dt;
    }

    const pad = 35;
    this.raptor.x = Math.max(pad, Math.min(ARENA_WIDTH - pad, this.raptor.x));
    this.raptor.y = Math.max(pad, Math.min(ARENA_HEIGHT - pad, this.raptor.y));

    // Egg Pickup check if not already carrying
    if (this.raptor.heldEggId === null && !this.raptor.isDodging && !this.raptor.isRolling) {
      for (const egg of this.eggs) {
        if (egg.state === 'nest' || egg.state === 'loose') {
          const d = dist(this.raptor.x, this.raptor.y, egg.x, egg.y);
          if (d < 36) {
            this.raptor.heldEggId = egg.id;
            egg.state = 'carried';
            sfx.yoink();
            this.addComicText('YOINK!', this.raptor.x, this.raptor.y - 35, '#38bdf8');
            this.giant.expression = 'surprised';
            setTimeout(() => {
              if (this.giant.expression === 'surprised') this.giant.expression = 'angry';
            }, 500);
            break;
          }
        }
      }
    }

    // Egg Banking check
    if (this.raptor.heldEggId !== null) {
      const dToBurrow = dist(this.raptor.x, this.raptor.y, BURROW_X, BURROW_Y);
      if (dToBurrow < BURROW_RADIUS) {
        const egg = this.eggs.find((e) => e.id === this.raptor.heldEggId);
        if (egg) {
          egg.state = 'banked';
          egg.x = BURROW_X + (Math.random() - 0.5) * 40;
          egg.y = BURROW_Y + (Math.random() - 0.5) * 40;
        }
        this.raptor.heldEggId = null;
        this.eggsBanked++;
        sfx.eggBanked();
        this.addComicText('EGG STOLEN!', BURROW_X, BURROW_Y - 40, '#10b981');

        if (this.eggsBanked >= 3) {
          this.finishGame('BANDIT');
        }
      }
    }
  }

  // AI behavior for Raptor when playing as Giant Guardian
  private computeRaptorAI(dt: number): { dx: number; dy: number } {
    this.raptor.aiTimer -= dt;

    if (this.raptor.heldEggId !== null) {
      const dx = BURROW_X - this.raptor.x;
      const dy = BURROW_Y - this.raptor.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      const tailTip = this.giant.tailNodes[this.giant.tailNodes.length - 1];
      const dTail = dist(tailTip.x, tailTip.y, this.raptor.x, this.raptor.y);
      if (dTail < 140 && this.giant.tailTipSpeed > 320 && Math.random() < 0.35) {
        this.triggerRaptorDodge();
      }

      return { dx: dx / len, dy: dy / len };
    }

    const availableEggs = this.eggs.filter((e) => e.state === 'nest' || e.state === 'loose');
    if (availableEggs.length === 0) {
      return { dx: 0, dy: 0 };
    }

    let targetEgg = availableEggs[0];
    let minDist = 99999;
    for (const egg of availableEggs) {
      const d = dist(this.raptor.x, this.raptor.y, egg.x, egg.y);
      if (d < minDist) {
        minDist = d;
        targetEgg = egg;
      }
    }

    const tailTip = this.giant.tailNodes[this.giant.tailNodes.length - 1];
    const dTail = dist(tailTip.x, tailTip.y, this.raptor.x, this.raptor.y);

    if (this.raptor.aiTimer <= 0) {
      this.raptor.aiTimer = 1.2 + Math.random() * 1.5;
      const rand = Math.random();

      // If Giant is dazed, go straight for egg!
      if (this.giant.isDazed) {
        this.raptor.aiState = 'charging';
      } else if (dTail < 180 && this.giant.tailTipSpeed > 250) {
        if (rand < 0.6) {
          this.triggerRaptorDodge();
        } else {
          this.raptor.aiState = 'feinting';
        }
      } else if (rand < 0.25) {
        this.raptor.aiState = 'stalking';
      } else {
        this.raptor.aiState = 'charging';
      }
    }

    if (this.raptor.aiState === 'stalking') {
      const nearestBush = this.bushes[0];
      const dx = nearestBush.x - this.raptor.x;
      const dy = nearestBush.y - this.raptor.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 30) {
        return { dx: dx / len, dy: dy / len };
      } else {
        this.raptor.aiState = 'charging';
      }
    }

    if (this.raptor.aiState === 'feinting') {
      const perpX = -(tailTip.y - this.raptor.y);
      const perpY = tailTip.x - this.raptor.x;
      const len = Math.sqrt(perpX * perpX + perpY * perpY);
      return { dx: perpX / len, dy: perpY / len };
    }

    const dx = targetEgg.x - this.raptor.x;
    const dy = targetEgg.y - this.raptor.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    return { dx: dx / len, dy: dy / len };
  }

  // Articulated tail kinematics
  private updateTail(dt: number) {
    const rootX = this.giant.x - 30;
    const rootY = this.giant.y + 20;

    if (this.mode === 'BANDIT' && !this.giant.isDazed) {
      this.computeGiantAI(dt);
    }

    // Apply tail impulses (slowed if tail in mud)
    const dampRate = this.giant.tailInMud ? 0.01 : 0.05;
    this.giant.tailTargetX += this.giant.tailImpulseX * dt;
    this.giant.tailTargetY += this.giant.tailImpulseY * dt;
    this.giant.tailImpulseX *= Math.pow(dampRate, dt);
    this.giant.tailImpulseY *= Math.pow(dampRate, dt);

    const nodes = this.giant.tailNodes;
    nodes[0].x = rootX;
    nodes[0].y = rootY;

    const tipIndex = nodes.length - 1;
    const tipNode = nodes[tipIndex];

    const springK = this.giant.isDazed ? 12.0 : this.giant.tailInMud ? 22.0 : 38.0;
    const damping = this.giant.tailInMud ? 0.72 : 0.88;
    const tipDx = this.giant.tailTargetX - tipNode.x;
    const tipDy = this.giant.tailTargetY - tipNode.y;

    tipNode.vx = (tipNode.vx + tipDx * springK * dt) * damping;
    tipNode.vy = (tipNode.vy + tipDy * springK * dt) * damping;
    tipNode.x += tipNode.vx * dt;
    tipNode.y += tipNode.vy * dt;

    const currentTipSpeed = Math.sqrt(tipNode.vx * tipNode.vx + tipNode.vy * tipNode.vy);
    this.giant.tailTipSpeed = currentTipSpeed;

    if (currentTipSpeed > 280 && !this.giant.isDazed) {
      this.giant.tailTipTrail.unshift({
        x: tipNode.x,
        y: tipNode.y,
        alpha: 1.0,
        radius: tipNode.radius * 1.2,
      });
      if (this.giant.tailTipTrail.length > 14) {
        this.giant.tailTipTrail.pop();
      }
    }
    for (const t of this.giant.tailTipTrail) {
      t.alpha -= dt * 2.8;
    }
    this.giant.tailTipTrail = this.giant.tailTipTrail.filter((t) => t.alpha > 0);

    const segmentLen = 32;
    for (let iter = 0; iter < 4; iter++) {
      for (let i = nodes.length - 2; i >= 1; i--) {
        const next = nodes[i + 1];
        const cur = nodes[i];
        const dx = cur.x - next.x;
        const dy = cur.y - next.y;
        const distSeg = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = (distSeg - segmentLen) / distSeg;
        cur.x -= dx * diff * 0.45;
        cur.y -= dy * diff * 0.45;
      }

      nodes[0].x = rootX;
      nodes[0].y = rootY;
      for (let i = 1; i < nodes.length; i++) {
        const prev = nodes[i - 1];
        const cur = nodes[i];
        const dx = cur.x - prev.x;
        const dy = cur.y - prev.y;
        const distSeg = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = (distSeg - segmentLen) / distSeg;
        cur.x -= dx * diff;
        cur.y -= dy * diff;
        cur.angle = Math.atan2(dy, dx);
      }
    }
  }

  // Giant AI when player is Raptor Bandit
  private giantAITimer: number = 0;
  private computeGiantAI(dt: number) {
    if (this.giant.isDazed) return;
    this.giantAITimer += dt;

    const raptorDist = dist(this.giant.x, this.giant.y, this.raptor.x, this.raptor.y);

    if (raptorDist < 260 && this.giant.stompCooldown <= 0 && !this.raptor.inBush) {
      if (Math.random() < 0.4) {
        this.triggerStomp();
        return;
      }
    }

    if (this.giantAITimer > 0.8) {
      this.giantAITimer = 0;

      if (this.raptor.inBush) {
        const sweepAngle = Math.PI * 0.3 + Math.sin(Date.now() / 300) * 0.8;
        this.giant.tailTargetX = NEST_X + Math.cos(sweepAngle) * 180;
        this.giant.tailTargetY = NEST_Y + Math.sin(sweepAngle) * 140;
        this.giant.tailImpulseX = (Math.random() - 0.5) * 400;
        this.giant.tailImpulseY = (Math.random() - 0.5) * 400;
      } else {
        const leadX = this.raptor.x + this.raptor.vx * 0.35;
        const leadY = this.raptor.y + this.raptor.vy * 0.35;
        this.giant.tailTargetX = leadX;
        this.giant.tailTargetY = leadY;
        const angleToRaptor = Math.atan2(leadY - (this.giant.y + 20), leadX - (this.giant.x - 30));
        const whipSpd = this.difficulty === 'CHAMPION' ? 750 : 520;
        this.giant.tailImpulseX = Math.cos(angleToRaptor + 0.3) * whipSpd;
        this.giant.tailImpulseY = Math.sin(angleToRaptor + 0.3) * whipSpd;
      }
    }
  }

  // Tail vs Raptor Hitbox
  private checkTailCollision() {
    // If raptor is dodging, stunned, rolling away, or has active invulnerability frames, ignore collision!
    if (this.raptor.isDodging || this.raptor.isStunned || this.raptor.isRolling || this.raptor.invulnerableTimer > 0) return;
    if (this.giant.isDazed) return;

    const raptorRadius = 24;
    const nodes = this.giant.tailNodes;

    for (let i = 4; i < nodes.length - 1; i++) {
      const n1 = nodes[i];
      const n2 = nodes[i + 1];

      const { distance } = distPointToSegment(this.raptor.x, this.raptor.y, n1.x, n1.y, n2.x, n2.y);
      const combinedRadius = raptorRadius + n2.radius;

      if (distance < combinedRadius) {
        const hitSpeed = Math.max(150, this.giant.tailTipSpeed);
        if (hitSpeed > 180) {
          this.raptorWhacks++;
          this.raptor.hearts = Math.max(0, this.raptor.hearts - 1);
          sfx.bonk(true);

          // Crucial fix: roll bandit into a safe random location out of tail reach!
          this.rollRaptorToSafety('WHACK!!');
          this.giant.expression = 'happy';
          setTimeout(() => {
            if (this.giant.expression === 'happy') this.giant.expression = 'neutral';
          }, 800);

          if (this.raptor.hearts <= 0) {
            this.finishGame('GUARDIAN');
          }
          break;
        }
      }
    }
  }

  // Eggs physics and loose roll
  private updateEggs(dt: number) {
    for (const egg of this.eggs) {
      if (egg.state === 'carried') {
        const forwardOffset = 18;
        egg.x = this.raptor.x + Math.cos(this.raptor.angle) * forwardOffset;
        egg.y = this.raptor.y + Math.sin(this.raptor.angle) * forwardOffset + 4;
        egg.wobble = Math.sin(Date.now() / 120) * 0.2;
      } else if (egg.state === 'loose') {
        egg.x += egg.vx * dt;
        egg.y += egg.vy * dt;
        egg.vx *= Math.pow(0.08, dt);
        egg.vy *= Math.pow(0.08, dt);
        egg.wobble += (egg.vx + egg.vy) * dt * 0.1;

        const dNest = dist(egg.x, egg.y, NEST_X, NEST_Y);
        if (dNest < NEST_RADIUS) {
          egg.state = 'nest';
          egg.x = egg.baseX;
          egg.y = egg.baseY;
          sfx.eggBanked();
          this.addComicText('SAVED!', egg.x, egg.y - 25, '#10b981');
        }
      }
    }
  }

  private finishGame(winner: 'GUARDIAN' | 'BANDIT') {
    this.isGameOver = true;
    this.winner = winner;
    sfx.cheer();
  }
}
