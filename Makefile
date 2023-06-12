test_runner = gutenberg-test-runner

ci_build_docker_image:
	docker build \
		--target $(test_runner) \
		--tag $(test_runner) \
		.

# Without --unsafe-perm, the postinstall hook will fail to run.
#
# See:
# - https://github.com/npm/npm/issues/3497#issue-14876484
# - https://buildkite.com/automattic/gutenberg-mobile/builds/6101#0188a503-600b-4839-913f-2b13254a92d4/243-422
ci_build_dependencies:
	docker run \
		--interactive \
		--tty \
		--volume $(shell pwd):/app \
		$(test_runner) \
		"npm ci --no-audit --no-progress --unsafe-perm"

ci_lint:
	docker run \
		--interactive \
		--tty \
		--volume $(shell pwd):/app \
		$(test_runner) \
		"CHECK_CORRECTNESS=true CHECK_TESTS=false ./bin/ci-checks-js.sh"

ci_unit_tests_android:
	docker run \
		--interactive \
		--tty \
		--volume $(shell pwd):/app \
		$(test_runner) \
		"CHECK_CORRECTNESS=false CHECK_TESTS=true TEST_RN_PLATFORM=android ./bin/ci-checks-js.sh"

ci_unit_tests_ios:
	docker run \
		--interactive \
		--tty \
		--volume $(shell pwd):/app \
		$(test_runner) \
		"CHECK_CORRECTNESS=false CHECK_TESTS=true TEST_RN_PLATFORM=ios ./bin/ci-checks-js.sh"
