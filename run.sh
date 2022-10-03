#!/usr/bin/with-contenv bashio

# Get the config
CONFIG_PATH=/data/options.json
export USER="$(bashio::config 'username')"
export PASSWORD="$(bashio::config 'password')"
npm run start