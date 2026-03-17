ifneq (,$(wildcard .env))
    include .env
    export
endif

APP_NAME=pvu
CMD_DIR=./cmd/server
BUILD_DIR=./bin
GOOSE_DRIVER ?= postgres
GOOSE_DBSTRING ?= $(DATABASE_URL)
GOOSE_MIGRATION_DIR ?= ./migrations
GOOSE = GOOSE_DRIVER="$(GOOSE_DRIVER)" GOOSE_DBSTRING="$(GOOSE_DBSTRING)" GOOSE_MIGRATION_DIR="$(GOOSE_MIGRATION_DIR)" goose

.PHONY: all test testverbose build run clean setup ritual migrate_up migrate_down migrate_reset migrate_status check_goose_env generate_sqlc_code

setup: # for all this binaries being installed here to work it is necessary to have $GOPATH/bin in the path, normally $HOME/.go/bin
	go install github.com/pressly/goose/v3/cmd/goose@latest
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest


ritual: migrate_reset migrate_up migrate_reset migrate_up

check_goose_env:
	@if [ -z "$(GOOSE_DBSTRING)" ]; then \
		echo "GOOSE_DBSTRING is required (or set DATABASE_URL in .env)."; \
		exit 1; \
	fi
	@if [ ! -d "$(GOOSE_MIGRATION_DIR)" ]; then \
		echo "GOOSE_MIGRATION_DIR does not exist: $(GOOSE_MIGRATION_DIR)"; \
		echo "Tip: for this repo it should usually be ./migrations"; \
		exit 1; \
	fi

migrate_up: check_goose_env
	$(GOOSE) up

migrate_down: check_goose_env
	$(GOOSE) down

migrate_reset: check_goose_env
	$(GOOSE) reset

migrate_status: check_goose_env
	$(GOOSE) status

generate_sqlc_code:
	sqlc generate

all: setup test build

test:
	go test ./... -cover

testverbose:
	go test -v ./... -cover

build:
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(APP_NAME) $(CMD_DIR)

run: build
	$(BUILD_DIR)/$(APP_NAME)

clean:
	rm -rf $(BUILD_DIR)
