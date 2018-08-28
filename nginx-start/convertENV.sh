#!/bin/sh
set -e
export OAUTH_AUTH_SERVER=$(curl https://${KUBERNETES_SERVICE_HOST}/.well-known/oauth-authorization-server -ks|python -c "import sys, json; print(json.load(sys.stdin)['issuer'])") 
#below doesn't work because ${HOME}/.profile not loaded
#echo "export OAUTH_AUTH_SERVER=${OAUTH_AUTH_SERVER}" >> ${HOME}/.profile
envsubst < ${NGINX_CONFIGURATION_PATH}/upstream.conf > ${NGINX_CONFIGURATION_PATH}/upstream.conf
envsubst '${OAUTH_AUTH_SERVER}' < ${NGINX_DEFAULT_CONF_PATH}/user-redirect.conf > ${NGINX_DEFAULT_CONF_PATH}/user-redirect.conf
#envsubst '${DEV_EMAILS_WITH_LOCATIONS}' < ${NGINX_CONFIGURATION_PATH}/split_traffic.conf > ${NGINX_CONFIGURATION_PATH}/split_traffic.conf
echo "Finished convertENV.sh"
