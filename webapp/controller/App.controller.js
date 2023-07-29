var oMasterView;
sap.ui.define([
	"Zmaterial/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function(BaseController, JSONModel, Fragment, Dialog, Button, mobileLibrary, Text, Filter, FilterOperator) {
	"use strict";
	return BaseController.extend("Zmaterial.controller.App", {
		onInit: function() {
			oMasterView = this;
			var oView = this.getView();
			var oMater = this.getOwnerComponent().getModel("zmaterial_srv");
			oMater.read("/ZSMARASet()", {
				success: function(oData, resonse) {
					oView.setModel(new JSONModel(oData), "jMater");
				}
			});
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("apphome").attachMatched(this._onRouteHomeMatched, this);
		},
		_onRouteHomeMatched: function() {
			var oView = this.getView();
			var oMater = this.getOwnerComponent().getModel("zmaterial_srv");
			oMater.read("/ZSMARASet()", {
				success: function(oData, resonse) {
					oView.setModel(new JSONModel(oData), "jMater");
				}
			});
		},
		modifyMaterial: function(oEvent) {
			var oView = this.getView();
			var item = oEvent.getSource().getBindingContext('jMater').getObject();
			var clickIndex = oEvent.getSource().getBindingContext('jMater').getPath().split("/")[2];
			var oDialog = oView.byId("FrgDetail");
			if (!oDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "Zmaterial.view.Deatil",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					oView.byId("MaterialId").setValue(item.Matnr);
					oView.byId("MaterialDec").setValue(item.Maktx);
					oView.byId("IndSector").setSelectedKey(item.Mbrsh);
					oView.byId("MatlType").setSelectedKey(item.Mtart);
					oView.byId("MatlGroup").setSelectedKey(item.Matkl);

					if (item.Meins === "CV") {
						oView.byId("BaseUom").setSelectedKey("CS");
					}
				});
			} else {
				oDialog.open();
				oView.byId("MaterialId").setValue(item.Matnr);
				oView.byId("MaterialDec").setValue(item.Maktx);
				oView.byId("IndSector").setSelectedKey(item.Mbrsh);
				oView.byId("MatlType").setSelectedKey(item.Mtart);
				oView.byId("MatlGroup").setSelectedKey(item.Matkl);
				if (item.Meins === "CV") {
					oView.byId("BaseUom").setSelectedKey("CS");
				}
			}
		},
		materialAdd: function(oEvent) {
			var oView = this.getView();
			var oDialog = oView.byId("FrgDetail");
			if (!oDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "Zmaterial.view.Deatil",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					oView.byId("MaterialId").setValue("");
					oView.byId("MaterialDec").setValue("");
					oView.byId("IndSector").setSelectedKey("");
					oView.byId("MatlType").setSelectedKey("");
					oView.byId("MatlGroup").setSelectedKey("");

				});
			} else {
				oDialog.open();
				oView.byId("MaterialId").setValue("");
				oView.byId("MaterialDec").setValue("");
				oView.byId("IndSector").setSelectedKey("");
				oView.byId("MatlType").setSelectedKey("");
				oView.byId("MatlGroup").setSelectedKey("");
			}
		},
		onClose: function() {
			this.byId("FrgDetail").close();
		},
		delMaterial: function(oEvent) {
			var oModel = this.getOwnerComponent().getModel("zmaterial_srv");
			var that = this;
			var DialogType = mobileLibrary.DialogType;
			var item = oEvent.getSource().getBindingContext('jMater').getObject();

			var oApproveDialog = new Dialog({
				type: DialogType.Message,
				title: "Confirm",
				content: new Text({
					text: "Do you want to delete this material?"
				}),
				beginButton: new Button({
					type: "Reject", //ButtonType.Emphasized,
					text: "Delete",
					icon: "sap-icon://delete",
					press: function() {
						oModel.remove("/ZSMARASet(Matnr='" + item.Matnr + "')", {
							success: function() {
								sap.m.MessageToast.show("Success");
								oApproveDialog.close();
								oModel.read("/ZSMARASet()", {
									success: function(oData, resonse) {
										that.getView().setModel(new JSONModel(oData), "jMater");
									}
								});
							}
						});
					}.bind(this)
				}),
				endButton: new Button({
					text: "Cancel",
					press: function() {
						oApproveDialog.close();
					}.bind(this)
				}),
				afterClose: function() {
					oApproveDialog.destroy();
				}
			});

			oApproveDialog.open();
		},
		okSave: function() {
			var that = this;
			var material = {};
			material.Matnr = this.getView().byId("MaterialId").getValue();
			material.Maktx = this.getView().byId("MaterialDec").getValue();
			material.Mbrsh = this.getView().byId("IndSector").getSelectedItem().getKey();
			material.Mtart = this.getView().byId("MatlType").getSelectedItem().getKey();
			material.Matkl = this.getView().byId("MatlGroup").getSelectedItem().getKey();
			material.Meins = this.getView().byId("BaseUom").getSelectedItem().getKey();

			var oModel = this.getOwnerComponent().getModel("zmaterial_srv");

			oModel.create("/ZSMARASet", material, {
				success: function(data) {
					sap.m.MessageToast.show("success");
					that.byId("FrgDetail").close();
					oModel.read("/ZSMARASet()", {
						success: function(oData, resonse) {
							that.getView().setModel(new JSONModel(oData), "jMater");
						}
					});
				}
			});
		},
		onCreate: function(oEvent) {
			// var item = oEvent.getSource().getBindingContext('jMater').getObject();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("create");
		},
		showDetail: function(oEvent) {
			var item = oEvent.getSource().getBindingContext('jMater').getObject();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("detail", {
				material: item.Matnr
			});
		},
		onSearch: function(oEvent){
			var sValue = oEvent.getSource().getValue();
			var oFilter = new Filter({
				filters:[
					new Filter(
						"Matnr",
						FilterOperator.Contains, 
						sValue
					),
					new Filter(
						"Maktx",
						FilterOperator.Contains, 
						sValue
					)
				],
				or: true
			});
			var oMaterialList = this.byId("materialList");
			var oBinding = oMaterialList.getBinding("items");
			oBinding.filter(oFilter);	
		}
	});
});