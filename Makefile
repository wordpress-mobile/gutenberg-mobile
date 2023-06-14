test_runner = gutenberg-test-runner
android_editor_test_runner = android-editor-test-runner

docker_run_opts = --interactive --tty --volume $(shell pwd):/app

docker_run_env = --env BUILDKITE_PLUGIN_BASH_CACHE_BUCKET=$$BUILDKITE_PLUGIN_BASH_CACHE_BUCKET \
								 --env CACHE_BUCKET_NAME=$$CACHE_BUCKET_NAME \
								 --env AWS_SECRET_KEY=$$AWS_SECRET_KEY \
								 --env AWS_ACCESS_KEY=$$AWS_ACCESS_KEY \
								 --env BUILDKITE_PIPELINE_SLUG=$$BUILDKITE_PIPELINE_SLUG

docker_run = docker run $(docker_run_opts) $(docker_run_env) $(test_runner)

download_caches_cmd = .buildkite/download-caches.sh
upload_caches_cmd = .buildkite/upload-caches.sh

ci_build_docker_image:
	docker build \
		--target $(test_runner) \
		--tag $(test_runner) \
		.

ci_build_docker_android_editor_image:
	docker build \
		--target $(android_editor_test_runner) \
		--tag $(android_editor_test_runner) \
		.

# Without --unsafe-perm, the postinstall hook will fail to run.
#
# See:
# - https://github.com/npm/npm/issues/3497#issue-14876484
# - https://buildkite.com/automattic/gutenberg-mobile/builds/6101#0188a503-600b-4839-913f-2b13254a92d4/243-422
ci_build_dependencies:
	$(docker_run) ".buildkite/build-dependencies.sh"

ci_lint:
	$(docker_run) "$(download_caches_cmd) && CHECK_CORRECTNESS=true CHECK_TESTS=false ./bin/ci-checks-js.sh"

ci_unit_tests_android:
	$(docker_run) "$(download_caches_cmd) && CHECK_CORRECTNESS=false CHECK_TESTS=true TEST_RN_PLATFORM=android ./bin/ci-checks-js.sh"

ci_unit_tests_ios:
	$(docker_run) "$(download_caches_cmd) && CHECK_CORRECTNESS=false CHECK_TESTS=true TEST_RN_PLATFORM=ios ./bin/ci-checks-js.sh"

ci_build_js_bundles:
	$(docker_run) ".buildkite/build-js-bundles.sh"
