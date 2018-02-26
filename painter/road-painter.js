
function RoadPainter() {

    this.init = function () {
        this._={

        }
    };

    this.paintRoad = function (canvas,polygon,projection) {
        var context = canvas.getContext("2d");
        var projectPolygon =  this.convertPolygon(projection,polygon);
        context.beginPath();
        context.moveTo(projectPolygon[0][0],projectPolygon[0][1]);
        for(var i = 1;i<projectPolygon.length;i++){
            context.lineTo(projectPolygon[i][0],projectPolygon[i][1]);
        }
        context.strokeStyle='green';
        context.lineWidth=1;
        context.stroke();
    };

    this.convertPolygon = function (projection, polygon) {
        console.log('convertPolygon');
        var pixPolygon = [];
        for (var i = 0; i < polygon.length; i++) {
            pixPolygon.push(projection([polygon[i][0], polygon[i][1]]));
        }
        return pixPolygon;
    };
}

module.exports = RoadPainter;