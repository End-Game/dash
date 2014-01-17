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
        var that;
        // console.log(model);
        // if (!model.get("_id")) {
        //     model.set('_id', 'model' + model.get('name') + Math.floor(Math.random()*100000));
        // }
        // if (success) {
        //     success.call(context);
        // }
        console.log('before post');
        var toSend;
        if (model instanceof Array) {
            toSend = [];
            for (var i = 0; i < model.length; i++) {
                toSend[i] = model[i].toJSON();
            }
            console.log(toSend);
        } else {
            console.log(model.toJSON());
            toSend = model.toJSON();
        }
        Hoist.post(type, toSend, function(res) {
            console.log(res);
            if (model instanceof Array) {
                for (var i = 0; i < model.length; i++) {
                    model[i].set('_rev', res[i]._rev);
                    if (!model[i].get("_id")) {
                        model[i].set("_id", res[i]._id);
                    }
                }
                console.log(model);
            } else { // might change to need res[0]._id etc
                model.set('_rev', res._rev);
                if (!model.get("_id")) {
                    model.set("_id", res._id);
                }
            }

            if (success) {
                success.call(context, res);
            }
        }, function(res) {
            console.log(type + " post unsuccessful: " + res);
            console.log(model);
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
            Dash.products.on("add", this.render, this);
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

    Dash.View.Admin.SiteMap = Dash.View.SiteMap.extend({
        setPublishedTemplate: Dash.Template.siteMapSetPublished,

        events: {
            'click #setPublished': 'setPublished'
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var map = this.isList ? new Dash.SiteMap.List({
                model: this.model
            }) : new Dash.SiteMap.AdminMap({
                model: this.model
            });
            this.$('.map').append(map.render().el);
            this.$('.map').append(Dash.Template.siteMapSetPublished());
            this.renderSidebar();
            return this;
        },

        setPublished: function() {
            console.log('here');
            var that = this;
            this.$('input:checked').each(function() {
                var hash = that.$(this).closest('li').find('a')[0].hash;
                hash = hash.substring(1);
                var pathSplit = hash.split("/");
                var product = Dash.products.findProduct(pathSplit[0]);
                var article = product.findSection(pathSplit.slice(1));
                article.set('published', true);
                Dash.postModel('article', article);
                console.log(article);
            });
            this.render();
        },

        renderSidebar: function() {
            this.$('.sideBar').empty();
            var sideBar = new Dash.AdminSideBar.Product({
                model: this.model,
            });
            this.$el.append(sideBar.render().el);
        }
    });

    Dash.AdminMapItem = Dash.ListItem.extend({
        template: Dash.Template.adminSiteMapItem
    });

    Dash.SiteMap.AdminMap = Dash.SiteMap.Map.extend({

        renderSection: function(section) {
            if (this.model.get('_type') === 'product') {
                section.set('currentProductName', this.model.get('name'));
            } else {
                section.set('currentProductName', this.model.get('currentProductName'));
            }
            var url = this.model.get('URL');
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            url = url + "/" + section.get("name").replace(/\s/g, "");
            section.set('URL', url);
            if (section.get('_type') === 'section') {
                this.renderListItem(section);
                var map = new Dash.SiteMap.AdminMap({
                    model: section
                });
                this.$("li").last().append(map.render().el);
            } else if (section.get('published') || Dash.admin) {
                this.renderListItem(section);
            }
        },

        renderListItem: function(item) {
            var listItem;
            if (item.get("_type") === "article") {
                listItem = new Dash.AdminMapItem({
                    model: item,
                });
                //console.log(listItem.render().el);
            }
            if (item.get("_type") === "section") {
                listItem = new Dash.ListItem({
                    model: item,
                    className: 'bold'
                });
            }
            this.$el.append(listItem.render().el);
        },
    });

    Dash.View.Admin.NewArticle = Dash.View.Admin.extend({
        el: "#Article",
        template: Dash.Template.newArticle,
        previewTemplate: Dash.Template.preview,

        events: {
            'click button.save': 'save',
            'click button.fullPreview': 'fullPreview',
            'keydown #title': 'renderPreview',
            'keydown #content': 'renderPreview'
        },

        render: function() {
            this.$el.html(this.template());
            this.renderSidebar();
            this.$('.preview').hide();
            return this;
        },

        renderSidebar: function() {
            this.$('.sideBar').empty();
            this.sideBar = new Dash.SideBar.NewArticle();
            this.$el.append(this.sideBar.render().el);
        },

        renderPreview: function() {
            var name = $('#title').val();
            var content = $('#content').val();
            var date = Dash.getDateString();
            this.$('.preview').html(this.previewTemplate({
                name: name,
                content: content,
                date: date
            }));
            this.$('.preview').show();
        },

        save: function() {
            $('.errorText').remove();
            var error;
            var errorText = "";
            var treePlaces = this.sideBar.treePlaces;
            if (!(treePlaces && treePlaces.length())) {
                $('#productList').before(Dash.Template.errorText({
                    errorText: "Article must be placed in the tree of at least one product."
                }));
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
                $('#title').before(Dash.Template.errorText({
                    errorText: errorText
                }));
                error = true;
            }
            if (error) {
                return;
            }
            var date = Dash.getDateString();
            var published = $('#published').val() === 'published';
            console.log(published);
            var article = new Dash.Section.Article({
                name: name,
                content: content,
                type: type,
                _type: 'article',
                date: date,
                published: published
            });

            this.addTags(article, function() {
                Dash.postModel('article', article, function(res) {
                    this.addToSections(article);
                    article.set('currentProductName', treePlaces.products[0].get('name'));
                    article.setUrl();
                    Dash.router.navigate(article.get('URL'));
                    new Dash.View.Admin.Article({
                        model: article
                    });
                }, this);
                console.log(article);
            }, this);
        },

        getType: function() {
            if ($('#isFaq').is(':checked')) {
                if ($('#isHowTo').is(':checked')) {
                    $('#isFaq').before(Dash.Template.errorText({
                        errorText: "Cannot have more than one article type"
                    }));
                    return null;
                }
                return 'faq';
            } else if ($('#isHowTo').is(':checked')) {
                return 'howDoI';
            } else {
                return "article";
            }
        },

        addTags: function(article, callback, context) {
            var tagNames = this.sideBar.tagNames;
            if (!tagNames) {
                callback.call(context);
                return;
            }
            var tagCount = 0;
            var that = this;
            var toPost = new Dash.Tags();
            for (var i = 0; i < tagNames.length; i++) {
                var tag = Dash.tags.findWhere({
                    name: tagNames[i]
                });
                if (!tag) {
                    tag = new Dash.Tag({
                        name: tagNames[i]
                    });
                    Dash.tags.add(tag);
                    toPost.add(tag);
                }
                article.addTag(tag);
            }
            if (toPost.length) {
                Dash.postModel('tag', toPost.models, callback, context);
            } else {
                callback.call(context);
            }
        },

        addToSections: function(article) {
            var treePlaces = this.sideBar.treePlaces;
            for (var i = 0; i < treePlaces.length(); i++) {
                var section = treePlaces.sections[i];
                if (section.get('_type') === 'section') {
                    section.addChild(article);
                } else {
                    var addBefore = section;
                    var path = treePlaces.sectionUrls[i].split('/');
                    var sectionName = path[path.length - 2];
                    section = addBefore.getSection(sectionName);
                    var index = section.indexOfSection(addBefore);
                    section.addChild(article, index);
                    // should add to collection at index but
                }
                Dash.postModel('section', section);
            }
        },

        fullPreview: function() {
            var type = this.getType();
            var name = $('#title').val();
            var content = $('#content').val();
            var date = Dash.getDateString();

            var article = new Dash.Section.Article({
                name: name,
                content: content,
                type: type,
                _type: 'article',
                date: date,
                currentProductName: "",
            });

            // Dash.router.navigate('newArticle/preview');
            var view = new Dash.View.Article.Preview({
                model: article,
            });
        }
    });

    Dash.View.Article.Preview = Dash.View.Article.extend({
        el: '#Preview',
        backButtonTemplate: Dash.Template.backButton,

        render: function() {
            this.$el.empty();
            this.$el.html(this.template(this.model.toJSON()));
            this.renderSidebar();
            this.renderTags();
            this.renderRelevantArticles();
            this.$el.prepend(this.backButtonTemplate({
                text: "Exit Preview"
            }));
            return this;
        },

        events: {
            'click': 'removeClick',
            'click button.back': 'trash'
        },

        removeClick: function(e) {
            e.preventDefault();
        },

        end: function() {
            this.model.destroy();
            this.$el.hide();
            $('#Article').show();
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
            var tag = e.currentTarget.parentElement;
            var tag$ = this.$(tag);
            var tagName = tag$.find('> p')[0].innerText;
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

        newSection: function() {
            var that = this;
            new Dash.View.Modal.NewSection({
                model: that.model
            });
        },

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
            if (this.model) {
                this.$('#name').val(this.model.get('name'));
                this.$('#description').val(this.model.get('description'));
            }
            return this;
        },

        save: function() {
            var attributes = {
                name: this.$('#name').val(),
                description: this.$('#description').val(),
                shortDescription: this.$('#description').val(),
                _type: 'product'
            };
            var product;
            if (this.model) {
                product = this.model.set(attributes);
            } else {
                product = new Dash.Product(attributes);
            }
            Dash.postModel("product", product, function(res) {
                Dash.products.add(product);
                this.trash();
            }, this);
        },

    });

    Dash.View.Modal.NewSection = Dash.View.Modal.extend({
        template: Dash.Template.newSection,

        events: {
            'click button.save': 'save',
            'click .treePlace': 'treePlace',
            'click .content': 'swallow',
            'click': 'trash',
        },

        render: function() {
            this.$el.html(this.template());
            this.$el.find('div.treePlace').hide();
            return this;
        },

        save: function() {
            var that = this;
            var section = new Dash.Section.Section({
                name: this.$('#name').val(),
                _type: 'section'
            });
            Dash.postModel("section", section, function(res) {
                this.treePlace.addChild(section);
                Dash.postModel(this.treePlace.get('_type'), this.treePlace);
            }, this);
            this.trash();
        },

        treePlace: function(e) {
            var that = this;
            // pop up modal
            var treePlaceView = new Dash.View.Modal.SectionTreePlace({
                model: that.model,
            });
            treePlaceView.callback = this.treePlaceCallback;
            treePlaceView.trashCallback = this.treePlaceTrashCallback;
            treePlaceView.callbackContext = this;
        },

        treePlaceCallback: function(hash, product) {
            hash = hash.substring(1);
            var pathSplit = hash.split("/");
            if (pathSplit.length > 1) {
                var section = product.findSection(pathSplit.slice(1));
                this.treePlace = section;
            } else {
                this.treePlace = this.model;
            }
            var label = this.$("div.treePlace");
            label.find('p').text(this.treePlace.get('name'));
            label.show();
            this.$("button.treePlace").hide();
        },

        treePlaceTrashCallback: function(hash, product) {
            this.$el.show();
        }
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

    Dash.View.Modal.SectionTreePlace = Dash.View.Modal.TreePlace.extend({
        el: "#TreePlace",

        renderTree: function() {
            var map = new Dash.SiteMap.SectionMap({
                model: this.model
            });
            this.$('.map').append(map.render().$el.parents('ul'));
            return this;
        },

        end: function() {
            if (this.trashCallback) {
                this.trashCallback.call(this.callbackContext);
            }
        }
    });

});