define(['dash', 'backbone', 'Hoist', "jquery", 'relational'], function(Dash, Backbone, Hoist, $) {
    'use strict';
    Backbone.Relational.store.addModelScope(Dash);
    Dash.Product = Backbone.RelationalModel.extend({
        idAttribute: '_id',

        initialize: function() {
            this.set("URL", Dash.urlEscape(this.get('name')));
            if (this.has('_id')) {
                Hoist.file(this.get("_id"), function(res) {
                    this.set("logoURL", URL.createObjectURL(res));
                }, function() {
                    this.set("logoURL", "");
                }, this);
            }
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
                includeInJSON: false
            }
        }, {
            type: Backbone.HasMany,
            key: 'keySectionJoins',
            relatedModel: 'KeySectionJoin',
            keyDestination: 'keySections',
            autofetch: false,
            reverseRelation: {
                key: 'product',
                includeInJSON: false
            }
        }],

        defaults: {
            shortDescription: "",
            themeColour: "#3080C8",
            discussion: false,
            logoURL: "",
            _type: "product"
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
            var keySections = response.keySections;
            if (keySections) { //backbone-relational sometimes calls parse multiple times
                response.keySectionJoins = _.map(keySections, function(section) {
                    return {
                        keySection: section
                    };
                });
                delete response.keySections;
            }
            return response;
        },

        getSections: function() {
            var sections = new Dash.Sections();
            this.get('sectionJoins').each(function(sectionJoin) {
                sections.add(sectionJoin.get('section'));
            });
            return sections;
        },

        getAllSections: function() {
            var sections = new Dash.Sections();
            this.get('sectionJoins').each(function(sectionJoin) {
                var section = sectionJoin.get('section');
                if (section.get('_type') === 'section') {
                    sections.add(section);
                    sections.add(section.getSections().models);
                }
            });
            return sections;
        },

        getKeySections: function() {
            var keySections = new Dash.Sections();
            this.get('keySectionJoins').each(function(sectionJoin) {
                keySections.push(sectionJoin.get("keySection"));
            });
            return keySections;
        },

        getAllArticles: function() {
            var articles = new Dash.Sections();
            this.get('sectionJoins').each(function(sectionJoin) {
                var section = sectionJoin.get('section');
                if (section.get('_type') === "section") {
                    articles.add(section.getDecendents().models);
                } else {
                    articles.add(section);
                }
            });
            return articles;
        },

        getFaqs: function() {
            var faqs = new Dash.Sections();
            this.getAllArticles().each(function(article) {
                if (article.get("type") === "faq") {
                    faqs.add(article);
                }
            });
            return faqs;
        },

        getHowDoIs: function() {
            var howDoIs = new Dash.Sections();
            this.getAllArticles().each(function(article) {
                if (article.get("type") === "howDoI") {
                    howDoIs.add(article);
                }
            });
            return howDoIs;
        },

        findSection: function(path) {
            var sectionJoins = this.get("sectionJoins");
            for (var i = 0; i < sectionJoins.length; i++) {
                var section = sectionJoins.at(i).get("section").findSection(path);
                if (section) {
                    return section;
                }
            }
        },

        addChild: function(child, index) {
            var sectionJoins = this.get('sectionJoins');
            for (var i = 0; i < sectionJoins.length; i++) {
                if (child === sectionJoins.at(i).get('section')) {
                    return;
                }
            }
            var that = this;
            if (index === undefined) {
                index = sectionJoins.length;
            }
            sectionJoins.add(new Dash.ProductSectionJoin({
                section: child,
            }), {
                at: index
            });
        },

        removeChild: function(child) {
            var childJoins = this.get('sectionJoins');
            for (var i = 0; i < childJoins.length; i++) {
                var childJoin = childJoins.at(i);
                if (child === childJoin.get('section')) {
                    childJoin.destroy();
                    console.log(childJoins);
                    return;
                }
            }
        },
        
        setKeySections: function(sections) {
            var keySections = [];
            sections.each(function(section) {
                var join = new Dash.KeySectionJoin();
                join.set('keySection', section);
                keySections.push(join);
            });
            this.get('keySectionJoins').set(keySections);
        }
    });

    Dash.Products = Backbone.Collection.extend({
        model: Dash.Product,
        comparator: '_createdDate',

        findProduct: function(name) {
            for (var i = 0; i < this.models.length; i++) {
                if (this.at(i).get('name').equalsIgnoreUrl(name)) {
                    return this.at(i);
                }
            }
            return undefined;
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

        changeSection: function() {
            this.get('product').trigger("newSection");
        },

        toJSON: function() {
            if(!this.get('section')){
                console.log(this);
            }
            return this.get('section').get('_id');
        }
    });

    Dash.KeySectionJoin = Backbone.RelationalModel.extend({

        relations: [{
            type: Backbone.HasOne,
            key: 'keySection',
            relatedModel: 'Section',
            reverseRelation: {
                key: 'keyProductJoins',
                includeInJSON: false
            }
        }],

        toJSON: function() {
            if (this.get('keySection') === null) {
                console.log(this.get('product'));
            }
            return this.get('keySection').get('_id');
        }
    });

    Dash.ProductSectionJoins = Backbone.Collection.extend({
        model: Dash.ProductSectionJoin,

        initialize: function() {
            this.on('add', this.onAdd, this);
        },

        onAdd: function(model) {
            model.listenTo(model.get("section"), 'newSection', model.changeSection);
        },
    });

    Dash.Section = Backbone.RelationalModel.extend({
        idAttribute: '_id',
        subModelTypeAttribute: '_type',

        initialize: function() {
            this.on('destroy', this.removeJoins, this);
        },

        subModelTypes: {
            'article': 'Section.Article',
            // 'faq': 'Section.Article',
            // 'howDoI': 'Section.Article',
            'section': 'Section.Section'
        },

        defaults: {
            name: "",
            content: "",
            currentProductName: ""
        },

        hasProduct: function(productName) {
            var productJoins = this.get('productJoins');
            var i;
            for (i = 0; i < productJoins.length; i++) {
                var product = productJoins.at(i).get('product');
                if (product.get('name').equalsIgnoreUrl(productName ? productName : this.get('currentProductName'))) {
                    return true;
                }
            }
            // check through parentjoins
            var parentJoins = this.get('parentJoins');
            for (i = 0; i < parentJoins.length; i++) {
                var parent = parentJoins.at(i).get('parent');
                if (parent.hasProduct(productName)) {
                    return true;
                }
            }
            return false;
        },

        findSection: function(path) {
            if (this.get("name").equalsIgnoreUrl(path[0])) {
                if (path.length === 1) {
                    return this;
                }
                var i = 0;
                var section;
                if (this.get("_type") === "section") {
                    var childJoins = this.get("childJoins");
                    for (i = 0; i < childJoins.length; i++) {
                        var child = childJoins.at(i).get("child");
                        if (!child) {
                            console.log(this);
                        } else {
                            section = child.findSection(path.slice(1, path.length));
                            if (section) {
                                return section;
                            }
                        }
                    }
                }
            }
            return undefined;
        },

        getSection: function(sectionName) {
            var parentJoins = this.get('parentJoins');
            for (var i = 0; i < parentJoins.length; i++) {
                var section = parentJoins.at(i).get('parent');
                if (section.get('name').equalsIgnoreUrl(sectionName)) {
                    return section;
                }
            }
            return undefined;
        },

        setUrl: function(productName) {
            if (!productName) {
                productName = this.get("currentProductName");
            }
            var url = this.findUrl(productName);
            if (url) {
                this.set('URL', Dash.urlEscape(url));
            }
            // console.log("finished find: " + this.get('URL'));
            // if(!  this.get('URL')){
            //     console.log(this);
            // }
            // console.log("done finding url from: " + product);
        },

        findUrl: function(productName) {
            //     console.log(this);
            var that = this;
            var url = "";
            var productJoins = this.get("productJoins");
            if (productJoins) {
                // check products for product
                productJoins.every(function(productJoin) {
                    if (!url) {
                        // console.log(productJoin.get("product").get("name") + " vs " + productName);
                        if (productName.equalsIgnoreUrl(productJoin.get("product").get("name"))) {
                            url = productName + "/" + that.get("name");
                            //     console.log(url);
                            return false;
                        }
                    }
                    return true;
                });
            }
            var parentJoins = this.get("parentJoins");
            if (!url && parentJoins) {
                // check parent sections for if they are connected to product
                parentJoins.every(function(parentJoin) {
                    if (!url) {
                        var tempUrl = parentJoin.get("parent").findUrl(productName);
                        // console.log(parentJoin.get('parent'));
                        // console.log(tempUrl);
                        if (tempUrl) {
                            url = tempUrl + "/" + that.get('name');
                            return false;
                        }
                    }
                    return true;
                });
            }
            return url;
        },

        getAllUrls: function(toHere) {
            if (!toHere) {
                toHere = "";
            }
            var urls = [];
            _.each(this.get('productJoins').pluck('product'), function(product) {
                urls.push((product.get('name') + '/' + this.get('name') + '/' + toHere));
            }, this);
            _.each(this.get('parentJoins').pluck('parent'), function(section) {
                urls = urls.concat(section.getAllUrls((this.get('name') + '/' + toHere)));
            }, this);
            var i;
            if (!toHere) {
                for (i = 0; i < urls.length; i++) {
                    urls[i] = urls[i].substring(0, urls[i].length - 1);
                }
            }
            for (i = 0; i < urls.length; i++) {
                urls[i] = Dash.urlEscape(urls[i]);
            }
            return urls;
        },

        removeJoins: function() {
            this.get('parentJoins').each(function(join) {
                join.destroy();
            });
            this.get('productJoins').each(function(join) {
                join.destroy();
            });
            this.get('tagJoins').each(function(join) {
                join.destroy();
            });
            this.get('keyProductJoins').each(function(join) {
                join.destroy();
            });
        },

        getProduct: function(productName, recurseTree) {
            var productJoins = this.get('productJoins');
            var i;
            var product;
            if (!productName) {
                productName = this.get('currentProductName');
            }
            for (i = 0; i < productJoins.length; i++) {
                product = productJoins.at(i).get('product');
                if (product.get('name').equalsIgnoreUrl(productName)) {
                    return product;
                }
            }
            if (recurseTree) {
                var parentJoins = this.get('parentJoins');
                for (i = 0; i < parentJoins.length; i++) {
                    var section = parentJoins.at(i).get('parent');
                    product = section.getProduct(productName, true);
                    if (product) {
                        return product;
                    }
                }
            }
            return undefined;
        },

        getUrlItems: function(path) {
            var items = [];
            if (!path) {
                return items;
            }
            var toFind = path[path.length - 1];
            var item;
            var productJoins = this.get("productJoins");
            if (path.length === 1 && productJoins) {
                // check products for product
                productJoins.every(function(productJoin) {
                    if (!item) {
                        var product = productJoin.get('product');
                        // console.log(productJoin.get("product").get("name") + " vs " + productName);
                        if (toFind.equalsIgnoreUrl(product.get("name"))) {
                            item = product;
                            items.push(product);
                            return false;
                        }
                    }
                    return true;
                });
            }
            var parentJoins = this.get("parentJoins");
            if (!item && parentJoins) {
                // check parent sections for if they are connected to product
                parentJoins.every(function(parentJoin) {
                    if (!item) {
                        var section = parentJoin.get("parent");
                        if (toFind.equalsIgnoreUrl(section.get("name"))) {
                            items = section.getUrlItems(path.splice(0, path.length - 1));
                            items.push(section);
                            return false;
                        }
                    }
                    return true;
                });
            }
            return items;
        }
    });

    Dash.Section.Article = Dash.Section.extend({

        relations: [{
            type: Backbone.HasMany,
            key: 'tagJoins',
            relatedModel: 'TagJoin',
            keyDestination: 'tags',
            autofetch: false,
            reverseRelation: {
                key: 'article',
                includeInJSON: true
            }
        }],

        defaults: {
            _type: "article",
            name: "",
            content: "",
            currentProductName: ""
        },

        parse: function(response) {
            var tags = response.tags;
            if (tags) { //backbone-relational sometimes calls parse multiple times
                response.tagJoins = _.map(tags, function(tag) {
                    return {
                        tag: tag
                    };
                });
                delete response.tags;
            }
            response.id = response._id;
            return response;
        },


        addTag: function(tag) {
            var tagJoins = this.get('tagJoins');
            if (tagJoins.findWhere({
                tag: tag
            })) {
                return; // tag is already attached to article
            }
            // for(var i=0; i<tagJoins.length; i++){
            //     if(tag === tagJoins.at(i).get('tag')){
            //         return;
            //     }
            // }
            var that = this;
            var tagJoin = new Dash.TagJoin({
                tag: tag,
                article: this
            });
            tagJoins.add(tagJoin);
        },

        getTaggedArticles: function() {
            var articles = new Dash.Sections();
            var that = this;
            this.get("tagJoins").each(function(tagJoin) {
                var tag = tagJoin.get('tag');
                tag.set('currentProductName', that.get('currentProductName'));
                articles.add(tag.getArticlesFromProduct().models);
            });
            articles.remove(this);
            return articles;
        },

        setSections: function(sections) {
            var sectionJoins = new Dash.SectionSectionJoins();
            sections.each(function(section) {
                var sectionJoin = this.get('parentJoins').findWhere({
                    parent: section
                });
                if (sectionJoin) {
                    sectionJoins.add(sectionJoin);
                } else {
                    sectionJoins.add(new Dash.SectionSectionJoin({
                        parent: section,
                        child: this
                    }));
                }
            }, this);
            this.get('parentJoins').each(function(parentJoin) {
                if (!sectionJoins.contains(parentJoin)) {
                    parentJoin.destroy();
                }
            });
            this.get('parentJoins').set(sectionJoins.models);
        },

        removeSections: function(sections) {
            sections.each(function(section) {
                var sectionJoin = this.get('parentJoins').findWhere({
                    parent: section
                });
                if (sectionJoin) {
                    sectionJoin.destroy();
                }
            }, this);
        }

    });

    Dash.Section.Section = Dash.Section.extend({

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

        defaults: {
            _type: "section",
            name: "",
            content: "",
            currentProductName: ""
        },

        getChildren: function() {
            var children = new Dash.Sections();
            this.get('childJoins').each(function(childJoin) {
                children.add(childJoin.get("child"));
            });
            return children;
        },

        getDecendents: function() {
            var children = new Dash.Sections();
            this.get('childJoins').each(function(childJoin) {
                var child = childJoin.get("child");
                if (child.get("_type") === "article") {
                    children.add(child);
                } else {
                    children.add(child.getDecendents().models);
                }
            });
            return children;
        },

        getSections: function() {
            var sections = new Dash.Sections();
            this.get('childJoins').each(function(childJoin) {
                var child = childJoin.get("child");
                if (child.get("_type") === "section") {
                    sections.add(child);
                    sections.add(child.getSections().models);
                }
            });
            return sections;
        },

        addChild: function(child, index) {
            var childJoins = this.get('childJoins');
            for (var i = 0; i < childJoins.length; i++) {
                var childJoin = childJoins.at(i);
                if (child === childJoin.get('child')) {
                    if (index === undefined || index === i) {
                        return;
                    } else {
                        index = (index < i) ? index : (index - 1);
                        childJoin.destroy();
                        break;
                    }
                }
            }
            var that = this;
            if (index === undefined) {
                index = childJoins.length;
            }
            childJoins.add(new Dash.SectionSectionJoin({
                child: child
            }), {
                at: index
            });
            console.log(childJoins);
        },

        removeChild: function(child) {
            var childJoins = this.get('childJoins');
            for (var i = 0; i < childJoins.length; i++) {
                var childJoin = childJoins.at(i);
                if (child === childJoin.get('child')) {
                    childJoin.destroy();
                    console.log(childJoins);
                    return;
                }
            }
        },

        indexOfSection: function(section) {
            var childJoins = this.get('childJoins');
            var childJoin = childJoins.findWhere({
                child: section
            });
            return childJoins.indexOf(childJoin);
        },

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

        changeSection: function() {
            // console.log('sectionsectionJoin changesection');
            this.get('parent').trigger("newSection");
        },

        toJSON: function() {
            var child = this.get('child');
            if (!child) {
                console.log(this);
            }
            return this.get('child').get('_id');
        }
    });

    Dash.SectionSectionJoins = Backbone.Collection.extend({
        model: Dash.SectionSectionJoin,

        initialize: function() {
            this.on('add', this.onAdd, this);
        },

        onAdd: function(model) {
            model.listenTo(model.get("child"), 'newSection', model.changeSection);
        }
    });

    Dash.Tag = Backbone.RelationalModel.extend({
        idAttribute: '_id',

        initialize: function() {
            this.on('destroy', this.removeJoins, this);
        },

        getArticles: function() {
            var articles = new Dash.Sections();
            this.get('articleJoins').each(function(articleJoin) {
                articles.add(articleJoin.get('article'));
            });
            return articles;
        },

        getArticlesFromProduct: function(productName) {
            if (!productName) {
                productName = this.get('currentProductName');
            }
            var articles = new Dash.Sections();
            this.get('articleJoins').each(function(articleJoin) {
                var article = articleJoin.get('article');
                if (article.hasProduct(productName)) {
                    articles.add(article);
                }
            });
            return articles;
        },

        removeJoins: function() {
            this.get('articleJoins').each(function(join) {
                join.destroy();
            });
        }
    });

    Dash.TagJoin = Backbone.RelationalModel.extend({
        relations: [{
            type: Backbone.HasOne,
            key: 'tag',
            relatedModel: 'Tag',
            reverseRelation: {
                key: 'articleJoins',
                includeInJSON: false
            }
        }],

        toJSON: function() {
            return this.get('tag').get('_id');
        }
    });

    Dash.Tags = Backbone.Collection.extend({
        model: Dash.Tag,

        findTag: function(name) {
            for (var i = 0; i < this.models.length; i++) {
                if (this.at(i).get('name').equalsIgnoreUrl(name)) {
                    return this.at(i);
                }
            }
            return undefined;
        }
    });

    Dash.Comment = Backbone.RelationalModel.extend({
        idAttribute: "_id",

        relations: [{
            type: Backbone.HasOne,
            key: 'section',
            relatedModel: 'Section',
            includeInJSON: '_id',
            autofetch: false,
            reverseRelation: {
                key: 'comments',
                includeInJSON: false,
                collectionType: 'Comments'
            }
        }],

        defaults: {
            author: '',
            content: '',
            date: ''
        }
    });

    Dash.Comments = Backbone.Collection.extend({
        model: Dash.Comment
    });

    Dash.MenuProduct = Backbone.RelationalModel.extend({

        relations: [{
            type: Backbone.HasOne,
            key: 'product',
            relatedModel: 'Product',
            autofetch: false
        }],

        defaults: {
            user: ''
        }
    });
    
    // Dash.ImageId

    return Dash;
});