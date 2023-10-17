class Quadarea {
	constructor(min, size) {
		this.min = min;
		this.size = size instanceof Vector ? size : new Vector(size, size);
		this.max = this.min.clone().add(this.size);
		return this;
	}
	cover(p) {
		return !(p.x < this.min.x || p.y < this.min.y ||
			p.x >= this.max.x || p.y >= this.max.y);
	}
	overlap(n) {
		if (!(n instanceof Quadarea)) return;
		return !(this.max.x < n.min.x ||
			this.min.x > n.max.x ||
			this.min.y > n.max.y ||
			this.max.y < n.min.y);
	}
	render(c) {
		c.begin().rect(this.min, this.size.x, this.size.y);
		c.close().stroke(0, 0, 0, 0.2);
		return this;
	}
	get center() {
		return this.size.clone().mult(.5).add(this.min);
	}
}
class Quadtree extends Quadarea {
	constructor(min, size, capacity) {
		super(min, size);
		this.capacity = capacity || 10;
		this.nodes = {};
		this.amount = 0;
		this.sections = [];
		this.base = null;
		this.tree = this;
		return this;
	}
	insert(pos, size, entity) {
		let qnode = new Quadnode(pos, size, entity);
		return this.add(qnode);
	}
	add(qnode) {
		if(!(qnode instanceof Quadnode)) return false;
		if (!this.cover(qnode.pos)) return false;
		if (this.amount < this.capacity) {
			if (qnode.base) {
				qnode.base.remove(qnode);
			}
			this.nodes[qnode.id] = qnode;
			qnode.base = this;
			qnode.tree = this.tree;
			this.amount++;
			return true;
		} else {
			this.divide(2, 2);
			for (let section of this.sections) {
				if(section.add(qnode)) return true;
			}
		}
		return false;
	}
	remove(qnode) {
		if (!this.nodes[qnode.id]) return qnode;
		delete this.nodes[qnode.id];
		qnode.base = null;
		this.amount--;
		return qnode;
	}
	release(qnode) {
		this.remove(qnode);
		qnode.tree = null;
		return qnode;
	}
	divide(c, r) {
		if (this.sections.length) return false;
		let ori = this.min;
		let dims = new Vector(c || 2, r || 2);
		let size = this.size.clone().div(dims);
		let cp = this.capacity;
		for (let y = 0; y < dims.y; y++) {
			for (var x = 0; x < dims.x; x++) {
				let pos = new Vector(x, y).mult(size).add(ori);
				let qtree = new Quadtree(pos, size, cp);
				this.sections.push(qtree);
				qtree.base = this;
				qtree.tree = this.tree;
			}
		}
		return true;
	}
	query(area, fn, arr) {
		arr = arr || [];
		if (!(area instanceof Quadarea)) return arr;
		if (!this.overlap(area)) return arr;
		for (let id in this.nodes) {
			if (this.nodes.hasOwnProperty(id)) {
				let qnode = this.nodes[id];
				if(arr.indexOf(qnode.entity) >= 0) continue;
				if (!area.overlap(qnode)) continue;
				if (fn) fn(qnode, arr, this);
				arr.push(qnode.entity);
			}
		}
		let c = 0;
		for (let section of this.sections) {
			c += section.amount;
			if (!section.overlap(area)) continue;
			section.query(area, fn, arr);
		}
		if (!c) this.sections = [];
		return arr;
	}
	draft() {
		return this.query(this);
	}
}
class Quadnode extends Quadarea {
	constructor(pos, size, entity) {
		super(pos.clone().sub(size.clone().mult(.5)), size);
		this.pos = pos;
		this.entity = entity;
		this.id = `Node_${Math.floor(Math.random() * 99999)}`;
		this.base = null;
		this.tree = null;
		this.entity.qnode = this;
		return this;
	}
	destroy() {
		this.base.release(this);
		this.release();
	}
	release() {
		delete this.entity.qnode;
		return this;
	}
	calc() {
		let half = this.size.clone().mult(.5);
		this.min.copy(this.pos.clone().sub(half));
		this.max.copy(this.pos.clone().add(half));
		return this;
	}
	update() {
		this.calc();
		return this.tree.add(this);
	}
}

export { Quadarea, Quadtree, Quadnode };