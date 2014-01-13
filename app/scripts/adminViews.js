define(['dash', 'backbone', 'hoist', 'views', 'templates'], function(Dash, Backbone, hoist) {
    'use strict';
    /*
    views needed:
    home
    product help desk
    article
    sitemap
    new article
    setup product - modal
    place tree - modal - when making an article
*/

    Dash.TreePlaces = function() {
        this.products = [];
        this.sectionUrls = [];
        this.sections = [];

        this.addPlace = function(product, sectionUrl, section) {
            var index = this.products.indexOf(product);
            if (index < 0) {
                this.products.push(product);
                this.sectionUrls.push(sectionUrl);
                this.sections.push(section);
            } else {
                this.sectionUrls[index] = sectionUrl;
                this.sections[index] = section;
            }
        };

        this.length = function() {
            return this.products.length;
        };

        this.remove = function(product) {
            var index = this.products.indexOf(product);
            if (index < 0) {
                return false;
            }
            this.products.splice(index, 1);
            this.sectionUrls.splice(index, 1);
            this.sections.splice(index, 1);
            return true;
        };
    };

    Dash.getDateString = function() {
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1; //starts from 0
        var year = date.getFullYear().toString();
        year = year.substring(year.length - 2);
        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        return day + '/' + month + '/' + year;
    };

    Dash.postModel = function(type, model, success, error, context) {
        if (typeof error !== "function") {
            context = error;
            error = null;
        }
        if (typeof success !== "function") {
            context = success;
            success = null;
        }
        // console.log(model);
        // if (!model.get("_id")) {
        //     model.set('_id', 'model' + model.get('name') + Math.floor(Math.random()*100000));
        // }
        console.log(model.toJSON());
        // if( success ){ success.call(context);}



        Hoist.post(type, model, function(res) {
            model.set('_rev', res[0]._rev);
            if (!model.get("_id")) {
                model.set("_id", res[0]._id);
            }
            if (success) {
                success.call(context, res);
            }
        }, function(res) {
            console.log(type + " post unsuccessful: " + res);
            if (error) {
                error.call(context, res);
            }
        }, context);
    };

    Dash.CheckboxItem = Dash.ListItem.extend({
        template: Dash.Template.checkboxProduct,
    });

    Dash.NewTagView = Backbone.View.extend({
        tagName: "div",
        template: Dash.Template.newTag,
        className: "newTag",

        render: function() {
            this.$el.html(this.template(this.model));
            return this;
        },
    });

    Dash.View.Admin = Dash.View.extend({});

    Dash.View.Admin.Home = Dash.View.Home.extend({
        template: Dash.Template.adminHome,

        start: function() {
            this.model = Dash.products;
            this.productCount = 0; // possibly use for rendering products when > 3
            Dash.products.on("add", 'render', this);
        },

        events: {
            "click button": "addProduct",
        },

        renderProduct: function(item) {
            var homeProductView = new Dash.HomeProductView({
                model: item
            });
            if (this.productCount < 3) {
                this.$("#products").append(homeProductView.render().el);
            } else {
                // this.$("#products").after(homeProductView.render().el);
                this.$("#products").append(homeProductView.render().el);
            }
            this.productCount++;
        },

        addProduct: function() {
            new Dash.View.Modal.ProductSetup();
        }
    });

    Dash.View.Admin.HelpDesk = Dash.View.HelpDesk.extend({

        renderSidebar: function() {
            this.$('.adminSideBar').empty();
            var sideBar = new Dash.AdminSideBar.Product({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        }
    });

    Dash.View.Admin.Article = Dash.View.Article.extend({

    });

    Dash.View.Admin.Section = Dash.View.Section.extend({

    });

    Dash.View.Admin.NewArticle = Dash.View.Admin.extend({
        el: "#Article",
        template: Dash.Template.newArticle,

        events: {
            'click button.save': 'save'
        },

        render: function() {
            this.$el.html(this.template());
            this.renderSidebar();
            return this;
        },

        renderSidebar: function() {
            this.$('.sideBar').empty();
            this.sideBar = new Dash.SideBar.NewArticle();
            this.$el.append(this.sideBar.render().el);
        },

        save: function() {
            $('.errorText').remove();
            var error;
            var errorText = "";
            var treePlaces = this.sideBar.treePlaces;
            if (!(treePlaces && treePlaces.length())) {
                $('#productList').before(_.template(Dash.Template.errorText({
                    errorText: "Article must be placed in the tree of at least one product."
                })));
                error = true;
            }
            var type = this.getType();
            if (!type) {
                error = true;
            }
            var name = $('#title').val();
            var content = $('#content').val();
            if (!(name && content)) {
                errorText += "Article must have title and contents.";
                $('#title').before(_.template(Dash.Template.errorText({
                    errorText: errorText
                })));
                error = true;
            }
            if (error) {
                return;
            }
            var date = Dash.getDateString();

            var article = new Dash.Section.Article({
                name: name,
                content: content,
                type: type,
                _type: 'article',
                date: date
            });

            var tags = this.getTags();

            //console.log(article);
            if (tags) {
                tags.each(function(tag) {
                    article.addTag(tag);
                });
            }
            console.log(article);
            Dash.postModel('article', article, function(res) {
                this.addToSections(article);
            }, this);
            console.log(article);
            //new Dash.View.Admin.Article

        },

        getType: function() {
            if ($('#isFaq').is(':checked')) {
                if ($('#isHowTo').is(':checked')) {
                    $('#isFaq').before(_.template(Dash.Template.errorText({
                        errorText: "Cannot have more than one article type"
                    })));
                    return null;
                }
                return 'faq';
            } else if ($('#isHowTo').is(':checked')) {
                return 'howDoI';
            } else {
                return "article";
            }
        },

        getTags: function() {
            var tagNames = this.sideBar.tagNames;
            if (!tagNames) {
                return;
            }
            var tags = new Dash.Tags();
            console.log(tagNames);
            for (var i = 0; i < tagNames.length; i++) {
                var tag = Dash.tags.findWhere({
                    name: tagNames[i]
                });
                if (!tag) {
                    console.log('here');
                    tag = new Dash.Tag({
                        name: tagNames[i]
                    });
                    Dash.postModel('tag', tag);
                    Dash.tags.add(tag);
                }
                tags.add(tag);
            }
            return tags;
        },

        addToSections: function(article) {
            var treePlaces = this.sideBar.treePlaces;
            for (var i = 0; i < treePlaces.length(); i++) {
                var section = treePlaces.sections[i];
                if (section.get('_type') === 'section') {
                    section.addArticle(article);
                } else {
                    var addBefore = section;
                    var path = treePlaces.sectionUrls[i].split('/');
                    var sectionName = path[path.length - 2];
                    section = addBefore.getSection(sectionName);
                    var index = section.indexOfSection(addBefore);
                    section.addArticle(article, index);
                    // should add to collection at index but
                }
                Dash.postModel('section', section);
            }
        }
    });

    Dash.SideBar.NewArticle = Dash.SideBar.extend({
        template: Dash.Template.newArticleSideBar,
        tagTemplate: Dash.Template.newTag,
        id: "newArticleSideBar",

        events: {
            'keydown #tagName': 'keydown',
            'click #productList input': 'checkProduct',
            'click .treePlace': 'treePlace',
            'click .delete': 'removeTag'
        },

        render: function() {
            this.$el.html(this.template());
            this.renderProducts();
            this.$('li > div').hide();
            return this;
        },

        renderProducts: function() {
            //render each product into productList
            var that = this;
            Dash.products.each(function(product) {
                that.renderCheckboxItem(product, "#productList");
            });
        },

        renderCheckboxItem: function(item, tag) {
            var checkboxItem = new Dash.CheckboxItem({
                model: item
            });
            this.$(tag).append(checkboxItem.render().el);
        },

        keydown: function(e) {
            if (e.which === 13) {
                this.addTag();
                e.preventDefault();
            }
        },

        checkProduct: function(e) {
            var input = e.target;
            var productName = input.nextSibling.textContent;
            var li = input.parentElement.parentElement;
            this.$(li).find('div').toggle();
            var product = Dash.products.findWhere({
                name: productName
            });
            if (this.treePlaces) {
                var removed = this.treePlaces.remove(product);
                if (removed) {
                    this.$(li).find('.treePlace').toggle();
                }
            }
        },

        treePlace: function(e) {
            // console.log(e);
            var productName = $(e.currentTarget.parentElement.parentElement).find('label')[0].innerText;
            var product = Dash.products.findWhere({
                name: productName
            });
            var that = this;
            // pop up modal
            var treePlaceView = new Dash.View.Modal.TreePlace({
                model: product,
            });
            treePlaceView.callback = this.treePlaceCallback;
            treePlaceView.callbackContext = this;
        },

        treePlaceCallback: function(hash, product) {
            if (!this.treePlaces) {
                this.treePlaces = new Dash.TreePlaces();
            }
            hash = hash.substring(1);
            var pathSplit = hash.split("/");
            var section = product.findSection(pathSplit.slice(1));
            this.treePlaces.addPlace(product, hash, section);
            // console.log(this.treePlaces);
            var label = this.$("#_" + product.get('_id') + " div.treePlace");
            label.find('p').text(section.get('name'));
            label.show();
            this.$("#_" + product.get('_id') + " button.treePlace").hide();
        },

        addTag: function() {
            var input = this.$('#tagName');
            var name = input.val();
            if (!name) {
                return;
            }
            input.val('');
            if (!this.tagNames) {
                this.tagNames = [];
            }
            if (this.tagNames.indexOf(name) < 0) {
                this.tagNames.push(name);
                var tagView = new Dash.NewTagView({
                    model: {
                        name: name
                    }
                });
                this.$('#tagsList').append(tagView.render().el);
            }
            console.log(this.tagNames);
        },

        removeTag: function(e) {
            // console.log(e);
            var tag = e.currentTarget.parentElement;
            var tag$ = this.$(tag);
            var tagName = tag$.find('> p')[0].innerText;
            // console.log(tagName);
            this.tagNames.splice(this.tagNames.indexOf(tagName), 1);
            console.log(this.tagNames);
            tag$.remove();
        }
    });

    Dash.AdminSideBar = Dash.SideBar.extend({
        className: "adminSideBar"
    });

    Dash.AdminSideBar.Product = Dash.AdminSideBar.extend({
        template: Dash.Template.adminProductSideBar,

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            'click button#newSection': 'newSection',
            'click button#newArticle': 'newArticle',
            'click button#productSettings': 'settings',
            'click button#personalise': 'personalise',
        },

        newSection: function() {},

        newArticle: function() {
            Dash.router.navigate("newArticle");
            var that = this;
            new Dash.View.Admin.NewArticle();
        },

        settings: function() {},

        personalise: function() {},

    });

    Dash.View.Modal = Dash.View.extend({
        el: "#Modal",
    });

    Dash.View.Modal.ProductSetup = Dash.View.Modal.extend({
        template: Dash.Template.productSetup,

        events: {
            'click button.save': 'save',
            'click .content': 'swallow',
            'click': 'trash'
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        save: function() {
            var product = new Dash.Product({
                name: this.$('#name').val(),
                description: this.$('#description').val(),
                shortDescription: this.$('#description').val(),
                _type: 'product'
            });
            Dash.postModel("product", product, function(res) {
                Dash.products.add(product);
                this.trash();
            }, this);
        },

    });

    Dash.View.Modal.TreePlace = Dash.View.Modal.extend({
        template: Dash.Template.treePlace,

        events: {
            'click button.save': 'save',
            'click button.cancel': 'trash',
            'click .content': 'swallow',
            'click': 'trash',
            'click .map a': 'select',
        },

        render: function() {
            this.$el.html(this.template());
            this.renderTree();
            return this;
        },

        renderTree: function() {
            var map = new Dash.SiteMap.Map({
                model: this.model
            });
            this.$('.map').append(map.render().el);
            return this;
        },

        save: function() {
            var selected = this.$(".map .themeText");
            // console.log(selected);
            if (selected[0]) {
                var hash = selected[0].hash;
                if (this.callback) {
                    this.callback.call(this.callbackContext, hash, this.model);
                }
                this.trash();
            }
        },

        select: function(e) {
            e.preventDefault();
            var link = e.target;
            this.$('a.themeText').removeClass('themeText');
            this.$(link).addClass('themeText');
        },
    });
});