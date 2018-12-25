

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

readJson('../data/bou1_4p.json').then((geojson)=>{
    var geometries = geojson.geometries;
    geojson.geometries = [];
    for (let i = 0; i < geometries.length; i++) {
        if (geometries[i].coordinates[0].length>500) {
            geojson.geometries.push(geometries[i]);
            console.log(geometries[i].coordinates[0].length);
        }
    }
    for (let i = 0; i < geojson.geometries.length; i++) {
        for(let j=0;j<geojson.geometries[i].coordinates[0].length;j++){
            geojson.geometries[i].coordinates[0][j][0] = Math.round(geojson.geometries[i].coordinates[0][j][0]*1000000)/1000000;
            geojson.geometries[i].coordinates[0][j][1] = Math.round(geojson.geometries[i].coordinates[0][j][1]*1000000)/1000000;
            //console.log(geojson.geometries[i].coordinates[0][j]);
        }
    }
    var chinaMainBorder = geojson.geometries[0].coordinates[0];
    geojson.geometries[0].coordinates[0] = [];
    for(let i = 0;i<chinaMainBorder.length;i++){
        if(i%4==0){
            geojson.geometries[0].coordinates[0].push(chinaMainBorder[i]);
        }
    }
    let fs = require('fs');
    fs.writeFile('./out.json',JSON.stringify(geojson));
});