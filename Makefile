test_runner = gutenberg-test-runner

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

ci_build_js_bundles:
	$(docker_run) "echo 999999 | tee -a /proc/sys/fs/inotify/max_user_watches && .buildkite/build-js-bundles.sh"
