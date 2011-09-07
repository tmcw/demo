build:
	rm -rf maze_complex first_merc
	node maze.js > maze_complex.txt
	python generate.py
	cd maze_complex
	ogr2ogr -s_srs EPSG:4326 -t_srs EPSG:900913 first_merc maze_complex/first.shp
	shapeindex first_merc/first.shp
	zip -r first_merc.zip first_merc/*

PHONY: build
