let Service = require('node-windows').Service;  
  
let svc = new Service({  
  name: 'ImageService',    //服务名称  
  description: 'AQI图片渲染服务', //描述  
  script: 'E:/ImageService/bin/www' //nodejs项目要启动的文件路径
});  
  
svc.on('install', () => {  
  svc.start();  
});
  
svc.install();  