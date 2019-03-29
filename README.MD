##运行环境
nodejs
##依赖
node-canvas\
d3\
express
##配置
通过配置bin/www 配置服务端口号
##启动
>node hot.js
##接口
###渲染服务：
url: /render/spa\
说明:返回渲染后的png图片\
方式：get\
参数：{data:\
       {datas:[{lat:117,lng:21,value}...],}\
       size:[200,300],\
       center:[117.0,21.2],\
       scale:4000,\
       sectorName:'广东省'}\
返回：image/png\
\
url: /render/location\
说明：返回图片ne,sw对应的坐标\
方式：get\
参数：{
       size:[200,300],\
       center:[117.0,21.2],\
       scale:4000,\}\
返回：appliction/json\
![渲染图](https://github.com/leogle/ImageService/blob/master/demo.png?raw=true)
