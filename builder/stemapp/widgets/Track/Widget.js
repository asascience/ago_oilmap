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
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/query',
  'dojo/_base/fx',
  'dojo/fx',
  'dojo/dom-construct',
  'dojo/dom-geometry',
  'dojo/dom-style',
  'dojo/aspect',
  'dojo/_base/Color',
  'dojo/string',
  'dojo/mouse',
  'dojo/on',
  'dojo/json',
  'dojo/has',
  'dojo/NodeList-fx',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/localStorage',
  'jimu/BaseWidget',
  'jimu/dijit/TimeInput',
  'jimu/utils',
  'jimu/utils3d',
  'esri3d/overlayer/element/Label',
  'esri3d/overlayer/element/Image',
  './Player'
],
function(declare, array, lang, query, baseFx, fx, domConstruct, domGeometry, domStyle, aspect, Color, string, mouse, on,
json, has, nlfx, _WidgetsInTemplateMixin, store, BaseWidget, TimeInput, utils, utils3d, Label, Image, Player){
  return declare([BaseWidget, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-track',
    paneStatus: 'list',//list, editor
    contentWidth: -1,
    animTime: 400,
    tracks: [],
    currentTrack: null,
    currentTrackStop: null,
    captureTip: null,

    defaultTime: 5000,
    autoSaveInterval: 5000,
    modified: false,

    trackIdsKey: 'jimu/esriwidgets/Track/ids',
    draftTrackKey: 'jimu/esriwidgets/Track/draft',
    player: null,

    postCreate: function(){
      this.inherited(arguments);
      this.trackTime.step = 10000;
      aspect.after(this.trackTime, 'timeChange', lang.hitch(this, function(time){
        this.updateTrackStopsTime(this.currentTrack, time);
        this.modified = true;
      }), true);
      on(document.body, 'click', lang.hitch(this, function(){
        this.removeCaptureTip();
      }));
      setInterval(lang.hitch(this, this.saveDraftTrack), this.autoSaveInterval);
    },

    startup: function(){
      this.inherited(arguments);
      aspect.after(this.map, 'onKeyUp', lang.hitch(this, this.onMapKeyUp), true);
      aspect.after(this.map, 'onClick', lang.hitch(this, this.onMapClick), true);

      this.width = domGeometry.getContentBox(this.domNode).w;

      this.showTrackList(false);

      if(this.hasDraft()){
        this.showATrack(store.get(this.draftTrackKey), false);
      }
      this.resize();
    },

    onMapKeyUp: function(evt){
      if(evt.keycode === 32){
        this.addTrackStop(this.map.getCamera());
      }
    },

    onMapClick: function(){
      if(this.captureTip === null && this.state !== 'hidden' && this.paneStatus === 'editor'){
        this.addCaptureTip();
      }
    },

    addTrackStop: function(camera){
      var stop = {}, lng = this.currentTrack.stops.length, index;
      stop.name = this.genStopName(this.currentTrack, stop);
      stop.camera = [camera.x, camera.y, camera.z, camera.heading, camera.tilt];
      if(lng === 0){
        stop.time = 0;
      }else if(lng === 1){
        stop.time = this.defaultTime;
      }else{
        stop.time = this.getSuggestionTime(stop.camera, this.currentTrack.stops[lng - 2]);
      }

      if(this.currentTrackStop === null){
        this.createTrackStopNode(stop, lng, (lng === 0)? 0: lng - 1);
        this.currentTrack.stops.push(stop);
      }else{
        index = array.indexOf(this.currentTrack.stops, this.currentTrackStop);
        this.createTrackStopNode(stop, index + 1, index);
        this.currentTrack.stops.splice(index + 1, 0, stop);
      }

      this.updateTrackTime(this.currentTrack, false);
      this.currentTrackStop = stop;
      this.modified = true;
      if(this.trackTime.disabled){
        this.trackTime.enable();
      }
    },

    genStopName: function(track){
      var i = track.stops.length, name = 'view-' + i;
      function checkName(it){
        if(it.name === name){
          return true;
        }
      }
      while(array.some(track.stops, checkName, this)){
        name = 'view-' + (i++);
      }
      return name;
    },

    getSuggestionTime: function(camera2, camera1){
      /* jshint unused:false */
      var l1, l2;
      if(this.currentTrack.stops.length < 2){
        return this.defaultTime;
      }
      l1 = this.currentTrack.stops[0];
      l2 = this.currentTrack.stops[1];
      //TODO
      return this.defaultTime;
    },

    //if save successfully, return true, else return false
    saveCurrentTrack: function(){
      if(this.currentTrack === null){
        return true;
      }
      if(string.trim(query(this.trackName).val()).length === 0){
        query(this.errorNode).style({visibility: 'visible'}).html(this.nls.tipInputName);
        return false;
      }

      //this is the first time save, save tracks from server
      if(store.get(this.trackIdsKey) === undefined){
        this.saveAllTracks();
      }

      this.currentTrack.name = string.trim(query(this.trackName).val());
      if(typeof this.currentTrack.id === 'undefined' && this.getTrackByName(this.currentTrack.name) !== null){
        query(this.errorNode).style({visibility: 'visible'}).html(this.nls.tipNameExist);
        this.trackName.select();
        return false;
      }

      this.saveTrack(this.currentTrack);
      query(this.tipMessage).text(this.nls.tipSaved);
      baseFx.animateProperty({
        node: this.tipMessage,
        properties: {opacity: 0},
        duration: 2000,
        onEnd: lang.hitch(this, function(){
          query(this.tipMessage).text('').style({opacity: 1});
        })
      }).play();
      this.readSavedTrack();

      query(this.errorNode).style({visibility: 'hidden'}).html('&nbsp');
      return true;
    },

    saveAllTracks: function(){
      array.forEach(this.tracks, function(track, i){
        if(track.id === undefined){
          track.id = i;
        }
        this.saveTrack(track);
      }, this);
    },

    saveTrack: function(track){
      var trackIds = store.get(this.trackIdsKey), trackClone;
      if(trackIds === undefined){
        trackIds = [];
      }

      if(typeof track.id === 'undefined'){
        track.id = new Date().getTime();
      }

      if(array.indexOf(trackIds, track.id) < 0){
        trackIds.push(track.id);
        store.set(this.trackIdsKey, trackIds);
      }

      trackClone = this.getClonedTrack(track);
      store.set('Track_' + track.id, trackClone);
      store.remove(this.draftTrackKey);
      this.modified = false;
    },

    saveDraftTrack: function(){
      if(this.currentTrack === null || !this.modified){
        return;
      }
      var trackClone = this.getClonedTrack(this.currentTrack);
      store.set(this.draftTrackKey, trackClone);
    },

    //clone track to remove some properties of the track stops
    getClonedTrack: function(track){
      var trackClone = lang.clone(track);
      array.forEach(trackClone.stops, function(stop){
        delete stop.timeInput;
        delete stop.node;
      }, this);
      return trackClone;
    },

    readSavedTrack: function(){
      var trackIds = store.get(this.trackIdsKey);
      this.tracks = [];
      array.forEach(trackIds, function(id){
        this.tracks.push(store.get('Track_' + id));
      }, this);
    },

    getTrackByName: function(trackName){
      var i;
      for(i = 0; i < this.tracks.length; i++){
        if(this.tracks[i].name === trackName){
          return this.tracks[i];
        }
      }
      return null;
    },

    dropTrack: function(track){
      var trackIds = store.get(this.trackIdsKey), i;
      if(trackIds === undefined){
        console.error('no local storage');
        return;
      }
      if(track.id === undefined){
        //this is the first time drop and the dropped track is from server
        i = array.indexOf(this.tracks, track);
        if(i >= 0){
          this.tracks.splice(i, 1);
          this.saveAllTracks();
        }
      }else{
        i = array.indexOf(trackIds, track.id);
        if(i >= 0){
          trackIds.splice(i, 1);
        }
        store.set(this.trackIdsKey, trackIds);
        store.remove('Track_' + track.id);
      }
      if(store.get(this.trackIdsKey).length === 0){
        store.remove(this.trackIdsKey);
      }
      this.showTrackList();
    },

    onCreateNewTrack: function(){
      this.currentTrack = {};
      this.currentTrack.stops = [];
      this.currentTrack.thumbnail = 'images/thumbnail_default.png';
      this.currentTrack.name = 'track-' + this.tracks.length;
      this.showATrack(this.currentTrack);
    },

    onCancelEdit: function(){
      if(this.hasDraft()){
        if(confirm(this.nls.tipSave)){
          if(this.saveCurrentTrack()){
            this.showTrackList();
          }
        }else{
          store.remove(this.draftTrackKey);
          this.showTrackList();
        }
      }else{
        this.showTrackList();
      }
    },

    onSaveTrack: function(){
      this.saveCurrentTrack();
    },

    onFinishEdit: function(){
      if(this.saveCurrentTrack()){
        this.showTrackList();
      }
    },

    onPreviewTrack: function(){
      this.showPlayer(this.currentTrack);
    },

    onAddTrackStop: function(){
      this.addTrackStop(this.map.getCamera());
    },

    onDropTrackStop: function(){
      var i;
      if(this.currentTrackStop === null){
        return;
      }
      i = array.indexOf(this.currentTrack.stops, this.currentTrackStop);

      this.dropTrackStop(this.currentTrackStop);
      if(this.currentTrack.stops.length === 0){
        this.currentTrackStop = null;
        this.trackTime.disable();
      }else{
        if(i > 0){
          i = i - 1;
        }
        this.selectTrackStop(this.currentTrack.stops[i]);
      }
    },

    dropTrackStop: function(stop){
      array.forEach(this.currentTrack.stops, function(it, i){
        if(stop === it){
          domConstruct.destroy(stop.node);
          this.currentTrack.stops.splice(i, 1);
        }
      }, this);
      this.updateTrackTime(this.currentTrack, false);
      this.modified = true;
    },

    updateTrackStopsTime: function(track, time){
      var oldTrackTime = this.getTrackTime(track), r, it;
      if(track.stops.length === 0){
        return;
      }
      if(oldTrackTime === 0){
        it = time / track.stops.length;
        array.forEach(track.stops, function(stop, i){
          if(i !== 0){
            this.updateTrackStopTime(track, stop, it, false);
          }
        }, this);
      }else{
        r = time/oldTrackTime;
        array.forEach(track.stops, function(stop, i){
          if(i !== 0){
            it = stop.time * r;
            this.updateTrackStopTime(track, stop, it, false);
          }
        }, this);
      }
    },

    addCaptureTip: function(){
      console.log('addCaptureTip');
      var labelJson = {
        align: {center: true},
        valign: {top: 6},
        text: this.nls.tipCapture,
        font: this.config.captureTip.font,
        size: this.config.captureTip.fontSize
      }, imgJson = {
        align:{center:true},
        valign:{top:4},
        height: 20,
        width: 250,
        url: window.location.protocol + '//' + window.location.host + this.folderUrl + 'images/keyboard_tips.png',
        alpha: 0.75
      };

      if(this.map === null){
        return;
      }
      this.captureTip = {};
      this.captureTip.label = new Label(labelJson);
      this.captureTip.label.setColor(new Color(this.config.captureTip.fontColor));
      this.captureTip.img = new Image(imgJson);
      this.map.overlayer.add(this.captureTip.img);
      this.map.overlayer.add(this.captureTip.label);
    },

    removeCaptureTip: function(){
      if(this.captureTip === null){
        return;
      }
      this.map.overlayer.remove(this.captureTip.label);
      this.map.overlayer.remove(this.captureTip.img);
      this.captureTip = null;
    },

    resize: function(){
      var box = domGeometry.getContentBox(this.domNode);
      this.height = box.h;//the margin
      this.width = box.w;
      if(this.height < 0){
        this.height = 0;
      }
      this.trackListHeight = this.height - 36;//the big create button
      if(this.trackListHeight < 0){
        this.trackListHeight = 0;
      }
      this.trackStopListHeight = this.height - 175;//all other elements except the stop list
      if(this.trackStopListHeight < 0){
        this.trackStopListHeight = 0;
      }
      domStyle.set(this.trackList, {height: this.trackListHeight + 'px'});
      domStyle.set(this.trackStopList, {height: this.trackStopListHeight + 'px'});
    },

    hasDraft: function(){
      if(store.get(this.draftTrackKey) === undefined){
        return false;
      }else{
        return true;
      }
    },

    showTrackList: function(anim){
      if(anim === undefined){
        anim = true;
      }
      this.readSavedTrack();
      domConstruct.empty(this.trackList);
      if(this.tracks.length === 0 && this.config !== null){
        this.tracks = this.tracks.concat(this.config.trackList);
      }
      if(this.tracks.length === 0){
        return;
      }
      array.forEach(this.tracks, function(track){
        this.createTrackNode(track);
      }, this);

      this.swithToListPane(anim);
      this.currentTrack = null;
      this.currentTrackStop = null;
      if(this.player !== null){
        this.player.hide();
      }
    },

    showATrack: function(track, anim){
      if(anim === undefined){
        anim = true;
      }
      this.currentTrack = track;
      this.modified = false;
      if(this.player !== null){
        this.player.hide();
      }
      if(track.name !== undefined){
        this.trackName.value = track.name;
      }else{
        this.trackName.value = '';
      }
      domConstruct.empty(this.trackStopList);
      array.forEach(track.stops, function(stop, i){
        this.createTrackStopNode(stop, i, (i === 0)? 0: i - 1);
      }, this);
      this.updateTrackTime(track, false);
      this.swithToEditorPane(anim);
      if(track.stops.length === 0){
        this.trackTime.disable();
      }else{
        this.trackTime.enable();
      }
    },

    updateTrackTime: function(track, updateTrackStop){
      this.trackTime.setTime(this.getTrackTime(track), updateTrackStop);
    },

    updateTrackStopTime: function(track, stop, time, updateTrack){
      stop.timeInput.setTime(time, false);
      stop.time = time;
      if(updateTrack){
        this.updateTrackTime(track, false);
      }
    },

    createTrackStopNode: function(stop, index, insertPosition){
      var node = domConstruct.create('div', {
        'class': 'jimu-oe-row track-stop'
      }), imgNode, nameNode, timeInputNode0, timeInput;
      imgNode = domConstruct.create('div', {
        'class': 'track-stop-thumbnail'
      }, node);
      nameNode = domConstruct.create('div', {
        'class': 'track-stop-name',
        innerHTML: stop.name,
        title: stop.name
      }, node);
      if(index === 0){
        timeInputNode0 = domConstruct.create('div', {
          'class': 'track-stop-time-0',
          innerHTML: '00:00.0'
        }, node);
      }else{
        timeInput = new TimeInput({time: stop.time});
        domConstruct.place(timeInput.domNode, node);
        aspect.after(timeInput, 'timeChange', lang.hitch(this, function(time){
          stop.time = time;
          this.updateTrackTime(this.currentTrack, false);
          this.modified = true;
        }), true);
      }

      on(node, 'click', lang.hitch(this, function(){
        this.selectTrackStop(stop);
        this.setCameraTrackStop(stop);
      }));

      on(nameNode, 'dblclick', lang.hitch(this, function(){
        var inputNode = domConstruct.create('input', {
          style: 'position: absolute;z-index: 2',
          'class': 'jimu-input',
          value: stop.name
        }, node),
        cs = domStyle.getComputedStyle(nameNode),
        mbox = domGeometry.getMarginBox(nameNode, cs),
        mext = domGeometry.getMarginExtents(nameNode, cs);

        domStyle.set(inputNode, {
          left: (mbox.l + mext.l) + 'px',
          top: (mbox.t + 3) + 'px',
          width: (mbox.w - mext.l - 20 - 10) + 'px',//the 20 is padding
          height: '20px',
          font: '12px/18px arial'
        });
        inputNode.focus();
        inputNode.select();
        on(inputNode, 'blur', lang.hitch(this, function(){
          nameNode.innerHTML = inputNode.value;
          if(stop.name !== inputNode.value && string.trim(inputNode.value).length !== 0){
            stop.name = inputNode.value;
            this.modified = true;
          }
          domConstruct.destroy(inputNode);
        }));
      }));

      var beforeStop = this.currentTrack.stops[insertPosition];
      if(beforeStop === undefined || beforeStop.node === undefined){
        domConstruct.place(node, this.trackStopList);
      }else{
        domConstruct.place(node, beforeStop.node, 'after');
      }

      stop.timeInput = timeInput;
      stop.node = node;

      this.selectTrackStop(stop);
      return node;
    },

    selectTrackStop: function(stop){
      query('.jimu-oe-row', this.domNode).removeClass('jimu-state-selected');
      query(stop.node).addClass('jimu-state-selected');
      this.currentTrackStop = stop;
    },

    setCameraTrackStop: function(stop){
      var camera = utils3d.getCameraFromArray(stop.camera);
      this.map.setCamera(camera, 0);
    },

    createTrackNode: function(track){
      /*jshint unused:false*/
      var node = domConstruct.create('div', {
        'class': 'track-node'
      }, this.trackList),
      imgContainerNode = domConstruct.create('div', {
        'class': 'track-thumbnail'
      }, node),
      imgNode = domConstruct.create('img', {
        'class': 'thumbnail-img',
        src: track.thumbnail? this.folderUrl + track.thumbnail: this.folderUrl + 'images/thumbnail_default.png'
      }, imgContainerNode),
      imgCoverNode = domConstruct.create('img', {
        'class': 'thumbnail-cover'
      }, imgContainerNode),
      imgPlayNode = domConstruct.create('div', {
        'class': 'thumbnail-play'
      }, imgContainerNode),
      imgTimeNode = domConstruct.create('div', {
        'class': 'thumbnail-time'
      }, imgContainerNode),
      imgTimeLabelNode = domConstruct.create('div', {
        'class': 'thumbnail-time-label',
        innerHTML: utils.formatTime(this.getTrackTime(track))
      }, imgContainerNode),
      rightNode = domConstruct.create('div', {
        'class': 'track-right'
      }, node),
      nameNode = domConstruct.create('div', {
        'class': 'track-name',
        innerHTML: track.name
      }, rightNode),
      actionsNode = domConstruct.create('div', {
        'class': 'track-actions'
      }, rightNode),
      playActoinNode = domConstruct.create('div', {
        'class': 'track-action play-action',
        innerHTML: '<div class="left"></div><div class="mid-text"><a>' + this.nls.labelPlay + '</a></div><div class="right"></div>'
      }, actionsNode),
      editActoinNode = domConstruct.create('div', {
        'class': 'track-action edit-action',
        innerHTML: '<div class="left"></div><div class="mid-text"><a>' + this.nls.labelEdit + '</a></div><div class="right"></div>'
      }, actionsNode),
      saveActoinNode = domConstruct.create('div', {
        'class': 'track-action save-action',
        innerHTML: '<div class="left"></div><div class="mid-text"><a>' + this.nls.labelDownload + '</a></div><div class="right"></div>'
      }, actionsNode),
      dropActoinNode = domConstruct.create('div', {
        'class': 'track-action drop-action',
        innerHTML: '<div class="left"></div><div class="mid-text"><a>' + this.nls.labelDrop + '</a></div><div class="right"></div>'
      }, actionsNode);

      on(imgContainerNode, 'click', lang.hitch(this, function(){
        this.showPlayer(track);
      }));
      on(playActoinNode, 'click', lang.hitch(this, function(){
        this.showPlayer(track);
      }));
      on(editActoinNode, 'click', lang.hitch(this, function(){
        this.showATrack(track);
      }));
      query('a', saveActoinNode).on('click', lang.hitch(this, function(){
        var trackStr = json.stringify(track);
        if(has('ie')){
          if (document.execCommand) {
            var fwin = query('.saveas-frame', this.domNode)[0].contentWindow;
            fwin.document.write(trackStr);
            fwin.document.close();
            fwin.document.execCommand('SaveAs', true, track.name + '.txt');
          }else{
            alert("Sorry, your browser does not support this feature");
          }
        }else{
          query('a', saveActoinNode).attr('href', 'data:application/x-json;charset=utf8;json,' + trackStr).attr('download', track.name + '.txt');
        }
      }));
      on(dropActoinNode, 'click', lang.hitch(this, function(){
        if(confirm(this.nls.tipDropTrack)){
          this.dropTrack(track);
        }
      }));
      on(node, mouse.enter, lang.hitch(this, function(){
        query(node).addClass('track-node-hover');
      }));
      on(node, mouse.leave, lang.hitch(this, function(){
        query(node).removeClass('track-node-hover');
      }));
      on(node, 'click', lang.hitch(this, function(){
        query('.track-node', this.domNode).removeClass('track-node-highlight');
        query(node).addClass('track-node-highlight');
      }));
      query('.track-action', node).on(mouse.enter, lang.hitch(this, function(evt){
        var w = domGeometry.getMarginBox(query('.mid-text a', evt.currentTarget)[0]).w;
        query('.mid-text', evt.currentTarget).animateProperty({
          properties: {width: w},
          duration: this.animTime
        }).play();
      }));
      query('.track-action', node).on(mouse.leave, lang.hitch(this, function(evt){
        query('.mid-text', evt.currentTarget).animateProperty({
          properties: {width: 0},
          duration: this.animTime
        }).play();
      }));
      return node;
    },

    swithToEditorPane: function(isAnim){
      var anim;
      this.paneStatus = 'editor';
      anim = fx.combine([
        query(this.listPane).animateProperty({
          properties: {
            left: 0 - this.width,
            opacity: 0
          },
          duration: isAnim? this.animTime: 0
        }),
        query(this.editorPane).animateProperty({
          properties: {
            left: 0,
            opacity: 1
          },
          duration: isAnim? this.animTime: 0
        })
      ]);
      anim.play();
      if(this.player){
        this.player.stop();
      }
    },

    swithToListPane: function(isAnim){
      var anim;
      this.paneStatus = 'list';
      anim = fx.combine([
        query(this.listPane).animateProperty({
          properties: {
            left: 0,
            opacity: 1
          },
          duration: isAnim? this.animTime: 0
        }),
        query(this.editorPane).animateProperty({
          properties: {
            left: this.width,
            opacity: 0
          },
          duration: isAnim? this.animTime: 0
        })
      ]);
      anim.play();
      if(this.player){
        this.player.stop();
      }
    },

    getTrackTime: function(track){
      var time = 0;
      array.forEach(track.stops, function(stop, i){
        if(stop.time === undefined || i === 0){
          time += 0;
        }else{
          time += stop.time;
        }
      });
      return time;
    },

    setState: function(state){
      this.inherited(arguments);
      if(this.player === null || !this.player.isVisible()){
        return;
      }
      if(state === 'hidden' && this.player.state === 'playing'){
        this.player.showOnMap();
      }else if(state === 'maximized'){
        this.player.showInWidget(this.getPlayerPosition());
      }
    },

    showPlayer: function(track){
      var onPlayEndHandle, onPlayToStopHandle, autoHide;
      if(this.player === null){
        this.player = new Player({
          map: this.map,
          containerNode: this.domNode
        }, this.playerNode);
        this.player.startup();
        onPlayToStopHandle = aspect.after(this.player, 'onPlayToTrackStop', lang.hitch(this, function(index){
          if(this.currentTrack !== null){
            this.selectTrackStop(this.currentTrack.stops[index]);
          }
        }), this);
      }
      this.player.setTrack(track, this.getTrackTime(track));
      if(this.paneStatus === 'list'){
        autoHide = false;
        this.player.containerNode = this.listPane;
        domStyle.set(this.player.domNode, 'borderRadius', '4px');
      }else{
        autoHide = true;
        this.player.containerNode = this.editorPane;
        domStyle.set(this.player.domNode, 'borderRadius', '0');
      }
      this.player.showInWidget(this.getPlayerPosition());
      if(autoHide){
        onPlayEndHandle = aspect.after(this.player, 'onPlayEnd', lang.hitch(this, function(){
          this.player.hide();
          onPlayEndHandle.remove();
        }));
      }

      this.player.play();
    },

    getPlayerPosition: function(){
      var playerWidth = 316;
      var left;
      if(this.paneStatus === 'list'){
        var widgetBox = domGeometry.getMarginBox(this.domNode);
        left = (widgetBox.w - playerWidth) / 2;
        return {left: left, top:this.height - this.player.height - 1};
      }else{
        var trackStopListBox = domGeometry.getMarginBox(this.trackStopList);
        left = (trackStopListBox.w - playerWidth) / 2;
        return {left: left, top:trackStopListBox.t + trackStopListBox.h - this.player.height - 1};
      }
    }

  });
});