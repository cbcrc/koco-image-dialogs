'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _conceptualImageDialog = require('text!./conceptual-image-dialog.html');

var _conceptualImageDialog2 = _interopRequireDefault(_conceptualImageDialog);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _imageDialogUiBase = require('../image-dialog-ui-base');

var _imageDialogUiBase2 = _interopRequireDefault(_imageDialogUiBase);

var _contentDialogBaseViewmodel = require('content-dialog-base-viewmodel');

var _contentDialogBaseViewmodel2 = _interopRequireDefault(_contentDialogBaseViewmodel);

var _arrayUtilities = require('array-utilities');

var _arrayUtilities2 = _interopRequireDefault(_arrayUtilities);

var _mappingUtilities = require('mapping-utilities');

var _mappingUtilities2 = _interopRequireDefault(_mappingUtilities);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultContentTypeId = '20';

var defaultItem = {
    id: null,
    alt: '',
    title: '',
    legend: '',
    imageCredits: '',
    pressAgency: '',
    imageCollection: '',
    concreteImages: [],
    contentTypeId: defaultContentTypeId
};

var ConceptualImageDialogViewModel = function ConceptualImageDialogViewModel(settings /*, componentInfo*/) {
    var self = this;

    self.params = self.getParams(settings);

    self.translated = {
        dialogTitle: _i18next2.default.t('koco-image-dialogs.dialog-title'),
        dialogCancel: _i18next2.default.t('koco-image-dialogs.dialog-cancel'),
        dialogSave: _i18next2.default.t('koco-image-dialogs.dialog-save')
    };

    var originalItem = null;

    var conceptualImage = _mappingUtilities2.default.toJS(settings.params.conceptualImage);
    if (conceptualImage && _arrayUtilities2.default.isNotEmptyArray(conceptualImage.concreteImages)) {
        //TODO: Est-ce que le extend defaultItem est nécessaire!?
        originalItem = _jquery2.default.extend({}, defaultItem, conceptualImage);
    }

    var contentDialogViewModelParams = {
        originalItem: originalItem,
        defaultItem: defaultItem,
        close: settings.close,
        isSearchable: true,
        api: self.params.api
    };

    _contentDialogBaseViewmodel2.default.call(self, contentDialogViewModelParams);

    self.canDeleteImage = _knockout2.default.pureComputed(self.canDeleteImage.bind(self));
    self.koDisposer.add(self.canDeleteImage);

    self.activate();
};

ConceptualImageDialogViewModel.prototype = Object.create(_imageDialogUiBase2.default.prototype);
ConceptualImageDialogViewModel.prototype.constructor = ConceptualImageDialogViewModel;

exports.default = {
    viewModel: {
        createViewModel: function createViewModel(params, componentInfo) {
            return new ConceptualImageDialogViewModel(params, componentInfo);
        }
    },
    template: _conceptualImageDialog2.default
};