var oMasterView;
sap.ui.define([
	"Zmaterial/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	'sap/ui/core/Fragment',
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/m/BusyDialog"
], function(BaseController, History, MessageToast, Fragment, JSONModel, jQuery, BusyDialog) {
	"use strict";
	var matnr;
	return BaseController.extend("Zmaterial.controller.Detail", {
		onInit: function() {
			this._formFragments = {};
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("detail").attachMatched(this._onRouteDetailMatched, this);
			oRouter.getRoute("create").attachMatched(this._onRouteCreateMatched, this);
		},
		onNavBack: function(oEvent) {
			var oHistory, sPreviousHash;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("apphome", {}, true);
			}
		},
		save: function() {
			var busyDialog = new BusyDialog();
			busyDialog.open();
			var that = this;
			var material = {};
			material.Matnr = this.getView().byId("MaterialId").getValue();
			material.Maktx = this.getView().byId("Description").getValue();
			material.Mbrsh = this.getView().byId("IndSector").getSelectedItem().getKey();
			material.Mtart = this.getView().byId("MatlType").getSelectedItem().getKey();
			material.Matkl = this.getView().byId("MatlGroup").getSelectedItem().getKey();
			material.Meins = this.getView().byId("BaseUom").getSelectedItem().getKey();

			var oModel = this.getOwnerComponent().getModel("zmaterial_srv");
			var promise = new Promise(function(resolve, reject) {
				oModel.create("/ZSMARASet", material, {
					success: function(data) {
						// setTimeout(resolve, 2000);
						resolve();
					}
				});
			});
			promise.then(function(){
				busyDialog.close();
				sap.ui.core.UIComponent.getRouterFor(that).navTo("apphome");
			});
		},
		_getFormFragment: function(sFragmentName) {
			var pFormFragment = this._formFragments[sFragmentName],
				oView = this.getView();

			if (!pFormFragment) {
				pFormFragment = Fragment.load({
					id: oView.getId(),
					name: "Zmaterial.fragment." + sFragmentName
				});
				this._formFragments[sFragmentName] = pFormFragment;
			}

			return pFormFragment;
		},

		_showFormFragment: function(sFragmentName) {
			var oPage = this.byId("page");
			var that = this;
			return new Promise(function(resolve, reject) {
				oPage.removeAllContent();
				that._getFormFragment(sFragmentName).then(function(oVBox) {
					oPage.insertContent(oVBox);
					resolve();
				});
			});
		},
		_toggleButtonsAndView: function(bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);

			// Set the right form type
			this._showFormFragment(bEdit ? "Change" : "Display");
		},
		_onRouteDetailMatched: function(oEvent) {
			var that = this;
			var oView = this.getView();
			var oArgs = oEvent.getParameter("arguments");
			oView.byId("edit").setVisible(true);
			oView.byId("save").setVisible(false);
			oView.byId("cancel").setVisible(false);

			var oMater = this.getOwnerComponent().getModel("zmaterial_srv");
			oMater.read("/ZSMARASet(Matnr='" + oArgs.material + "')", {
				success: function(oData, resonse) {
					oView.setModel(new JSONModel(oData), "materObj");
					that._showFormFragment("Display");
				}
			});
		},
		_onRouteCreateMatched: function(oEvent) {
			var oView = this.getView();
			oView.byId("edit").setVisible(false);
			oView.byId("save").setVisible(true);
			oView.byId("cancel").setVisible(true);
			this._showFormFragment("Change").then(function() {
				oView.byId("MaterialId").setValue();
				oView.byId("Description").setValue();
				oView.byId("IndSector").setSelectedKey();
				oView.byId("MatlType").setSelectedKey();
				oView.byId("MatlGroup").setSelectedKey();
				oView.byId("BaseUom").setSelectedKey();
			});
		},
		handleEditPress: function(oEvent) {
			var oView = this.getView();
			oView.byId("edit").setVisible(false);
			oView.byId("save").setVisible(true);
			oView.byId("cancel").setVisible(true);

			this._showFormFragment("Change").then(function() {
				var materObjModel = oView.getModel("materObj");
				var data = materObjModel.getData();
				oView.byId("MaterialId").setValue(data.Matnr);
				oView.byId("Description").setValue(data.Maktx);
				oView.byId("IndSector").setSelectedKey(data.Mbrsh);
				oView.byId("MatlType").setSelectedKey(data.Mtart);
				oView.byId("MatlGroup").setSelectedKey(data.Matkl);
				if (data.Meins === "CV") {
					oView.byId("BaseUom").setSelectedKey("CS");
				} else {
					oView.byId("BaseUom").setSelectedKey(data.Meins);
				}
			});
		}
	});
});