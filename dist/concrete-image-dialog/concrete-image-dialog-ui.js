(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'knockout', 'jquery', '../image-dialog-ui-base', 'content-dialog-base-viewmodel', 'koco-mapping-utilities', 'koco-signal-emitter', 'i18next'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('knockout'), require('jquery'), require('../image-dialog-ui-base'), require('content-dialog-base-viewmodel'), require('koco-mapping-utilities'), require('koco-signal-emitter'), require('i18next'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.knockout, global.jquery, global.imageDialogUiBase, global.contentDialogBaseViewmodel, global.kocoMappingUtilities, global.kocoSignalEmitter, global.i18next);
    global.concreteImageDialogUi = mod.exports;
  }
})(this, function (exports, _knockout, _jquery, _imageDialogUiBase, _contentDialogBaseViewmodel, _kocoMappingUtilities, _kocoSignalEmitter, _i18next) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _knockout2 = _interopRequireDefault(_knockout);

  var _jquery2 = _interopRequireDefault(_jquery);

  var _imageDialogUiBase2 = _interopRequireDefault(_imageDialogUiBase);

  var _contentDialogBaseViewmodel2 = _interopRequireDefault(_contentDialogBaseViewmodel);

  var _kocoMappingUtilities2 = _interopRequireDefault(_kocoMappingUtilities);

  var _kocoSignalEmitter2 = _interopRequireDefault(_kocoSignalEmitter);

  var _i18next2 = _interopRequireDefault(_i18next);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var defaultContentTypeId = '20'; //Ce dialog est destiné à fonctionner avec tiny-mce
  //il ne recoit pas en input un conceptual-image, ni un concrete-image
  //il recoit l'url de l'image et fait un appel à l'api pour obtenir l'information nécessaire
  //en ce sens, il devrait peut-être être renommé (on pourrait éventullement avoir un vrai concrete-image-dialog)

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
      return self.api.fetch('images/selected?url=' + concreteImageUrl).then(function (conceptualImageWithSelectedImage) {
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
      });
    }

    self.selectItem(null);
    return Promise.resolve();
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
    var concreteImage = _kocoMappingUtilities2.default.toJS(self.selectedConcreteImage);

    if (self.imageForLineups()) {
      _kocoSignalEmitter2.default.dispatch('image:imageForLineups', [conceptualImage]);
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
    template: template
  };
});