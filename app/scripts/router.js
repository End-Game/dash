define(['dash', 'backbone', 'hoist'], function(Dash, Backbone, hoist) {
    'use strict';
    
    Dash.Router = Backbone.Router.extend({
        routes: {
            "products/*path": "find"
        },
        
        find: function(path){
            
        }
    });
    
    return Dash;
});