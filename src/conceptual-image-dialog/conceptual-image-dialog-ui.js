import template from 'text!./conceptual-image-dialog.html';
import ko from 'knockout';
import $ from 'jquery';
import ImageDialogBaseViewModel from '../image-dialog-ui-base';
import ContentDialogViewModel from 'content-dialog-base-viewmodel';
import arrayUtilities from 'array-utilities';
import koMappingUtilities from 'mapping-utilities';
import i18n from 'i18next';


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

var ConceptualImageDialogViewModel = function(settings /*, componentInfo*/ ) {
    var self = this;

    self.params = self.getParams(settings);

    self.translated = {
        dialogTitle: i18n.t('koco-image-dialogs.dialog-title'),
        dialogCancel: i18n.t('koco-image-dialogs.dialog-cancel'),
        dialogSave: i18n.t('koco-image-dialogs.dialog-save'),
    };

    var originalItem = null;

    var conceptualImage = koMappingUtilities.toJS(settings.params.conceptualImage);
    if (conceptualImage && arrayUtilities.isNotEmptyArray(conceptualImage.concreteImages)) {
        //TODO: Est-ce que le extend defaultItem est nécessaire!?
        originalItem = $.extend({}, defaultItem, conceptualImage);
    }

    var contentDialogViewModelParams = {
        originalItem: originalItem,
        defaultItem: defaultItem,
        close: settings.close,
        isSearchable: true,
        api: self.params.api
    };

    ContentDialogViewModel.call(self, contentDialogViewModelParams);

    self.canDeleteImage = ko.pureComputed(self.canDeleteImage.bind(self));
    self.koDisposer.add(self.canDeleteImage);

    self.activate();
};

ConceptualImageDialogViewModel.prototype = Object.create(ImageDialogBaseViewModel.prototype);
ConceptualImageDialogViewModel.prototype.constructor = ConceptualImageDialogViewModel;

export default {
    viewModel: {
        createViewModel: function(params, componentInfo) {
            return new ConceptualImageDialogViewModel(params, componentInfo);
        }
    },
    template: template
};
