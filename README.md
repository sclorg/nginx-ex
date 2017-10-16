# Nginx HTTP server and reverse proxy (nginx) S2I Sample Application

This is a very basic sample application repository that can be built and deployed
on [OpenShift](https://www.openshift.com) using the [Nginx HTTP server and a reverse proxy builder image](https://github.com/sclorg/nginx-container).

The application serves a single static html page via nginx.

To build and run the application:

```
$ s2i build https://github.com/sclorg/nginx-ex centos/nginx-112-centos7 mynginximage
$ docker run -p 8080:8080 mynginximage
$ # browse to http://localhost:8080
```

You can also build and deploy the application on OpenShift, assuming you have a
working `oc` command line environment connected to your cluster already:

`$ oc new-app centos/nginx-112-centos7~https://github.com/sclorg/nginx-ex`

You can also deploy the sample template for the application:

`$ oc new-app -f https://raw.githubusercontent.com/sclorg/nginx-ex/master/openshift/templates/nginx.json`
