// 游戏常量
const TANK_SIZE = 40;
const BULLET_SIZE = 10;
const WIN_SCORE = 20;
const FPS = 60;
const FRAME_TIME = 1000 / FPS;

// 碰撞检测函数
function checkCollision(obj1, obj2) {
    const obj1Right = obj1.x + (obj1.width || obj1.size);
    const obj1Bottom = obj1.y + (obj1.height || obj1.size);
    const obj2Right = obj2.x + (obj2.width || obj2.size);
    const obj2Bottom = obj2.y + (obj2.height || obj2.size);
    
    return obj1.x < obj2Right &&
           obj1Right > obj2.x &&
           obj1.y < obj2Bottom &&
           obj1Bottom > obj2.y;
}

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置画布大小
canvas.width = 800;
canvas.height = 650;

// 坦克初始位置
const initialPositions = [
    { x: 100, y: 100 },
    { x: 400, y: 100 },
    { x: 700, y: 100 }
];

// 游戏状态
const game = {
    tanks: [],
    bullets: [],
    walls: [],
    keys: {},
    gameRunning: true,
    lastTime: 0,
    gameOver: false,
    
    update() {
        // 更新所有坦克
        this.tanks.forEach(tank => {
            if(tank.alive) {
                tank.update(this.keys);
            }
        });
        
        // 更新所有子弹
        this.bullets.forEach(bullet => bullet.update());
        
        // 碰撞检测
        this.checkCollisions();
        
        // 检查游戏结束条件
        this.checkGameEnd();
    },
    
    render() {
        // 1. 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 2. 绘制所有游戏对象
        this.walls.forEach(wall => wall.draw(ctx));
        this.tanks.forEach(tank => tank.draw(ctx));
        this.bullets.forEach(bullet => bullet.draw(ctx));
        
        // 3. 绘制UI（分数等）
        this.drawUI();
        
        // 4. 如果游戏结束，显示结束画面
        if (this.gameOver) {
            this.drawGameOver();
        }
    },
    
    drawUI() {
        // 绘制分数和生命值
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        this.tanks.forEach((tank, index) => {
            ctx.fillText(`${tank.name}: ${tank.score}分 生命:${tank.health}`, 10, 30 + index * 30);
        });
    },
    
    drawGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const winner = this.tanks.find(tank => tank.alive);
        if (winner) {
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${winner.name} 获胜!`, canvas.width/2, canvas.height/2 - 20);
            ctx.font = '20px Arial';
            ctx.fillText('按 R 键重新开始', canvas.width/2, canvas.height/2 + 20);
            ctx.textAlign = 'left';
        }
    },
    
    checkCollisions() {
        // 子弹与墙壁碰撞
        this.bullets = this.bullets.filter(bullet => {
            let hitWall = false;
            this.walls.forEach(wall => {
                if (checkCollision(bullet, wall)) {
                    hitWall = true;
                }
            });
            return !hitWall && 
                   bullet.x > 0 && bullet.x < canvas.width &&
                   bullet.y > 0 && bullet.y < canvas.height;
        });
        
        // 子弹与坦克碰撞
        this.bullets.forEach((bullet, bulletIndex) => {
            this.tanks.forEach(tank => {
                if (tank.alive && bullet.owner !== tank && 
                    checkCollision(bullet, {x: tank.x, y: tank.y, width: tank.size, height: tank.size})) {
                    tank.health -= 10;
                    if (tank.health <= 0) {
                        tank.alive = false;
                        // 给击杀者加分
                        if (bullet.owner) {
                            bullet.owner.score += 1;
                        }
                    }
                    this.bullets.splice(bulletIndex, 1);
                }
            });
        });
        
        // 坦克与墙壁碰撞
        this.tanks.forEach(tank => {
            if (tank.alive) {
                this.walls.forEach(wall => {
                    if (checkCollision(tank, wall)) {
                        // 推回坦克
                        if (tank.direction === Direction.UP) tank.y = wall.y + wall.height;
                        if (tank.direction === Direction.DOWN) tank.y = wall.y - tank.size;
                        if (tank.direction === Direction.LEFT) tank.x = wall.x + wall.width;
                        if (tank.direction === Direction.RIGHT) tank.x = wall.x - tank.size;
                    }
                });
            }
        });
    },
    
    checkGameEnd() {
        const aliveTanks = this.tanks.filter(tank => tank.alive).length;
        if (aliveTanks <= 1) {
            this.gameOver = true;
            this.gameRunning = false;
        }
    },
    
    resetGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.tanks.forEach((tank, index) => {
            tank.x = initialPositions[index].x;
            tank.y = initialPositions[index].y;
            tank.health = 100;
            tank.alive = true;
            tank.direction = Direction.UP;
        });
        this.bullets = [];
        this.createRandomWalls();
        
        // 重新开始游戏循环
        if (!this.gameLoopRunning) {
            this.startGameLoop();
        }
    },
    
    createRandomWalls() {
        this.walls = [];
        const wallCount = 4 + Math.floor(Math.random() * 3); // 4-6个墙壁
        
        for (let i = 0; i < wallCount; i++) {
            let x, y;
            let validPosition = false;
            
            while (!validPosition) {
                x = 50 + Math.floor(Math.random() * (canvas.width - 100));
                y = 150 + Math.floor(Math.random() * (canvas.height - 200));
                
                // 检查是否与任何初始坦克位置太近
                validPosition = initialPositions.every(pos => {
                    return Math.abs(x - pos.x) > 100 || Math.abs(y - pos.y) > 100;
                });
            }
            
            this.walls.push(new Wall(x, y, 50, 50));
        }
    },
    
    init() {
        // 创建三个玩家坦克
        this.tanks.push(new Tank(
            initialPositions[0].x, initialPositions[0].y, 
            'red', 
            { up: 87, down: 83, left: 65, right: 68, fire: 32 }, // W, S, A, D, Space
            '玩家1'
        ));

        this.tanks.push(new Tank(
            initialPositions[1].x, initialPositions[1].y, 
            'green', 
            { up: 38, down: 40, left: 37, right: 39, fire: 13 }, // 方向键, Enter
            '玩家2'
        ));

        this.tanks.push(new Tank(
            initialPositions[2].x, initialPositions[2].y, 
            'blue', 
            { up: 73, down: 75, left: 74, right: 76, fire: 77 }, // I, K, J, L, M
            '玩家3'
        ));

        this.createRandomWalls();

        // 设置键盘事件监听
        window.addEventListener('keydown', (e) => {
            this.keys[e.keyCode] = true;
            
            // 在游戏结束时检测R键
            if (e.keyCode === 82 && this.gameOver) {
                this.resetGame();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.keyCode] = false;
        });

        // 开始游戏循环
        this.startGameLoop();
    },
    
    startGameLoop() {
        this.gameLoopRunning = true;
        this.lastTime = performance.now();
        
        const gameLoop = (timestamp) => {
            const deltaTime = timestamp - this.lastTime;
            if (deltaTime >= FRAME_TIME) {
                if (this.gameRunning) {
                    this.update();
                }
                this.render();
                this.lastTime = timestamp - (deltaTime % FRAME_TIME);
            }
            
            if (this.gameRunning || this.gameOver) {
                requestAnimationFrame(gameLoop);
            } else {
                this.gameLoopRunning = false;
            }
        };
        
        requestAnimationFrame(gameLoop);
    }
};

// 初始化游戏
game.init();