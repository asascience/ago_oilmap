/*
Copyright ©2014 Esri. All rights reserved.
 
TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
Unpublished material - all rights reserved under the
Copyright Laws of the United States and applicable international
laws, treaties, and conventions.
 
For additional information, contact:
Attn: Contracts and Legal Department
Environmental Systems Research Institute, Inc.
380 New York Street
Redlands, California, 92373
USA
 
email: contracts@esri.com
*/
var path=require("path");exports.update=function(e,t){db.collection("settings",function(n,o){n?(console.error("settings.update fetch collection settings failed :"),console.error(n),t.send({success:!1})):o.remove(function(n){if(n)console.error("settings.update remove docs failed :"),console.error(n),t.send({success:!1});else{var s=[];for(var r in e.body){var i={name:r,value:e.body[r]};"portalUrl"===i.name&&(i.value.endWith("/")||(i.value+="/")),s.push(i)}o.insert(s,function(e){e?(console.error("settings.update insert docs failed: "),console.error(e),t.send({success:!1})):t.send({success:!0})})}})})},exports.getInfo=function(e,t){db.collection("settings",function(e,n){e?(console.error("setting.getInfo fetch collection settings failed: "),console.error(e),t.send({success:!1})):n.find().toArray(function(e,n){if(e)console.error("setting.getInfo find docs failed: "),console.error(e);else{for(var o={success:!0},s=n.length,r=0;s>r;r++){var i=n[r];o[i.name]=i.value}t.send(o)}})})},exports.getSettingValue=function(e,t){db.collection("settings",function(n,o){n?t(n):o.find({name:e}).toArray(function(n,o){n?t(n):o.length>0?t(null,o[0].value):t("unknown setting name:"+e)})})},exports.initSettings=function(e){db.collection("settings",function(t,n){n.insert([{name:"portalUrl",value:"http://www.arcgis.com/"},{name:"itemId",value:"6e03e8c26aad4b9c92a87c1063ddb0e3"},{name:"geoServiceUrl",value:"https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer"},{name:"geocodeServiceUrl",value:"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"},{name:"routeServiceUrl",value:"https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World"},{name:"printTaskUrl",value:"https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"},{name:"proxyUrl",value:"/proxy.js"},{name:"bing",value:""},{name:"appId",value:"senJpIJA845L4FlP"},{name:"themeRepo",value:path.join(__dirname,"/../../stemapp/themes/")},{name:"widgetRepo",value:path.join(__dirname,"/../../stemapp/widgets/")},{name:"locale",value:"en-us"}],{safe:!0},function(t,n){e(t,n)})})};