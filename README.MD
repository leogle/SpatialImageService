## 概述
SpatialImageService提供了一个后台AQI渲染图片服务，服务采用NodeJS开发，通过空间插值算法计算污染分布，并通过NodeCanvas绘制图片\
前端通过post将数据传入后台处理，后台返回渲染后的图片，可用于前端地图叠加\
系统可独立部署，图片获取可跨域，与应用相对独立。
## 运行环境
nodejs
## 依赖
node-canvas(https://github.com/Automattic/node-canvas)\
d3\
express
## 配置
通过配置bin/www 配置服务端口号
## 启动
>node hot.js
## 接口
### 渲染服务：
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
