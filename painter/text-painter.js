
function TextPainter() {

    this.init = function () {
        this._={
            font:'16px "Microsoft YaHei"', //字体
            fillStyle : 'blue', //颜色
            pointRadius: 2,     //点半径
            labelOffset:[-5,-10],//文本位置偏移
        };
    };
    this.init();

    this.paintText = function (canvas,texts,projection) {
        try {
            let context = canvas.getContext("2d");
            let projectTexts = this.convertPolygon(projection, texts);
            let pointRadius= this._["pointRadius"];
            let labelOffset = this._["labelOffset"];
            context.fillStyle =  this._['fillStyle'];
            context.font = this._['font'];
            for (let i = 0; i < projectTexts.length; i++) {
                if(projectTexts[i].text) {
                    context.fillText(projectTexts[i].text,
                        projectTexts[i].point[0] + labelOffset[0], projectTexts[i].point[1] +labelOffset[1]);
                    context.beginPath();
                    context.arc(projectTexts[i].point[0], projectTexts[i].point[1], pointRadius, 0, 2 * Math.PI);
                    context.fill();
                }
            }
        }catch (e){
            console.log('paint text error:'+e.toString());
        }
    };

    this.convertPolygon = function (projection, text) {
        try {
            let textLoc = [];
            for (let i = 0; i < text.length; i++) {
                textLoc.push({
                    text: text[i].text,
                    point: projection([text[i].lng, text[i].lat])
                });
            }
            return textLoc;
        }catch(e) {
            console.log('convert text error:'+e);
        }
    };
}

module.exports = TextPainter;