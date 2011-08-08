// GridInstance
// ------------
// GridInstances are queryable, fully-formed
// objects for acquiring features from events.
wax.GridInstance = function(grid_tile, formatter, options) {
    options = options || {};
    // resolution is the grid-elements-per-pixel ratio of gridded data.
    // The size of a tile element. For now we expect tiles to be squares.
    var instance = {},
        resolution = options.resolution || 4;
        tileSize = options.tileSize || 256;

    // Resolve the UTF-8 encoding stored in grids to simple
    // number values.
    // See the [utfgrid section of the mbtiles spec](https://github.com/mapbox/mbtiles-spec/blob/master/1.1/utfgrid.md)
    // for details.
    function resolveCode(key) {
        if (key >= 93) key--;
        if (key >= 35) key--;
        key -= 32;
        return key;
    }

    instance.getFeatureAtOffset = function(x, y) {
        if (!(grid_tile && grid_tile.grid)) return;

        var res = resolution;

        // This tile's resolution. larger tiles will have lower,
        // aka coarser, resolutions
        if ((y < 0) || (x < 0)) return;
        if ((Math.floor(y) > tileSize) ||
            (Math.floor(x) > tileSize)) return;
        // Find the key in the grid. The above calls should ensure that
        // the grid's array is large enough to make this work.
        var key = grid_tile.grid[
           Math.floor((y) / res)
        ].charCodeAt(
           Math.floor((x) / res)
        );

        key = resolveCode(key);

        if (grid_tile.keys[key] && grid_tile.data[grid_tile.keys[key]]) {
            return grid_tile.data[grid_tile.keys[key]];
        }
    };


    // Get a feature:
    //
    // * `x` and `y`: the screen coordinates of an event
    // * `tile_element`: a DOM element of a tile, from which we can get an offset.
    // * `options` options to give to the formatter: minimally having a `format`
    //   member, being `full`, `teaser`, or something else.
    instance.getFeature = function(x, y, tile_element, options) {
        if (!(grid_tile && grid_tile.grid)) return;

        // IE problem here - though recoverable, for whatever reason
        var offset = wax.util.offset(tile_element),
            tileX = offset.left,
            tileY = offset.top,
            res = (offset.width / tileSize) * resolution;

        // This tile's resolution. larger tiles will have lower, aka coarser, resolutions
        if ((y - tileY < 0) || (x - tileX < 0)) return;
        if ((Math.floor(y - tileY) > tileSize) ||
            (Math.floor(x - tileX) > tileSize)) return;
        // Find the key in the grid. The above calls should ensure that
        // the grid's array is large enough to make this work.
        var key = grid_tile.grid[
           Math.floor((y - tileY) / res)
        ].charCodeAt(
           Math.floor((x - tileX) / res)
        );

        key = resolveCode(key);

        // If this layers formatter hasn't been loaded yet,
        // download and load it now.
        if (grid_tile.keys[key] && grid_tile.data[grid_tile.keys[key]]) {
            return formatter.format(options, grid_tile.data[grid_tile.keys[key]]);
        }
    };

    return instance;
};
