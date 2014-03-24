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
        "jquery.cookie": "../bower_components/jquery.cookie/jquery.cookie",
        showdown: '../bower_components/showdown/src/showdown',
        rangyInputs: './other/rangyinputs/rangyinputs-jquery-1.1.2',
        video: './other/showdown-extensions/video'
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
        },
        rangyInputs: {
            deps: ['jquery'],
            exports: '$'
        },
        video: {
            deps: ['showdown'],
            exports: 'Showdown'
        }
    }
});
require(['app', 'jquery', 'hoist', 'backbone', 'rangyInputs'], function(app, $, hoist, Backbone) {
    'use strict';
    $('section').hide();
    $('header').hide();
    Hoist.apiKey('TVGDGQGQSETLPLSSKRL[');
    // put somewhere to show that user is admin, maybe after login
    // maybe make a link to a login page
    app.dash.admin = false;
    Hoist.get({
        tags: "tag",
        articles: "article",
        sections: "section",
        products: "product",
        comments: "comment",
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
        app.dash.comments = new app.dash.Comments(data.comments);
        console.log(app.dash.tags);
        console.log(app.dash.articles);
        console.log(app.dash.sections);
        console.log(app.dash.products);
        console.log(app.dash.comments);
        app.dash.products.each(function(product) {
            // var i;
            // var sectionJoins = product.get('sectionJoins');
            // for (i = sectionJoins.length - 1; i >= 0; i--) {
            //     var sectionJoin = sectionJoins.at(i);
            //     if (!sectionJoin.get('section')) {
            //         sectionJoins.remove(sectionJoin);
            //     }
            // }
            // sectionJoins = product.get('keySectionJoins');
            // for (i = sectionJoins.length - 1; i >= 0; i--) {
            //     sectionJoin = sectionJoins.at(i);
            //     if (!sectionJoin.get('keySection')) {
            //         sectionJoins.remove(sectionJoin);
            //     }
            // }
            // app.dash.postModel('product', product);
        });
        app.dash.sections.each(function(section) {
            if (section.get('parentJoins').length === 0 && section.get('productJoins').length === 0) {
                // Hoist.remove("section", section.get('_id'));
                // app.dash.sections.remove(section);
                // console.log(app.dash.sections);
            } else {
                section.get('childJoins').each(function(childJoin) {
                    childJoin.listenTo(childJoin.get('child'), 'newSection', childJoin.changeSection);
                });
                section.get('productJoins').each(function(productJoin) {
                    productJoin.listenTo(productJoin.get('section'), 'newSection', productJoin.changeSection);
                });
            }

        });
        app.dash.articles.each(function(article) {
            // if (article.get('parentJoins').length === 0 && article.get('productJoins').length === 0) {
            //     Hoist.remove("article", article.get('_id'));
            //     app.dash.articles.remove(article);
            //     console.log(app.dash.articles);
            // } else {
            //     // //to make half the articles unpublished
            //     // article.set('published', (Math.random() > 0.5) ? true : false);
            //     //Hoist.post('article', article);
            // }
        });
        app.dash.tags.each(function(tag) {
            // if (tag.getArticles().length === 0) {
            //     Hoist.remove("tag", tag.get('_id'));
            //     app.dash.tags.remove(tag);
            //     console.log(app.dash.tags);
            // }
        });

        // for giving products random colours for testing
        // function getRandomColour() {
        //     var letters = '0123456789ABCDEF'.split('');
        //     var color = '#';
        //     for (var i = 0; i < 6; i++) {
        //         color += letters[Math.floor(Math.random() * 16)];
        //     }
        //     return color;
        // }

        // app.dash.products.each(function(product) {
        //     // if (product.get('themeColour')==='#77BB22') {
        //     //     product.set('themeColour', getRandomColour());
        //     //     app.dash.postModel('product', product);
        //     // }
        // });

        app.dash.router = new app.dash.Router();
        Backbone.history.start();
    }, function(res) {
        console.log('get unsuccessful: ' + res);
    });
    //new app.dash.View.Home();
});