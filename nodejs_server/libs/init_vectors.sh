#!/bin/bash

#mongo --quiet localhost:27017/imcom ../public/js/vendor/underscore-min.js ../public/js/tokenizer.js index_app_name.js

mongo --quiet localhost:27017/imcom ../public/js/vendor/underscore-min.js ../public/js/tokenizer.js index_sys_object.js

mongo --quiet localhost:27017/imcom ../public/js/vendor/underscore-min.js ../public/js/tokenizer.js ./json2.js vectorize_activities.js




