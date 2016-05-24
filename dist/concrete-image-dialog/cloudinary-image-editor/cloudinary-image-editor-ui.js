'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _cloudinaryImageEditor = require('text!./cloudinary-image-editor.html');

var _cloudinaryImageEditor2 = _interopRequireDefault(_cloudinaryImageEditor);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _imageUtilities = require('image-utilities');

var _imageUtilities2 = _interopRequireDefault(_imageUtilities);

var _mappingUtilities = require('mapping-utilities');

var _mappingUtilities2 = _interopRequireDefault(_mappingUtilities);

var _disposer = require('disposer');

var _disposer2 = _interopRequireDefault(_disposer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CloudinaryImagePicker = function CloudinaryImagePicker(params /*, componentInfo*/) {
    var self = this;

    self.defaultWidthTransformation = 300;

    self.koDisposer = new _disposer2.default();

    //TODO: Load from server (API)
    self.dimensionConfigsForKnownRatios = [{
        ratio: '4:3',
        dimensions: ['80x60', '100x75', '180x135', '300x225'],
        defaultWidthTransformation: 300
    }, {
        ratio: '16:9',
        dimensions: ['64x36', '98x55', '112x63', '135x76', '160x90', '205x115', '240x135', '300x169', '310x174', '352x198', '420x236', '480x270', '635x357'],
        defaultWidthTransformation: 635
    }];

    self.observableSelectedImage = params.selectedImage;

    self.selectedImage = _mappingUtilities2.default.toJS(params.selectedImage);
    self.selectedConcreteImage = _mappingUtilities2.default.toJS(params.selectedConcreteImage);

    var ratios = getRatios(self.selectedImage);

    self.ratios = _knockout2.default.observableArray(ratios);

    var ratioId;
    var widthTransformation = null;

    if (self.selectedConcreteImage) {
        ratioId = self.selectedConcreteImage.dimensionRatio;
        widthTransformation = _imageUtilities2.default.getWidthTransformationFromCloudinaryUrl(self.selectedConcreteImage.mediaLink.href);
    } else {
        ratioId = ratios[0].id;
    }

    self.ratio = _knockout2.default.observable(ratioId);

    var dimensionConfigs = getDimensionConfigsForCurrentRatio(ratioId, self.dimensionConfigsForKnownRatios);

    self.selectedConcreteImage = getTransformedConcreteImage(self, params, dimensionConfigs, widthTransformation);

    params.selectedConcreteImage(self.selectedConcreteImage);

    self.widthObservable = function (initialValue) {
        var _actual = _knockout2.default.observable(initialValue);

        var result = _knockout2.default.pureComputed({
            read: function read() {
                return _actual();
            },
            write: function write(newValue) {
                var parsed = parseFloat(newValue);
                var previous = _actual();

                if (isNaN(parsed) || parsed < 0 || parsed > self.sourceConcreteImg.width) {
                    //_actual.valueHasMutated();
                    _actual.notifySubscribers(previous);
                    //self.width.valueHasMutated();
                } else {
                        _actual(parsed);
                    }
            }
        }).extend({
            notify: 'always'
        });

        result.valueHasMutated = function () {
            _actual.valueHasMutated();
        };

        self.koDisposer.add(result);

        return result;
    };

    self.width = self.widthObservable(self.selectedConcreteImage.width);
    self.height = _knockout2.default.observable(self.selectedConcreteImage.height);

    self.dimensions = _knockout2.default.observableArray();
    self.dimension = _knockout2.default.observable();

    var ratioHasChanged = true;
    var ignoreRatioModification = false;
    var ignoreDimensionModification = false;

    updateDimensionsInfo(self, dimensionConfigs);

    self.koDisposer.add(self.dimension.subscribe(function () {
        if (ignoreDimensionModification) {
            ignoreDimensionModification = false;
        } else {
            var selectedDimension = self.dimension();

            var dimension = getDimensionFromString(selectedDimension, 'x');

            if (dimension) {
                self.width(dimension.width);
            }
        }
    }));

    self.koDisposer.add(self.width.subscribe(function () {
        var width = self.width();
        ratioId = self.ratio();

        dimensionConfigs = getDimensionConfigsForCurrentRatio(ratioId, self.dimensionConfigsForKnownRatios);
        self.selectedConcreteImage = getTransformedConcreteImage(self, params, dimensionConfigs, width);
        self.height(self.selectedConcreteImage.height);
        ignoreDimensionModification = true;
        updateDimensionsInfo(self, dimensionConfigs);
        params.selectedConcreteImage(self.selectedConcreteImage);
    }));

    self.koDisposer.add(params.$raw.selectedImage.subscribe(function () {
        self.selectedImage = _mappingUtilities2.default.toJS(params.selectedImage);
        var currentRatio = self.ratio();

        ratios = getRatios(self.selectedImage);

        if (_lodash2.default.any(ratios, function (rat) {
            return rat.id == currentRatio;
        })) {
            ratioHasChanged = false;
            self.ratios(ratios);
            self.ratio.valueHasMutated();
        } else {
            ignoreRatioModification = true;
            self.ratios(ratios);
            self.ratio(ratios[0].id);
        }
    }));

    self.koDisposer.add(self.ratio.subscribe(function () {
        if (ignoreRatioModification) {
            ignoreRatioModification = false;
        } else {
            ratioId = self.ratio();

            if (ratioHasChanged) {
                dimensionConfigs = getDimensionConfigsForCurrentRatio(ratioId, self.dimensionConfigsForKnownRatios);
                self.selectedConcreteImage = getTransformedConcreteImage(self, params, dimensionConfigs);

                if (self.width() == self.selectedConcreteImage.width) {
                    self.width.valueHasMutated();
                } else {
                    self.width(self.selectedConcreteImage.width);
                }
            } else {
                ratioHasChanged = true;
                self.width.valueHasMutated();
            }
        }
    }));

    return self;
};

function updateDimensionsInfo(self, dimensionConfigs) {
    var dimensions = dimensionConfigs.dimensions;
    var dimensionId = getDimensionIdFromWidthAndHeight(dimensions, self.selectedConcreteImage.width, self.selectedConcreteImage.height);

    if (dimensionId == 'custom') {
        dimensions.push({
            id: 'custom',
            name: 'dimension personnalisée'
        });
    }

    self.dimensions(dimensions);
    self.dimension(dimensionId);
}

function getTransformedConcreteImage(self, args, dimensionConfigs, widthTransformation) {
    self.sourceConcreteImg = _imageUtilities2.default.getConcreteImage(self.selectedImage, {
        preferedRatio: dimensionConfigs.ratio,
        defaultToClosestDimension: false
    });

    if (!widthTransformation) {
        widthTransformation = dimensionConfigs.defaultWidthTransformation || self.defaultWidthTransformation;
    }

    var href = _imageUtilities2.default.updateCloudinaryUrlWidthTransformation(self.sourceConcreteImg.mediaLink.href, widthTransformation);

    var height = getHeightFromWidthAndRatio(widthTransformation, dimensionConfigs.ratio);

    return {
        dimensionRatio: dimensionConfigs.ratio,
        mediaLink: {
            href: href
        },
        width: widthTransformation,
        height: height
    };
}

function getDimensionIdFromWidthAndHeight(dimensions, width, height) {
    if (dimensions.length) {
        var dimId = width + 'x' + height;

        var dimension = _lodash2.default.find(dimensions, function (dim) {
            return dim.id == dimId;
        });

        if (dimension) {
            return dimension.id;
        } else {
            return 'custom';
        }
    }

    return '';
}

function getRatios(conceptualImage) {
    var ratios = [];

    if (conceptualImage && conceptualImage.concreteImages && conceptualImage.concreteImages.length) {
        for (var i = 0; i < conceptualImage.concreteImages.length; i++) {
            var concreteImage = conceptualImage.concreteImages[i];

            ratios.push({
                name: concreteImage.dimensionRatio,
                id: concreteImage.dimensionRatio
            });
        }
    }

    return ratios;
}

function getDimensionConfigsForCurrentRatio(ratio, dimensionConfigsForKnownRatios) {
    var dimensionConfigsForCurrentRatio = _lodash2.default.find(dimensionConfigsForKnownRatios, function (dimensionConfigsForKnownRatio) {
        return dimensionConfigsForKnownRatio.ratio == ratio;
    });

    var dimensions = [];
    var defaultWidthTransformation = '';

    if (dimensionConfigsForCurrentRatio) {
        dimensions = dimensionConfigsForCurrentRatio.dimensions;
        defaultWidthTransformation = dimensionConfigsForCurrentRatio.defaultWidthTransformation;
    }

    var result = {
        dimensions: _lodash2.default.map(dimensions, function (dimension) {
            return {
                id: dimension,
                name: dimension
            };
        }),
        defaultWidthTransformation: defaultWidthTransformation,
        ratio: ratio
    };

    //result.dimensions.push({ id: 'custom', name: 'dimension personnalisée' });

    return result;
}

function getHeightFromWidthAndRatio(width, ratio) {
    var dimension = getDimensionFromString(ratio, ':');

    if (dimension) {
        var height = width * dimension.height / dimension.width;

        return Math.round(height);
    }

    return null;
}

function getDimensionFromString(string, separator) {
    if (!string || string == 'custom') {
        return null;
    }

    var x = string.split(separator);

    if (x.length && x[0] && x[1]) {
        return {
            width: parseInt(x[0]),
            height: parseInt(x[1])
        };
    }

    return null;
}

CloudinaryImagePicker.prototype.dispose = function () {
    var self = this;

    self.koDisposer.dispose();
};

exports.default = {
    viewModel: {
        createViewModel: function createViewModel(params, componentInfo) {
            return new CloudinaryImagePicker(params, componentInfo);
        }
    },
    template: _cloudinaryImageEditor2.default
};