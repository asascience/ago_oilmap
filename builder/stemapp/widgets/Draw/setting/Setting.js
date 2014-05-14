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
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    'jimu/dijit/TabContainer',
    'jimu/dijit/SimpleTable',
    'dijit/form/Select'
  ],
  function(declare, lang, array, html, query, on, _WidgetsInTemplateMixin, BaseWidgetSetting, TabContainer,
    SimpleTable, Select) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-draw-setting',
      distanceUnits:null,
      areaUnits:null,

      postMixInProperties:function(){
        this.inherited(arguments);

        this.distanceUnits = [{value:'KILOMETERS',label:this.nls.kilometers,abbr:'km',conversion:'0.001'},
        {value:'MILES',label:this.nls.miles,abbr:'mi',conversion:'0.000621'},
        {value:'METERS',label:this.nls.meters,abbr:'m',conversion:'1'},
        {value:'FEET',label:this.nls.feet,abbr:'ft',conversion:'3.2808'},
        {value:'YARDS',label:this.nls.yards,abbr:'yd',conversion:'1.0936133'}];

        this.areaUnits = [{value:'SQUARE_KILOMETERS',label:this.nls.squareKilometers,abbr:'sq km',conversion:'0.000001'},
        {value:'SQUARE_MILES',label:this.nls.squareMiles,abbr:'sq mi',conversion:'3.861021e-7'},
        {value:'ACRES',label:this.nls.acres,abbr:'ac',conversion:'0.00024710538147'},
        {value:'HECTARES',label:this.nls.hectares,abbr:'ha',conversion:'0.0001'},
        {value:'SQUARE_METERS',label:this.nls.squareMeters,abbr:'sq m',conversion:'1'},
        {value:'SQUARE_FEET',label:this.nls.squareFeet,abbr:'sq ft',conversion:'10.763910417'},
        {value:'SQUARE_YARDS',label:this.nls.squareYards,abbr:'sq yd',conversion:'1.19599005'}];
      },

      postCreate: function() {
        this.inherited(arguments);
        this.own(on(this.btnAddDistance,'click',lang.hitch(this,this._addDistance)));
        this.own(on(this.btnAddArea,'click',lang.hitch(this,this._addArea)));
        this.own(on(this.distanceTable,'Delete',lang.hitch(this,function(tr){
          if(tr.select){
            tr.select.destroy();
            delete tr.select;
          }
          this._resetDistanceSelectOptions();
        })));
        this.own(on(this.areaTable,'Delete',lang.hitch(this,function(tr){
          if(tr.select){
            tr.select.destroy();
            delete tr.select;
          }
          this._resetAreaSelectOptions();
        })));
        this.setConfig(this.config);
      },

      startup: function() {
        this.inherited(arguments);

        this.tabContainer = new TabContainer({
          tabs: [{
            title: "Distances",
            content: this.distanceTabNode
          }, {
            title: "Areas",
            content: this.areaTabNode
          }],
          isNested: true
        }, this.content);
        this.tabContainer.startup();
      },

      setConfig: function(config) {
        this.config = config;
        this._setDistanceTable(this.config.distanceUnits);
        this._setAreaTable(this.config.areaUnits);
      },

      _setDistanceTable:function(distanceUnits){
        this.distanceTable.clear();
        array.forEach(distanceUnits,lang.hitch(this,function(item){
          var defaultUnitInfo = this._getDistanceUnitInfo(item.unit);
          if(!defaultUnitInfo){
            return;
          }
          defaultUnitInfo.abbr = item.abbr;
          this._addDistanceUnitRow(defaultUnitInfo);
        }));
      },

      _setAreaTable:function(areaUnits){
        this.areaTable.clear();
        array.forEach(areaUnits,lang.hitch(this,function(item){
          var defaultUnitInfo = this._getAreaUnitInfo(item.unit);
          if(!defaultUnitInfo){
            return;
          }
          defaultUnitInfo.abbr = item.abbr;
          this._addAreaUnitRow(defaultUnitInfo);
        }));
      },

      getConfig: function() {
        var config = {
          distanceUnits:[],
          areaUnits:[]
        };
        config.distanceUnits = this._getDistanceConfig();
        config.areaUnits = this._getAreaConfig();
        return config;
      },

      _getDistanceConfig:function(){
        var result = [];
        var trs = this.distanceTable.getRows();
        result = array.map(trs,lang.hitch(this,function(tr){
          var data = this.distanceTable.getRowData(tr);
          var select = tr.select;
          var unitInfo = {
            unit:select.get('value'),
            abbr:data.abbr
          };
          return unitInfo;
        }));
        return result;
      },

      _getAreaConfig:function(){
        var result = [];
        var trs = this.areaTable.getRows();
        result = array.map(trs,lang.hitch(this,function(tr){
          var data = this.areaTable.getRowData(tr);
          var select = tr.select;
          var unitInfo = {
            unit:select.get('value'),
            abbr:data.abbr
          };
          return unitInfo;
        }));
        return result;
      },

      _getAllDistanceUnitValues:function(){
        var distanceUnitValues = array.map(this.distanceUnits,lang.hitch(this,function(item){
          return item.value;
        }));
        return distanceUnitValues;
      },

      _getUsedDistanceUnitValues:function(){
        var trs = this.distanceTable.getRows();
        var usedDistanceUnitValues = array.map(trs,lang.hitch(this,function(tr){
          return tr.select.get('value');
        }));
        return usedDistanceUnitValues;
      },

      _getNotUsedDistanceUnitValues:function(){
        var allValues = this._getAllDistanceUnitValues();
        var usedValues = this._getUsedDistanceUnitValues();
        var notUsedValues = array.filter(allValues,lang.hitch(this,function(item){
          return array.indexOf(usedValues,item) < 0;
        }));
        return notUsedValues;
      },

      _getDistanceUnitInfo:function(value){
        var result = null;
        var units = array.filter(this.distanceUnits,lang.hitch(this,function(unit){
          return unit.value === value;
        }));
        if(units.length > 0){
          result = lang.mixin({},units[0]);
        }
        return result;
      },

      _addDistance:function(){
        var notUsedValues = this._getNotUsedDistanceUnitValues();
        if(notUsedValues.length === 0){
          return;
        }
        var value = notUsedValues[0];
        var unitInfo = this._getDistanceUnitInfo(value);
        this._addDistanceUnitRow(unitInfo);
      },

      _addDistanceUnitRow:function(unitInfo){
        var rowData = {
          abbr:unitInfo.abbr,
          conversion:unitInfo.conversion
        };
        var result = this.distanceTable.addRow(rowData);
        if(result.success && result.tr){
          var tr = result.tr;
          var td = query('.simple-table-td',tr)[0];
          html.setStyle(td,"verticalAlign","middle");
          var select = new Select({style:{
            width:"100%",
            height:"30px"
          }});
          select.placeAt(td);
          select.startup();
          select.addOption({
            value:unitInfo.value,
            label:unitInfo.label,
            selected:true
          });
          this.own(on(select,'change',lang.hitch(this,this._resetDistanceSelectOptions)));
          tr.select = select;
        }
        this._resetDistanceSelectOptions();
      },

      _showCorrectDistanceInfoBySelectedOption:function(tr){
        var select = tr.select;
        var unitInfo = this._getDistanceUnitInfo(select.value);
        var rowData = {
          abbr:unitInfo.abbr,
          conversion:unitInfo.conversion
        };
        this.distanceTable.editRow(tr,rowData);
      },

      _resetDistanceSelectOptions:function(){
        var trs = this.distanceTable.getRows();
        var selects = array.map(trs,lang.hitch(this,function(tr){
          return tr.select;
        }));
        var notUsedValues = this._getNotUsedDistanceUnitValues();
        var notUsedUnitsInfo = array.map(notUsedValues,lang.hitch(this,function(value){
          return this._getDistanceUnitInfo(value);
        }));
        array.forEach(selects,lang.hitch(this,function(select,index){
          var currentValue = select.get('value');
          var notSelectedOptions = array.filter(select.getOptions(),lang.hitch(this,function(option){
            return option.value !== currentValue;
          }));
          select.removeOption(notSelectedOptions);
          array.forEach(notUsedUnitsInfo,lang.hitch(this,function(unitInfo){
            select.addOption({
              value:unitInfo.value,
              label:unitInfo.label
            });
          }));
          select.set('value',currentValue);
          var tr = trs[index];
          this._showCorrectDistanceInfoBySelectedOption(tr);
        }));
      },

      _getAllAreaUnitValues:function(){
        var areaUnitValues = array.map(this.areaUnits,lang.hitch(this,function(item){
          return item.value;
        }));
        return areaUnitValues;
      },

      _getUsedAreaUnitValues:function(){
        var trs = this.areaTable.getRows();
        var usedAreaUnitValues = array.map(trs,lang.hitch(this,function(tr){
          return tr.select.get('value');
        }));
        return usedAreaUnitValues;
      },

      _getNotUsedAreaUnitValues:function(){
        var allValues = this._getAllAreaUnitValues();
        var usedValues = this._getUsedAreaUnitValues();
        var notUsedValues = array.filter(allValues,lang.hitch(this,function(item){
          return array.indexOf(usedValues,item) < 0;
        }));
        return notUsedValues;
      },

      _getAreaUnitInfo:function(value){
        var result = null;
        var units = array.filter(this.areaUnits,lang.hitch(this,function(unit){
          return unit.value === value;
        }));
        if(units.length > 0){
          result = lang.mixin({},units[0]);
        }
        return result;
      },

      _addArea:function(){
        var notUsedValues = this._getNotUsedAreaUnitValues();
        if(notUsedValues.length === 0){
          return;
        }
        var value = notUsedValues[0];
        var unitInfo = this._getAreaUnitInfo(value);
        this._addAreaUnitRow(unitInfo);
      },

      _addAreaUnitRow:function(unitInfo){
        var rowData = {
          abbr:unitInfo.abbr,
          conversion:unitInfo.conversion
        };
        var result = this.areaTable.addRow(rowData);
        if(result.success && result.tr){
          var tr = result.tr;
          var td = query('.simple-table-td',tr)[0];
          html.setStyle(td,"verticalAlign","middle");
          var select = new Select({style:{
            width:"100%",
            height:"30px"
          }});
          select.placeAt(td);
          select.startup();
          select.addOption({
            value:unitInfo.value,
            label:unitInfo.label,
            selected:true
          });
          this.own(on(select,'change',lang.hitch(this,this._resetAreaSelectOptions)));
          tr.select = select;
        }
        this._resetAreaSelectOptions();
      },

      _showCorrectAreaInfoBySelectedOption:function(tr){
        var select = tr.select;
        var unitInfo = this._getAreaUnitInfo(select.value);
        var rowData = {
          abbr:unitInfo.abbr,
          conversion:unitInfo.conversion
        };
        this.areaTable.editRow(tr,rowData);
      },

      _resetAreaSelectOptions:function(){
        var trs = this.areaTable.getRows();
        var selects = array.map(trs,lang.hitch(this,function(tr){
          return tr.select;
        }));
        var notUsedValues = this._getNotUsedAreaUnitValues();
        var notUsedUnitsInfo = array.map(notUsedValues,lang.hitch(this,function(value){
          return this._getAreaUnitInfo(value);
        }));
        array.forEach(selects,lang.hitch(this,function(select,index){
          var currentValue = select.get('value');
          var notSelectedOptions = array.filter(select.getOptions(),lang.hitch(this,function(option){
            return option.value !== currentValue;
          }));
          select.removeOption(notSelectedOptions);
          array.forEach(notUsedUnitsInfo,lang.hitch(this,function(unitInfo){
            select.addOption({
              value:unitInfo.value,
              label:unitInfo.label
            });
          }));
          select.set('value',currentValue);
          var tr = trs[index];
          this._showCorrectAreaInfoBySelectedOption(tr);
        }));
      }

    });
  });