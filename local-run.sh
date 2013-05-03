#!/bin/bash
export MONGODB_DBPATH=$HOME/data/db
export MONGODB_HOME=$HOME/mongodb
foreman start -f Procfile-local