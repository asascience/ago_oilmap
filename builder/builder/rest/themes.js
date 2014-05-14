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
exports.getThemes=function(e,o){db.collection("themes",function(e,n){e?(console.error("open collection: themes failed"),o.send({success:!1})):n.find({}).toArray(function(e,n){e?(console.error("findThemes failed!"),o.send({success:!1})):(console.log("getThems successful."),o.send({success:!0,themes:n}))})})},exports.getThemeByName=function(e,o){db.collection("themes",function(n,s){n?(console.error("open collection: themes failed"),o(n)):s.findOne({name:e},function(e,n){e?(console.error("findTheme failed!"),o(e)):(console.log("getThem successful."),o(null,n))})})};