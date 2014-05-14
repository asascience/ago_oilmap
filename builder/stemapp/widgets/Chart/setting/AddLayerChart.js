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
  'dojo/on',
  'dojo/topic',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Tooltip',
  'dijit/form/Select',
  'dojo/text!./AddLayerChart.html',
  'dijit/form/TextBox',
  'jimu/dijit/URLInput',
  'jimu/dijit/LoadingShelter',
  './MediaSelector'
],
function(declare, lang, array, html, query,  on, topic,_WidgetBase,_TemplatedMixin, _WidgetsInTemplateMixin,
  Tooltip, Select, template, TextBox, URLInput, LoadingShelter, MediaSelector) {/*jshint unused: false*/
  return declare([_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-singlechart-setting',
    templateString:template,
    chartSetting:null,
    nls:null,
    mediaSelector:null,
    _layerInfo:null,

    postCreate:function(){
      this.inherited(arguments);
      this.mediaSelector = new MediaSelector({nls:this.nls});
      this.mediaSelector.placeAt(this.mediaSelectorDiv);
      this.mediaSelector.startup();
      this._initLayersSelect(this.chartSetting.layerInfos);
      this._bindEvents();
      this._layerSelectChange();
    },

    show:function(){
      html.setStyle(this.domNode,'display','block');
    },

    hide:function(){
      html.setStyle(this.domNode,'display','none');
    },

    getConfig:function(){
      if(!this.validate() || !this._layerInfo){
        return false;
      }

      var config = {
        label:this._getSourceLabel(),
        labelField:this.categorySelect.get('value'),
        fields:[],
        medias:[]
      };

      if(this._layerInfo.url){
        config.url = this._layerInfo.url;
      }
      else if(this._layerInfo.featureCollection){
        config.featureCollection = this._layerInfo.featureCollection;
      }
      else{
        return false;
      }

      var mediaConfig = this.mediaSelector.getConfig();
      config = lang.mixin(config,mediaConfig);

      var fields = [config.labelField];
      array.forEach(config.medias,lang.hitch(this,function(media){
        var chartField = media.chartField;
        if(array.indexOf(fields,chartField) < 0){
          fields.push(chartField);
        }
      }));
      config.fields = fields;
      return config;
    },

    onAddChartSource:function(config){/*jshint unused: false*/},

    onAddNewCancel:function(){},

    _getLayerInfo:function(uniqueId){
      return this.chartSetting._getLayerInfoByUniqueId(uniqueId);
    },

    _setSourceLabel:function(sourceLabel){
      sourceLabel = lang.trim(sourceLabel);
      this.sourceLabel.set('value',sourceLabel);
    },

    _getSourceLabel:function(){
      var sourceLabel = this.sourceLabel.get('value');
      return lang.trim(sourceLabel);
    },

    _initLayersSelect:function(layerInfos){
      //array,{uniqueId,name,displayField,fields,/*url*/,/*featureCollection*/}
      if(layerInfos instanceof Array){
        array.forEach(layerInfos,lang.hitch(this,function(layerInfo){
          var option = {
            value:layerInfo.uniqueId,
            label:layerInfo.name
          };
          this.layersSelect.addOption(option);
        }));
      }
    },

    validate:function(){
      if(!this.categorySelect.get('value')){
        return false;
      }
      if(this._getSourceLabel() === ''){
        return false;
      }
      var mediaConfig = this.mediaSelector.getConfig();
      if(mediaConfig.medias.length === 0){
        return false;
      }
      return true;
    },

    _bindEvents:function(){
      this.own(topic.subscribe('chartSettingPageLayerInfo',lang.hitch(this,function(layerInfo){
        //{uniqueId,name,displayField,fields,/*url*/,/*featureCollection*/}
        var options = this.layersSelect.options;
        var exist = array.some(options,lang.hitch(this,function(option){
          return option.value === layerInfo.url;
        }));
        if(!exist){
          this.layersSelect.addOption({
            value:layerInfo.uniqueId,
            label:layerInfo.name
          });
        }
      })));

      this.own(on(this.layersSelect,'change',lang.hitch(this,this._layerSelectChange)));

      this.own(on(this.btnAdd,'click',lang.hitch(this,function(){
        var config = this.getConfig();
        if (config) {
          this.onAddChartSource(config);
        }
      })));
      this.own(on(this.btnCancel,'click',lang.hitch(this,function(){
        this.onAddNewCancel();
      })));
    },

    _layerSelectChange:function(){
      this.reset();
      this.sourceLabel.set('value', this.layersSelect.get('displayedValue'));
      var uniqueId = this.layersSelect.get('value');
      this._layerInfo = this._getLayerInfo(uniqueId);
      this.mediaSelector.setAllFields(this._layerInfo.fields);
      var options = [];
      for(var i=0;i<this._layerInfo.fields.length;i++){
        var fieldInfo = this._layerInfo.fields[i];
        if(fieldInfo.type !== 'esriFieldTypeGeometry'){
          options.push({
            value:fieldInfo.name,
            label:fieldInfo.name
          });
        }
      }
      this.categorySelect.addOption(options);
      if(this._layerInfo.displayField){
        this.categorySelect.set('value',this._layerInfo.displayField);
      }
    },

    reset:function(){
      this._clearCategorySelect();
      this._setSourceLabel('');
      this.mediaSelector.reset();
    },

    _clearCategorySelect:function(){
      this.categorySelect.removeOption(this.categorySelect.getOptions());
      this.categorySelect.set('displayedValue','');
      var spans = query('span[role=option]',this.categorySelect.domNode);
      array.forEach(spans,lang.hitch(this,function(span){
        span.innerHTML = '';
      }));
    }
  });
});