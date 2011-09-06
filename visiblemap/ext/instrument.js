var instrumentHub = new com.modestmaps.CallbackManager(null,
    ['grid', 'offset', 'key', 'feature', 'featureHTML']);

var gridUrl = function(url) {
    return url.replace(/(\.png|\.jpg|\.jpeg)(\d*)/, '.grid.json');
};



wax.GridManager = _.wrap(wax.GridManager, function(f, x) {
    var gm = f(x);
    gm.getGrid = _.wrap(gm.getGrid, function(g, url, callback) {
        var gurl = gridUrl(url);
        wax.request.get(gurl, function(err, t) {
            if (err) return;
            instrumentHub.dispatchCallback('grid', {
                instance: wax.GridInstance(t, f, {
                    resolution: 4
                }),
                url: gurl
            });
        });
        g(url, callback);
    });
    return gm;
});

wax.GridInstance = _.wrap(wax.GridInstance,
    function(GridInstance, grid_tile, formatter, options) {
        var gi = GridInstance(grid_tile, formatter, options);
        gi.tileFeature = _.wrap(gi.tileFeature,
            function(g, x, y, tile_element, options) {
                var f = g.apply(gi, [x, y, tile_element, options]);
                var offset = wax.util.offset(tile_element);
                instrumentHub.dispatchCallback('offset', {
                    offset: offset,
                    mouseOffset: [x, y],
                    tile_element: tile_element
                });

                var gt = gi.grid_tile();
                var resolution = 4;
                var x2 = x - offset.left,
                    y2 = y - offset.top;

                var key = gt.grid[
                   Math.floor((y2) / resolution)
                ][
                   Math.floor((x2) / resolution)
                ];

                instrumentHub.dispatchCallback('key', key);

                var feature = gi.gridFeature(x2, y2);
                instrumentHub.dispatchCallback('feature', feature);
                instrumentHub.dispatchCallback('featureHTML', f);
                return f;
            });
        return gi;
    }
);
