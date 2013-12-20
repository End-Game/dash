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
     // put somewhere to show that user is admin, maybe after signup
    app.dash.admin = true;

    Hoist.get("article", function(res) {
            app.dash.articles = new app.dash.Sections(res, {
                parse: true
            });
            console.log(app.dash.articles);
            app.dash.articles.each(function(article){
                article.get('faqJoins').each(function(faqJoin){
                    faqJoin.set('faq', app.dash.articles.get(faqJoin.get('faq')));
                });
            });
            app.dash.articles.each(function(article){
                article.get('howDoIJoins').each(function(howDoIJoin){
                    howDoIJoin.set('howDoI', app.dash.articles.get(howDoIJoin.get('howDoI')));
                });
            });
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