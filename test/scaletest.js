var SpatialPainter = require('../painter/spatial-painter');

let painter = new SpatialPainter();
let dict = painter._getParamValueLevelDict("PM10");


const http = require('http');
const qs = require('querystring');
let param = {
    key:'54afb5246dec70a205533d8ea037569c',
    level:3,
    name:'宝岗大道',
    city:'广州市'
};
console.log(qs.stringify(param));
http.get('http://restapi.amap.com/v3/traffic/status/road?'+qs.stringify(param),function (res) {
    var buf = [];
    res.on('data',function (data) {
        buf.push(data);
        console.log(data);
    });
    res.on('end',function (chunk) {
        var allData = Buffer.concat(buf);
        var dataStr = allData.toString('utf-8');
        console.log(dataStr);
        var json = JSON.parse(dataStr);
    });
});

let rectangle = {
    key:'54afb5246dec70a205533d8ea037569c',
    level:3,
    rectangle:'116.351147,39.966309;116.357134,39.968727',
    extensions:'all'
};

http.get('http://restapi.amap.com/v3/traffic/status/rectangle?'+qs.stringify(rectangle),function (res) {
    var buf = [];
    res.on('data',function (data) {
        buf.push(data);
        console.log(data);
    });
    res.on('end',function (chunk) {
        var allData = Buffer.concat(buf);
        var dataStr = allData.toString('utf-8');
        console.log(dataStr);
        var json = JSON.parse(dataStr);
    });
});
/*
$.get("http://restapi.amap.com/v3/traffic/status/road",{
    key:'54afb5246dec70a205533d8ea037569c',
    level:1,
    name:'宝岗大道',
    city:'广州市'
},function (res) {
    console.log(res);
});*/
