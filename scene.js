class Scene {
	constructor(task) {
		this.tasklist = [];
		this.cycle = null;
		this.running = false;
		this.error = false;
		this.clock = Date.now();
		this.timegap = 0;
		this.add(task);
		return this;
	}
	play() {
		if (!this.running) {
			this.running = true;
			this.run();
		}
		return this;
	}
	pause() {
		if (this.running) {
			this.running = false;
			window.cancelAnimationFrame(this.cycle);
		}
		return this;
	}
	run() {
		if (!this.running || this.error) return this;
		let clock = Date.now();
		this.timegap = clock - this.clock;
		this.clock = clock;
		this.cycle = requestAnimationFrame(this.run.bind(this));
		try {
			for (let task of this.tasklist) {
				task(this);
			}
		}catch(err) {
			this.error = true;
			console.error(err.stack);
			this.pause();
		}
		
		return this;
	}
	add(task) {
		if (!task || typeof task != "function") return this;
		this.tasklist.push(task);
		return this;
	}
	displayRenderingTime(c, p, f) {
		c.text(p, `${this.timegap}ms`, null, f);
	}
}

export { Scene };