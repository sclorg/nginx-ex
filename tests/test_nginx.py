import os

import pytest
from pathlib import Path

from container_ci_suite.openshift import OpenShiftAPI

test_dir = Path(os.path.abspath(os.path.dirname(__file__)))

VERSION=os.getenv("SINGLE_VERSION")
if not VERSION:
    VERSION="1.22-ubi8"

class TestNginxExTemplate:

    def setup_method(self):
        self.oc_api = OpenShiftAPI(pod_name_prefix="nginx-example")
        json_raw_file = self.oc_api.get_raw_url_for_json(
            container="nginx-container", dir="imagestreams", filename="nginx-rhel.json"
        )
        self.oc_api.import_is(path=json_raw_file, name="nginx")

    def teardown_method(self):
        self.oc_api.delete_project()

    def test_template_inside_cluster(self):
        template_json = self.oc_api.get_raw_url_for_json(
            container="nginx-ex", dir="openshift/templates", filename="nginx.json"
        )
        assert self.oc_api.deploy_template(
            template=template_json, name_in_template="nginx-example", expected_output="Welcome to your static nginx application",
            openshift_args=["SOURCE_REPOSITORY_REF=master", f"NGINX_VERSION={VERSION}", "NAME=nginx-example"]
        )
        assert self.oc_api.template_deployed(name_in_template="nginx-example")
        assert self.oc_api.check_response_inside_cluster(
            name_in_template="nginx-example", expected_output="Welcome to your static nginx application"
        )

    def test_template_by_request(self):
        template_json = self.oc_api.get_raw_url_for_json(
            container="nginx-ex", dir="openshift/templates", filename="nginx.json"
        )
        assert self.oc_api.deploy_template(
            template=template_json, name_in_template="nginx-example", expected_output="Welcome to your static nginx application",
            openshift_args=["SOURCE_REPOSITORY_REF=master", f"NGINX_VERSION={VERSION}", "NAME=nginx-example"]
        )
        assert self.oc_api.template_deployed(name_in_template="nginx-example")
        assert self.oc_api.check_response_outside_cluster(
            name_in_template="nginx-example", expected_output="Welcome to your static nginx application"
        )
