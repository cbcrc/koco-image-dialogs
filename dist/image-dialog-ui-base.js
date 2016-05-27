(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'knockout', 'jquery', 'content-dialog-base-viewmodel', 'toastr', 'lodash', 'koco', 'koco-mapping-utilities', 'koco-modaler', 'koco-signal-emitter'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('knockout'), require('jquery'), require('content-dialog-base-viewmodel'), require('toastr'), require('lodash'), require('koco'), require('koco-mapping-utilities'), require('koco-modaler'), require('koco-signal-emitter'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.knockout, global.jquery, global.contentDialogBaseViewmodel, global.toastr, global.lodash, global.koco, global.kocoMappingUtilities, global.kocoModaler, global.kocoSignalEmitter);
        global.imageDialogUiBase = mod.exports;
    }
})(this, function (exports, _knockout, _jquery, _contentDialogBaseViewmodel, _toastr, _lodash, _koco, _kocoMappingUtilities, _kocoModaler, _kocoSignalEmitter) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _knockout2 = _interopRequireDefault(_knockout);

    var _jquery2 = _interopRequireDefault(_jquery);

    var _contentDialogBaseViewmodel2 = _interopRequireDefault(_contentDialogBaseViewmodel);

    var _toastr2 = _interopRequireDefault(_toastr);

    var _lodash2 = _interopRequireDefault(_lodash);

    var _koco2 = _interopRequireDefault(_koco);

    var _kocoMappingUtilities2 = _interopRequireDefault(_kocoMappingUtilities);

    var _kocoModaler2 = _interopRequireDefault(_kocoModaler);

    var _kocoSignalEmitter2 = _interopRequireDefault(_kocoSignalEmitter);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var defaultParams = {
        dimensions: [],
        contentTypeIds: [20]
    }; //Notes: Ce plugin recoit un Media et retourne un Media (voir Scoop API)

    var ImageDialogBaseViewModel = function ImageDialogBaseViewModel() {};

    ImageDialogBaseViewModel.prototype = Object.create(_contentDialogBaseViewmodel2.default.prototype);
    ImageDialogBaseViewModel.prototype.constructor = ImageDialogBaseViewModel;

    ImageDialogBaseViewModel.prototype.getHasSelectedItem = function () {
        var self = this;

        var selectedItem = _kocoMappingUtilities2.default.toJS(self.selectedItem);

        return selectedItem && selectedItem.idAsUrl;
    };

    ImageDialogBaseViewModel.prototype.getIsCloudinary = function () {
        var self = this;

        var selectedItem = _kocoMappingUtilities2.default.toJS(self.selectedItem);

        if (selectedItem && selectedItem.contentType && selectedItem.contentType.id === 19) {
            return true;
        }

        return false;
    };

    ImageDialogBaseViewModel.prototype.getParams = function (settings) {
        var self = this;

        var params = _jquery2.default.extend({}, defaultParams, settings.params.settings);

        if (_koco2.default.router.context().route.url.indexOf('mu-contents') > -1) {
            params.contentTypeIds = [19, 20];
        }

        return params;
    };

    ImageDialogBaseViewModel.prototype.canDeleteImage = function () {
        var self = this;

        var resource = _kocoMappingUtilities2.default.toJS(self.selectedItem);

        if (resource && resource.contentType && resource.contentType.id === 20 && resource.idAsUrl) {
            return true;
        }

        return false;
    };

    ImageDialogBaseViewModel.prototype.isSame = function (item) {
        var self = this;

        var selectedItem = _kocoMappingUtilities2.default.toJS(self.selectedItem);

        return selectedItem && item && selectedItem.idAsUrl === item.idAsUrl;
    };

    ImageDialogBaseViewModel.prototype.deleteImage = function () {
        var self = this;

        var resource = this.selectedItem();
        if (typeof resource === 'undefined' || resource === null) {
            _toastr2.default.error('Vous devez sélectionner une image.');
            return false;
        }

        _kocoModaler2.default.show('confirm', {
            message: 'Attention, vous vous apprêtez à supprimer cette image de la banque d\'images (GHT1T). Voulez-vous réellement supprimer cette image?'
        }).then(function (confirm) {
            if (confirm) {

                var idAsUrl = resource.idAsUrl();

                // @TODO test this more thoroughly, we are relying on the remove binding to provide a context that owns self.api
                self.api.delete(_lodash2.default.template('images?url=<%= id %>')({
                    id: idAsUrl
                })).done(function () {
                    _kocoSignalEmitter2.default.dispatch('image:removed', [idAsUrl]);
                    self.selectedItem(null);
                    _toastr2.default.info('L\'image a été supprimée.');
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    _toastr2.default.error('Impossible de supprimer l\'image.');
                });
            }
        });
    };

    exports.default = ImageDialogBaseViewModel;
});