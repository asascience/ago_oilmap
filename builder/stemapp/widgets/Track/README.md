## Track ##
### Overview ###
The Track widget is used to create, edit and play the track. This widget can only work on 3D map, and can only work on windows. To use this widget, 3D server is required.

### Attributes ###
* `trackList`: Object[]; default: no default; the predefined tracks list
  * `name`: String; default: no default; The name of the track
  * `stops`: Object[]; default: no default; the stops list in the track.
    * `name`: String;
    * `camera`: Number[]; default: no default; The camera is an array that the length is 5 or 6. The first fifth of the array is x, y, z, heading, tilt, the sixth is the wkid. The sixth is optional, if not set, the default wkid is 4326.
    * `time`: Number; default: 0; The play duration from the last stop. The first stop's time must be 0. The unit is millisecond.
  * `thumbnail`: String; default: "images/thumbnail_default.png". As a recommendation, put all of the image under the *images* folder
