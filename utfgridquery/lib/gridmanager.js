// GridManager
// -----------
// Generally one GridManager will be used per map.
//
// It takes one options object, which current accepts a single option:
// `resolution` determines the number of pixels per grid element in the grid.
// The default is 4.
wax.GridManager = function(options) {
    options = options || {};

    var resolution = options.resolution || 4,
        grid_tiles = {},
        manager = {},
        formatter;

    var formatterUrl = function(url) {
        return url.replace(/\d+\/\d+\/\d+\.\w+/, 'layer.json');
    };

    var gridUrl = function(url) {
        return url.replace(/(\.png|\.jpg|\.jpeg)(\d*)/, '.grid.json');
    };

    function getFormatter(url, callback) {
        if (typeof formatter !== 'undefined') {
            return callback(null, formatter);
        } else {
            wax.request.get(formatterUrl(url), function(err, data) {
                if (data && data.formatter) {
                    formatter = wax.formatter(data.formatter);
                } else {
                    formatter = false;
                }
                return callback(err, formatter);
            });
        }
    }

    function templatedGridUrl(template) {
        if (typeof template === 'string') template = [template];
        return function templatedGridFinder(url) {
            if (!url) return;
            var xyz = /(\d+)\/(\d+)\/(\d+)\.[\w\._]+/g.exec(url);
            if (!xyz) return;
            return template[parseInt(xyz[2], 10) % template.length]
                .replace('{z}', xyz[1])
                .replace('{x}', xyz[2])
                .replace('{y}', xyz[3]);
        };
    }

    manager.formatter = function(x) {
        if (!arguments.length) return formatter;
        formatter =  wax.formatter(x);
        return manager;
    };

    manager.formatterUrl = function(x) {
        if (!arguments.length) return formatterUrl;
        formatterUrl = typeof x === 'string' ?
            function() { return x; } : x;
        return manager;
    };

    manager.gridUrl = function(x) {
        if (!arguments.length) return gridUrl;
        gridUrl = typeof x === 'function' ?
            x : templatedGridUrl(x);
        return manager;
    };

     manager.getGrid = function(url, callback) {
        getFormatter(url, function(err, f) {
            var gurl = gridUrl(url);
            if (err || !f || !gurl) return callback(err, null);

            wax.request.get(gurl, function(err, t) {
                if (err) return callback(err, null);
                callback(null, wax.GridInstance(t, f, {
                    resolution: resolution || 4
                }));
            });
        });
        return manager;
    };

    if (options.formatter) manager.formatter(options.formatter);
    if (options.grids) manager.gridUrl(options.grids);

    return manager;
};
