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
		"npm install --prefer-offline --no-audit"
