.DEFAULT_GOAL := test

### Derived Variables
SRC_DIR    ?= $(shell pwd | sed 's/ /\\ /g')

src_volume = $(SRC_DIR):/app

### Shared Variables
test_host_tag = gutenberg-mobile-test-host
docker_run_flags = -i --rm

build-test-host:
	@echo "Building image $(test_host_tag)..."
	docker build $(build_shared_flags) -t $(test_host_tag) .

install-dependencies: build-test-host
	@echo "Installing Dependencies..."
	docker run $(run_shared_flags) --volume $(src_volume) $(test_host_tag) npm install

validate-dependencies: build-test-host
	@echo "Validating Dependencies..."
	docker run $(run_shared_flags) --volume $(src_volume) $(test_host_tag) npm ci --prefer-offline --cache .npm-cache

test: install-dependencies
	@echo "Running Tests..."
	docker run $(run_shared_flags) --volume $(src_volume) $(test_host_tag) npm install
