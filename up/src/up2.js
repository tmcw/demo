var w = 640, h = 600, gutter = 20;
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
      })]);

    var t = d3.time.scale().domain(
      [d3.min(pts.features, function(p) {
        return new Date(p.properties.time);
      }),
      d3.max(pts.features, function(p) {
        return new Date(p.properties.time);
      })]);

    var lines = [
      [-77, 'DC'],
      [-74, 'NJ'],
      [-81.5, 'OH'],
      [-105, 'Denver'],
      [-122.3, 'SF']];

   chart.append('svg:rect')
      .attr('class', 'bg')
      .attr('height', h - gutter * 2)
      .attr('y', gutter)
      .attr('width', w);

   chart.selectAll('line.lat')
      .data(l.ticks(10))
      .enter()
      .append('svg:line')
      .attr('class', 'lat')
      .attr('y2', h - gutter)
      .attr('x1', function(d) {
        return ~~(l(d) * w) + 0.5;
      })
      .attr('x2', function(d) {
        return ~~(l(d) * w) + 0.5;
      })
      .attr('y1', gutter)
      .text(function(d) {
        return d;
      });

   chart.selectAll('line.timeline')
      .data(t.ticks(10))
      .enter()
      .append('svg:line')
      .attr('class', 'timeline')
      .attr('x1', 0)
      .attr('x2', w)
      .attr('y1', function(d) {
        return ~~(t(d) * h) + 0.5;
      })
      .attr('y2', function(d) {
        return ~~(t(d) * h) + 0.5;
      });

   chart.selectAll('text.timeline')
      .data(t.ticks(10))
      .enter()
      .append('svg:text')
      .attr('class', 'timeline')
      .attr('width', w)
      .attr('height', 1)
      .attr('x', 10)
      .attr('y', function(d) {
        return ~~(t(d) * h) - 5;
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
        return ~~(l(d[0]) * w);
      })
      .attr('y1', gutter)
      .attr('y2', h - gutter)
      .attr('x2', function(d) {
        return ~~(l(d[0]) * w);
      });

   chart.append('svg:rect')
      .attr('class', 'marker-bottom')
      .attr('width', w)
      .attr('height', 1)
      .attr('x', 0)
      .attr('y', h - 20);

  chart.append('svg:rect')
      .attr('class', 'marker-bottom')
      .attr('width', w)
      .attr('height', 1)
      .attr('x', 0)
      .attr('y', gutter);

   chart.selectAll('text.lat')
      .data(l.ticks(10))
      .enter()
      .append('svg:text')
      .attr('class', 'lat')
      .attr('x', function(d) {
        return ~~(l(d) * w);
      })
      .attr('y', 15)
      .text(function(d) {
        return d;
      });

   chart.selectAll('text.marker')
      .data(lines)
      .enter()
      .append('svg:text')
      .attr('class', 'marker')
      .attr('x', function(d) {
        return ~~(l(d[0]) * w) + 4;
      })
      .attr('y', h - 5)
      .text(function(d) {
        return d[1];
      });

    chart.append('svg:path')
      .attr('class', 'ptpath')
      .attr('d', p = d3.svg.line()
        .x(function(d,i) {
            return w * l(d.geometry.coordinates[0]);
        })
        .y(function(d) {
            return (h - gutter * 2) * t(new Date(d.properties.time)) + gutter;
        })(pts.features));

    chart.selectAll('rect.pt')
      .data(pts.features)
      .enter()
      .append('svg:rect')
      .attr('class', 'pt')
      .attr('width', 2)
      .attr('height', 2)
      .attr('x', function(d) {
        return ~~(l(d.geometry.coordinates[0]) * w);
      })
      .attr('y', function(d) {
        return gutter + ~~(t(new Date(d.properties.time)) * (h - gutter * 2));
      });



  };
  req.open('GET', 'track_points.geojson', true);
  req.send();
};
