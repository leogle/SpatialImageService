/**
 * Created by lrh on 2017-12-29.
 */

const fs = require('fs');

function fileCache() {
    this.filePath = path.join(_dirname,'filecache');

    this.cache = function (key,object,timeout) {
        var objectPath = path.join(this.getPath(key),key);

    };
    
    this.take = function (key) {
        var fs = require('fs');
    }

    this.getPath = function (key) {
        var dir = path.join(this.filePath,hash(key));
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
    }

    this.hash = function (key) {
        return key.substr(0,2);
    }
}

module.exports=fileCache;