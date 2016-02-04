#coding=utf-8
from cgi import parse_qs, escape
# importing pyspatialite
from pyspatialite import dbapi2 as db
import time
import os
import math

DB_DIR = '/var/www/landscape/base/'
DB_FILE = 'landscape.sqlite'


def application(environ, start_response):
    status = '200 OK'
    d = parse_qs(environ['QUERY_STRING'])
    data = d['data'][0].split(',')
    id = int(data[0])
    db_file = DB_FILE
    res = getObject(id, db_file)
    if res != None:
        response = '{"result":true, "name":"' + res[0] + '", "sub_type":"' + res[1] + '","geometry":' + res[2] + ', "country":"' + res[3] + '", "id":' + str(res[4])+ ', "avg_lat":'+str(res[5])+', "avg_lng":'+str(res[6])+'}'
        #response = '{"incity":true, "city_name":"' + city[0] + '", "city_lastname":"' + city[1] + '"}'
    else:
        response = '{"result":false}'
    response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Access-Control-Allow-Origin', '*')]
    start_response(status, response_headers)
    return [response]

#получение записи объекта по id
def getObject(id, db_file):
    conn = db.connect(DB_DIR + db_file)
    cur = conn.cursor()
    sql = "SELECT id, geometry, name, sub_type, country, min_lat, min_lng, max_lat, max_lng FROM object WHERE id=" + str(id) 
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
    cur.close()
    conn.close()
    if id == -1:
        return None
    else:
        return (name, sub_type, geometry, country, id, (min_lat+max_lat)/2, (min_lng+max_lng)/2)
