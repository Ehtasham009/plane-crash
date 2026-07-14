/* ==========================================
   CANVAS ANIMATION
========================================== */

const Animation = {

    canvas: null,
    ctx: null,
    width: 0,
    height: 0,

    points: [],
    currentProgress: 0,
    maxProgress: 1,
    planeX: 0,
    planeY: 0,
    isRunning: false,
    animFrame: null,

    trailColor: "#16c784",
    lineColor: "#16c784",
    glowColor: "rgba(22, 199, 132, 0.4)",

    init() {
        this.canvas = document.getElementById("graphCanvas");
        this.ctx = this.canvas.getContext("2d");

        requestAnimationFrame(() => {
            this.resize();
            this.drawGrid();
        });

        window.addEventListener("resize", () => {
            this.resize();
            if (!this.isRunning) this.drawGrid();
        });
    },

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.canvas.style.width = this.width + "px";
        this.canvas.style.height = this.height + "px";
        this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    },

    drawGrid() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;

        for (let x = 0; x < this.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        for (let y = 0; y < this.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    },

    reset() {
        this.points = [];
        this.currentProgress = 0;
        this.isRunning = false;
        this.trailColor = "#16c784";
        this.lineColor = "#16c784";
        this.glowColor = "rgba(22, 199, 132, 0.4)";

        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
        }

        this.drawGrid();
        this.movePlaneElement(70, this.height - 70);
    },

    startPlaneAnimation() {
        this.isRunning = true;
        this.points = [{ x: 0, y: 0 }];
        this.currentProgress = 0;
    },

    updatePlaneAnimation(multiplier) {
        if (!this.isRunning) return;

        this.currentProgress = multiplier - 1;

        const baseX = 70;
        const baseY = this.height - 70;
        const maxX = this.width - 120;
        const maxY = this.height - 120;

        const x = baseX + Math.min(this.currentProgress * 45, maxX);
        const y = baseY - Math.min(Math.pow(this.currentProgress, 1.6) * 8, maxY);

        this.planeX = x;
        this.planeY = y;

        this.movePlaneElement(x, y);
        this.drawCurve();
    },

    movePlaneElement(x, y) {
        const plane = UI.els.plane;
        plane.style.left = x + "px";
        plane.style.bottom = (this.height - y) + "px";
    },

    drawCurve() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        this.drawGrid();

        if (this.points.length < 2) return;

        const gradient = ctx.createLinearGradient(0, this.height, 0, 0);
        gradient.addColorStop(0, "rgba(22, 199, 132, 0)");
        gradient.addColorStop(1, this.glowColor);

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i - 1];
            const curr = this.points[i];
            const cpx = (prev.x + curr.x) / 2;
            const cpy = (prev.y + curr.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }

        ctx.lineTo(this.planeX, this.planeY);
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.lineColor;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.lineTo(this.planeX, this.height);
        ctx.lineTo(this.points[0].x, this.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    },

    addPoint() {
        if (this.planeX && this.planeY) {
            this.points.push({ x: this.planeX, y: this.planeY });
            if (this.points.length > 200) {
                this.points.shift();
            }
        }
    },

    crashAnimation(callback) {
        this.isRunning = false;
        this.lineColor = "#ff4d5b";
        this.glowColor = "rgba(255, 77, 91, 0.4)";

        this.drawCurve();

        const plane = UI.els.plane;
        const svg = plane.querySelector("svg");

        if (svg) {
            svg.style.filter = "drop-shadow(0 0 18px rgba(239,68,68,.8)) hue-rotate(-30deg)";
        }

        const crashY = this.planeY + 20;
        plane.style.transition = "0.3s ease-in";
        plane.style.bottom = (this.height - crashY) + "px";
        plane.style.opacity = "0.4";
        plane.style.transform = "rotate(30deg) scale(1.1)";

        setTimeout(() => {
            plane.style.transition = "none";
            plane.style.opacity = "0";
        }, 400);

        setTimeout(() => {
            plane.style.transform = "";
            plane.style.opacity = "1";
            plane.style.transition = ".08s linear";
            if (svg) svg.style.filter = "";
            this.drawGrid();
            if (callback) callback();
        }, 1500);
    },

    cashoutFlash() {
        const board = UI.els.gameBoard;
        board.style.boxShadow = "0 0 80px rgba(22, 199, 132, 0.6), inset 0 0 30px rgba(22, 199, 132, 0.1)";
        setTimeout(() => {
            board.style.boxShadow = "";
        }, 600);
    }
};
