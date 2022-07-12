.DEFAULT_GOAL := test

### Derived Variables
SRC_DIR    ?= $(shell pwd | sed 's/ /\\ /g')

src_volume = $(SRC_DIR):/app

### Shared Variables
gutenberg_test_runner = gutenberg-test-runner
jetpack_test_runner = jetpack-test-runner
docker_run_flags = -it --rm

### Shared Commands
gutenberg_run = docker run $(docker_run_flags) --volume $(src_volume) $(gutenberg_test_runner) /bin/bash --login -c "nvm install && $(1)"

build-gutenberg-test-runner:
	@echo "Building image $(gutenberg_test_runner)..."
	docker build --target $(gutenberg_test_runner) --tag $(gutenberg_test_runner) .

build-jetpack-test-runner:
	@echo "Building image $(jetpack_test_runner)..."
	docker build --target $(jetpack_test_runner) --tag $(jetpack_test_runner) .

install-dependencies: build-gutenberg-test-runner
	@echo "Installing Dependencies..."
	$(call gutenberg_run, npm install --cache .npm-cache --unsafe-perm --prefer-offline --no-audit)
	$(call gutenberg_run, npm run i18n:check-cache)

install-gutenberg-dependencies:
	@echo "Installing Gutenberg Dependencies"
	$(call gutenberg_run, cd gutenberg && nvm install && npm install --cache ../.npm-cache)

install-jetpack-dependencies:
	@echo "Installing Jetpack Dependencies"
	$(call gutenberg_run, pushd jetpack && nvm install && cd projects/plugins/jetpack && npx -y pnpm@7.1.1 install)

build-gutenberg-packages: install-dependencies install-gutenberg-dependencies
	@echo "Building Gutenberg Packages"
	$(call gutenberg_run, cd gutenberg && npm run build:packages --cache ../.npm-cache)

validate-dependencies: build-gutenberg-test-runner
	@echo "Validating Dependencies..."
	$(call gutenberg_run, npm ci --prefer-offline --cache .npm-cache)

bundle: bundle-android bundle-ios

prebundle: install-dependencies
	@echo "Prebundling..."
	$(call gutenberg_run, npm run prebundle:js)

bundle-android: prebundle 
	@echo "Bundling Android..."
	$(call gutenberg_run,  npm run bundle:android)

bundle-ios: prebundle
	@echo "Bundling iOS..."
	$(call gutenberg_run, npm run test:e2e:bundle:ios)

test: test-android test-ios

test-android: build-gutenberg-packages install-jetpack-dependencies
	@echo "Testing Android..."
	$(call gutenberg_run, npm run test:android)

test-ios: build-gutenberg-packages install-jetpack-dependencies
	@echo "Testing iOS..."
	$(call gutenberg_run, npm run test:ios)
