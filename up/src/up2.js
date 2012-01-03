var w = 440, h = 600, tgutter = 20, gutter = 20, lgutter = 10, mm = com.modestmaps;

window.onload = function() {
  var req = new window.XMLHttpRequest();
  req.onreadystatechange = function(s) {
    if (this.readyState != 4) return;
    var pts = JSON.parse(this.responseText);
    var chart = d3.select('#container')
      .append("svg:svg")
      .attr('class', 'chart')
      .attr('width', w)
      .attr('height', h);

    var l = d3.scale.linear().domain(
      [d3.min(pts.features, function(p) {
        return p.geometry.coordinates[0];
      }),
      d3.max(pts.features, function(p) {
        return p.geometry.coordinates[0];
      })])
      .range([lgutter, w]);

    var t = d3.time.scale().domain(
      [d3.min(pts.features, function(p) {
        return new Date(p.properties.time);
      }),
      d3.max(pts.features, function(p) {
        return new Date(p.properties.time);
      })])
      .range([tgutter, h - gutter]);

    var lines = [
      [-77, 'DC'],
      [-74, 'NJ'],
      [-81.5, 'OH'],
      [-105, 'Denver'],
      [-122.3, 'SF']];

   var tj = {"center":[0,0,4],"scheme":"xyz","bounds":[-180,-85.05,180,85.05],"minzoom":0,"maxzoom":8,"tiles":[
       "http://a.tiles.mapbox.com/v3/mapbox.world-bright/{z}/{x}/{y}.png",
       "http://b.tiles.mapbox.com/v3/mapbox.world-bright/{z}/{x}/{y}.png",
       "http://c.tiles.mapbox.com/v3/mapbox.world-bright/{z}/{x}/{y}.png",
       "http://d.tiles.mapbox.com/v3/mapbox.world-bright/{z}/{x}/{y}.png"
   ]};

   var map = new mm.Map('map', new wax.mm.connector(tj));

   map.setZoom(8);

   chart.append('svg:rect')
      .attr('class', 'bg')
      .attr('height', h - tgutter - gutter)
      .attr('y', tgutter)
      .attr('x', lgutter)
      .attr('width', w - lgutter);

   chart.selectAll('line.lat')
      .data(l.ticks(5))
      .enter()
      .append('svg:line')
      .attr('class', 'lat')
      .attr('y2', h - gutter)
      .attr('x1', function(d) {
        return ~~l(d) + 0.5;
      })
      .attr('x2', function(d) {
        return ~~l(d) + 0.5;
      })
      .attr('y1', tgutter);

   chart.selectAll('line.timeline')
      .data(t.ticks(10))
      .enter()
      .append('svg:line')
      .attr('class', 'timeline')
      .attr('x1', lgutter)
      .attr('x2', w)
      .attr('y1', function(d) {
        return t(d) + 0.5;
      })
      .attr('y2', function(d) {
        return t(d) + 0.5;
      });

   chart.selectAll('text.timeline')
      .data(t.ticks(10))
      .enter()
      .append('svg:text')
      .attr('class', 'timeline')
      .attr('width', w)
      .attr('height', 1)
      .attr('x', lgutter - 10)
      .attr('y', function(d) {
        return t(d) + 4;
      })
      .text(function(d) {
        return t.tickFormat(10)(d);
      });

   chart.selectAll('line.marker')
      .data(lines)
      .enter()
      .append('svg:line')
      .attr('class', 'marker')
      .attr('x1', function(d) {
        return ~~l(d[0]);
      })
      .attr('y1', tgutter)
      .attr('y2', h - gutter)
      .attr('x2', function(d) {
        return ~~l(d[0]);
      });

   chart.append('svg:rect')
      .attr('class', 'marker-bottom')
      .attr('width', w - lgutter)
      .attr('height', 1)
      .attr('x', lgutter)
      .attr('y', h - 20);

  chart.append('svg:rect')
      .attr('class', 'marker-top')
      .attr('width', w - lgutter)
      .attr('height', 1)
      .attr('x', lgutter)
      .attr('y', tgutter);

   chart.selectAll('text.lat')
      .data(l.ticks(5))
      .enter()
      .append('svg:text')
      .attr('class', 'lat')
      .attr('x', function(d) {
        return ~~l(d);
      })
      .attr('y', tgutter - 5)
      .attr('text-anchor', 'middle')
      .text(function(d) {
        return d;
      });

   chart.selectAll('text.marker')
      .data(lines)
      .enter()
      .append('svg:text')
      .attr('class', 'marker')
      .attr('text-anchor', 'middle')
      .attr('x', function(d) {
        return ~~l(d[0]);
      })
      .attr('y', h - 5)
      .text(function(d) {
        return d[1];
      });

    chart.append('svg:path')
      .attr('class', 'strongptpath')
      .attr('d', p = d3.svg.line()
        .x(function(d,i) {
            return ~~l(d.geometry.coordinates[0]);
        })
        .y(function(d) {
            return ~~t(new Date(d.properties.time));
        })(pts.features));

     var playerline = chart.append('svg:rect')
        .attr('class', 'play')
        .attr('x', lgutter)
        .attr('height', 2)
        .attr('width', w - lgutter)
        .attr('y', 100);

     var playertext = chart.append('svg:text')
        .attr('class', 'playtext')
        .attr('x', lgutter + 10)
        .attr('y', 100);

     var times = pts.features.map(function(p) {
         return new Date(p.properties.time);
     });

     chart.on('mousemove', function() {
         var mousey = d3.svg.mouse(this)[1];
         playerline
            .attr('y', mousey);

        playertext
            .attr('y', mousey - 10)
            .text(function() {
                return d3.time.format('%B %e')(t.invert(mousey));
            });

        var idx = d3.bisect(times, t.invert(mousey));
        var feat = pts.features[idx];
        easey.slow(map, {
           location: new mm.Location(
               feat.geometry.coordinates[1],
               feat.geometry.coordinates[0]
            ),
            zoom: 8
        });
     });

     map.setCenter(new mm.Location(
        pts.features[0].geometry.coordinates[1],
        pts.features[0].geometry.coordinates[0]
     ));

     d3.select('#map')
        .append('div')
        .attr('class', 'me-shadow');

     d3.select('#map')
        .append('div')
        .attr('class', 'me');
  };
  req.open('GET', 'track_points.geojson', true);
  req.send();
};
