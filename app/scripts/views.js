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

    Dash.loadImages = function($textBlock) {
        $textBlock.find('img').each(function() {
            var $this = $(this);
            var src = $this.attr('src');
            if (src.indexOf('!Hoist') === 0) {
                Hoist.file('image' + src.slice(6), function(res) {
                    $this.attr('src', URL.createObjectURL(res));
                }, function(res) {
                    console.log('image get failed: ' + res);
                }, this);
            }
        });
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

    Dash.NonLinkListItem = Dash.ListItem.extend({
        template: Dash.Template.nonLinkListItem
    });

    Dash.MapListItem = Dash.ListItem.extend({
        tagName: 'div',
        template: Dash.Template.mapListItem
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
            var that = this;
            this.$('.imageContainer img').load(function() {
                var this$ = that.$(this);
                if (this.naturalHeight / this.naturalWidth > 0.6) {
                    this$.css('height', 150);
                    this$.parent().css('padding-top', 0);
                    this$.parent().css('padding-bottom', 0);
                } else {
                    this$.css('width', 250);
                    this$.parent().css('height', 'auto');
                    this$.parent().css('padding-top', (150 - this$.height()) / 2);
                    this$.parent().css('padding-bottom', (150 - this$.height()) / 2);
                }
            });
            this.$('h1, h2, h3, h4, h5, h6').css('color', this.model.get('themeColour'));
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
            this.$('h1, h2, h3, h4, h5, h6').css('color', this.model.get('themeColour'));
            var that = this;
            var keySectionsList = this.model.getKeySections();
            keySectionsList.each(function(section) {
                if (section.get('_type') === 'section' || section.get('published')) {
                    section.set("currentProductName", this.model.get('name'));
                    section.setUrl(Dash.urlEscape(this.model.get('name')));
                    that.renderListItem(section, 'ul');
                }
            }, this);
            if (!this.$('li').length) {
                this.$el.empty();
            }
            return this;
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
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
        arrowTemplate: Dash.Template.productsArrow,

        start: function() {
            this.model = Dash.products;
            $(window).resize($.proxy(this.windowResize, this));
        },

        events: {
            "click .leftCover, .rightCover": "moveProducts",
        },

        render: function() {
            this.$el.html(this.template());
            var that = this;
            this.model.each(function(item) {
                that.renderProduct(item);
            }, this);
            this.resizeContainers();
            this.keySectionsBorders();
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
        },
        
        keySectionsBorders: function(){
            var keySectionDivs = this.$('.keySections');
            var i;
            for (i = keySectionDivs.length - 1; i >= 0; i--) {
                keySectionDivs[i] = this.$(keySectionDivs[i]).find('div').first();
                if (i!==keySectionDivs.length-1 && !keySectionDivs[i + 1].length) {
                    keySectionDivs[i].css('border-right', 'none');
                }
            }
            for (i = keySectionDivs.length - 1; i >= 0; i--) {
                if (i!==0 && !keySectionDivs[i - 1].length) {
                    keySectionDivs[i].css('border-left', 'none');
                }
            }
        },
        
        resizeContainers: function() {
            if (Dash.products.length < 4) {
                this.$('.leftCover, .rightCover').hide();
                return;
            }
            var productsWidth = Dash.products.length * 320;
            this.$('#keySections, #products').width(productsWidth);
            var that = this;
            var fullWidth = $(window).width();
            var coverWidth = (fullWidth - 960) / 2;
            this.$('.leftCover, .rightCover').width(coverWidth);
            this.$('.homeContainer').each(function() {
                var $this = that.$(this);
                var height = $this.height();
                $this.find('.leftCover, .rightCover').css('margin-bottom', height * -1);
                $this.find('.leftCover, .rightCover').height(height);
            });

            this.$('img').first().load(function() {
                var fullWidth = $(window).width();
                var coverWidth = (fullWidth - 960) / 2;
                that.$('.leftCover, .rightCover').width(coverWidth);
                that.$('.homeContainer').each(function() {
                    var $this = that.$(this);
                    var height = $this.height();
                    $this.find('.leftCover, .rightCover').css('margin-bottom', height * -1);
                    $this.find('.leftCover, .rightCover').height(height);
                });
            });
            this.$('.leftCover .rightCover').hide();
            // if (Dash.products.length > 3) {
            this.renderArrows();
            // }
        },

        windowResize: function() {
            var that = this;
            var fullWidth = $(window).width();
            var coverWidth = (fullWidth - 960) / 2;
            this.$('.leftCover, .rightCover').width(coverWidth);
            this.$('.homeContainer').each(function() {
                var $this = that.$(this);
                var height = $this.height();
                $this.find('.leftCover, .rightCover').css('margin-bottom', height * -1);
                $this.find('.leftCover, .rightCover').height(height);
            });
        },

        renderArrows: function() {
            this.$('.leftCover .rightCover').hide();
            if (Dash.products.length > 3) {
                var productsWidth = Dash.products.length * 320;
                var marginLeft = parseFloat(this.$('#products').css('margin-left'));
                var offset = marginLeft / -320;
                if (marginLeft < 0) {
                    this.$('.leftCover').show();
                    // this.$('.leftCover').append(this.arrowTemplate({
                    //     // this.$('.homeProduct:eq(' + offset + ')').before(this.arrowTemplate({
                    //     left: true
                    // }));
                } else {
                    this.$('.leftCover').hide();
                }
                if ((productsWidth + marginLeft) > 960) {
                    this.$('.rightCover').show();
                    // this.$('.rightCover').append(this.arrowTemplate({
                    //     // this.$('.homeProduct:eq(' + (2 + offset) + ')').after(this.arrowTemplate({
                    //     left: false
                    // }));
                } else {
                    this.$('.rightCover').hide();
                }
                var that = this;
                this.$('.productsArrow img').load(function() {
                    var $this = that.$(this);
                    var arrowHeight = 50;
                    var height = $this.parents('.homeContainer').height();
                    $this.parent().css('padding-top', (height - arrowHeight) / 2);
                    $this.parent().css('padding-bottom', (height - arrowHeight) / 2);
                });
            }
        },

        moveProducts: function(e) {
            var target = this.$(e.currentTarget);
            var productsWidth = Dash.products.length * 320;
            var marginLeft = parseFloat(this.$('#products').css('margin-left'));
            if (target.hasClass('leftCover') && (marginLeft < 0)) {
                this.$('#products, #keySections').css('margin-left', '+=320');
                this.renderArrows();
            }
            if (target.hasClass('rightCover') && ((productsWidth + marginLeft) > 960)) {
                this.$('#products, #keySections').css('margin-left', '-=320');
                this.renderArrows();
            }
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
            if (this.model.get('discussion')) {
                this.renderDiscussion();
            }
            Dash.loadImages(this.$('.textBlock'));
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
                tag.set('URL', Dash.urlEscape(that.model.get('currentProductName') + '/tag/' + tag.get('name')));
                var tagListItem = new Dash.TagView({
                    model: tag
                });
                that.$('#tags').append(tagListItem.render().el);
            });
        },

        renderRelevantArticles: function() {
            var articles = this.model.getTaggedArticles().where({
                type: 'article',
                published: true
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

        renderDiscussion: function() {
            var discussionView = new Dash.View.Discussion({
                model: this.model
            });
            this.$('.discussionContainer').append(discussionView.render().el);
        }

    });

    Dash.View.Discussion = Backbone.View.extend({
        template: Dash.Template.discussion,
        commentTemplate: Dash.Template.comment,

        events: {
            'click .toggleDiscussion': 'toggleDiscussion',
            'click .toggleAddComment': 'toggleAddComment',
            'click .save': 'save'

        },

        render: function() {
            this.$el.html(this.template());
            this.renderComments();
            this.$('.discussion, .addComment, .toggleDiscussion:eq(1)').hide();
            return this;
        },

        renderComments: function() {
            this.$('.comments').empty();
            var comments = this.model.get('comments');
            comments.each(this.renderComment, this);
        },

        renderComment: function(comment) {
            this.$('.comments').append(this.commentTemplate(comment.toJSON()));
        },

        toggleDiscussion: function() {
            this.$('.toggleDiscussion, .discussion').toggle();
        },

        toggleAddComment: function() {
            this.$('.toggleAddComment').toggle();
            if (Dash.admin) {
                this.$('#author').hide();
                this.$('#content').removeClass('bottomField');
            }
            this.$('.addComment').toggle();
        },

        save: function() {
            this.$('button.save').prop("disabled", true);
            this.$('.errorText').remove();
            var author = this.$('#author').val();
            var content = this.$('#content').val();
            if (Dash.admin) {
                author = 'Simon'; // change to use user name
            }
            if (!Dash.admin && !author) {
                this.$('#author').before(Dash.Template.errorText({
                    errorText: "You must enter a name."
                }));
                this.$('button.save').prop("disabled", false);
                return;
            }
            if (!content) {
                this.$('#content').before(Dash.Template.errorText({
                    errorText: "You must enter a comment."
                }));
                this.$('button.save').prop("disabled", false);
                return;
            }
            var date = Dash.getDateString(true);
            var comment = new Dash.Comment({
                section: this.model,
                author: author,
                content: content,
                date: date
            });
            Dash.postModel('comment', comment, function() {
                var author = this.$('#author').val('');
                var content = this.$('#content').val('');
                this.renderComment(comment);
                this.toggleAddComment();
                this.$('button.save').prop("disabled", false);
            }, this);
        }
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
            if (this.model.get('discussion')) {
                this.renderDiscussion();
            }
            if (!this.model.get('content')) {
                this.$('.content').hide();
                this.$('.content').next('hr').hide();
            }
            return this;
        },

        renderSections: function() {
            var that = this;
            var url = this.model.get('URL');
            this.model.getChildren().each(function(child) {
                if (child.get('_type') === 'section' || (child.get('published') && child.get('type') === 'article') || Dash.admin) {
                    child.set("currentProductName", that.model.get('currentProductName'));
                    child.set("URL", Dash.urlEscape(url + '/' + child.get('name')));
                    that.renderListItem(child, "#children");
                }
            });
            if (this.$("#children li").length === 0) {
                this.$('#children').hide();
                this.$('#children').prev('hr').hide();
            } else {
                this.$('#children').show();
            }
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
        },

        renderDiscussion: function() {
            var discussionView = new Dash.View.Discussion({
                model: this.model
            });
            this.$('.discussionContainer').append(discussionView.render().el);
        }

    });

    Dash.View.Tag = Dash.View.extend({
        el: "#Article",
        template: Dash.Template.tagPage,
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
            this.model.getArticlesFromProduct().each(function(child) {
                if (Dash.admin || (child.get('published') && child.get('type') === 'article')) {
                    child.set("currentProductName", that.model.get('currentProductName'));
                    child.setUrl();
                    that.renderListItem(child, "#children");
                }
            });
        },

        renderListItem: function(item, tag) {
            var listItem = new Dash.ListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        },

        renderSidebar: function() {
            this.$(sideBar).empty();
            var sideBar = new Dash.SideBar.Tag({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        },

        renderBreadCrumb: function() {
            var product = Dash.products.findProduct(this.model.get('currentProductName'));
            var crumbText = this.breadCrumbTemplate(product.toJSON());
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

        events: {
            'click button.support': 'openSupport'
        },

        openSupport: function() {
            new Dash.View.Modal.Support();
        }
    });

    Dash.SideBar.Product = Dash.SideBar.extend({
        template: Dash.Template.productSideBar,

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var that = this;
            this.model.getAllSections().each(function(section) {
                that.renderListItem(section, "#sections");
            });
            if (Dash.products.length === 1) {
                this.$('.goHome').hide();
            }
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
            this.renderSiteMap();
            this.renderList(this.model.getTaggedArticles().where({
                type: 'faq'
            }), "#faqList", "#faqs");
            this.renderList(this.model.getTaggedArticles().where({
                type: 'howDoI'
            }), "#howDoIList", "#howDoIs");
            this.renderOtherArticles();
            return this;
        },

        renderSiteMap: function() {
            var that = this;
            var path = this.model.get('URL').split('/');
            var above, above2, toRenderAbove, toRenderSame;
            var product = Dash.products.findProduct(path[0]);
            if (path.length > 2) {
                above = this.model.getSection(path[path.length - 2]);
                toRenderSame = above.getChildren();
                if (path.length > 3) {
                    above2 = above.getSection(path[path.length - 3]);
                    toRenderAbove = above2.getChildren();
                } else {
                    above2 = product;
                    toRenderAbove = above2.getSections();
                }
            } else {
                above = product;
                toRenderSame = above.getSections();
                toRenderAbove = new Dash.Products([above]);
            }
            this.renderMapLists(product, toRenderAbove, toRenderSame, above);
        },

        renderMapLists: function(product, toRenderAbove, toRenderSame, above) {
            var that = this;
            toRenderAbove.each(function(item) {
                if (item.get('_type') !== 'article' || item.get('published')) {
                    if (item.get('_type') !== 'product') {
                        item.set("currentProductName", that.model.get('currentProductName'));
                        item.setUrl();
                    }
                    that.renderListItem(item, '#miniMapList', 'bold');
                    if (item === above) {
                        that.$('li').last().append('<ul class="innerList"></ul>');
                        toRenderSame.each(function(item2) {
                            if (item2 === that.model) {
                                that.renderNonLinkListItem(item2, '.innerList');
                            } else if (item2.get('_type') === 'section' || item2.get('published')) {
                                item2.set("currentProductName", that.model.get('currentProductName'));
                                item2.setUrl();
                                that.renderListItem(item2, '.innerList', item2.get('_type') === 'section' ? 'bold' : '');
                            }
                        });
                    }
                }
            });
        },

        renderList: function(list, listTag, divTag) {
            var that = this;
            if (!divTag) {
                divTag = listTag;
            }
            _.each(list, function(item) {
                if (item.get('published') || Dash.admin) {
                    item.set("currentProductName", that.model.get('currentProductName'));
                    item.setUrl();
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

        renderOtherArticles: function() {
            var that = this;
            var path = this.model.get('URL').split('/');
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

            this.renderList(toRender.models, "#otherArticleList", "#otherArticles");
        },

        renderListItem: function(item, tag, className) {
            var listItem = new Dash.ListItem({
                model: item,
                className: className
            });
            this.$(tag).append(listItem.render().el);
        },

        renderNonLinkListItem: function(item, tag) {
            var listItem = new Dash.NonLinkListItem({
                model: item
            });
            this.$(tag).append(listItem.render().el);
        }
    });

    Dash.SideBar.Section = Dash.SideBar.Article.extend({
        template: Dash.Template.sectionSideBar,

        render: function() {
            var modelJSON = this.model.toJSON();
            modelJSON.currentProductName = Dash.urlEscape(modelJSON.currentProductName);
            this.$el.html(this.template(modelJSON));
            var that = this;
            this.renderSiteMap();
            var children = this.model.getChildren();
            // render list of sections?
            var articles = new Dash.Sections(children.where({
                _type: 'article'
            }));
            this.renderList(articles.where({
                type: 'faq'
            }), "#faqList", "#faqs");
            this.renderList(articles.where({
                type: 'howDoI'
            }), "#howDoIList", "#howDoIs");
            return this;
        },
    });

    Dash.SideBar.Tag = Dash.SideBar.Article.extend({
        template: Dash.Template.tagSideBar,
        render: function() {
            var modelJSON = this.model.toJSON();
            modelJSON.currentProductName = Dash.urlEscape(modelJSON.currentProductName);
            this.$el.html(this.template(modelJSON));
            var that = this;
            var articles = this.model.getArticlesFromProduct();
            this.renderList(articles.where({
                type: 'faq'
            }), "#faqList", "#faqs");
            this.renderList(articles.where({
                type: 'howDoI'
            }), "#howDoIList", "#howDoIs");
            return this;
        }

    });

    Dash.SideBar.SiteMap = Dash.SideBar.Product.extend({
        template: Dash.Template.siteMapSideBar,
    });

    Dash.View.SiteMap = Dash.View.extend({
        el: "#SiteMap",
        template: Dash.Template.siteMap,
        listHeaderTemplate: Dash.Template.mapListHeader,

        events: {
            'click .setPublished p': 'setPublished',
            'click .toggle': 'toggleMap'
        },

        start: function() {
            var url = window.location.hash;
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            var pathSplit = url.split('/');
            this.isList = 'list'.equalsIgnoreUrl(pathSplit[pathSplit.length - 1]);
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            var map;
            if (this.isList) {
                this.$('.map').append(this.listHeaderTemplate());
                map = new Dash.SiteMap.List({
                    model: this.model
                });
                this.$('.map').append(map.render().$(' > div'));
                this.$('.toggleList').addClass('themeButton');
                this.$('.toggleMap img').attr('src', 'images/map_grey.png');
                this.$('.toggleList img').attr('src', 'images/list_white.png');
            } else {
                map = new Dash.SiteMap.Map({
                    model: this.model
                });
                this.$('.map').append(map.render().el);
                this.$('.toggleMap img').attr('src', 'images/map_white.png');
                this.$('.toggleList img').attr('src', 'images/list_grey.png');
                this.$('.toggleMap').addClass('themeButton');
            }
            this.renderSidebar();
            return this;
        },

        renderSidebar: function() {
            this.$('.sideBar').empty();
            var sideBar = new Dash.SideBar.SiteMap({
                model: this.model,
            });
            this.$el.append(sideBar.render().el);
        },

        toggleMap: function() {
            this.isList = !this.isList;
            Dash.router.navigate('!' + this.model.get('URL') + '/sitemap/' + (this.isList ? 'list' : ''));
            this.render();
        }
    });

    Dash.SiteMap = Backbone.View.extend({
        render: function() {
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
            url = url + "/" + section.get("name");
            section.set('URL', Dash.urlEscape(url));
            if (section.get('_type') === 'section') {
                this.renderListItem(section);
                this.renderInnerMap(section);
            } else if (section.get('published') || Dash.admin) {
                this.renderListItem(section);
            }
        },

        renderInnerMap: function(section) {
            var map = new Dash.SiteMap.Map({
                model: section
            });
            this.$("li").last().append(map.render().el);
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

        renderSection: function(section, sectionFrom) {
            if (this.model.get('_type') === 'product') {
                section.set('currentProductName', this.model.get('name'));
            } else {
                section.set('currentProductName', this.model.get('currentProductName'));
            }
            if (!sectionFrom) {
                sectionFrom = this.model;
            }
            var url = sectionFrom.get('URL');
            url = url + "/" + section.get("name");
            section.set('URL', Dash.urlEscape(url));
            if (section.get('_type') === 'section') {
                var children = section.getChildren();
                children.each(function(child) {
                    this.renderSection(child, section);
                }, this);
            } else if (section.get('published') || Dash.admin) {
                section.set({
                    sectionName: sectionFrom.get('name'),
                    sectionURL: sectionFrom.get('URL')
                });
                this.renderListItem(section);
            }
        },

        renderListItem: function(item) {
            var listItem;
            listItem = new Dash.MapListItem({
                model: item
            });
            if (listItem) {
                this.$el.append(listItem.render().el);
            }
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

    Dash.View.Modal = Dash.View.extend({
        el: "#Modal",
    });

    Dash.View.Modal.Support = Dash.View.Modal.extend({
        template: Dash.Template.supportModal,

        events: {
            'click button.send': 'send',
            'click button.cancel': 'trash',
            'click .content': 'swallow',
            'click': 'trash',
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        send: function() {
            this.$('button.send').prop("disabled", true);
            var hash = {};
            hash.name = this.$('#name').val();
            // hash.to = {};
            // hash.to.address = this.$('#emailAddress').val();
            hash.emailAddress = this.$('#emailAddress').val();
            hash.message = this.$('#message').val();
            console.log(hash);
            Hoist.notify('support', hash, function() {}, function(res) {
                console.log('support notification failed');
            });
            this.trash();
        }

    });

    return Dash;
});