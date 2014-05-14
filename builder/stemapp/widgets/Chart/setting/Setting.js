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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/_base/query',
  'dojo/_base/Color',
  'dojo/json',
  'dojo/on',
  'dojo/topic',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidgetSetting',
  'jimu/dijit/TabContainer',
  'jimu/dijit/SimpleTable',
  'jimu/dijit/ColorPicker',
  './AddUrlChart',
  './AddLayerChart',
  './EditUrlChart',
  './EditFeatureCollectionChart',
  'dijit/form/NumberTextBox',
  'dijit/form/TextBox',
  'dijit/form/Select',
  'esri/request'
],
function(declare, lang, array, html, query, Color, json, on, topic, _WidgetsInTemplateMixin,
  BaseWidgetSetting, TabContainer, SimpleTable, ColorPicker, AddUrlChart, AddLayerChart,
  EditUrlChart, EditFeatureCollectionChart, NumberTextBox, TextBox, Select, esriRequest) {
  return declare([BaseWidgetSetting,_WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-chart-setting',
    tabContainer:null,
    layerInfos:null,//array,{uniqueId,name,displayField,fields,/*url*/,/*featureCollection*/}

    postCreate:function(){
      this.inherited(arguments);
      this.layerInfos = [];
      this._bindEvents();
      this._getLayerInfos();
      this._initTab();
      this.setConfig(this.config);
    },

    destroy:function(){
      if(this.chartsTable){
        this.chartsTable.destroy();
        this.chartsTable = null;
      }
      if(this.highLightColor){
        this.highLightColor.destroy();
        this.highLightColor = null;
      }
      this.inherited(arguments);
    },

    setConfig:function(config){
      this._showChartsSection();
      this.config = config;
      if(this.config){
        this._initChartsTable();
        if(this.config.highLightColor){
          var newColor = new Color(this.config.highLightColor);
          this.highLightColor.setColor(newColor);
        }
      }
    },

    getConfig:function(){
      var config = {
        layers:[]
      };
      var allSingleCharts = this._getAllSingleCharts();
      for(var i=0;i<allSingleCharts.length;i++){
        var sc = allSingleCharts[i];
        var layerConfig = sc.getConfig();
        if(!layerConfig){
          return false;
        }
        var copy = lang.mixin({},layerConfig);
        config.layers.push(copy);
      }
      var color = this.highLightColor.getColor();
      config.highLightColor = color.toHex();
      return config;
    },

    _bindEvents:function(){
      this.own(on(this.btnAddUrlSource,'click',lang.hitch(this,function(){
        var tr = this._createAddUrlChart();
        if (tr) {
          this._showSingleChartSection(tr.dijit);
        }
      })));
      this.own(on(this.btnAddLayerSource,'click',lang.hitch(this,function(){
        if(this.layerInfos.length === 0){
          return;
        }
        var tr = this._createAddLayerChart();
        if(tr){
          this._showSingleChartSection(tr.dijit);
        }
      })));
      this.own(on(this.chartsTable,'Edit',lang.hitch(this,function(tr){
        var singleChart = tr.dijit;
        if(singleChart){
          if(singleChart instanceof EditUrlChart || singleChart instanceof EditFeatureCollectionChart){
            this._showSingleChartSection(singleChart);
          }
        }
      })));
      this.own(on(this.chartsTable,'Delete',lang.hitch(this,function(tr){
        var singleChart = tr.dijit;
        if(singleChart){
          singleChart.destroy();
        }
        delete tr.dijit;
      })));
      this.own(on(this.chartsTable,'Clear',lang.hitch(this,function(trs){
        array.forEach(trs,lang.hitch(this,function(tr){
          var singleChart = tr.dijit;
          if(singleChart){
            singleChart.destroy();
          }
          delete tr.dijit;
        }));
      })));
    },

    _createUniqueId:function(){
      var str = Math.random().toString();
      return str.slice(2,str.length);
    },

    _getLayerInfoByUniqueId:function(uniqueId){
      for(var i=0;i<this.layerInfos.length;i++){
        var layerInfo = this.layerInfos[i];
        if(layerInfo.uniqueId === uniqueId){
          return layerInfo;
        }
      }
      return null;
    },

    _getLayerInfos:function(){
      this.layerInfos = [];
      if(!this.map){
        return;
      }
      array.forEach(this.map.layerIds, lang.hitch(this, function(layerId, index) {
        if (index !== 0) {
          var layer = this.map.getLayer(layerId);
          //var layerName = this._getLayerNameFromWebMapResponse(layer);
          array.forEach(layer.layerInfos, lang.hitch(this, function(layerInfo, i) {
            var url = layer.url + '/' + i;
            var def = esriRequest({
              url: url,
              content: {
                f: 'json'
              },
              handleAs: 'json',
              callbackParamName: "callback"
            },{
              useProxy:false
            });
            def.then(lang.hitch(this, function(response) {
              if(!this.domNode){
                return;
              }
              if (response.capabilities && response.capabilities.indexOf('Query') >= 0) {
                if(response.fields.length === 0){
                  return;
                }
                var name = response.name;//layerName||response.name;
                var a = {
                  uniqueId:this._createUniqueId(),
                  name: name,
                  displayField: response.displayField,
                  fields: response.fields,
                  url:url,
                  featureCollection:null
                };
                this.layerInfos.push(a);
                this._updateBtnAddLayerSource();
                topic.publish('chartSettingPageLayerInfo', a);
              }
            }), lang.hitch(this, function(error) {
              console.error(error);
            }));
          }));
        }
      }));
      array.forEach(this.map.graphicsLayerIds, lang.hitch(this, function(glId) {
        var layer = this.map.getLayer(glId);
        var layerName = this._getLayerNameFromWebMapResponse(layer);
        if (layer.declaredClass === 'esri.layers.FeatureLayer') {
          if(layer.fields.length === 0){
            return;
          }
          if (layer.url || layer._json) {
            var name = layerName || layer.name;
            var a = {
              uniqueId: this._createUniqueId(),
              name: name,
              displayField: layer.displayField,
              fields: layer.fields,
              url: null,
              featureCollection: null
            };
            if (layer.url) {
              a.url = layer.url;
            }
            else if(layer._json){
              a.featureCollection = json.parse(layer._json);
            }
            this.layerInfos.push(a);
          }
        }
      }));
      this._updateBtnAddLayerSource();
    },

    _getLayerNameFromWebMapResponse:function(layer){
      var name = '';
      if(this.map && this.map.webMapResponse){
        var operationalLayers = this.map.webMapResponse.itemInfo.itemData.operationalLayers;
        for(var i=0;i<operationalLayers.length;i++){
          var operationalLayer = operationalLayers[i];
          if(operationalLayer.id === layer.id){
            return operationalLayer.title;
          }
          else{
            var fc = operationalLayer.featureCollection;
            if(fc){
              var layers = fc.layers;
              for(var j=0;j<layers.length;j++){
                var subLayer = layers[j];
                if(subLayer.id === layer.id){
                  if(layers.length === 1){
                    return operationalLayer.title;
                  }
                  else{
                    return operationalLayer.title+'_'+subLayer.layerDefinition.name;
                  }
                }
              }
            }
          }
        }
      }
      return name;
    },

    _checkUrlExist:function(url){
      return array.some(this.layerInfos,lang.hitch(this,function(layerInfo){
        return layerInfo.url === url;
      }));
    },

    _updateBtnAddLayerSource:function(){
      if(this.layerInfos.length > 0){
        html.addClass(this.btnAddLayerSource,'enable');
      }
      else{
        html.removeClass(this.btnAddLayerSource,'enable');
      }
    },

    _showChartsSection:function(){
      html.setStyle(this.chartsSection,'display','block');
      html.setStyle(this.singleChartSection,'display','none');
    },

    _showSingleChartSection:function(singleChart){
      this._hideSingleCharts(singleChart);
      html.setStyle(this.chartsSection,'display','none');
      html.setStyle(this.singleChartSection,'display','block');
    },

    _hideSingleCharts:function(ignoredSingleChart){
      var allSingleCharts = this._getAllSingleCharts();
      array.forEach(allSingleCharts,lang.hitch(this,function(singleChart){
        if(singleChart && singleChart.domNode){
          html.setStyle(singleChart.domNode,'display','none');
        }
      }));
      if(ignoredSingleChart){
        html.setStyle(ignoredSingleChart.domNode,'display','block');
      }
    },

    _getAllSingleCharts:function(){
      var allSingleCharts = [];
      var trs = this.chartsTable._getNotEmptyRows();
      array.forEach(trs,lang.hitch(this,function(tr){
        if(tr.dijit){
          allSingleCharts.push(tr.dijit);
        }
      }));
      return allSingleCharts;
    },

    _createAddUrlChart:function(){
      var args = {
        chartSetting:this,
        nls:this.nls
      };
      var rowData = {
        label:'',
        labelField:''
      };
      var result = this.chartsTable.addRow(rowData);
      if(result.success){
        var addUrlChart = new AddUrlChart(args);
        addUrlChart.placeAt(this.singleChartSection);
        addUrlChart.startup();
        addUrlChart.hide();
        this.own(on(addUrlChart,'AddChartSource',lang.hitch(this,function(config){
          this.chartsTable.editRow(result.tr, {
            label: config.label || '',
            labelField: config.labelField || ''
          });
          if(result.tr.dijit){
            result.tr.dijit.destroy();
          }
          delete result.tr.dijit;
          if(config.url){
            this._createEditUrlChart(config,result.tr);
          }
          else if(config.featureCollection){
            this._createEditFeatureCollectionChart(config,result.tr);
          }
          this._showChartsSection();
        })));
        this.own(on(addUrlChart,'AddNewCancel',lang.hitch(this,function(){
          if(result.tr.dijit){
            result.tr.dijit.destroy();
          }
          delete result.tr.dijit;
          this.chartsTable.deleteRow(result.tr);
          this._showChartsSection();
        })));
        result.tr.dijit = addUrlChart;
        result.tr.fromMap = false;
        return result.tr;
      }
      else{
        return null;
      }
    },

    _createAddLayerChart:function(){
      var args = {
        chartSetting:this,
        nls:this.nls
      };
      var rowData = {
        label:'',
        labelField:''
      };
      var result = this.chartsTable.addRow(rowData);
      if(result.success){
        var addLayerChart = new AddLayerChart(args);
        addLayerChart.placeAt(this.singleChartSection);
        addLayerChart.startup();
        addLayerChart.hide();
        this.own(on(addLayerChart,'AddChartSource',lang.hitch(this,function(config){
          this.chartsTable.editRow(result.tr, {
            label: config.label || '',
            labelField: config.labelField || ''
          });
          if(result.tr.dijit){
            result.tr.dijit.destroy();
          }
          delete result.tr.dijit;
          if(config.url){
            this._createEditUrlChart(config,result.tr);
          }
          else if(config.featureCollection){
            this._createEditFeatureCollectionChart(config,result.tr);
          }
          this._showChartsSection();
        })));
        this.own(on(addLayerChart,'AddNewCancel',lang.hitch(this,function(){
          if(result.tr.dijit){
            result.tr.dijit.destroy();
          }
          delete result.tr.dijit;
          this.chartsTable.deleteRow(result.tr);
          this._showChartsSection();
        })));
        result.tr.dijit = addLayerChart;
        result.tr.fromMap = true;
        return result.tr;
      }
      else{
        return null;
      }
    },

    _createEditUrlChart:function(config, /*optional*/ tr){
      var trDom;
      var args = {
        chartSetting:this,
        nls:this.nls,
        config:config
      };
      var editUrlChart = new EditUrlChart(args);
      editUrlChart.placeAt(this.singleChartSection);
      editUrlChart.startup();
      editUrlChart.hide();
      var rowData = {
        label: config.label,
        labelField: config.labelField
      };
      if(tr){
        trDom = tr;
        this.chartsTable.editRow(tr,rowData);
      }
      else{
        var result = this.chartsTable.addRow(rowData);
        trDom = result.tr;
      }
      trDom.dijit = editUrlChart;

      this.own(on(editUrlChart, 'UpdateChartSource', lang.hitch(this, function(config) {
        this.chartsTable.editRow(trDom, {
          label: config.label || '',
          labelField: config.labelField || ''
        });
        trDom.dijit.hide();
        this._showChartsSection();
      })));
      this.own(on(editUrlChart, 'UpdateCancel', lang.hitch(this, function() {
        trDom.dijit.hide();
        this._showChartsSection();
      })));
    },

    _createEditFeatureCollectionChart:function(config, /*optional*/ tr){
      var trDom;
      var args = {
        chartSetting: this,
        nls: this.nls,
        config: config
      };
      var fcChart = new EditFeatureCollectionChart(args);
      fcChart.placeAt(this.singleChartSection);
      fcChart.startup();
      fcChart.hide();
      var rowData = {
        label: config.label,
        labelField: config.labelField
      };
      if(tr){
        trDom = tr;
        this.chartsTable.editRow(tr,rowData);
        
      }
      else{
        var result = this.chartsTable.addRow(rowData);
        trDom = result.tr;
      }

      trDom.dijit = fcChart;

      this.own(on(fcChart, 'UpdateChartSource', lang.hitch(this, function(config) {
        this.chartsTable.editRow(trDom, {
          label: config.label || '',
          labelField: config.labelField || ''
        });
        trDom.dijit.hide();
        this._showChartsSection();
      })));
      this.own(on(fcChart, 'UpdateCancel', lang.hitch(this, function() {
        trDom.dijit.hide();
        this._showChartsSection();
      })));
    },

    _initTab:function(){
      this.tabContainer = new TabContainer({
        tabs:[{
          title:this.nls.chartSources,
          content:this.sourcesTabNode
        },{
          title:this.nls.general,
          content:this.generalTabNode
        }],
        isNested: true
      },this.viewStack);
      this.tabContainer.startup();
    },

    _reset:function(){
      this.chartsTable.clear();
    },

    _initChartsTable:function(){
      this.chartsTable.clear();
      var layers = this.config && this.config.layers;
      if(!(layers instanceof Array)){
        return;
      }
      array.forEach(layers,lang.hitch(this,function(layerConfig){
        if(layerConfig.url){
          this._createEditUrlChart(layerConfig);
        }
        else if(layerConfig.featureCollection){
          this._createEditFeatureCollectionChart(layerConfig);
        }
      }));
    }
  });
});