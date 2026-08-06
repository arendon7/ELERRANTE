#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$DIR/scripts/abrir_local_v28.sh" index.html
