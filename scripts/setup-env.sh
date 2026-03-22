#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

CHAT_ENV_FILES=(
	"apps/chatui/.env"
	"apps/chatcli/.env"
)

COMPONENT_ENV_FILES=(
	"apps/qanary-component-eat-simple/.env"
	"apps/qanary-component-nerd-simple/.env"
	"apps/qanary-component-dis/.env"
	"apps/qanary-component-relation-detection/.env"
	"apps/qanary-component-sparql-generation/.env"
)

copy_missing_env_file() {
	local env_file="$1"
	local example_file="${env_file}.example"

	if [ -f "$env_file" ]; then
		return
	fi

	if [ ! -f "$example_file" ]; then
		printf 'Missing example file: %s\n' "$example_file" >&2
		exit 1
	fi

	cp "$example_file" "$env_file"
	printf 'Created %s from %s\n' "$env_file" "$example_file"
}

strip_wrapping_quotes() {
	local value="$1"

	if [[ "$value" == \"*\" ]]; then
		value="${value#\"}"
		value="${value%\"}"
	fi

	if [[ "$value" == \'*\' ]]; then
		value="${value#\'}"
		value="${value%\'}"
	fi

	printf '%s' "$value"
}

read_env_value() {
	local env_file="$1"
	local key="$2"
	local line

	if [ ! -f "$env_file" ]; then
		return 1
	fi

	line="$(grep -E "^${key}=" "$env_file" | tail -n 1 || true)"

	if [ -z "$line" ]; then
		return 1
	fi

	strip_wrapping_quotes "${line#*=}"
}

write_env_value() {
	local env_file="$1"
	local key="$2"
	local value="$3"
	local tmp_file

	tmp_file="$(mktemp)"

	if [ -f "$env_file" ]; then
		awk \
			-v key="$key" \
			-v value="$value" \
			'
				BEGIN {
					wrote = 0
				}
				$0 ~ ("^" key "=") {
					if (wrote == 0) {
						print key "=" value
						wrote = 1
					}
					next
				}
				{
					print
				}
				END {
					if (wrote == 0) {
						print key "=" value
					}
				}
			' "$env_file" > "$tmp_file"
	else
		printf '%s=%s\n' "$key" "$value" > "$tmp_file"
	fi

	mv "$tmp_file" "$env_file"
}

is_valid_openrouter_key() {
	local key="$1"

	[[ -n "$key" ]] || return 1
	[[ "$key" == sk-or-v1-* ]] || return 1
	[[ "${#key}" -gt 16 ]] || return 1
	[[ "$key" != *[[:space:]]* ]] || return 1
}

find_existing_openrouter_key() {
	local env_file
	local candidate

	for env_file in \
		"$ROOT_DIR/.env" \
		"${CHAT_ENV_FILES[@]/#/$ROOT_DIR/}" \
		"${COMPONENT_ENV_FILES[@]/#/$ROOT_DIR/}"
	do
		candidate="$(read_env_value "$env_file" "OPENROUTER_API_KEY" || true)"

		if is_valid_openrouter_key "$candidate"; then
			printf '%s' "$candidate"
			return 0
		fi
	done

	return 1
}

generate_virtuoso_password() {
	if command -v openssl >/dev/null 2>&1; then
		openssl rand -hex 16
		return
	fi

	printf 'baumbart-local-%s' "$(date +%s)"
}

usage() {
	cat <<'EOF'
Usage: ./scripts/setup-env.sh [options]

Options:
  --openrouter-key <key>      Write this OpenRouter key into all required .env files.
  --virtuoso-password <pass>  Set the Docker Compose Virtuoso password.
  --docker-stack              Use docker-compatible component networking (host.docker.internal).
  --host-stack                Use host-local component networking (localhost).
  -h, --help                  Show this help text.

Environment variables:
  OPENROUTER_API_KEY          Alternative to --openrouter-key.
  VIRTUOSO_DBA_PASSWORD       Alternative to --virtuoso-password.
EOF
}

openrouter_key="${OPENROUTER_API_KEY:-}"
virtuoso_password="${VIRTUOSO_DBA_PASSWORD:-}"
stack_mode="host"

while [ $# -gt 0 ]; do
	case "$1" in
		--openrouter-key)
			if [ $# -lt 2 ]; then
				printf 'Missing value for %s\n' "$1" >&2
				exit 1
			fi
			openrouter_key="$2"
			shift 2
			;;
		--virtuoso-password)
			if [ $# -lt 2 ]; then
				printf 'Missing value for %s\n' "$1" >&2
				exit 1
			fi
			virtuoso_password="$2"
			shift 2
			;;
		--docker-stack)
			stack_mode="docker"
			shift
			;;
		--host-stack)
			stack_mode="host"
			shift
			;;
		-h|--help)
			usage
			exit 0
			;;
		*)
			printf 'Unknown option: %s\n\n' "$1" >&2
			usage >&2
			exit 1
			;;
	esac
done

for env_file in "${CHAT_ENV_FILES[@]}" "${COMPONENT_ENV_FILES[@]}"; do
	copy_missing_env_file "$ROOT_DIR/$env_file"
done

if [ -z "$openrouter_key" ]; then
	openrouter_key="$(find_existing_openrouter_key || true)"
fi

if ! is_valid_openrouter_key "$openrouter_key"; then
	printf 'A valid-looking OpenRouter key is required. Use OPENROUTER_API_KEY=sk-or-v1-... or --openrouter-key.\n' >&2
	exit 1
fi

if [ -z "$virtuoso_password" ]; then
	virtuoso_password="$(read_env_value "$ROOT_DIR/.env" "VIRTUOSO_DBA_PASSWORD" || true)"
fi

if [ -z "$virtuoso_password" ]; then
	virtuoso_password="$(generate_virtuoso_password)"
fi

component_host="localhost"

if [ "$stack_mode" = "docker" ]; then
	component_host="host.docker.internal"
fi

for env_file in "${CHAT_ENV_FILES[@]}"; do
	write_env_value "$ROOT_DIR/$env_file" "OPENROUTER_API_KEY" "$openrouter_key"
	write_env_value "$ROOT_DIR/$env_file" "QANARY_API_BASE_URL" "http://localhost:8080"
	write_env_value "$ROOT_DIR/$env_file" "TRIPLESTORE_URL" "http://localhost:8890/sparql"
done

for env_file in "${COMPONENT_ENV_FILES[@]}"; do
	write_env_value "$ROOT_DIR/$env_file" "SPRING_BOOT_ADMIN_URL" "http://localhost:8080/"
	write_env_value "$ROOT_DIR/$env_file" "QANARY_HOST" "$component_host"
	write_env_value "$ROOT_DIR/$env_file" "OPENROUTER_API_KEY" "$openrouter_key"
done

write_env_value "$ROOT_DIR/.env" "VIRTUOSO_DBA_PASSWORD" "$virtuoso_password"
write_env_value "$ROOT_DIR/.env" "OPENROUTER_API_KEY" "$openrouter_key"
write_env_value "$ROOT_DIR/.env" "QANARY_API_BASE_URL" "http://localhost:8080"
write_env_value "$ROOT_DIR/.env" "TRIPLESTORE_URL" "http://localhost:8890/sparql"

printf 'Configured %s stack env files.\n' "$stack_mode"
printf 'Component host: %s\n' "$component_host"
printf 'Updated: .env and %s workspace env files.\n' "$(( ${#CHAT_ENV_FILES[@]} + ${#COMPONENT_ENV_FILES[@]} ))"
