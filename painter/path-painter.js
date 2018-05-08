
function PathPainter() {

    this.init = function () {
        this._={
            lineWidth : 1,
            strokeStyle : '#242424',
        }
    };

    this.init();

    this.paintPath = function (canvas,polygons,projection) {
        try {
            let context = canvas.getContext("2d");
            context.strokeStyle = this._['strokeStyle'];
            context.lineWidth = this._['lineWidth'];
            debugger;
            let projectPolygons = this.convertPolygons(projection, polygons);
            for (let i = 0; i < projectPolygons.length; i++) {
                let projectPolygon = projectPolygons[i];
                context.beginPath();
                context.moveTo(projectPolygon[0][0], projectPolygon[0][1]);
                for (let j = 1; j < projectPolygon.length; j++) {
                    context.lineTo(projectPolygon[j][0], projectPolygon[j][1]);
                }
                context.closePath();
                context.stroke();
            }
        }catch (e){
            console.log('paint path error'+e);
        }
    };

    /**
     * 转换多个多边形
     * */
    this.convertPolygons = function (projection,polygons) {
        let pixPolygons = [];
        for(let i = 0;i<polygons.length;i++){
            let pixPolygon = this.convertPolygon(projection,polygons[i]);
            pixPolygons.push(pixPolygon);
        }
        return pixPolygons;
    };

    this.convertPolygon = function (projection, polygon) {
        let pixPolygon = [];
        for (let i = 0; i < polygon.length; i++) {
            pixPolygon.push(projection([polygon[i][0], polygon[i][1]]));
        }
        return pixPolygon;
    };
}

module.exports = PathPainter;