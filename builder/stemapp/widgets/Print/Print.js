define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/form/Form',
  'dijit/form/Select',
  'dijit/form/ValidationTextBox',
  'dijit/form/NumberTextBox',
  'dijit/form/Button',
  'dijit/form/CheckBox',
  'dijit/ProgressBar',
  'dijit/form/DropDownButton',
  'dijit/TooltipDialog',
  'dijit/form/RadioButton',
  'esri/tasks/PrintTask',
  "esri/tasks/PrintParameters",
  "esri/tasks/PrintTemplate",
  "esri/request",
  'dojo/store/Memory',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom-style',
  'dojo/dom-construct',
  'dojo/dom-class',
  'dojo/text!./templates/Print.html',
  'dojo/text!./templates/PrintResult.html',
  'dojo/aspect'
], function(
  declare,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Form,
  Select,
  ValidationTextBox,
  NumberTextBox,
  Button,
  CheckBox,
  ProgressBar,
  DropDownButton,
  TooltipDialog,
  RadioButton,
  PrintTask,
  PrintParameters,
  PrintTemplate,
  esriRequest,
  Memory,
  lang,
  array,
  Style,
  domConstruct,
  domClass,
  printTemplate,
  printResultTemplate,
  aspect) {

  // Main print dijit
  var PrintDijit = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: printTemplate,
    map: null,
    count: 1,
    results: [],
    authorText: null,
    copyrightText: null,
    defaultTitle: null,
    defaultFormat: null,
    defaultLayout: null,
    baseClass: "gis_PrintDijit",
    pdfIcon: require.toUrl("./widgets/Print/images/pdf.png"),
    imageIcon: require.toUrl("./widgets/Print/images/image.png"),
    printTaskURL: null,
    printTask: null,
    postCreate: function() {
      this.inherited(arguments);
      this.printTask = new PrintTask(this.printTaskURL);
      this.printparams = new PrintParameters();
      this.printparams.map = this.map;
      this.printparams.outSpatialReference = this.map.spatialReference;

      esriRequest({
        url: this.printTaskURL,
        content: {
          f: "json"
        },
        handleAs: "json",
        callbackParamName: 'callback',
        load: lang.hitch(this, '_handlePrintInfo'),
        error: lang.hitch(this, '_handleError')
      });
      aspect.after(this.printTask, '_getPrintDefinition', lang.hitch(this, 'printDefInspector'), false);
      /*this.map.on('extent-change', lang.hitch(this, function() {
        this.forceScaleNTB.set('value', this.map.getScale());
      }));
      this.forceScaleNTB.set('value', this.map.getScale());*/
    },
    printDefInspector: function(printDef) {
      //console.log(printDef);
      //do what you want here then return the object.
      if (this.preserve.preserveScale === 'force') {
        printDef.mapOptions.scale = this.preserve.forcedScale;
      }
      return printDef;
    },
    _handleError: function(err) {
      console.log('print widget load error: ', err);
    },
    _handlePrintInfo: function(data) {
      var Layout_Template = array.filter(data.parameters, function(param) {
        return param.name === "Layout_Template";
      });
      if (Layout_Template.length === 0) {
        console.log("print service parameters name for templates must be \"Layout_Template\"");
        return;
      }
      // var layoutItems = array.map(Layout_Template[0].choiceList, function(item) {
      //   return {
      //     name: item,
      //     id: item
      //   };
      // });
      // layoutItems.sort(function(a, b) {
      //   return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
      // });
      // var layout = new Memory({
      //   data: layoutItems
      // });
      // this.layoutDijit.set('store', layout);
      var layoutItems = array.map(Layout_Template[0].choiceList, function(item) {
        return {
          label: item,
          value: item
        };
      });
      layoutItems.sort(function(a, b) {
        return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);
      });
      this.layoutDijit.addOption(layoutItems);
      if (this.defaultLayout) {
        this.layoutDijit.set('value', this.defaultLayout);
      } else {
        this.layoutDijit.set('value', Layout_Template[0].defaultValue);
      }

      var Format = array.filter(data.parameters, function(param) {
        return param.name === "Format";
      });
      if (Format.length === 0) {
        console.log("print service parameters name for format must be \"Format\"");
        return;
      }
      // var formatItems = array.map(Format[0].choiceList, function(item) {
      //   return {
      //     name: item,
      //     id: item
      //   };
      // });
      // formatItems.sort(function(a, b) {
      //   return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
      // });
      // var format = new Memory({
      //   data: formatItems
      // });
      // this.formatDijit.set('store', format);
      var formatItems = array.map(Format[0].choiceList, function(item) {
        return {
          label: item,
          value: item
        };
      });
      formatItems.sort(function(a, b) {
        return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);
      });
      this.formatDijit.addOption(formatItems);
      if (this.defaultFormat) {
        this.formatDijit.set('value', this.defaultFormat);
      } else {
        this.formatDijit.set('value', Format[0].defaultValue);
      }

    },
    print: function() {
      if (this.printSettingsFormDijit.isValid()) {
        var form = this.printSettingsFormDijit.get('value');
        lang.mixin(form, this.layoutMetadataDijit.get('value'));
        this.preserve = this.preserveFormDijit.get('value');
        lang.mixin(form, this.preserve);
        this.layoutForm = this.layoutFormDijit.get('value');
        var mapQualityForm = this.mapQualityFormDijit.get('value');
        var mapOnlyForm = this.mapOnlyFormDijit.get('value');
        lang.mixin(mapOnlyForm, mapQualityForm);

        var template = new PrintTemplate();
        template.format = form.format;
        template.layout = form.layout;
        template.preserveScale = (form.preserveScale === 'true' || form.preserveScale === 'force');
        template.label = form.title;
        template.exportOptions = mapOnlyForm;
        template.layoutOptions = {
          authorText: form.author,
          copyrightText: form.copyright,
          legendLayers: (this.layoutForm.legend.length > 0 && this.layoutForm.legend[0]) ? null : [],
          titleText: form.title //,
          //scalebarUnit: this.layoutForm.scalebarUnit
        };
        this.printparams.template = template;
        var fileHandel = this.printTask.execute(this.printparams);

        var result = new printResultDijit({
          count: this.count.toString(),
          icon: (form.format === "PDF") ? this.pdfIcon : this.imageIcon,
          docName: form.title,
          title: form.format + ', ' + form.layout,
          fileHandle: fileHandel,
          nls: this.nls
        }).placeAt(this.printResultsNode, 'last');
        result.startup();
        Style.set(this.clearActionBarNode, 'display', 'block');
        this.count++;
      } else {
        this.printSettingsFormDijit.validate();
      }
    },
    clearResults: function() {
      domConstruct.empty(this.printResultsNode);
      Style.set(this.clearActionBarNode, 'display', 'none');
      this.count = 1;
    },
    updateAuthor: function(user) {
      user = user || '';
      if (user) {
        this.authorTB.set('value', user);
      }
    },
    getCurrentMapScale: function() {
      this.forceScaleNTB.set('value', this.map.getScale());
    }
  });

  // Print result dijit
  var printResultDijit = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    widgetsInTemplate: true,
    templateString: printResultTemplate,
    url: null,
    postCreate: function() {
      this.inherited(arguments);
      this.fileHandle.then(lang.hitch(this, '_onPrintComplete'), lang.hitch(this, '_onPrintError'));
    },
    _onPrintComplete: function(data) {
      if (data.url) {
        this.url = data.url;
        this.nameNode.innerHTML = '<span class="bold">' + this.docName + '</span>';
        domClass.add(this.resultNode, "printResultHover");
      } else {
        this._onPrintError(this.nls.printError);
      }
    },
    _onPrintError: function(err) {
      console.log(err);
      this.nameNode.innerHTML = '<span class="bold">' + this.nls.printError + '</span>';
      domClass.add(this.resultNode, "printResultError");
    },
    _openPrint: function() {
      if (this.url !== null) {
        window.open(this.url);
      }
    }
  });
  return PrintDijit;
});