import Player from './player';

export default class Game {
  constructor(canvas, chosen) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 800;
    this.height = 480;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.input = { left:false, right:false, jump:false };
    this.chosen = chosen;

    // colors per sibling
    this.colors = { paul: '#ff8a00', lena: '#ff66a3', bruno: '#7ee1ff' };

    this.player = new Player(60, 200, this.colors[chosen] || '#f90');

    // flying plane obstacles
    this.planes = []; // {x,y,w,h,vx}
    this.planeTimer = 0;
    this.planeSpawnInterval = 2.0; // seconds

    // simple level: floor and couple platforms
    this.platforms = [
      { x: -1000, y: 420, w: 5000, h: 60 },
      { x: 300, y: 340, w: 120, h: 16 },
      { x: 520, y: 280, w: 140, h: 16 },
      { x: 760, y: 220, w: 120, h: 16 }
    ];

    this.cameraX = 0;

    this._bindKeys();
    this.last = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  _bindKeys() {
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.input.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') this.input.right = true;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') this.input.jump = true;
    });
    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') this.input.right = false;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') this.input.jump = false;
    });
  }

  loop(t) {
    const dt = Math.min(0.033, (t - this.last) / 1000);
    this.last = t;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.player.update(dt, this.input, this.platforms);

    // update planes
    this.planeTimer += dt;
    if (this.planeTimer >= this.planeSpawnInterval) {
      this.planeTimer = 0;
      this._spawnPlane();
      // small random variation
      this.planeSpawnInterval = 1.2 + Math.random() * 2.0;
    }

    for (let i = this.planes.length - 1; i >= 0; i--) {
      const pl = this.planes[i];
      pl.x += pl.vx * dt;
      // remove offscreen (left side)
      if (pl.x + pl.w - this.cameraX < -200) this.planes.splice(i, 1);
      // collision with player
      if (this._aabbIntersect(this.player, pl)) {
        this._onPlayerHit();
      }
    }
    // camera follows player
    const targetX = Math.max(0, this.player.x - 120);
    this.cameraX += (targetX - this.cameraX) * Math.min(1, dt * 8);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.width,this.height);

    // background
    ctx.fillStyle = '#7bd';
    ctx.fillRect(0,0,this.width,this.height);

    // draw platforms
    ctx.fillStyle = '#5a3';
    for (const p of this.platforms) {
      ctx.fillRect(p.x - this.cameraX, p.y, p.w, p.h);
    }

    // draw player
    // draw planes
    ctx.fillStyle = '#c33';
    for (const pl of this.planes) {
      ctx.fillRect(pl.x - this.cameraX, pl.y, pl.w, pl.h);
      // simple wing
      ctx.fillRect(pl.x - this.cameraX + pl.w*0.2, pl.y - 6, pl.w*0.6, 6);
    }

    this.player.draw(ctx, this.cameraX);

    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('Player: ' + this.chosen, 10, 24);
  }

  _spawnPlane() {
    const startX = this.cameraX + this.width + (50 + Math.random() * 300);
    const h = 18 + Math.floor(Math.random() * 20);
    const w = 80 + Math.floor(Math.random() * 80);
    const y = 40 + Math.random() * 200;
    const vx = - (140 + Math.random() * 160);
    this.planes.push({ x: startX, y, w, h, vx });
  }

  _aabbIntersect(a, b) {
    return a.x + a.width > b.x && a.x < b.x + b.w && a.y + a.height > b.y && a.y < b.y + b.h;
  }

  _onPlayerHit() {
    // simple response: reset player to start position
    this.player.x = 60;
    this.player.y = 200;
    this.player.vx = 0;
    this.player.vy = 0;
  }
}
