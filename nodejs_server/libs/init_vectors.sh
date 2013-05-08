#!/bin/bash

#mongo --quiet localhost:27017/imcom ../public/js/vendor/underscore-min.js ../public/js/tokenizer.js index_sys_object.js

mongo --quiet localhost:27017/imcom ../public/js/vendor/underscore-min.js ../public/js/tokenizer.js ../public/js/vendor/json2.js ../public/js/vectorizer.js vectorize_activities.js




