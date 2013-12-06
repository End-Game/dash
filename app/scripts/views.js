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
    SetupProduct->Admin
    PlaceTree  -> Admin when making article
*/
    
    Dash.testJson = {
        "products": [{
            "name": "product1",
            "id": 1,
            "shortDescription": "enter a short short description",
            "description": "long block of text blah blah blah blah blah blah blah blah blah blah blah blah",
            "helpDeskUrl": "enterUrl",
            "sections": [{
                "name": "article1",
                "type": "article",
                "isKey": true,
                "id": 3
            },{
                "name": "faq",
                "type": "faq",
                "isKey": true,
                "id":4
            },{
                "name": "section1",
                "type": "section",
                "id":5
            }]
        }, {
            "name": "product2",
            "id": 2,
            "shortDescription": "enter a short short description",
            "description": "long block of text blah blah blah blah blah blah blah blah blah blah blah blah",
            "helpDeskUrl": "enterUrl",
            "sections": [{
                "name": "article1",
                "type": "article",
                "id": 9
            },{
                "name": "section1",
                "type": "section",
                "isKey": true,
                "id": 6 
            },{
                "name": "faq1",
                "type": "faq",
                "isKey": true,
                "id": 7 
            },{
                "name": "faq2",
                "type": "faq",
                "id": 8
            }]
        }]
    };

    Dash.HomeProductView = Backbone.View.extend({
        tagName: "div",
        className: "homeProduct",
        template: _.template($("#homeProductTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click #product": "helpDesk"
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
            this.collection = new Dash.Products(Dash.testJson.products);
            this.render();
        },

        render: function() {
            this.$el.find("#homeProduct").remove(); // remove stuff from previous render
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item); // render top row of product and short desc
            }, this);
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
                that.renderListItem(section, "#keySections"+item.get('name'));
            }, this);
        },
        
        renderListItem: function(item, tag){
            console.log(tag);
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        }
    });

    Dash.View.HelpDesk = Dash.View.extend({
        el: "#HelpDesk",
        
        tagName: "div",
        className: "keySections",
        template: _.template($("#keySectionsTemplate").html()),

        initialize: function() {
            Dash.View.prototype.initialize.apply(this);
            this.render();
           // this.renderSidebar();
        },
        
        render: function(){
            this.$el.find("#helpDeskProduct").remove();
            var helpDeskProduct = new Dash.HelpDeskProduct({
                model: this.model
            });   
            this.$el.prepend(helpDeskProduct.render().el);
            var faqs = this.model.getFaqs();
            var that = this;
            faqs.each(function(item) {
                that.renderListItem(item, "#faqList");
            }, this);  
        },
        
        renderListItem: function(item, tag){
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
    
    Dash.ListItem = Backbone.View.extend({
        
        tagName: "li",
        template: _.template($("#listItemTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return Dash;
});