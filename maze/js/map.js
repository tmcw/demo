$.domReady(function() {
    var mm = com.modestmaps;

    wax.tilejson('http://d.tiles.mapbox.com/tmcw/1.0.0/tmcw.maze/layer.json',
        function(tilejson) {

        var map = new mm.Map('map', new wax.mm.connector(tilejson));

        wax.mm.interaction(map, tilejson);

        map.setCenterZoom(new mm.Location(0, 0), 1);
        window.setTimeout(function() {
            easey.slow(map, 5);
        }, 1000);
    });
});
