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


var request = require('request');

exports.proxyRequest = function() {
  return function(req, res, next) {
    var url;
    if (req.url.indexOf('?') > -1) {
      url = req.url.substr(2);
    } else {
      return next();
    }
    if (req.method === 'GET') {
      request.get(url).pipe(res);
    } else if (req.method === 'POST') {
      request({
        method: 'POST',
        url: url,
        form: req.body
      }).pipe(res);
    } else {
      res.send('support get and post only.');
    }
  };
};