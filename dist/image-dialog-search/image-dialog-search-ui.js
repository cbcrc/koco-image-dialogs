'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _imageDialogSearch = require('text!./image-dialog-search.html');

var _imageDialogSearch2 = _interopRequireDefault(_imageDialogSearch);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _lastSearchSnapshot = require('./last-search-snapshot');

var _lastSearchSnapshot2 = _interopRequireDefault(_lastSearchSnapshot);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _contentDialogSearchBaseViewmodel = require('content-dialog-search-base-viewmodel');

var _contentDialogSearchBaseViewmodel2 = _interopRequireDefault(_contentDialogSearchBaseViewmodel);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _signalEmitter = require('signal-emitter');

var _signalEmitter2 = _interopRequireDefault(_signalEmitter);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultSearchFields = {
    startDate: null,
    endDate: null,
    keywords: '',
    myImages: false,
    codeZones: [],
    contentTypeId: 19,
    directoryCodeName: null,
    subDirectoryCodeName: null
};

// default values here are based on what was available
// during development of Tango, pass in values appropriate
// to your usage in params.imageSourceConfig
var defaultImageContentTypes = [{
    name: 'Picto',
    id: 19,
    apiResourceName: 'images',
    configurationApiResourceName: 'images/configuration'
}, {
    name: 'GHT1T',
    id: 20,
    apiResourceName: 'images/ght1t',
    configurationApiResourceName: 'zones-for-images'
}];

var ImageDialogSearchViewModel = function ImageDialogSearchViewModel(params /*, componentInfo*/) {
    var self = this;

    self.zones = _knockout2.default.observableArray();
    self.cloudinaryDirectories = _knockout2.default.observableArray();
    self.cloudinarySubDirectories = _knockout2.default.observableArray();
    self.settings = params || {};
    self.api = self.settings.api;

    // merge user-supplied config if present
    self.allImageContentTypes = defaultImageContentTypes;
    if (!_lodash2.default.isUndefined(params.imageSourceConfig)) {
        if (_lodash2.default.has(params.imageSourceConfig, 'picto')) {
            var pictoConfig = _lodash2.default.find(self.allImageContentTypes, {
                id: 19
            });
            _jquery2.default.extend(pictoConfig, params.imageSourceConfig['picto']);
        }
        if (_lodash2.default.has(params.imageSourceConfig, 'ght1t')) {
            var ght1tConfig = _lodash2.default.find(self.allImageContentTypes, {
                id: 20
            });
            _jquery2.default.extend(ght1tConfig, params.imageSourceConfig['ght1t']);
        }
    }

    self.translated = {
        dateInterval: _i18next2.default.t('koco-image-dialogs.date-interval'),
        defaultTitle: _i18next2.default.t('koco-image-dialogs.notitle'),
        myImages: _i18next2.default.t('koco-image-dialogs.image-search-results-default-title'),
        allDirectoriesPlaceholder: _i18next2.default.t('koco-image-dialogs.image-search-placeholder-all-directories'),
        allSubDirectoriesPlaceholder: _i18next2.default.t('koco-image-dialogs.image-search-placeholder-all-subdirectories'),
        keywordsPlaceholder: _i18next2.default.t('koco-image-dialogs.image-search-placeholder-keywords'),
        zonePlaceholder: _i18next2.default.t('koco-image-dialogs.image-search-placeholder-zone')
    };

    self.apiResourceName = _knockout2.default.pureComputed(function () {
        var resourceName = _lodash2.default.find(self.allImageContentTypes, {
            id: self.searchFields.contentTypeId()
        }).apiResourceName;
        return !_lodash2.default.isUndefined(resourceName) ? resourceName : '';
    });

    self.contentTypes = _lodash2.default.filter(self.allImageContentTypes, function (contentType) {
        return _lodash2.default.any(self.settings.contentTypeIds, function (contentTypeId) {
            return contentType.id === contentTypeId;
        });
    });

    var contentDialogSearchViewModelParams = {
        defaultSearchFields: defaultSearchFields,
        isSame: params.isSame,
        selected: params.selected,
        searchOnDisplay: params.searchOnDisplay,
        api: self.api,
        apiResourceName: self.apiResourceName,
        lastSearchSnapshot: _lastSearchSnapshot2.default
    };

    _contentDialogSearchBaseViewmodel2.default.call(self, contentDialogSearchViewModelParams);

    self.koDisposer.add(self.apiResourceName);

    self.onImageRemoved = function (idAsUrl) {
        self.items.remove(function (item) {
            return item.idAsUrl === idAsUrl;
        });
    };

    _signalEmitter2.default.addListener('image:removed', self.onImageRemoved);

    self.activate();
};

ImageDialogSearchViewModel.prototype = Object.create(_contentDialogSearchBaseViewmodel2.default.prototype);
ImageDialogSearchViewModel.prototype.constructor = ImageDialogSearchViewModel;

ImageDialogSearchViewModel.prototype.getSearchArgumentsFromFields = function () {
    var self = this;

    //TODO: simplify this function

    var searchArguments = {
        zoneIds: self.searchFields.codeZones()
    };

    if (self.settings.dimensions) {
        searchArguments.dimensions = encodeURIComponent(JSON.stringify(self.settings.dimensions));
    }

    if (self.searchFields.startDate()) {
        searchArguments.startDate = self.searchFields.startDate();
    }

    if (self.searchFields.endDate()) {
        searchArguments.endDate = self.searchFields.endDate();
    }

    //todo: on devrait permettre de spécifier l'auteur plutôt que seulement 'mes images'
    if (self.searchFields.myImages()) {
        searchArguments.createdBy = self.api.user().userName;
    }

    if (self.searchFields.keywords()) {
        searchArguments.keywords = self.searchFields.keywords();
    }

    if (self.searchFields.directoryCodeName()) {
        searchArguments.directoryCodeName = self.searchFields.directoryCodeName();
    }

    if (self.searchFields.subDirectoryCodeName()) {
        searchArguments.subDirectoryCodeName = self.searchFields.subDirectoryCodeName();
    }

    return searchArguments;
};

ImageDialogSearchViewModel.prototype.loadLookups = function () {
    var self = this;

    var contentTypesInUse = self.settings.contentTypeIds;
    var pictoInUse = _lodash2.default.contains(contentTypesInUse, 19);
    var ght1tInUse = _lodash2.default.contains(contentTypesInUse, 20);

    var doPictoLookups = function doPictoLookups() {
        var configurationApiResourceName = _lodash2.default.find(self.allImageContentTypes, {
            id: 19
        }).configurationApiResourceName;
        return self.api.getJson(configurationApiResourceName, {
            success: function success(cloudinaryLookups) {
                self.cloudinaryDirectories(cloudinaryLookups.directoryCodeNames);
                self.cloudinarySubDirectories(cloudinaryLookups.subDirectoryCodeNames);
            }
        });
    };

    var doGht1tLookups = function doGht1tLookups() {
        var configurationApiResourceName = _lodash2.default.find(self.allImageContentTypes, {
            id: 20
        }).configurationApiResourceName;
        return self.api.getJson(configurationApiResourceName, {
            success: function success(zonesLookups) {
                self.zones(zonesLookups);
            }
        });
    };

    // either do the lookup for the respective source, or 'false' which will fulfill
    // that segment of the promise
    return _jquery2.default.when(ght1tInUse ? doGht1tLookups.call(self) : false, pictoInUse ? doPictoLookups.call(self) : false);
};

ImageDialogSearchViewModel.prototype.correctLastSearchSnapshot = function (lastSearchSnapshot) {
    var self = this;

    if (lastSearchSnapshot.searchFields) {
        var searchFieldsContentTypeId = lastSearchSnapshot.searchFields.contentTypeId;

        if (!searchFieldsContentTypeId || !_lodash2.default.any(self.contentTypes, function (contentType) {
            return contentType.id === searchFieldsContentTypeId;
        })) {
            lastSearchSnapshot.searchFields.contentTypeId = self.contentTypes[0].id;
        }
    }

    return lastSearchSnapshot;
};

ImageDialogSearchViewModel.prototype.dispose = function () {
    var self = this;

    _contentDialogSearchBaseViewmodel2.default.prototype.dispose.call(self);

    _signalEmitter2.default.removeListener('image:removed', self.onImageRemoved);
};

exports.default = {
    viewModel: {
        createViewModel: function createViewModel(params, componentInfo) {
            return new ImageDialogSearchViewModel(params, componentInfo);
        }
    },
    template: _imageDialogSearch2.default
};