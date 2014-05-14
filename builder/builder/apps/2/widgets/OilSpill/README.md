## Geocoder ##
### Overview ###
Add a geographic search box to an application. The widget defaults to the ArcGIS Online World Geocoding Service but can be customized to use one or more ArcGIS Server geocoding services.

### Attributes ###
* `geocoder`: An object of ArcGIS API for Javascript, see the params of [Geocoder Constructor](https://developers.arcgis.com/en/javascript/jsapi/geocoder-amd.html#geocoder1).

Example:
```
{
  "geocoder": {
    "autoComplete": true,
    "minCharacters": 3,
    "arcgisGeocoder": {
      "placeholder": "Find address or place"
    }
  }
}
```
