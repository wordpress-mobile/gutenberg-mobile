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
		"npm ci --no-audit --no-progress && CHECK_CORRECTNESS=false CHECK_TESTS=true ./bin/ci-checks-js.sh"
