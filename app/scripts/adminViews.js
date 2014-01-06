define(['dash', 'backbone', 'hoist', 'views'], function(Dash, Backbone, hoist) {
    'use strict';
    /*
    views needed:
    home
    product help desk
    article
    sitemap
    new article
    setup product - modal
    place tree - modal - when making an article
*/
    Dash.View.Admin = Dash.View.extend({

    });

    Dash.View.Admin.Home = Dash.View.Home.extend({
        template: _.template($("#adminHomeTemplate").html()),

        events: {
            "click button": "addProduct",
        },

        renderProduct: function(item) {
            var homeProductView = new Dash.HomeProductView({
                model: item
            });
            this.$("#products").append(homeProductView.render().el);
        },

        addProduct: function() {
            new Dash.View.Modal.ProductSetup();
        }
    });

    Dash.View.Admin.HelpDesk = Dash.View.HelpDesk.extend({

        renderSidebar: function() {
            this.$('.adminSideBar').empty();
            var sideBar = new Dash.AdminSideBar.Product({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        }
    });

    Dash.View.Admin.Article = Dash.View.Article.extend({

    });

    Dash.View.Admin.Section = Dash.View.Section.extend({

    });

    Dash.View.Admin.NewArticle = Dash.View.Admin.extend({
        el: "#Article",
        template: _.template($("#newArticleTemplate").html()),
        
        render: function(){
            this.$el.html(this.template());
            this.renderSidebar();
            return this;
        },
        
        renderSidebar: function(){
            this.$('.sideBar').empty();
            var sideBar = new Dash.SideBar.NewArticle();
            this.$el.append(sideBar.render().el);
        }
    });
    
    Dash.SideBar.NewArticle = Dash.SideBar.extend({
        template: _.template($("#newArticleSideBarTemplate").html()),
        id: "newArticleSideBar",
        render: function() {
            this.$el.html(this.template());
            return this;
        },
    });

    Dash.AdminSideBar = Dash.SideBar.extend({
        className: "adminSideBar"
    });

    Dash.AdminSideBar.Product = Dash.AdminSideBar.extend({
        template: _.template($("#adminProductSideBarTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            'click button#newSection': 'newSection',
            'click button#newArticle': 'newArticle',
            'click button#productSettings': 'settings',
            'click button#personalise': 'personalise',
        },

        newSection: function() {},

        newArticle: function() {
            Dash.router.navigate("newArticle");
            var that = this;
            new Dash.View.Admin.NewArticle();
        },

        settings: function() {},

        personalise: function() {},

    });

    Dash.View.Modal = Backbone.View.extend({
        el: "#Modal",

        initialize: function() {
            if (this.start) {
                this.start();
            }
            this.render();
            this.$el.show();
        },

        swallow: function(e) {
            e.stopPropagation();
        },

        trash: function() {
            this.stopListening();
            this.undelegateEvents();
            this.off();

            this.$el.off();
            this.$el.removeData('view').hide();

            if (this.end) {
                this.end();
            }
        }
    });

    Dash.View.Modal.ProductSetup = Backbone.View.extend({
        template: _.template($("#productSetupTemplate").html()),

        events: {
            'click button': 'save',
            'click .content': 'swallow',
            'click': 'trash'
        },

        render: function() {
            this.$el.html(this.template());
        },

        save: function() {
            var product = new Dash.Product({
                name: this.$('#name').val(),
                description: this.$('#description').val(),
                shortDescription: this.$('#description').val(),
            });
            Hoist.post("product", product.toJSON(), function(res) {
                product.set("_id", res[0]._id);
                Dash.products.add(product);
                new Dash.View.Admin.Home();
            }, function(res) {
                console.log('product post unsuccessful: ' + res);
            }, this);
        },

    });
});