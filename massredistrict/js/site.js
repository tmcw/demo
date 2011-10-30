var mm = com.modestmaps, map;
$(window).load(function() {
  wax.tilejson('http://d.tiles.mapbox.com/v2/mapbox.world-bright,tmcw.census-redistricting-massachusetts.jsonp',
    function(tj) {
      map = new mm.Map('map', new wax.mm.connector(tj));
      map.setCenterZoom(
       new mm.Location(
         41.9911,
         -71.73935
      ), 8);
      wax.mm.interaction(map, tj, { clickAction: [] });
      wax.mm.zoomer(map).appendTo($('#header')[0]);
    });
});
