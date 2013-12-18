require.config({
    baseUrl: '/scripts',
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        relational: '../bower_components/backbone-relational/backbone-relational',
        underscore: '../bower_components/underscore/underscore',
        hoist: './hoist/hoist',
        requirejs: '../bower_components/requirejs/require',
        "jquery.cookie": "../bower_components/jquery.cookie/jquery.cookie"
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        relational: {
            deps: ['backbone']
        }
    }
});
require(['app', 'jquery', 'hoist', 'backbone'], function(app, $, hoist, Backbone) {
    'use strict';
    Hoist.apiKey('TVGDGQGQSETLPLSSKRL[');
    Hoist.get("article", function(res) {
            app.dash.articles = new app.dash.Sections(res);
            console.log(app.dash.articles);
            Hoist.get("section", function(res) {
                app.dash.sections = new app.dash.Sections(res, {
                    parse: true
                });
                console.log(app.dash.sections);
                Hoist.get("product", function(res) {
                    app.dash.products = new app.dash.Products(res, {
                        parse: true
                    });
                    console.log(app.dash.products);
                    // app.dash.products.each(function(product) {
                    //     app.dash.articles.each(function(article) {
                    //         article.setUrl(product.get('name'));
                    //         console.log(article.get("URL"));
                    //     });
                    // });
                    app.dash.router = new app.dash.Router();

                    Backbone.history.start();
                }, function(res) {
                    console.log('product get unsuccessful: ' + res);
                }, this);
            }, function(res) {
                console.log('section get unsuccessful: ' + res);
            }, this);
        },
        function(res) {
            console.log('article get unsuccessful: ' + res);
        }, this);


    //new app.dash.View.Home();
});