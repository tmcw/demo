from shapely.geometry import MultiLineString
from osgeo import ogr

maze_text = open('maze_complex.txt').read()
height = float(len(maze_text.split('\n')))
width = float(len(maze_text.split('\n')[0]))

lon = -175.0
lonwidth = 350.0
lonbreak = (lonwidth / width)

lat = -70.0
latwidth = 150.0
latbreak = (latwidth / height)

walls = []

for line in maze_text.split('\n'):
    for char in line:
        if char == '-':
            walls.append(((lon - (lonbreak), lat), (lon + (lonbreak), lat)))
        if char == '|':
            walls.append(((lon, lat - (latbreak)), (lon, (lat + (latbreak)))))
        lon = lon + lonbreak
    lat = lat + latbreak
    lon = -175.0

# for w in walls:
#     print w
    # print w[0]

shpdriver = ogr.GetDriverByName('ESRI Shapefile')
ds = shpdriver.CreateDataSource('maze_complex')
lyr = ds.CreateLayer('first')

wallsLine = MultiLineString(walls)
geom = ogr.CreateGeometryFromWkb(wallsLine.wkb)
feat = ogr.Feature(lyr.GetLayerDefn())
feat.SetGeometry(geom)
lyr.CreateFeature(feat)
