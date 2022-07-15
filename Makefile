.DEFAULT_GOAL := test

### Derived Variables
SRC_DIR    ?= $(shell pwd | sed 's/ /\\ /g')

src_volume = $(SRC_DIR):/app

### Shared Variables
test_runner = gutenberg-test-runner
android_builder = android-app-builder
docker_run_flags = -it --rm

### Shared Commands
gutenberg_run = docker run $(docker_run_flags) --volume $(src_volume) $(test_runner) /bin/bash --login -c "nvm install && $(1)"
android_run = docker run $(docker_run_flags) --volume $(src_volume) $(android_builder) /bin/bash --login -c "nvm install && $(1)"

build-test-runner:
	@echo "--- Building image $(test_runner)..."
	docker build --target $(test_runner) --tag $(test_runner) .

build-android-builder:
	@echo "--- Building image $(android_builder)"
	docker build --target $(android_builder) --tag $(android_builder) .

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
	@echo "--- End-to-End Testing Android..."
	exit 1
# 	source bin/sauce-pre-upload.sh
# 	curl -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" -X POST -H "Content-Type: application/octet-stream" https://saucelabs.com/rest/v1/storage/automattic/Gutenberg-$SAUCE_FILENAME.apk?overwrite=true --data-binary @./gutenberg/packages/react-native-editor/android/app/build/outputs/apk/debug/app-debug.apk
# 	npm run device-tests

e2e-test-ios:
	@echo "--- End-to-End Testing iOS..."
	exit 1
