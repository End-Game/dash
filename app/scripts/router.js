define(['dash', 'backbone', 'hoist', 'models', 'views'], function(Dash, Backbone, hoist) {
    'use strict';

    Dash.Router = Backbone.Router.extend({
        routes: {
            "*path": "find"
        },

        find: function(path) {
            var loadHome = true;
            if (path) {
                if (path.charAt(0) === "/") {
                    path = path.substring(1, path.length);
                }
                if (path.charAt(path.length - 1) === "/") {
                    path = path.substring(0, path.length - 1);
                }
                var pathSplit = path.split("/");
                if (pathSplit.length === 1) {
                    Dash.products.findProduct(pathSplit[0], function(product) {
                        var view = new Dash.View.HelpDesk({
                            model: product
                        });
                        loadHome = false;
                    });
                }
            }
            if(loadHome){
                new Dash.View.Home();
            }
        }

    });

    Dash.router = new Dash.Router();

    Backbone.history.start();

    return Dash;
});