## Draw ##
### Overview ###
The Draw widget enables end users to draw basic graphics and text on the map.

### Attributes ###
* `distanceUnits`: Object[]; default: no default; The distance units used to measure.
    - `unit`: String; default: no default —The unit name.
    - `abbr`:  String; default: no default —The unit abbreviation.

Example:
```
"distanceUnits": [{
  "unit": "KILOMETERS",
  "abbr": "km"
}, {
  "unit": "MILES",
  "abbr": "mi"
}, {
  "unit": "METERS",
  "abbr": "m"
}, {
  "unit": "FEET",
  "abbr": "ft"
}, {
  "unit": "YARDS",
  "abbr": "yd"
}]
```

* `areaUnits`: Object[]; default: no default —The area units used to measure.
    - `unit`: String; default: no default —The unit name.
    - `abbr`:  String; default: no default —The unit abbreviation.

Example:
```
"areaUnits": [{
  "unit": "SQUARE_KILOMETERS",
  "abbr": "sq km"
}, {
  "unit": "SQUARE_MILES",
  "abbr": "sq mi"
}, {
  "unit": "ACRES",
  "abbr": "ac"
}, {
  "unit": "HECTARES",
  "abbr": "ha"
}, {
  "unit": "SQUARE_METERS",
  "abbr": "sq m"
}, {
  "unit": "SQUARE_FEET",
  "abbr": "sq ft"
}, {
  "unit": "SQUARE_YARDS",
  "abbr": "sq yd"
}]
```
