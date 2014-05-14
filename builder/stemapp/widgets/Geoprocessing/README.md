## Geoprocessing ##
### Overview ###
Configures and rus the geoprocessing task.

### Attributes ###
* `*taskUrl`: String; default: no default —The URL to the geoprocessing task. 
* `helpUrl`: String; default: no default —The URL to the Help for this geoprocessing task.

* `*isSynchronous`: Boolean; default: no default —The GP’s execution type. 

* `updateDelay`: Number; default: no default —The time interval in milliseconds between each job status request sent to an asynchronous GP task.

* `useResultMapServer`: Boolean; default: false —Boolean value indicating whether to bypass a geoprocessing service’s resulting map service. If true, any configured rendering is ignored as the GP widget uses the resulting map service to display results.

* `shareResults`: Boolean; default: false —If true, adds the resulting output as an operational layer to the map. Boolean value. Default is false.

* `inputParams`: Object[]; default —Depends on the GP service. The input parameters for the geoprocessing task. Each parameter has the following properties:
    - `*name`: String; default: no default —Name of the input parameters as defined on the server. 
    - `*dataType`:String; default: no default—Parameter type.. Valid values are: GPLong, GPDouble, GPString, GPBoolean, GPLinearUnit, GPDate, GPDataFile, GPRasterDataLayer, GPRecordSet, GPFeatureRecordSetLayer, and GPMultiValue.   
      For GPRecordSet type, input features are only supported as table input (input features as table input are only supported). Currently, GPDataFile is not supported.

    - `label`: String; default: no default—Parameter label to display in the widget instead of the parameter name. Optional.
    - `defaultValue`:  String|Object; default: no default —The meaning is the same as the GP task parameter property. See [Task parameter properties](http://resources.arcgis.com/en/help/main/10.2/index.html#/Task_parameter_properties_REST/015400000513000000/). If the `dataType` is GPRecordSet or GPFeatureRecordSetLayer, the defaultValue is required.

    - `featureSetMode`: String; default: no default —The input mode for the featurerecordset input parameters. Only applicable for FeatureRecordSet type. Valid values are: draw, layers, and url.

    - `featureSetUrl`: String; default: no default —Only valid when the featureSetMode value is url.

    - `choiceList`: String; default: no default —Used to provide options in a drop-down list. Only applies to input parameters of types string and linearunit. 

    - `tooltip`: String; default: no default —The ToolTip for the input parameter.

    - `visible`:  Boolean; default: true —If false, this parameter is not visible. 

    - `editorName`: String; default: no default —User can change the input editor when the data type is `GPString`. 

    - `editorDependParamName`: String; default: no default —One parameter may depend on another parameter’s value, such as the  LayerFieldChooser editor depends on the layer parameter.   

* `outputParams`: Object[]; default: no default —The GP’s output parameters configuration.
* `layerOrder`: String[]; default: no default —List of output feature type parameter names.
