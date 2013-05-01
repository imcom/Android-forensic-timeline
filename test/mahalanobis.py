#!/Library/Frameworks/Python.framework/Versions/2.7/bin/python

import numpy
import numpy.matlib as matlib
from scipy.spatial.distance import mahalanobis

class mahalanobis_helper:

    def __init__(self, dataset):
        # calculate covariance of the given dataset
        # each column represents a variable in observation
        covar = numpy.cov(dataset, rowvar = 0) 
        # get inverse of covariance for calculating mahalanobis distance
        self.covar_inv = numpy.linalg.inv(covar)

    def getDistance(self, x, y):
        # get the distance of vector x and vector y
        distance = mahalanobis(x, y, self.covar_inv)
        return distance

if __name__ == '__main__':
    # 
    # each column is a variable, each row contains observations of variables
    dataset = [
                (0,1),
                (1,1),
                (0,3),
                (1,2),
                (2,3)
            ]
    mh = mahalanobis_helper(dataset)
    print mh.getDistance(dataset[0], dataset[1])
