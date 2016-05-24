'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _concreteImageEditor = require('text!./concrete-image-editor.html');

var _concreteImageEditor2 = _interopRequireDefault(_concreteImageEditor);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _imageUtilities = require('image-utilities');

var _imageUtilities2 = _interopRequireDefault(_imageUtilities);

var _mappingUtilities = require('mapping-utilities');

var _mappingUtilities2 = _interopRequireDefault(_mappingUtilities);

var _disposer = require('disposer');

var _disposer2 = _interopRequireDefault(_disposer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

    var selectedImage = _mappingUtilities2.default.toJS(self.params.selectedImage);
    var selectedConcreteImage = _mappingUtilities2.default.toJS(self.params.selectedConcreteImage);

    var options = buildOptions(selectedImage);

    self.options = _knockout2.default.observableArray(options);

    if (!selectedConcreteImage) {
        //Attention: 2 type de DefaultConcreteImage (1 pour les previews de scoop et celui ci pour le default concrete image...)
        //en ce moment on est chanceux, c'est la meme taille qui est utilisée par défaut mais il faudra ajuster si ca change
        selectedConcreteImage = _imageUtilities2.default.getDefaultConcreteImage(selectedImage);
    }

    var selectedOption = getConcreteImageHref(selectedConcreteImage);

    self.selectedOption = _knockout2.default.observable(selectedOption);

    self.params.selectedConcreteImage(selectedConcreteImage);

    self.koDisposer = new _disposer2.default();

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
        selectedImage = _mappingUtilities2.default.toJS(self.params.selectedImage);
        options = buildOptions(selectedImage);
        self.options(options);
        selectedConcreteImage = _imageUtilities2.default.getDefaultConcreteImage(selectedImage);
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
    template: _concreteImageEditor2.default
};