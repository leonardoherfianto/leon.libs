class Canvas {
	constructor(w, h, p, o, s) {
		if (!s) {
			this.e = document.createElement("CANVAS");
			this.c = null;
			w = w ? w: p ? p.clientWidth: null;
			h = h ? h: p ? p.clientHeight: null;
			this.resize(w, h);
			p = p instanceof HTMLElement ? p: document.body;
			if (!o) p.appendChild(this.e);
		}
		this.colorMode = "rgb";
		return this;
	}
	get size() {
		return new Vector(this.e.width, this.e.height);
	}
	get center() {
		return this.size.mult(0.5);
	}
	resize(w, h) {
		this.e.width = w || window.innerWidth;
		this.e.height = h || window.innerHeight;
		this.c = this.e.getContext("2d");
		return this;
	}
	fullscreen() {
		return this.resize(innerWidth, innerHeight);
	}
	rgba(r, g, b, a) {
		if (Array.isArray(r)) {
			return this.rgba.apply(r, this);
		}
		r = isNaN(r) ? 0: Math.min(Math.abs(r), 255);
		g = isNaN(g) ? r: Math.min(Math.abs(g), 255);
		b = isNaN(b) ? g: Math.min(Math.abs(b), 255);
		a = isNaN(a) ? 1: Math.min(Math.abs(a), 1);
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}
	hsla(r, g, b, a) {
		if (Array.isArray(r)) {
			return this.hsla.apply(r, this);
		}
		r = isNaN(r) ? 0: Math.min(Math.abs(r), 360);
		g = isNaN(g) ? 50: Math.min(Math.abs(g), 100);
		b = isNaN(b) ? g: Math.min(Math.abs(b), 100);
		a = isNaN(a) ? 1: Math.min(Math.abs(a), 1);
		return `hsla(${r}, ${g}, ${b}, ${a})`;
	}
	linearGradient(s, e, c) {
		let g = this.c.createLinearGradient(s.x, s.y, e.x, e.y);
		if (!c) return g;
		let n = Math.max(c.length, 2);
		let d = 1 / (n-1);
		let q = 0;
		for (let i = 0; i < n; i++) {
			g.addColorStop(q, this.initColor(c[i % c.length]));
			q += d;
		}
		return g;
	}
	radialGradient(s, e, r, c) {
		let g = this.c.createRadialGradient(s.x, s.y, r[0], e.x, e.y, r[1]);
		if (!c) return g;
		let n = Math.max(c.length, 2);
		let d = 1 / (n-1);
		let q = 0;
		for (let i = 0; i < n; i++) {
			g.addColorStop(q, this.initColor(c[i % c.length]));
			q += d;
		}
		return g;
	}
	pattern(i, t) {
		return this.c.createPattern(i, t);
	}
	get fillStyle() {
		return this.c.fillStyle;
	}
	set fillStyle(c) {
		this.c.fillStyle = c;
		return this.fillStyle;
	}
	get strokeStyle() {
		return this.c.strokeStyle;
	}
	set strokeStyle(c) {
		this.c.strokeStyle = c;
		return this.strokeStyle;
	}
	initColor(r, g, b, a) {
		if(r instanceof Path2D) return r;
		if(r instanceof CanvasGradient) return r;
		if (typeof r == "string") return r;
		if (Array.isArray(r)) return this.initColor(r[0], r[1], r[2], r[3]);
		if (this.colorMode === "rgb") return this.rgba(r, g, b, a);
		return this.hsla(r, g, b, a);
	}
	save() {
		this.c.save();
		return this;
	}
	restore() {
		this.c.restore();
		return this;
	}
	fill(r, g, b, a) {
		if(r instanceof Path2D) {
			this.c.fill(r);
		}else {
			this.c.fillStyle = this.initColor(r, g, b, a);
			this.c.fill();
		}
		return this;
	}
	stroke(r, g, b, a) {
		if(r instanceof Path2D) {
			this.c.stroke(r);
		}else {
			this.c.strokeStyle = this.initColor(r, g, b, a);
			this.c.stroke();
		}
		return this;
	}
	lineStyle(w, c, j, l) {
		if (isNaN(w) == false) {
			this.c.lineWidth = w;
		}
		if (c) this.c.lineCap = c;
		if (j) this.c.lineJoin = j;
		if (l) this.c.miterLimit = l;
		return this;
	}
	clear(s, e) {
		s = s || new Vector(0, 0);
		e = e || new Vector(this.e.width, this.e.height);
		this.c.clearRect(s.x, s.y, e.x, e.y);
		return this;
	}
	begin() {
		this.c.beginPath();
		return this;
	}
	close() {
		this.c.closePath();
		return this;
	}
	move(x, y) {
		if (x instanceof Vector) return this.move(x.x, x.y);
		this.c.moveTo(x, y);
		return this;
	}
	line(x, y) {
		if (x instanceof Vector) return this.line(x.x, x.y);
		this.c.lineTo(x, y);
		return this;
	}
	curve(c, e) {
		this.c.qudraticCurveTo(c.x, c.y, e.x, e.y);
		return this;
	}
	bezier(c, c2, e) {
		this.c.bezierCurveTo(c.x, c.y, c2.x, c2.y, e.x, e.y);
		return this;
	}
	rounded(t1, t2, r) {
		this.c.arcTo(t1.x, t1.y, t2.x, t2.y, r);
		return this;
	}
	tile(p, s = 1, c) {
		this.begin().rect(p, s, s).close().fill(c);
	}
	rect(s, w, h) {
		w = w instanceof Vector ? w: new Vector(w, isNaN(h) ? w: h);
		this.c.rect(s.x, s.y, w.x, w.y);
		return this;
	}
	arc(c, r, a1, a2, d, t) {
		a1 = a1 * (2*Math.PI) || 0;
		a2 = a2 * (2*Math.PI) || (2 * Math.PI);
		if (t) {
			this.moveTo(c.x, c.y);
		}
		this.c.arc(c.x, c.y, r || 0, a1, a2, d || false);
		return this;
	}
	ellipse(p, r, a, a1, a2, d, t) {
		a1 = a1 * (2*Math.PI) || 0;
		a2 = a2 * (2*Math.PI) || (2 * Math.PI);
		if (t) {
			this.moveTo(p.x, p.y);
		}
		this.c.ellipse(p.x, p.y, r.x, r.y, a, a1, a2, d || false);
		return this
	}
	polygon(p, r, s) {
		let a = (2*Math.PI) / s;
		let v = new Vector(r, 0);
		this.begin();
		for (let i = 0; i < s; i++) {
			let t = v.clone().heading(a * i).add(p);
			if (i) {
				this.line(t.x, t.y);
			} else {
				this.move(t.x, t.y);
			}
		}
		this.close();
		return this;
	}
	path(v) {
		for (let i = 0; i < v.length; i++) {
			let t = v[i];
			if (i) {
				this.line(t.x, t.y);
			} else {
				this.move(t.x, t.y);
			}
		}
		return this;
	}
	scale(x, y) {
		this.c.scale(x, y || x);
		return this;
	}
	rotate(a) {
		this.c.rotate(a);
		return this;
	}
	translate(x, y) {
		this.c.translate(x, y);
		return this;
	}
	transform(a, b, c, d, e, f) {
		this.c.transform(a, b, c, d, e, f);
		return this;
	}
	setTransform(a, b, c, d, e, f) {
		this.c.setTransform(a, b, c, d, e, f);
		return this;
	}
	font(v) {
		if (v) this.c.font = v;
		return this;
	}
	fontStyle(a, j) {
		if (a) this.c.textAlign = a;
		if (j) this.c.textBaseline = j;
		return this;
	}
	text(p, v, f, c, s) {
		this.font(f);
		if (s) {
			this.strokeStyle = this.initColor(c);
			this.c.strokeText(v, p.x, p.y);
		} else {
			this.fillStyle = this.initColor(c);
			this.c.fillText(v, p.x, p.y);
		}
		return this;
	}
	measureText(t) {
		return this.c.measureText(t);
	}
	draw(i, c, s, p, r) {
		i = i instanceof Canvas ? i.e : i;
		c = c || new Vector();
		s = s || new Vector(i.width, i.height);
		p = p || c;
		r = r || new Vector(this.e.width, this.e.height);
		this.c.drawImage(i, c.x, c.y, s.x, s.y, p.x, p.y, r.x, r.y);
		return this;
	}
	putImage(i, sx, sy, cx, cy, rx, ry) {
		this.c.putImageData.apply(this.c, arguments);
		return this;
	}
	getImage(c, s) {
		c = c || new Vector();
		s = s || this.size;
		return this.c.getImageData(c.x, c.y, s.x, s.y);
	}
	createPixelData(w, h) {
		w = w || this.e.width;
		h = h || this.e.height;
		let p = this.c.createImageData(w, h);
		p.context = this;
		return p;
	}
	capture(type, quality) {
		let img = new Image(this.e.width, this.e.height);
		let data = this.toDataURL(type, quality);
		img.src = data;
		return img;
	}
	saveImage(type, quality) {
		let url = this.toDataURL(type, quality);
		let a = document.createElement('a');
		a.download = `image${type.replace(/\w*\//, '.')}`;
		a.href = url;
		a.click();
		return this;
	}
	toDataURL(type, quality) {
		return this.e.toDataURL(type, quality || 1);
	}
	alpha(v) {
		this.c.globalAlpha = v;
		return this;
	}
	composite(v) {
		v = v.length ? v: "source-over";
		this.c.globalCompositeOperation = v;
		return this;
	}
	fillScreen(r, g, b, a) {
		let s = this.size;
		this.begin().rect(new Vector(), s.x, s.y).close().fill(r, g, b, a);
		return this;
	}
	Path2D(v) {
		return new Path2D(v);
	}
	SVGMatrix() {
		return document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	}
	static RGB2HSL(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		const l = Math.max(r, g, b);
		const s = l - Math.min(r, g, b);
		const h = s
		? l === r
		? (g - b) / s: l === g
		? 2 + (b - r) / s: 4 + (r - g) / s: 0;
		return [
			60 * h < 0 ? 60 * h + 360: 60 * h,
			100 * (s ? (l <= 0.5 ? s / (2 * l - s): s / (2 - (2 * l - s))): 0),
			(100 * (2 * l - s)) / 2,
		];
	}
	static HSL2RGB(h, s, l) {
		s /= 100;
		l /= 100;
		const k = n => (n + h / 30) % 12;
		const a = s * Math.min(l, 1 - l);
		const f = n =>
		l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
		return [255 * f(0),
			255 * f(8),
			255 * f(4)];
	}
	static RGB2HEX(r, g, b) {
		return '#' + ((r << 16) + (g << 8) + b).toString().padStart(6, '0');
	}
	static HEX2RGB(hex) {
		let alpha = false,
		h = hex.slice(hex.startsWith('#') ? 1: 0);
		if (h.length === 3) h = [...h].map(x => x + x).join('');
		else if (h.length === 8) alpha = true;
		h = parseInt(h, 16);
		return (
			'rgb' +
			(alpha ? 'a': '') +
			'(' +
			(h >>> (alpha ? 24: 16)) +
			', ' +
			((h & (alpha ? 0x00ff0000: 0x00ff00)) >>> (alpha ? 16: 8)) +
			', ' +
			((h & (alpha ? 0x0000ff00: 0x0000ff)) >>> (alpha ? 8: 0)) +
			(alpha ? `, ${h & 0x000000ff}`: '') +
			')'
		);
	}
}

class OffCanvas extends Canvas {
	constructor(w, h) {
		super(null, null, null, null, true);
		this.c = new OffscreenCanvas(w, h);
		return this;
	}
}

const ImageDataGetCoord = function(i) {
	let y = Math.floor(i / (this.width * 4));
	let x = (i - (y * this.width * 4)) / 4;
	return new Vector(x, y);
}
const ImageDataUpdate = function() {
	if(!this.context) return;
	this.context.putImage(this, 0, 0);
}
const ImageDataSetContext = function(c) {
	this.context = c;
}

export { Canvas, OffCanvas, ImageDataGetCoord, ImageDataSetContext, ImageDataUpdate }