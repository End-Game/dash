/*global define */
define(['backbone', 'dash', 'models', 'views', 'adminViews', 'router'], function(backbone, dash) {
    'use strict';
    var App = function() {
        this.dash = dash;
    };

    return new App();
});