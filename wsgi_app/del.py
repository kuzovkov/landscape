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
    print d
    data = d['data'][0].split(',')
    id = int(data[0])
    db_file = DB_FILE
    res = delObject(id, db_file)
    if res != None:
        response = '{"incity":true}'
        #response = '{"incity":true, "city_name":"' + city[0] + '", "city_lastname":"' + city[1] + '"}'
    else:
        response = '{"incity":false}'
    response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Access-Control-Allow-Origin', '*')]
    start_response(status, response_headers)
    return [response]

#удаление объекта из базы по id
def delObject(id, db_file):
    conn = db.connect(DB_DIR + db_file)
    cur = conn.cursor()
    sql = "DELETE FROM city WHERE id=" + str(id)
    res = cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    return res
