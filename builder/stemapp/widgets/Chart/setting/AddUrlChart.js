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
  'dojo/text!./AddUrlChart.html',
  'dijit/form/TextBox',
  'jimu/dijit/URLInput',
  'jimu/dijit/LoadingShelter',
  './MediaSelector',
  'esri/request'
],
function(declare, lang, array, html, query, on, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
  Tooltip, Select, template, TextBox, URLInput, LoadingShelter, MediaSelector, esriRequest) {/*jshint unused: false*/
  return declare([_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-singlechart-setting',
    templateString:template,
    chartSetting:null,
    mediaSelector:null,
    nls:null,
    _url:null,

    postCreate:function(){
      this.inherited(arguments);
      this.mediaSelector = new MediaSelector({nls:this.nls});
      this.mediaSelector.placeAt(this.mediaSelectorDiv);
      this.mediaSelector.startup();
      this._bindEvents();
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

    getConfig:function(){
      if(!this.validate()){
        return false;
      }
      var url = this._url;
      var config = {
        label:this._getSourceLabel(),
        url:url,
        labelField:this.categorySelect.get('value'),
        fields:[],
        medias:[]
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
      return config;
    },

    validate:function(){
      if(!this._url){
        return false;
      }
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

    onAddChartSource:function(config){/*jshint unused: false*/},

    onAddNewCancel:function(){},

    _bindEvents:function(){
      this.own(on(this.btnUrlSrcBrowse,'click',lang.hitch(this,function(){
        var url = lang.trim(this.layerUrl.get('value'));
        this.reset();
        this.layerUrl.set('value',url);
        this._url = url;
        this.shelter.show();
        var def = esriRequest({
          url: url,
          content: {
            f: 'json'
          },
          handleAs: 'json',
          callbackParamName: 'callback',
          timeout: 2000
        }, {
          useProxy: false
        });
        def.then(lang.hitch(this, function(response) {
          if (this.domNode) {
            this.shelter.hide();
            this.sourceLabel.set('value', response.name || '');
            var options = [];
            for (var i = 0; i < response.fields.length; i++) {
              var fieldInfo = response.fields[i];
              if (fieldInfo.type !== 'esriFieldTypeGeometry') {
                options.push({
                  value: fieldInfo.name,
                  label: fieldInfo.name
                });
              }
            }
            this.categorySelect.addOption(options);
            if (response.displayField) {
              this.categorySelect.set('value', response.displayField);
            }
            this.mediaSelector.setAllFields(response.fields);
          }
        }), lang.hitch(this, function(err) {
          if (this.domNode) {
            this.shelter.hide();
          }
          console.error(err);
        }));
      })));

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

    _setSourceLabel:function(sourceLabel){
      this.sourceLabel.set('value',lang.trim(sourceLabel||''));
    },

    _getSourceLabel:function(){
      return lang.trim(this.sourceLabel.get('value'));
    },

    reset:function(){
      this._url = '';
      this.layerUrl.set('value','');
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