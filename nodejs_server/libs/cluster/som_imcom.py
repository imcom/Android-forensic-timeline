#!/usr/bin/python

import math
import random
import sys
from scipy.spatial.distance import euclidean
from mahalanobis import mahalanobis_helper

class Node:

    def __init__(self, som, x, y, weights_vector):
        self.som = som
        self.euclidean_distance = 0.0 # distance between this node and the BMU
        self.mahalanobis_distance = 0.0 # distance between input and weights
        self.x = x
        self.y = y
        self.weights_vector = weights_vector
        self.extra_data = {'apps': [], 'start_date': []}
        self.bmu_count = 0

    def getPosition(self):
        return [self.x, self.y]

    def get_euclidean_distance(self, node):
        self.euclidean_distance = euclidean(self.getPosition(), node.getPosition());
        return self.euclidean_distance

    def get_mahalanobis_distance(self, iv):
        self.mahalanobis_distance = self.som.mh.getDistance(self.weights_vector, iv)
        return self.mahalanobis_distance

    def train(self, iv, learning_rate):
        influence = math.exp(-self.euclidean_distance / 2 * (self.som.neighbour_radius ** 2))
        for i in range(len(iv)):
            self.weights_vector[i] += influence * learning_rate * (iv[i] - self.weights_vector[i])

## Class Node

class SOM:

    def __init__(self, width, height, dataset, iteration_num = 1000):
        self.radius = max(width, height) / 2.0
        self.time_constant = iteration_num / math.log10(self.radius)
        self.learning_rate = 0.9 #TODO to determine the init learning rate
        self.current_learning_rate = 0.0
        self.iteration_num = iteration_num
        self.current_iteration = 1
        self.neighbour_radius = 0.0

        self.width = width
        self.height = height
        self.nodes = []
        self.bmu = None
        self.mh = mahalanobis_helper(dataset) # using given samples to calculate covariance matrix

        self.init_map_node(dataset)
        '''for x in range(self.width):
            for y in range(self.height):
                wv = [] # init weights vector for map node
                #wv.append(random.randint(*self.app_index_range))
                wv.append(random.randint(*self.duration_range))
                wv.append(random.randint(*self.num_events_range))
                wv.append(random.randint(*self.num_sys_objs_range))
                wv.append(random.randint(*self.token_index_range))
                wv.append(random.randint(*self.num_db_range))
                wv.append(random.randint(*self.num_cp_range))
                wv.append(random.randint(*self.num_network_range))
                # init new node and append to map
                self.nodes.append(Node(self, x, y, wv))'''

        # init the first round parameters
        self.update_neighbour_radius()
        self.update_learning_rate()

    def init_map_node(self, dataset):
        for index, vector in enumerate(random.sample(dataset, self.width * self.height)):
            x = index % self.width
            y = index / self.width
            self.nodes.append(Node(self, x, y, vector))
        '''range_vectors = [list(vector) for vector in zip(*dataset)]
        for vector in range_vectors:
            vector.sort()
        self.features = [
            duration_range,
            num_events_range,
            num_sys_objs_range,
            token_index_range,
            num_db_range,
            num_cp_range,
            num_network_range
        ]
        for _index, feature in enumerate(self.features):
            feature = [range_vectors[_index][0], range_vectors[_index][-1]]
        #self.app_index_range = [range_vectors[0][0], range_vectors[0][-1]] # application
        self.duration_range = [range_vectors[0][0], range_vectors[0][-1]] # duration
        self.num_events_range = [range_vectors[1][0], range_vectors[1][-1]] # num of events
        self.num_sys_objs_range = [range_vectors[2][0], range_vectors[2][-1]] # duration
        self.token_index_range = [range_vectors[3][0], range_vectors[3][-1]] # token index range
        self.num_db_range = [range_vectors[4][0], range_vectors[4][-1]] # num of db opr
        self.num_cp_range = [range_vectors[5][0], range_vectors[5][-1]] # num of cp opr
        self.num_network_range = [range_vectors[6][0], range_vectors[6][-1]] # num of network opr'''

    def update_neighbour_radius(self):
        self.neighbour_radius = self.radius * math.exp(-float(self.current_iteration) / self.time_constant)

    def update_learning_rate(self):
        self.current_learning_rate = self.learning_rate * math.exp(-float(self.current_iteration) / self.iteration_num)

    def epoch(self, iv, app_name, start_date):
        if self.current_iteration > self.iteration_num:
            print "iteration rounds exceeded, quitting ..."
            sys.exit(self.current_iteration)

        # finding the best match unit
        self.bmu = None
        for node in self.nodes:
            node.get_mahalanobis_distance(iv)
            if self.bmu is None or node.mahalanobis_distance < self.bmu.mahalanobis_distance:
                self.bmu = node

        # counting times of a node becomes the BMU
        self.bmu.bmu_count += 1
        # only store distinguished app names
        if app_name not in self.bmu.extra_data['apps']:
            self.bmu.extra_data['apps'].append(app_name)
        # all date should be stored in this list for calculating Euclidean distance ([smallest, median, biggest])
        self.bmu.extra_data['start_date'].append(start_date)
        # adjust node weights
        for node in self.nodes:
            node.get_euclidean_distance(self.bmu)
            if node.euclidean_distance < self.neighbour_radius:
                node.train(iv, self.current_learning_rate)

        # update iteration parameters
        self.current_iteration += 1
        self.update_neighbour_radius()
        self.update_learning_rate()

## Class SOM






