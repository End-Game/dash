/*global define */
define(['backbone', 'dash', 'Hoist', 'models', 'views', 'adminViews', 'router'], function(backbone, dash, Hoist) {
    'use strict';
    var App = function() {
        this.dash = dash;

        this.initialize = function() {
            $.ajax({
                url: '/settings' + (window.location.hostname === 'localhost' ? '.json' : ''),
                context: this,
                success: function(res) {
                    this.dash.settings = res
                    Hoist.apiKey(res.apiKey);
                    Hoist.get({
                        tags: "tag",
                        articles: "article",
                        sections: "section",
                        products: "product",
                        comments: "comment",
                    }, function(data) {
                        this.dash.tags = new this.dash.Tags(data.tags);
                        this.dash.articles = new this.dash.Sections(data.articles, {
                            parse: true
                        });
                        this.dash.sections = new this.dash.Sections(data.sections, {
                            parse: true
                        });
                        this.dash.products = new this.dash.Products(data.products, {
                            parse: true
                        });
                        this.dash.comments = new this.dash.Comments(data.comments);
                        this.dash.sections.each(function(section) {
                            section.get('childJoins').each(function(childJoin) {
                                childJoin.listenTo(childJoin.get('child'), 'newSection', childJoin.changeSection);
                            });
                            section.get('productJoins').each(function(productJoin) {
                                productJoin.listenTo(productJoin.get('section'), 'newSection', productJoin.changeSection);
                            });
                        });
                        Hoist.status(function(res) {
                            this.dash.user = res;
                            this.dash.user.name = res.name ? res.name : res.metaData ? res.metaData.name ? res.metaData.name : '' : '';
                            this.dash.admin = true;
                            this.dash.router = new this.dash.Router();
                            Backbone.history.start();
                        }, function() {
                            this.dash.admin = false;
                            this.dash.router = new this.dash.Router();
                            Backbone.history.start();
                        }, this);
                    }, function(res) {
                        console.log('get unsuccessful: ' + res);
                    }, this);
                },
            });
        };
    };

    String.prototype.equalsIgnoreUrl = function(other) {
        if (typeof other !== 'string') {
            return false;
        }
        var urlRegex = /[^0-9a-zA-Z_./~-]/g;
        return this.toLocaleLowerCase().replace(urlRegex, "") === other.toLocaleLowerCase().replace(urlRegex, "");
    };

    return new App();
});