define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    './Print'
  ],
  function(declare, BaseWidget, Print) {
    return declare([BaseWidget], {
      baseClass: 'jimu-widget-print',
      name: 'Print',
      className: 'esri.widgets.Print',
      postCreate: function() {
        this.inherited(arguments);
        this.print = new Print({
          map: this.map,
          printTaskURL: this.config.serviceURL,
          defaultAuthor: this.config.defaultAuthor,
          defaultCopyright: this.config.defaultCopyright,
          defaultTitle: this.config.defaultTitle,
          defaultFormat: this.config.defaultFormat,
          defaultLayout: this.config.defaultLayout,
          nls: this.nls
        }).placeAt(this.printNode);
        this.print.startup();
      },
      onSignIn: function(user) {
        user = user || {};
        if (user.userId) {
          this.print.updateAuthor(user.userId);
        }
      }
    });
  });