sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/Device"
], function (UIComponent, JSONModel, Device) {
   "use strict";
   return UIComponent.extend("Zmaterial.Component", {
      metadata : {
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            manifest: "json"
      },
      init : function () {
         // call the init function of the parent
         UIComponent.prototype.init.apply(this, arguments);
	    // this.getRouter().initialize();
	    this.getRouter().initialize();
	    var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
	    this.setModel(oModel, "device");
      }
   });
});