echo resolver $(awk 'BEGIN{ORS=" "} $1=="nameserver" {print $2}' /etc/resolv.conf) ";" > ${NGINX_CONFIGURATION_PATH}/resolvers.conf
