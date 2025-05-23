#!/usr/bin/env bash

PACKAGE_VERSION=$(tar xfO package.tgz package/package.json | jq -r ".version")
IMAGE_NAME="ghcr.io/alex-zissis/home-assistant-matter-hub"

DOCKER_PUSH="false"
TAG_LATEST="false"
PLATFORMS=""

while test $# -gt 0
do
    case "$1" in
        --push) DOCKER_PUSH="true"
            ;;
        --latest) TAG_LATEST="true"
            ;;
        --all-platforms) PLATFORMS="linux/amd64,linux/arm/v7,linux/arm64/v8"
            ;;
    esac
    shift
done

TAGS=("$IMAGE_NAME:$PACKAGE_VERSION")
if [ "$TAG_LATEST" = "true" ]; then
  TAGS+=("$IMAGE_NAME:latest")
fi

DOCKER_BUILD_ARGS=()
for TAG in "${TAGS[@]}"; do
  DOCKER_BUILD_ARGS+=("-t" "$TAG")
done

if [ "$DOCKER_PUSH" = "true" ]; then
  DOCKER_BUILD_ARGS+=("--push")
fi
if [ -n "$PLATFORMS" ]; then
  DOCKER_BUILD_ARGS+=("--platform=$PLATFORMS")
fi

echo "#######################################################################################"
echo "Building $IMAGE_NAME:$PACKAGE_VERSION"
echo "#######################################################################################"

docker buildx build \
  "${DOCKER_BUILD_ARGS[@]}" \
  .
