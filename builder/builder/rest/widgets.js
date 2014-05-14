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
exports.getAllWidgets=function(s,e){db.collection("widgets",function(s,n){s?e.send({success:!1,message:s}):n.find({}).toArray(function(s,n){s&&e.send({success:!1,message:s}),e.send({success:!0,widgets:n})})})},exports.getWidgetByName=function(s,e){db.collection("widgets",function(n,t){n?e(n):t.findOne({name:s},function(s,n){return s?void e(s):void e(null,n)})})},exports.searchWidgets=function(s,e){var n=JSON.parse(s.query.q);db.collection("widgets",function(s,t){s?e.send({success:!1,message:s}):t.find(n,{sort:"name"}).toArray(function(s,n){s&&e.send({success:!1,message:s}),e.send({success:!0,widgets:n})})})};