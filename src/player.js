export default class Player {
  constructor(x, y, color = 'orange') {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 36;
    this.height = 48;
    this.color = color;
    this.onGround = false;
  }

  update(dt, input, platforms) {
    const accel = 1200;
    const maxSpeed = 300;
    const jumpSpeed = -520;

    // Horizontal movement
    if (input.left) this.vx = Math.max(this.vx - accel * dt, -maxSpeed);
    else if (input.right) this.vx = Math.min(this.vx + accel * dt, maxSpeed);
    else this.vx = this.vx * Math.pow(0.0001, dt) || 0; // dampening

    // Gravity
    this.vy += 1400 * dt;

    // Jump
    if (input.jump && this.onGround) {
      this.vy = jumpSpeed;
      this.onGround = false;
    }

    // Apply velocities
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Simple AABB collision with platforms
    this.onGround = false;
    for (const p of platforms) {
      if (this.x + this.width > p.x && this.x < p.x + p.w && this.y + this.height > p.y && this.y < p.y + p.h) {
        // collision resolution: only handle from top
        if (this.vy > 0 && this.y + this.height - this.vy * dt <= p.y + 1) {
          this.y = p.y - this.height;
          this.vy = 0;
          this.onGround = true;
        }
      }
    }
  }

  draw(ctx, cx) {
    const x = this.x - cx;
    const y = this.y;

    // Gorilla body (dark brown)
    ctx.fillStyle = this.color;
    ctx.fillRect(x + 6, y + 24, 24, 24);

    // Gorilla head (circle)
    ctx.beginPath();
    ctx.arc(x + 18, y + 12, 12, 0, Math.PI * 2);
    ctx.fill();

    // Gorilla arms
    ctx.fillRect(x, y + 30, 6, 12);  // left arm
    ctx.fillRect(x + 30, y + 30, 6, 12);  // right arm

    // Gorilla legs
    ctx.fillRect(x + 9, y + 48, 6, 12);  // left leg
    ctx.fillRect(x + 21, y + 48, 6, 12);  // right leg

    // Eyes (black)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 15, y + 9, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 21, y + 9, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (simple line)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 15);
    ctx.lineTo(x + 20, y + 15);
    ctx.stroke();
  }
}
