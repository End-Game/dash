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
        renderProduct: function() {
            
        }
    });
    
    Dash.View.Admin.Article = Dash.View.Article.extend({
        
    });
});