class Wall {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'normal', 'brick', 'metal', 'water', 'forest'
        this.destructible = type === 'normal' || type === 'brick';
        this.passable = type === 'forest'; // 森林可穿过但会遮挡视野
    }

    draw(ctx) {
        ctx.save();
        
        switch(this.type) {
            case 'brick':
                this.drawBrickWall(ctx);
                break;
            case 'metal':
                this.drawMetalWall(ctx);
                break;
            case 'water':
                this.drawWater(ctx);
                break;
            case 'forest':
                this.drawForest(ctx);
                break;
            default:
                this.drawNormalWall(ctx);
        }
        
        ctx.restore();
    }

    drawNormalWall(ctx) {
        ctx.fillStyle = '#8B4513'; // 棕色
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#A0522D';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    drawBrickWall(ctx) {
        // 砖墙纹理
        ctx.fillStyle = '#B22222'; // 砖红色
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 砖块线条
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 1;
        
        // 水平线
        for(let y = this.y + 10; y < this.y + this.height; y += 10) {
            ctx.beginPath();
            ctx.moveTo(this.x, y);
            ctx.lineTo(this.x + this.width, y);
            ctx.stroke();
        }
        
        // 垂直线 - 交错排列
        for(let x = this.x + 10; x < this.x + this.width; x += 20) {
            for(let y = this.y; y < this.y + this.height; y += 20) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 10);
                ctx.stroke();
            }
        }
    }

    drawMetalWall(ctx) {
        // 金属墙
        const gradient = ctx.createLinearGradient(
            this.x, this.y, 
            this.x + this.width, this.y + this.height
        );
        gradient.addColorStop(0, '#A9A9A9');
        gradient.addColorStop(0.5, '#D3D3D3');
        gradient.addColorStop(1, '#A9A9A9');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 金属铆钉
        ctx.fillStyle = '#696969';
        const spacing = 15;
        for(let x = this.x + spacing/2; x < this.x + this.width; x += spacing) {
            for(let y = this.y + spacing/2; y < this.y + this.height; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }

    drawWater(ctx) {
        // 水效果
        ctx.fillStyle = '#1E90FF';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 水波纹
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        
        for(let i = 0; i < 3; i++) {
            const offset = (Date.now() / 500 + i * 30) % 60;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width/2, 
                this.y + this.height/2, 
                this.width/3 + offset/3, 
                0, Math.PI*2
            );
            ctx.stroke();
        }
    }

    drawForest(ctx) {
        // 森林 - 半透明
        ctx.fillStyle = 'rgba(34, 139, 34, 0.5)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 树木
        const treeCount = Math.floor(this.width * this.height / 400);
        for(let i = 0; i < treeCount; i++) {
            const x = this.x + Math.random() * this.width;
            const y = this.y + Math.random() * this.height;
            
            // 树干
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x - 2, y - 10, 4, 10);
            
            // 树冠
            ctx.fillStyle = '#2E8B57';
            ctx.beginPath();
            ctx.arc(x, y - 15, 8, 0, Math.PI*2);
            ctx.fill();
        }
    }
}