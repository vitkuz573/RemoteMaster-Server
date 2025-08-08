.PHONY: install dev build start lint typecheck test test-watch test-coverage ci

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm run test

test-watch:
	npm run test:watch

test-coverage:
	npm run test:coverage

ci: lint typecheck test-coverage

