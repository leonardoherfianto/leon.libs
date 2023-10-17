class Mesh {
	constructor(pos, col) {
		this.pos = pos;
		this.vel = new Vector();
		this.speed = 0;
		this.force = 0;
		this.spin = 0;
		this.acc = new Vector();
		this.rotation = 0;
		this.theta = 0;
		this.angle = 0;
		this.damp = .98;
		this.minunit = .001;
		this.maxforce = .2;
		this.maxspeed = 0;
		this.forceDamp = 0;
		
		this.constraint = {
			pos : false,
			force : false,
			angle : false
		};
		
		this.color = col || 'rgb(60, 200, 160)';
		this.shape = new Path2D();
		this.matrix = Mesh.CreateMatrix();
	}
	applyForce(f) {
		this.acc.add(f);
		this.force = this.acc.mag;
	}
	collideResponse(r) {
		if(!this.constraint.pos) this.pos.add(r.offset);
		if(!this.constraint.force) this.vel.copy(r.impact);
		if(!this.constraint.angle) this.rotation = isNaN(r.inertia) ? this.rotation : r.inertia;
	}
	move() {
		this.speed = this.vel.mag;
		this.spin = Math.abs(this.theta);
		if(!this.constraint.force || this.speed || this.force) {
			if(this.maxforce) this.acc.limit(this.maxforce);
			this.vel.add(this.acc);
			if(this.maxspeed) this.vel.limit(this.maxspeed);
			if(!this.constraint.pos) this.pos.add(this.vel);
			if(!this.speed && this.force) this.speed = this.vel.mag;
			this.vel.mult(this.speed > this.minunit ? this.damp : 0);
			this.acc.mult(this.forceDamp);
		}
		if(!this.constraint.angle || this.spin) {
			this.theta = this.rotation;
			this.angle += this.theta;
			this.rotation *= Math.abs(this.rotation) > this.minunit ? this.damp : 0;
		}
	}
	static CreateMatrix() {
		return document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	}
	static VertexShape(origin, vertexs) {
		
	}
}

class Circle extends Mesh {
	constructor(pos, rad, col) {
		super(pos, col);
		this.radius = rad;
		this.mass = this.radius * .1;
		
		this.shape.arc(0, 0, this.radius, 0, 2 * Math.PI);
		this.pointer = new Path2D();
		this.pointer.moveTo(0, 0);
		this.pointer.lineTo(this.radius, 0);
		this.pointer.closePath();
	}
	collide(o) {
		let res;
		if (o instanceof Circle) {
			res = Collider.CircleToCircle(this, o);
		}else if (o instanceof Polygon || o instanceof Polyline) {
			res = Collider.CircleToPolygon(this, o);
		}

		if (res && res.collide) {
			this.collideResponse(res.a);
			o.collideResponse(res.b);
		}
		return res.collide;
	}
	update() {
		this.move();
	}
	render(c) {
		let shape = new Path2D();
		let pointerR = new Path2D();
		let pointer = new Path2D();
		let offset = this.matrix.translate(this.pos.x, this.pos.y);
		let rotate = this.matrix.rotate((this.angle / _2PI) * 360);
		
		shape.addPath(this.shape, offset);
		pointerR.addPath(this.pointer, rotate);
		pointer.addPath(pointerR, offset);

		c.fillStyle = this.color;
		c.strokeStyle = 'rgba(0, 0, 0, .5)';

		c.fill(shape);
		c.stroke(shape);
		c.stroke(pointer);
	}
	recalc() {}
}
class Edges {
	constructor(a, b) {
		this.a = a;
		this.b = b;
		this.radius = this.delta.mag;
	}
	createShape() {
		let d = this.delta;
		this.shape = new Path2D();
		this.shape.arc(0, 0, 2, 0, _2PI);
		this.shape.arc(d.x, d.y, 2, 0, _2PI);
		this.shape.moveTo(0, 0);
		this.shape.lineTo(d.x, d.y);
		//this.shape.closePath();
		this.matrix = Mesh.CreateMatrix();
		if(!this.color) this.color = `hsl(${Math.random() * 360}deg, 100%, 50%)`;
	}
	get delta() {
		return this.b.dist(this.a);
	}
	get axis() {
		return this.delta.norm();
	}
	get plane() {
		return this.delta.perpend().inverse().norm();
	}
	get center() {
		return this.b.clone().add(this.a).mult(.5);
	}
	get angle() {
		return this.delta.angle;
	}
	render(c) {
		if(!this.shape) this.createShape();
		let offset = this.matrix.translate(this.a.x, this.a.y);
		let shape = new Path2D();
		shape.addPath(this.shape, offset);
		c.strokeStyle = this.color;
		c.stroke(shape);
	}
}
class Polygon extends Mesh {
	constructor(pos, sides, radius, col) {
		super(pos, col);
		
		this.sides = sides;
		this.radius = radius;
		this.mass = this.radius * .1;

		this.vertexs = [];
		this.points = [];
		this.edges = [];
		
		let inc = _2PI / this.sides;
		let ang = Math.random() * _2PI;

		for (let i = 0; i < this.sides + 1; i++) {
			if (i < this.sides) {
				let v = new Vector(this.radius, 0).heading((i * inc) + ang);
				this.vertexs.push(v);
				let pt = v.clone().add(this.pos);
				this.points.push(pt);
				if(!i) {
					this.shape.moveTo(v.x, v.y);
				}else{
					this.shape.lineTo(v.x, v.y);
				}
			}
			if (i) {
				let a = this.points[i - 1];
				let b = this.points[(i % this.sides)];
				this.edges.push(new Edges(a, b));
			}
		}
		this.shape.closePath();
	}
	collide(o) {
		let res;
		if (o instanceof Circle) {
			res = Collider.CircleToPolygon(o, this);
		}else if (o instanceof Polygon || o instanceof Polyline) {
			res = Collider.PolygonToPolygon(o, this);
		}

		if (res && res.collide) {
			this.collideResponse(res.b);
			o.collideResponse(res.a);
		}
		return res.collide;
	}
	recalc() {
		this.transform(true);
	}
	transform(f) {
		if(!this.spin && !this.speed && this.constraint.pos && !f) return;
		for (let i = 0; i < this.sides; i++) {
			this.vertexs[i].rotate(this.theta);
			let pt = this.vertexs[i].clone().add(this.pos);
			this.points[i].copy(pt);
		}
	}
	update() {
		this.move();
		this.transform();
	}
	render(c) {
		let shape = new Path2D();
		let shapeR = new Path2D();
		
		let offset = this.matrix.translate(this.pos.x, this.pos.y);
		let rotate = this.matrix.rotate((this.angle / _2PI) * 360);
		
		shapeR.addPath(this.shape, rotate);
		shape.addPath(shapeR, offset);

		c.fillStyle = this.color;
		c.strokeStyle = 'rgba(0, 0, 0, .5)';

		c.fill(shape);
		c.stroke(shape);
	}
}
class Polyline extends Mesh {
	constructor(points, col) {
		super(new Vector(), col);
		
		this.points = points;
		this.vertexs = [];
		this.edges = [];
		this.sides = this.points.length;
		this.points.map((n)=>(this.pos.add(n)));
		this.pos.div(this.sides);
		
		let m = 0;
		for (let i = 0; i < this.sides; i++) {
			let v = this.points[i].dist(this.pos);
			this.vertexs[i] = v;
			if(i) {
				let a = this.points[i - 1];
				let b = this.points[(i % this.sides)];
				this.edges.push(new Edges(a, b));
				
				this.shape.lineTo(v.x, v.y);
			}else{
				this.shape.moveTo(v.x, v.y);
			}
			m = Math.max(m, v.mag);
		}
		this.shape.closePath();
		this.radius = m;
		this.mass = this.radius * .1;
	}
	collide(o) {
		let res;
		if (o instanceof Circle) {
			res = Collider.CircleToPolygon(o, this);
		}else if (o instanceof Polygon || o instanceof Polyline) {
			res = Collider.PolygonToPolygon(o, this);
		}

		if (res && res.collide) {
			this.collideResponse(res.b);
			o.collideResponse(res.a);
		}
		return res.collide;
	}
	recalc() {
		this.transform(true);
	}
	transform(f) {
		if(!Math.abs(this.theta) && !this.speed && !this.constraint.pos && !f) return;
		for (let i = 0; i < this.sides; i++) {
			this.vertexs[i].rotate(this.theta);
			let pt = this.vertexs[i].clone().add(this.pos);
			this.points[i].copy(pt);
		}
	}
	update() {
		this.move();
		this.transform();
	}
	render(c) {
		let shape = new Path2D();
		let shapeR = new Path2D();
		
		let offset = this.matrix.translate(this.pos.x, this.pos.y);
		let rotate = this.matrix.rotate((this.angle / _2PI) * 360);
		
		shapeR.addPath(this.shape, rotate);
		shape.addPath(shapeR, offset);

		c.fillStyle = this.color;
		c.strokeStyle = 'rgba(0, 0, 0, .5)';

		c.fill(shape);
		c.stroke(shape);
	}
}
class VertexShape extends Polyline {
	constructor(vertexs, origin, col) {
		super([], col);
		this.pos = origin;
		this.vertexs = vertexs;
		this.sides = vertexs.length;
		
		let m = 0;
		for (let i = 0; i < this.sides; i++) {
			let v = this.vertexs[i];
			let point = v.clone().add(this.pos);
			this.points[i] = point;
			if(i) {
				let a = this.points[i - 1];
				let b = this.points[(i % this.sides)];
				this.edges.push(new Edges(a, b));
				
				this.shape.lineTo(v.x, v.y);
			}else{
				this.shape.moveTo(v.x, v.y);
			}
			m = Math.max(m, v.mag());
		}
		this.shape.closePath();
		this.radius = m;
		this.mass = this.radius * .1;
	}
}

const _2PI = 2 * Math.PI;

export { Mesh, Circle, Edges, Polygon, Polyline, VertexShape }