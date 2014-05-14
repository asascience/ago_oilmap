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
  'dojo/on',
  'jimu/BaseWidgetSetting',
  'dijit/form/ValidationTextBox',
  'jimu/dijit/ServiceBrowser',
  'jimu/dijit/ViewStack',
  './SettingDetail'
],
function(declare, lang, array, html, on, BaseWidgetSetting, ValidationTextBox, ServiceBrowser, ViewStack, SettingDetail) {
  return declare([BaseWidgetSetting], {
    baseClass: 'jimu-widget-setting-gp',

    startup: function(){
      this.inherited(arguments);
      this.serviceUrlInput = new ValidationTextBox({
        required:true,
        placeholder: this.nls.serviceURLPlaceholder,
        style: {
          position:'absolute',
          left: '80px',
          right:'45px',
          top:'5px',
          bottom: '5px',
          width: 'auto'
        }
      }, this.serviceUrlNode);

      this.serviceBrowser = new ServiceBrowser({
      }, this.serviceBrowserNode);

      this.own(on(this.serviceBrowser, 'taskUrlSelected', lang.hitch(this, this._onTaskUrlSelected)));

      this.settingDetail = new SettingDetail({
        config: this.config,
        nls: this.nls,
        map: this.map
      }, this.settingDetailNode);

      this.serviceUrlInput.startup();
      
      this.viewStack = new ViewStack({
        viewType: 'dijit',
        views: [this.serviceBrowser, this.settingDetail]
      }, this.stackNode);
      this.viewStack.startup();
      this.setConfig(this.config);

      this._setStackNodeHeight();
    },

    _setStackNodeHeight: function(){
      var box = html.getContentBox(this.domNode);
      html.setStyle(this.stackNode, {
        height: (box.h - 40 - 3) + 'px'
      });
    },

    setConfig: function(config){
      if(config.taskUrl && config.taskUrl !== this.serviceUrlInput.value){
        this.serviceUrlInput.setValue(config.taskUrl);
        this._onSearch();
      }else{
        this.settingDetail.setConfig(config);
      }
    },

    getConfig: function () {
      //because the setting detail maybe re-write the config object,
      //so, call setting detail's getConfig here
      return this.settingDetail.getConfig();
    },

    _onSearch: function(){
      if(this.serviceUrlInput.value === this.config.taskUrl){
        this.viewStack.switchView(this.settingDetail);
        this.settingDetail.setConfig(lang.clone(this.config));
        return;
      }
      this.serviceBrowser.setUrl(this.serviceUrlInput.value);
      this.viewStack.switchView(this.serviceBrowser);
    },

    _onTaskUrlSelected: function(taskUrl){
      this.viewStack.switchView(this.settingDetail);
      this.config.taskUrl = taskUrl;
      if(this.serviceUrlInput.value !== taskUrl){
        this.serviceUrlInput.setValue(taskUrl);
      }
      this.settingDetail.setConfig(lang.clone(this.config));
    }

  });
});