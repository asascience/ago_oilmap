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
var path = require('path');
var fs = require("fs");
var JSZip = new require('jszip');

var pako = require("pako");
JSZip.compressions.DEFLATE.compress = function (input) {
  return pako.deflateRaw(input);
};

/* global Buffer */
exports.zipFolderSync = function(folderPath, zipFile) {
  var zip = new JSZip();
  folderPath = path.normalize(folderPath);
  visitFolderFiles(folderPath, function(filePath, fileName, isDirectory){
    if(isDirectory){
      zip.folder(filePath.substr(folderPath.length, filePath.length));
    }else{
      var fileContent;
      fileContent = fs.readFileSync(filePath);
      zip.file(filePath.substr(folderPath.length, filePath.length), fileContent);
    }
  });

  var data = zip.generate({type: 'nodebuffer', compression: 'DEFLATE'});
  fs.writeFileSync(zipFile, data, 'binary');
};

exports.unZipToFolderSync = function(zipFile, folderPath) {
  var zip = new JSZip(fs.readFileSync(zipFile));
  if(!fs.existsSync(folderPath)){
    fs.mkdirSync(folderPath);
  }
  for(var file in zip.files){
    var fileObject = zip.files[file];
    if(fileObject.options.dir){
      fs.mkdirSync(path.join(folderPath, fileObject.name));
    }else{
      fs.writeFileSync(path.join(folderPath, fileObject.name), new Buffer(fileObject._data.getContent()), 'binary');
    }
  }
};

exports.visitFolderFiles = visitFolderFiles;
exports.visitSubFolders = visitSubFolders;
exports.visitObject = visitObject;
exports.saveBase64ToImgSync = saveBase64ToImgSync;
exports.findMaxFileIndexInFolder = findMaxFileIndexInFolder;

function saveBase64ToImgSync(filePath, str) {
  //if the base64 image format is not same as the file extension, modify the file name
  if(!/^data:image\/.*;base64,/.test(str)){
    throw Error('Bad base64 code format');
  }
  var fileFormat = str.match(/^data:image\/(.*);base64,/)[1];
  var base64Data = str.replace(/^data:image\/.*;base64,/, "");

  var i = filePath.lastIndexOf('.');
  filePath = filePath.substr(0, i + 1) + fileFormat;
  fs.writeFileSync(filePath, base64Data, 'base64');
  return filePath;
}

function visitObject(o, cb){
  for(var p in o){
    if(o[p] instanceof Array){
      visitArray(o[p], cb);
    }else if(typeof o[p] === 'object'){
      visitObject(o[p], cb);
    }else{
      cb(o, p);
    }
  }
}

function visitArray(a, cb){
  a.forEach(function(item, i){
    if(item instanceof Array){
      visitArray(item, cb);
    }else if(typeof item === 'object'){
      visitObject(item, cb);
    }else{
      cb(a, i);
    }
  });
}

//visit all of the folder's file and its sub-folders.
//if callback function return true, stop visit.
function visitFolderFiles(folderPath, cb) {
  var files = fs.readdirSync(folderPath);
  files.forEach(function(fileName){
    var filePath = path.normalize(folderPath + '/' + fileName);

    if(fs.statSync(filePath).isDirectory()){
      if(!cb(filePath, fileName, true)){
        visitFolderFiles(filePath, cb);
      }
    }else{
      cb(filePath, fileName, false);
    }
  });
}

//visit folder's sub-folders
function visitSubFolders(folderPath, cb) {
  var files = fs.readdirSync(folderPath);
  files.forEach(function(fileName){
    var filePath = path.normalize(folderPath + '/' + fileName);

    if(fs.statSync(filePath).isDirectory()){
      if(!cb(filePath, fileName, fs.readdirSync(filePath))){
        visitSubFolders(filePath, cb);
      }
    }
  });
}

function findMaxFileIndexInFolder(folderPath, prefix){
  var files = fs.readdirSync(folderPath), max = -1;

  files.forEach(function(fileName){
    if(fileName.substring(0, fileName.lastIndexOf('.')) === prefix){
      max = 0;
    }else if(fileName.startWith(prefix)){
      var index = fileName.substring((prefix + '_').length, fileName.lastIndexOf('.'));
      index = parseInt(index, 10);
      if(!Number.isNaN(index)){
        max = Math.max(max, index);
      }
    }
  });

  return max;
}