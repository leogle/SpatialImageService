/**
 * Created by lrh on 2017-12-01.
 */
var express = require('express');
var router = express.Router();
const RenderService = require('../service/RenderService');

router.get('/spa', function(req, res) {
    console.log('render/statial');
    var data = req.query.data;
    var center = req.query.center;
    var scale = req.query.scale;
    var size = req.query.size;
    var sectorName = req.query.sectorName;
    var renderService = new RenderService();
    center = [parseFloat(center[0]), parseFloat(center[1])];
    size = [parseFloat(size[0]), parseFloat(size[1])];
    console.log("center %s", center);
    console.log("size %s", size);
    var floatData =[];
    for (var i = 0; i < data.datas.length; i++) {
        var d = { lng: parseFloat(data.datas[i].lng),
            lat: parseFloat(data.datas[i].lat),
            value: parseFloat(data.datas[i].value) }
        if(!isNaN(d.lng) && !isNaN(d.lat) && !isNaN(d.value)) {
            floatData.push(d);
        }
    }
    data.datas=floatData;
    var d3 = require('d3-geo');
    /**
     * 使用墨卡托投影
     * */
    var projection = d3.geoMercator()
        .center(center)
        .scale(scale)
        .translate([size[0] / 2, size[1] / 2]);
    var polygon;
    if (sectorName) {
        var fs = require('fs');
        //中国边界
        if(sectorName === '中国') {
            fs.readFile('./data/chinaborder.json', function (err, geodata) {
                var geojson = JSON.parse(geodata);
                polygon = geojson.data;
                var poly = [];
                for (var i = 0; i < polygon.length; i++) {
                    poly.push(polygon[i]);
                }
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    "Access-Control-Allow-Origin": "*"
                });
                renderService.paintSpatial(data, size, projection, poly).pngStream().pipe(res);
            });
        }
        //中国地图各省市
        else {
            fs.readFile('./data/china.json', function (err, geodata) {
                var geojson = JSON.parse(geodata);
                for (var i = 0; i < geojson.features.length; i++) {
                    if (geojson.features[i].properties.name === sectorName) {
                        polygon = geojson.features[i].geometry.coordinates;
                        break;
                    }
                }
                console.dir(polygon);
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    "Access-Control-Allow-Origin": "*"
                });
                renderService.paintSpatial(data, size, projection, polygon).pngStream().pipe(res);
            })
        }
    } else {
        res.writeHead(200, {
            'Content-Type': 'image/png',
            "Access-Control-Allow-Origin": "*"
        });
        renderService.paintSpatial(data, size, projection, polygon).pngStream().pipe(res);
    }
});

/***
 * 返回图片边界坐标
 */
router.get('/location',function(req, res) {
    console.log('render/location');
    var center = req.query.center;
    var scale = req.query.scale;
    var size = req.query.size;
    center = [parseFloat(center[0]), parseFloat(center[1])];
    size = [parseFloat(size[0]), parseFloat(size[1])];
    console.log("center %s", center);
    console.log("size %s", size);

    var d3 = require('d3-geo');
    var projection = d3.geoMercator()
        .center(center)
        .scale(scale)
        .translate([size[0] / 2, size[1] / 2]);
    var sw = projection.invert([0,size[1]]);
    var ne = projection.invert([size[0],0]);
    console.log(sw);
    console.log(ne);
    res.writeHead(200, {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
    });
    res.end(JSON.stringify({ne:ne,sw:sw}));
});

module.exports = router;