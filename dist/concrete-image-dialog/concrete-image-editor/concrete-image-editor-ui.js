(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'knockout', 'jquery', 'lodash', 'koco-image-utilities', 'koco-mapping-utilities', 'koco-disposer'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('knockout'), require('jquery'), require('lodash'), require('koco-image-utilities'), require('koco-mapping-utilities'), require('koco-disposer'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.knockout, global.jquery, global.lodash, global.kocoImageUtilities, global.kocoMappingUtilities, global.kocoDisposer);
        global.concreteImageEditorUi = mod.exports;
    }
})(this, function (exports, _knockout, _jquery, _lodash, _kocoImageUtilities, _kocoMappingUtilities, _kocoDisposer) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _knockout2 = _interopRequireDefault(_knockout);

    var _jquery2 = _interopRequireDefault(_jquery);

    var _lodash2 = _interopRequireDefault(_lodash);

    var _kocoImageUtilities2 = _interopRequireDefault(_kocoImageUtilities);

    var _kocoMappingUtilities2 = _interopRequireDefault(_kocoMappingUtilities);

    var _kocoDisposer2 = _interopRequireDefault(_kocoDisposer);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /*
    args :
        {
            conceptualImage: observable conceptualImage
            concreteImage: observable concreteImage,
            dimensionRatios: ['16:9','4:3'] limiter pour les nouvelles
        }
    */

    var ConcreteImagesPickerViewModel = function ConcreteImagesPickerViewModel(params, componentInfo) {
        var self = this;

        self.params = params;

        var selectedImage = _kocoMappingUtilities2.default.toJS(self.params.selectedImage);
        var selectedConcreteImage = _kocoMappingUtilities2.default.toJS(self.params.selectedConcreteImage);

        var options = buildOptions(selectedImage);

        self.options = _knockout2.default.observableArray(options);

        if (!selectedConcreteImage) {
            //Attention: 2 type de DefaultConcreteImage (1 pour les previews de scoop et celui ci pour le default concrete image...)
            //en ce moment on est chanceux, c'est la meme taille qui est utilisée par défaut mais il faudra ajuster si ca change
            selectedConcreteImage = _kocoImageUtilities2.default.getDefaultConcreteImage(selectedImage);
        }

        var selectedOption = getConcreteImageHref(selectedConcreteImage);

        self.selectedOption = _knockout2.default.observable(selectedOption);

        self.params.selectedConcreteImage(selectedConcreteImage);

        self.koDisposer = new _kocoDisposer2.default();

        self.koDisposer.add(self.selectedOption.subscribe(function (newValue) {
            selectedOption = newValue;
            var concreteImage = null;

            if (selectedOption) {
                concreteImage = _lodash2.default.find(selectedImage.concreteImages, function (c) {
                    return c.mediaLink.href == selectedOption;
                });
            }

            self.params.selectedConcreteImage(concreteImage || null);
        }));

        self.koDisposer.add(self.params.$raw.selectedImage.subscribe(function () {
            selectedImage = _kocoMappingUtilities2.default.toJS(self.params.selectedImage);
            options = buildOptions(selectedImage);
            self.options(options);
            selectedConcreteImage = _kocoImageUtilities2.default.getDefaultConcreteImage(selectedImage);
            selectedOption = getConcreteImageHref(selectedConcreteImage);
            self.selectedOption(selectedOption);
            self.params.selectedConcreteImage(selectedConcreteImage);
        }));
    };

    ConcreteImagesPickerViewModel.prototype.dispose = function () {
        var self = this;

        self.koDisposer.dispose();
    };

    function getConcreteImageHref(selectedConcreteImage) {
        var selectedOption = '';

        if (selectedConcreteImage && selectedConcreteImage.mediaLink && selectedConcreteImage.mediaLink.href) {
            selectedOption = selectedConcreteImage.mediaLink.href;
        }

        return selectedOption;
    }

    function buildOptions(selectedImage) {
        var options = [];

        if (selectedImage && selectedImage.concreteImages && selectedImage.concreteImages.length) {
            for (var i = 0; i < selectedImage.concreteImages.length; i++) {
                var concreteImage = selectedImage.concreteImages[i];

                var group = _lodash2.default.find(options, function (g) {
                    return g.ratio === concreteImage.dimensionRatio;
                });

                if (!group) {
                    var ratio = 'ratio inconnu';

                    if (concreteImage.dimensionRatio && concreteImage.dimensionRatio != 'unknown') {
                        ratio = concreteImage.dimensionRatio;
                    }

                    group = new Group(ratio, []);
                    options.push(group);
                }

                group.dimensions.push(new Option(concreteImage));
            }
        }

        return options;
    }

    function Group(ratio, dimensions) {
        this.ratio = ratio;
        this.dimensions = dimensions;
    }

    function Option(concreteImage) {
        if (concreteImage.width && concreteImage.height) {
            this.name = concreteImage.width + 'x' + concreteImage.height;
        } else {
            this.name = 'dimension inconnue';
        }

        this.id = concreteImage.mediaLink.href;
    }

    exports.default = {
        viewModel: {
            createViewModel: function createViewModel(params, componentInfo) {
                return new ConcreteImagesPickerViewModel(params, componentInfo);
            }
        },
        template: template
    };
});