define(['dash', 'backbone', 'hoist', 'views', 'templates'], function(Dash, Backbone, hoist) {
    'use strict';
    /*
    views needed:
    personalise product - modal
*/

    Dash.getThemeStyleText = function(colour) {
        return '.themeColour {' +
            'background: ' + colour + ';' +
            '}' +
            '.themeText {' +
            'color: ' + colour + ';' +
            '}' +
            '.themeButton {' +
            'background: ' + colour + ';' +
            'border-color: ' + colour + ';' +
            '}' +
            '.themeBorder {' +
            'border-color: ' + colour + ';' +
            '}' +
            'h1, h2, h3, h4, h5, h6{' +
            'color: ' + colour + ';' +
            '}';
    };

    Dash.TreePlaces = function() {
        this.products = [];
        this.sectionUrls = [];
        this.sections = [];

        this.addPlace = function(product, sectionUrl, section) {
            var index = this.products.indexOf(product);
            if (index < 0) {
                index = this.length();
                this.products.push(product);
                this.sectionUrls.push(sectionUrl);
                this.sections.push(section);
            } else {
                this.sectionUrls[index] = sectionUrl;
                this.sections[index] = section;
            }
            return index;
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

        this.containsProduct = function(product) {
            if (this.products.indexOf(product) < 0) {
                return false;
            }
            return true;
        };

        this.containsUrl = function(url) {
            if (this.sectionUrls.indexOf(url) < 0) {
                return false;
            }
            return true;
        };

        this.containSection = function(section) {
            if (this.sections.indexOf(section) < 0) {
                return false;
            }
            return true;
        };

        this.addSectionUrl = function(url) {
            var index = this.sectionUrls.indexOf(url);
            if (index < 0) {
                var pathSplit = url.split('/');
                var product = Dash.products.findProduct(pathSplit[0]);
                var section = product.findSection(pathSplit.slice(1));
                return this.addPlace(product, url, section);
            } else {
                return this.sections[index];
            }
        };
    };

    Dash.getDateString = function() {
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1; //starts from 0
        var year = date.getFullYear().toString();
        year = year.substring(year.length - 2); // make to 2 digits
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
        var i, toSend;
        console.log('before post');
        if (model instanceof Array) {
            toSend = [];
            for (i = 0; i < model.length; i++) {
                toSend[i] = model[i].toJSON();
            }
        } else {
            toSend = model.toJSON();
        }
        console.log(toSend);

        Hoist.post(type, toSend, function(res) {
            console.log('response');
            console.log(res);
            if (model instanceof Array) {
                for (i = 0; i < model.length; i++) {
                    model[i].set('_rev', res[i]._rev);
                    if (!model[i].get("_id")) {
                        model[i].set("_id", res[i]._id);
                    }
                }
            } else {
                if (toSend instanceof Array) {
                    for (i = 0; i < model.length; i++) {
                        model.at(i).set('_rev', res[i]._rev);
                        if (!model.at(i).get("_id")) {
                            model.at(i).set("_id", res[i]._id);
                        }
                    }
                } else {
                    model.set('_rev', res._rev);
                    if (!model.get("_id")) {
                        model.set("_id", res._id);
                    }
                }
            }
            if (success) {
                success.call(context, res);
            }
        }, function(res) {
            console.log(type + " post unsuccessful: " + res);
            console.log(res);
            console.log(model);
            if (error) {
                error.call(context, res);
            }
        }, context);
    };

    Dash.indexProduct = function(product, success, error, context) {
        // home page
        var content = '';
        Dash.products.each(function(product) {
            content = content + product.get('name') + ' ' + product.get('shortDescription') + ' ';
        });
        Hoist.index('#!', content, success, error, context);
        // help desk page
        content = product.get('name') + ' ' + product.get('description');
        Hoist.index('#!' + product.get('URL'), content, success, error, context);
    };

    Dash.indexArticle = function(article, success, error, context) {
        // article page
        var content = article.get('name') + ' ' + article.get('content');
        // get all urls to article
        var urls = article.getAllUrls();
        _.each(urls, function(url) {
            Hoist.index('#!' + url, content, success, error, context);
        });
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

        start: function() {
            this.model.on('change', this.render, this);
            this.model.on('change:logoURL', this.renderLogo, this);
        },

        renderSidebar: function() {
            this.$('.adminSideBar').empty();
            var sideBar = new Dash.AdminSideBar.Product({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        },

        renderLogo: function() {
            Dash.products.on("add", this.render, this);
            console.log('here logo');
            $('#logo').attr('src', this.model.get('logoURL'));
        }
    });

    Dash.View.Admin.Article = Dash.View.Article.extend({
        template: Dash.Template.adminArticle,

        renderSidebar: function() {
            var sideBar = new Dash.AdminSideBar.Article({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        },

    });

    Dash.View.Admin.Section = Dash.View.Section.extend({

    });

    Dash.View.Admin.SiteMap = Dash.View.SiteMap.extend({
        setPublishedTemplate: Dash.Template.siteMapSetPublished,


        start: function() {
            this.model.on('newSection', this.changed, this);
        },

        events: {
            'click .setPublished': 'setPublished',
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            if (this.model.get('sectionJoins').length) {
                var map = this.isList ? new Dash.SiteMap.List({
                    model: this.model
                }) : new Dash.SiteMap.AdminMap({
                    model: this.model
                });
                this.$('.map').append(map.render().el);
                this.$('.map').append(Dash.Template.siteMapSetPublished());
            } else {
                this.$('.map').append(Dash.Template.adminEmptyProduct());
                this.$('> h1').remove();
            }
            this.renderSidebar();
            return this;
        },

        setPublished: function() {
            var that = this;
            this.$('input:checked').each(function() {
                var hash = that.$(this).closest('li').find('a')[0].hash;
                hash = hash.substring(1);
                if (hash.charAt(0) === '!') {
                    hash = hash.substring(1);
                }
                var pathSplit = hash.split("/");
                var product = that.model;
                var article = product.findSection(pathSplit.slice(1));
                article.set('published', true);
                article.set('date', Dash.getDateString());
                Dash.postModel('article', article);
            });
            this.render();
        },

        renderSidebar: function() {
            this.$('.sideBar').empty();
            var sideBar = new Dash.AdminSideBar.Product({
                model: this.model,
            });
            this.$el.append(sideBar.render().el);
        },

        changed: function() {
            console.log('changed');
            this.render();
        },
    });

    Dash.View.Admin.Login = Dash.View.Admin.extend({
        el: "#Login",
        template: Dash.Template.login,

        events: {
            'click button.login': 'login',
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        login: function() {
            this.$('.errorText').remove();
            Hoist.login({
                username: this.$('#EmailAddress').val(),
                password: this.$('#Password').val()
            }, function(res) {
                Dash.router.navigate('!');
                Dash.admin = true;
                new Dash.View.Admin.Home();
            }, function(res) {
                console.log('login unsuccessful: ' + res);
            });
            return false;
        },

        checkInputs: function() {
            var that = this;
            var valid = true;
            this.$('input').each(function() {
                var $this = that.$(this);
                if (!$this.val()) {
                    $this.before(Dash.Template.errorText({
                        errorText: "Field must not be blank."
                    }));
                    valid = false;
                }
            });
            return valid;
        }
    });

    Dash.View.Admin.SignUp = Dash.View.Admin.Login.extend({
        el: "#Signup",
        template: Dash.Template.signup,

        events: {
            'click button.signup': 'signup',
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        signup: function() {

            this.$('.errorText').remove();
            var that = this;
            var error = !this.checkInputs();
            if (this.$('#Password').val().length < 6) {
                this.$('#Password').before(Dash.Template.errorText({
                    errorText: "Password must be at least 6 characters."
                }));
                error = true;
            }
            if (this.$('#Password').val() !== this.$('#RepeatPassword').val()) {
                this.$('#Password').before(Dash.Template.errorText({
                    errorText: "Passwords do not match."
                }));
                error = true;
            }
            //console.log(this.$('input'));
            if (error) {
                return false;
            }
            console.log(this.$('#Password').val());
            Hoist.signup({
                name: this.$('#Name').val(),
                email: this.$('#EmailAddress').val(),
                password: this.$('#Password').val()
            }, function(res) {
                Dash.router.navigate('!');
                Dash.admin = true;
                new Dash.View.Admin.Home();
            }, function(res) {
                console.log('Signup unsuccessful: ' + res);
            });
            return false;
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
            this.renderSideBar();
            // if(this.model && this.renderModel){
            //     this.renderModel();
            // }
            this.$('.preview').hide();
            return this;
        },

        renderSideBar: function() {
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
            this.$('button.save').prop("disabled", true);
            this.$('.errorText').remove();
            var error;
            var treePlaces = this.sideBar.treePlaces;
            if (!(treePlaces && treePlaces.length())) {
                this.$('#productList').before(Dash.Template.errorText({
                    errorText: "Article must be placed in the tree of at least one product."
                }));
                error = true;
            }
            var type = this.getType();
            if (!type) {
                error = true;
            }
            var name = $('#title').val();
            if (!this.checkName(name)) {
                error = true;
            }
            var content = $('#content').val().replace(/\r?\n/g, '<br />');
            if (!(name && content)) {
                this.$('#title').before(Dash.Template.errorText({
                    errorText: "Article must have title and contents."
                }));
                error = true;
            }
            if (error) {
                this.$('button.save').prop("disabled", false);
                return;
            }
            var date = Dash.getDateString();
            var published = this.$('#published').val() === 'published';
            // var date = published ? Dash.getDateString() : "";
            // console.log('here');
            var article = this.saveModel(name, content, type, date, published);
            Dash.indexArticle(article);
        },

        checkName: function(name) {
            if (!name) {
                return false;
            }
            if (!Dash.checkKeywords(name)) {
                this.$('#title').before(Dash.Template.errorText({
                    errorText: "Article name is invalid."
                }));
                return false;
            }

            var sections = this.sideBar.treePlaces.sections;

            for (var i = 0; i < sections.length; i++) {
                var section = sections[i];
                if (section.get('_type') !== 'section') {
                    var path = this.sideBar.treePlaces.sectionUrls[i].split('/');
                    var sectionName = path[path.length - 2];
                    section = section.getSection(sectionName);
                }
                var children = section.getChildren();
                for (var j = 0; j < children.length; j++) {
                    var child = children.at(j);
                    if (child.get('name').equalsIgnoreUrl(name) && child !== this.model) {
                        this.$('#title').before(Dash.Template.errorText({
                            errorText: "Article name is invalid."
                        }));
                        return false;
                    }
                }
            }
            return true;
        },

        saveModel: function(name, content, type, date, published) {
            var article = new Dash.Section.Article({
                name: name,
                content: content,
                type: type,
                _type: 'article',
                date: date,
                published: published
            });
            var that = this;
            this.addTags(article, function() {
                Dash.postModel('article', article, function(res) {
                    this.addToSections(article);
                    article.set('currentProductName', this.sideBar.treePlaces.products[0].get('name'));
                    article.setUrl();
                    Dash.router.navigate('!' + article.get('URL'));
                    new Dash.View.Admin.Article({
                        model: article
                    });
                }, this);
            }, this);
            return article;
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

            // Dash.router.navigate('!newArticle/preview');
            var view = new Dash.View.Article.Preview({
                model: article,
            });
        },
    });

    Dash.View.Admin.EditArticle = Dash.View.Admin.NewArticle.extend({

        start: function() {
            console.log(this.model);
        },

        afterRender: function() {
            this.$('h1').text('Edit Article');
            this.$('#title').val(this.model.get('name'));
            this.$('#content').val(this.model.get('content').replace(/<br \/>/g, '\r\n'));
        },

        renderSideBar: function() {
            this.$('.sideBar').empty();
            this.sideBar = new Dash.SideBar.EditArticle({
                model: this.model,
            });
            console.log(this.sideBar);
            this.$el.append(this.sideBar.render().el);
        },

        saveModel: function(name, content, type, date, published) {
            var article = this.model;

            if (published && !this.model.get('published')) {
                this.model.set({
                    date: date,
                });
            }

            article.set({
                name: name,
                content: content,
                type: type,
                published: published
            });

            var treePlaces = this.sideBar.treePlaces;

            this.addTags(article, function() {
                Dash.postModel('article', article, function(res) {
                    this.addToSections(article);
                    if (!treePlaces.containsUrl(article.get('URL'))) {
                        article.set('currentProductName', treePlaces.products[0].get('name'));
                        article.setUrl();
                    }
                    Dash.router.navigate('!' + article.get('URL'));
                    new Dash.View.Admin.Article({
                        model: article
                    });
                }, this);
            }, this);

            return article;
        },

        addToSections: function(article) {
            var treePlaces = this.sideBar.treePlaces;
            var sections = new Dash.Sections();
            var indexes = [];
            var oldSections = new Dash.Sections(article.get('parentJoins').pluck('parent'));
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
                }
                sections.add(section);
            }
            oldSections.remove(sections.models);
            article.removeSections(oldSections);
            sections.add(oldSections.models);
            Dash.postModel('section', sections);
        },

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
            if (this.model && this.renderModel) {
                this.renderModel();
            }
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

        renderTag: function(name) {
            var tagView = new Dash.NewTagView({
                model: {
                    name: name
                }
            });
            this.$('#tagsList').append(tagView.render().el);
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
            var productName = $($(e.currentTarget.parentElement.parentElement).find('label')[0]).text();
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
            var section;
            var index;
            if (!product) {
                index = this.treePlaces.addSectionUrl(hash);
                section = this.treePlaces.sections[index];
                product = this.treePlaces.products[index];
            } else {
                hash = hash.substring(1);
                if (hash.charAt(0) === '!') {
                    hash = hash.substring(1);
                }
                var pathSplit = hash.split("/");
                section = product.findSection(pathSplit.slice(1));
                this.treePlaces.addPlace(product, hash, section);
            }
            var label = this.$("#_" + product.get('_id') + " div.treePlace");
            label.find('p').text(section.get('name'));
            label.show();
            this.$("#_" + product.get('_id') + " button.treePlace").hide();
            console.log(this.treePlaces);
            return index;
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
                this.renderTag(name);
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

    Dash.SideBar.EditArticle = Dash.SideBar.NewArticle.extend({

        renderModel: function() {
            if (this.rendered) {
                return;
            }
            this.rendered = true;
            var sections = this.model.get('parentJoins').pluck('parent');
            this.treePlaces = new Dash.TreePlaces();
            var products = new Dash.Products();
            for (var i = 0; i < sections.length; i++) {
                var urls = sections[i].getAllUrls("");
                for (var j = 0; j < urls.length; j++) {
                    var index = this.treePlaceCallback(urls[j]);
                    products.push(this.treePlaces.products[index]);
                }
            }
            products.each(function(product) {
                var div = this.$("#_" + product.get('_id'))[0];
                div = this.$(div);
                div.show();
                div.prev().find('.checkbox').prop("checked", true);
            }, this);
            var type = this.model.get('type');
            if (type === 'faq') {
                this.$('#isFaq').prop("checked", true);
            } else if (type === 'howDoI') {
                this.$('#isHowTo').prop("checked", true);
            }
            var tags = this.model.get('tagJoins').pluck('tag');
            this.tagNames = [];
            _.each(tags, function(tag) {
                this.renderTag(tag.get('name'));
                this.tagNames.push(tag.get('name'));
            }, this);
            this.$('#published').val(this.model.get('published') ? 'published' : 'unpublished');
        },
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
            'click button.newSection': 'newSection',
            'click button.newArticle': 'newArticle',
            'click button.productSettings': 'settings',
            'click button.personalise': 'personalise',
        },

        newSection: function() {
            var that = this;
            var modal = new Dash.View.Modal.NewSection({
                model: that.model
            });
        },

        newArticle: function() {
            Dash.router.navigate("newArticle");
            var that = this;
            new Dash.View.Admin.NewArticle();
        },

        settings: function() {
            var that = this;
            new Dash.View.Modal.ProductSetup({
                model: that.model
            });
        },

        personalise: function() {
            var that = this;
            new Dash.View.Modal.ProductPersonalise({
                model: that.model
            });
        }

    });

    Dash.AdminSideBar.Article = Dash.AdminSideBar.extend({
        template: Dash.Template.adminArticleSideBar,

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            'click button.editArticle': 'editArticle',
            'click button.newArticle': 'newArticle',
            'click button.publishArticle': 'publishArticle',
        },

        newArticle: function() {
            Dash.router.navigate("!newArticle");
            var that = this;
            new Dash.View.Admin.NewArticle();
        },

        editArticle: function() {
            var that = this;
            new Dash.View.Admin.EditArticle({
                model: that.model,
            });
        },

        publishArticle: function() {
            this.model.set('published', true);
            this.model.set('date', Dash.getDateString());
            Dash.postModel('article', this.model);
            if (this.articleView) {
                this.articleView.render();
            } else {
                this.render();
            }
        },

    });

    Dash.View.Modal = Dash.View.extend({
        el: "#Modal",
    });

    Dash.View.Modal.ProductSetup = Dash.View.Modal.extend({
        template: Dash.Template.productSetup,

        events: {
            'click button.save': 'save',
            'click .content': 'swallow',
            'click .uploadLogo': 'uploadLogo',
            'click button.cancel': 'trash',
            'click': 'trash'
        },

        render: function() {
            this.$el.html(this.template());
            if (this.model) {
                this.$('#name').val(this.model.get('name'));
                this.$('#description').val(this.model.get('description'));
            }
            this.$(':file').hide();
            return this;
        },

        save: function() {
            this.$('button.save').prop("disabled", true);
            this.$('.errorText').remove();
            var name = this.$('#name').val();
            if (!this.checkName(name)) {
                this.$('#name').before(Dash.Template.errorText({
                    errorText: "Name is invalid."
                }));
                this.$('button.save').prop("disabled", false);
                return;
            }
            var description = this.$('#description').val();
            var attributes = {
                name: name,
                description: description,
                shortDescription: description,
                URL: name.replace(/\s/g, "")
            };
            var product;
            if (this.model) {
                product = this.model.set(attributes);
            } else {
                product = new Dash.Product(attributes);
            }

            var file = this.$(':file')[0].files[0];

            Dash.postModel("product", product, function(res) {
                if (file) {
                    Hoist.file(product.get("_id"), file, function(res) {
                        console.log('filepost');
                        product.set("logoURL", URL.createObjectURL(file));
                    }, function(res) {
                        console.log("file post unsuccessful: " + res);
                    });
                }
                Dash.products.add(product);
                this.trash();
            }, this);

            Dash.indexProduct(product);
        },

        checkName: function(name) {
            if (name === "" || name === undefined) {
                return false;
            }
            if (!Dash.checkKeywords(name)) {
                return false;
            }
            for (var j = 0; j < Dash.products.length; j++) {
                var product = Dash.products.at(j);
                if (product !== this.model && product.get('name').equalsIgnoreUrl(name)) {
                    return false;
                }
            }
            return true;
        },

        uploadLogo: function() {
            this.$(':file').click();
        }

    });

    Dash.View.Modal.ProductPersonalise = Dash.View.Modal.extend({
        template: Dash.Template.productPersonalise,

        events: {
            'click button.save': 'save',
            'click .content': 'swallow',
            'click button.cancel': 'trash',
            'click .uploadLogo': 'uploadLogo',
            'change :file': 'change',
            'click': 'trash'
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$(':file').hide();
            return this;
        },

        save: function() {
            this.$('button.save').prop("disabled", true);
            this.$('.errorText').remove();
            var primary = this.$('.primary').val();
            var secondary = this.$('.secondary').val();
            if (primary) {
                this.model.set('themeColour', primary);
            }
            if (secondary) {
                this.model.set('secondaryTheme', secondary);
            }
            var file = this.$(':file')[0].files[0];
            Dash.postModel('product', this.model, function() {
                if (file) {
                    Hoist.file(this.model.get("_id"), file, function(res) {
                        console.log('filepost');
                        this.model.set("logoURL", URL.createObjectURL(file));
                    }, function(res) {
                        console.log("file post unsuccessful: " + res);
                    }, this);
                }
                this.trash();
            }, this);
        },

        uploadLogo: function() {
            this.$(':file').click();
        },

        change: function(e) {
            var file = this.$(':file')[0].files[0];
            this.$('.logo').attr('src', URL.createObjectURL(file));
        },
    });

    Dash.View.Modal.NewSection = Dash.View.Modal.extend({
        template: Dash.Template.newSection,

        events: {
            'click button.save': 'save',
            'click button.cancel': 'trash',
            'click .treePlace': 'treePlaceFunction',
            'click .content': 'swallow',
            'click': 'trash',
        },

        render: function() {
            this.$el.html(this.template());
            this.$el.find('div.treePlace').hide();
            return this;
        },

        save: function() {
            this.$('button.save').prop("disabled", true);
            this.$('.errorText').remove();
            var error;
            if (!this.treePlace) {
                this.$('button.treePlace').before(Dash.Template.errorText({
                    errorText: "Section must be placed in the tree."
                }));
                error = true;
            }
            var name = this.$('#name').val();
            if (!this.checkName(name)) {
                this.$('#name').before(Dash.Template.errorText({
                    errorText: "Section name is invalid."
                }));
                error = true;
            }
            if (error) {
                this.$('button.save').prop("disabled", false);
                return;
            }
            var that = this;
            var section = new Dash.Section.Section({
                name: name,
                _type: 'section'
            });
            Dash.postModel("section", section, function(res) {
                this.treePlace.addChild(section);
                this.treePlace.trigger('newSection');
                Dash.postModel(this.treePlace.get('_type'), this.treePlace, function() {
                    this.trash();
                }, this);
            }, this);
        },


        // probably should be refactored as almost identical to that in newArticle
        // params: name, error tag, treeplace sections (will need to check if product), context
        checkName: function(name) {
            if (name === "" || name === undefined) {
                return false;
            }
            if (!Dash.checkKeywords(name)) {
                return false;
            }
            var children;
            if (this.treePlace.get('_type') === 'section') {
                children = this.treePlace.getChildren();
            } else if (this.treePlace.get('_type') === 'product') {
                children = this.treePlace.getSections();
            }
            for (var j = 0; j < children.length; j++) {
                var child = children.at(j);
                if (child.get('name').equalsIgnoreUrl(name) && child !== this.model) {
                    return false;
                }
            }
            return true;
        },

        treePlaceFunction: function(e) {
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
            if (hash.charAt(0) === '!') {
                hash = hash.substring(1);
            }
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
        },

        // end: function() {
        //     if (this.treePlace.get('_type') !== 'product') {
        //         this.model.trigger('change');
        //         console.log(this.model);
        //         console.log('here');
        //     }
        // }
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
            this.$('button.save').prop("disabled", true);
            var selected = this.$(".map .themeText");
            if (selected[0]) {
                var hash = selected[0].hash;
                if (this.callback) {
                    this.callback.call(this.callbackContext, hash, this.model);
                }
                this.trash();
            }
            this.$('button.save').prop("disabled", false);
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
            console.log('treeplace modal renderTree');
            console.log(this.model);
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