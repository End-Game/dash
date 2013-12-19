    Hoist.get("article", function(res) {
            app.dash.articles = new app.dash.Sections(res);
            console.log(app.dash.articles);
            Hoist.get("section", function(res) {
                app.dash.sections = new app.dash.Sections(res, {
                    parse: true
                });
                console.log(app.dash.sections);
                Hoist.get("product", function(res) {
                    app.dash.products = new app.dash.Products(res, {
                        parse: true
                    });
                    console.log(app.dash.products);
                }, function(res) {
                    console.log('product get unsuccessful: ' + res);
                }, this);
            }, function(res) {
                console.log('section get unsuccessful: ' + res);
            }, this);
        },
        function(res) {
            console.log('article get unsuccessful: ' + res);
        }, this);


    // silly silly posts inside a for each loop
    app.dash.articles.each(function(article) {
        Hoist.post("article", article, function(res) {
            article.set("_id", res[0]._id);
            app.dash.sections.each(function(section) {
                Hoist.post("section", section, function(res) {
                    section.set("_id", res[0]._id);
                    app.dash.products.each(function(product) {
                        Hoist.post("product", product, function(res) {
                            product.set("_id", res[0]._id);
                        }, function(res) {
                            console.log('product post unsuccessful: ' + res);
                        }, this);
                    });
                }, function(res) {
                    console.log('section post unsuccessful: ' + res);
                }, this);
            });
        }, function(res) {
            console.log('article post unsuccessful: ' + res);
        }, this);
    });