define(['dash', 'backbone', 'hoist'], function(Dash, Backbone, hoist) {
    'use strict';

/*
    Views needed:
    Product
    Article
    Home
    ProductHelpDesk
    SearchResults
        ResultsList
    SiteMap + Admin
        Map
        List
    NewArticle
    SetupProduct
    PlaceTree  -> Admin when making article
*/


    Dash.HomeProductView = Backbone.View.extend({
        tagName: "div",
        className: "homeProduct",
        template: _.template($("#homeProductTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
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

        initialize: function(){
            Dash.View.prototype.initialize.apply(this);
            this.collection = ""; // products
            this.render();
        },

        render: function(){
            this.$el.find("homeProduct").remove(); // remove stuff from previous render
            // render top row of product and short desc
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
            // render bottom row of key sections
            _.each(this.collection.models, function(item) {
                that.renderKeySections(item);
            }, this);
        },

        renderProduct: function(item) {
            var homeProductView = new Dash.HomeProductView({
                model: item
            });
            this.$("hr").prepend(homeProductView.render().el);
        },

        renderKeySections: function(item) {
            var keySections = new Dash.KeySections({
                model: item
            });
            this.$el.append(keySections.render().el);
        }
    });

    Dash.View.HelpDesk = Dash.View.extend({
        el: "#HelpDesk",

        initialize: function() {
            t
        }
    });


});