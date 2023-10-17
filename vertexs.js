class Vertexs extends Array {
		constructor(n) {
		super(0);
		n = Array.from(arguments) || [];
		for (let p of n) {
			if (p instanceof Vector) this.push(p);
		}
		return this;
	}
	clone() {
		let a = new Vertexs();
		this.map((v)=> {
			a.push(v.clone());
		});
		return a;
	}
	centeroid() {
		return this.reduce((t, n)=> {
			return t.add(n);
		}, new Vector()).div(this.length, this.length);
	}
	sortAsc(o) {
		o = o || new Vector();
		return this.sort(function(a, b) {
			return a.dist(o).mag() - b.dist(o).mag();
		});
	}
	sortDesc(o) {
		o = o || new Vector();
		this.sort(function(a, b) {
			return b.dist(o).mag() - a.dist(o).mag();
		});
		return this;
	}
	sortAngle(o) {
		o = o || this.centeroid();
		this.sort((a, b)=> {
			return b.dist(o).angle() - a.dist(o).angle();
		});
		return this;
	}
	convexhull() {
		let g = this.clone().sortAsc();
		let f = new Vertexs();
		let a = g[0];
		for (var i = 0; i < g.length; i++) {
			let b = g[i];
			if (a === b) continue;
			let ab = b.clone().sub(a);
			for (var j = 0; j < g.length; j++) {
				let c = g[j];
				if (c == a || c == a) continue;
				let ac = c.clone().sub(a);
				if (ab.cross(ac) < 0) {
					b = c;
					ab = b.clone().sub(a);
					continue;
				}
			}
			f.push(a);
			if (b === f[0]) break;
			a = b;
		}
		return f;
	}
	circumcenter() {
		if (this.length < 3) return;
		let p = [];
		for (let i = 0; i < 2; i++) {
			let a = this[i].clone().add(this[i+1]).mult(0.5, 0.5);
			let b = this[i+1].dist(this[i]).perpend().add(a);
			p.push(a, b);
		}
		let o = Vector.intersection(p[0], p[1], p[2], p[3]);
		let r = this[0].range(o);
		return {
			center: o,
			radius: r,
			points: p
		}
	}
	triangulation() {
		if (this.length < 3) return [];
		let q = [],
		n = {};
		for (let i = 0; i < this.length; i++) {
			let a = this[i];
			for (let j = 0; j < this.length; j++) {
				if (i == j) continue;
				let b = this[j];
				for (let k = 0; k < this.length; k++) {
					if (k == i || k == j) continue;
					let x = `${i}_${j}_${k}`;
					if (n[x]) continue;
					n[x] = true;
					let c = this[k];
					let t = new Vertexs(a, b, c);
					let u = t.circumcenter();
					for (let l = 0; l < this.length; l++) {
						if (l == i || l == j || l == k) continue;
						let d = this[l];
						let r = d.range(u.center);
						if (r <= u.radius) {
							t = null;
							break;
						}
					}
					if (!t) continue;
					q.push(t);
				}
			}
		}
		return q;
	}
	delaunay() {
		if (this.length < 3) return [];
		let q = [],
		n = {},
		o = this;
		for (let i = 0; i < this.length; i++) {
			let a = this[i];
			for (let j = 0; j < this.length; j++) {
				if (i == j) continue;
				let b = this[j];
				for (let k = 0; k < this.length; k++) {
					if (k == i || k == j) continue;
					let x = `${i}_${j}_${k}`;
					if (n[x]) continue;
					n[x] = true;
					let c = this[k];
					let t = new Vertexs(a, b, c);
					let u = t.circumcenter();
					for (let l = 0; l < this.length; l++) {
						if (l == i || l == j || l == k) continue;
						let d = this[l];
						let r = d.range(u.center);
						if (r <= u.radius) {
							t = null;
							break;
						}
					}
					if (!t) continue;
					t.map((v)=> {
						let s = o.indexOf(v);
						if (!q[s]) q[s] = new Vertexs();
						q[s].push(u.center);
					});
				}
			}
		}
		q = q.filter((arr)=> {
			if (!arr || arr.length < 3) return false;
			arr.sortAngle();
			return true;
		});
		return q;
	}
	curvature(s) {
		if (this.length !== 3) return [];
		let ab = this[1].dist(this[0]).div(s);
		let bc = this[2].dist(this[1]).div(s);

		let n;
		let r = new Vertexs(this[0]);
		for (let i = 0; i < s; i++) {
			let l1 = ab.clone().mult(i).add(this[0]);
			let l2 = bc.clone().mult(i + 1).add(this[1]);
			if (n) {
				let p = new Vertexs(n[0], n[1], l1, l2).intersection();
				r.push(p);
			}
			n = [l1,
				l2];
		}
		r.push(this[2]);
		return r;
	}
	intersection() {
		if (this.length !== 4) return null;
		let ab = this[0].clone().sub(this[1]);
		let cd = this[2].clone().sub(this[3]);
		let den = ab.cross(cd);
		if (den == 0) return;
		let ac = this[0].clone().sub(this[2]);
		let t = ac.cross(cd) / den;
		return ab.inverse().mult(t, t).add(this[0]);
	}
	lineIntersection() {
		if (this.length !== 4) return null;
		let ab = this[0].clone().sub(this[1]);
		let cd = this[2].clone().sub(this[3]);
		let den = ab.cross(cd);
		if (den == 0) return;
		let ac = this[0].clone().sub(this[2]);
		let t = ac.cross(cd) / den;
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return this[1].clone().sub(this[0]).mult(t, t).add(this[0]);
		}
		return null;
	}
	rayIntersection() {
		if (this.length !== 4) return null;
		let ab = this[0].clone().sub(this[1]);
		let cd = this[2].clone().sub(this[3]);
		let den = ab.cross(cd);
		if (den == 0) return;
		let ac = this[0].clone().sub(this[2]);
		let t = ac.cross(cd) / den;
		if (t > 0 && (u >= 0 && u <= 1)) {
			return this[1].clone().sub(this[0]).mult(t, t).add(this[0]);
		}
		return null;
	}
}

export { Vertexs }