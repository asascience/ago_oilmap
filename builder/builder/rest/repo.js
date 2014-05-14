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
function getRepoUrl(e,n){settingRest.getSettingValue(e+"Repo",function(e,t){n(e,t)})}function refreshRepo(e){console.log("refresh %s repo",e),getRepoUrl(e,function(n,t){return n?void console.log(n):void removeRepoData(e,function(n){n||(fs.existsSync(t)?readRepoData(e,t,function(n){return n?void console.log(n):void setTimeout(function(){watchRepo(e,t)},5e3)}):console.log(t+" not exist"))})})}function watchRepo(e,n){var t=0;console.log("watch: "+n);var o=fs.watch(n,{persistent:!0},function(){t++,1===t&&(o.close(),console.log("stop watch: "+n),refreshRepo(e))})}function removeRepoData(e,n){db.collection(e+"s",function(e,t){return e?void n(e):void t.remove(function(e){return e?void n(e):void n()})})}function readRepoData(e,n,t){var o,i=[];fs.existsSync(path.join(n,".repoignore"))&&(o=fs.readFileSync(path.join(n,".repoignore"),{encoding:"utf-8"}),o&&(i=o.split("\r\n")));var r=[];utils.visitSubFolders(n,function(t,o,s){var a=t.substr(n.length);return i.length>0&&isFolderIgnore(a,i)?!0:existManifestFile(s)?(r.push(readManifestSync(e,t,a)),!0):void 0}),db.collection(e+"s",function(e,n){e||n.insert(r,{safe:!0},function(e,n){t(e,n)})})}function existManifestFile(e){for(var n=0;n<e.length;n++)if("manifest.json"===e[n])return!0}function readManifestSync(e,n,t){var o=path.join(n,"manifest.json"),i=fse.readJsonSync(o);return i.url="/"+e+"repo/"+t+"/",i.icon=i.url+"images/icon.png",i.location=n,"widget"===e&&addWidgetManifestProperties(i),"theme"===e&&addThemeManifestProperies(i),i}function addWidgetManifestProperties(e){e.label||(e.label=e.name),"undefined"!=typeof e["2D"]&&(e.support2D=e["2D"]),"undefined"!=typeof e["3D"]&&(e.support3D=e["3D"]),"undefined"==typeof e["2D"]&&"undefined"==typeof e["3D"]&&(e.support2D=!0),delete e["2D"],delete e["3D"],"undefined"==typeof e.properties&&(e.properties={});var n=["inPanel","hasLocale","hasStyle","hasConfig","hasUIFile","hasSettingPage","hasSettingUIFile","hasSettingLocale","hasSettingStyle"];n.forEach(function(n){"undefined"==typeof e.properties[n]&&(e.properties[n]=!0)}),"undefined"==typeof e.properties.isController&&(e.properties.isController=!1)}function addThemeManifestProperies(e){e.label||(e.label=e.name),e.panels.forEach(function(e){e.uri="panels/"+e.name+"/Panel.js"}),e.styles.forEach(function(e){e.uri="styles/"+e.name+"/style.css"}),e.layouts.forEach(function(e){e.uri="layouts/"+e.name+"/config.json",e.icon="layouts/"+e.name+"/icon.png"})}function isFolderIgnore(e,n){for(var t=0;t<n.length;t++)if(e===n[t])return!0;return!1}var path=require("path"),fs=require("fs"),settingRest=require("./settings"),utils=require("../utils"),fse=require("fs-extra");exports.refreshRepo=function(){refreshRepo("theme"),refreshRepo("widget")};