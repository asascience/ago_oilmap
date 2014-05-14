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

/* global __dirname, global, process*/
/* jshint es3: false */
/**
 * Module dependencies.
 */
var express = require('express');
var builderIndex = require('./routes');
var appRest = require('./rest/apps');
var themeRest = require('./rest/themes');
var widgetRest = require('./rest/widgets');
var settingRest = require('./rest/settings');
var repoRest = require('./rest/repo');
var http = require('http');
var path = require('path');
var fs = require('fs');
var proxy = require('./proxy');
var dbEngine = require('./db-engine');

var app = express();

var db = dbEngine.getDB();
global.db = db;

checkAndInitData(db);

//get command line parameter
var args = process.argv.splice(2);
var argPort;
var argPathDevJsapi;
var argPathDevDojo;
args.forEach(function(arg) {
  var a = arg.split('=');
  var param = a[0];
  var val = a[1];
  switch(param){
  case "-port" :
    argPort = val;
    break;
  case "-jsapi" :
    argPathDevJsapi = val;
    break;
  case "-dojo" :
    argPathDevDojo = val;
    break;
  }
});

setEnv();
useMiddleWares();
mapUrl();
http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port') + ' in ' + app.get('env') + ' mode');
});



function setEnv(){
  if (!fs.existsSync(__dirname + '/uploads')) {
    fs.mkdirSync(__dirname + '/uploads');
  }

  app.set('port', argPort || process.env.PORT || 3344);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
}

function useMiddleWares(){
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({
    limit: '50mb',
    uploadDir: __dirname + '/uploads'
  }));
  app.use(express.methodOverride());
  app.use(app.router);
  //add end slash to /webapp
  app.use(function(req, res, next) {
    if (req.method === "GET" && req.url === '/webapp') {
      res.writeHead(301, {
        "Location": req.url + '/'
      });
      res.end();
    }
    next();
  });
  app.use('/proxy.js', proxy.proxyRequest());
  app.use('/webapp', express.static(path.join(__dirname, '../stemapp')));
  app.use('/bstatic', express.static(path.join(__dirname, '/views/static')));
  app.use('/apps', express.static(path.join(__dirname, './apps')));

  // development only
  if ('development' === app.get('env')) {
    setupDevEnv();
  }

  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Something broke!');
    /*jshint unused: false*/
  });
}

function setupDevEnv(){
  app.use(express.errorHandler());
  
  // register dojo source version for use in unit tests
  var devDojoPath;
  if (argPathDevDojo && fs.existsSync(argPathDevDojo)) {
    devDojoPath = argPathDevDojo;
  }else if(fs.existsSync(path.join(__dirname, '../libs/dojo'))){
    devDojoPath = path.join(__dirname, '../libs/dojo');
  }
  if (devDojoPath) {
    console.log("register /dojo -> "+devDojoPath);
    app.use('/dojo', express.static(devDojoPath));
  }
  
  // register local provided js api (the folder must directly contain the "js" folder of the api, no version number sub directory)
  if (argPathDevJsapi && fs.existsSync(argPathDevJsapi)) {
    mapJsApi('arg', argPathDevJsapi);
  }else if(fs.existsSync(path.join(__dirname, '../libs/arcgis_js_api'))){
    fs.readdirSync(path.join(__dirname, '../libs/arcgis_js_api')).forEach(function(file){
      mapJsApi(file, path.join(__dirname, '../libs/arcgis_js_api', file));
    });
  }

  function mapJsApi(name, path){
    console.log("register /arcgis_js_api/" + name + " -> " + path);
    app.use('/arcgis_js_api/' + name, express.static(path));
    app.get('/arcgis_js_api/' + name, function(req, res) {
      res.sendfile(path + '/js/dojo/dojo/dojo.js');
    });
  }
}

function mapUrl(){
  app.get('/webappbuilder', builderIndex.index);

  /************** app rest *******************/
  app.get('/builder/rest/apps/list', appRest.getAppList);
  app.get('/builder/rest/apps/:appId', appRest.getApp);
  app.get('/builder/rest/apps/:appId/download', appRest.download);
  app.get('/builder/rest/apps/:appId/downloadagoltemplate', appRest.downloadAGOLTemplate);

  app.post('/builder/rest/apps/upload', appRest.uploadApp);
  app.post('/builder/rest/apps/updateapp', appRest.updateApp);
  app.post('/builder/rest/apps/updateagoltemplateinapp', appRest.updateAgolTemplateInApp);
  app.post('/builder/rest/apps/createapp', appRest.createApp);
  app.post('/builder/rest/apps/removeapp', appRest.removeApp);
  app.post('/builder/rest/apps/duplicateapp', appRest.duplicateApp);
  app.post('/builder/rest/apps/:appId/saveconfig', appRest.saveAppConfig);
  app.post('/builder/rest/apps/:appId/copywidget', appRest.copyWidgetToApp);
  app.post('/builder/rest/apps/:appId/copytheme', appRest.copyThemeToApp);
  app.post('/builder/rest/apps/createZip',appRest.createZip);

  /************** theme rest *******************/
  app.get('/builder/rest/themes/getall', themeRest.getThemes);

  /************** widget rest *******************/
  app.get('/builder/rest/widgets/list', widgetRest.getAllWidgets);
  app.get('/builder/rest/widgets/search', widgetRest.searchWidgets);
  /************** setting rest ***********************/
  app.post('/builder/rest/settings/update', settingRest.update);
  app.get('/builder/rest/settings/getInfo', settingRest.getInfo);
}

function mapRepoUrl(type) {
  settingRest.getSettingValue(type + 'Repo', function(err, repoUrl) {
    if (err) {
      console.log(err);
      return;
    }
    app.use('/' + type + 'repo/', express.static(repoUrl));
  });
}

/*************************************************************/
function checkAndInitData(db) {
  db.collections(function(err, collections) {
    if (err) {
      console.log(err);
      return;
    }
    if (collections.length === 0) {
      //init for only one time
      initData(function() {
        //init when server is started every time
        repoRest.refreshRepo();

        /************** map repo url ***********************/
        mapRepoUrl('widget');
        mapRepoUrl('theme');
      });
    } else {
      repoRest.refreshRepo();
      mapRepoUrl('widget');
      mapRepoUrl('theme');
    }
  });
}

function initData(cb) {
  console.log('....init data.....');
  //insert setting parameters
  settingRest.initSettings(function(err) {
    if(err){
      console.log(err);
      return;
    }
    cb();
  });

  //insert templates
  db.collection('apps', function(err, collection) {
    // collection.insert({
    //   _id: 'predefinedApp1',
    //   name: 'Predefined App1',
    //   description: 'This is a predefined app',
    //   isTemplate: true,
    //   lastUpdated: appRest.getCurTime()
    // }, {
    //   safe: true
    // }, function(err, records) {
    //   console.log('create template: ' + records[0].name);
    //   i ++;
    //   if(i === 4){
    //     cb();
    //   }
    // });

    /*jshint unused: false*/
  });
}

String.prototype.startWith = function(str) {
  if (this.substr(0, str.length) === str) {
    return true;
  } else {
    return false;
  }
};

String.prototype.endWith = function(str) {
  if (this.substr(this.length - str.length, str.length) === str) {
    return true;
  } else {
    return false;
  }
};
