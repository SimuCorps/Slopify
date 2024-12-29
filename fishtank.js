class ConstrainedPoint {
    constructor(x, y, constraintRadius, speed, isHead = false, canvasWidth, canvasHeight, buffer = 30) {
        this.x = x;
        this.y = y;
        this.constraintRadius = constraintRadius;
        this.previousPoint = null;
        this.nextPoint = null;
        this.isHead = isHead;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = speed;
        this.turnRate = 0.2 + (Math.random() * 0.2);
        this.waveAngle = 0.4;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.buffer = buffer;
    }

    move(targetX, targetY) {
        if (!this.isHead) return;

        if (targetX != null && targetY != null) {
            // Move towards food
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const targetAngle = Math.atan2(dy, dx);

            const angleDiff = (targetAngle - this.angle + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
            this.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnRate);
        } else {
            // No food available, wander randomly
            if (Math.random() < 0.02) {
                this.angle += (Math.random() - 0.5) * Math.PI / 4;
            }
        }

        this.waveAngle += 0.1;
        const waveOffset = Math.sin(this.waveAngle) * 0.3;
        this.x += Math.cos(this.angle + waveOffset) * this.speed;
        this.y += Math.sin(this.angle + waveOffset) * this.speed;

        // Use buffer for boundaries
        const maxX = this.canvasWidth + this.buffer;
        const maxY = this.canvasHeight + this.buffer;
        const minX = -this.buffer;
        const minY = -this.buffer;

        if (this.x < minX) this.angle = 0;
        if (this.x > maxX) this.angle = Math.PI;
        if (this.y < minY) this.angle = Math.PI / 2;
        if (this.y > maxY) this.angle = -Math.PI / 2;

        this.x = Math.max(minX, Math.min(maxX, this.x));
        this.y = Math.max(minY, Math.min(maxY, this.y));
    }

    constrain() {
        if (this.previousPoint) {
            const dx = this.x - this.previousPoint.x;
            const dy = this.y - this.previousPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > this.constraintRadius) {
                const angle = Math.atan2(dy, dx);
                this.x = this.previousPoint.x + Math.cos(angle) * this.constraintRadius;
                this.y = this.previousPoint.y + Math.sin(angle) * this.constraintRadius;
            }
        }
    }
}


class Fish {
    constructor(x, y, color, speed, canvasWidth, canvasHeight, buffer) {
        this.color = color;
        this.speed = speed;
        this.constraintRadius = 4;
        this.numSegments = 6;
        this.bodySizes = Array.from({length: this.numSegments}, (_, i) => {
            if (i === 0) return 6;
            const t = i / (this.numSegments - 1);
            return 6 * (1 - Math.pow(t, 1.1));
        });
        this.maxBendAngle = Math.PI / 4;

        this.points = Array.from({length: this.numSegments}, (_, i) =>
            new ConstrainedPoint(
                x + i * this.constraintRadius,
                y,
                this.constraintRadius,
                this.speed,
                i === 0,
                canvasWidth,
                canvasHeight,
                buffer
            )
        );

        for (let i = 1; i < this.points.length; i++) {
            this.points[i].previousPoint = this.points[i - 1];
            this.points[i - 1].nextPoint = this.points[i];
        }

        this.eatenCount = 0;
        this.isDead = false;
        this.topReached = false;
        this.bobAngle = 0; // For bobbing at the top
    }

    findClosestFood(foods) {
        if (foods.length === 0) return null;
        const head = this.points[0];
        let closestFood = null;
        let closestDist = Infinity;
        for (const food of foods) {
            const dx = food.x - head.x;
            const dy = food.y - head.y;
            const dist = dx * dx + dy * dy;
            if (dist < closestDist) {
                closestDist = dist;
                closestFood = food;
            }
        }
        return closestFood;
    }

    eatFood(foods) {
        if (this.isDead) return;
        const head = this.points[0];
        for (let i = foods.length - 1; i >= 0; i--) {
            const food = foods[i];
            const dx = food.x - head.x;
            const dy = food.y - head.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 6) {
                foods.splice(i, 1);
                this.eatenCount++;
                if (this.eatenCount > 3) {
                    this.isDead = true;
                }
            }
        }
    }

    update(foods) {
        if (this.isDead) {
            // Dead fish logic: float upwards until topReached, then bob
            const head = this.points[0];
            const topLine = 10; // The vertical line near the top where fish start bobbing

            if (!this.topReached) {
                // Move upward
                head.y -= 0.5; // upward speed
                if (head.y <= topLine) {
                    this.topReached = true;
                }
            } else {
                // Bob at the top
                this.bobAngle += 0.05;
                // We apply a small bobbing motion to the head
                head.y = topLine + Math.sin(this.bobAngle) * 2;
            }

            // Even when dead, we still let constraints apply so body stays intact
            for (const point of this.points) {
                point.constrain();
            }

            return;
        }

        let targetX = null;
        let targetY = null;

        const closestFood = this.findClosestFood(foods);
        if (closestFood) {
            targetX = closestFood.x;
            targetY = closestFood.y;
        }

        // Move head if alive
        this.points[0].move(targetX, targetY);

        // Apply constraints
        for (const point of this.points) {
            point.constrain();
        }

        // Limit joint angles
        for (let i = 0; i < this.points.length - 2; i++) {
            this.limitJointAngle(this.points[i], this.points[i + 1], this.points[i + 2]);
        }

        // Try to eat anblogy food you're close to
        this.eatFood(foods);
    }

    limitJointAngle(p1, p2, p3) {
        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        let angleDiff = (angle2 - angle1 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

        if (Math.abs(angleDiff) > this.maxBendAngle) {
            const newAngle = angle1 + this.maxBendAngle * Math.sign(angleDiff);
            p3.x = p2.x + Math.cos(newAngle) * this.constraintRadius;
            p3.y = p2.y + Math.sin(newAngle) * this.constraintRadius;
        }
    }

    draw(ctx) {
        const bodyPath = this.getBodyPath();
        ctx.fillStyle = this.color;
        ctx.fill(bodyPath);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke(bodyPath);

        const finPath = this.getFinPath(1);
        ctx.fillStyle = this.color;
        ctx.fill(finPath);
        ctx.stroke(finPath);

        if (this.isDead) {
            // Draw two sets of X's on the head
            ctx.save();
            const head = this.points[0];
            const headRadius = this.bodySizes[0];
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // First set of X
            ctx.moveTo(head.x - headRadius / 2, head.y - headRadius / 2);
            ctx.lineTo(head.x + headRadius / 2, head.y + headRadius / 2);
            ctx.moveTo(head.x + headRadius / 2, head.y - headRadius / 2);
            ctx.lineTo(head.x - headRadius / 2, head.y + headRadius / 2);

            // Second set of X slightly offset
            ctx.moveTo(head.x - (headRadius / 2) - 3, head.y - (headRadius / 2) - 3);
            ctx.lineTo(head.x + (headRadius / 2) - 3, head.y + (headRadius / 2) - 3);
            ctx.moveTo(head.x + (headRadius / 2) - 3, head.y - (headRadius / 2) - 3);
            ctx.lineTo(head.x - (headRadius / 2) - 3, head.y + (headRadius / 2) - 3);

            ctx.stroke();
            ctx.restore();
        }
    }

    getBodyPath() {
        const path = new Path2D();

        const getContourPoint = (t, side) => {
            const index = Math.min(Math.floor(t * (this.points.length - 1)), this.points.length - 2);
            const localT = (t * (this.points.length - 1)) % 1;
            const p1 = this.points[index];
            const p2 = this.points[index + 1];
            const size1 = this.bodySizes[index];
            const size2 = this.bodySizes[index + 1];

            const x = (1 - localT) * p1.x + localT * p2.x;
            const y = (1 - localT) * p1.y + localT * p2.y;
            const r = (1 - localT) * size1 + localT * size2;
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + (side * Math.PI / 2);

            return {
                x: x + r * Math.cos(angle),
                y: y + r * Math.sin(angle)
            };
        };

        const head = this.points[0];
        const headRadius = this.bodySizes[0];
        const headAngle = Math.atan2(this.points[1].y - head.y, this.points[1].x - head.x);

        path.moveTo(
            head.x + headRadius * Math.cos(headAngle + Math.PI / 2),
            head.y + headRadius * Math.sin(headAngle + Math.PI / 2)
        );

        path.arc(head.x, head.y, headRadius, headAngle + Math.PI / 2, headAngle - Math.PI / 2, false);

        for (let t = 0; t <= 1; t += 0.1) {
            const point = getContourPoint(t, -1);
            path.lineTo(point.x, point.y);
        }

        for (let t = 1; t >= 0; t -= 0.1) {
            const point = getContourPoint(t, 1);
            path.lineTo(point.x, point.y);
        }

        path.closePath();
        return path;
    }

    getFinPath(finPointIndex) {
        const path = new Path2D();
        const finLength = 6;
        const finWidth = 1.5;
        const finAngle = Math.PI / 6;

        const finShape = (t, foldFactor) => {
            const x = t * finLength;
            const y = finWidth * Math.sin(t * Math.PI) * foldFactor + x * Math.tan(finAngle);
            return {x, y};
        };

        const p1 = this.points[finPointIndex];
        const p2 = this.points[finPointIndex + 1];
        const p0 = this.points[Math.max(0, finPointIndex - 1)];
        const bodyAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const prevBodyAngle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        const turnAngle = (bodyAngle - prevBodyAngle + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

        const size = this.bodySizes[finPointIndex];
        const rightFinBase = {
            x: p1.x + size * Math.cos(bodyAngle + Math.PI / 2),
            y: p1.y + size * Math.sin(bodyAngle + Math.PI / 2)
        };
        const leftFinBase = {
            x: p1.x + size * Math.cos(bodyAngle - Math.PI / 2),
            y: p1.y + size * Math.sin(bodyAngle - Math.PI / 2)
        };

        const rightFoldFactor = 1 - Math.max(0, Math.min(1, turnAngle / (Math.PI / 4)));
        const leftFoldFactor = 1 + Math.max(0, Math.min(1, turnAngle / (Math.PI / 4)));

        // Right fin
        path.moveTo(rightFinBase.x, rightFinBase.y);
        for (let t = 0; t <= 1; t += 0.1) {
            const point = finShape(t, rightFoldFactor);
            const rotatedX = point.x * Math.cos(bodyAngle + finAngle) - point.y * Math.sin(bodyAngle + finAngle);
            const rotatedY = point.x * Math.sin(bodyAngle + finAngle) + point.y * Math.cos(bodyAngle + finAngle);
            path.lineTo(rightFinBase.x + rotatedX, rightFinBase.y + rotatedY);
        }
        path.lineTo(rightFinBase.x, rightFinBase.y);

        // Left fin
        path.moveTo(leftFinBase.x, leftFinBase.y);
        for (let t = 0; t <= 1; t += 0.1) {
            const point = finShape(t, leftFoldFactor);
            const rotatedX = point.x * Math.cos(bodyAngle - finAngle) - (-point.y) * Math.sin(bodyAngle - finAngle);
            const rotatedY = point.x * Math.sin(bodyAngle - finAngle) + (-point.y) * Math.cos(bodyAngle - finAngle);
            path.lineTo(leftFinBase.x + rotatedX, leftFinBase.y + rotatedY);
        }
        path.lineTo(leftFinBase.x, leftFinBase.y);

        return path;
    }
}


class FishTank {
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;
        this.canvas = null;
        this.ctx = null;
        this.fishes = [];
        this.isInitialized = false;
        this.animationFrameId = null;

        this.options = {
            width: options.width || 600,
            height: options.height || 400,
            fishCount: options.fishCount || 10,
            minSpeed: options.minSpeed || 0.5,
            maxSpeed: options.maxSpeed || 2.5,
            buffer: options.buffer || 30,
            isNavBar: options.isNavBar || false
        };

        this.foods = [];
    }

    setCanvasSize() {
        if (!this.canvas) return;

        if (this.canvasId === 'nav-fishtank') {
            const navElement = this.canvas.closest('nav');
            const navHeight = navElement ? navElement.offsetHeight : 64;

            this.canvas.width = window.innerWidth;
            this.canvas.height = navHeight;
            this.canvas.style.width = '100%';
            this.canvas.style.height = navHeight + 'px';

            this.options.width = window.innerWidth;
            this.options.height = navHeight;
            return;
        }

        const container = this.canvas.parentElement;
        const containerWidth = Math.min(container.clientWidth, 600); // Max width of 600px
        const isMobile = window.innerWidth <= 768;

        // Calculate height based on width and screen size
        const height = isMobile ?
            Math.min(containerWidth * 0.75, 300) : // Mobile height
            Math.min(containerWidth * 0.66, 400);  // Desktop height

        this.options.width = containerWidth;
        this.options.height = height;

        this.canvas.width = containerWidth;
        this.canvas.height = height;
        this.canvas.style.width = '100%';
        this.canvas.style.height = height + 'px';
    }

    getRandomColor() {
        const colors = [
            '#b8bb26', // Light green
            '#83a598', // Blue
            '#d3869b', // Pink
            '#fe8019', // Orange
            '#fabd2f'  // Yellow
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomSpeed(min, max) {
        return Math.random() * (max - min) + min;
    }

    initializeFishes() {
        this.fishes = [];
        const totalWidth = this.options.width + this.options.buffer * 2;
        const totalHeight = this.options.height + this.options.buffer * 2;

        // Create fish in a distributed pattern
        for (let i = 0; i < this.options.fishCount; i++) {
            const segment = totalWidth / this.options.fishCount;
            const x = (segment * i) - this.options.buffer;
            const y = Math.random() * totalHeight - this.options.buffer;
            const color = this.getRandomColor();
            const speed = this.getRandomSpeed(this.options.minSpeed, this.options.maxSpeed);

            this.fishes.push(new Fish(
                x, y, color, speed,
                this.options.width,
                this.options.height,
                this.options.buffer
            ));
        }
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            // Account for any scaling between display size and actual canvas dimensions
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            this.foods.push({x, y});
        });

        this.canvas.style.cursor = 'crosshair';

        window.addEventListener('resize', () => {
            if (this.canvas.id === 'nav-fishtank') {
                this.options.width = window.innerWidth;
                this.setCanvasSize();
            }
        });
    }

    drawFoods() {
        for (const food of this.foods) {
            this.ctx.fillStyle = 'brown';
            this.ctx.beginPath();
            this.ctx.arc(food.x, food.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.isInitialized = false;
        this.fishes = [];
        this.foods = [];
    }

    draw = () => {
        if (!document.body.contains(this.canvas)) {
            this.cleanup();
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw foods
        this.drawFoods();

        // Update and draw fish
        for (const fish of this.fishes) {
            fish.update(this.foods);
            fish.draw(this.ctx);
        }

        this.animationFrameId = requestAnimationFrame(this.draw);
    }

    initialize() {
        if (this.isInitialized) return;

        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return;

        // Set initial size
        this.setCanvasSize();

        // Initialize everything before showing the canvas
        this.initializeFishes();
        this.setupEventListeners();

        // Show canvas and hide placeholder once everything is ready
        requestAnimationFrame(() => {
            const placeholder = this.canvas.parentElement.querySelector('.fishtank-placeholder');
            if (placeholder) {
                placeholder.style.opacity = '0';
                setTimeout(() => placeholder.remove(), 300);
            }
            this.canvas.classList.remove('opacity-0');
            this.draw();
            this.isInitialized = true;
        });
    }

}


document.addEventListener('htmx:afterSettle', function (event) {
    const tanks = document.querySelectorAll('canvas[id$="-fishtank"]');
    tanks.forEach(tank => {
        if (!tank.fishtank) {
            const isNav = tank.id === 'nav-fishtank';
            const options = isNav ? {
                height: tank.parentElement.offsetHeight,
                width: window.innerWidth,
                fishCount: 5,
                minSpeed: 0.3,
                maxSpeed: 1.5,
                buffer: 50,
                isNavBar: true
            } : {};

            const fishtank = new FishTank(tank.id, options);
            fishtank.initialize();
            tank.fishtank = fishtank;
        }
    });
});

// Export for global use
window.FishTank = FishTank;
