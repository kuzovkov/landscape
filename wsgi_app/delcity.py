#coding=utf-8
from cgi import parse_qs, escape
# importing pyspatialite
from pyspatialite import dbapi2 as db
import time
import os
import math

DB_DIR = '/home/user1/game1/db/'
PLACES_DB_FILE = 'places.sqlite'
CITY_DB_FILE = 'city.sqlite'
MIN_RAST = 0.05

def application(environ, start_response):
    status = '200 OK'
    d = parse_qs(environ['QUERY_STRING'])
    data = d['data'][0].split(',')
    id = int(data[0])
    db_file = CITY_DB_FILE
    res = delCity(id, db_file)
    if res != None:
        response = '{"incity":true}'
        #response = '{"incity":true, "city_name":"' + city[0] + '", "city_lastname":"' + city[1] + '"}'
    else:
        response = '{"incity":false}'
    response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Access-Control-Allow-Origin', '*')]
    start_response(status, response_headers)
    return [response]

#определение пересечения точки с полигоном города и возврат в случае пересечения имени города и его полигона
def delCity(id, db_file):
    conn = db.connect(DB_DIR + db_file)
    cur = conn.cursor()
    sql = "DELETE FROM city WHERE id=" + str(id)
    res = cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    return res

#нахождение населенных пунктов центры которых удалены на расстояние не более заданного от заданной точки
#в случае нахождения возврат названия и геометрии ближайшего населенного пункта
def getPlace(point_lat, point_lng):
    conn = db.connect(DB_DIR + PLACES_DB_FILE)
    cur = conn.cursor()
    sql = "SELECT id, place_name, place_type, geometry, lat, lng, country, Distance(GeomFromGeoJSON(geometry), MakePoint("+str(point_lng)+","+str(point_lat)+")) as rast from place where Distance(GeomFromGeoJSON(geometry), MakePoint("+str(point_lng)+","+str(point_lat)+")) < " + str(min_rast)
    res = cur.execute(sql)
    places = []
    for rec in res:
        place = {}
        place['id'] = rec[0]
        place['place_name'] = rec[1].encode('utf-8')
        place['place_type'] = rec[2].encode('utf-8')
        place['place_geometry'] = rec[3].encode('utf-8')
        place['rast'] = rec[7]
        places.append(place)
    if len(places) == 0:
        return None
    else:
        places.sort(key = lambda x: x['rast'])
        return (places[0]['place_name'], places[0]['place_type'], places[0]['place_geometry'])