/**
 * Created by lrh on 2017-11-30.
 */
const {createCanvas} = require('canvas');

function RenderService() {


    this.paintLidar = function (data) {
        var Painter = require('../painter/lidar-painter');
        painter = new Painter();
        var size = [600,600];
        var canvas = createCanvas(size[0],size[1]);

        var _paleCanvas = createCanvas(1,256);
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
    };
    
    this.paintSpatial = function (data,size,projection,polygon,conrec=false) {
        var canvas = createCanvas(size[0],size[1]);
        var SpatialPainter = require('../painter/spatial-painter');
        var painter = new SpatialPainter();
        painter.paintSpatial(canvas,data,projection,polygon,0.5,conrec);
        console.log('return canvas');
        return canvas;
    };

    this.paintSpatialWithText = function (data,size,projection,polygon) {
        //绘制渲染
        let canvas = createCanvas(size[0], size[1]);
        let SpatialPainter = require('../painter/spatial-painter');
        let painter = new SpatialPainter();
        console.log('paint Spatial');
        painter.paintSpatial(canvas, data, projection, null,1);
        //绘制路径
        let PathPainter = require('../painter/path-painter');
        let pathPainter = new PathPainter();
        console.log('paint path');
        pathPainter.paintPath(canvas,polygon,projection);

        //绘制文本
        let TextPainter = require('../painter/text-painter');
        let textPainter = new TextPainter();
        console.log('paint text');
        textPainter.paintText(canvas, data.datas, projection);


        console.log('return canvas');
        return canvas;
    }
}

module.exports=RenderService;
