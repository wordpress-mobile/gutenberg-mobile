.DEFAULT_GOAL := test

### Derived Variables
SRC_DIR    ?= $(shell pwd | sed 's/ /\\ /g')

src_volume = $(SRC_DIR):/app

### Shared Variables
test_runner = gutenberg-test-runner
docker_run_flags = -it --rm

### Shared Commands
gutenberg_run = docker run $(docker_run_flags) --volume $(src_volume) $(test_runner) /bin/bash --login -c "nvm install && $(1)"

build-test-runner:
	@echo "--- Building image $(test_runner)..."
	docker build --target $(test_runner) --tag $(test_runner) .

validate-dependencies: build-test-runner
	@echo "--- Validating Dependencies..."
	$(call gutenberg_run, npm ci --prefer-offline --no-audit)

install-dependencies: build-test-runner
	@echo "--- Installing all dependencies from scratch..."
	# --unsafe-perm is required so that we can run under Docker
	$(call gutenberg_run, npm install --no-audit --unsafe-perm)

bundle: bundle-android bundle-ios

prebundle: install-dependencies
	@echo "--- Prebundling..."
	$(call gutenberg_run, npm run prebundle:js)

bundle-android: prebundle 
	@echo "--- Bundling Android..."
	$(call gutenberg_run,  npm run bundle:android)

bundle-ios: prebundle
	@echo "--- Bundling iOS..."
	$(call gutenberg_run, npm run test:e2e:bundle:ios)

test: test-android test-ios

test-android: install-dependencies
	@echo "--- Testing Android..."
	$(call gutenberg_run, npm run test:android)

test-ios: install-dependencies
	@echo "--- Testing iOS..."
	$(call gutenberg_run, npm run test:ios)
