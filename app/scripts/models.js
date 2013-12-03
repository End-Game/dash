define(['dash', 'backbone', "jquery", "hoist"], function(Dash, Backbone, $, hoist) {
    'use strict';

    Dash.Product = Backbone.Model.extend ({
        defaults: {
            name: "";
            description: "";
            helpDeskUrl: "";
            rootSection: "";
            keySections: [];
        }
    });

    Dash.Article = Backbone.Model.extend({
        defaults: {
            name: "";
            type: "";
            info: "";
            tags: "";
            relevantOthers: [];
            faqs: [];
            howDos: [];
        }
    });

    Dash.Section = Backbone.Model.extend({
        defaults: {
            name: "";
            contents: []; // list of articles and sections
        }
    });
});