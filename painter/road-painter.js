
function RoadPainter() {

    this.init = function () {
        this._={

        }
    };

    this.paintRoad = function (canvas,polygon,projection) {
        try {
            let context = canvas.getContext("2d");
            let projectPolygon = this.convertPolygon(projection, polygon);
            context.beginPath();
            context.moveTo(projectPolygon[0][0], projectPolygon[0][1]);
            for (let i = 1; i < projectPolygon.length; i++) {
                context.lineTo(projectPolygon[i][0], projectPolygon[i][1]);
            }
            context.strokeStyle = 'green';
            context.lineWidth = 1;
            context.stroke();
        }catch (e){
            console.log(e);
        }
    };

    this.convertPolygon = function (projection, polygon) {
        let pixPolygon = [];
        for (let i = 0; i < polygon.length; i++) {
            pixPolygon.push(projection([polygon[i][0], polygon[i][1]]));
        }
        return pixPolygon;
    };
}

module.exports = RoadPainter;