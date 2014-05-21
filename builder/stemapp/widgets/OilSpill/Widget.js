define([
   'jimu/BaseWidget',
   'dojo/_base/declare', 
   'dojo/_base/lang', 
   'dojo/_base/event',
   'dojo/_base/Color',
   'dojo/_base/html', 
   'dojo/_base/json',
   'dojo/dom', 
   'dojo/dom-construct',
   'dojo/dom-class',
   'dojo/dom-style',
   'dojo/on',
   'dojo/parser', 
   'dijit/form/DateTextBox',
   'dijit/form/TimeTextBox',
   'dijit/form/TextBox',
   'dijit/form/HorizontalSlider',
   'dijit/form/NumberSpinner',
   'dijit/form/NumberTextBox',
   'dijit/form/Select',
   'dijit/registry',
   'esri/arcgis/utils',
   'esri/geometry/webMercatorUtils',
   'esri/graphic',
   'esri/graphicsUtils',
   'esri/layers/GraphicsLayer',
   'esri/request',
   'esri/symbols/SimpleMarkerSymbol',
   'esri/symbols/SimpleLineSymbol',
   'esri/symbols/PictureMarkerSymbol',
   'esri/tasks/query',
   'esri/TimeExtent',
   "esri/geometry/Point",
   'dijit/Dialog',
   'esri/InfoTemplate'
], function(
   BaseWidget, 
   declare, 
   lang, 
   dojoEvent,
   Color,
   html, 
   dojoJson,
   dom, 
   domConstruct,
   domClass,
   domStyle,
   on, 
   parser,
   DateTextBox,
   TimeTextBox,
   TextBox,
   HorizontalSlider,
   NumberSpinner,
   NumberTextBox,
   Select,
   registry,
   arcgisUtils,
   webMercatorUtils,
   Graphic,
   graphicsUtils,
   GraphicsLayer,
   esriRequest,
   SimpleMarkerSymbol,
   SimpleLineSymbol,
   PictureMarkerSymbol,
   Query,
   TimeExtent,
   Point,
   Dialog,
   InfoTemplate
) {
   var clazz = declare([BaseWidget], {

      name : 'OilSpill',
      baseClass : 'jimu-widget-oilspill',
      opLayers : null,
      toolMode : false,
      timeSliderProps : null,
      totalHours : 0,
      timeSlice : 1,
      sliderH : null,
      counter : 0,
      playing : false,
      timer: null,
        
      spillParams : {
         date: new Date(),
         duration: 24,
         oilType: "DIESEL",
         volume: 1000,
         units: 1,
         location: null
      },
        
      lyrWinds : null,
      lyrCurrents : null,
      lyrThickness : null,
      lyrParticles : null,
      lyrTrajectory : null,
        
      graWinds : null,
      graCurrents : null,
      graParticles : null,
      graTrajectory: null,
        
      postCreate: function() {
         //console.log("postCreate");
         this._createUI();
         this.graWinds = new GraphicsLayer({id: "Winds"});
         this.map.addLayer(this.graWinds);
         this.graCurrents = new GraphicsLayer({id: "Currents"});
         this.map.addLayer(this.graCurrents);
         this.graParticles = new GraphicsLayer({id: "Particles"});
         this.map.addLayer(this.graParticles);
         this.graTrajectory = new GraphicsLayer({id: "Trajectory"});
         this.map.addLayer(this.graTrajectory);
         on(this.map, "click", lang.hitch(this, this.mapClick));
      },

      startup : function() {
         esriConfig.defaults.io.timeout = 6000000;
         this.inherited(arguments);
         this._processMapInfo(this.map.itemInfo);
         this.own(on(this.map, "mouse-move", lang.hitch(this, this.onMouseMove)));
      },
      onMouseMove: function(evt) {
        
        var point = new Point(evt.mapPoint.x, evt.mapPoint.y, this.map.spatialReference);
        var normalizedPoint = point.normalize();
        dom.byId("latlongText").innerHTML = "Lon: " +normalizedPoint.getLongitude().toFixed(4) + ":&nbsp;" + " Lat: " + normalizedPoint.getLatitude().toFixed(4);
      },
      
      _resetMapGraphics : function() {
         this.graWinds.clear();
         this.graCurrents.clear();
         this.graParticles.clear();
         this.graTrajectory.clear();
      },
      
      _processMapInfo : function(obj) {
         this._resetMapGraphics();
         if (obj.itemData) {
            this.opLayers = obj.itemData.operationalLayers;
            if (obj.itemData.widgets && obj.itemData.widgets.timeSlider) {
               this.timeSliderProps = obj.itemData.widgets.timeSlider.properties;
            }
            for (var i=0; i<this.opLayers.length; i++) {
               var lyrInfo = this.opLayers[i];
               if (lyrInfo.title == this.config.lyrTrajectory) {
                  this.lyrTrajectory = lyrInfo.layerObject;
                  this.lyrTrajectory.setVisibility(false);
               }
               if (lyrInfo.title == this.config.lyrParticles) {
                  this.lyrParticles = lyrInfo.layerObject;
                  this.lyrParticles.setVisibility(false);
               }
               if (lyrInfo.title == this.config.lyrThickness) {
                  this.lyrThickness = lyrInfo.layerObject;
                  this.lyrThickness.setVisibility(false);
               }
               if (lyrInfo.title == this.config.lyrCurrents) {
                  this.lyrCurrents = lyrInfo.layerObject;
                  this.lyrCurrents.setVisibility(false);
               }
               if (lyrInfo.title == this.config.lyrWinds) {
                  this.lyrWinds = lyrInfo.layerObject;
                  this.lyrWinds.setVisibility(false);
               }
            }
            this._createTimeSlider();
         }
         console.log("TimeSlider", this.timeSliderProps);
      },
        
      _createUI : function() {
         
         domConstruct.empty(this.domNode);
            
         var bodyColor = Color.fromString(this.config.color || "#ff0000");
         var darkColor = Color.fromString("#000000");
         var titleColor = Color.blendColors(bodyColor, darkColor, .3);
         
         //Spill Widget Titles
         var wContainer = domConstruct.create('div', {
             class: 'widgetContainer rounded shadow'
         }, this.domNode);
         domStyle.set(wContainer, "backgroundColor", bodyColor.toHex());
         var wTitle = domConstruct.create('div', {
             class: 'widgetTitle',
             innerHTML: "Oil Spill Analysis"
         }, wContainer);
         var wSubTitle = domConstruct.create('div', {
             class: 'widgetsubTitle',
             innerHTML: "Provided by RPS ASA"
         }, wContainer);
         //latlong
         var latlongTitle = domConstruct.create('div', {
             id: 'latlongText',
             innerHTML: "",
             style:'padding-left:430px;position: absolute;top:19px'
         }, wContainer);

         domStyle.set(wTitle, "backgroundColor", titleColor.toHex());
         var wBody = domConstruct.create('div', {
             class: 'widgetBody'
         }, wContainer);
         var wForm = domConstruct.create('div', {
             class: 'widgetForm'
         }, wBody);
         
         //Spill Name text
         var wSpillTitle = domConstruct.create('div', {
            id: "spillNameDiv"
         }, wContainer);
         var spillName = new TextBox({
              value:"ScenarioName",
              id: "spillName",
            class: 'widgetspillName'
          }, wSpillTitle );

         // SPILL DATE
         var colDate = domConstruct.create('div', {
            class: 'widgetCol break',
            innerHTML: "SPILL DATE"
         }, wForm);
         var divDate = domConstruct.create('div', {
            class: 'widgetColContent'
         }, colDate);
         var dt = new Date();
         var maxD = new Date();
         var minD = new Date();

         minD.setDate(dt.getDate() -31);
         maxD.setDate(dt.getDate() +2);
         var spillDt = new DateTextBox({
              value: this._toCalDate(dt),
              id: "spillDate",
              style: "width:100px",
              constraints:{min:this._toCalDate(minD), max:this._toCalDate(maxD)}
          }, divDate );

         // SPILL TIME
         var colTime = domConstruct.create('div', {
            class: 'widgetCol break',
            innerHTML: "TIME (gmt)"
         }, wForm);
         var divTime = domConstruct.create('div', {
            class: 'widgetColContent'
         }, colTime);
         //var dt = new Date();
         //dt.setDate(dt.getDate() -7);
         var spillDt = new TimeTextBox({
              value:"T15:00:00",
              id: "spillTime",
              style: "width:100px;",

          }, divTime );
            
         // DURATION
         var colDur = domConstruct.create('div', {
            class: 'widgetCol break',
            innerHTML: "DURATION (hrs)"
         }, wForm);
         var divDur = domConstruct.create('div', {
            class: 'widgetColContent'
         }, colDur);
         var spillDur = new NumberSpinner({
              value: 24,
              smallDelta: 1,
              constraints: { min:1, max:48, places:0 },
              id: "spillDur",
              style: "width:65px"
          }, divDur );
            
         // OIL TYPE
         var colOilType = domConstruct.create('div', {
            class: 'widgetCol break',
            innerHTML: "OIL TYPE"
         }, wForm);
         var divOilType = domConstruct.create('div', {
            class: 'widgetColContent'
         }, colOilType);
         var spillType = new Select({
           options: [
               { label: "Diesel", value: "DIESEL", selected: true },
               { label: "Light Crude", value: "LIGHT%20CRUDE%20OIL" },
               { label: "Medium Crude", value: "MEDIUM%20CRUDE%20OIL" },
               { label: "Heavy Crude", value: "HEAVY%20CRUDE%20OIL" }
           ],
           id: "spillType",
           style: "width:105px"
         }, divOilType);
            
         // VOLUME
         var colVol = domConstruct.create('div', {
            class: 'widgetCol break',
            innerHTML: "VOLUME"
         }, wForm);
         var divVol = domConstruct.create('div', {
            class: 'widgetColContent'
         }, colVol);
         var spillVol = new NumberSpinner({
              value: 1000,
              smallDelta: 1,
              constraints: { min:100, max:1000000, places:0 },
              id: "spillVol",
              style: "width:103px"
         }, divVol );
         
         // UNITS
         var colUnits = domConstruct.create('div', {
            class: 'widgetCol',
            innerHTML: "UNITS<br/>"
         }, wForm);
         var divUnits = domConstruct.create('div', {
            class: 'widgetColContent'
         }, colUnits);
         var spillUnits = new Select({
           options: [
               { label: "Liters", value: "1", selected: true  },
               { label: "Gallons", value: "2" },
               { label: "Cubic Meters", value: "3" },
               { label: "Tonnes", value: "4" },
               { label: "Barrels", value: "5" },
               { label: "Pounds", value: "6" },
               { label: "Kilograms", value: "7" }
           ],
           id: "spillUnits",
           style: "width:100px"
         }, divUnits);
         
         // BOTTOM
         var wBottom = domConstruct.create('div', {
             id: 'divBottom',
             class: 'widgetBottom'
         }, wBody);
         var divLocate = domConstruct.create('div', {
            id: 'divLocate',
            class: 'widgetLocate',
            innerHTML: 'LOCATE'
         }, wBottom);
         on(divLocate, "click", lang.hitch(this, this.toggleLocate));
         
         // TIME
         var wTime = domConstruct.create('div', {
             id: 'divTime',
             class: 'widgetTime'
         }, wBottom);
         var divPlay = domConstruct.create('div', {
            id: 'divPlay',
            class: 'widgetPlay'
         }, wTime);
         on(divPlay, "click", lang.hitch(this, this.togglePlay));
         var divTime = domConstruct.create('div', {
            class: 'widgetTimeContent'
         }, wTime);
         var divDate = domConstruct.create('div', {
            id: 'divDate',
            class: 'widgetDate'
         }, divTime);
         var wSlider = domConstruct.create('div', {
            class: 'widgetSlider'
         }, divTime);
         var divSlider = domConstruct.create('div', {
            id: 'divSlider'
         }, wSlider);
         
         // PROCESSING
         var wProcessing = domConstruct.create('div', {
             id: 'divProcessing',
             class: 'widgetProcessing',
             innerHTML: 'Running Oil Spill Model <img src="widgets/OilSpill/images/loader.gif">'
         }, wBody);
              
      },
      
      _createTimeSlider: function() {
         
         if (this.sliderH) {
            registry.byId('divSlider').destroy(true);
            domConstruct.empty(dom.byId('divSlider'));
         }
            
         if (this.timeSliderProps) {
            this.counter = 0;
            this.totalHours = (this.timeSliderProps.endTime - this.timeSliderProps.startTime) / (60*60*1000);
            this.sliderH = new HorizontalSlider({
               value: 0,
               minimum: 0,
               maximum: this.totalHours,
               discreteValues: this.totalHours+1,
               intermediateChanges: false,
               showButtons: false
            }, 'divSlider');
            this.sliderH.startup();
            this.sliderH.on("change", lang.hitch(this, this._sliderChange));
            this.toggleControls(false);
            this.togglePlay();
          }
          
      },
      
      _sliderChange: function() {
         this._updateCounter(this.sliderH.value);
      },
      
      _advanceTimeExt: function() {
         var value = this.counter+1;
         if (value > this.totalHours) {
            value = 0;
            this.graParticles.clear();
            this.graCurrents.clear();
            this.graWinds.clear();
            dom.byId("divDate").innerHTML  = "";
            if (this.playing)
               this.togglePlay();
         }
         this.sliderH.setValue(value);
      },
      
      _updateCounter: function(value) {
         if (value > this.totalHours) {
            value = 0;
         }
         //if (value > 0) {
            var startT = this.timeSliderProps.startTime + (value)*60*60*1000;
            var endT = startT + 1000;
            var sliceExt = new TimeExtent();
            sliceExt.startTime = new Date(startT);
            sliceExt.endTime = new Date(endT);
            if (this.counter+1 == value) {
               this._queryOilSpillFeatures(sliceExt, sliceExt);
            } else {
               this.graParticles.clear();
               var particleExt = new TimeExtent();
               particleExt.startTime = new Date(this.timeSliderProps.startTime);
               particleExt.endTime = new Date(endT);
               this._queryOilSpillFeatures(sliceExt, particleExt);
            }
            dom.byId("divDate").innerHTML  = new Date(endT);
         //}
         this.counter = value;
      },
      
      togglePlay: function() {
         if (this.playing) {
            if (this.timer)
               clearInterval(this.timer);
            domClass.remove("divPlay", "widgetPause");
         } else {
            this.map.graphics.clear();
            this.timer = setInterval(lang.hitch(this, this._advanceTimeExt), 2000);
            domClass.add("divPlay", "widgetPause");
         }
         this.playing = !this.playing;
      },
      
      toggleLocate: function() {
         if (this.toolMode) {
            domClass.remove("divLocate", "widgetLocateOn");
         } else {
            domClass.add("divLocate", "widgetLocateOn");
         }
         this.toolMode = !this.toolMode;
      },
      
      toggleControls: function(processing) {
         if (processing) {
            domStyle.set("divBottom", "display", "none");
            domStyle.set("divTime", "display", "none");
            domStyle.set("divProcessing", "display", "block");
         } else {
            domStyle.set("divBottom", "display", "block");
            domStyle.set("divTime", "display", "block");
            domStyle.set("divProcessing", "display", "none");
         }
      },
      
      mapClick: function(event) {
         if (this.toolMode) {
            
            this.toggleControls(true);
            
            this.spillParams.date = registry.byId("spillDate").value;
            this.spillParams.duration = registry.byId("spillDur").value;
            this.spillParams.oilType = registry.byId("spillType").value;
            this.spillParams.volume = registry.byId("spillVol").value;
            this.spillParams.units = registry.byId("spillUnits").value;
            this.spillParams.location = event.mapPoint;
            this.toggleLocate();
            
            if (this.playing)
               this.togglePlay();
               
            var pms = new PictureMarkerSymbol("widgets/OilSpill/images/spillsite.png", 18, 18);
            var gra = new Graphic(event.mapPoint, pms, {});
            this.map.graphics.add(gra);
            
            var pt = webMercatorUtils.webMercatorToGeographic(event.mapPoint);
            var url = this.config.client_url;

            url += "&CaseName=" + registry.byId("spillName").value;
            url += "&StartDate=" + this._toModelDate(this.spillParams.date);
            url += "&simLength=" + this.spillParams.duration;
            url += "&IncLat=" + pt.y;
            url += "&IncLon=" + pt.x;
            url += "&OilType=" + this.spillParams.oilType;
            url += "&OilUnits=" + this.spillParams.units;
            url += "&Volume=" + this.spillParams.volume;
            
            var requestHandle = esriRequest({
               "url": url,
               "handleAs": "json",
               "content": null
            });
            requestHandle.then(lang.hitch(this, this.requestSucceeded), this.requestFailed);
         }
      },
      
      requestSucceeded: function(response, io) {
         var me = this;
         var deferred = arcgisUtils.createMap(response.id, me.map.id);
         deferred.then(function(value){
            //this.toggleControls(false);
            me._processMapInfo(value.itemInfo);
         });
      },
        
      requestFailed: function(error, io) {
         //console.log(dojoJson.toJson(error, true));
         //this.toggleControls();
         var myDialog = new Dialog({
            title: "Alert",
            content: "An error occurred with the model.  Please try check the location and try again or contact the application Administrator.",
            style: "width: 300px"
         });
         myDialog.show();
         domStyle.set("divProcessing", "display", "none");
         domStyle.set("divBottom", "display", "block");
         domStyle.set("divTime", "display", "none");
      },
        
      _toCalDate: function(dt) {
         var y = dt.getFullYear();
         var m = (dt.getMonth()+1).toString();
         if (m.length == 1)
            m = "0" + m;
         var d = (dt.getDate()).toString();
         if (d.length == 1)
            d = "0" + d;
         var dtStr  = y + "-" + m + "-" + d;
         return dtStr;
      },

      _toCalTime: function(dt) {
         var h = (dt.getHours()).toString();
         if (h.length == 1)
            h = "0" + h;
         var m = (dt.getMinutes()).toString();
         if (m.length == 1)
            m = "0" + m;
         var dtStr  = "T"+h + ":" + m + ":00";
         return dtStr;
      },
      
      _toModelDate: function(dt) {
         var y = dt.getFullYear();
         var m = (dt.getMonth()+1).toString();
         if (m.length == 1)
            m = "0" + m;
         var d = (dt.getDate()).toString();
         if (d.length == 1)
            d = "0" + d;

         var dtStr  = y + m + d + this._toCalTime(registry.byId("spillTime").value);
         return dtStr;
      },
      
      
      _queryOilSpillFeatures : function(sliceExt, particleExt) {
         var query = new Query();
         query.returnGeometry = true;
         query.where = "1=1";
         query.timeExtent = sliceExt;
         
         var queryP = new Query();
         queryP.returnGeometry = true;
         queryP.where = "1=1";
         queryP.timeExtent = particleExt;
         
         var me = this;
         
         // TRAJECTORY
         if (me.graTrajectory.graphics.length == 0) {
            this.lyrTrajectory.queryFeatures(queryP, function(featureSet){
                var graphics = featureSet.features;
                //console.log("Trajectory", graphics.length);
                for (var i=0; i<graphics.length; i++) {
                    var gra = graphics[i];
                    if (i==0) {
                       var ext = gra.geometry.getExtent();
                       me.map.centerAndZoom(ext.getCenter(), 9);
                    }
                    var graT = new Graphic(gra.geometry);
                    var sls = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 0]), 1);
                    graT.setSymbol(sls);
                    me.graTrajectory.add(graT);
                }
            });
         }
         
         
         // PARTICLES
         this.lyrParticles.queryFeatures(queryP, function(featureSet){
             var graphics = featureSet.features;
             //console.log("Particles", graphics.length);
             for (var i=0; i<graphics.length; i++) {
                 var gra = graphics[i];
                 var hours = gra.attributes.HOURS;
                 var hex = new Color.fromHex(me.config.colors[parseInt(hours/4)]);
                 var rgb = hex.toRgb();
                 var color = new Color([rgb[0], rgb[1], rgb[2], 0.5]);
                 var sls = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255, 0]), 1);
                 var sms = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 4, sls, color);
                 gra.setSymbol(sms);
                 me.graParticles.add(gra);
             }
         });
         
         // CURRENTS
         // me.graCurrents.clear();
         this.lyrCurrents.queryFeatures(query, function(featureSet){
             var graphics = featureSet.features;
             //console.log("Currents", graphics.length);
             //var repeat = 0;
             for (var i=0; i<graphics.length; i++) {
                 var gra = graphics[i];
                 var value = gra.attributes.ncells;
                 var speed = gra.attributes.Speed;
                 if (speed <= 0.1)
                  speed = 0.1;
                 var size = parseInt(15 * Math.round(speed*10) / 5);
                 var dir = gra.attributes.Direction;
                 var pms = new PictureMarkerSymbol("widgets/OilSpill/images/current.png", size, size);
                 pms.setAngle(dir);
                 var oldGra = me._getFeature(me.graCurrents, "ncells", value);
                 var infoTemplate = new InfoTemplate("Water Speed",
                  "Speed:  "+ speed+"  m/s");
                 gra.setInfoTemplate(infoTemplate);
                 if (oldGra) {
                    //repeat +=1;
                    oldGra.setInfoTemplate(infoTemplate);
                    oldGra.setSymbol(pms);
                 } else {
                     gra.setSymbol(pms);
                     me.graCurrents.add(gra);
                 }
             }
             //console.log("Currents Repeat", repeat);
         });
         
         // WINDS
         //me.graWinds.clear();
         this.lyrWinds.queryFeatures(query, function(featureSet){
             var graphics = featureSet.features;
             //console.log("Winds", graphics.length);
             for (var i=0; i<graphics.length; i++) {
                 var gra = graphics[i];
                 var value = gra.attributes.ncells;
                 var speed = 5 * Math.round(gra.attributes.Speed/5);
                 var size = 40;
                 var dir = gra.attributes.Direction;
                 var pms = new PictureMarkerSymbol("widgets/OilSpill/images/" + speed +".png", size, size);
                 pms.setAngle(dir);
                 var oldGra = me._getFeature(me.graWinds, "ncells", value);
                 var infoTemplate = new InfoTemplate("Wind Speed",
                  "Speed:  "+ speed+"  Knots");
                 gra.setInfoTemplate(infoTemplate);

                 if (oldGra) {
                    oldGra.setInfoTemplate(infoTemplate);
                    oldGra.setSymbol(pms);
                 } else {
                     gra.setSymbol(pms);
                     me.graWinds.add(gra);
                 }
             }
         });
         
      },
        
      _getFeature : function(lyr, fld, value) {
         var graphics = lyr.graphics;
         for (var i=0; i<graphics.length; i++) {
            var gra = graphics[i];
            if (gra.attributes[fld] == value)
               return gra;
         }
         return null;
      }
      
   });

   clazz.inPanel = false;
   clazz.hasLocale = false;
   clazz.hasUIFile = true;
   return clazz;
}); 