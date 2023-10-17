import { Vector } from './vector.js';
import { Vertexs } from './vertexs.js';
import { Canvas, OffCanvas, ImageDataGetCoord, ImageDataSetContext, ImageDataUpdate } from './canvas.js';
import { Scene } from './scene.js';
import { Quadarea, Quadtree, Quadnode } from './quadtree.js';
import { Editor, Camera } from './panel-editor.js';
import { Mesh, Circle, Edges, Polygon, Polyline, VertexShape } from './mesh.js';

import { Socket } from './socket.js';

Number.prototype.toRad = function() {
	return (this * (2 * Math.PI)) / 360;
}
Number.prototype.toDegree = function() {
	return (this * 360) / (2 * Math.PI);
}

Array.prototype.toVector = function() {
	return new Vector(this[0], this[1]);
}
Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
}
Array.prototype.shuffle = function() {
	let pools = this.slice();
	let res = [];
	for (let i = 0; i < this.length; i++) {
		let n = Math.floor(Math.random() * pools.length);
		res.push(pools[n]);
		pools.splice(n, 1);
	}
	return res;
}


window.Vector = Vector;
window.Vertexs = Vertexs;
window.Canvas = Canvas;
window.OffCanvas = OffCanvas;
window.Scene = Scene;
window.Quadarea = Quadarea;
window.Quadnode = Quadnode;
window.quadtree = Quadtree;
window.Editor = Editor;
window.Camera = Camera;
window.Mesh = Mesh;
window.Circle = Circle;
window.Edges = Edges;
window.Polygon = Polygon;
window.Polyline = Polyline;
window.VertexShape = VertexShape;

window.Socket = Socket;

ImageData.prototype.update = ImageDataUpdate;
ImageData.prototype.setContext = ImageDataSetContext;
ImageData.prototype.getCoord = ImageDataGetCoord;