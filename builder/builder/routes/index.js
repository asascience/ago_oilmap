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

/* global db*/
/*
 * GET home page.
 */

var deferred = require('deferred');

exports.index = function(req, res) {
  var ret = {}, defs = [];
  defs.push(getSettingValue('appId'));
  defs.push(getSettingValue('portalUrl'));
  defs.push(getSettingValue('proxyUrl'));

  deferred.apply(this, defs).then(function(values) {
    ret.appId = values[0];
    ret.portalUrl = values[1];
    ret.proxyUrl = values[2];
    res.render('index', ret);
  }, function(err) {
    res.send(500, err);
  });
};

exports.configapp = function(req, res) {
  res.render('configapp');
};

function getSettingValue(name){
  var def = deferred();
  db.collection('settings', function(err, collection) {
    if (err) {
      def.reject(err);
      return;
    }
    collection.findOne({
      name: name
    }, function(err, doc) {
      if (err) {
        def.reject(err);
      } else {
        def.resolve(doc.value);
      }
    });
  });
  return def.promise;
}