const express = require('express');
const {createCanvas} = require('canvas');
const router = express.Router();
const Road = require('../painter/road-painter');

router.get('/',function (req,res) {
   res.render('road',{});
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

module.exports = router;
