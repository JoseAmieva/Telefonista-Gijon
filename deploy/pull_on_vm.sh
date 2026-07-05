#!/usr/bin/env bash
# Alias: ver deploy/update_on_vm.sh (soporta VM sin .git).
exec "$(dirname "$0")/update_on_vm.sh" "$@"
