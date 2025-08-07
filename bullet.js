class Bullet {
    constructor(x, y, angle, owner) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 10;
        this.size = BULLET_SIZE;
        this.owner = owner;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = 'yellow';
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        ctx.restore();
    }
}