const express = require('express');
const {createCanvas} = require('canvas');
const router = express.Router();
const Road = require('../painter/road-painter');
const http = require('http');
const qs = require('querystring');

router.get('/',function (req,res) {
   res.render('road',{ title: '渲染服务' });
});

/* GET users listing. */
router.get('/png', function(req, res) {
    var fs = require('fs');
    fs.readFile('./data/guangzhou.geo.json', function (err, geodata) {
        var geojson = JSON.parse(geodata);
        var canvas = createCanvas(1000, 600);
        var d3 = require('d3-geo');
        var projection = d3.geoMercator()
            .center([113.269089, 23.12829])
            .scale(800000)
            .translate([500, 300]);
        var roadPainter = new Road();
        for (var i = 0; i < geojson.features.length; i++) {
            var feature = geojson.features[i];
            if (feature.properties.highway != undefined) {
                console.log(feature.properties.name);
                var polygon = feature.geometry.coordinates;
                roadPainter.paintRoad(canvas, polygon, projection)
            }
        }

        res.writeHead(200, {
            'Content-Type': 'image/png',
            "Access-Control-Allow-Origin": "*"
        });
        canvas.pngStream().pipe(res);
    });
});

router.get('/highway', function(req, res) {
    var fs = require('fs');
    fs.readFile('./data/guangzhou.geo.json', function (err, geodata) {
        var geojson = JSON.parse(geodata);
        var canvas = new Canvas(1000,600);
        var d3 = require('d3-geo');
        var projection = d3.geoMercator()
            .center([113.269089,23.12829])
            .scale(800000)
            .translate([500,300]);
        var roadPainter = new Road();
        debugger;
        for (var i = 0; i < geojson.features.length; i++) {
            var feature = geojson.features[i];
            if (feature.properties.highway != undefined
            && (feature.properties.highway==='motorway'
                || feature.properties.highway==='trunk'
                    || feature.properties.highway==='primary'
                    || feature.properties.highway==='secondary'
                    || feature.properties.highway==='tertiary'
                    || feature.properties.highway==='unclassified'
                    || feature.properties.highway==='residential')) {
                console.log(feature.properties.name);
                var polygon = feature.geometry.coordinates;
                roadPainter.paintRoad(canvas,polygon,projection)
            }
        }

        res.writeHead(200, {
            'Content-Type': 'image/png',
            "Access-Control-Allow-Origin": "*"
        });
        canvas.pngStream().pipe(res);
    });
});

router.get('/traffic',function (req,res) {
    let level = req.query.level;
    let rectangle = req.query.rectangle;
    let param = {
        key:'54afb5246dec70a205533d8ea037569c',
        level:level,
        rectangle:rectangle,
        extensions:'all'
    };
    var projection = d3.geoMercator()
        .center([113.269089, 23.12829])
        .scale(800000)
        .translate([500, 300]);
    http.get('http://restapi.amap.com/v3/traffic/status/rectangle?'+qs.stringify(param),function (getRes) {
        let buf = [];
        getRes.on('data',function (data) {
            buf.push(data);
            console.log(data);
        });
        getRes.on('end',function (chunk) {
            let allData = Buffer.concat(buf);
            let dataStr = allData.toString('utf-8');
            console.log(dataStr);
            let resData = JSON.parse(dataStr);
            if(resData.status===1){
                let trafficinfo = resData.trafficinfo;
                let roadPainter = new Road();
                let canvas = createCanvas(1000, 600);
                for(let i = 0;i<trafficinfo.roads.length;i++){
                    let road = trafficinfo.roads[i];
                    var polygon = convert(road.polyline);
                    let color = getColor(road);
                    roadPainter.paintRoad(canvas,polygon,projection,color);
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
       res.push(point[0],point[i]);
   }
   return res;
};

getColor = function (road) {
    if (road.status === "0") {
        return 'gray';
    }
    else if (road.status === "1") {
        return 'green';
    }
    else if (road.status === "2") {
        return 'yellow';
    }
    else if (road.status === "3") {
        return 'red';
    }
};
module.exports = router;
