## Chart ##
### Overview ###
The Chart widget displays quantitative attributes from a map layer as a graphical representation of data. It makes it easy for end users to observe possible patterns and trends in quantitative attribute data, as charts can usually be read more quickly than the raw data from which they are produced.

### Attributes ###
* `geometryService`: String; default — http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer; The geometry service URL.

Example:
```
"geometryService": "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
```

* `layers`:  Object[]; default: no default —Container for the chart’s layer sources. Each element has the following child attributes:
    - `label`: String; default: no default —The layer name displayed in the widget.
    - `url`: tring; default: no default —The uniform resource locator (URL) address of the layer to query for data. This is an individual layer in a service and normally ends with a number, such as …/MapServer/0.
    - `labelField`: String; default: no default —This field is used as the chart’s category field. For example, if the label field is NAME, this field is used to categorize the chart data.
    - `fields`: String[]; default: no default —Container for the retrieved fields.
    - `medias`: Object[]; default: no default — Which medias to display. Each element includes information on how to display media in the Chart widget and has the following child attributes:
        - `chartField`: String; default: no default —Field name (one single field per chart) for data shown in the chart.
        - `title`: String; default: no default —Title to display.
        - `type`: String; default: no default —Type of chart to display. Valid values are barschart, columnschart, linechart, and piechart.

```
"layers":[
  {
    "label":"Cities",
    "url":"http://sampleserver6.arcgisonline.com/arcgis/rest/services/SampleWorldCities/MapServer/0",
    "labelField":"CITY_NAME",
    "fields":["CITY_NAME","POP","POP_RANK"],
    "medias":[
      {
        "chartField":"POP",
        "title":"POP Bar Chart",
        "type":"barschart"
      },
      {
        "chartField":"POP",
        "title":"POP Column Chart",
        "type":"columnschart"
      },
      {
        "chartField":"POP",
        "title":"POP Line Chart",
        "type":"linechart"
      },
      {
        "chartField":"POP",
        "title":"POP Pie Chart",
        "type":"piechart"
      }
    ]
  }
]
```
