#coding:utf-8
__author__ = 'kojima37'
import json
from pprint import pprint
import psycopg2


def getJson(filePath=None):
    jsonData = None
    if filePath:
        with open(filePath) as f:
            jsonData = json.load(f)
            #print json.dumps(jsonData, sort_keys = True, indent = 4)

    if jsonData:
        nameMap = dict()
        geoMetriesList = jsonData['objects']['hokkaido']['geometries']
        for elem in geoMetriesList:
            key = elem.get('id')
            if key:
                if nameMap.get(key):
                    nameMap[key]+=1
                else:
                    nameMap[key]=1

        #for k in nameMap.keys():
        #    print k

        dataToInsert = {}
        for id, name in enumerate(nameMap.keys()):
            dataToInsert['hokkaido_%03d' % id]=name

        #pprint(dataToInsert)
        return dataToInsert


def storeToPostgre(d=None):
    if d:
        conn = psycopg2.connect("dbname=map_dev host=localhost user=kojima37")
        cur = conn.cursor()
        try:
            for k,v in d.iteritems():
                cur.execute('INSERT INTO citymap (city_id,city_name) VALUES (%s,%s)', (k,v))
            conn.commit()

        except Exception as e:
            print e

        finally:
            conn.close()


if __name__ == '__main__':
    d = getJson(filePath="./hokkaido.topojson")

    storeToPostgre(d)




