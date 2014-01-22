define(['dash', 'backbone', 'hoist', 'models', 'views'], function(Dash, Backbone, hoist) {
    'use strict';

    Dash.Router = Backbone.Router.extend({
        routes: {
            "*path": "find"
        },

        find: function(path) {
            //console.log(window.location);
            var loadHome = true;
            if (path) {
                if (path.charAt(0) === "/" || path.charAt(0) === "#") {
                    path = path.substring(1, path.length);
                }
                if (path.charAt(path.length - 1) === "/") {
                    path = path.substring(0, path.length - 1);
                }
                var pathSplit = path.split("/");
                if ("newArticle".equalsIgnoreCaseSpace(pathSplit[0]) && Dash.admin) {
                    loadHome = false;
                    new Dash.View.Admin.NewArticle();
                } else {
                    var product = Dash.products.findProduct(pathSplit[0]);
                    if (pathSplit.length === 1 && product) {
                        loadHome = false;
                        if (Dash.admin) {
                            new Dash.View.Admin.HelpDesk({
                                model: product
                            });
                        } else {
                            new Dash.View.HelpDesk({
                                model: product
                            });
                        }
                    } else if (product) {
                        pathSplit.shift();
                        if ("sitemap".equalsIgnoreCaseSpace(pathSplit[0])) {
                            if (Dash.admin) {
                                new Dash.View.Admin.SiteMap({
                                    model: product
                                });
                            } else {
                                new Dash.View.SiteMap({
                                    model: product
                                });
                            }
                            loadHome = false;
                        } else {
                            var section = product.findSection(pathSplit);
                            if (section) {
                                section.set("currentProductName", product.get("name"));
                                if (section.get("_type") === "article") {
                                    loadHome = false;
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
                                    loadHome = false;
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

                            }

                        }
                    }
                }
            }
            if (loadHome) {
                var view = Dash.admin ? new Dash.View.Admin.Home() : new Dash.View.Home();
            }
        }

    });


    return Dash;
});