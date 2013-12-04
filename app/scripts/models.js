define(['dash', 'backbone', "jquery", "hoist"], function(Dash, Backbone, $, hoist) {
    'use strict';

    Dash.Product = Backbone.Model.extend({
        initialize: function(){
            console.log(this.keySections);
            console.log(typeof(this.keySections));
            this.keySections = new Dash.Sections(this.keySections);
            console.log(typeof(this.keySections));
            console.log(this.keySections);
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
        model: Dash.Section
    });
});