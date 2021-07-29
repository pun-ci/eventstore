.PHONY: watch_test test docker lint lint_fix verify

default: dist

dist: node_modules src
	node_modules/.bin/tsc -p ./src --pretty

watch_test: node_modules
	node_modules/.bin/jest --watch

test: node_modules
	node_modules/.bin/jest --verbose

docker:
	docker run --rm \
		-p 1113:1113 \
		-p 2113:2113 \
		-e EVENTSTORE_CLUSTER_SIZE=1 \
		-e EVENTSTORE_RUN_PROJECTIONS=All \
		-e EVENTSTORE_START_STANDARD_PROJECTIONS=true \
		-e EVENTSTORE_EXT_TCP_PORT=1113 \
		-e EVENTSTORE_EXT_HTTP_PORT=2113 \
		-e EVENTSTORE_INSECURE=true \
		-e EVENTSTORE_ENABLE_EXTERNAL_TCP=true \
		-e EVENTSTORE_ENABLE_ATOM_PUB_OVER_HTTP=true \
		eventstore/eventstore:21.2.0-buster-slim

lint: node_modules
	node_modules/.bin/eslint .

lint_fix: node_modules
	node_modules/.bin/eslint . --fix

verify: lint test
