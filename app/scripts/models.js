define(['exports', 'dash', 'backbone', "jquery", "hoist", 'relational'], function(exports, Dash, Backbone, $, hoist) {
    'use strict';

    Dash.Product = Backbone.RelationalModel.extend({
        initialize: function() {
            this.keySections = new Dash.Sections(this.toJSON().keySections);
        },

        defaults: {
            name: "",
            shortDescription: "",
            description: "",
            helpDeskUrl: "",
            sections: "", // sections collection
            keySections: "" // sections collection
        }
    });

    Dash.Products = Backbone.Collection.extend({
        rootUrl: "products",
        model: Dash.Product
    });

    Dash.Section = Backbone.Model.extend({
        defaults: {
            name: "",
            type: ""
        }
    });

    Dash.Section.Article = Dash.Section.extend({
        defaults: {
            date: "",
            info: "",
            tags: "",
            relevantOthers: "", // sections collection
            faqs: "", // sections collection
            howDos: "" // sections collection
        }
        // when looking for other articles use the collection attribute that automatically gets set
    });

    Dash.Section.Section = Dash.Section.extend({
        defaults: {
            contents: "" // sections collection
        }
    });

    Dash.Sections = Backbone.Collection.extend({
        model: function(attrs, options) {
            if (attrs.type === "section") {
                return new Dash.Section.Section(attrs, options);
            } else {
                return new Dash.Section.Article(attrs, options);
            }
        }
    });
    
    return Dash;
});