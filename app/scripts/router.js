define(['dash', 'backbone', 'Hoist', 'models', 'views'], function(Dash, Backbone, Hoist) {
    'use strict';
    var defaultColour = '#3080C8';
    var adminMenu;
    var searchbox;
    Dash.menuProduct = new Dash.MenuProduct();
    Dash.Router = Backbone.Router.extend({
        routes: {
            "*path": "find"
        },
        
        find: function(path) {
            $('#theme').html(Dash.getThemeStyleText(defaultColour));
            $('#logo').attr('src', 'images/logo.png');
            var loadHome = false;
            var pathSplit;
            var product;
                if(!searchbox){
                    searchbox = new Dash.Searchbox();
                    $('#logoDiv').append(searchbox.render().el);
                }
            if (Dash.admin) {
                $('#logoDiv .searchbox').hide();
                if(Dash.user){
                    Dash.menuProduct.set('user', Dash.user.name);
                }
                if (!adminMenu) {
                    adminMenu = new Dash.AdminMenu({
                        model: Dash.menuProduct
                    });
                }
                $('header').show();
            } else {
                $('#logoDiv .searchbox').show();
                $('header').hide();
            }
            if (path) {
                if (path.charAt(0) === "/" || path.charAt(0) === "#") {
                    path = path.substring(1, path.length);
                }
                if (path.charAt(path.length - 1) === "/") {
                    path = path.substring(0, path.length - 1);
                }
                if (path.charAt(0) === "!") {
                    path = path.substring(1, path.length);
                }
                pathSplit = path.split("/");
            }
            if (!path) {
                loadHome = true;
            } else if ('admin login'.equalsIgnoreUrl(path)) {
                new Dash.View.Admin.Login();
                $('#logoDiv .searchbox').hide();
            } else if ("newArticle".equalsIgnoreUrl(path)) {
                if (Dash.admin) {
                    new Dash.View.Admin.NewArticle();
                } else {
                    loadHome = true;
                }
            } else if ("search".equalsIgnoreUrl(path)) {
                new Dash.View.Search();
                $('#logoDiv .searchbox').hide();
            } else {
                product = Dash.products.findProduct(pathSplit[0]);
                if (product) {
                    Dash.menuProduct.set('product', product);
                    $('#theme').html(Dash.getThemeStyleText(product.get('themeColour')));
                    product.on('change:logoURL', function() {
                        $('#logo').attr('src', product.get('logoURL'));
                    });
                    $('#logo').attr('src', product.get('logoURL'));
                    pathSplit.shift();
                    if (Dash.admin) {
                        loadHome = this.adminFindFromProduct(path, pathSplit, product);
                    } else {
                        loadHome = this.findFromProduct(path, pathSplit, product);
                    }
                } else {
                    loadHome = true;
                }
            }
            if (loadHome) {
                var view;
                if (Dash.products.length === 1) {
                    product = Dash.products.at(0);
                    $('#theme').html(Dash.getThemeStyleText(product.get('themeColour')));
                    product.on('change:logoURL', function() {
                        $('#logo').attr('src', product.get('logoURL'));
                    });
                    $('#logo').attr('src', product.get('logoURL'));
                    view = Dash.admin ? new Dash.View.Admin.Home() : new Dash.View.HelpDesk({
                        model: product
                    });
                } else {
                    view = Dash.admin ? new Dash.View.Admin.Home() : new Dash.View.Home();
                }
            }
        },

        findFromProduct: function(path, pathSplit, product) {
            var loadHome = false;
            if (pathSplit.length === 0) {
                new Dash.View.HelpDesk({
                    model: product
                });
                $('#logoDiv .searchbox').hide();
            } else if ("sitemap".equalsIgnoreUrl(pathSplit[0])) {
                new Dash.View.SiteMap({
                    model: product
                });
            } else if ("tag".equalsIgnoreUrl(pathSplit[0])) {
                var tag = Dash.tags.findTag(pathSplit[1]);
                tag.set('currentProductName', product.get('name'));
                if (tag) {
                    new Dash.View.Tag({
                        model: tag
                    });
                } else {
                    loadHome = true;
                }
            } else {
                var section = product.findSection(pathSplit);
                if (section) {
                    section.set("currentProductName", product.get("name"));
                    section.set('URL', path);
                    section.set('discussion', product.get('discussion'));
                    if (section.get("_type") === "article") {
                        if (section.get('published')) {
                            new Dash.View.Article({
                                model: section
                            });
                        } else {
                            loadHome = true;
                        }
                    } else if (section.get("_type") === "section") {
                        new Dash.View.Section({
                            model: section
                        });
                    }
                } else {
                    loadHome = true;
                }
            }
            return loadHome;
        },

        adminFindFromProduct: function(path, pathSplit, product) {
            var loadHome = false;
            if (pathSplit.length === 0 || "sitemap".equalsIgnoreUrl(pathSplit[0])) {
                new Dash.View.Admin.SiteMap({
                    model: product
                });
            } else if ("tag".equalsIgnoreUrl(pathSplit[0])) {
                var tag = Dash.tags.findTag(pathSplit[1]);
                if (tag) {
                    tag.set('currentProductName', product.get('name'));
                    new Dash.View.Admin.Tag({
                        model: tag
                    });
                } else {
                    loadHome = true;
                }
            } else {
                var section = product.findSection(pathSplit);
                if (section) {
                    section.set("currentProductName", product.get("name"));
                    section.set('URL', path);
                    section.set('discussion', product.get('discussion'));
                    if (section.get("_type") === "article") {
                        new Dash.View.Admin.Article({
                            model: section
                        });
                    } else if (section.get("_type") === "section") {
                        new Dash.View.Admin.Section({
                            model: section
                        });
                    }
                } else {
                    loadHome = true;
                }
            }
            return loadHome;
        }

    });



    return Dash;
});