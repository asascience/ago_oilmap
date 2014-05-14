## HistogramTimeSlider ##
### Overview ###
The HistogramTimeSlider widget provides a histogram chart representation of data for time-enabled layers on a map. Through the UI, users can temporarily control the display of data with an extension to the Esri timeslider.

### Attributes ###
* `histogramTimeSlider`: An object of ArcGIS API for JavaScript. See the params of  [HistogramTimeSlider Constructor](https://developers.arcgis.com/en/javascript/jsapi/histogramtimeslider-amd.html#histogramtimeslider1).
    * `layers`: Object[]; default: no default —An array of feature layers. See the options parameter of [FeatureLayer Constructor](https://developers.arcgis.com/en/javascript/jsapi/featurelayer-amd.html#featurelayer1).
        * `options`: Object; default: no default —Optional parameters.
            * `infoTemplate`: An object of ArcGIS API for JavaScript. See the JSON parameter of [InfoTemplate Constructor](https://developers.arcgis.com/en/javascript/jsapi/infotemplate-amd.html#infotemplate3).

Example:
```
{
  "histogramTimeSlider": {
    "dateFormat": "DateFormat(selector: 'date', fullYear: true)",
    "mode": "show_all",
    "timeInterval": "esriTimeUnitsYears",
    "layers": [{
      "url": "http://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/U2/FeatureServer/0",
      "options": {
        "id": "u2",
        "outFields": ["*"],
        "infoTemplate": {
          "title": "U2 Concerts:  1980  2011",
          "content": "Date:  ${Date:DateFormat(selector: 'date', fullYear: true)}<br>Venue:  ${Venue}, ${City}, ${State}<br>Tour:  ${Tour}"
        }
      }
    }]
  }
}
```
