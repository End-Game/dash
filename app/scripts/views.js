define(['dash', 'backbone', 'hoist'], function(Dash, Backbone, hoist) {
    'use strict';

    /*
    Views needed:
    Product
    Article
    Home + Admin
    ProductHelpDesk
    SearchResults
        ResultsList
    SiteMap + Admin
        Map
        List
    NewArticle->Admin
    SetupProduct modal ->Admin
    PlaceTree modal -> Admin when making article
*/



    Dash.HomeProductView = Backbone.View.extend({
        tagName: "div",
        className: "homeProduct",
        template: _.template($("#homeProductTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click .product": "helpDesk"
        },

        helpDesk: function() {
            new Dash.View.HelpDesk({
                model: this.model
            });
        }
    });

    Dash.KeySectionsView = Backbone.View.extend({
        tagName: "div",
        className: "keySections",
        template: _.template($("#keySectionsTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });


    Dash.View = Backbone.View.extend({
        initialize: function() {
            $('section').hide();
            this.$el.show();
        },
    });

    Dash.View.Home = Dash.View.extend({
        el: "#Home",

        initialize: function() {
            Dash.View.prototype.initialize.apply(this);
            this.collection = Dash.products;
            this.render();
        },

        render: function() {
            this.$el.find(".homeProduct").remove(); // remove stuff from previous render
            this.$el.find(".keySections").remove();
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
            return this;
        },

        renderProduct: function(item) {
            var homeProductView = new Dash.HomeProductView({
                model: item
            });
            this.$("hr").before(homeProductView.render().el);
            this.renderKeySections(item); // render bottom row of key sections
        },

        renderKeySections: function(item) {
            var keySections = new Dash.KeySectionsView({
                model: item
            });
            this.$el.append(keySections.render().el);
            var that = this;
            var keySectionsList = item.getKeySections();
            keySectionsList.each(function(section) {
                that.renderListItem(section, "#keySections" + item.get('id'));
            }, this);
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        }
    });

    Dash.View.HelpDesk = Dash.View.extend({
        el: "#HelpDesk",

        initialize: function() {
            Dash.View.prototype.initialize.apply(this);
            this.render();
            // this.renderSidebar();
        },

        render: function() {
            this.$el.find(".helpDeskProduct").remove();
            var helpDeskProduct = new Dash.HelpDeskProduct({
                model: this.model
            });
            this.$el.append(helpDeskProduct.render().el);
            this.renderFaqs();
            this.renderHowDoIs();
            return this;
        },

        renderFaqs: function() {
            var that = this;
            var faqs = this.model.getFaqs();
            faqs.each(function(item) {
                that.renderListItem(item, "#faqList");
            }, this);
        },

        renderHowDoIs: function() {
            var that = this;
            var howDoIs = this.model.getHowDoIs();
            howDoIs.each(function(item) {
                that.renderListItem(item, "#howDoIList");
            }, this);
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        }
    });

    Dash.HelpDeskProduct = Backbone.View.extend({

        tagName: "div",
        className: "helpDeskProduct",
        template: _.template($("#helpDeskTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }

    });

    Dash.View.ArticleView = Dash.View.extend({
        el: "#Article",
        template: _.template($("#articleTemplate").html()),

        initialize: function() {
            Dash.View.prototype.initialize.apply(this);
            this.$el.empty();
            this.render();
            // this.renderSidebar();
        },

        render: function() {
            this.$el.append(this.template(this.model.toJSON()));
            return this;
        }
    });

    Dash.ListItem = Backbone.View.extend({

        tagName: "li",
        template: _.template($("#listItemTemplate").html()),

        events: {
            "click .item": "item"
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        item: function() {
            if (this.model.get("type") === "section") {
                //do something for section
            } else {
                new Dash.View.ArticleView({
                    model: this.model
                });
            }
        }
    });

    return Dash;
});