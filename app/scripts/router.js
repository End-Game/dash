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
                if (path.charAt(0) === "/") {
                    path = path.substring(1, path.length);
                }
                if (path.charAt(path.length - 1) === "/") {
                    path = path.substring(0, path.length - 1);
                }
                var pathSplit = path.split("/");
                Dash.products.findProduct(pathSplit[0], function(product) {
                    if (pathSplit.length === 1 && product !== undefined) {
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
                    } else {
                        pathSplit.shift();
                        if(pathSplit[0]==="sitemap"){
                            new Dash.View.SiteMap({model: product});
                        }else{
                        product.findSection(pathSplit, function(section) {
                            if (section !== undefined) {
                                section.set("currentProductName", product.get("name"));
                                if (section.get("type") === "article") {
                                    loadHome = false;
                                    if (Dash.admin) {
                                        new Dash.View.Admin.Article({
                                            model: section
                                        });
                                    } else {
                                        new Dash.View.Article({
                                            model: section
                                        });
                                    }
                                } else if (section.get("type") === "section") {
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
                        });}
                    }
                });
            }
            if (loadHome) {
                var view = Dash.admin ? new Dash.View.Admin.Home() : new Dash.View.Home();
            }
        }

    });


    return Dash;
});