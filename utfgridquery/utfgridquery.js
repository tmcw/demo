(function(context) {
    var s = new SphericalMercator();
    var savedD = false;

    function utfgridquery(tilejson, point, callback) {
      function getTile(d) {
        savedD = d;
        var xy = s.px([
          point.lon, point.lat], d.maxzoom, true);

        var y = (Math.pow(2, d.maxzoom) - 1) -
            Math.floor(xy[1] / 256);

        var gurl = d.grids[0]
          .replace('{z}', d.maxzoom)
          .replace('{x}', Math.floor(xy[0] / 256))
          .replace('{y}', y);

        wax.request.get(gurl, function(err, t) {
            var g = wax.GridInstance(t);
            var f = g.gridFeature(
                (xy[0] / 256) % 256,
                (xy[1] / 256) % 256);
            callback(f);
        });
      }
      if (!savedD) {
          wax.tilejson(tilejson, getTile);
      } else {
          getTile(savedD);
      }
    }
    context.utfgridquery = utfgridquery;
})(this);
