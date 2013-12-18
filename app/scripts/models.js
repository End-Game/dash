define(['dash', 'backbone', "jquery", 'relational'], function(Dash, Backbone, $) {
    'use strict';
    Backbone.Relational.store.addModelScope(Dash);

    Dash.testJson = {
        "articles": [{
            "name": "article1",
            "type": "article",
            "articleType": "article",
            "isKey": true,
            "id": 3,
            "content": "This is the article. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat"
        }, {
            "name": "faq",
            "type": "article",
            "articleType": "faq",
            "isKey": true,
            "id": 4,
            "content": "This is the article. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat"
        }, {
            "name": "How Do",
            "type": "article",
            "articleType": "howDoI",
            "isKey": true,
            "id": 10,
            "content": "This is the article. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat"
        }, {
            "name": "faq1",
            "type": "article",
            "articleType": "faq",
            "isKey": true,
            "id": 7,
            "content": "This is the article. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat"
        }, {
            "name": "faq2",
            "type": "article",
            "articleType": "faq",
            "id": 8,
            "content": "This is the article. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat"
        }],

        "sections": [{
            "name": "section1",
            "type": "section",
            "children": [{
                "id": 3
            }, {
                "id": 4
            }, {
                "id": 10
            }],
            "id": 5
        }, {
            "name": "section3",
            "type": "section",
            "isKey": true,
            "children": [{
                "id": 7
            }, {
                "id": 8
            }],
            "id": 6
        }],

        "products": [{
            "name": "product1",
            "id": 1,
            "shortDescription": "enter a short description",
            "description": "long block of text blah blah blah blah blah blah blah blah blah blah blah blah",
            "sections": [{
                "id": 3,
            }, {
                "id": 4
            }, {
                "id": 5
            }, {
                "id": 10
            }]
        }, {
            "name": "product2",
            "id": 2,
            "shortDescription": "enter a short description",
            "description": "long block of text blah blah blah blah blah blah blah blah blah blah blah blah",
            "sections": [{
                "id": 3
            }, {
                "id": 6
            }, {
                "id": 7
            }, {
                "id": 8
            }]
        }]
    };

    Dash.Product = Backbone.RelationalModel.extend({
        idAttribute: '_id',

        initialize: function() {
            //this.sections = new Dash.Sections(this.toJSON().sections);
            //  Dash.assignId(this);

        },

        relations: [{
            type: Backbone.HasMany,
            key: 'sectionJoins',
            relatedModel: 'ProductSectionJoin',
            collectionType: 'ProductSectionJoins',
            keyDestination: 'sections',
            autofetch: false,
            reverseRelation: {
                key: 'product',
                includeInJSON: true
            }
        }],

        defaults: {
            name: "",
            shortDescription: "",
            description: "",
            helpDeskUrl: "",
            sectionJoins: "", // sections collection
        },

        parse: function(response) {
            var sections = response.sections;
            if (sections) { //backbone-relational sometimes calls parse multiple times
                response.sectionJoins = _.map(sections, function(section) {
                    return {
                        section: section
                    };
                });
                delete response.sections;
            }
            return response;
        },

        getKeySections: function() {
            var keySections = new Dash.Sections();
            this.get('sectionJoins').each(function(sectionJoin) {
                if (sectionJoin.get("section").get("isKey")) {
                    keySections.push(sectionJoin.get("section"));
                }
            });
            return keySections;
        },

        getFaqs: function() {
            var faqs = new Dash.Sections();
            this.get('sectionJoins').each(function(sectionJoin) {
                if (sectionJoin.get("section").get("articleType") === "faq") {
                    faqs.add(sectionJoin.get("section"));
                }
            });
            return faqs;
        },

        getHowDoIs: function() {
            var howDoIs = new Dash.Sections();
            this.get('sectionJoins').each(function(sectionJoin) {
                if (sectionJoin.get("section").get("articleType") === "howDoI") {
                    howDoIs.add(sectionJoin.get("section"));
                }
            });
            return howDoIs;
        },

        findSection: function(path, callback) {
            this.get("sectionJoins").each(function(sectionJoin) {
                var section = sectionJoin.get("section").findSection(path);
                if (section) {
                    callback(section);
                }
            });
        }
    });

    Dash.Products = Backbone.Collection.extend({
        model: Dash.Product,

        findProduct: function(name, callback) {
            this.each(function(product) {
                if (product.get('name').replace(/\s/g, '') == name) {
                    callback(product);
                }
            });
            return null;
        }
    });

    Dash.ProductSectionJoin = Backbone.RelationalModel.extend({

        relations: [{
            type: Backbone.HasOne,
            key: 'section',
            relatedModel: 'Section',
            reverseRelation: {
                key: 'productJoins',
                includeInJSON: false
            }
        }],

        toJSON: function() {
            return this.get('section')._id;
        }
    });

    Dash.ProductSectionJoins = Backbone.Collection.extend({
        model: Dash.ProductSectionJoin
    });

    Dash.Section = Backbone.RelationalModel.extend({
        idAttribute: '_id',

        initialize: function() {
            //      Dash.assignId(this);
        },

        subModelTypes: {
            'article': 'Section.Article',
            // 'faq': 'Section.Article',
            // 'howDoI': 'Section.Article',
            'section': 'Section.Section'
        },

        defaults: {
            name: "",
            isKey: false,
            currentProductName: ""
        },

        findSection: function(path) {
            if (this.get("name").replace(/\s/g, '') === path[0]) {
                if (path.length === 1) {
                    return this;
                }
                if (this.get("type") === "section") {
                    var childJoins = this.get("childJoins");
                    for (var i = 0; i < childJoins.length; i++) {
                        var section = childJoins.at(i).get("child").findSection(path.slice(1, path.length));
                        if (section !== null) {
                            return section;
                        }
                    }
                }
            }
            return null;
        },

        setUrl: function(product) {
            Dash.count = 0;
            var url = this.findUrl(product);
            if (url !== undefined) {
                this.set('URL', url);
            }
            console.log("finished find: " + this.URL);
            if(this.URL === undefined){
                console.log(this);
            }
            console.log("done finding url from: " + product);
        },

        findUrl: function(product) {
            //     console.log(this);
            console.log(Dash.count);
            Dash.count = Dash.count + 1;
            var that = this;
            var productJoins = this.get("productJoins");
            var url = "";
            url = undefined;
            
            if (productJoins !== undefined) {
                // check products for product
                console.log(productJoins);
                productJoins.every(function(productJoin) {
                    if (url === undefined) {
                        console.log(productJoin.get("product").get("name") + " vs " + product);
                        if (productJoin.get("product").get("name") === product) {
                            console.log(Dash.count);
                            url = product + "/" + that.get("name");
                            //console.log(url);
                            return false;
                        }
                    }
                });
            }
            var parentJoins = this.get("parentJoins");
            if (url === undefined && parentJoins !== undefined) {
                // check parent sections for if they are connected to product
                parentJoins.every(function(parentJoin) {
                    if (url === undefined) {
                        var tempUrl = parentJoin.get("parent").findUrl(product);
                        console.log("parentJoin: ");
                        console.log(parentJoin);
                        console.log("url: " + tempUrl);
                        if (tempUrl !== undefined) {
                            url = tempUrl + "/" + that.get('name');
                            return false;
                        }
                    }
                });
            }
            return url;
        }
    });

    Dash.Section.Article = Dash.Section.extend({
        defaults: {
            date: "",
            content: "",
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
            childJoins: "" // sections collection
        },

        relations: [{
            type: Backbone.HasMany,
            key: 'childJoins',
            relatedModel: 'SectionSectionJoin',
            collectionType: 'SectionSectionJoins',
            keyDestination: 'children',
            autofetch: false,
            reverseRelation: {
                key: 'parent',
                includeInJSON: true
            }
        }],

        parse: function(response) {
            var children = response.children;
            if (children) { //backbone-relational sometimes calls parse multiple times
                response.childJoins = _.map(children, function(child) {
                    return {
                        child: child
                    };
                });
                delete response.children;
            }
            return response;
        }
    });

    Dash.Sections = Backbone.Collection.extend({
        model: Dash.Section
    });

    Dash.SectionSectionJoin = Backbone.RelationalModel.extend({

        relations: [{
            type: Backbone.HasOne,
            key: 'child',
            relatedModel: 'Section',
            reverseRelation: {
                key: 'parentJoins',
                includeInJSON: false
            }
        }],

        toJSON: function() {
            return this.get('child')._id;
        }
    });

    Dash.SectionSectionJoins = Backbone.Collection.extend({
        model: Dash.SectionSectionJoin
    });

    // Dash.articles = new Dash.Sections(Dash.testJson.articles);
    // Dash.sections = new Dash.Sections(Dash.testJson.sections, {
    //     parse: true
    // });

    // Dash.products = new Dash.Products(Dash.testJson.products, {
    //     parse: true
    // });

    return Dash;
});