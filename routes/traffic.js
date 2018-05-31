const express = require('express');
const {createCanvas} = require('canvas');
const router = express.Router();
const Road = require('../painter/road-painter');
const http = require('http');
const qs = require('querystring');

router.get('/',function (req,res) {
    res.render('traffic',{ title: '渲染服务' });
});

router.get('/traffic',function (req,res) {
    let level = req.query.level;
    let rectangle = req.query.rectangle;
    let scale = req.query.scale;
    let size = req.query.size;
    size = [parseFloat(size[0]), parseFloat(size[1])];
    let sw = [parseFloat(rectangle.split(";")[0].split(",")[0]),parseFloat(rectangle.split(";")[0].split(",")[1])];
    let ne = [parseFloat(rectangle.split(";")[1].split(",")[0]),parseFloat(rectangle.split(";")[1].split(",")[1])];
    let param = {
        key:'54afb5246dec70a205533d8ea037569c',
        level:level,
        rectangle:rectangle,
        extensions:'all'
    };
    var d3 = require('d3-geo');
    var projection = d3.geoMercator()
        .center([(ne[0]+sw[0])/2,(ne[1]+sw[1])/2])
        .scale(scale)
        .translate([size[0]/2, size[1]/2]);
    http.get('http://restapi.amap.com/v3/traffic/status/rectangle?'+qs.stringify(param),function (getRes) {
        let buf = [];
        getRes.on('data',function (data) {
            buf.push(data);
            console.log(data);
        });
        getRes.on('end',function (chunk) {
            debugger;
            let allData = Buffer.concat(buf);
            let dataStr = allData.toString('utf-8');
            console.log(dataStr);
            let resData = JSON.parse(dataStr);
            if(resData.status==="1"){
                let trafficinfo = resData.trafficinfo;
                let roadPainter = new Road();
                let canvas = createCanvas(size[0], size[1]);
                for(let i = 0;i<trafficinfo.roads.length;i++){
                    let road = trafficinfo.roads[i];
                    if(road.polyline) {
                        var polygon = convert(road.polyline);
                        let color = getColor(road);
                        roadPainter.paintRoad(canvas, polygon, projection, color);
                    }
                }
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    "Access-Control-Allow-Origin": "*"
                });
                canvas.pngStream().pipe(res);
            }
            else{
                res.end();
            }

        });
    })
});

convert = function (polyline) {
    let split = polyline.split(';');
    let res = [];
    for(let i = 0;i<split.length;i++){
        let point = split[i].split(',');
        res.push([point[0],point[1]]);
    }
    return res;
};

getColor = function (road) {
    if (road.status === "0") {
        return 'gray';
    }
    else if (road.status === "1") {
        return '#0fae03';
    }
    else if (road.status === "2") {
        return 'orange';
    }
    else if (road.status === "3") {
        return 'red';
    }
};
module.exports = router;
