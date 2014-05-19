/*global define */
define(['backbone', 'dash', 'Hoist', 'models', 'views', 'adminViews', 'router'], function(backbone, dash, Hoist) {
    'use strict';
    var App = function() {
        this.dash = dash;
    };
    
    String.prototype.equalsIgnoreUrl = function(other){
        if(typeof other !== 'string'){
            return false;
        }
        var urlRegex = /[^0-9a-zA-Z_./~-]/g;
        return this.toLocaleLowerCase().replace(urlRegex, "") === other.toLocaleLowerCase().replace(urlRegex , "");
    };
    
    var app = new App();
    
    Hoist.apiKey('TVGDGQGQSETLPLSSKRL[');
    app.dash.admin = true;
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
        app.dash.sections.each(function(section) {
            if (section.get('parentJoins').length === 0 && section.get('productJoins').length === 0) {} else {
                section.get('childJoins').each(function(childJoin) {
                    childJoin.listenTo(childJoin.get('child'), 'newSection', childJoin.changeSection);
                });
                section.get('productJoins').each(function(productJoin) {
                    productJoin.listenTo(productJoin.get('section'), 'newSection', productJoin.changeSection);
                });
            }
        });
        Hoist.status(function(res){
            app.dash.user = res;
            app.dash.user.name = res.name ? res.name : res.metaData? res.metaData.name? res.metaData.name:'':'';
            console.log(app.dash.user.name);
            app.dash.admin = true;
            app.dash.router = new app.dash.Router();
            Backbone.history.start();
        }, function(){
            app.dash.router = new app.dash.Router();
            Backbone.history.start();
        });
    }, function(res) {
        console.log('get unsuccessful: ' + res);
    });
    return app;
});