export type GameMode = 'GUARDIAN' | 'BANDIT' | 'VERSUS';

export type GameDifficulty = 'JUNIOR' | 'CHAMPION';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'ROUND_END';

export interface TailNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
}

export interface Egg {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  state: 'nest' | 'carried' | 'loose' | 'banked';
  color: string;
  accentColor: string;
  pattern: 'dots' | 'stripes' | 'stars' | 'swirl';
  wobble: number;
}

export interface FallingRock {
  id: number;
  x: number;
  y: number;
  height: number;
  radius: number;
  warningTimer: number;
  warningDuration: number;
  state: 'warning' | 'falling' | 'impact';
  impactProgress: number;
  rotation: number;
}

export interface MudBubble {
  relX: number;
  relY: number;
  progress: number;
  size: number;
  speed: number;
}

export interface MudPatch {
  id: number;
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  rotation: number;
  bubbles: MudBubble[];
}

export interface GiantDino {
  x: number;
  y: number;
  baseAngle: number;
  targetAngle: number;
  neckAngle: number;
  headX: number;
  headY: number;
  lookTargetX: number;
  lookTargetY: number;
  blinkTimer: number;
  isBlinking: boolean;
  tailNodes: TailNode[];
  tailTipSpeed: number;
  tailTipTrail: { x: number; y: number; alpha: number; radius: number }[];
  stompCooldown: number;
  stompMaxCooldown: number;
  isStomping: boolean;
  stompTimer: number;
  tailTargetX: number;
  tailTargetY: number;
  tailImpulseX: number;
  tailImpulseY: number;
  expression: 'neutral' | 'angry' | 'happy' | 'surprised' | 'dazed';
  isDazed: boolean;
  dazedTimer: number;
  tailInMud: boolean;
}

export interface Raptor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  targetX: number;
  targetY: number;
  heldEggId: number | null;
  hearts: number;
  maxHearts: number;
  isDodging: boolean;
  dodgeTimer: number;
  dodgeCooldown: number;
  dodgeMaxCooldown: number;
  isStunned: boolean;
  stunnedTimer: number;
  runCycle: number;
  inBush: boolean;
  inMud: boolean;
  stealthAlpha: number;
  // Knockback tumble & safe escape
  isRolling: boolean;
  rollStartX: number;
  rollStartY: number;
  rollTargetX: number;
  rollTargetY: number;
  rollProgress: number;
  rollAngle: number;
  invulnerableTimer: number;
  aiState: 'stalking' | 'charging' | 'stealing' | 'fleeing' | 'feinting';
  aiTimer: number;
  aiTargetEggId: number | null;
}

export interface Bush {
  id: number;
  x: number;
  y: number;
  radius: number;
  rustle: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'dust' | 'star' | 'leaf' | 'spark' | 'egg_shell' | 'mud' | 'rock_rubble';
  rotation: number;
  vRot: number;
}

export interface ComicText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  scale: number;
  color: string;
  stroke: string;
  alpha: number;
}
