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
    SetupProduct modal ->Admin
    PlaceTree modal -> Admin when making article
*/



    Dash.HomeProductView = Backbone.View.extend({
        tagName: "div",
        className: "homeProduct",
        template: _.template($("#homeProductTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        // handled by router
        // events: {
        //           "click .product": "helpDesk"
        // },

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
            this.collection = Dash.products;
            this.render();
        },

        render: function() {
            this.$el.find(".homeProduct").remove(); // remove stuff from previous render
            this.$el.find(".keySections").remove();
            var that = this;
            _.each(this.collection.models, function(item) {
                that.renderProduct(item);
            }, this);
            return this;
        },

        renderProduct: function(item) {
            var homeProductView = new Dash.HomeProductView({
                model: item
            });
            //console.log(item.get('sectionJoins'));
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
                section.set("currentProductName", item.get('name'));
                section.setUrl(item.get('name'));
                that.renderListItem(section, "#keySections" + item.get('_id'));
            }, this);
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        }
    });

    Dash.View.HelpDesk = Dash.View.extend({
        el: "#HelpDesk",

        initialize: function() {
            Dash.View.prototype.initialize.apply(this);
            this.render();
            // this.renderSidebar();
        },

        render: function() {
            this.$el.find(".helpDeskProduct").remove();
            var helpDeskProduct = new Dash.HelpDeskProduct({
                model: this.model
            });
            this.$el.append(helpDeskProduct.render().el);
            return this;
        },

    });

    Dash.HelpDeskProduct = Backbone.View.extend({

        tagName: "div",
        className: "helpDeskProduct",
        template: _.template($("#helpDeskTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.renderFaqs();
            this.renderHowDoIs();
            this.renderSidebar();
            return this;
        },

        renderFaqs: function() {
            var that = this;
            var faqs = this.model.getFaqs();
            faqs.each(function(item) {
                that.renderListItem(item, "#faqList");
            }, this);
        },

        renderHowDoIs: function() {
            var that = this;
            var howDoIs = this.model.getHowDoIs();
            howDoIs.each(function(item) {
                that.renderListItem(item, "#howDoIList");
            }, this);
        },

        renderListItem: function(item, tag) {
            item.set("currentProductName", this.model.get('name'));
            item.setUrl(this.model.get('name'));
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        },

        renderSidebar: function() {
            this.$(sideBar).empty();
            var sideBar = new Dash.SideBar.Product({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        }
    });

    Dash.View.Article = Dash.View.extend({
        el: "#Article",
        template: _.template($("#articleTemplate").html()),

        initialize: function() {
            Dash.View.prototype.initialize.apply(this);
            this.$el.empty();
            this.render();
            this.renderSidebar();
        },

        render: function() {
            this.$el.empty();
            this.$el.append(this.template(this.model.toJSON()));
            return this;
        },

        renderSidebar: function() {
            this.$(sideBar).empty();
            var sideBar = new Dash.SideBar.Article({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        }
    });

    Dash.ListItem = Backbone.View.extend({

        tagName: "li",
        template: _.template($("#listItemTemplate").html()),

        // handled by router
        // events: {
        //     "click .item": "item"
        // },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        item: function() {
            if (this.model.get("type") === "section") {
                //do something for section
            } else {
                new Dash.View.Article({
                    model: this.model
                });
            }
        }
    });

    Dash.SideBar = Backbone.View.extend({
        tagName: "div",
        className: "sideBar",
    });

    Dash.SideBar.Product = Dash.SideBar.extend({
        template: _.template($("#productSideBarTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var that = this;
            this.model.get("sectionJoins").each(function(sectionJoin) {
                var section = sectionJoin.get("section");
                if (section.get("type") === "section") {
                    that.renderListItem(section, "#sections");
                }
            });
            return this;
        },

        renderListItem: function(item, tag) {
            item.set("currentProductName", this.model.get('name'));
            item.setUrl(this.model.get('name'));
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        },
    });

    // make a separate one for faq and howDoI
    Dash.SideBar.Article = Dash.SideBar.extend({
        template: _.template($("#articleSideBarTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var that = this;
            // console.log(this.model.getFaqs());
            //     console.log(window.location.hash);
            var url = window.location.hash.substring(1);
            //     console.log(url);
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            //   console.log(url);
            this.model.getFaqs().each(function(faq) {
                faq.set("currentProductName", that.model.get('currentProductName'));
                faq.set("URL", url + "/" + faq.get('name').replace(/\s/g, ""));
                //  faq.setUrl(that.model.get('currentProductName'));
                that.renderListItem(faq, "#faqs");
            });
            this.model.getHowDoIs().each(function(howDoI) {
                howDoI.set("currentProductName", that.model.get('currentProductName'));
                howDoI.set("URL", url + "/" + howDoI.get('name').replace(/\s/g, ""));
                that.renderListItem(howDoI, "#howDoIs");
            });
            var path = url.split('/');
            if (path.length > 2) {
                var section = this.model.getSection(path[path.length - 2]);
                if (section) {
                    section.get('childJoins').each(function(childJoin) {
                        var child = childJoin.get('child');
                        if (child !== that.model) {
                            child.set("currentProductName", that.model.get('currentProductName'));
                            child.set("URL", url.substring(0, url.lastIndexOf('/')+1) + child.get('name').replace(/\s/g, ""));
                            that.renderListItem(child, "#otherSections");
                        }
                    });
                }
            }
            return this;
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        },
    });

    Dash.View.SiteMap = Dash.View.extend({
        // sitemap - map or list
        // sidebar
    });

    return Dash;
});