# OAuth Proxy Interface via Nginx reverse proxy and Node.js S2I Application

[OAuth Proxy for OpenShift](https://github.com/openshift/oauth-proxy) provide an almost ready to interface with OpenShift's backend authentication server. The lacking feature that was needed was to be able to split traffic based on user creditials. Nginx has the ability to split traffic but found that getting it to authenticate against Openshift's backend authentication directly to be difficult. Nginx is interfaced with Openshift's Oauth Proxy to allow for custom proxying ability of Nginx through it's built in configuration and to allow easy integration with Openshift's backend authentication with Oauth Proxy.

Although Nginx can split traffic based on header information received back from [OAuth Proxy for OpenShift](https://github.com/openshift/oauth-proxy) it lacks the ability to get useful information about the user authenticated by OAuth Proxy. Node.js server application was created to provide Nginx additional information for the user creditials(email/username) passed back from OAuth Proxy. 

Node.js and OAuth Proxy both use [Openshift's Service Account](https://docs.openshift.com/container-platform/3.11/admin_guide/service_accounts.html) to gain access to Openshift's authentication backend and user creditials. Service accounts can be easily created by any user per namespace(project). Limited information about the user is passed from Openshift's backend authentication and OAuth Proxy such as username/email. With username/email information the Node.js application can use a service account to access membership information for that particular namespace's user [rolebindings](https://docs.openshift.com/container-platform/3.11/architecture/additional_concepts/authorization.html) through OpenShift's REST api calls. Node.js will then send response back to Nginx client on if the requesting user has particular role and proxy user accordingly.



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
