class Tank {
  constructor(x, y, color, controls, name) {
    this.x = x;
    this.y = y;
    this.size = TANK_SIZE;
    this.color = color;
    this.controls = controls;
    this.name = name;
    this.direction = Direction.UP;
    this.health = 100;
    this.score = 0;
    this.alive = true;
    this.baseSpeed = 3;
    this.speed = this.baseSpeed;

    // 图形属性
    this.turretLength = 20;
    this.turretWidth = 6;
    this.trackWidth = 10;
    this.turretAngle = 0; // 炮塔角度初始化为0
    this.turretRotationSpeed = 0.05;
    this.idNumber = Math.floor(Math.random() * 1000);
    this.camouflagePattern = this.generateCamouflage();
  }
 draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    
    // 绘制坦克底盘（不旋转整个坦克）
    ctx.fillStyle = this.color;
    this.drawRoundedTankBody(ctx);

    // 绘制迷彩图案
    this.drawCamouflage(ctx);

    // 绘制履带（两侧）
    ctx.fillStyle = "#333";
    // 根据方向绘制履带
    if (this.direction === Direction.UP || this.direction === Direction.DOWN) {
        // 左右履带（默认方向）
        ctx.fillRect(-this.size / 2, -this.size / 2, this.trackWidth, this.size);
        ctx.fillRect(this.size / 2 - this.trackWidth, -this.size / 2, this.trackWidth, this.size);
    } else {
        // 上下履带（当坦克左右移动时）
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.trackWidth);
        ctx.fillRect(-this.size / 2, this.size / 2 - this.trackWidth, this.size, this.trackWidth);
    }

    // 绘制炮塔底座（圆形）
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
    ctx.fill();

    // 绘制炮管
    ctx.save();
    // 计算基础角度（基于坦克方向）
    let baseAngle;
    switch(this.direction) {
        case Direction.UP: baseAngle =0; break;
        case Direction.RIGHT: baseAngle = Math.PI / 2; break;
        case Direction.DOWN: baseAngle = Math.PI ; break;
        case Direction.LEFT: baseAngle = -Math.PI / 2; break;
    }
    // 最终角度 = 基础角度 + 炮塔旋转
    const finalAngle = baseAngle + this.turretAngle;
    ctx.rotate(finalAngle);
    
    ctx.fillStyle = "#555";
    ctx.fillRect(-this.turretWidth / 2, -this.turretLength, this.turretWidth, this.turretLength);
    
    // 炮管末端细节
    ctx.fillStyle = "#777";
    ctx.fillRect(-this.turretWidth / 2, -this.turretLength, this.turretWidth, 3);
    ctx.restore();

    // 绘制坦克名称和生命值（不需要旋转）
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.name, 0, -this.size / 2 - 10);

    // 绘制生命值条
    ctx.fillStyle = "red";
    const healthWidth = this.size * (this.health / 100);
    ctx.fillRect(-this.size / 2, -this.size / 2 - 8, healthWidth, 4);
    
    // 生命值条边框
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(-this.size / 2, -this.size / 2 - 8, this.size, 4);

    ctx.restore();
}

  drawRoundedTankBody(ctx) {
    const radius = this.size / 5;
    ctx.beginPath();
    ctx.moveTo(-this.size / 2 + radius, -this.size / 2);
    ctx.lineTo(this.size / 2 - radius, -this.size / 2);
    ctx.quadraticCurveTo(
      this.size / 2,
      -this.size / 2,
      this.size / 2,
      -this.size / 2 + radius
    );
    ctx.lineTo(this.size / 2, this.size / 2 - radius);
    ctx.quadraticCurveTo(
      this.size / 2,
      this.size / 2,
      this.size / 2 - radius,
      this.size / 2
    );
    ctx.lineTo(-this.size / 2 + radius, this.size / 2);
    ctx.quadraticCurveTo(
      -this.size / 2,
      this.size / 2,
      -this.size / 2,
      this.size / 2 - radius
    );
    ctx.lineTo(-this.size / 2, -this.size / 2 + radius);
    ctx.quadraticCurveTo(
      -this.size / 2,
      -this.size / 2,
      -this.size / 2 + radius,
      -this.size / 2
    );
    ctx.closePath();
    ctx.fill();
  }

  drawCamouflage(ctx) {
    if (!this.camouflagePattern) return;

    ctx.save();
    // 创建裁剪区域匹配坦克外形
    this.drawRoundedTankBody(ctx);
    ctx.clip();

    this.camouflagePattern.forEach((spot) => {
      ctx.beginPath();
      ctx.fillStyle = spot.color || this.color;
      ctx.arc(
        (spot.x - 0.5) * this.size,
        (spot.y - 0.5) * this.size,
        (spot.radius || 0.2) * this.size,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    ctx.restore();
  }
  generateCamouflage() {
    // 确保依赖方法存在
    if (typeof this.getRandomCamouflageColor !== "function") {
      console.error("getRandomCamouflageColor 方法缺失");
      return [];
    }

    const pattern = [];
    const spotCount = 5 + Math.floor(Math.random() * 10); // 5-14个斑点

    for (let i = 0; i < spotCount; i++) {
      pattern.push({
        x: Math.random(),
        y: Math.random(),
        radius: 0.1 + Math.random() * 0.3,
        color: this.getRandomCamouflageColor(),
      });
    }

    return pattern;
  }
  // 确保getRandomCamouflageColor方法存在
  getRandomCamouflageColor() {
    // 确保依赖方法存在
    if (typeof this.hexToRgb !== "function") {
      console.error("hexToRgb 方法缺失");
      return this.color; // 返回基础颜色作为后备
    }

    const base = this.hexToRgb(this.color);
    const variation = 30;

    const r = Math.max(
      0,
      Math.min(
        255,
        base.r + Math.floor(Math.random() * variation * 2 - variation)
      )
    );
    const g = Math.max(
      0,
      Math.min(
        255,
        base.g + Math.floor(Math.random() * variation * 2 - variation)
      )
    );
    const b = Math.max(
      0,
      Math.min(
        255,
        base.b + Math.floor(Math.random() * variation * 2 - variation)
      )
    );

    return `rgb(${r}, ${g}, ${b})`;
  }

  // 明确定义 hexToRgb 方法
  hexToRgb(hex) {
    // 移除 # 号（如果存在）
    hex = hex.replace("#", "");

    // 解析 r, g, b 值
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }
  // ... 其他方法保持不变 ...

  update(keys) {
    if (!this.alive) return;

    // 保存旧位置用于碰撞检测
    const oldX = this.x;
    const oldY = this.y;

    // 移动控制
    if (keys[this.controls.up]) {
      this.direction = Direction.UP;
      this.y -= this.speed;
    }
    if (keys[this.controls.down]) {
      this.direction = Direction.DOWN;
      this.y += this.speed;
    }
    if (keys[this.controls.left]) {
      this.direction = Direction.LEFT;
      this.x -= this.speed;
    }
    if (keys[this.controls.right]) {
      this.direction = Direction.RIGHT;
      this.x += this.speed;
    }

    // 边界检查
    this.x = Math.max(0, Math.min(canvas.width - this.size, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.size, this.y));

    // 炮塔旋转控制（使用单独按键）
    if (keys[this.controls.rotateLeft]) {
      this.turretAngle -= this.turretRotationSpeed;
    }
    if (keys[this.controls.rotateRight]) {
      this.turretAngle += this.turretRotationSpeed;
    }

    // 保持炮塔角度在合理范围内
    this.turretAngle = Math.max(-Math.PI/4, Math.min(Math.PI/4, this.turretAngle));

    // 射击控制
    if (keys[this.controls.fire] && !this.fireCooldown) {
      this.fire();
      this.fireCooldown = true;
      setTimeout(() => (this.fireCooldown = false), 500);
    }
  }

  fire() {
    // 计算基础角度（基于坦克方向）
    let baseAngle;
    switch (this.direction) {
      case Direction.UP:
        baseAngle = -Math.PI / 2; // 向上
        break;
      case Direction.RIGHT:
        baseAngle = 0; // 向右
        break;
      case Direction.DOWN:
        baseAngle = Math.PI / 2; // 向下
        break;
      case Direction.LEFT:
        baseAngle = Math.PI; // 向左
        break;
    }

    // 最终角度 = 基础角度 + 炮塔旋转角度
    const finalAngle = baseAngle + this.turretAngle;

    // 计算子弹起始位置（炮口位置）
    const bulletX =
      this.x + this.size / 2 + Math.cos(finalAngle) * (this.turretLength + 5);
    const bulletY =
      this.y + this.size / 2 + Math.sin(finalAngle) * (this.turretLength + 5);

    // 创建子弹
    game.bullets.push(new Bullet(bulletX, bulletY, finalAngle, this));
  }
}
