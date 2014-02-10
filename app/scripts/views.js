define(['dash', 'backbone', 'hoist', 'templates'], function(Dash, Backbone, hoist) {
    'use strict';

    /*
    Views needed:
    SearchResults
        ResultsList
    SiteMap + Admin
        Map-
        List
    personaliseProduct modal ->Admin 
*/
    Dash.ignoredWords = [
        "a",
        "all",
        "am",
        "an",
        "and",
        "any",
        "are",
        "as",
        "at",
        "be",
        "but",
        "can",
        "did",
        "do",
        "does",
        "for",
        "from",
        "had",
        "has",
        "have",
        "here",
        "how",
        "i",
        "if",
        "in",
        "is",
        "it",
        "no",
        "not",
        "of",
        "on",
        "or",
        "so",
        "that",
        "the",
        "then",
        "there",
        "this",
        "to",
        "too",
        "up",
        "use",
        "what",
        "when",
        "where",
        "who",
        "why",
        "you"
    ];

    Dash.simplifySearchQuery = function(query) {
        query = query.replace("?", "");
        query = query.replace("&", "");
        var words = query.split(" ");
        var result = "";
        _.each(words, function(word) {
            if (Dash.ignoredWords.indexOf(word.trim().toLowerCase()) < 0) {
                result = result + word + " ";
            }
        });
        result = result.trim();
        if (!result) {
            result = query;
        }
        return result;
    };


    Dash.ListItem = Backbone.View.extend({

        tagName: "li",
        template: Dash.Template.listItem,

        // handled by router
        // events: {
        //     "click .item": "item"
        // },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        // item: function() {
        //     if (this.model.get("_type") === "section") {
        //         //do something for section
        //     } else {
        //         new Dash.View.Article({
        //             model: this.model
        //         });
        //     }
        // }
    });

    Dash.TagView = Dash.ListItem.extend({
        template: Dash.Template.tag,
        tagName: "div",
        className: 'tag themeBorder'
    });

    Dash.SearchResult = Backbone.View.extend({
        template: Dash.Template.searchResult,
        tagName: 'div',
        className: 'searchResult',

        render: function() {
            this.$el.html(this.template(this.model));
            return this;
        },
    });

    Dash.HomeProductView = Backbone.View.extend({
        tagName: "div",
        className: "homeProduct",
        template: Dash.Template.homeProduct,

        initialize: function() {
            this.model.on('change', this.render, this);
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$('.imageContainer img').load(function() {
                var this$ = $(this);
                console.log(this$.height());
                console.log(this$.width());
                if (this.naturalHeight / this.naturalWidth > 0.5) {
                    this$.css('height', 150);
                    this$.parent().css('padding-top', 0);
                    this$.parent().css('padding-bottom', 0);
                } else {
                    this$.css('width', 300);
                    this$.parent().css('height', 'auto');
                    this$.parent().css('padding-top', (150 - this$.height())/2);
                    this$.parent().css('padding-bottom', (150 - this$.height())/2);
                }
            });
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
        template: Dash.Template.keySections,

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });


    Dash.View = Backbone.View.extend({
        initialize: function() {
            var view = this.$el.data('view');

            if (view && view.trash) {
                view.trash();
            }

            if (!this.$el.hasClass('modal')) {
                $('section').hide();
            } else {
                $('section.modal').hide();
            }

            this.$el.data('view', this);

            if (this.start) {
                this.start();
            }

            this.render();

            if (this.afterRender) {
                this.afterRender();
            }

            // if (this.model) {
            //     this.listenTo(this.model, 'change', this.render);
            // }

            this.$el.show();
        },

        swallow: function(e) {
            e.stopPropagation();
        },

        trash: function() {
            this.stopListening();
            this.undelegateEvents();
            this.off();

            this.$el.off();
            this.$el.removeData('view').hide();

            if (this.end) {
                this.end();
            }
        }
    });

    Dash.View.Home = Dash.View.extend({
        el: "#Home",
        template: Dash.Template.home,

        start: function() {
            this.model = Dash.products;
            this.productCount = 0; // possibly use for rendering products > 3
        },

        render: function() {
            this.$el.html(this.template());
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
            if (this.productCount < 3) {
                this.$("#products").append(homeProductView.render().el);
            } else {
                //this.$("#products").after(homeProductView.render().el);
            }
            this.renderKeySections(item); // render bottom row of key sections
            this.productCount++;
        },

        renderKeySections: function(item) {
            var keySections = new Dash.KeySectionsView({
                model: item
            });
            if (this.productCount < 3) {
                this.$("#keySections").append(keySections.render().el);
            } else {
                //  this.$("#keySections").after(keySections.render().el);
            }
            var that = this;
            var keySectionsList = item.getKeySections();
            keySectionsList.each(function(section) {
                if (section.get('_type') === 'section' || section.get('published')) {
                    section.set("currentProductName", item.get('name'));
                    section.setUrl(Dash.urlEscape(item.get('name')));
                    that.renderListItem(section, "#keySections" + item.get('_id'));
                }
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
        template: Dash.Template.helpDesk,

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.renderList(this.model.getFaqs(), "#faqList", "#faqs");
            this.renderList(this.model.getHowDoIs(), "#howDoIList", "#howDoIs");
            this.renderSidebar();
            return this;
        },

        renderList: function(list, listTag, divTag) {
            var that = this;
            list.each(function(item) {
                if (item.get('published') || Dash.admin) {
                    that.renderListItem(item, listTag);
                }
            });
            if (this.$(listTag + " li").length === 0) {
                this.$(divTag).hide();
            } else {
                this.$(divTag).show();
            }
        },

        renderListItem: function(item, tag) {
            item.set("currentProductName", this.model.get('name'));
            item.setUrl(Dash.urlEscape(this.model.get('name')));
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
        template: Dash.Template.article,
        breadCrumbTemplate: Dash.Template.breadCrumb,

        render: function() {
            this.$el.empty();
            this.$el.html(this.template(this.model.toJSON()));
            this.renderSidebar();
            this.renderTags();
            this.renderRelevantArticles();
            this.renderBreadCrumb();
            return this;
        },

        renderSidebar: function() {
            var sideBar = new Dash.SideBar.Article({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        },

        renderTags: function() {
            var that = this;
            this.model.get('tagJoins').each(function(tagJoin) {
                var tag = tagJoin.get('tag');
                var tagListItem = new Dash.TagView({
                    model: tag
                });
                that.$('#tags').append(tagListItem.render().el);
            });
        },

        renderRelevantArticles: function() {
            var articles = this.model.getTaggedArticles().where({
                type: 'article'
            });
            var that = this;
            _.each(articles, function(article) {
                that.renderListItem(article, "#relevantArticleList");
            });

            if (this.$("#relevantArticleList li").length === 0) {
                this.$("#relevantArticles").hide();
            } else {
                this.$("#relevantArticles").show();
            }
        },

        renderBreadCrumb: function() {
            var pathSplit = this.model.get('URL').split('/');
            var urlItems = this.model.getUrlItems(pathSplit.slice(0, pathSplit.length - 1));
            var crumbText = this.breadCrumbTemplate(urlItems[0].toJSON());
            for (var i = 1; i < urlItems.length; i++) {
                crumbText = crumbText + ' > ' + this.breadCrumbTemplate(urlItems[i].toJSON());
            }
            this.$('.breadCrumb').html(crumbText);
        },

        renderListItem: function(item, tag) {
            item.set("currentProductName", this.model.get('currentProductName'));
            item.setUrl(Dash.urlEscape(this.model.get('currentProductName')));
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        },

    });

    Dash.View.Section = Dash.View.extend({
        el: "#Article",
        template: Dash.Template.section,
        breadCrumbTemplate: Dash.Template.breadCrumb,

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.renderSections();
            this.renderSidebar();
            this.renderBreadCrumb();
            return this;
        },

        renderSections: function() {
            var that = this;
            var url = window.location.hash.substring(1);
            if (url.charAt(url.length - 1) !== '/') {
                url = url + "/";
            }
            if (url.charAt(0) === '!') {
                url = url.substring(1);
            }
            this.model.getChildren().each(function(child) {
                if (child.get('_type') === 'section' || child.get('published') || Dash.admin) {
                    child.set("currentProductName", that.model.get('currentProductName'));
                    child.set("URL", Dash.urlEscape(url + child.get('name')));
                    that.renderListItem(child, "#children");
                }
            });
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            if (item.get("_type") === "section") {
                listItem = new Dash.ListItem({
                    model: item,
                    className: 'bold'
                });
            }
            this.$(tag).append(listItem.render().el);
        },

        renderSidebar: function() {
            this.$(sideBar).empty();
            var sideBar = new Dash.SideBar.Section({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        },

        renderBreadCrumb: function() {
            var pathSplit = this.model.get('URL').split('/');
            var urlItems = this.model.getUrlItems(pathSplit.slice(0, pathSplit.length - 1));
            var crumbText = this.breadCrumbTemplate(urlItems[0].toJSON());
            for (var i = 1; i < urlItems.length; i++) {
                crumbText = crumbText + ' > ' + this.breadCrumbTemplate(urlItems[i].toJSON());
            }
            this.$('.breadCrumb').html(crumbText);
        }

    });

    Dash.View.Search = Dash.View.extend({
        el: "#Search",
        template: Dash.Template.search,

        events: {
            "click div.search": "getResults",
            "keydown input.search": "keydown"
        },

        afterRender: function() {
            if (this.search) {
                this.$('input.search').val(search);
                this.getResults();
            }
        },

        render: function() {
            this.$el.html(this.template());
            if (this.results) {
                this.renderResults();
            }
            return this;
        },

        renderResults: function() {
            this.$('.results').empty();
            for (var i = 0; i < this.results.length; i++) {
                this.renderItem(this.results[i]);
            }
        },

        getResults: function() {
            var query = this.$('input.search').val();
            query = Dash.simplifySearchQuery(query);
            console.log(query);
            if (!this.results) {
                this.results = [{
                    htmlTitle: "Example result",
                    link: "#searchResultLink",
                    htmlSnippet: "this is where a snippet of the article displays"
                }, {
                    htmlTitle: "new article 1",
                    link: "#product1/newsection/newarticle1",
                    htmlSnippet: "this is where the article content displays"
                }]; // get array of results (pref json)
            }
            this.renderResults();
        },

        keydown: function(e) {
            if (e.which === 13) {
                e.preventDefault();
                this.getResults();
            }
        },

        renderItem: function(item) {
            var listItem = new Dash.SearchResult({
                model: item
            });
            this.$(".results").append(listItem.render().el);
        }
    });

    Dash.SideBar = Backbone.View.extend({
        tagName: "div",
        className: "sideBar",
    });

    Dash.SideBar.Product = Dash.SideBar.extend({
        template: Dash.Template.productSideBar,

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var that = this;
            this.model.getAllSections().each(function(section) {
                that.renderListItem(section, "#sections");
            });
            return this;
        },

        renderListItem: function(item, tag) {
            item.set("currentProductName", this.model.get('name'));
            item.setUrl(Dash.urlEscape(this.model.get('name')));
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        },
    });

    // make a separate one for faq and howDoI?
    Dash.SideBar.Article = Dash.SideBar.extend({
        template: Dash.Template.articleSideBar,

        render: function() {
            var modelJSON = this.model.toJSON();
            modelJSON.currentProductName = Dash.urlEscape(modelJSON.currentProductName);
            this.$el.html(this.template(modelJSON));
            var that = this;
            var url = window.location.hash.substring(1);
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            if (url.charAt(0) === '!') {
                url = url.substring(1);
            }
            this.renderSiteMap();
            this.renderList(url, this.model.getTaggedArticles().where({
                type: 'faq'
            }), "#faqList", "#faqs");
            this.renderList(url, this.model.getTaggedArticles().where({
                type: 'howDoI'
            }), "#howDoIList", "#howDoIs");
            this.renderOtherArticles(url);
            return this;
        },

        renderSiteMap: function() {

        },

        renderList: function(url, list, listTag, divTag) {
            var that = this;
            _.each(list, function(item) {
                if (item.get('published') || Dash.admin) {
                    item.set("currentProductName", that.model.get('currentProductName'));
                    item.setUrl(Dash.urlEscape(that.model.get('currentProductName')));
                    // if (item.get('URL') === undefined) {
                    //     item.set("URL", url + "/" + item.get('name').replace(/\s/g, ""));
                    // }
                    that.renderListItem(item, listTag);
                }
            });
            if (this.$(listTag + " li").length === 0) {
                this.$(divTag).hide();
                this.$(divTag).prev('hr').hide();
            } else {
                this.$(divTag).show();
            }
        },


        renderOtherArticles: function(url) {
            var that = this;
            var path = url.split('/');
            var toRender = new Dash.Sections();
            if (path.length > 2) {
                var section = this.model.getSection(path[path.length - 2]);
                if (section) {
                    toRender.add(section.getChildren().where({
                        type: 'article'
                    }));
                }
            } else {
                var product = this.model.getProduct(path[0]);
                if (product) {
                    toRender.add(product.getSections().where({
                        type: 'article'
                    }));
                }
            }
            toRender.remove(this.model);

            this.renderList(url, toRender.models, "#otherArticleList", "#otherArticles");
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        },
    });

    Dash.SideBar.Section = Dash.SideBar.extend({});

    Dash.SideBar.SiteMap = Dash.SideBar.Product.extend({
        template: Dash.Template.siteMapSideBar,
    });

    Dash.View.SiteMap = Dash.View.extend({
        el: "#SiteMap",
        template: Dash.Template.siteMap,
        // sitemap - map or list
        // sidebar
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var map = this.isList ? new Dash.SiteMap.List({
                model: this.model
            }) : new Dash.SiteMap.Map({
                model: this.model
            });
            this.$('.map').append(map.render().el);
            this.renderSidebar();
            return this;
        },

        renderSidebar: function() {
            this.$('.sideBar').empty();
            var sideBar = new Dash.SideBar.SiteMap({
                model: this.model,
            });
            this.$el.append(sideBar.render().el);
        }
    });

    Dash.SiteMap = Backbone.View.extend({
        render: function() {
            this.$el.empty();
            var sections = new Dash.Sections();
            if (this.model.get('_type') === 'product') {
                sections = this.model.getSections();
            } else if (this.model.get('_type') === 'section') {
                sections = this.model.getChildren();
            }
            var that = this;
            sections.each(function(section) {
                that.renderSection(section);
            });
            return this;
        },
    });

    Dash.SiteMap.Map = Dash.SiteMap.extend({
        tagName: "ul",

        renderSection: function(section) {
            if (this.model.get('_type') === 'product') {
                section.set('currentProductName', this.model.get('name'));
            } else {
                section.set('currentProductName', this.model.get('currentProductName'));
            }
            var url = this.model.get('URL');
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            if (url.charAt(0) === '!') {
                url = url.substring(1);
            }
            url = url + "/" + section.get("name");
            section.set('URL', Dash.urlEscape(url));
            if (section.get('_type') === 'section') {
                this.renderListItem(section);
                var map = new Dash.SiteMap.Map({
                    model: section
                });
                this.$("li").last().append(map.render().el);
            } else if (section.get('published') || Dash.admin) {
                this.renderListItem(section);
            }
        },

        renderListItem: function(item) {
            var listItem;
            if (item.get("_type") === "article" && (item.get('published') || Dash.admin)) {
                listItem = new Dash.ListItem({
                    model: item
                });
            } else if (item.get("_type") === "section") {
                listItem = new Dash.ListItem({
                    model: item,
                    className: 'bold'
                });
            }
            if (listItem) {
                this.$el.append(listItem.render().el);
            }
        },
    });

    Dash.SiteMap.List = Dash.SiteMap.extend({
        render: function() {

        }
    });

    Dash.SiteMap.SectionMap = Dash.SiteMap.Map.extend({
        tagName: "ul",

        render: function() {
            var sections = new Dash.Sections();
            if (this.model.get('_type') === 'product') {
                sections = this.model.getSections();
                this.renderProduct();
            } else if (this.model.get('_type') === 'section') {
                sections = this.model.getChildren();
            }
            var that = this;
            sections.each(function(section) {
                that.renderSection(section);
            });
            return this;
        },

        renderProduct: function() {
            this.$el.wrap("<ul><li></li></ul>");
            var that = this;
            var listItem = new Dash.ListItem({
                model: that.model
            });
            this.$el.before(Dash.Template.listItem(this.model.toJSON()));
        },

        renderSection: function(section) {
            if (this.model.get('_type') === 'product') {
                section.set('currentProductName', this.model.get('name'));
            } else {
                section.set('currentProductName', this.model.get('currentProductName'));
            }
            var url = this.model.get('URL');
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            if (url.charAt(0) === '!') {
                url = url.substring(1);
            }
            url = (url + "/" + section.get("name"));
            section.set('URL', Dash.urlEscape(url));
            if (section.get('_type') === 'section') {
                this.renderListItem(section);
                var map = new Dash.SiteMap.SectionMap({
                    model: section
                });
                this.$("li").last().append(map.render().el);
            }
        },

    });
    return Dash;
});