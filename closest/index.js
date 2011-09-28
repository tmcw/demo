var voronoi = require('./voronoi');

function polygonsToGeoJSON(vertices, geojson) {
    return {
        type: 'FeatureCollection',
        features: vertices.map(function(v, i) {
            return {
                type: 'Feature',
                properties: geojson.features[i].properties,
                geometry: {
                    type: 'Polygon',
                    coordinates: [v]
                }
            };
        })
    };
}

function clipExtremes(geojson) {
    return {
        type: 'FeatureCollection',
        features: geojson.features.map(function(f) {
            return {
                type: 'Feature',
                properties: f.properties,
                geometry: {
                    type: 'Polygon',
                    coordinates: [f.geometry.coordinates[0].map(function(c) {
                        return [
                            Math.max(Math.min(c[0], 179), -179),
                            Math.max(Math.min(c[1], 89), -89)
                        ];
                    })]
                }
            };
        })
    };
}

                    



function GeoJSONToVertices(geojson) {
    return geojson.features.map(function(f) {
        return f.geometry.coordinates;
    });
}

function closest(geojson) {
    var vertices = GeoJSONToVertices(geojson);
    var voronoiPolygons = voronoi(vertices);
    return clipExtremes(polygonsToGeoJSON(voronoiPolygons, geojson));
}

module.exports = closest;
