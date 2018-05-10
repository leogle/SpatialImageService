/**
 * Created by lrh on 2017-12-01.
 */
let express = require('express');
let router = express.Router();
const RenderService = require('../service/RenderService');
const map = new Map();

router.get('/spa', function(req, res) {
    console.log('render/statial');
    let fnv = require('fnv-plus');
    let hash = fnv.hash(req.query, 64).str();
    if(map.get(hash)){
        let fs = require('fs');
        fs.createReadStream('pngCache/'+hash+'.png').pipe(res);
        return;
    }
    let data = req.query.data;
    let center = req.query.center;
    let scale = req.query.scale;
    let size = req.query.size;
    let sectorName = req.query.sectorName;
    let renderService = new RenderService();
    center = [parseFloat(center[0]), parseFloat(center[1])];
    size = [parseFloat(size[0]), parseFloat(size[1])];
    console.log("center %s", center);
    console.log("size %s", size);
    let floatData =[];
    for (let i = 0; i < data.datas.length; i++) {
        let d = { lng: parseFloat(data.datas[i].lng),
            lat: parseFloat(data.datas[i].lat),
            value: parseFloat(data.datas[i].value) };
        if(!isNaN(d.lng) && !isNaN(d.lat) && !isNaN(d.value)) {
            floatData.push(d);
        }
    }
    data.datas=floatData;
    let projection = getProjection(center,scale,size);
    let polygon;
    if (sectorName) {
        let fs = require('fs');
        let fileStream = fs.createWriteStream('pngCache/'+hash+'.png');
        //中国边界
        if(sectorName === '中国') {
            fs.readFile('./data/chinaborder.json', function (err, geodata) {
                let geojson = JSON.parse(geodata);
                polygon = geojson.data;
                let poly = [];
                for (let i = 0; i < polygon.length; i++) {
                    poly.push(polygon[i]);
                }
                writeHead(res);
                let stream = renderService.paintSpatial(data, size, projection, poly).pngStream();
                map.set(hash,hash);
                stream.pipe(fileStream);
                stream.pipe(res);
            });
        }
        //中国地图各省市
        else {
            fs.readFile('./data/china.json','utf-8', function (err, geodata) {
                let geojson = JSON.parse(geodata);
                for (let i = 0; i < geojson.features.length; i++) {
                    if (geojson.features[i].properties.name === sectorName) {
                        polygon = geojson.features[i].geometry.coordinates;
                        break;
                    }
                }
                console.dir(polygon);
                writeHead(res);
                let stream = renderService.paintSpatial(data, size, projection, polygon).pngStream();
                map.set(hash,hash);
                stream.pipe(fileStream);
                stream.pipe(res);
            })
        }
    } else {
        writeHead(res);
        renderService.paintSpatial(data, size, projection, polygon).pngStream().pipe(res);
    }
});

router.get('/spatext', function(req, res) {
    console.log('render/statial');
    let fnv = require('fnv-plus');
    let hash = fnv.hash(req.query, 64).str();
    if(map.get(hash)){
        let fs = require('fs');
        fs.createReadStream('pngCache/'+hash+'.png').pipe(res);
        return;
    }
    let data = req.query.data;
    let center = req.query.center;
    let scale = req.query.scale;
    let size = req.query.size;
    let polygon =  req.query.polygon;
    let sectorName = req.query.sectorName;
    let renderService = new RenderService();
    center = [parseFloat(center[0]), parseFloat(center[1])];
    size = [parseFloat(size[0]), parseFloat(size[1])];

    let floatData =[];
    for (let i = 0; i < data.datas.length; i++) {
        let d = { lng: parseFloat(data.datas[i].lng),
            lat: parseFloat(data.datas[i].lat),
            value: parseFloat(data.datas[i].value),
            text:data.datas[i].text,};
        if(!isNaN(d.lng) && !isNaN(d.lat) && !isNaN(d.value)) {
            floatData.push(d);
        }
    }
    data.datas=floatData;
    let projection = getProjection(center,scale,size);

    if(sectorName){
        readJson('./data/sector.json').then(function (json) {
            debugger;
            for(let i in json.datas){
                if(json.datas[i].sectorName===sectorName){
                    polygon = json.datas[i].polygons;
                }
            }
            writeHead(res);
            renderService.paintSpatialWithText(data, size, projection, polygon).pngStream().pipe(res);
        });
    }
    else if(polygon) {
        writeHead(res);
        renderService.paintSpatialWithText(data, size, projection, polygon).pngStream().pipe(res);
    } else {
        writeHead(res);
        renderService.paintSpatialWithText(data, size, projection, polygon).pngStream().pipe(res);
    }
});

/***
 * 返回图片边界坐标
 */
router.get('/location',function(req, res) {
    console.log('render/location');
    let center = req.query.center;
    let scale = req.query.scale;
    let size = req.query.size;
    center = [parseFloat(center[0]), parseFloat(center[1])];
    size = [parseFloat(size[0]), parseFloat(size[1])];
    let projection = getProjection(center,scale,size);

    let sw = projection.invert([0,size[1]]);
    let ne = projection.invert([size[0],0]);

    writeHead(res);
    res.end(JSON.stringify({sw:sw,ne:ne}));
});

let getProjection = function (center,scale,size) {
    let d3 = require('d3-geo');
    return d3.geoMercator()
        .center(center)
        .scale(scale)
        .translate([size[0] / 2, size[1] / 2]);
};

let readJson = function (file) {
    return new Promise(function(resolve,reject)
    {
        let fs = require('fs');
        fs.readFile(file, function (err, geodata) {
            if(err){
                reject(err);
            }
            else{
                resolve(JSON.parse(geodata));
            }
        })
    });
};

let writeHead = function (res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
    });
};

module.exports = router;