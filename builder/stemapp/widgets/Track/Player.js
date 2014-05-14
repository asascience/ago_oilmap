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
  'dojo/query',
  'dojo/_base/fx',
  'dojo/fx',
  'dojo/_base/array',
  'dojo/aspect',
  'dojo/dom-class',
  'dojo/dom-style',
  'dojo/dom-geometry',
  'dojo/dom-construct',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'jimu/utils',
  'jimu/utils3d',
  'jimu/dijit/IFramePane',
  'esri3d/Map',
  'esri3d/Camera',
  'esri/SpatialReference',
  'dojo/text!./Player.html'
],
function (declare, lang, query, baseFx, fx, array, aspect, domClass, domStyle, domGeometry, domConstruct,
_WidgetBase, _TemplatedMixin, utils, utils3d, IFramePane, Map, Camera, SpatialReference, template) {
  /* global jimuConfig */
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    baseClass: 'track-player',
    track: null,
    trackTime: 0,
    state: 'stop',//playing, pause, stop
    loop: false,
    updateProgressHandle: null,
    playedTime: 0,
    updateInterval: 100,
    iframePane: null,
    animTime: 200,

    postCreate: function(){
      this.inherited(arguments);
      this.progressBarWidth = domGeometry.getContentBox(this.progress).w;
      this.height = domGeometry.getMarginBox(this.domNode).h;
      aspect.after(this.map, 'onTrackStopChange', lang.hitch(this, this.onPlayToOneStop), true);
    },
    setTrack: function(track, trackTime){
      this.trackTime = trackTime;
      this.formatedTrackTime = utils.formatTime(trackTime).substr(0, utils.formatTime(trackTime).length - 2);
      this.updateTime();
      this.stop();
      this.track = track;
    },
    onPlayBtnClick: function(){
      if(this.state === 'playing'){
        this.pause();
      }else{
        this.play();
      }
    },
    onStopBtnClick: function(){
      this.stop();
      this.hide();
    },
    onLoopBtnClick: function(){
      if(this.loop){
        this.loop = false;
        this.map.setTrackPlayMode(Map.PLAY_TRACK_ONCE);
        domClass.remove(this.loopBtn, 'loop-enabled');
      }else{
        this.loop = true;
        this.map.setTrackPlayMode(Map.PLAY_TRACK_LOOP);
        domClass.add(this.loopBtn, 'loop-enabled');
      }
    },
    play: function(){
      if(this.track === null || this.trackTime <= 0){
        return;
      }
      this.state = 'playing';
      domClass.add(this.playBtn, 'pause');
      if(this.playedTime === 0){
        this.map.playTrack(this.getCamerasFromTrack(this.track), this.loop? Map.PLAY_TRACK_LOOP : Map.PLAY_TRACK_ONCE);
      }else{
        this.map.resumeTrackPlay();
      }

      this.updateProgressHandle = setInterval(lang.hitch(this, this.updateProgress), this.updateInterval);
    },
    pause: function(){
      this.state = 'pause';
      domClass.remove(this.playBtn, 'pause');
      this.map.suspendTrackPlay();
      clearInterval(this.updateProgressHandle);
    },
    stop: function(){
      this.state = 'stop';
      this.map.stopTrackPlay();
      domClass.remove(this.playBtn, 'pause');
      this.playedTime = 0;
      domStyle.set(this.progressInner, {width: '0px'});
      clearInterval(this.updateProgressHandle);
      this.onPlayEnd();
    },
    onPlayToOneStop: function(index){
      var i, time = 0;
      for(i = 0; i <= index; i++){
        if(this.track.stops[i].time === undefined || i === 0){
          time += 0;
        }else{
          time += this.track.stops[i].time;
        }
      }
      console.log('playto: ' + index + ', time: ' + time);
      this.updateProgress(time);
      if(index + 1 === this.track.stops.length){
        if(!this.loop){
          this.stop();
          this.onPlayEnd();
        }else{
          this.playedTime = 0;
        }
      }
      this.onPlayToTrackStop(index);
    },
    updateProgress: function(time){
      if(time === undefined){
        this.playedTime += this.updateInterval;
      }else{
        this.playedTime = time;
      }
      domStyle.set(this.progressInner, {width: (this.progressBarWidth * this.playedTime/this.trackTime) + 'px'});
      this.updateTime();
    },
    updateTime: function(){
      var ft = utils.formatTime(this.playedTime);
      this.time.innerHTML = ft.substr(0, ft.length - 2) + '/' + this.formatedTrackTime;
    },
    show: function(){
      domStyle.set(this.domNode, {display: 'block'});
    },
    hide: function(){
      var box = domGeometry.getMarginBox(this.domNode);
      if(this.iframePane !== null){
        return;
      }
      baseFx.animateProperty({
        node: this.domNode,
        properties: {
          top: box.t + this.height,
          opacity: 0
        },
        onEnd: lang.hitch(this, function(){
          domStyle.set(this.domNode, {display: 'none'});
        }),
        duration: this.animTime
      }).play();
    },
    isVisible: function(){
      if(domStyle.get(this.domNode, 'display') === 'none'){
        return false;
      }else{
        return true;
      }
    },
    showInWidget: function(position){
      domStyle.set(this.domNode, {
        display: 'block',
        left: position.left + 'px',
        top: (position.top + this.height) + 'px',
        opacity: 0
      });
      baseFx.animateProperty({
        node: this.domNode,
        properties: {
          top: position.top,
          opacity: 1
        },
        duration: this.animTime
      }).play();

      domConstruct.place(this.domNode, this.containerNode);
      if(this.iframePane !== null){
        this.iframePane.destroy();
        this.iframePane = null;
      }
    },
    showOnMap: function(){
      var layout = query(jimuConfig.layoutId)[0],
      box = domGeometry.getMarginBox(layout),
      conw = box.w,
      conh = box.h,
      w = domStyle.get(this.domNode, 'width'),
      h = domStyle.get(this.domNode, 'height'),
      left = (conw - w)/2,
      top = conh - h - 100;

      domStyle.set(this.domNode, {
        display: 'block',
        left: '0px',
        top: '0px',
        opacity: 1
      });

      this.iframePane = new IFramePane({
        r: 8,
        position: {
          left: left,
          top: top,
          width: w,
          height: h
        }
      });
      domConstruct.place(this.iframePane.domNode, this.map.id);
    },

    onPlayEnd: function(){

    },
    onPlayToTrackStop: function(index){
      /*jshint unused:false*/
    },
    getCamerasFromTrack: function(track){
      return array.map(track.stops, function(stop){
        var camera = utils3d.getCameraFromArray(stop.camera);
        return {camera:camera, milliseconds: stop.time};
      }, this);
    }
  });
});