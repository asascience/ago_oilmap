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
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Tooltip',
  'dijit/form/Select',
  'dojo/text!./EditFeatureCollectionChart.html',
  'dijit/form/TextBox',
  'jimu/dijit/URLInput',
  'jimu/dijit/LoadingShelter',
  './MediaSelector'
],
function(declare, lang, array, html, query, on, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
  Tooltip, Select, template, TextBox, URLInput, LoadingShelter, MediaSelector) {/*jshint unused: false*/
  return declare([_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-singlechart-setting',
    templateString:template,
    chartSetting:null,
    mediaSelector:null,
    nls:null,
    config:null,

    postCreate:function(){
      this.inherited(arguments);
      this.mediaSelector = new MediaSelector({nls:this.nls});
      this.mediaSelector.placeAt(this.mediaSelectorDiv);
      this.mediaSelector.startup();
      this._bindEvents();
      this.setConfig(this.config);
    },

    destroy:function(){
      this.chartSetting = null;
      this.inherited(arguments);
    },

    hide:function(){
      html.setStyle(this.domNode,'display','none');
    },

    show:function(){
      html.setStyle(this.domNode,'display','block');
    },

    setConfig:function(config){
      this.config = config;
      this.reset();
      this.sourceLabel.set('value',config.label||'');
      this.mediaSelector.setMedias(config.medias);
      var fc = this.config.featureCollection;
      var ld = fc && fc.layerDefinition;
      var allFields = ld && ld.fields;
      var options = [];
      for (var i = 0; i < allFields.length; i++) {
        var fieldInfo = allFields[i];
        if (fieldInfo.type !== 'esriFieldTypeGeometry') {
          options.push({
            value: fieldInfo.name,
            label: fieldInfo.name
          });
        }
      }
      this.categorySelect.addOption(options);
      if (config.labelField) {
        this.categorySelect.set('value', config.labelField);
      }
      this.mediaSelector.setAllFields(allFields);
    },

    getConfig:function(){
      if(!this.validate()){
        return false;
      }

      var config = {
        label:this._getSourceLabel(),
        labelField:this.categorySelect.get('value'),
        fields:[],
        medias:[],
        featureCollection:this.config.featureCollection
      };

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
      this.config = lang.mixin({},config);
      return config;
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

    onUpdateChartSource:function(config){/*jshint unused: false*/},

    onUpdateCancel:function(){},

    _bindEvents:function(){
      this.own(on(this.btnUpdate,'click',lang.hitch(this,function(){
        var config = this.getConfig();
        if (config) {
          this.onUpdateChartSource(config);
        }
      })));

      this.own(on(this.btnCancel,'click',lang.hitch(this,function(){
        this.setConfig(this.config);
        this.onUpdateCancel();
      })));
    },

    _setSourceLabel:function(sourceLabel){
      this.sourceLabel.set('value',lang.trim(sourceLabel||''));
    },

    _getSourceLabel:function(){
      return lang.trim(this.sourceLabel.get('value'));
    },

    reset:function(){
      this._setSourceLabel('');
      this._clearCategorySelect();
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