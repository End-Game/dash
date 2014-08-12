define(['dash', 'backbone', 'Hoist', 'templates', 'views'], function(Dash, Backbone, Hoist) {
    'use strict';

    Dash.HomeProductView = Dash.HomeProductView.extend({
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var that = this;
            this.$('.imageContainer img').load(function() {
                var this$ = that.$(this);
                if (this.naturalHeight / this.naturalWidth > 150 / 225) {
                    this$.css('height', 150);
                    this$.parent().css('padding-top', 0);
                    this$.parent().css('padding-bottom', 0);
                } else {
                    this$.css('width', 225);
                    this$.parent().css('height', 'auto');
                    this$.parent().css('padding-top', (150 - this$.height()) / 2);
                    this$.parent().css('padding-bottom', (150 - this$.height()) / 2);
                }
            });
            this.$('h1, h2, h3, h4, h5, h6').css('color', this.model.get('themeColour'));
            return this;
        },

    });

    Dash.View.Home = Dash.View.Home.extend({
        events: {},

        render: function() {
            this.$el.html(this.template());
            this.$('.leftCover, .rightCover').hide();
            var that = this;
            this.model.each(function(item) {
                that.renderProduct(item);
            }, this);
            this.windowResize();
            this.keySectionsBorders();
            return this;
        },

        windowResize: function() {
            var individualWidth = 245;
            var productsWidth = Dash.products.length * individualWidth;
            var fullProductsWidth = Dash.products.length * 320;
            var windowWidth = $(window).width();
            if (windowWidth > productsWidth) {
                fullProductsWidth = Math.min(fullProductsWidth, windowWidth);
                fullProductsWidth = Math.max(fullProductsWidth, productsWidth);
                individualWidth = fullProductsWidth / Dash.products.length;
                productsWidth = fullProductsWidth;
            }
            var offset = (960 - productsWidth) / 2;
            $('#products, #keySections').css('margin-left', offset);
            $('#keySections, #products').width(productsWidth);
            $('.homeProduct, .imageContainer, .keySections').width(individualWidth - 20);
        }
    });
});