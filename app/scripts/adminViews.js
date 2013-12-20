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
    
    Dash.View.Admin.Home = Dash.View.Admin.extend({
        el: "#Home",

        start: function() {
            this.model = Dash.products;
        },
        
        render: function(){
            this.$el.find("#products").empty();
            this.$el.find("#keySections").empty();
            var that = this;
            this.model.each(function(item) {
                that.renderProduct(item);
            }, this);
            this.$el.prepend();
        },
        
        renderProduct: function(item){
            var homeProductView = new Dash.HomeProductView({
                model: item
            });
            this.$("#products").append(homeProductView.render().el);
        }
    });
    
    Dash.View.Admin.HelpDesk = Dash.View.HelpDesk.extend({
        
    });
    
    Dash.View.Admin.Article = Dash.View.Article.extend({
        
    });
    
    Dash.View.Admin.Section = Dash.View.Section.extend({
        
    });
    
    Dash.View.Admin.NewArticle = Dash.View.Admin.extend({
        
    });
    
});