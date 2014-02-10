define(['dash', 'backbone', 'hoist', 'models', 'views'], function(Dash, Backbone, hoist) {
    'use strict';
    var defaultColour = '#3080C8';
    Dash.Router = Backbone.Router.extend({
        routes: {
            "*path": "find"
        },

        find: function(path) {
            // console.log(window.location);
            // console.log(path);
            var loadHome = false;
            var pathSplit;
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
            } else if (path.equalsIgnoreUrl('admin login')) {
                new Dash.View.Admin.Login();
            } else if (path.equalsIgnoreUrl('admin signup')) {
                new Dash.View.Admin.SignUp();
            } else if ("newArticle".equalsIgnoreUrl(path) && Dash.admin) {
                new Dash.View.Admin.NewArticle();
            } else if ("search".equalsIgnoreUrl(path) && Dash.admin) {
                new Dash.View.Search();
            } else {
                var product = Dash.products.findProduct(pathSplit[0]);
                if (product) {
                    $('#theme').html(Dash.getThemeStyleText(product.get('themeColour')));
                    product.on('change:logoURL', function() {
                        $('#logo').attr('src', product.get('logoURL'));
                    });
                    $('#logo').attr('src', product.get('logoURL'));
                    if (pathSplit.length === 1 && product) {
                        if (Dash.admin) {
                            new Dash.View.Admin.SiteMap({
                                model: product
                            });
                        } else {
                            new Dash.View.HelpDesk({
                                model: product
                            });
                        }
                    } else {
                        pathSplit.shift();
                        if ("sitemap".equalsIgnoreUrl(pathSplit[0])) {
                            if (Dash.admin) {
                                new Dash.View.Admin.SiteMap({
                                    model: product
                                });
                            } else {
                                new Dash.View.SiteMap({
                                    model: product
                                });
                            }
                        } else {
                            var section = product.findSection(pathSplit);
                            if (section) {
                                section.set("currentProductName", product.get("name"));
                                section.set('URL', path);
                                if (section.get("_type") === "article") {
                                    if (Dash.admin) {
                                        new Dash.View.Admin.Article({
                                            model: section
                                        });
                                    } else if (section.get('published')) {
                                        new Dash.View.Article({
                                            model: section
                                        });
                                    } else {
                                        loadHome = true;
                                    }
                                } else if (section.get("_type") === "section") {
                                    if (Dash.admin) {
                                        new Dash.View.Admin.Section({
                                            model: section
                                        });
                                    } else {
                                        new Dash.View.Section({
                                            model: section
                                        });
                                    }
                                }
                            } else {
                                loadHome = true;
                            }
                        }
                    }
                }
            }
            if (loadHome) {
                $('#theme').html(Dash.getThemeStyleText(defaultColour));
                $('#logo').attr('src', 'images/logo.jpg');
                var view = Dash.admin ? new Dash.View.Admin.Home() : new Dash.View.Home();
            }
        }

    });

    return Dash;
});