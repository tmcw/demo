window.onload = function() {
  var canvas = document.getElementById('container'),
      ctx = canvas.getContext('2d'),
      gj = {};
  ctx.strokeStyle = '#000';
  var req = new window.XMLHttpRequest();

  var w = 6000,
      h = 6000;
  var max_delta;
  var yrotation = 0;
  var xrotation = 0;
  var me = 20037508.34;
  var mpi = w / (20037508.34 * 2);
  canvas.width = w;
  canvas.height = h;

  var D2R = Math.PI / 180,
      A = 6378137;

  function rectProject(ll) {
    // translate
    // var lat = ll[0] - 50;
    // -129
    return [
        A * ll[0] * D2R,
        A * Math.log(Math.tan((Math.PI*0.25) + (0.5 * ll[1] * D2R)))
    ];
  }

  /*
  var markers = function() {
    var m = [];
    for (var x = 0; x < w; x += 200) {
      for (var y = 0; y < h; y += 200) {
        m.push({
          x: x,
          y: y
        });
      }
    }
    return m;
  }();
  */

  var markers = [
    [38.94, -77]
  ];


  function draw() {
    canvas.width = w;
    ctx.lineWidth = 1;
    gj.features.forEach(function(f) {
      ctx.lineTo(
        (me + f.geometry.proj[0]) * mpi + (xrotation * (f.properties.delta / 100000000)),
        (me + f.geometry.proj[1]) * mpi + (yrotation * (f.properties.delta / 100000000))
      );
    });
    ctx.stroke();

    ctx.lineWidth = 0.5;

    markers.forEach(function(f) {
      ctx.closePath();
      ctx.beginPath();
      ctx.lineTo(
        (f.x),
        (f.y)
      );
      ctx.lineTo(
        (f.x) + (xrotation * (max_delta / 100000000)),
        (f.y) + (yrotation * (max_delta / 100000000))
      );
      ctx.stroke();
    });
  }

  var starty = 0;
  var startx = 0;
  var down = false;

  window.onmousedown = function(e) {
    down = true;
    starty= e.clientY;
    startx= e.clientX;
  };

  window.onmouseup = function(e) {
    down = false;
  };

  window.onmousemove = function(e) {
    if (!down) return;
    yrotation = (e.clientY - starty) / 100;
    xrotation = (e.clientX - startx) / 100;
    draw();
  };

  req.onreadystatechange = function(s) {
    if (this.readyState != 4) return;

    gj = JSON.parse(this.responseText);

    var first_time = 0;

    gj.features = gj.features.map(function(f) {
      f.properties.ut = +(new Date(f.properties.time));
      if (first_time === 0) {
        first_time = f.properties.ut;
        f.properties.delta = 0;
      } else {
        f.properties.delta = f.properties.ut - first_time;
      }
      max_delta = f.properties.delta;
      f.geometry.proj = rectProject(f.geometry.coordinates);
      return f;
    });

    draw();
  };
  req.open('GET', 'track_points.geojson', true);
  req.send();
};
