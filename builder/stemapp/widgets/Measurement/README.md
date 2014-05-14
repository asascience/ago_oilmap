## Measurement ##
### Overview ###
The Measurement widget provides tools that calculate the current location (Get Location), and measure distance (Measure Distance), and area (Measure Area). If the map’s coordinate system is not Web Mercator or geographic, or if complex polygons are drawn, this widget needs to use the geometry service to project or simplify geometries.

### Attributes ###
* `measurement`: An object of ArcGIS API for JavaScript. See the params of [Measurement Constructor](https://developers.arcgis.com/en/javascript/jsapi/measurement-amd.html#measurement1).
    - `lineSymbol`: A JSON object of ArcGIS API for JavaScript. See the input parameter json for  [SimpleLineSymbol constructor](https://developers.arcgis.com/en/javascript/jsapi/simplelinesymbol-amd.html#simplelinesymbol3).
    - `pointSymbol`: A JSON object of ArcGIS API for JavaScript. See the input parameter json for the marker symbol constructors: 
  [SimpleMarkSymbol](https://developers.arcgis.com/en/javascript/jsapi/simplemarkersymbol-amd.html#simplemarkersymbol3) and 
  [PictureMarkSymbol](https://developers.arcgis.com/en/javascript/jsapi/picturemarkersymbol-amd.html#picturemarkersymbol2) .

Example:
```
{
  "measurement": {
    "pointSymbol": {
      "type": "esriSMS",
      "style": "esriSMSSquare",
      "color": [76, 115, 0, 255],
      "size": 8,
      "angle": 0,
      "xoffset": 0,
      "yoffset": 0,
      "outline": {
        "color": [152, 230, 0, 255],
        "width": 1
      }
    }
  }
}
```
