test_runner = gutenberg-test-runner

ci_build:
	docker build \
		--target $(test_runner) \
		--tag $(test_runner) \
		.

ci_test:
	docker run \
		--interactive \
		--tty \
		--volume $(shell pwd):/app \
		$(test_runner) \
		"npm ci --no-audit --no-progress --unsafe-perm && CHECK_CORRECTNESS=false CHECK_TESTS=true ./bin/ci-checks-js.sh"
	# Without --unsafe-perm, the postinstall hook will fail to run.
	#
	# See:
	# - https://github.com/npm/npm/issues/3497#issue-14876484
	# - https://buildkite.com/automattic/gutenberg-mobile/builds/6101#0188a503-600b-4839-913f-2b13254a92d4/243-422
