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
    'jimu/BaseWidgetSetting',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/dijit/SimpleTable',
    'dijit/form/Button',
    'dijit/form/ValidationTextBox',
    'dijit/form/Select'
  ],
  function(
    declare,
    BaseWidgetSetting,
    _WidgetsInTemplateMixin,
    Table) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

      baseClass: 'jimu-widget-histogramtimeslider-setting',

      startup: function() {
        this.inherited(arguments);
        if (!this.config.histogramTimeSlider) {
          this.config.histogramTimeSlider = {};
        }

        var fields = [{
          name: 'title',
          title: this.nls.title,
          type: 'text',
          'class': "title"
        }, {
          name: 'url',
          title: "Url",
          type: 'text',
          unique: true,
          editable: true
        }, {
          name: 'actions',
          title: this.nls.actions,
          type: 'actions',
          'class': "actions",
          actions: ['delete']
        }];
        var args = {
          fields: fields,
          selectable: false
        };
        this.displayFieldsTable = new Table(args);
        this.displayFieldsTable.placeAt(this.tableTimeSlider);
        this.displayFieldsTable.startup();
        this.initSelectLayer();
        this.setConfig(this.config);
      },

      setConfig: function(config) {
        this.config = config;
        this.displayFieldsTable.clear();
        this.dateFormat.set('value', config.histogramTimeSlider.dateFormat);
        this.mode.set('value', config.histogramTimeSlider.mode);
        this.timeInterval.set('value', config.histogramTimeSlider.timeInterval);
        if (config.histogramTimeSlider.layers) {
          var json = [];
          var len = config.histogramTimeSlider.layers.length;
          for (var i = 0; i < len; i++) {
            var layer = {
              url: config.histogramTimeSlider.layers[i].url,
              title: this.getLabel(config.histogramTimeSlider.layers[i].url)
            };
            json.push(layer);
          }
          this.displayFieldsTable.addRows(json);
        }
      },

      getLabel: function(url) {
        var len = this.selectLayer.options.length;
        for (var i = 0; i < len; i++) {
          if (url.toLowerCase() === this.selectLayer.options[i].value.toLowerCase()) {
            return this.selectLayer.options[i].label;
          }
        }
        return "Unknown";
      },

      initSelectLayer: function() {
        var label = "";
        var len = this.map.graphicsLayerIds.length;
        for (var i = 0; i < len; i++) {
          var layer = this.map.getLayer(this.map.graphicsLayerIds[i]);
          if (layer.type === "Feature Layer" && layer.url) {
            label = this.getOperationalLayerTitle(layer);
            this.selectLayer.addOption({
              label: label,
              value: layer.url
            });
          }
        }
      },

      getOperationalLayerTitle: function(layer) {
        var title = "";
        if (this.appConfig.map && this.appConfig.map.operationallayers) {
          var len = this.appConfig.map.operationallayers.length;
          for (var i = 0; i < len; i++) {
            if (this.appConfig.map.operationallayers[i].url.toLowerCase() === layer.url.toLowerCase()) {
              title = this.appConfig.map.operationallayers[i].label;
              break;
            }
          }
        }
        if (!title) {
          title = layer.name;
        }
        if (!title) {
          title = layer.url;
        }
        return title;
      },

      add: function() {
        var json = {};
        json.url = this.selectLayer.value;
        json.title = this.selectLayer.domNode.textContent;
        var status = this.displayFieldsTable.addRow(json);
        if (!status.success) {
          alert(status.errorMessage);
        }
      },

      getConfig: function() {
        this.config.histogramTimeSlider.dateFormat = this.dateFormat.value;
        this.config.histogramTimeSlider.mode = this.mode.value;
        this.config.histogramTimeSlider.timeInterval = this.timeInterval.value;
        var data = this.displayFieldsTable.getData();
        var json = [];
        var len = data.length;
        for (var i = 0; i < len; i++) {
          delete data[i].title;
          json.push(data[i]);
        }
        this.config.histogramTimeSlider.layers = json;
        return this.config;
      }


    });
  });