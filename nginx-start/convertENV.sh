#!/bin/sh
set -e
envsubst < ${NGINX_CONFIGURATION_PATH}/upstream.conf > ${NGINX_CONFIGURATION_PATH}/upstream.conf
envsubst '${DEV_EMAILS_WITH_LOCATIONS}' < ${NGINX_CONFIGURATION_PATH}/split_traffic.conf > ${NGINX_CONFIGURATION_PATH}/split_traffic.conf
echo "Finished convertENV.sh"
