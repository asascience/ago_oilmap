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
  'dojo/query',
  'dojo/mouse',
  'dojo/on',
  'dojo/aspect',
  'dojo/dom-construct',
  'jimu/BaseWidget',
  'jimu/dijit/Selectionbox',
  'jimu/dijit/RadioBtn',
  'esri3d/Map',
  'esri3d/layers/Layer'
],
function(declare, lang, array, html, query, mouse, on, aspect, domConstruct, BaseWidget, Selectionbox,
  RadioBtn, Map, Layer) {
  var clazz = declare(BaseWidget, {
    baseClass: 'jimu-widget-mapcompare',

    postCreate: function(){
      var nodes = query('.view-mode', this.domNode);
      nodes.on('click', lang.hitch(this, this.onViewModeChange));
    },

    startup: function() {
      this.showLayers();
    },

    showLayers: function() {
      var allLayers = this.map.layers.concat(this.map.graphicsLayers, this.map.graphics);
      array.forEach(allLayers, function(layer, i) {
        if(layer.isOperationalLayer){
          this._createLayerNode(layer, i);
        }
      }, this);
      this._createEmptyRow();
      on.emit(query('.view-mode:nth-child(1)', this.domNode)[0],'click', {
        cancelable: true,
        bubble: true,
        currentTarget: query('.view-mode:nth-child(1)', this.domNode)[0]
      });
    },

    resize: function(){
      var box = html.getContentBox(this.domNode);
      query('.layers-list', this.domNode).style({height: (box.h - 14 - 11 - 27 - 5) + 'px'});
      query('.layers-body-wrapper', this.domNode).style({height: (box.h - 14 - 11 - 27 - 5 - 19) + 'px'});
    },

    onViewModeChange: function(evt){
      var node = evt.currentTarget, mode = query(node).attr('data-mode')[0];
      query('.view-mode', this.domNode).removeClass('jimu-state-selected');
      query(node).addClass('jimu-state-selected');
      if(mode === 'full'){
        query('.col-cmp', this.domNode).style('display', 'none');
        this.map.setMultiViewMode(Map.MULTIVIEW_NONE);
      }else{
        query('.col-cmp', this.domNode).style('display', 'table-cell');
        if(mode === 'lr' || mode === 'lr-g'){
          query('.layers-list-header .col-l', this.domNode).text(this.nls.labelLeft);
          query('.layers-list-header .col-r', this.domNode).text(this.nls.labelRight);
          if(mode === 'lr'){
            this.map.setMultiViewMode(Map.MULTIVIEW_VERTICAL, false);
          }else{
            this.map.setMultiViewMode(Map.MULTIVIEW_VERTICAL, true);
          }
        }else{
          query('.layers-list-header .col-l', this.domNode).text(this.nls.labelUp);
          query('.layers-list-header .col-r', this.domNode).text(this.nls.labelDown);
          if(mode === 'ud'){
            this.map.setMultiViewMode(Map.MULTIVIEW_HORIZONTAL, false);
          }else{
            this.map.setMultiViewMode(Map.MULTIVIEW_HORIZONTAL, true);
          }
        }
      }
    },

    _createLayerNode: function(layer) {
      var node = domConstruct.create('tr', {
        'class': 'layer-row ' + (layer.visible? 'jimu-state-selected': '')
      }, this.layersList), tdSelect, tdLabel, ckSelect, rR, rL, rB;

      tdSelect = domConstruct.create('td', {
        'class': 'col col-select'
      }, node);
      ckSelect = new Selectionbox({selected: layer.visible});
      domConstruct.place(ckSelect.domNode, tdSelect);
      on(ckSelect.domNode, 'click', lang.hitch(this, function() {
        this._highlightLayerRow(layer, node);
        if (ckSelect.selected) {
          layer.show();
          query(node).addClass('jimu-state-selected');
          this._setRadioBtnByLayerMode(layer, rB, rL, rR);
        } else {
          layer.hide();
          query(node).removeClass('jimu-state-selected');
          rB.uncheck(false);
          rR.uncheck(false);
          rL.uncheck(false);
        }
      }), true);

      rB = this._createCmpTd('col-b', node, layer);
      rL = this._createCmpTd('col-l', node, layer);
      rR = this._createCmpTd('col-r', node, layer);
      rB.flag = 'b';
      rL.flag = 'l';
      rR.flag = 'r';
      this._setRadioBtnByLayerMode(layer, rB, rL, rR);
      on(rB.domNode, 'click', lang.hitch(this, lang.partial(this._onCmpRadioStateChange, ckSelect, rB, layer, node)));
      on(rL.domNode, 'click', lang.hitch(this, lang.partial(this._onCmpRadioStateChange, ckSelect, rL, layer, node)));
      on(rR.domNode, 'click', lang.hitch(this, lang.partial(this._onCmpRadioStateChange, ckSelect, rR, layer, node)));

      tdLabel = domConstruct.create('td', {
        'innerHTML': layer.label,
        'class': 'col jimu-widget-fieldlabel col-layer-label'
      }, node);

      aspect.after(layer, 'onVisibilityChange', lang.hitch(this, function(visibility){
        if(this.state !== 'hidden'){
          return;
        }
        if (visibility) {
          ckSelect.select();
        } else {
          ckSelect.unSelect();
        }
      }), this);
    },

    _highlightLayerRow: function(layer, layerNode){
      query('.layer-row', this.layersList).removeClass('jimu-state-active');
      query(layerNode).addClass('jimu-state-active');
    },

    _setRadioBtnByLayerMode: function(layer, rB, rL, rR){
      if(layer.multiviewMode === Layer.MULTIVIEW_ALL){
        rB.check();
      }else if(layer.multiviewMode === Layer.MULTIVIEW_1){
        rL.check();
      }else{
        rR.check();
      }
    },

    _onCmpRadioStateChange: function(ckSelect, cmpBtn, layer, layerNode){
      if(cmpBtn.checked && !ckSelect.selected){
        ckSelect.select();
        layer.show();
        query(layer.node).addClass('jimu-state-selected');
      }
      this._highlightLayerRow(layer, layerNode);
      if(!cmpBtn.checked){
        return;
      }
      if(cmpBtn.flag === 'b'){
        layer.setMultiViewMode(Layer.MULTIVIEW_ALL);
      }else if(cmpBtn.flag === 'l'){
        layer.setMultiViewMode(Layer.MULTIVIEW_1);
      }else{
        layer.setMultiViewMode(Layer.MULTIVIEW_2);
      }
    },
    _createEmptyRow: function() {
      var node = domConstruct.create('tr', {
        'class': 'jimu-state-selected auto-height'
      }, this.layersList), tdLabel;

      domConstruct.create('td', {
        'class': 'col-select'
      }, node);
      domConstruct.create('td', {
        'class': 'col-b col-cmp'
      }, node);
      domConstruct.create('td', {
        'class': 'col-l col-cmp'
      }, node);
      domConstruct.create('td', {
        'class': 'col-r col-cmp'
      }, node);

      tdLabel = domConstruct.create('td', {
        'class': 'col-layer-label'
      }, node);
    },

    _createCmpTd: function(clazz, layerNode, layer){
      var td = domConstruct.create('td', {
        'class': 'col col-cmp ' + clazz
      }, layerNode),
      ck = new RadioBtn({checked: false, group: layer.label});
      domConstruct.place(ck.domNode, td);
      return ck;
    }
  });
  return clazz;
});