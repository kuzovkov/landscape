#coding=utf-8
from cgi import parse_qs, escape
# importing pyspatialite
from pyspatialite import dbapi2 as db
import time
import os
import math

DB_DIR = '/home/www/landscape/base/'
DB_FILE = 'landscape.sqlite'


def application(environ, start_response):
    status = '200 OK'
    db_file = DB_FILE
    listobj = getListObject(db_file)
    if listobj != None:
        response = '{"obj_list":[' + ','.join(listobj) + ']}'
        
    else:
        response = '{"obj_list":[]}'
    response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Access-Control-Allow-Origin', '*')]
    start_response(status, response_headers)
    return [response]

#определение пересечения точки с полигоном объекта и возврат в случае пересечения имени объекта и его полигона
def getListObject(db_file):
    conn = db.connect(DB_DIR + db_file)
    cur = conn.cursor()
    sql = "SELECT id, geometry, name, sub_type, country, min_lat, min_lng, max_lat, max_lng FROM object ORDER BY name" 
    res = cur.execute(sql)
    objlist = []
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
        item = '{"incity":true, "city_name":"' + city_name + '", "city_lastname":"' + city_lastname + '","city_geometry":' + city_geometry + ', "city_country":"' + city_country + '", "id":' + str(id)+ ', "avg_lat":'+str((min_lat+max_lat)/2)+', "avg_lng":'+str((min_lng+max_lng)/2)+'}'
        objlist.append(item);
    cur.close()
    conn.close()
    if len(objlist) == 0:
        return None
    else:
        return citylist
