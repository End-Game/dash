define(['dash', 'backbone', 'hoist', 'views'], function(Dash, Backbone, hoist) {
    'use strict';
    /*
    views needed:
    home
    product help desk
    article
    sitemap
    new article
    setup product - modal
    place tree - modal - when making an article
*/

    Dash.CheckboxItem = Dash.ListItem.extend({
        template: _.template($("#checkboxProductTemplate").html()),
    });

    Dash.View.Admin = Dash.View.extend({

    });

    Dash.View.Admin.Home = Dash.View.Home.extend({
        template: _.template($("#adminHomeTemplate").html()),

        events: {
            "click button": "addProduct",
        },

        renderProduct: function(item) {
            var homeProductView = new Dash.HomeProductView({
                model: item
            });
            if (this.productCount < 3) {
                this.$("#products").append(homeProductView.render().el);
            } else {
                // this.$("#products").after(homeProductView.render().el);
            }
            this.productCount++;
            console.log(this.productCount);
        },

        addProduct: function() {
            new Dash.View.Modal.ProductSetup();
        }
    });

    Dash.View.Admin.HelpDesk = Dash.View.HelpDesk.extend({

        renderSidebar: function() {
            this.$('.adminSideBar').empty();
            var sideBar = new Dash.AdminSideBar.Product({
                model: this.model
            });
            this.$el.append(sideBar.render().el);
        }
    });

    Dash.View.Admin.Article = Dash.View.Article.extend({

    });

    Dash.View.Admin.Section = Dash.View.Section.extend({

    });

    Dash.View.Admin.NewArticle = Dash.View.Admin.extend({
        el: "#Article",
        template: _.template($("#newArticleTemplate").html()),

        events: {
            'click button.save': 'save'
        },

        render: function() {
            this.$el.html(this.template());
            this.renderSidebar();
            return this;
        },

        renderSidebar: function() {
            this.$('.sideBar').empty();
            var sideBar = new Dash.SideBar.NewArticle();
            this.$el.append(sideBar.render().el);
        },

        save: function() {
            var article = new Dash.Article();

        }
    });

    Dash.SideBar.NewArticle = Dash.SideBar.extend({
        template: _.template($("#newArticleSideBarTemplate").html()),
        id: "newArticleSideBar",

        events: {
            'keydown #tagName': 'keydown',
            'click #productList input': 'checkProduct',
            'click #productList button': 'treePlace',
        },

        render: function() {
            this.$el.html(this.template());
            this.renderProducts();
            this.$('li div').hide();
            return this;
        },

        renderProducts: function() {
            //render each product into productList
            var that = this;
            Dash.products.each(function(product) {
                that.renderCheckboxItem(product, "#productList");
            });
        },

        renderCheckboxItem: function(item, tag) {
            var checkboxItem = new Dash.CheckboxItem({
                model: item
            });
            this.$(tag).append(checkboxItem.render().el);
        },

        keydown: function(e) {
            if (e.which === 13) {
                this.addTag();
                e.preventDefault();
            }
        },

        checkProduct: function(e) {
            var input = e.target;
            var productName = input.nextSibling.textContent;
            var li = input.parentElement.parentElement;
            this.$(li).find('div').toggle();
        },
        
        treePlace: function(e){
            var productName = $(e.target.parentElement.parentElement).find('label')[0].innerText;
            var product = Dash.products.findWhere({name: productName});
            console.log(product);
            // pop up modal
            new Dash.View.Modal.TreePlace({
                model: product
            });
        },

        addTag: function() {
            var input = this.$('#tagName');
            var tag = new Dash.Tag({
                name: input.val()
            });
            input.val('');
            if (!this.tags) {
                this.tags = [];
            }
            this.tags.push(tag);
            console.log(this.tags);
        },
    });

    Dash.AdminSideBar = Dash.SideBar.extend({
        className: "adminSideBar"
    });

    Dash.AdminSideBar.Product = Dash.AdminSideBar.extend({
        template: _.template($("#adminProductSideBarTemplate").html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            'click button#newSection': 'newSection',
            'click button#newArticle': 'newArticle',
            'click button#productSettings': 'settings',
            'click button#personalise': 'personalise',
        },

        newSection: function() {},

        newArticle: function() {
            Dash.router.navigate("newArticle");
            var that = this;
            new Dash.View.Admin.NewArticle();
        },

        settings: function() {},

        personalise: function() {},

    });

    Dash.View.Modal = Dash.View.extend({
        el: "#Modal",
    });

    Dash.View.Modal.ProductSetup = Dash.View.Modal.extend({
        template: _.template($("#productSetupTemplate").html()),

        events: {
            'click button.save': 'save',
            'click .content': 'swallow',
            'click': 'trash'
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        save: function() {
            var product = new Dash.Product({
                name: this.$('#name').val(),
                description: this.$('#description').val(),
                shortDescription: this.$('#description').val(),
            });
            Hoist.post("product", product.toJSON(), function(res) {
                product.set("_id", res[0]._id);
                Dash.products.add(product);
                this.trash();
            }, function(res) {
                console.log('product post unsuccessful: ' + res);
            }, this);
        },

    });
    
    Dash.View.Modal.TreePlace = Dash.View.Modal.extend({
        template: _.template($("#treePlaceTemplate").html()),
        
        events: {
            'click button.save': 'save',
            'click .content': 'swallow',
            'click': 'trash',
            'click .map a': 'select',
        },
        
        render: function() {
            this.$el.html(this.template());
            this.renderTree();
            return this;
        },
        
        renderTree: function(){
            var map = new Dash.SiteMap.Map({
                model: this.model
            });
            this.$('.map').append(map.render().el);
            return this;
        },
        
        save: function(){
            
        },
        
        select: function(e){
            e.preventDefault();
            console.log(e);
            var link = e.target;
            console.log(link);
            this.$('a').removeClass('themeText');
            this.$(link).addClass('themeText');
        },
    });
});