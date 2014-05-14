///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidget',
    "esri/InfoTemplate",
    "esri/layers/FeatureLayer",
    "esri/dijit/HistogramTimeSlider",
    "dojo/dom-construct",
    'dojo/on',
    'dojo/_base/lang',
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style"
  ],
  function(
    declare,
    _WidgetsInTemplateMixin,
    BaseWidget,
    InfoTemplate,
    FeatureLayer,
    HistogramTimeSlider,
    domConstruct,
    on,
    lang,
    domAttr,
    domClass,
    domStyle) {
    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {

      name: 'HistogramTimeSlider',
      baseClass: 'jimu-widget-histogramtimeslider',
      eventUpdateEnd: [],
      timeSlider: null,
      timeSliderDiv: null,
      loaded: false,

      onOpen: function() {
        this.inherited(arguments);
        if (!this.timeSliderDiv) {
          this.initDiv();
        }
        if (this.timeSlider) {
          domStyle.set(this.timeSlider.domNode, "display", "");
        }
        if (!this.loaded) {
          this.loadLayer();
        }
      },
      onClose: function() {
        if (this.timeSlider) {
          domStyle.set(this.timeSlider.domNode, "display", "none");
        }
      },

      loadLayer: function() {
        this.loaded = true;
        var json = this.config.histogramTimeSlider;
        var len = json.layers.length;
        for (var i = 0; i < len; i++) {
          var layer = this.getLayerFromMap(json.layers[i].url);
          if (!layer) {
            if(!json.layers[i].options){
              json.layers[i].options = {};
            }
            json.layers[i].options.mode = FeatureLayer.MODE_SNAPSHOT;
            if (json.layers[i].options.infoTemplate) {
              json.layers[i].options.infoTemplate = new InfoTemplate(json.layers[i].options.infoTemplate);
            }
            layer = new FeatureLayer(json.layers[i].url, json.layers[i].options);
            if (json.layers[i].options&&json.layers[i].options.infoTemplate) {
              layer.setInfoTemplate(new InfoTemplate(json.layers[i].options.infoTemplate));
            }
            var eventUpdate = this.own(on(layer, "update-end", lang.hitch(this, this.onUpdateEnd, i)));
            this.map.addLayer(layer);
            json.layers[i] = layer;
            this.addUpdateEvent(i, eventUpdate);
          } else {
            json.layers[i] = layer;
            if (json.layers[i].infoTemplate) {
              layer.setInfoTemplate(new InfoTemplate(json.layers[i].infoTemplate));
            }
            if (layer.mode !== FeatureLayer.MODE_SNAPSHOT) {
              layer.attr("mode", FeatureLayer.MODE_SNAPSHOT);
              layer.refresh();
              var eventUpdate2 = this.own(on(layer, "update-end", lang.hitch(this, this.onUpdateEnd, i)));
              this.addUpdateEvent(i, eventUpdate2);
            } else {
              this.onUpdateEnd(i);
            }
          }
        }
      },

      addUpdateEvent: function(i, eventUpdate) {
        this.eventUpdateEnd.push({
          id: i,
          event: eventUpdate
        });
      },

      getLayerFromMap: function(url) {
        var ids = this.map.graphicsLayerIds;
        var len = ids.length;
        for (var i = 0; i < len; i++) {
          var layer = this.map.getLayer(ids[i]);
          if (layer.url === url) {
            return layer;
          }
        }
        return null;
      },

      onUpdateEnd: function(index) {
        var len = this.eventUpdateEnd.length;
        for (var i = 0; i < len; i++) {
          if (this.eventUpdateEnd[i].id === index) {
            if (!this.eventUpdateEnd[i].event.length) {
              this.eventUpdateEnd[i].event.remove();
            } else {
              for (var j = 0; j < this.eventUpdateEnd[i].event.length; j++) {
                this.eventUpdateEnd[i].event[j].remove();
              }
            }
          }
        }
        var sliderParams = this.config.histogramTimeSlider;
        this.timeSliderDiv.innerHTML = "";
        this.timeSlider = new HistogramTimeSlider(sliderParams, this.timeSliderDiv);
        this.map.setTimeSlider(this.timeSlider);
      },

      initDiv: function() {
        this.timeSliderDiv = domConstruct.create("div");
        domAttr.set(this.timeSliderDiv, "id", "histogramTimeSliderDiv");
        domClass.add(this.timeSliderDiv, "esriTimeSlider");
        domConstruct.place(this.timeSliderDiv, this.domNode);
        this.timeSliderDiv.innerHTML = "Loading......";
      }

    });
    return clazz;
  });