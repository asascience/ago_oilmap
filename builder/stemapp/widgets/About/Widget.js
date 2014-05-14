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

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'jimu/BaseWidget',
  'jimu/dijit/IFramePane'],
function(declare, lang, html, BaseWidget, IFramePane){
  /* global jimu, jimuConfig */
  var clazz = declare([BaseWidget], {
    //these two properties is defined in the BaseWidget
    baseClass: 'jimu-widget-about',
    name: 'About',

    startup: function(){
      html.setAttr(this.logoNode, 'src', this.folderUrl + 'images/logo.png');
      this.versionNode.innerHTML = this.nls.version + ': ' + jimu.version;

      var box = html.getMarginBox(jimuConfig.layoutId),
      contentBox = html.getMarginBox(this.contentNode), position = {};

      position.width = contentBox.w;
      position.height = contentBox.h;
      position.left = (box.w - position.width)/2;
      position.top = (box.h - position.height)/2;

      html.setStyle(this.contentNode, {
        left: position.left + 'px',
        top: position.top + 'px'
      });

      if(this.map.usePlugin){
        this.iframePane = new IFramePane({
          r: 8,
          position: position
        });
        html.place(this.iframePane.domNode, jimuConfig.layoutId);
        this.iframePane.startup();
      }
    },

    _onOverlayClick: function(){
      var times = 0, count = 6, handle;
      handle = setInterval(lang.hitch(this, function(){
        if(times >= count){
          clearInterval(handle);
          return;
        }
        if(times % 2 === 0){
          html.setStyle(this.continueBtnNode, 'backgroundColor', '#066022');
        }else{
          html.setStyle(this.continueBtnNode, 'backgroundColor', '#20bd49');
        }
        times ++;
      }), 100);
    },

    _onOkClick: function(){
      if(this.iframePane){
        this.iframePane.destroy();
      }
      this.destroy();
    }
  });
  return clazz;
});