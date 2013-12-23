define(['dash', 'backbone', 'hoist'], function(Dash, Backbone, hoist) {
    'use strict';

    /*
    Views needed:
    Product-
    Article-
    Home- + Admin
    ProductHelpDesk-
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
            if (this.start) {
                this.start();
            }
            $('section').hide();
            this.render();
            this.$el.show();
            // this.model.on('change', this.render, this);
        },
    });

    Dash.View.Home = Dash.View.extend({
        el: "#Home",

        start: function() {
            this.model = Dash.products;
        },

        render: function() {
            this.$el.find("#products").empty(); // remove stuff from previous render
            this.$el.find("#keySections").empty();
            var that = this;
            this.model.each(function(item) {
                that.renderProduct(item);
            }, this);
            return this;
        },

        renderProduct: function(item) {
            var homeProductView = new Dash.HomeProductView({
                model: item
            });
            this.$("#products").append(homeProductView.render().el);
            this.renderKeySections(item); // render bottom row of key sections
        },

        renderKeySections: function(item) {
            var keySections = new Dash.KeySectionsView({
                model: item
            });
            this.$("#keySections").append(keySections.render().el);
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

        render: function() {
            this.$el.find(".helpDeskProduct").remove();
            var helpDeskProduct = new Dash.HelpDeskProduct({
                model: this.model
            });
            this.$el.append(helpDeskProduct.render().el);
            // this.renderSidebar();
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
            if (this.$("#faqList li").length === 0) {
                this.$("#faqs").empty();
            }
        },

        renderHowDoIs: function() {
            var that = this;
            var howDoIs = this.model.getHowDoIs();
            howDoIs.each(function(item) {
                that.renderListItem(item, "#howDoIList");
            }, this);
            if (this.$("#howDoIList li").length === 0) {
                this.$("#howDoIs").empty();
            }
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
            this.$('.sideBar').empty();
            var sideBar = new Dash.SideBar.Product({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        }
    });

    Dash.View.Article = Dash.View.extend({
        el: "#Article",
        template: _.template($("#articleTemplate").html()),

        render: function() {
            this.$el.empty();
            this.$el.html(this.template(this.model.toJSON()));
            this.renderSidebar();
            return this;
        },

        renderSidebar: function() {
            var sideBar = new Dash.SideBar.Article({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        }
    });


    Dash.View.Section = Dash.View.extend({
        el: "#Article",
        template: _.template($("#sectionTemplate").html()),

        render: function() {
            this.$el.empty();
            this.$el.html(this.template(this.model.toJSON()));
            this.renderSections();
            return this;
        },

        renderSections: function() {
            var that = this;
            var url = window.location.hash.substring(1);
            if (url.charAt(url.length - 1) !== '/') {
                url = url + "/";
            }
            this.model.getChildren().each(function(child) {
                child.set("currentProductName", that.model.get('currentProductName'));
                child.set("URL", url + child.get('name').replace(/\s/g, ""));
                that.renderListItem(child, "#children");
            });
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        },

        renderSidebar: function() {
            //this.$(sideBar).empty();
            // var sideBar = new Dash.SideBar.Article({
            //     model: this.model
            // });
            // this.$el.append(sideBar.render().el);
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
            this.$el.empty();
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

    // make a separate one for faq and howDoI?
    Dash.SideBar.Article = Dash.SideBar.extend({
        template: _.template($("#articleSideBarTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var that = this;
            var url = window.location.hash.substring(1);
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            this.renderFaqs(url);
            this.renderHowDoIs(url);
            this.renderOtherArticles(url);
            return this;
        },

        renderFaqs: function(url) {
            var that = this;
            this.model.getFaqs().each(function(faq) {
                faq.set("currentProductName", that.model.get('currentProductName'));
                faq.setUrl(that.model.get('currentProductName'));
                if (faq.URL === undefined) {
                    faq.set("URL", url + "/" + faq.get('name').replace(/\s/g, ""));
                }
                //  faq.setUrl(that.model.get('currentProductName'));
                that.renderListItem(faq, "#faqList");
            });
            if (this.$("#faqList li").length === 0) {
                this.$("#faqs").empty();
            }

        },

        renderHowDoIs: function(url) {
            var that = this;
            this.model.getHowDoIs().each(function(howDoI) {
                howDoI.set("currentProductName", that.model.get('currentProductName'));
                howDoI.setUrl(that.model.get('currentProductName'));
                if (howDoI.URL === undefined) {
                    howDoI.set("URL", url + "/" + howDoI.get('name').replace(/\s/g, ""));
                }
                that.renderListItem(howDoI, "#howDoIList");
            });
            if (this.$("#howDoIList li").length === 0) {
                this.$("#howDoIs").empty();
            }
        },

        renderOtherArticles: function(url) {
            var that = this;
            var path = url.split('/');
            var toRender = [];
            if (path.length > 2) {
                var section = this.model.getSection(path[path.length - 2]);
                if (section) {
                    section.get('childJoins').each(function(childJoin) {
                        var child = childJoin.get('child');
                        if (child !== that.model && child.get('type') === "article") {
                            toRender.push(child);
                        }
                    });
                }
            } else {
                var product = this.model.getProduct(path[0]);
                if (product) {
                    product.get('sectionJoins').each(function(sectionJoin) {
                        var section = sectionJoin.get('section');
                        if (section !== that.model && section.get('type') === "article") {
                            toRender.push(section);
                        }
                    });
                }
            }
            _.each(toRender, function(article) {
                article.set("currentProductName", that.model.get('currentProductName'));
                article.set("URL", url.substring(0, url.lastIndexOf('/') + 1) + article.get('name').replace(/\s/g, ""));
                that.renderListItem(article, "#otherArticleList");
            });

            if (this.$("#otherArticleList li").length === 0) {
                this.$("#otherArticles").empty();
            }
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        },
    });

    Dash.SideBar.Section = Dash.SideBar.extend({

    });

    Dash.View.SiteMap = Dash.View.extend({
        // sitemap - map or list
        // sidebar
    });

    Dash.MapList = Backbone.View.extend({
        tagName: "ul",
        
        render: function(){
            
        },
    });
    return Dash;
});