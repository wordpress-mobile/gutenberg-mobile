.DEFAULT_GOAL := test

### Derived Variables
SRC_DIR    ?= $(shell pwd | sed 's/ /\\ /g')

src_volume = $(SRC_DIR):/app

### Shared Variables
test_runner = gutenberg-test-runner
android_builder = android-app-builder
docker_run_flags = -it --rm

### Shared Commands
run = docker run $(docker_run_flags) --volume $(src_volume) $(test_runner) /bin/bash --login -c "nvm install && $(1)"
run_in = docker run $(docker_run_flags) --volume $(src_volume) --workdir $(1) $(test_runner) /bin/bash --login -c "nvm install && $(2)"

android_run = docker run $(docker_run_flags) --volume $(src_volume) $(android_builder) /bin/bash --login -c "nvm install && $(1)"

gutenberg_run_with_env = docker run $(docker_run_flags) --volume $(src_volume) $(1) $(test_runner) /bin/bash --login -c "nvm install && $(2)"

build-test-runner:
	@echo "--- Building image $(test_runner)..."
	docker build --target $(test_runner) --tag $(test_runner) .

build-android-builder:
	@echo "--- Building image $(android_builder)"
	docker build --target $(android_builder) --tag $(android_builder) .

validate-dependencies: build-test-runner
	@echo "--- Validating Dependencies..."
	$(call run_in, /app/gutenberg, npm ci --prefer-offline --no-audit)

install-project-dependencies:
	@echo "--- Installing Gutenberg Mobile Dependencies"
	$(call run, npm install --no-audit)

install-gutenberg-dependencies:
	@echo "--- Installing Gutenberg Dependencies"
	$(call run_in, /app/gutenberg, npm install)

install-jetpack-dependencies:
	@echo "--- Installing Jetpack Dependencies"
	$(call run_in, /app/jetpack, yes | npx pnpm@7.5.0 install)

install-dependencies: build-test-runner install-gutenberg-dependencies install-jetpack-dependencies install-project-dependencies



# 	# --unsafe-perm is required so that we can run under Docker
# 	$(call run, npm run i18n:check-cache)

bundle: bundle-android bundle-ios

prebundle: install-dependencies
	@echo "--- Prebundling..."
	$(call gutenberg_run, npm run prebundle:js)

bundle-android: prebundle 
	@echo "--- Bundling Android..."
	$(call gutenberg_run, npm run bundle:android)

bundle-ios: prebundle
	@echo "--- Bundling iOS..."
	$(call gutenberg_run, npm run bundle:ios)

bundle-android-for-testing: install-dependencies
	@echo "--- Bundling Android for e2e Testing..."
	$(call gutenberg_run, npm run test:e2e:bundle:android)

bundle-ios-for-testing: prebundle
	@echo "--- Bundling iOS for e2e Testing..."
	$(call gutenberg_run, npm run test:e2e:bundle:ios)

build-android-for-testing: install-dependencies build-android-builder
	@echo "--- Building Android Test Application..."
	$(call android_run, npm run core test:e2e:build-app:android)

build-ios-for-testing:
	@echo "--- Building iOS Test Application..."
	npm run core test:e2e:build-app:ios

test: test-android test-ios

test-android: install-dependencies
	@echo "--- Testing Android..."
	$(call gutenberg_run, npm run test:android)

test-ios: install-dependencies
	@echo "--- Testing iOS..."
	$(call gutenberg_run, npm run test:ios)

e2e-test-android:
	@echo "--- Uploading e2e Test Bundle to Saucelabs"
	curl -u "${SAUCE_USERNAME}:${SAUCE_ACCESS_KEY}" -X POST -H "Content-Type: application/octet-stream" https://saucelabs.com/rest/v1/storage/automattic/Gutenberg-${BUILDKITE_BUILD_NUMBER}.apk?overwrite=true --data-binary @./gutenberg/packages/react-native-editor/android/app/build/outputs/apk/debug/app-debug.apk
	$(call gutenberg_run_with_env, --env TEST_RN_PLATFORM=android --env TEST_ENV=sauce, npm run device-tests)

e2e-test-ios: install-dependencies
	@echo "--- End-to-End Testing iOS..."
	$(call gutenberg_run_with_env, --env TEST_RN_PLATFORM=ios --env TEST_ENV=sauce, npm run device-tests)
	exit 1
