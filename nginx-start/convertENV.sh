#!/bin/sh
set -e
export OAUTH_AUTH_SERVER=$(curl https://${KUBERNETES_SERVICE_HOST}/.well-known/oauth-authorization-server -k|python -c "import sys, json; print(json.load(sys.stdin)['issuer'])") &> /dev/null
echo "export OAUTH_AUTH_SERVER=${OAUTH_AUTH_SERVER}" >> ${HOME}/.profile
envsubst < ${NGINX_CONFIGURATION_PATH}/upstream.conf > ${NGINX_CONFIGURATION_PATH}/upstream.conf
envsubst '${DEV_EMAILS_WITH_LOCATIONS}' < ${NGINX_CONFIGURATION_PATH}/split_traffic.conf > ${NGINX_CONFIGURATION_PATH}/split_traffic.conf
echo "Finished convertENV.sh"
