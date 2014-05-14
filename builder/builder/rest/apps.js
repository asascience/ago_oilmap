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
function getUniqueAppName(e,o,t,s){var i,n,p;n=t.replace(/\_copy-[0-9]+/,"");var r=new RegExp("^"+n+"_copy-[0-9]+");findApps(e,o,function(e,o){e?(console.error("find app failed in getUniqueAppName!"),s(e)):(i=findMaxNumFromSameNameApps(o),p=n+"_copy-"+i,s(e,p))},{name:r},[["name","desc"]])}function insertAndCopyApp(e,o,t,s){getCollection(o,"apps",function(o){console.log(e.body),insertToDB(o,{name:e.body.name,description:e.body.description,lastUpdated:getCurrentTime(),is3D:e.body.is3D},function(e,i){e?s(e,i):duplicateApp(t,i[0]._id,function(e){e?(console.error(" Rollbacking ---- deletes record! "+e),deleteFromDB(o,{_id:i[0]._id},function(){}),s(e)):s(e,i)})})})}function addBuilderSettingToConfig(e,o){var t=getAppPath(e);fse.readJson(t+"config.json",function(e,s){return e?void o(e):void db.collection("settings",function(e,i){return e?void o(e):void i.find({}).toArray(function(e,i){return e?void o(e):(i.forEach(function(e){"portalUrl"===e.name&&(s.portalUrl=e.value),"itemId"===e.name&&(s.map||(s.map={}),s.map.itemId=e.value),"geoServiceUrl"===e.name&&(s.geometryService||(s.geometryService={}),s.geometryService.url=e.value),"geocodeServiceUrl"===e.name&&(s.geocodeService||(s.geocodeService={}),s.geocodeService.url=e.value),"routeServiceUrl"===e.name&&(s.routeService||(s.routeService={}),s.routeService.url=e.value),"printTaskUrl"===e.name&&(s.printTask||(s.printTask={}),s.printTask.url=e.value),"proxyUrl"===e.name&&(s.httpProxy=e.value),"bing"===e.name&&(s.bingMapsKey=e.value),"appId"===e.name&&(s.appId=e.value),"locale"===e.name&&(s.locale=e.value)}),void fse.writeJson(t+"config.json",s,function(e){o(e)}))})})})}function insertToDB(e,o,t){e.insert(o,{safe:!0},function(e,o){e&&console.error("Inserts to database failed! "+e),t(e,o)})}function deleteFromDB(e,o,t){e.findAndModify(o,{},{},{remove:!0},function(e,o){e&&console.error("Deletes record from database failed!"),t(e,o)})}function duplicateApp(e,o,t){var s="./apps/"+e.toString()+"/",i="./apps/"+o.toString()+"/";if(fs.mkdirSync(i),"default2DApp"===e||"default3DApp"===e){var n;copyDefaultApp(e,o).then(function(){return n=fse.readJsonSync(path.join(getAppPath(o),"config.json")),mergeWidgetManifests(o,n)}).then(function(){return n.widgetManifestsMerged=!0,fseWriteJson(path.join(getAppPath(o),"config.json"),n)}).then(function(){t()},function(e){t(e)})}else fse.copy(s,i,function(e){t(e)})}function copyDefaultApp(e,o){var t="./apps/"+e.toString()+"/",s="./apps/"+o.toString()+"/",i="../stemapp/",n=[],p=deferred();return fs.existsSync(t)?(fs.mkdirSync(s+"themes"),fs.mkdirSync(s+"widgets"),n.push(fseCopy(i+"jimu.js",s+"jimu.js")),n.push(fseCopy(i+"images",s+"images")),n.push(fseCopy(i+"index.html",s+"index.html")),n.push(fseCopy(i+"env.js",s+"env.js")),n.push(fseCopy(i+"init.js",s+"init.js")),n.push(fseCopy(i+"proxy.jsp",s+"proxy.jsp")),n.push(fseCopy(i+"proxy.php",s+"proxy.php")),n.push(fseCopy(i+"proxy.ashx",s+"proxy.ashx")),n.push(fseCopy(i+"proxy.config",s+"proxy.config")),n.push(fseCopy(i+"web.config",s+"web.config")),n.push(fseCopy(t+"config.json",s+"config.json")),fse.readJson(t+"config.json",function(e,t){var r;return e?(p.reject(e),p.promise):(r="themes/"+t.theme.name,n.push(fseCopy(i+r,s+r)),visitElement(t,function(e){!e.widgets&&e.uri&&n.push(copyWidgetToApp(o,getWidgetNameFromUri(e.uri)))}),t.splashPage&&n.push(copyWidgetToApp(o,getWidgetNameFromUri(t.splashPage))),t.about&&n.push(copyWidgetToApp(o,getWidgetNameFromUri(t.about))),void deferred.apply(this,n).then(function(e){var o=null;e.forEach(function(e){e&&(o=e)}),o?p.reject(o):p.resolve()}))}),p.promise):(p.reject(Error(t+" not exists.")),p.promise)}function visitElement(e,o){var t,s;if(e.preloadWidgets){if(e.preloadWidgets.groups)for(t=0;t<e.preloadWidgets.groups.length&&!o(e.preloadWidgets.groups[t],t);t++)for(s=0;s<e.preloadWidgets.groups[t].widgets.length&&!o(e.preloadWidgets.groups[t].widgets[s],s);s++);if(e.preloadWidgets.widgets)for(t=0;t<e.preloadWidgets.widgets.length&&!o(e.preloadWidgets.widgets[t],t);t++);}if(e.widgetPool){if(e.widgetPool.groups)for(t=0;t<e.widgetPool.groups.length&&!o(e.widgetPool.groups[t],t);t++)for(s=0;s<e.widgetPool.groups[t].widgets.length&&!o(e.widgetPool.groups[t].widgets[s],s);s++);if(e.widgetPool.widgets)for(t=0;t<e.widgetPool.widgets.length&&!o(e.widgetPool.widgets[t],t);t++);}}function deleteApp(e,o){var t="./apps/"+e.toString();fse.remove(t,function(t){t&&console.error("Deletes app from filesystem error, the app id is:"+e.toString()),o(t)})}function getCollection(e,o,t){db.collection(o,function(s,i){s?(console.error("open collection: '"+o+"' failed"),e.send({success:!1})):t(i)})}function findApps(e,o,t,s,i){s||(s={}),i||(i=[["isTemplate","desc"],["lastUpdated","desc"]]),getCollection(o,"apps",function(e){e.find(s,{sort:i}).toArray(function(e,o){e&&console.error("findApps failed!"),o.forEach(function(e){e.id=e._id}),t(e,o)})})}function getCurrentTime(){var e,o,t=new Date;return e=t.toISOString(),o=e.indexOf("T"),e=e.slice(0,o),e+" "+t.toLocaleTimeString()}function copyWidgetToApp(e,o){var t=getAppPath(e),s=deferred();return fs.existsSync(t+"widgets/"+o+"/Widget.js")?(s.resolve(),s.promise):(widgets.getWidgetByName(o,function(e,i){e||!i?s.resolve():fse.copy(i.location,t+"widgets/"+o,function(e){e?s.reject(e):s.resolve()})}),s.promise)}function copyThemeToApp(e,o){var t=getAppPath(e),s=deferred();return fs.existsSync(t+"themes/"+o)?(s.resolve(),s.promise):(themes.getThemeByName(o,function(e,i){return e||!i?(s.reject(Error("Can not find the theme")),s.promise):void fse.copy(i.location,t+"themes/"+o,function(e){return e?(s.reject(e),s.promise):void s.resolve()})}),s.promise)}function removeThemes(e,o){var t=getAppPath(e),s=deferred();try{var i=fs.readdirSync(t+"themes/");i.forEach(function(e){e!==o.theme.name&&fs.existsSync(t+"themes/"+e)&&fse.removeSync(t+"themes/"+e)})}catch(n){s.reject(n)}return s.resolve(),s.promise}function removeWidgets(e,o){var t=getAppPath(e),s=deferred();try{var i=fs.readdirSync(t+"widgets");i.forEach(function(e){var s=!1;visitElement(o,function(o){return!o.widgets&&o.uri&&o.uri.indexOf(e)?(s=!0,!0):void 0}),s?(removeWidgetIcons(t,e,o),removeWidgetConfigs(t,e,o)):fse.removeSync(t+"widgets/"+e)})}catch(n){s.reject(n)}return s.resolve(),s.promise}function removeWidgetIcons(e,o,t){fs.readdirSync(path.join(e,"widgets",o,"images")).forEach(function(s){if(s.startWith("icon_")){var i=s.substring(5,s.length-4),n=!1;visitElement(t,function(e){return!e.widgets&&e.uri&&e.label===i?(n=!0,!0):void 0}),n||fse.removeSync(path.join(e,"widgets",o,"images",s))}})}function removeWidgetConfigs(e,o,t){fs.readdirSync(path.join(e,"widgets",o)).forEach(function(s){if(s.startWith("config_")){var i=s.substring(7,s.length-5),n=!1;visitElement(t,function(e){return!e.widgets&&e.uri&&e.label===i?(n=!0,!0):void 0}),n||fse.removeSync(path.join(e,"widgets",o,s))}})}function saveAppLogo(e,o){var t=getAppPath(e),s=deferred();if(o.logo&&o.logo.startWith("data:"))try{var i=utils.saveBase64ToImgSync(path.join(t,"images/logo.png"),o.logo);o.logo=i.substr(path.join(t).length),s.resolve()}catch(n){s.reject(n)}else s.resolve();return s.promise}function saveWidgetsIcon(e,o){var t=getAppPath(e),s=deferred();return visitElement(o,function(e){if(e.uri){var o=getWidgetNameFromUri(e.uri),i=null;if(e.icon&&e.icon.startWith("data:")){i=e.icon,e.icon="widgets/"+o+"/images/icon_"+e.label+".png";try{var n=utils.saveBase64ToImgSync(path.join(t,e.icon),i);e.icon=n.substr(path.join(t).length)}catch(p){s.reject(p)}}}}),s.resolve(),s.promise}function saveWidgetsConfig(e,o){var t=getAppPath(e),s=deferred(),i=[];return visitElement(o,function(e){if(e.uri){var o=getWidgetNameFromUri(e.uri),n=null;if(e.config&&"object"==typeof e.config){n=e.config,e.config="widgets/"+o+"/config_"+e.label+".json";try{processWidgetConfig(path.join(t,"widgets",o),n),i.push(fseWriteJson(t+e.config,n))}catch(p){s.reject(p)}}}}),0===i.length?s.resolve():deferred.apply(this,i).then(function(){s.resolve()},function(e){s.reject(e)}),s.promise}function processWidgetConfig(e,o){utils.visitObject(o,function(o,t){/^data:image\/.*;base64,/.test(o[t])&&saveImageInWidgetConfig(e,o,t)})}function saveImageInWidgetConfig(e,o,t){if(!/^data:image\/(png|jpeg|bmp|gif);base64,/.test(o[t]))throw Error("wrong image format.");var s,i=utils.findMaxFileIndexInFolder(path.join(e,"images"),t);s=-1===i?t+".png":t+"_"+(i+1)+".png";var n=utils.saveBase64ToImgSync(path.join(e,"images",s),o[t]);o[t]=n.substr(path.join(e).length+1),o[t]=o[t].replace("\\","/")}function mergeWidgetManifests(e,o){var t=getAppPath(e),s={};return visitElement(o,function(e){if(e.uri){var o=getWidgetNameFromUri(e.uri),i=path.join(t,"widgets",o,"manifest.json"),n=fse.readJsonSync(i);s[e.uri]=n}}),o.widgetManifestsMerged=!0,fseWriteJson(path.join(t,"widget-manifests.json"),s)}function saveAppConfig(e,o){var t=getAppPath(e);return fseWriteJson(t+"config.json",o)}function getAppPath(e){return"stemapp"===e?"../stemapp/":"./apps/"+e+"/"}function getZipFilePath(e){return"./apps/zips/"+e+".zip"}function getAGOLZipFilePath(e){return"./apps/zips/"+e+"AGOLTemplate.zip"}function getWidgetNameFromUri(e){var o=e.split("/");return o.pop(),o.pop()}function zipApp(e){var o=getAppPath(e);o=path.normalize(o);try{fs.existsSync("./apps/zips")||fs.mkdirSync("./apps/zips"),utils.zipFolderSync(o,getZipFilePath(e))}catch(t){return console.log(t),!1}return!0}function unZipApp(e){var o=getAppPath(e);o=path.normalize(o);try{utils.unZipToFolderSync(getZipFilePath(e),o)}catch(t){return console.log(t),!1}return!0}function zipAGOLApp(e,o,t){try{var s=new JSZip;fs.existsSync("./apps/zips")||fs.mkdirSync("./apps/zips"),s.file(t+".zip",fs.readFileSync(e)),s.file("AGOLTemplate.json",o);var i=s.generate({type:"nodebuffer",compression:"STORE"});fs.writeFileSync(path.normalize(getAGOLZipFilePath(t)),i,"binary")}catch(n){return console.log(n),!1}return!0}function insertApp(e,o){db.collection("apps",function(t,s){return t?void o(t):void s.insert(e,{safe:!0},function(e,t){return e?void o(e):void o(null,t[0]._id)})})}function findMaxNumFromSameNameApps(e){var o,t,s,i,n=0;for(o=0;o<e.length;o++)i=e[o].name,t=i.search(/\_copy-/)+6,s=Number(i.slice(t,i.length)),s>n&&(n=s);return n++,n}var deferred=require("deferred"),fs=require("fs"),path=require("path"),themes=require("./themes"),widgets=require("./widgets"),fse=require("fs-extra"),utils=require("../utils"),JSZip=new require("jszip"),fseCopy=deferred.promisify(fse.copy),fseWriteJson=deferred.promisify(fse.writeJson);exports.getAppList=function(e,o){findApps(e,o,function(e,t){e?(console.error("getAppList failed!"),o.send({success:!1})):(console.log("getAppList successfully."),o.send(t))})},exports.getApp=function(e,o){var t=e.params.appId;findApps(e,o,function(e,t){e?(console.error("getAppfailed!"),o.send({success:!1})):(console.log("getApp successfully."),o.send(t))},{_id:t})},exports.saveAppConfig=function(e,o){var t=e.params.appId;if(!t)return void o.send({success:!1,message:"No appId"});var s=JSON.parse(e.body.appConfig),i=removeThemes(t,s),n=removeWidgets(t,s),p=saveAppLogo(t,s),r=saveWidgetsIcon(t,s),a=saveWidgetsConfig(t,s),c=mergeWidgetManifests(t,s);deferred(i,n,p,r,a,c).then(function(){return saveAppConfig(t,s)}).then(function(){fs.existsSync(getZipFilePath(t))&&fs.unlinkSync(getZipFilePath(t)),db.collection("apps",function(e,s){var i=getCurrentTime();s.update({_id:t},{$set:{lastUpdated:i}},{safe:!0,upsert:!1},function(e,t){e||1!==t?(console.error("update app's lastUpdateTime error when saveAppConfig"),o.send({success:!1,message:e.message})):o.send({success:!0})})})},function(e){o.send({success:!1,message:e.message})})},exports.copyWidgetToApp=function(e,o){var t=e.params.appId,s=e.body.widgetName;copyWidgetToApp(t,s).then(function(){o.send({success:!0})},function(e){o.send({success:!1,message:e})})},exports.copyThemeToApp=function(e,o){var t=e.params.appId,s=e.body.themeName,i=JSON.parse(e.body.layoutConfig),n=[];n.push(copyThemeToApp(t,s)),visitElement(i,function(e){if(!e.widgets&&e.uri){var o=e.uri.split("/");o.pop();var s=o.pop();n.push(copyWidgetToApp(t,s))}}),deferred.apply(this,n).then(function(){o.send({success:!0})},function(e){o.send({success:!1,message:e})})},exports.createZip=function(e,o){try{var t=e.body.appId,s=getZipFilePath(t);o.send(fs.existsSync(s)?{success:!0}:zipApp(t)?{success:!0}:{success:!1})}catch(i){console.log("apps.createZip exception:",i),o.send({success:!1})}},exports.download=function(e,o){var t=e.params.appId,s=getZipFilePath(t);findApps(e,o,function(e,i){if(e)o.send({success:!1});else{var n=i[0].name;fs.existsSync(s)?o.download(s,n+".zip"):zipApp(t)?o.download(s,n+".zip"):o.send({success:!1})}},{_id:t})},exports.uploadApp=function(e,o){var t;return console.log("Request to upload app"),e.files.app?(t=e.files.app.name.replace(/\.zip/,""),void getUniqueAppName(e,o,t,function(t,s){insertApp({name:s,description:"",lastUpdated:getCurrentTime()},function(t,s){if(t)return console.log("Upload app failed when inserting an app."),void o.send({success:!1,message:t});var i=e.files.app.path;console.log(e.files.app.path);var n="./apps/zips/"+s+".zip";fs.existsSync("./apps/zips")||fs.mkdirSync("./apps/zips"),fse.rename(i,n,function(e){return e?(console.log("Upload app failed when moving app file from temporary location."),void o.send({success:!1,message:e})):void(unZipApp(s)?(console.log("Upload successfully."),o.send({success:!0})):(console.log("Failed to upload app when unzipping file."),o.send({success:!1,message:"error"})))})})})):void e.send(400)},exports.updateApp=function(e,o){getCollection(o,"apps",function(t){var s=getCurrentTime();t.update({_id:e.body.id},{$set:{name:e.body.name,description:e.body.description,lastUpdated:s}},{safe:!0,upsert:!1},function(e,t){e||1!==t?(console.error("updateApp error"),o.send({success:!1})):(console.log("Request updateApp successfully!"),o.send({success:!0,lastUpdated:s}))})})},exports.updateAgolTemplateInApp=function(e,o){getCollection(o,"apps",function(t){var s=getCurrentTime();t.update({_id:e.body.id},{$set:{agolTemplateJson:e.body.agolTemplateJson,lastUpdated:s}},{safe:!0,upsert:!1},function(t,s){t||1!==s?(console.error("Error occurs when updating AGOL template info in App: "+t),o.send({success:!1})):(fs.existsSync(getAGOLZipFilePath(e.body.id))&&fs.unlinkSync(getAGOLZipFilePath(e.body.id)),console.log("Request to update AGOL template info in App successfully!"),o.send({success:!0}))})})},exports.createApp=function(e,o){console.log("Request createApp, from:"+e.body.id+" app."),findApps(e,o,function(t,s){t?(console.error("find app in createApp failed!"),o.send({success:!1,message:"Failed to create new app."})):s.length>0?(o.send({success:!1,message:"Duplicate app name: '"+e.body.name+"' exists."}),console.log("Duplicate app name exists.")):insertAndCopyApp(e,o,e.body.id,function(e,t){e?(console.error("createApp failed!"),o.send({success:!1,message:"Failed to create new app."})):addBuilderSettingToConfig(t[0]._id,function(e){e?(console.error("createApp successfully!, but failed when 'addBuilderSettingToConfig'"),o.send({success:!1,message:"Failed to create new app."})):(console.log("createApp successfully!"),o.send({success:!0,newAppId:t[0]._id,apps:{}}))})})},{name:e.body.name})},exports.removeApp=function(e,o){console.log("Request removeApp, app id is:"+e.body.id),getCollection(o,"apps",function(t){deleteFromDB(t,{_id:e.body.id},function(t){t?(console.error("removeApp failed"),o.send({success:!1})):(deleteApp(e.body.id,function(){}),findApps(e,o,function(e,t){e?(console.error("getAppList failed after removeApp successfully"),t={}):console.log("removeApp successfully!"),o.send({success:!0,apps:t})}))})})},exports.duplicateApp=function(e,o){console.log("Request duplicateApp:"),getUniqueAppName(e,o,e.body.name,function(t,s){t?(console.error("duplicate failed"),o.send({success:!1,message:"Failed to duplicate app."})):(e.body.name=s,insertAndCopyApp(e,o,e.body.id,function(t,s){t?(console.error("duplicate failed"),o.send({success:!1})):findApps(e,o,function(e,t){e?(console.error("getAppList failed after duplicate successfully"),t={}):console.log("duplicateApp successfully!"),o.send({success:!0,apps:t,newAppId:s[0]._id})})}))})},exports.downloadAGOLTemplate=function(e,o){var t=e.params.appId,s=getZipFilePath(t),i=getAGOLZipFilePath(t);db.collection("apps",function(e,n){return e?void console.error("get collection failed when download AGOL template"):void n.findOne({_id:t},function(e,n){if(e)return void console.error("find app failed when download AGOL template: "+e);var p=JSON.parse(n.agolTemplateJson);p.configurationSettings.forEach(function(e){delete e.categoryName,e.fields.forEach(function(e){delete e.id})}),fs.existsSync(i)?o.download(i):fs.existsSync(s)?(zipAGOLApp(s,JSON.stringify(p),t),o.download(i,n.name+"_AGOLTemplate.zip")):zipApp(t)?(zipAGOLApp(s,JSON.stringify(p),t),o.download(i,n.name+"_AGOLTemplate.zip")):o.send({success:!1})})})};