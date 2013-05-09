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

# remove old SOM collection
db.som_nodes.drop()

# get input vectors collection
collection = db.activity_vectors

# fetch pre-stored vectors from database
activity_dataset = list(activity for activity in collection.find(None, {'_id': 0}))
vector_dataset = list(activity['vector'] for activity in activity_dataset)

# convert dict/json format to vector list
dataset = list()
for vector in vector_dataset:
    '''vector = [
        #vector_dict['0'], # application index
        vector_dict['0'], # duration of activity
        vector_dict['1'], # number of events in activity
        vector_dict['2'], # number of system objects (distinguished)
        vector_dict['3'], # token index of activity
        vector_dict['4'], # number of database operations
        vector_dict['5'], # number of content provider queries
        vector_dict['6'], # number of network operations
    ]'''
    dataset.append(vector)

# dimension of the map (from config file)
width = 5
height = 3

# init the self-organising map
ksom = SOM(width, height, vector_dataset)

# start training
for activity_vector in random.sample(activity_dataset, 50):
    ksom.epoch(activity_vector['vector'], activity_vector['name'], activity_vector['start_date'])
    pass

# get SOM nodes collection in database
collection = db.som_nodes
# store the map to database
for node in ksom.nodes:
    map_node = dict()
    map_node['x'] = node.x
    map_node['y'] = node.y
    map_node['features'] = node.weights_vector
    map_node['extra_data'] = node.extra_data
    map_node['count'] = node.bmu_count
    collection.save(map_node)

# debugging output
'''
for index, node in enumerate(ksom.nodes):
    print ("(%d,%d):%d " % (node.x, node.y, node.bmu_count)),
    if (index + 1) % width is 0:
        print ''

for node in ksom.nodes:
    print "[%d,%d]" % (node.x, node.y),
    print node.weights_vector
    print node.extra_data
'''

print 'generated SOM nodes in collection <som_nodes>'






