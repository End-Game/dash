/*global define */
define(['backbone', 'dash', 'models', 'views', 'adminViews', 'router'], function(backbone, dash) {
    'use strict';
    var App = function() {
        this.dash = dash;
    };

    String.prototype.equalsIgnoreCaseSpace = function(other){
        return this.toLocaleLowerCase().replace(/\s/g, "") === other.toLocaleLowerCase().replace(/\s/g, "");
    };
    
    return new App();
});