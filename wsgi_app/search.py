#coding=utf-8
from cgi import parse_qs, escape
# importing pyspatialite
from pyspatialite import dbapi2 as db
import time
import os
import math

import sys
abspath = os.path.dirname(__file__)
sys.path.append(abspath)
os.chdir(abspath)
import config

DB_DIR = config.DB_DIR
DB_FILE = 'landscape.sqlite'


def application(environ, start_response):
    status = '200 OK'
    d = parse_qs(environ['QUERY_STRING'])
    data = d['data'][0].split(',')
    print data
    point_lat = float(data[0])
    point_lng = float(data[1])
    db_file = DB_FILE
    res = searchObject(point_lat, point_lng, db_file)
    print res
    if res != None:
        response = '{"res":true, "name":"' + res[0] + '", "sub_type":"' + res[1] + '","geometry":' + res[2] + ', "country":"' + res[3] + '", "id":' + str(res[4])+ ', "avg_lat":'+str(res[5])+', "avg_lng":'+str(res[6])+', "scale":'+str(res[7])+', "eng_name":"'+str(res[8])+'"}'
    else:
        response = '{"res":false}'
    response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Access-Control-Allow-Origin', '*')]
    start_response(status, response_headers)
    return [response]

#определение пересечения точки с полигоном города и возврат в случае пересечения имени города и его полигона
def searchObject(point_lat, point_lng, db_file):
    conn = db.connect(DB_DIR + db_file)
    cur = conn.cursor()
    sql = "SELECT id, geometry, name, sub_type, country, min_lat, min_lng, max_lat, max_lng, scale, eng_name FROM object WHERE min_lng <= " + str(point_lng) + " AND min_lat <= " + str(point_lat) + " AND max_lng  >= " + str(point_lng) + " AND max_lat >= " + str(point_lat)
    id = -1
    res = cur.execute(sql)
    for rec in res:
        id = rec[0]
        geometry = rec[1].strip().encode('utf-8')
        name = rec[2].encode('utf-8')
        sub_type = rec[3].encode('utf-8')
        country = rec[4].encode('utf-8')
        min_lat = rec[5]
        min_lng = rec[6]
        max_lat = rec[7]
        max_lng = rec[8]
        scale = rec[9]
        eng_name = rec[10].encode('utf-8')
        point_geometry = '{"type":"Point","coordinates":[' + str(point_lng) + ',' + str(point_lat) + ']}'
        if id != -1:
            sql = "SELECT Intersects(GeomFromGeoJSON('" + geometry + "'),GeomFromGeoJSON('" + point_geometry + "'))"
            res2 = cur.execute(sql)
            in_obj = 0
            for rec2 in res2:
                print 're2c=' + str(rec2)
                in_obj = rec2[0]
                if in_obj == 1:
                    cur.close()
                    conn.close()
                    return (name, sub_type, geometry, country, id, (min_lat + max_lat) / 2, (min_lng + max_lng) / 2, scale, eng_name)

    cur.close()
    conn.close()
    return None
