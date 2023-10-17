class Vector extends Array {
	constructor(x = 0, y = 0) {
		super(0);
		this.x = x;
		this.y = y;
	}
	set x(n) {
		n = new Number(n);
		if(isNaN(n)) return;
		this[0] = n;
		return this.x;
	}
	get x() {
		return this[0] || 0;
	}
	set y(n) {
		n = new Number(n);
		if(isNaN(n)) return;
		this[1] = n;
		return this.y;
	}
	get y() {
		return this[1] || 0;
	}
	get magSq() {
		return Math.pow(this.x, 2) + Math.pow(this.y, 2);
	}
	get mag() {
		return Math.sqrt(this.magSq);
	}
	get angle() {
		return Math.atan2(this.y, this.x);
	}
	clone() {
		return new Vector(this.x, this.y);
	}
	copy(n) {
		this.x = n.x;
		this.y = n.y;
		return this;
	}
	setup(x, y) {
		this.x = x;
		this.y = y;
	}
	dot(v) {
		return this.x * v.x + this.y * v.y;
	}
	cross(v) {
		return this.x * v.y - v.x * this.y;
	}
	add(x, y) {
		if (x instanceof Vector) return this.add(x.x, x.y);
		this.x = this.x + x;
		this.y = this.y + (y ? y : x);
		return this;
	}
	sub(x, y) {
		if (x instanceof Vector) return this.sub(x.x, x.y);
		this.x = this.x - x;
		this.y = this.y - (y ? y : x);
		return this;
	}
	mult(x, y) {
		if (x instanceof Vector) return this.mult(x.x, x.y);
		this.x = this.x * x;
		this.y = this.y * (y ? y : x);
		return this;
	}
	div(x, y) {
		if (x instanceof Vector) return this.div(x.x, x.y);
		x = x || 1;
		this.x = this.x * (1 / x);
		this.y = this.y * (1 / (y ? y : x));
		return this;
	}
	norm() {
		let l = this.mag;
		if (!l) return this;
		return this.mult(1/l, 1/l);
	}
	dist(v) {
		return this.clone().sub(v);
	}
	range(v) {
		return this.dist(v).mag;
	}
	limit(n) {
		let s = this.magSq;
		if (s > n * n) {
			this.scale(n);
		}
		return this;
	}
	scale(n) {
		return this.norm().mult(n);
	}
	heading(a) {
		let l = this.mag;
		this.x = l * Math.cos(a);
		this.y = l * Math.sin(a);
		return this;
	}
	rotate(a) {
		a += this.angle;
		return this.heading(a);
	}
	angle2(n) {
		return Math.atan2(this.cross(n), this.dot(n));
	}
	degree() {
		return (this.angle / (Math.PI * 2)) * 360;
	}
	lerp(v, r) {
		return this.add(v.clone().sub(this).mult(r, r));
	}
	project(f, o) {
		f = f.clone().norm();
		o = o ? o: new Vector(0, 0);
		return f.mult(this.clone().sub(o).dot(f)).add(o);
	}
	reject(f, o) {
		let p = this.project(f, o);
		return this.dist(p);
	}
	reflect(f, o) {
		let p = this.project(f, o);
		return p.add(p.clone().sub(this));
	}
	deflect(f, o) {
		f = f.clone().perpend();
		return this.reflect(f, o);
	}
	perpend() {
		let x = this.x;
		this.x = -this.y;
		this.y = x;
		return this;
	}
	inverse() {
		return this.mult(-1, -1);
	}
	transpose(min, max, tmin, tmax) {
		return this.dist(min).div(max.dist(min)).mult(tmax.dist(tmin)).add(tmin);
	}
	ceil() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	}
	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}
	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	}
	fix(n) {
		this.x = parseFloat(this.x.toFixed(n));
		this.y = parseFloat(this.y.toFixed(n));
		return this;
	}
	precision(n) {
		this.x = parseFloat(this.x.toPrecision(n));
		this.y = parseFloat(this.y.toPrecision(n));
		return this;
	}
	min() {
		return Math.min(this.x, this.y);
	}
	max() {
		return Math.max(this.x, this.y);
	}
	abs() {
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		return this;
	}
	print() {
		console.log(this);
		return this;
	}
	equal(n) {
		return (this.x == n.x && this.y == n.y);
	}
	toPolarCoord() {
		return new Vector(this.angle, this.mag);
	}
	curve(t, sx, sy, nx, ny) {
		nx = nx || 0;
		ny = ny || 0;
		this.x += (sx * t) + (nx * t);
		this.y += (sy * t) + (ny * t);
		return this;
	}
	calc(fn) {
		fn.apply(this, null);
		return this;
	}
	extrude(range, angle) {
		angle = angle || 0;
		return new Vector(range, 0).heading(angle).add(this);
	}
	static random() {
		return new Vector(1, 0).heading(Math.random() * (2*Math.PI));
	}
	static fromPolarCoord(a, r) {
		if (a instanceof Vector) {
			return Vector.fromPolarCoord(a.x, a.y);
		}
		return new Vector(r, 0).heading(a);
	}
}

export { Vector };