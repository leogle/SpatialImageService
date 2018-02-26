/**
 * Created by lrh on 2017-11-30.
 */
const Canvas = require('canvas');

function RenderService() {


    this.paintLidar = function (data) {
        var Painter = require('../painter/lidar-painter');
        painter = new Painter();
        var size = [600,600];
        var canvas = new Canvas(size[0],size[1]);

        var _paleCanvas = new Canvas(1,256);
        var ctx = _paleCanvas.getContext("2d");
        var grad = ctx.createLinearGradient(0, 0, 1, 256);
        var gradient = {
            0: '#000000',
            0.1: '#31167e',
            0.2: '#0006ff',
            0.3: '#008b15',
            0.4: '#5eaf1e',
            0.6: '#ffa000',
            0.8: '#ed0808',
            1.0: '#8e0505'
        };
        for (var x in gradient) {
            console.log(x);
            grad.addColorStop(parseFloat(x), gradient[x]);
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1, 256);

        var p = ctx.getImageData(0, 0, 1, 256).data;
        console.log(p);
        painter.paintLidar(canvas,{x:300,y:300},300,p,-90,300,data);
        return canvas.pngStream();
    }
    
    this.paintSpatial = function (data,size,projection,polygon) {
        var canvas = new Canvas(size[0],size[1]);
        var SpatialPainter = require('../painter/spatial-painter');
        var painter = new SpatialPainter();
        painter.paintSpatial(canvas,data,projection,polygon);
        console.log('return canvas');
        return canvas;
    }
}

module.exports=RenderService;
