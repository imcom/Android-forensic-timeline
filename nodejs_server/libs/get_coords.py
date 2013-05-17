#!/Library/Frameworks/Python.framework/Versions/2.7/bin/python

from scipy.spatial.distance import mahalanobis
import sys
import pymongo
import numpy

client = pymongo.MongoClient("localhost", 27017)
db = client.imcom_som

nodes = db.som_nodes.find()
covar_inv = db.matrix.find()

# convert string to numpy array
iv = map(lambda x:float(x.strip()), sys.argv[1][1:-1].split(','))
# convert binary form matrix to numpy matrix
covar_inv = numpy.loads(covar_inv[0]['matrix'])

min_dist = 1000000000
bmu_coords = [-1, -1]
for node in nodes:
    wv = node['features']
    distance = mahalanobis(iv, wv, covar_inv)
    if distance < min_dist:
        min_dist = distance
        bmu_coords[0] = node['x']
        bmu_coords[1] = node['y']

print ','.join(str(x) for x in bmu_coords)


