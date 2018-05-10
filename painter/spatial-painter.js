const {createCanvas} = require('canvas');

function SpatialPainter() {
    /**
     * 初始化颜色版
     */
    this.init = function () {
        try {
            //var Canvas = require('canvas');
            let _paleCanvas = createCanvas(1, 256);
            let ctx = _paleCanvas.getContext("2d");
            let grad = ctx.createLinearGradient(0, 0, 1, 256);
            let gradient = this._getGradientDict();
            for (let x in gradient) {
                grad.addColorStop(parseFloat(x), gradient[x]);
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1, 256);
            this.palette = ctx.getImageData(0, 0, 1, 256).data;
        }catch (e){
            console.log('spatial init error'+e);
        }
    };

    this.paintSpatial = function (canvas, data, projection, polygons,alpha=0.5) {
        try {
            this.init();
            //插值
            //按照画布逐像素点着色
            console.log(data);
            let _spatialData = this._setSpatialData(data, projection);
            console.log(_spatialData);
            let context = canvas.getContext('2d');
            let image = context.createImageData(canvas.width, canvas.height);
            let imgData = image.data;
            let d = _spatialData;
            let dlen = d.length;
            let height = canvas.height;
            let width = canvas.width;
            let x1 = 0, x2 = width, y1 = 0, y2 = height;
            //得到点值的二维数组
            debugger;
            let matrixData = [];
            for (let i = 0; i <= height; i++) {
                matrixData[i] = [];
                for (let j = 0; j <= width; j++) {
                    matrixData[i][j] = '';
                }
            }
            for (let _i = 0; _i < dlen; _i++) {
                let point = d[_i];
                if (x1 <= point.x && point.x <= x2 && y1 <= point.y && point.y <= y2) {
                    //仅在需要画图的区域初始化监测点数据
                    matrixData[point.y][point.x] = point.value;
                }
            }
            let pixPolygons;
            let maskData = null;
            //使用遮罩绘制地图轮廓，填充红色，通过判断遮罩颜色确定数据点是否在多边形内
            if (polygons && polygons.length !== 0) {
                pixPolygons = this.convertPolygons(projection, polygons);
                let maskCanvas = createCanvas(canvas.width, canvas.height);
                this.drawPolygons(maskCanvas, pixPolygons);
                let maskContext = maskCanvas.getContext('2d');
                maskData = maskContext.getImageData(0, 0, canvas.width, canvas.height).data;
                console.log(pixPolygons);
            }
            /**
             * 插值矩阵数据,时间复杂度O(height*width*len)
             *
             */
            for (var _i2 = y1; _i2 <= y2; _i2++) {
                for (var _j = x1; _j <= x2; _j++) {
                    if (matrixData[_i2][_j] === '') {
                        if (pixPolygons && pixPolygons.length > 0) {
                            if (maskData[4 * (_i2 * width + _j)] === 0) {
                                continue;
                            }
                        }
                        var sum0 = 0,
                            sum1 = 0;
                        for (var k = 0; k < dlen; k++) {

                            //将点位影响范围限制在500米内，性能下降不可接受
                            // let pointlnglat=map.containerToLngLat(new AMap.Pixel(j,i));
                            // if(pointlnglat.distance(new AMap.LngLat(d[k].lng,d[k].lat))>500){
                            // 	continue;
                            // }
                            var distance = (_i2 - d[k].y) * (_i2 - d[k].y) + (_j - d[k].x) * (_j - d[k].x);
                            //distance=Math.pow((i-d[k].y)*(i-d[k].y) + (j-d[k].x)*(j-d[k].x),-2);

                            sum0 += d[k].value * 1.0 / distance;
                            sum1 += 1.0 / distance;

                            // sum0 += d[k].value*1.0/((i-d[k].y)*(i-d[k].y) + (j-d[k].x)*(j-d[k].x));
                            // sum1 += 1.0/((i-d[k].y)*(i-d[k].y) + (j-d[k].x)*(j-d[k].x));
                        }
                        if (sum1 !== 0) matrixData[_i2][_j] = sum0 / sum1; else matrixData[_i2][_j] = 0;
                    }
                }
            }
            //更新图片数据
            for (var _i3 = y1; _i3 <= y2; _i3++) {
                for (var _j2 = x1; _j2 <= x2; _j2++) {
                    if (matrixData[_i3][_j2] === "") {
                        continue;
                    }
                    var radio = this._getRadioByValue(this.paramName, matrixData[_i3][_j2]);
                    //radio=0.8
                    imgData[4 * (_i3 * width + _j2)] = this.palette[Math.floor(radio * 255 + 1) * 4 - 4];
                    imgData[4 * (_i3 * width + _j2) + 1] = this.palette[Math.floor(radio * 255 + 1) * 4 - 3];
                    imgData[4 * (_i3 * width + _j2) + 2] = this.palette[Math.floor(radio * 255 + 1) * 4 - 2];
                    imgData[4 * (_i3 * width + _j2) + 3] = Math.floor(255 * alpha);
                }
            }
            //image.data = imgData;
            context.putImageData(image, 0, 0);
            return image;
        }catch (e){
            console.log('paint spatial error'+e);
        }
    };
    /**
     * 将地理坐标数据转换成画布坐标数据
     * @param data
     * @param projection
     * @returns {*}
     * @private
     */
    this._setSpatialData = function (data, projection) {
        //data:{datas:[{"lat": 40.2929, "value": 21.0, "lng": 116.2266}, {"lat": 39.9301, "value": 16.0, "lng": 116.4233}...]
        //,paramName:"PM10",unit:"ug/m3"}
        if (data === null) {
            return null;
        }
        var _jsonData = data.datas;
        var _jdlen = data.datas.length;
        var _spatialData = [];
        while (_jdlen--) {
            var pixel = projection([_jsonData[_jdlen].lng, _jsonData[_jdlen].lat]);
            console.log(pixel);
            _spatialData.push({
                "lng": _jsonData[_jdlen].lng,
                "lat": _jsonData[_jdlen].lat,
                "x": parseInt(pixel[0]),
                "y": parseInt(pixel[1]),
                "value": _jsonData[_jdlen].value
            });
        }
        this.paramName = data.paramName;
        this.unit = data.unit;
        return _spatialData;
    };
    this._getRadioByValue = function (param, value) {
        //根据污染物名称和浓度值计算在图例中显示的颜色比例
        var levelDict = this._getParamValueLevelDict(param);
        if (value < 0) {
            return 0.0;
        } else {
            for (var key in levelDict) {
                if (levelDict[key][1] === null && value > levelDict[key][0]) {
                    //最大值
                    return key;
                } else if (levelDict[key][0] < value && value <= levelDict[key][1]) {
                    return parseFloat(key) + (value - levelDict[key][0]) / (levelDict[key][1] - levelDict[key][0]) * levelDict[key][2];
                }
            }
        }
    };
    this._getParamValueLevelDict = function (param) {
        //根据污染物名称获取分级比例字典
        //格式[起始浓度,终止浓度,下一等级与当前等级的比例差] ,0.6的起始和终止值一样为了在iaqi>300后快速过度到0.8颜色
        if (param === "AQI") {
            return {
                0: [0, 50, 0.1],
                0.1: [50, 100, 0.1],
                0.2: [100, 200, 0.1],
                0.3: [200, 300, 0.1],
                0.4: [300, 500, 0.2],
                0.6: [500, 500, null],
                0.8: [500, null, null]
            }; //更高的值颜色不变
        }
        else if (param === "PM10") {
            return {
                0: [0, 50, 0.1],
                0.1: [50, 150, 0.1],
                0.2: [150, 250, 0.1],
                0.3: [250, 350, 0.1],
                0.4: [350, 420, 0.2],
                0.6: [420, 420, null],
                0.8: [420, null, null]
            }; //更高的值颜色不变

        } else if (param === "PM2_5") {
            return {
                0: [0, 35, 0.1],
                0.1: [35, 75, 0.1],
                0.2: [75, 115, 0.1],
                0.3: [115, 150, 0.1],
                0.4: [150, 250, 0.2],
                0.6: [250, 250, null],
                0.8: [250, null, null]
            }; //更高的值颜色不变
        } else if (param === "SO2") {
            return {
                0: [0, 150, 0.1],
                0.1: [150, 500, 0.1],
                0.2: [500, 650, 0.1],
                0.3: [650, 800, 0.1],
                0.4: [800, 1600, 0.2],
                0.6: [1600, 1600, null],
                0.8: [1600, null, null]
            }; //更高的值颜色不变
        }else if (param === "SO2_D") {
            return {
                0: [0, 50, 0.1],
                0.1: [50, 150, 0.1],
                0.2: [150, 475, 0.1],
                0.3: [475, 800, 0.1],
                0.4: [800, 1600, 0.2],
                0.6: [1600, 1600, null],
                0.8: [1600, 1600, null]
            }; //更高的值颜色不变
        }
        else if (param === "NO2") {
            return {
                0: [0, 100, 0.1],
                0.1: [100, 200, 0.1],
                0.2: [200, 700, 0.1],
                0.3: [700, 1200, 0.1],
                0.4: [1200, 2340, 0.2],
                0.6: [2340, 2340, null],
                0.8: [2340, null, null]
            }; //更高的值颜色不变
        } else if (param === "NO2_D") {
            return {
                0: [0, 40, 0.1],
                0.1: [40, 80, 0.1],
                0.2: [80, 180, 0.1],
                0.3: [180, 280, 0.1],
                0.4: [280, 565, 0.2],
                0.6: [565, 565, null],
                0.8: [565, null, null]
            }; //更高的值颜色不变
        }
        else if (param === "CO") {
            return {
                0: [0, 5, 0.1],
                0.1: [5, 10, 0.1],
                0.2: [10, 35, 0.1],
                0.3: [35, 60, 0.1],
                0.4: [60, 90, 0.2],
                0.6: [90, 90, null],
                0.8: [90, null, null]
            }; //更高的值颜色不变
        }
        else if (param === "CO_D") {
            return {
                0: [0, 2, 0.1],
                0.1: [2, 4, 0.1],
                0.2: [4, 14, 0.1],
                0.3: [14, 24, 0.1],
                0.4: [24, 36, 0.2],
                0.6: [36, 36, null],
                0.8: [36, null, null]
            }; //更高的值颜色不变
        }
        else if (param === "O3") {
            return {
                0: [0, 160, 0.1],
                0.1: [160, 200, 0.1],
                0.2: [200, 300, 0.1],
                0.3: [300, 400, 0.1],
                0.4: [400, 800, 0.2],
                0.6: [800, 800, null],
                0.8: [800, null, null]
            }; //更高的值颜色不变
        }
        else if (param === "O3_8H") {
            return {
                0: [0, 100, 0.1],
                0.1: [100, 160, 0.1],
                0.2: [160, 215, 0.1],
                0.3: [215, 265, 0.1],
                0.4: [265, 800, 0.2],
                0.6: [800, 800, null],
                0.8: [800, null, null]
            }; //更高的值颜色不变
        }
    };

    this._getGradientDict = function () {
        //AQI颜色标记字典(依据IAQI比例分级)
        /*
         return {
         0: "rgb(0,200,255)", //蓝色 0
         0.1: "rgb(0,228,0)", //绿色 50
         0.2: "rgb(255,255,0)", //黄色 100
         0.3: "rgb(255,126,0)", //橙色 150
         0.4: "rgb(255,0,0)", //红色 200   //当正好渲染此颜色时图片上有麻点，不知道原因未解决
         0.6: "rgb(153,0,76)", //紫色 300
         0.8: "rgb(126,0,35)", //褐红 400
         1.0: "rgb(126,0,35)"
         };
         */
        return {
            0: "#00deff", //蓝色 0
            0.1: "#00ff32", //绿色 50
            0.2: "#ffdc00", //黄色 100
            0.3: "rgb(240,108,25)", //橙色 150
            0.4: "rgb(255,0,0)", //红色 200
            0.6: "rgb(153,0,76)", //紫色 300
            0.8: "rgb(126,0,35)", //褐红 400
            1.0: "rgb(111,4,116)"
        };
        /*return {
            0: "#00ff32",
            0.099: "#00ff32",
            0.1: "#ffdc00",
            0.199: "#ffdc00",
            0.2: "#f06c19",
            0.299: "#f06c19",
            0.3: "#ff0000",
            0.399: "#ff0000",
            0.4: "#99004c",
            0.599: "#99004c",
            0.6: "#7e0024",
            0.699: "#7e0024",
            0.8: "rgb(126,0,35)",
            1.0: "rgb(111,4,116)"
        };*/
    };

    /**
     * 将地理坐标映射到屏幕坐标
     * @param projection
     * @param {Array} polygon
     * @returns {Array}
     */
    this.convertPolygon = function (projection, polygon) {
        console.log('convertPolygon');
        var pixPolygon = [];
        for (var i = 0; i < polygon.length; i++) {
            pixPolygon.push(projection([polygon[i][0], polygon[i][1]]));
        }
        return pixPolygon;
    };

    /**
     * 转换多个多边形
     * */
    this.convertPolygons = function (projection,polygons) {
        var pixPolygons = [];
        for(var i = 0;i<polygons.length;i++){
            var pixPolygon = this.convertPolygon(projection,polygons[i]);
            pixPolygons.push(pixPolygon);
        }
        return pixPolygons;
    };
    /**
     * 绘制多个多边形
     * @param canvas
     * @param polygons
     */
    this.drawPolygons = function (canvas,polygons) {
        for(var i = 0;i<polygons.length;i++){
            this.drawPolygon(canvas,polygons[i]);
        }
    };

    /**
     * 绘制多边形
     * @param canvas
     * @param polygon
     */
    this.drawPolygon = function (canvas, polygon) {
        var context = canvas.getContext('2d');
        if (polygon && polygon.length > 3) {
            context.beginPath();
            context.moveTo(polygon[0][0], polygon[0][1]);
            for (var i = 1; i < polygon.length; i++) {
                context.lineTo(polygon[i][0], polygon[i][1]);
            }
            context.closePath();
            context.fillStyle = "red";
            context.fill();
        }
    };
    /**
     * 判断该点在不在多边形内（过时）
     * @param point {Array}
     * @param polygon {Array}
     * @returns {boolean}
     * @summary 多边形数据较大时，性能损耗严重，暂不使用
     */
    this.pnpoly = function (point, polygon) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        var x = point[0], y = point[1];

        var inside = false;
        for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            var xi = polygon[i][0], yi = polygon[i][1];
            var xj = polygon[j][0], yj = polygon[j][1];

            var intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside
            }
        }

        return inside;
    };
}

module.exports = SpatialPainter;