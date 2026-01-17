export class GameLoopManager {
    constructor(game) {
        this.game = game;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.targetFPS = 60;
        this.step = 1000 / this.targetFPS;
        this.frameId = null;

        // Bind the loop to preserve context
        this.loop = this.loop.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.frameId = requestAnimationFrame(this.loop);
        console.log("GameLoopManager: Started");
    }

    stop() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        console.log("GameLoopManager: Stopped");
    }

    pause() {
        this.isPaused = true;
        console.log("GameLoopManager: Paused");
    }

    resume() {
        this.isPaused = false;
        this.lastTime = performance.now(); // Reset time to avoid huge delta
        console.log("GameLoopManager: Resumed");
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;

        // FPS Throttling
        if (deltaTime >= this.step) {
            this.lastTime = timestamp - (deltaTime % this.step); // Adjust for drift
            
            if (!this.isPaused) {
                if (this.game.update) {
                    this.game.update(deltaTime);
                }
            }

            if (this.game.render) {
                this.game.render(deltaTime);
            }
        }

        this.frameId = requestAnimationFrame(this.loop);
    }
}
