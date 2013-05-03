#!/Library/Frameworks/Python.framework/Versions/2.7/bin/python

import pymongo
import sys
import re
import random
from mahalanobis import mahalanobis_helper
from som_imcom import SOM

# connect to local mongod on default port
client = pymongo.MongoClient("localhost", 27017)

# connect to database
db = client.imcom

# get collection
collection = db.activity_vectors

# fetch pre-stored vectors from database
raw_dataset = list(vector for vector in collection.find(None, {'_id': 0}))

# convert dict/json format to vector list
dataset = list()
for vector_dict in raw_dataset:
    vector = [vector_dict['0'], vector_dict['1'], vector_dict['2'], vector_dict['3'], vector_dict['4']]
    dataset.append(vector)

# init the self-organising map
ksom = SOM(5, 5, dataset)

# debugging
#for index, node in enumerate(ksom.nodes):
#    print node.weights_vector

# start training
for iv in random.sample(dataset, 50):
    #print iv
    #print objects[iv[0]], pids[iv[1]], dates[iv[2]]
    ksom.epoch(iv)
    pass

line_width = 5
for index, node in enumerate(ksom.nodes):
    print ("(%d,%d):%d " % (node.x, node.y, node.bmu_count)),
    if (index + 1) % line_width is 0:
        print ''
        pass


