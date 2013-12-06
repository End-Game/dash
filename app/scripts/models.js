define(['exports', 'dash', 'backbone', "jquery", "hoist", 'relational'], function(exports, Dash, Backbone, $, hoist) {
    'use strict';
    Backbone.Relational.store.addModelScope(Dash);

    Dash.idCount = 1;

    Dash.checkIdCount = function(id) {
        if (id >= Dash.idCount) {
            Dash.idCount = id + 1;
        }
    };

    Dash.assignId = function(model) {
        if (model.get('id') === undefined) {
            model.set({"id": Dash.idCount});
            Dash.idCount++;
        } else {
            Dash.checkIdCount(model.get("id"));
        }
    };

    Dash.Product = Backbone.RelationalModel.extend({
        initialize: function() {
            //this.sections = new Dash.Sections(this.toJSON().sections);
            Dash.assignId(this);
        },

        relations: [{
            type: Backbone.HasMany,
            key: 'sections',
            relatedModel: 'Section',
            collectionType: 'Sections',
            autofetch: true,
            reverseRelation: {
                key: 'product'
            }
        }],

        defaults: {
            name: "",
            shortDescription: "",
            description: "",
            helpDeskUrl: "",
            sections: "", // sections collection
        },

        getKeySections: function() {
            var keySections = new Dash.Sections();
            this.get('sections').each(function(section) {
                if (section.get("isKey")) {
                    keySections.push(section);
                }
            });
            return keySections;
        },

        getFaqs: function() {
            var faqs = new Dash.Sections();
            this.get('sections').each(function(section) {
                if (section.get("type") === "faq") {
                    faqs.add(section);
                }
            });
            return faqs;
        }
    });

    // Dash.ProductToSection = Backbone.RelationalModel.extend({
    //     initialize: function() {
    //         console.log(this);
    //     },
    //     relations: [{
    //         type: Backbone.HasOne,
    //         key: 'section',
    //         relatedModel: 'Dash.Section',
    //         reverseRelation: {
    //             key: 'products',
    //             collectionType: 'Dash.Products'
    //         }
    //     }]
    // });

    Dash.Products = Backbone.Collection.extend({
        model: Dash.Product
    });

    Dash.Section = Backbone.RelationalModel.extend({
        initialize: function() {
            Dash.assignId(this);
        },

        subModelTypes: {
            'article': 'Dash.Section.Article',
            'faq': 'Dash.Section.Article',
            'howDoI': 'Dash.Section.Article',
            'section': 'Dash.Section.Section'
        },

        defaults: {
            name: "",
            isKey: false
        }
    });

    Dash.Section.Article = Dash.Section.extend({
        defaults: {
            date: "",
            info: "",
            tags: "",
            relevantOthers: "", // sections collection
            faqs: "", // sections collection
            howDoIs: "", // sections collection
            published: false
        }
        // when looking for other articles in section use the collection attribute that automatically gets set
    });

    Dash.Section.Section = Dash.Section.extend({
        defaults: {
            contents: "" // sections collection
        }
    });

    Dash.Sections = Backbone.Collection.extend({
        model: Dash.Section
    });

    return Dash;
});