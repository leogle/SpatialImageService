
function TextPainter() {

    this.init = function () {
        this._={
            font:'15px "Microsoft YaHei"', //字体
            fillStyle : '#015bff', //颜色
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
                    debugger;
                    let text = projectTexts[i].text;
                    var offset = this.getLayoutOffset(context,text,projectTexts[i].layout);
                    context.fillText(projectTexts[i].text,
                        projectTexts[i].point[0] + offset[0], projectTexts[i].point[1] +offset[1]);
                    context.beginPath();
                    context.arc(projectTexts[i].point[0], projectTexts[i].point[1], pointRadius, 0, 2 * Math.PI);
                    context.fill();
                }
            }
        }catch (e){
            console.log('paint text error:'+e.toString());
        }
    };

    this.getLayoutOffset = function(context,text,layout){
        debugger;
        switch (layout){
            case 'left':
                return [-context.measureText(text).width-5,7];
            case 'top':
                return [-context.measureText(text).width/2,-7];
            case 'right':
                return [5,7];
            case 'bottom':
                return [-context.measureText(text).width/2,16];
        }
        return [5,7];
    };

    this.convertPolygon = function (projection, text) {
        try {
            let textLoc = [];
            for (let i = 0; i < text.length; i++) {
                textLoc.push({
                    text: text[i].text,
                    layout:text[i].layout,
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