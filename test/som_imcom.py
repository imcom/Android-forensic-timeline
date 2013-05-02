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

    def __init__(self, width, height, dataset, iteration_num = 50):
        self.radius = max(width, height) / 2.0
        self.time_constant = iteration_num / math.log10(self.radius)
        self.learning_rate = 2.0 #TODO to determine the init learning rate
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
        for x in range(self.width):
            for y in range(self.height):
                wv = [] # init weights vector for map node
                wv.append(random.randint(*self.obj_range))
                wv.append(random.randint(*self.pid_range))
                wv.append(random.randint(*self.date_range))
                self.nodes.append(Node(self, x, y, wv))
                
        # init the first round parameters
        self.update_neighbour_radius()
        self.update_learning_rate()

    def init_map_node(self, dataset):
        range_vectors = [list(vector) for vector in zip(*dataset)]
        for vector in range_vectors:
            vector.sort()
        self.obj_range = [range_vectors[0][0], range_vectors[0][-1]]
        self.pid_range = [range_vectors[1][0], range_vectors[1][-1]]
        self.date_range = [range_vectors[2][0], range_vectors[2][-1]]

    def update_neighbour_radius(self):
        self.neighbour_radius = self.radius * math.exp(-float(self.current_iteration) / self.time_constant)

    def update_learning_rate(self):
        self.current_learning_rate = self.learning_rate * math.exp(-float(self.current_iteration) / self.iteration_num)

    def epoch(self, iv):
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






