require.config({
    baseUrl: '/scripts',
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        relational: '../bower_components/backbone-relational/backbone-relational',
        underscore: '../bower_components/underscore/underscore',
        hoist: './hoist/hoist',
        templates: './templates/templates',
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
    $('section').hide();
    Hoist.apiKey('TVGDGQGQSETLPLSSKRL[');
    // put somewhere to show that user is admin, maybe after login
    // maybe makae a link to a login page
    app.dash.admin = true;
    Hoist.get({
        tags: "tag",
        articles: "article",
        sections: "section",
        products: "product",
    }, function(data) {
        app.dash.tags = new app.dash.Tags(data.tags);
        app.dash.articles = new app.dash.Sections(data.articles, {
            parse: true
        });
        app.dash.sections = new app.dash.Sections(data.sections, {
            parse: true
        });

        app.dash.products = new app.dash.Products(data.products, {
            parse: true
        });
        console.log(app.dash.tags);
        console.log(app.dash.articles);
        console.log(app.dash.sections);
        console.log(app.dash.products);
        app.dash.router = new app.dash.Router();
        Backbone.history.start();
        app.dash.sections.each(function(section){
            if(section.get('parentJoins').length === 0 && section.get('productJoins').length === 0) {
                Hoist.remove("section", section.get('_id'));
                app.dash.sections.remove(section);
                console.log(app.dash.sections);
            }
        });
        app.dash.articles.each(function(article){
            if(article.get('parentJoins').length === 0 && article.get('productJoins').length === 0) {
                Hoist.remove("article", article.get('_id'));
                app.dash.articles.remove(article);
                console.log(app.dash.articles);
            }
        });
        app.dash.tags.each(function(tag){
            if(tag.getArticles().length === 0) {
                Hoist.remove("tag", tag.get('_id'));
                app.dash.tags.remove(tag);
                console.log(app.dash.tags);
            }
        });
    }, function(res) {
        console.log('get unsuccessful: ' + res);
    });
    //new app.dash.View.Home();
});