#!/bin/bash

mongo --quiet localhost:27017/imcom_som ./public/js/vendor/underscore-min.js ./public/js/tokenizer.js ./public/js/vendor/json2.js ./public/js/vectorizer.js ./libs/vectorize_activities.js




