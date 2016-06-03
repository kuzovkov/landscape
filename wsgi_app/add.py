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
    try:
        request_body_size = int(environ.get('CONTENT_LENGTH', 0))
    except (ValueError):
        request_body_size = 0
    request_body = environ['wsgi.input'].read(request_body_size)
    d = parse_qs(request_body)
    data = d['data'][0].split('|')
    name = data[0]
    sub_type = data[1]
    country = data[2]
    geometry = data[3]
    db_file = DB_FILE
    res = addObject(name, sub_type, country, geometry, db_file)
    if res != None:
        response = '{"result":true, "name":"' + res[0] + '", "sub_type":"' + res[1] + '","geometry":' + res[2] + ', "country":"' + res[3] + '", "id":' + str(res[4])+ ', "avg_lat":'+str(res[5])+', "avg_lng":'+str(res[6])+'}'
    else:
        response = '{"result":false}'
    response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Access-Control-Allow-Origin', '*')]
    start_response(status, response_headers)
    return [response]

#фильтрация строки
def filterString(name):
    if name.isalnum():
        return name
    char_list = []
    for ch in name:
        if ch.isalnum() or ch in [" ", "-"]:
            char_list.append(ch)
    name = "".join(char_list)
    return name

#добавление города в базу
def addObject(name, sub_type, country, geometry, db_file):
    conn = db.connect(DB_DIR + db_file)
    cur = conn.cursor()
    sql = "SELECT MbrMinX(GeomFromGeoJSON('"+ geometry +"')) as min_lng, MbrMinY(GeomFromGeoJSON('"+ geometry +"')) as min_lat, MbrMaxX(GeomFromGeoJSON('"+ geometry +"')) as max_lng, MbrMaxY(GeomFromGeoJSON('"+ geometry +"')) as max_lat"
    print sql
    res = cur.execute(sql)
    for rec in res:
        print rec
        min_lng = rec[0]
        min_lat = rec[1]
        max_lng = rec[2]
        max_lat = rec[3]
    name = filterString(name)
    if len(name) == 0:
        return None
    sql = "INSERT INTO object (name, sub_type, geometry, min_lng, min_lat, max_lng, max_lat, country) VALUES('"+name+"', '"+sub_type+"', '"+geometry+"'," + str(min_lng) + "," + str(min_lat) + "," + str(max_lng) + "," + str(max_lat) + ", '" + country + "')"
    print sql
    cur.execute(sql)
    conn.commit()
    sql = "SELECT id, geometry, name, sub_type, country, min_lat, min_lng, max_lat, max_lng FROM city WHERE name='" + name +"'"
    id = -1
    res = cur.execute(sql)
    for rec in res:
        id = rec[0]
        city_geometry = rec[1].strip().encode('utf-8')
        city_name = rec[2].encode('utf-8')
        city_lastname = rec[3].encode('utf-8')
        city_country = rec[4].encode('utf-8')
        min_lat = rec[5]
        min_lng = rec[6]
        max_lat = rec[7]
        max_lng = rec[8]
    if id == -1:
        return None
    else:
        return (name, sub_type, geometry, country, id, (min_lat+max_lat)/2, (min_lng+max_lng)/2)
