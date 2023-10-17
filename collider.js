const Collider = {
	Config : {
		restitution : .6,
		scaleInertia : 8,
		calcOffset : true,
		calcImpact : true,
		calcInertia : true
	},
	Response() {
		return {
			a: {},
			b: {},
			collide: false
		}
	},
	CircleToCircle(a, b) {
		let conf = Collider.Config;
		let response = Collider.Response();
		let maxRadius = a.radius + b.radius;
		let delta = b.pos.dist(a.pos);
		let range = delta.mag();
		if (range < maxRadius) {
			response.collide = true;
			response.normal = delta.clone().norm();
			response.plane = response.normal.clone().perpend();
			let margin = (maxRadius - range);
			delta.scale(margin);
			response.offset = delta.inverse();
			if(conf.calcOffset) Collider.Offset(a, b, response);
			if(conf.calcImpact) Collider.Impact(a, b, response);
			if(conf.calcInertia) Collider.Inertia(a, b, response);
		}
		return response;
	},
	CircleToPolygon(a, b) {
		let conf = Collider.Config;
		let response = Collider.Response();
		let maxRadius = a.radius + b.radius;
		let delta = b.pos.dist(a.pos);
		let range = delta.mag();
		if (range >= maxRadius) return response;

		for (let edge of b.edges) {
			let alpha = a.pos.dist(edge.a);
			let proj = alpha.project(edge.axis);
			let sign = edge.axis.dot(proj);
			let beta = alpha.dist(proj);
			let theta = edge.plane.dot(beta);
			if (alpha.mag() < a.radius) {
				response.alpha = alpha;
			}
			if (beta.mag() < a.radius && theta > 0 && sign > 0 && proj.mag() < edge.radius) {
				response.offset = beta;
				response.collide = true;
				break;
			}
		}
		if (response.alpha && !response.collide) {
			response.beta = false;
			response.collide = true;
			response.offset = response.alpha.clone();
		}
		if (!response.collide) return response;
		response.normal = response.offset.clone().norm();
		response.plane = response.normal.clone().perpend();
		
		range = response.offset.mag();
		let margin = (a.radius - range);
		response.offset.scale(margin);
		
		if(conf.calcOffset) Collider.Offset(a, b, response);
		if(conf.calcImpact) Collider.Impact(a, b, response);
		if(conf.calcInertia) Collider.Inertia(a, b, response);
		return response;
	},
	PolygonToPolygon(a, b) {
		let conf = Collider.Config;
		let response = Collider.Response();
		let maxRadius = a.radius + b.radius;
		let delta = b.pos.dist(a.pos);
		let range = delta.mag();
		if (range >= maxRadius) return response;
		let _alpha, _beta,
		pools = [];
		for (let i = 0; i < b.sides; i++) {
			let alpha = {
				point: b.points[i],
				collide: true,
				valid: true
			};
			for (let j = 0; j < a.sides; j++) {
				if (alpha.valid) {
					alpha.edge = a.edges[j];
					alpha.dist = alpha.point.dist(alpha.edge.a);
					alpha.norm = alpha.edge.plane;
					alpha.proj = alpha.dist.project(alpha.norm);
					alpha.collide = alpha.norm.dot(alpha.proj) < 0;
					if (alpha.collide) {
						if (!alpha.offset) {
							alpha.offset = alpha.proj;
							alpha.min = alpha.offset.mag();
						} else {
							if (alpha.proj.mag() < alpha.min) {
								alpha.offset = alpha.proj;
								alpha.min = alpha.offset.mag();
							}
						}
					}else{
						alpha.valid = false;
					}
				}
				let beta = pools[j] || { collide: true, valid: true };
				pools[j] = beta;
				if (beta.valid) {
					beta.edge = b.edges[i];
					beta.point = a.points[j];
					beta.dist = beta.point.dist(beta.edge.a);
					beta.norm = beta.edge.plane;
					beta.proj = beta.dist.project(beta.norm);
					beta.collide = beta.norm.dot(beta.proj) < 0;
					if (beta.collide) {
						if (!beta.offset) {
							beta.offset = beta.proj.clone().inverse();
							beta.min = beta.offset.mag();
						} else {
							if (beta.proj.mag() < beta.min) {
								beta.offset = beta.proj.clone().inverse();
								beta.min = beta.offset.mag();
							}
						}
					}else{
						beta.valid = false;
					}
				}
				if(i == b.sides - 1) {
					if(beta.valid) {
						if(_beta) {
							_beta = _beta.min > beta.min ? _beta : beta;
						}else{
							_beta = beta;
						}
					}
				}
			}
			if(alpha.valid) {
				if(_alpha) {
					_alpha = _alpha.min > alpha.min ? _alpha : alpha;
				}else{
					_alpha = alpha;
				}
			}
		}
		
		if(!_alpha && !_beta) return response;
		let data = _alpha;
		if(_beta) data = data ? (data.min > _beta.min ? data : _beta) : _beta;
		
		response.collide = data.collide;
		response.offset = data.offset;
		response.normal = data.offset.clone().norm();
		response.plane = response.normal.clone().perpend();
		
		if(conf.calcOffset) Collider.Offset(a, b, response);
		if(conf.calcImpact) Collider.Impact(a, b, response);
		if(conf.calcInertia) Collider.Inertia(a, b, response);
		
		return response;
	},
	CircleToLine(a, b) {
		let response = Collider.Response();
		
		let beta = a.pos.dist(b.center).mag();
		let maxRadius = a.radius + b.radius;
		
		if(beta > maxRadius) return response;
		
		let delta = a.pos.dist(b.a);
		let axis = b.axis;
		
		let proj = delta.project(axis);
		let aim = axis.dot(proj);
		let radA = delta.mag();
		
		let alpha;
		if(aim > 0 && radA < b.radius) {
			alpha = delta.dist(proj);
		}else if(aim < 0) {
			alpha = delta;
		}else {
			let alpha = a.pos.dist(b.b);
		}
		if(!alpha || alpha.mag() >= a.radius) return response;
		response.collide = true;
		
		let margin = a.radius - alpha.mag();
		alpha.scale(margin);
		
		response.a.offset = alpha;
		
		let vel = a.vel.reflect(axis);
		response.a.impact = vel;
		
		response.a.inertia = alpha.angle2(vel) / a.radius;
		
		response.line = b;
		
		return response;
	},
	PolygonToLine(a, b) {
		let response = Collider.Response();
		
		let beta = a.pos.dist(b.center).mag();
		let maxRadius = a.radius + b.radius;
		
		if(beta > maxRadius) return response;
		
		let axis = b.axis;
		let delta = a.pos.dist(b.a);
		let norm = b.plane;
		let align = delta.project(norm);
		
		let alpha;
		for(let point of a.points) {
			let vertex = point.dist(b.a);
			let proj = vertex.project(norm);
			let aim = align.dot(proj);
			if(aim > 0) continue;
			response.collide = true;
			alpha = proj.inverse();
			break;
		}
		if(!alpha) return response;
		
		response.line = b;
		response.a.offset = alpha;
		
		let vel = a.vel.reflect(axis);
		
		let vt = vel.project(axis);
		let vn = vel.project(b.plane);
		vel = vn.mult(Collider.Config.restitution).add(vt);
		
		response.a.impact = vel;
		
		response.a.inertia = alpha.angle2(vel) / a.radius;
		
		return response;
	},
	VelComp(v, n) {
		let t = n.clone().perpend();
		return {
			vn : v.project(n),
			vt : v.project(t)
		}
	},
	Vel2Ang(v, n, r) {
		let arclen = Math.PI * 2 * r;
		
		let Vproj = v.project(n);
		let sign = n.dot(Vproj) > 0 ? 1 : -1;
		let Vang = (Vproj.mag() / arclen) * (2 * Math.PI) * sign;
		
		return Vang;
	},
	Offset(a, b, r) {
		let af = a.constraint.pos ? 0 : 1;
		let bf = b.constraint.pos ? 0 : 1;
		
		let Tmass = (a.mass * af) + (b.mass * bf);
		
		let m = r.offset.mag();
		r.a.offset = r.offset.clone().scale((m * b.mass) / Tmass);
		r.b.offset = r.offset.clone().inverse().scale((m * a.mass) / Tmass);
	},
	Impact(a, b, r) {
		let Tvel  = {
			a : a.vel.project(r.plane),
			b : b.vel.project(r.plane)
		}
		let Nvel  = {
			a : a.vel.project(r.normal),
			b : b.vel.project(r.normal)
		}
		let e = Collider.Config.restitution;
		let c1 = Nvel.a.clone().mult(a.mass).add(Nvel.b.clone().mult(b.mass));
		let c2 = Nvel.a.clone().sub(Nvel.b).mult(e);
		let _av = c1.clone().div(a.mass).sub(c2).div(2);
		let _bv = c2.clone().add(_av);
		
		// _av = (((av * am + bv * bm) / a.mass) - (e * av - bv)) / 2;
		// _bv = (e * av - bv) + _av;
		
		r.a.impact = _av.add(Tvel.a);
		r.b.impact = _bv.add(Tvel.b);
	},
	Inertia(a, b, r) {
		let ua = Collider.Config.scaleInertia;
		/*
		let ap = b.pos.dist(a.pos);
		let bp = ap.clone().inverse();
		
		let av = b.pos.clone().add(r.b.impact).dist(a.pos);
		let bv = a.pos.clone().add(r.a.impact).dist(b.pos);
		
		let ad = ap.angle2(av);
		let bd = bp.angle2(bv);
		
		r.a.inertia = (ad / a.radius) * ua;
		r.b.inertia = (bd / b.radius) * ua;
		*/
		
		let ap = b.pos.dist(a.pos);
		let bp = a.pos.dist(b.pos);
		
		let av = b.pos.clone().add(r.b.impact).dist(a.pos);
		let bv = a.pos.clone().add(r.a.impact).dist(b.pos);
		
		r.a.inertia = ((ap.angle2(av)) / a.radius) * ua;
		r.b.inertia = ((bp.angle2(bv)) / b.radius) * ua;
	}
}

export { Collider };