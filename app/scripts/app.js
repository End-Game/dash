/*global define */
define(['backbone', 'dash', 'models', 'views', 'adminViews', 'router'], function(backbone, dash) {
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
    
    return new App();
});