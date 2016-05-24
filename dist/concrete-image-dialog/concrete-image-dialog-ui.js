'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _concreteImageDialog = require('text!./concrete-image-dialog.html');

var _concreteImageDialog2 = _interopRequireDefault(_concreteImageDialog);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _imageDialogUiBase = require('../image-dialog-ui-base');

var _imageDialogUiBase2 = _interopRequireDefault(_imageDialogUiBase);

var _contentDialogBaseViewmodel = require('content-dialog-base-viewmodel');

var _contentDialogBaseViewmodel2 = _interopRequireDefault(_contentDialogBaseViewmodel);

var _mappingUtilities = require('mapping-utilities');

var _mappingUtilities2 = _interopRequireDefault(_mappingUtilities);

var _signalEmitter = require('signal-emitter');

var _signalEmitter2 = _interopRequireDefault(_signalEmitter);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Ce dialog est destiné à fonctionner avec tiny-mce
//il ne recoit pas en input un conceptual-image, ni un concrete-image
//il recoit l'url de l'image et fait un appel à l'api pour obtenir l'information nécessaire
//en ce sens, il devrait peut-être être renommé (on pourrait éventullement avoir un vrai concrete-image-dialog)

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

var ConcreteImageDialogViewModel = function ConcreteImageDialogViewModel(settings /*, componentInfo*/) {
    var self = this;

    self.params = self.getParams(settings);
    self.api = self.params.api;
    self.i18n = _i18next2.default;

    var contentDialogViewModelParams = {
        dialogTitle: 'Images',
        originalItem: _knockout2.default.observable(),
        defaultItem: defaultItem,
        close: settings.close,
        isSearchable: true,
        api: self.api
    };

    self.translated = {
        closeLabel: self.i18n.t('koco-image-dialogs.dialog-cancel'),
        saveLabel: self.i18n.t('koco-image-dialogs.dialog-save'),
        altLabel: self.i18n.t('koco-image-dialogs.concrete-dialog-edit-label-alt'),
        legendLabel: self.i18n.t('koco-image-dialogs.concrete-dialog-edit-label-legend'),
        creditsLabel: self.i18n.t('koco-image-dialogs.concrete-dialog-edit-label-credits'),
        agencyLabel: self.i18n.t('koco-image-dialogs.concrete-dialog-edit-label-agency'),
        alignmentLabel: self.i18n.t('koco-image-dialogs.concrete-dialog-edit-label-alignment'),
        leftLabel: self.i18n.t('koco-image-dialogs.concrete-dialog-edit-label-left'),
        centreLabel: self.i18n.t('koco-image-dialogs.concrete-dialog-edit-label-center'),
        rightLabel: self.i18n.t('koco-image-dialogs.concrete-dialog-edit-label-right')
    };

    _contentDialogBaseViewmodel2.default.call(self, contentDialogViewModelParams);

    self.canDeleteImage = _knockout2.default.pureComputed(self.canDeleteImage.bind(self));
    self.koDisposer.add(self.canDeleteImage);

    var align = 'left';

    if (self.params && self.params.align) {
        align = self.params.align;
    }

    self.align = _knockout2.default.observable(align);
    self.imageForLineups = _knockout2.default.observable(false);
    self.selectedConcreteImage = _knockout2.default.observable();

    self.isCloudinary = _knockout2.default.pureComputed(self.getIsCloudinary.bind(self));
    self.koDisposer.add(self.isCloudinary);

    self.activate();
};

ConcreteImageDialogViewModel.prototype = Object.create(_imageDialogUiBase2.default.prototype);
ConcreteImageDialogViewModel.prototype.constructor = ConcreteImageDialogViewModel;

ConcreteImageDialogViewModel.prototype.start = function () {
    var self = this;

    var concreteImageUrl = _knockout2.default.unwrap(self.params.concreteImageUrl);

    if (concreteImageUrl) {
        return self.api.getJson('images/selected', {
            data: _jquery2.default.param({
                url: concreteImageUrl
            }, true),
            success: function success(conceptualImageWithSelectedImage) {
                if (conceptualImageWithSelectedImage && conceptualImageWithSelectedImage.conceptualImage) {
                    var originalItem = conceptualImageWithSelectedImage.conceptualImage;

                    if (self.params.alt) {
                        originalItem.alt = self.params.alt;
                    }

                    if (self.params.legend) {
                        originalItem.legend = self.params.legend;
                    }

                    if (self.params.pressAgency) {
                        originalItem.pressAgency = self.params.pressAgency;
                    }

                    if (self.params.imageCredits) {
                        originalItem.imageCredits = self.params.imageCredits;
                    }

                    self.selectedConcreteImage(conceptualImageWithSelectedImage.selectedImage);
                    self.originalItem(originalItem);
                    self.selectItem(originalItem);
                } else {
                    self.selectItem(null);
                }
            }
        });
    } else {
        self.selectItem(null);
    }
};

ConcreteImageDialogViewModel.prototype.selectItem = function (inputModel) {
    var self = this;

    self.selectedConcreteImage(null);
    _imageDialogUiBase2.default.prototype.selectItem.call(self, inputModel);
};

ConcreteImageDialogViewModel.prototype.getSearchOnDisplay = function () {
    var self = this;

    return !_knockout2.default.unwrap(self.params.concreteImageUrl);
};

ConcreteImageDialogViewModel.prototype.toOutputModel = function () {
    var self = this;

    var conceptualImage = _contentDialogBaseViewmodel2.default.prototype.toOutputModel.call(self);
    var concreteImage = _mappingUtilities2.default.toJS(self.selectedConcreteImage);

    if (self.imageForLineups()) {
        _signalEmitter2.default.dispatch('image:imageForLineups', [conceptualImage]);
    }

    return {
        conceptualImage: conceptualImage,
        concreteImage: concreteImage,
        align: self.align()
    };
};

ConcreteImageDialogViewModel.prototype.validate = function () {
    var self = this;

    if (!self.selectedConcreteImage()) {
        return self.i18n.t('koco-image-dialogs.concrete-image-dialog-select-image-format');
    }

    _contentDialogBaseViewmodel2.default.prototype.validate.call(self);
};

exports.default = {
    viewModel: {
        createViewModel: function createViewModel(params, componentInfo) {
            return new ConcreteImageDialogViewModel(params, componentInfo);
        }
    },
    template: _concreteImageDialog2.default
};