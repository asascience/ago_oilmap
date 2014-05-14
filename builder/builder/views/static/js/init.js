var dojoConfig;
/*global apiUrl:true, weinreUrl, loadResources*/

if(apiUrl.substr(apiUrl.length - 1, apiUrl.length) !== '/'){
  apiUrl = apiUrl + '/';
}

/*jshint unused:false*/
dojoConfig = {
  parseOnLoad: false,
  async: true,
  tlmSiblingOfDojo: false,

  has: {
    'extend-esri': 1
  },
  packages : [{
    name : "builder",
    location : "/bstatic/js/app"
  },{
    name : "jimu",
    location : "/webapp/jimu.js"
  },{
    name : "ace",
    location : "/bstatic/js/libs/ace"
  }]
};

var loading = document.querySelector('#main-loading .loading');

var resources = [
  {type: 'css', url: apiUrl + 'js/dojo/dojo/resources/dojo.css'},
  {type: 'css', url: apiUrl + 'js/dojo/dijit/themes/claro/claro.css'},
  {type: 'css', url: apiUrl + 'js/esri/css/esri.css'},
  {type: 'js', url: apiUrl},
  {type: 'css', url: '/webapp/jimu.js/css/jimu.css'},
  {type: 'css', url: '/bstatic/css/builder.css'},
  {type: 'css', url: '/bstatic/css/config.css'}
];
var progress;
loadResources(resources, null, function(url, i){
  loading.setAttribute('title', url);
  if(!progress){
    progress = document.createElement('div');
    progress.setAttribute('class', 'loading-progress');
    loading.appendChild(progress);
  }
  progress.style.width = (((i - 1)/resources.length) * 100) + '%';
}, function(){
  require(['builder'], function(){
    progress.style.width = '100%';
  });
});
