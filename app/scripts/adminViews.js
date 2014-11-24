define(['dash', 'backbone', 'Hoist', 'views', 'templates'], function(Dash, Backbone, Hoist) {
    'use strict';

    Dash.shadeColor = function(color, percent) {
        var R, G, B;
        if (color.length < 7) { // support for #RGB and #RRGGBB
            R = parseInt(color.substring(1, 2), 16);
            G = parseInt(color.substring(2, 3), 16);
            B = parseInt(color.substring(3, 4), 16);
        } else {
            R = parseInt(color.substring(1, 3), 16);
            G = parseInt(color.substring(3, 5), 16);
            B = parseInt(color.substring(5, 7), 16);
        }

        R = 255 - parseInt((255 - R) * (100 - percent) / 100);
        G = 255 - parseInt((255 - G) * (100 - percent) / 100);
        B = 255 - parseInt((255 - B) * (100 - percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;
        R = (R > 0) ? R : 0;
        B = (B > 0) ? B : 0;
        G = (G > 0) ? G : 0;

        var RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        var GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        var BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    };

    Dash.validHex = function(color) {
        var R = parseInt(color.substring(1, 3), 16);
        var G = parseInt(color.substring(3, 5), 16);
        var B = parseInt(color.substring(5, 7), 16);
        return !(color.charAt(0) !== '#' || isNaN(R) || isNaN(G) || isNaN(B));
    };

    Dash.getThemeStyleText = function(colour, selector) {
        var lighterColour = Dash.shadeColor(colour, 25);
        if (!selector) {
            selector = '';
        }
        return selector + '.themeColour {' +
            'background: ' + colour + ';' +
            '}' +
            selector + '.themeText {' +
            'color: ' + colour + ';' +
            '}' +
            selector + '.themeButton {' +
            'background: ' + colour + ';' +
            'border-color: ' + colour + ';' +
            'background: -webkit-gradient(linear, left top, left bottom, from(' + lighterColour + '), to(' + colour + '));' +
            'background: -moz-linear-gradient(top, ' + lighterColour + ', ' + colour + ');' +
            'filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr="' + lighterColour + '", endColorstr="' + colour + '");' +
            '}' +
            selector + '.themeBorder {' +
            'border-color: ' + colour + ';' +
            '}' +
            selector + 'h1, ' + selector + 'h2,' + selector + ' h3,' + selector + ' h4,' + selector + ' h5,' + selector + ' h6{' +
            'color: ' + colour + ';' +
            '}' +
            selector + '#productMenu {' +
            'background: ' + lighterColour + ';' +
            '}' +
            selector + '#productMenu li {' +
            'border-top: 1px solid' + colour + ';' +
            '}' +
            selector + '#productMenu li:hover{' +
            'background: ' + colour + ';' +
            '}' +
            selector + '.map .bold > a.themeText {' +
            'color: ' + colour + ';' +
            '}' +
            selector + '.textBlock a {' +
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
                return index;
            }
        };
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
        if (model instanceof Array) {
            toSend = [];
            for (i = 0; i < model.length; i++) {
                toSend[i] = model[i].toJSON();
            }
        } else {
            toSend = model.toJSON();
        }

        Hoist.post(type, toSend, function(res, xhr) {
            if (model instanceof Array) {
                for (i = 0; i < model.length; i++) {
                    if (!model[i].get("_id")) {
                        model[i].set("_id", res[i]._id);
                    }
                }
            } else {
                if (toSend instanceof Array) {
                    for (i = 0; i < model.length; i++) {
                        if (!model.at(i).get("_id")) {
                            model.at(i).set("_id", res[i]._id);
                        }
                    }
                } else {
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

    // in the following index methods success and error may be called multiple times

    // recurseUp = true if creating or name change i.e. needs to bubble up tree updating links, defaults to false
    // recurseDown = true if name or parent change i.e. needs to bubble down the tree updating urls, defaults to false

    Dash.indexProduct = function(recurseDown, product, success, error, context) {
        if (!product || typeof product === "function") {
            context = error;
            error = success;
            success = product;
            product = recurseDown;
            recurseDown = false;
        }
        var template = Dash.Template.htmlWrapper;
        // home page
        var dummyView = new Dash.View.Dummy.Home();
        var content = template({
            content: dummyView.el.outerHTML
        });
        var toIndex = [];
        toIndex.push({
            path: '/#!',
            content: content
        });
        // help desk page
        dummyView = new Dash.View.Dummy.HelpDesk({
            model: product
        });
        content = template({
            content: dummyView.el.outerHTML
        });
        toIndex.push({
            path: '/#!' + product.get('URL'),
            content: content
        });
        // only need to index sitemap when there is a name change, as editing product doesn't change the sitemap, and when created the sitemap is blank
        if (recurseDown) {
            //index sitemap
            dummyView = new Dash.View.Dummy.SiteMap({
                model: product
            });
            content = template({
                content: dummyView.el.outerHTML
            });
            toIndex.push({
                path: '/#!' + product.get('URL') + '/sitemap',
                content: content
            });
            // index child sections.
            product.get('sectionJoins').each(function(sectionJoin) {
                var section = sectionJoin.get('section');
                toIndex = toIndex.concat(Dash.getIndexSectionArray(false, true, section));
            });
        }
        Hoist.index(toIndex, success, error, context);
    };

    Dash.getIndexArticleArray = function(recurseUp, article) {
        var template = Dash.Template.htmlWrapper;
        var toIndex = [];
        var originalProduct = article.get('currentProductName');
        // index all urls to article
        var urls = article.getAllUrls();
        _.each(urls, function(url) {
            var productName = url.slice(0, url.indexOf('/'));
            article.set('currentProductName', productName);
            // article page from procuct
            var dummyView = new Dash.View.Dummy.Article({
                model: article
            });
            var content = template({
                content: dummyView.el.outerHTML
            });

            toIndex.push({
                path: '/#!' + url,
                content: content
            });
        });
        article.set('currentProductName', originalProduct);
        if (recurseUp) {
            // all sections that are connected need to have links updated
            article.get('parentJoins').each(function(parentJoin) {
                var parent = parentJoin.get('parent');
                toIndex = toIndex.concat(Dash.getIndexSectionArray(true, false, parent));
            });
        }
        return toIndex;
    };

    Dash.indexArticle = function(recurseUp, article, success, error, context) {
        if (!article || typeof article === "function") {
            context = error;
            error = success;
            success = article;
            article = recurseUp;
            recurseUp = false;
        }
        var toIndex = Dash.getIndexArticleArray(recurseUp, article);
        Hoist.index(toIndex, success, error, context);
    };

    Dash.getIndexSectionArray = function(recurseUp, recurseDown, section) {
        var template = Dash.Template.htmlWrapper;
        var toIndex = [];
        // section page
        var dummyView = new Dash.View.Dummy.Section({
            model: section
        });
        var content = template({
            content: dummyView.el.outerHTML
        });
        toIndex.push({
            path: '/#!' + section.get('URL'),
            content: content
        });
        if (recurseUp) {
            // all products that are connected need to have links updated
            section.get('productJoins').each(function(productJoin) {
                var product = productJoin.get('product');
                dummyView = new Dash.View.Dummy.HelpDesk({
                    model: product
                });
                content = template({
                    content: dummyView.el.outerHTML
                });
                toIndex.push({
                    path: '/#!' + product.get('URL'),
                    content: content
                });
                dummyView = new Dash.View.Dummy.SiteMap({
                    model: product
                });
                content = template({
                    content: dummyView.el.outerHTML
                });
                toIndex.push({
                    path: '/#!' + product.get('URL') + '/sitemap',
                    content: content
                });
            });
            // all sections that are connected need to have links updated
            section.get('parentJoins').each(function(parentJoin) {
                var parent = parentJoin.get('parent');
                toIndex = toIndex.concat(Dash.getIndexSectionArray(true, false, parent));
            });
        }
        if (recurseDown) {
            // index children
            var sections = section.getChildren();
            sections.each(function(child) {
                if (child.get('_type') === 'section') {
                    toIndex = toIndex.concat(Dash.getIndexSectionArray(false, true, child));
                } else if (child.get('published')) {
                    toIndex = toIndex.concat(Dash.getIndexArticleArray(false, child));
                }

            });
        }
        return toIndex;
    };

    Dash.indexSection = function(recurseUp, recurseDown, section, success, error, context) {
        if (!section || typeof section === "function") {
            context = error;
            error = success;
            success = section;
            section = recurseDown;
            recurseDown = false;
        }
        if (!section || typeof section === "function") {
            context = error;
            error = success;
            success = section;
            section = recurseUp;
            recurseUp = false;
        }
        var toIndex = Dash.getIndexSectionArray(recurseUp, recurseDown, section);
        Hoist.index(toIndex, success, error, context);
    };

    Dash.deIndexArticle = function(article, success, error, context) {
        // deIndex all urls to article
        var urls = article.getAllUrls();
        _.each(urls, function(url) {
            Hoist.deIndex('/#!' + url, success, error, context);
        });
        // all sections that are connected need to have links updated.
        article.get('parentJoins').each(function(parentJoin) {
            var parent = parentJoin.get('parent');
            Dash.indexSection(true, false, parent);
        });
    };

    Dash.deIndexSection = function(recurseUp, section, success, error, context) {
        // deIndex all url to section
        Hoist.deIndex('/#!' + section.get('URL') + '/*', true, success, error, context);
        if (recurseUp) {
            // all sections that are connected need to have links updated.
            section.get('parentJoins').each(function(parentJoin) {
                var parent = parentJoin.get('parent');
                Dash.indexSection(true, false, parent);
            });
        }
    };

    Dash.deIndexProduct = function(productMenu, success, error, context) {
        // deIndex url to product
        Hoist.deIndex('/#!' + product.get('URL') + '/*', success, error, context);
    };

    Dash.AdminMenu = Dash.View.extend({
        el: '#Header',
        template: Dash.Template.adminMenu,
        itemTemplate: Dash.Template.productMenuItem,

        start: function() {
            this.model.on('change', this.render, this);
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
        },

        events: {
            'click .logout': 'logout',
            'click .arrow': 'toggleProductMenu',
            'mouseenter .productSelect': 'productMenu',
            'mouseleave .productSelect': 'removeProductMenu',
            'click .productSelect p': 'productNavigate',
            'click li': 'selectProduct',
        },

        logout: function() {
            if (Dash.admin) {
                Hoist.logout(function() {}, function(res) {
                    console.log('logout failed');
                    console.log(res);
                });
            }
            this.model.set('user', '');
            Dash.admin = false;
            Dash.router.navigate('');
            Dash.router.find('window.location.hash');
        },

        productNavigate: function(e, productURL) {
            if (!productURL) {
                var product = this.model.get('product');
                if (product) {
                    productURL = product.get('URL');
                }
            }
            if (productURL) {
                this.removeProductMenu();
                Dash.router.navigate(productURL);
                Dash.router.find(productURL);
            }
        },

        toggleProductMenu: function(e) {
            if (this.$('#productMenu li').length) {
                this.removeProductMenu(e);
            } else {
                this.productMenu(e);
            }
        },

        productMenu: function(e) {
            e.preventDefault();
            this.$('#productMenu').empty();
            Dash.products.each(function(product) {
                this.$('#productMenu').append(this.itemTemplate(product.toJSON()));
            }, this);
        },

        removeProductMenu: function(e) {
            this.$('#productMenu').empty();
        },

        selectProduct: function(e) {
            e.preventDefault();
            var target = this.$(e.currentTarget);
            this.productNavigate(e, target.find('a').attr('href'));
        }
    });


    Dash.NewTagView = Backbone.View.extend({
        tagName: "div",
        template: Dash.Template.newTag,
        className: "newTag",

        render: function() {
            this.$el.html(this.template(this.model));
            var that = this;
            this.$('.delete img').load(function() {
                var height = that.$el.height();
                var cross = that.$('img');
                cross.css('margin-top', (height - cross.height()) / 2);
                cross.css('margin-bottom', (height - cross.height()) / 2);
            });
            return this;
        },
    });

    Dash.NewKeySectionView = Dash.NewTagView.extend({

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var that = this;
            this.$('.delete img').load(function() {
                var height = that.$el.height();
                var cross = that.$('img');
                cross.css('margin-top', (height - cross.height()) / 2);
                cross.css('margin-bottom', (height - cross.height()) / 2);
            });
            return this;
        },
    });

    Dash.CheckboxItem = Dash.ListItem.extend({
        template: Dash.Template.checkboxProduct,

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var that = this;
            return this;
        }
    });

    Dash.View.Admin = Dash.View.extend({});

    Dash.View.Admin.Home = Dash.View.Home.extend({
        template: Dash.Template.adminHome,

        start: function() {
            this.model = Dash.products;
            this.productCount = 0; // possibly use for rendering products when > 3
            Dash.products.on("add", this.render, this);
            $(window).resize($.proxy(this.windowResize, this));
        },

        events: {
            "click button": "addProduct",
            "click .leftCover, .rightCover": "moveProducts",
        },

        renderProduct: function(item) {
            var homeProductView = new Dash.HomeProductView({
                model: item
            });
            this.$("#products").append(homeProductView.render().el);
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
            $('#logo').attr('src', this.model.get('logoURL') + '#' + new Date().getTime());
        }
    });

    Dash.View.Admin.Article = Dash.View.Article.extend({
        template: Dash.Template.adminArticle,

        start: function() {
            this.model.on('change:published', this.render, this);
        },

        renderSidebar: function() {
            var sideBar = new Dash.AdminSideBar.Article({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        }

    });

    Dash.View.Admin.Section = Dash.View.Section.extend({
        start: function() {
            this.model.on('change', this.render, this);
        },

        renderSidebar: function() {
            var sideBar = new Dash.AdminSideBar.Section({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        }
    });

    Dash.View.Admin.Tag = Dash.View.Tag.extend({
        renderSidebar: function() {
            // var sideBar = new Dash.AdminSideBar.Tag({
            //     model: this.model
            // });
            // this.$el.append(sideBar.render().el);
        }
    });

    Dash.View.Admin.SiteMap = Dash.View.SiteMap.extend({
        setPublishedTemplate: Dash.Template.siteMapSetPublished,
        listHeaderTemplate: Dash.Template.adminMapListHeader,

        start: function() {
            this.model.on('newSection', this.render, this);
            var url = window.location.hash;
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            var pathSplit = url.split('/');
            this.isList = 'list'.equalsIgnoreUrl(pathSplit[pathSplit.length - 1]);
        },

        events: {
            'click .setPublished p': 'setPublished',
            'click .toggle': 'toggleMap'
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            //this.$('h1').first().after(this.mapListToggleTemplate());
            this.$('.toggle' + (this.isList ? 'List' : 'Map')).addClass('themeButton');
            this.$('.toggle' + (this.isList ? 'List' : 'Map') + ' img').attr('src', 'images/' + (this.isList ? 'list' : 'map') + '_white.png');
            this.$('.toggle' + (this.isList ? 'Map' : 'List') + ' img').attr('src', 'images/' + (this.isList ? 'map' : 'list') + '_grey.png');
            if (this.model.get('sectionJoins').length) {
                var map;
                if (this.isList) {
                    this.$('.map').addClass('admin');
                    this.$('.map').append(this.listHeaderTemplate());
                    map = new Dash.SiteMap.AdminList({
                        model: this.model
                    });
                    this.$('.map').append(map.render().$(' > div'));
                } else {
                    map = new Dash.SiteMap.AdminMap({
                        model: this.model
                    });
                    this.$('.map').append(map.render().el);
                }
                this.$('.map').append(Dash.Template.siteMapSetPublished());
            } else {
                this.$('.map').html(Dash.Template.adminEmptyProduct());
                this.$('.toggle').hide();
            }
            this.renderSidebar();
            return this;
        },

        setPublished: function() {
            var that = this;
            this.$('input:checked').each(function() {
                var hash = that.$(this).closest('.published').parent().find('a')[0].hash;
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
        }
    });

    Dash.View.Admin.Login = Dash.View.Admin.extend({
        el: "#Login",
        template: Dash.Template.login,

        events: {
            'click button.login': 'login',
            'keydown input': 'keydown'
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        login: function() {
            this.$('button.login').prop("disabled", true);
            this.$('.errorText').remove();
            Hoist.login({
                username: this.$('#EmailAddress').val(),
                password: this.$('#Password').val()
            }, function(res) {
                Dash.admin = true;
                Dash.user = res;
                Dash.user.name = res.name ? res.name : res.metaData ? res.metaData.name ? res.metaData.name : '' : '';
                Dash.router.navigate('!');
                new Dash.router.find();
            }, function(res) {
                this.$('button.login').prop("disabled", false);
                console.log('login unsuccessful: ' + res);
            }, this);
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
        },

        keydown: function(e) {
            if (e.which === 13) {
                e.preventDefault();
                this.login();
            }
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
            this.$('button.login').prop("disabled", true);
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
                this.$('button.save').prop("disabled", false);
            });
            return false;
        }
    });

    Dash.View.Admin.NewArticle = Dash.View.Admin.extend({
        el: "#Article",
        template: Dash.Template.newArticle,
        previewTemplate: Dash.Template.preview,

        events: {
            'click button.save': 'save',
            'click .fullPreview': 'fullPreview',
            'keyup #title': 'renderPreview',
            'keyup #content': 'renderPreview'
        },

        render: function() {
            this.$el.html(this.template());
            this.renderSideBar();
            this.menuView = new Dash.View.FormatingMenu({
                el: '#newArticleContainer'
            });
            this.$('.twoThird').html();
            this.$('.preview, :file').hide();
            if (this.model && this.renderModel) {
                this.renderModel();
            }
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
            //  var content = $('#content').val().replace(/\r?\n/g, '<br />');
            var content = $('#content').val();
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
            var article = this.saveModel(name, content, type, date, published);
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

            if (name.indexOf('/') !== -1) {
                this.$('#title').before(Dash.Template.errorText({
                    errorText: "Article name cannot contain '/'."
                }));
                return false;
            }

            if (this.treePlaces) {
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
            }
            return true;
        },

        saveModel: function(name, content, type, date, published) {
            var article = new Dash.Section.Article({
                name: name,
                content: content,
                type: type,
                date: date,
                published: published
            });
            var that = this;
            this.addTags(article, function() {
                Dash.postModel('article', article, function(res) {
                    this.addToSections(article);
                    article.set('currentProductName', this.sideBar.treePlaces.products[0].get('name'));
                    article.setUrl();
                    Dash.indexArticle(true, article);
                    Dash.router.navigate('!' + article.get('URL'));
                    Dash.router.find('!' + article.get('URL'));
                }, function(res) {
                    this.$('button.save').prop("disabled", false);
                }, this);
            }, this);
            return article;
        },

        getType: function() {
            if (this.$('#isFaq').is(':checked')) {
                if (this.$('#isHowTo').is(':checked')) {
                    this.$('#isFaq').before(Dash.Template.errorText({
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
            var sections = [];
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
                sections.push(section);
            }
            Dash.postModel('section', sections);
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
                date: date,
                currentProductName: "",
            });

            // Dash.router.navigate(window.location.hash.substring(1) + '/preview');
            var view = new Dash.View.Article.Preview({
                model: article,
            });
        },
    });

    Dash.View.FormatingMenu = Backbone.View.extend({

        events: {
            'click #formatHeading': 'formatHeading',
            'click #formatSubHeading': 'formatSubHeading',
            'click #formatBody': 'formatBody',
            'click #formatImage': 'formatImage',
            'change #formatImage :file': 'uploadImage',
            'click #formatVideo': 'formatVideo',
            'click #formatArticleLink': 'formatArticleLink',
        },

        formatHeading: function(e) {
            var textarea = this.$('#content');
            textarea.focus();
            var selection = textarea.getSelection();
            var toInsert = selection.start ? '\n###' : '###';
            textarea.insertText(toInsert, selection.start, 'collapseToEnd');
        },

        formatSubHeading: function(e) {
            var textarea = this.$('#content');
            textarea.focus();
            var selection = textarea.getSelection();
            var toInsert = selection.start ? '\n####' : '####';
            textarea.insertText(toInsert, selection.start, 'collapseToEnd');
        },

        formatBody: function(e) {
            var textarea = this.$('#content');
            textarea.focus();
            var selection = textarea.getSelection();
            if (selection.start) {
                textarea.insertText('\n', selection.start, 'collapseToEnd');
            }
        },

        formatImage: function(e) {
            var fileInput = this.$('#formatImage :file')[0];
            if (e.target !== fileInput) {
                this.$('#formatImage :file').click();
            }
        },

        formatVideo: function(e) {
            var modal = new Dash.View.Modal.Video();
            modal.callback = this.addVideo;
            modal.callbackContext = this;
        },

        uploadImage: function() {
            var fileInput = this.$('#formatImage :file')[0];
            var file = fileInput.files[0];
            var name = fileInput.value;
            name = name.slice(name.lastIndexOf('/') + 1);
            name = name.slice(name.lastIndexOf('\\') + 1);
            name = Dash.urlEscape(name);
            Hoist.file('image' + name, file, function() {
                var textarea = this.$('#content');
                textarea.focus();
                var selection = textarea.getSelection();
                textarea.insertText((selection.start ? '\n' : '') + '![Alt text](!Hoist' + name + ')\n', selection.end, 'collapseToEnd');
            }, function() {
                console.log('file upload unsuccessful' + res);
            }, this);
        },

        addVideo: function(url) {
            var textarea = this.$('#content');
            textarea.focus();
            var selection = textarea.getSelection();
            textarea.insertText((selection.start ? '\n' : '') + '^^' + url, selection.start, 'collapseToEnd');
        },

        formatArticleLink: function() {
            var modal = new Dash.View.Modal.SelectArticle();
            modal.callback = this.addArticleLink;
            modal.callbackContext = this;
        },

        addArticleLink: function(articleUrl) {
            var textarea = this.$('#content');
            textarea.focus();
            var selection = textarea.getSelection();
            var urlSplit = articleUrl.slice(2).split('/');
            var product = Dash.products.findProduct(urlSplit.shift());
            if (product) {
                var article = product.findSection(urlSplit);
                if (article) {
                    textarea.insertText((selection.start ? '\n' : '') + '[](!Hoist' + article.get('_id') + ')', selection.end, 'collapseToEnd');
                }
            }
        }
    });

    Dash.View.Admin.EditArticle = Dash.View.Admin.NewArticle.extend({

        renderModel: function() {
            this.$('h1').text('Edit Article');
            this.$('#title').val(this.model.get('name'));
            this.$('#content').val(this.model.get('content').replace(/<br \/>/g, '\r\n'));
            this.renderPreview();
        },

        renderSideBar: function() {
            this.$('.sideBar').empty();
            this.sideBar = new Dash.SideBar.EditArticle({
                model: this.model,
            });
            this.$el.append(this.sideBar.render().el);
        },

        saveModel: function(name, content, type, date, published) {
            var article = this.model;
            var nameChange = this.model.get('name') !== name;
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
                    this.addToSections(article, nameChange);
                    if (!treePlaces.containsUrl(article.get('URL'))) {
                        article.set('currentProductName', treePlaces.products[0].get('name'));
                        article.setUrl();
                    }
                    var keyProductJoins = article.get('keyProductJoins');
                    var products = [];
                    keyProductJoins.each(function(productJoin) {
                        var product = productJoin.get('product');
                        if (!treePlaces.containsProduct) {
                            products.push(product);
                            productJoin.destroy();
                        }
                    });
                    if (products.length) {
                        Dash.postModel('product', products);
                    }
                    Dash.router.navigate('!' + article.get('URL'));
                    Dash.router.find('!' + article.get('URL'));
                    Dash.indexArticle(false, article);
                }, this);
            }, this);

            return article;
        },

        addToSections: function(article, nameChange) {
            // Dash.deIndexArticle(false, article);
            var treePlaces = this.sideBar.treePlaces;
            var sections = new Dash.Sections();
            var unchangedSections = new Dash.Sections();
            var indexes = [];
            var oldSections = new Dash.Sections(article.get('parentJoins').pluck('parent'));
            for (var i = 0; i < treePlaces.length(); i++) {
                var section = treePlaces.sections[i];
                if (oldSections.get(section)) {
                    unchangedSections.add(section);
                } else {
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
            }
            oldSections.remove(unchangedSections.models);
            article.removeSections(oldSections);
            sections.add(oldSections.models);
            if (sections.length) {
                Dash.postModel('section', sections);
            }
            sections.each(function(section) {
                Dash.indexSection(true, false, section);
            });
            if (nameChange) {
                unchangedSections.each(function(section) {
                    Dash.indexSection(true, false, section);
                });
            }
        },

    });

    Dash.View.Article.Preview = Dash.View.Article.extend({
        el: '#Preview',
        backButtonTemplate: Dash.Template.backButton,

        render: function() {
            this.$el.empty();
            this.$el.html(this.template(this.model.toJSON()));
            // this.renderSidebar();
            this.renderTags();
            this.renderRelevantArticles();
            this.$el.prepend(this.backButtonTemplate({
                text: "Exit Preview"
            }));
            Dash.loadImages(this.$('.textBlock'));
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

    Dash.AdminMapItem = Dash.ListItem.extend({
        publishedTemplate: Dash.Template.adminMapItemPublished,
        unpublishedTemplate: Dash.Template.adminMapItemUnpublished,

        render: function() {
            //console.log(this.template);
            this.$el.html(this.template(this.model.toJSON()));
            if (this.model.get('published')) {
                this.$el.append(this.publishedTemplate(this.model.toJSON()));
            } else {
                this.$el.append(this.unpublishedTemplate(this.model.toJSON()));
            }
            return this;
        }
    });

    Dash.AdminMapListItem = Dash.AdminMapItem.extend({
        tagName: 'div',
        template: Dash.Template.adminMapListItem
    });

    Dash.SiteMap.AdminMap = Dash.SiteMap.Map.extend({

        renderInnerMap: function(section) {
            var map = new Dash.SiteMap.AdminMap({
                model: section
            });
            this.$("li").last().append(map.render().el);
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

    Dash.SiteMap.AdminList = Dash.SiteMap.List.extend({
        renderListItem: function(item) {
            var listItem;
            listItem = new Dash.AdminMapListItem({
                model: item
            });
            if (listItem) {
                this.$el.append(listItem.render().el);
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
            this.$(li).find('.treePlaceContainer, div.treePlace').toggle();
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
            var productName = this.$(e.currentTarget).parent().parent().find('label').first().text();
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
            label.show({
                complete: function() {
                    var height = label.height();
                    var img = label.find('img');
                    img.css('margin-top', (height - img.height()) / 2);
                    img.css('margin-bottom', (height - img.height()) / 2);
                }
            });
            this.$("#_" + product.get('_id') + " button.treePlace").hide();
            return index;
        },

        addTag: function() {
            this.$('.errorText').remove();
            var input = this.$('#tagName');
            var name = input.val();
            if (!name) {
                return;
            }
            if (name.indexOf('/') !== -1) {
                this.$('#tagName').before(Dash.Template.errorText({
                    errorText: "tag cannot contain '/'."
                }));
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
        },

        removeTag: function(e) {
            var tag = e.currentTarget.parentElement;
            var tag$ = this.$(tag);
            var tagName = tag$.find('> p')[0].innerText;
            this.tagNames.splice(this.tagNames.indexOf(tagName), 1);
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
                var urls = sections[i].getAllUrls();
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
            'click button.settings': 'settings',
            'click button.personalise': 'personalise',
            'click button.editKeySections': 'keySections'
        },

        newSection: function() {
            var modal = new Dash.View.Modal.NewSection({
                model: this.model
            });
        },

        newArticle: function() {
            Dash.router.navigate("newarticle");
            new Dash.View.Admin.NewArticle();
        },

        settings: function() {
            new Dash.View.Modal.ProductSetup({
                model: this.model
            });
        },

        personalise: function() {
            new Dash.View.Modal.ProductPersonalise({
                model: this.model
            });
        },

        keySections: function() {
            new Dash.View.Modal.EditKeySections({
                model: this.model
            });
        }
    });
    Dash.AdminSideBar.Section = Dash.AdminSideBar.extend({
        template: Dash.Template.adminSectionSideBar,

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        events: {
            'click button.newSection': 'newSection',
            'click button.newArticle': 'newArticle',
            'click button.editSection': 'editSection'
        },

        newSection: function() {
            var product = this.model.getProduct(undefined, true);
            var modal = new Dash.View.Modal.NewSection({
                model: product
            });
        },

        editSection: function() {
            var modal = new Dash.View.Modal.NewSection({
                model: this.model
            });
        },

        newArticle: function() {
            Dash.router.navigate("newArticle");
            new Dash.View.Admin.NewArticle();
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
            //Dash.router.navigate(window.location.hash.substring(1) + '/edit');
            new Dash.View.Admin.EditArticle({
                model: that.model,
            });
        },

        publishArticle: function() {
            this.model.set('published', !this.model.get('published'));
            this.model.set('date', Dash.getDateString());
            Dash.postModel('article', this.model);
            // this.$('.publishArticle img').attr('src', 'images/'+ (this.model.get('published') ?'un':'') + 'publish.png');
            // this.$('.publishArticle p').text(this.model.get('published') ?'Unpublish Article':'Publish Article');
        },

    });

    Dash.View.Modal.ProductSetup = Dash.View.Modal.extend({
        template: Dash.Template.productSetup,

        events: {
            'click button.save': 'save',
            'click .content': 'swallow',
            'click .uploadLogo': 'uploadLogo',
            'change :file': 'changeLogo',
            'click button.cancel': 'trash',
            'click': 'trash',

        },

        render: function() {
            this.$el.html(this.template());
            this.$(':file').hide();
            if (this.model) {
                this.$('#name').val(this.model.get('name'));
                this.$('#description').val(this.model.get('description'));
                this.$('#shortDescription').val(this.model.get('shortDescription'));
                this.$('.uploadLogo').first().hide();
                this.$('.changeLogo .logo').attr('src', this.model.get('logoURL'));
            } else {
                this.$('.changeLogo').hide();
            }
            this.resizeLogo();
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
            var shortDescription = this.$('#shortDescription').val();
            var description = this.$('#description').val();
            var attributes = {
                name: name,
                description: description,
                shortDescription: shortDescription,
                URL: Dash.urlEscape(name)
            };
            var file = this.$(':file')[0].files[0];
            if (!(file || this.$('.changeLogo .logo').attr('src'))) {
                this.$('.uploadLogo').prepend(Dash.Template.errorText({
                    errorText: "Upload a logo."
                }));
                this.$('button.save').prop("disabled", false);
                return;
            }
            var product;
            var index;
            if (this.model) {
                if (this.model.get('name') !== attributes.name) {
                    Dash.deIndexProduct(this.model);
                }
                product = this.model.set(attributes);
            } else {
                product = new Dash.Product(attributes);
            }
            Dash.postModel("product", product, function(res) {
                if (file) {
                    Hoist.file(product.get("_id"), file, function(res) {
                        this.model.trigger('change:logoURL');
                    }, function(res) {
                        console.log("file post unsuccessful: " + res);
                    });
                }
                Dash.products.add(product);
                Dash.indexProduct(this.model ? true : false, product);
                this.trash();
            }, function(res) {
                this.$('button.save').prop("disabled", false);
            }, this);
        },

        checkName: function(name) {
            if (name === "" || name === undefined) {
                return false;
            }
            if (!Dash.checkKeywords(name)) {
                return false;
            }

            if (name.indexOf('/') !== -1) {
                this.$('#title').before(Dash.Template.errorText({
                    errorText: "Article name cannot contain '/'."
                }));
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
        },

        changeLogo: function() {
            this.$('.uploadLogo').first().hide();
            var file = this.$(':file')[0].files[0];
            this.$('.changeLogo .logo').attr('src', URL.createObjectURL(file));
            this.$('.changeLogo').show();
            this.resizeLogo();
        },

        resizeLogo: function() {
            var that = this;
            this.$('.logo').load(function() {
                var this$ = that.$(this);
                if (this.naturalHeight / this.naturalWidth > 0.75) {
                    this$.css('height', 135);
                    this$.css('width', 'auto');
                    this$.css('margin-left', (180 - this$.width()) / 2);
                    this$.css('margin-right', (180 - this$.width()) / 2);
                } else {
                    this$.css('width', 180);
                    this$.css('height', 'auto');
                    this$.css('margin-left', 0);
                    this$.css('margin-right', 0);
                }
            });
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
            this.$('#discussion').prop("checked", this.model.get('discussion'));
            this.$(':file').hide();
            this.resizeLogo();
            this.setupColorPicker();
        },

        save: function() {
            this.$('button.save').prop("disabled", true);
            this.$('.errorText').remove();
            var themeColour = this.$('.primary').val();
            themeColour = themeColour.charAt(0) !== '#' ? '#' + themeColour : themeColour;

            if (Dash.validHex(themeColour)) {
                this.model.set('themeColour', themeColour);
                $('#theme').html(Dash.getThemeStyleText(themeColour));
            } else {
                this.$('.colorContainer').before(Dash.Template.errorText({
                    errorText: "Invalid hex code."
                }));
                this.$('button.save').prop("disabled", false);
                return;
            }
            this.model.set('discussion', this.$('#discussion').is(':checked'));
            var file = this.$(':file')[0].files[0];
            Dash.postModel('product', this.model, function() {
                if (file) {
                    Hoist.file(this.model.get("_id"), file, function(res) {
                        this.model.trigger('change:logoURL');
                    }, function(res) {
                        console.log("file post unsuccessful: " + res);
                    }, this);
                }
                this.trash();
            }, function(res) {
                this.$('button.save').prop("disabled", false);
            }, this);
        },

        uploadLogo: function() {
            this.$(':file').click();
        },

        change: function(e) {
            var file = this.$(':file')[0].files[0];
            this.$('.logo').attr('src', URL.createObjectURL(file));
            this.resizeLogo();
        },

        resizeLogo: function() {
            var that = this;
            this.$('.logo').load(function() {
                var this$ = that.$(this);
                if (this.naturalHeight / this.naturalWidth > 0.75) {
                    this$.css('height', 135);
                    this$.css('width', 'auto');
                    this$.css('margin-left', (180 - this$.width()) / 2);
                    this$.css('margin-right', (180 - this$.width()) / 2);
                } else {
                    this$.css('width', 180);
                    this$.css('height', 'auto');
                    this$.css('margin-left', 0);
                    this$.css('margin-right', 0);
                }
            });
        },

        setupColorPicker: function() {
            var themeColour = this.model.get('themeColour');
            this.$('#ColorInput').wheelColorPicker({
                format: 'hex',
                layout: 'popup',
                sliders: 'v',
                width: '160px'
            });
            this.$('#ColorInput').wheelColorPicker('setValue', themeColour);
            var that = this;
            this.$('#ColorInput').change(function() {
                var $this = that.$(this);
                var val = $this.val();
                $this.css('color', val);
                $this.css('background', val);
                that.$('.primary').val(val);
            });
            this.$('.primary').change(function() {
                var $this = that.$(this);
                var val = $this.val();
                that.$('#ColorInput').val(val);
                that.$('#ColorInput').change();
            });
            this.$('.primary').keyup(function() {
                that.$(this).change();
            });
            this.$('.primary').val(themeColour);
            this.$('.primary').change();
        }
    });

    Dash.View.Modal.NewSection = Dash.View.Modal.extend({
        template: Dash.Template.newSection,

        start: function() {
            if (this.model.get('_type') == 'section') {
                var url = this.model.get('URL').split('/');
                url.pop();
                var tree = this.model.getUrlItems(url);
                this.treePlace = tree[tree.length - 1];
            }
        },

        events: {
            'click button.save': 'save',
            'click button.cancel': 'trash',
            'click .treePlace': 'treePlaceFunction',
            'click .content': 'swallow',
            'click': 'trash',
        },

        render: function() {
            this.$el.html(this.template());
            if (this.model.get('_type') === 'section') {
                this.$('#name').val(this.model.get('name'));
                this.$('#content').val(this.model.get('content'));
            }
            this.$el.find('div.treePlace').hide();
            if (this.treePlace) {
                this.$('h1').text('Edit Section');
                this.$("div.treePlace").find('p').text(this.treePlace.get('name'));
                this.$(".treePlace").toggle();
            }
            return this;
        },

        save: function() {
            this.$('button.save').prop("disabled", true);
            this.$('.errorText').remove();
            var error;
            var attributes = {};
            if (!this.treePlace) {
                this.$('button.treePlace').before(Dash.Template.errorText({
                    errorText: "Section must be placed in the tree."
                }));
                error = true;
            }
            attributes.name = this.$('#name').val();
            if (!this.checkName(attributes.name)) {
                this.$('#name').before(Dash.Template.errorText({
                    errorText: "Section name is invalid."
                }));
                error = true;
            }
            attributes.content = this.$('#content').val();
            if (error) {
                this.$('button.save').prop("disabled", false);
                return;
            }
            var section = this.model;
            var oldTreePlace;
            if (this.model.get('_type') === 'section') {
                var url = this.model.get('URL').split('/');
                oldTreePlace = this.model.getUrlItems(url.splice(-2, 1));
                oldTreePlace = oldTreePlace[oldTreePlace.length - 1];

                if (oldTreePlace !== this.treePlace) {
                    oldTreePlace.removeChild(this.model);
                    Dash.deIndexSection(true, this.model);
                    if (oldTreePlace.get('_type') === 'section') {
                        Dash.indexSection(true, false, oldTreePlace);
                    } else {
                        Dash.indexProduct(false, oldTreePlace);
                    }
                } else if (this.model.get('name') !== attributes.name) {
                    Dash.indexSection(true, true, this.model);
                }
                this.model.set(attributes);
            } else {
                section = new Dash.Section.Section(attributes);
            }
            Dash.postModel("section", section, function(res) {
                if (oldTreePlace !== this.treePlace) {
                    this.treePlace.addChild(section);
                    this.treePlace.trigger('newSection');
                    Dash.postModel(this.treePlace.get('_type'), this.treePlace, function() {
                        if (oldTreePlace) {
                            Dash.postModel(oldTreePlace.get('_type'), oldTreePlace, function() {
                                this.trash();
                            }, this);
                        } else {
                            this.trash();
                        }
                    }, this);
                    Dash.indexSection(true, true, section);
                }
            }, function(res) {
                this.$('button.save').prop("disabled", false);
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

            if (name.indexOf('/') !== -1) {
                this.$('#title').before(Dash.Template.errorText({
                    errorText: "Article name cannot contain '/'."
                }));
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
            // pop up modal
            var product = this.model;
            if (this.model.get('_type') === 'section') {
                product = Dash.products.findProduct(this.model.get('currentProductName'));
            }
            var treePlaceView = new Dash.View.Modal.SectionTreePlace({
                model: product
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
                this.treePlace = product;
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

    Dash.View.Modal.EditKeySections = Dash.View.Modal.extend({
        template: Dash.Template.editKeySections,

        start: function() {
            this.sections = this.model.getKeySections();
        },

        events: {
            'click button.save': 'save',
            'click .delete': 'removeSection',
            'click .content': 'swallow',
            'click button.cancel': 'trash',
            'click button.addSection': 'addSection',
            'click': 'trash'
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.renderKeySections();
            return this;
        },

        renderKeySections: function() {
            this.sections.each(this.renderSection, this);
        },

        renderSection: function(section) {
            var sectionView = new Dash.NewKeySectionView({
                model: section
            });
            this.$('#sectionList').append(sectionView.render().el);
        },

        save: function() {
            this.$('button.save').prop("disabled", true);
            this.model.setKeySections(this.sections);
            Dash.postModel('product', this.model, function() {
                this.trash();
            }, function(res) {
                this.$('button.save').prop("disabled", false);
            }, this);
        },

        addSection: function() {
            var that = this;
            // pop up modal
            var treePlaceView = new Dash.View.Modal.TreePlace({
                model: that.model,
            });
            treePlaceView.callback = this.addSectionCallback;
            treePlaceView.trashCallback = this.trashCallback;
            treePlaceView.callbackContext = this;
        },

        addSectionCallback: function(hash) {
            hash = hash.substring(1);
            if (hash.charAt(0) === '!') {
                hash = hash.substring(1);
            }
            var pathSplit = hash.split("/");
            var section = this.model.findSection(pathSplit.slice(1));
            this.treePlace = section;
            if (this.sections.indexOf(section) < 0) {
                this.sections.add(section);
                this.renderSection(section);
            }
        },

        trashCallback: function(hash, product) {
            this.$el.show();
        },

        removeSection: function(e) {
            var div = e.target.parentElement;
            var list = div.parentElement;
            var children = div.parentElement.children;
            var index;
            for (var i = 0; i < children.length; i++) {
                if (children[i] === div) {
                    index = i;
                }
            }
            this.sections.remove(this.sections.at(index));
            this.$(div).remove();
        }
    });

    Dash.View.Modal.TreePlace = Dash.View.Modal.extend({
        el: "#TreePlace",
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

        end: function() {
            if (this.trashCallback) {
                this.trashCallback.call(this.callbackContext);
            }
        }
    });

    Dash.View.Modal.SectionTreePlace = Dash.View.Modal.TreePlace.extend({

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

    Dash.View.Modal.Video = Dash.View.Modal.extend({
        template: Dash.Template.addVideo,

        events: {
            'click button.save': 'save',
            'click button.cancel': 'trash',
            'click .content': 'swallow',
            'click': 'trash',
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        save: function() {
            this.$('button.save').prop("disabled", true);
            var url = this.$('.videoUrl').val();
            this.callback.call(this.callbackContext, url);
            this.trash();
        }
    });

    Dash.View.Modal.SelectArticle = Dash.View.Modal.TreePlace.extend({
        template: Dash.Template.articleLink,

        renderTree: function() {
            Dash.articles.each(function(article) {
                if (article.get('published')) {
                    this.$('.map > ul').append(new Dash.ListItem({
                        model: article
                    }).render().el);
                }
            }, this);
            return this;
        },

        save: function() {
            this.$('button.save').prop("disabled", true);
            var url = this.$('.videoUrl').val();
            var selected = this.$(".map .themeText");
            if (selected[0]) {
                var hash = selected[0].hash;
                if (this.callback) {
                    this.callback.call(this.callbackContext, hash);
                }
                this.trash();
            }
            this.$('button.save').prop("disabled", false);
        }
    });

    // dummy views used for generating html snapshots for the search index

    Dash.View.Dummy = {
        dummyInitialize: function() {
            if (this.start) {
                this.start();
            }

            this.render();

            if (this.afterRender) {
                this.afterRender();
            }

            if (this.dummyRender) {
                this.dummyRender();
            }

            this.$('.discussion').show();
        },
    };

    Dash.View.Dummy.Article = Dash.View.Article.extend({
        el: undefined,

        initialize: Dash.View.Dummy.dummyInitialize
    });

    Dash.View.Dummy.HelpDesk = Dash.View.HelpDesk.extend({
        el: undefined,

        initialize: Dash.View.Dummy.dummyInitialize
    });

    Dash.View.Dummy.Section = Dash.View.Section.extend({
        el: undefined,

        initialize: Dash.View.Dummy.dummyInitialize
    });

    Dash.View.Dummy.SiteMap = Dash.View.SiteMap.extend({
        el: undefined,

        initialize: Dash.View.Dummy.dummyInitialize
    });

    Dash.View.Dummy.Home = Dash.View.Home.extend({
        el: undefined,

        initialize: Dash.View.Dummy.dummyInitialize
    });

});