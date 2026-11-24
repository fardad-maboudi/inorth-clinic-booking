FROM node:20-alpine

WORKDIR /app

# Corepack caches the pnpm binary here. Bake it at a world-readable path at
# build time so the runtime (which runs as uid 1000 on a --read-only rootfs)
# never tries to mkdir /home/node/.cache/node/corepack — that write fails with
# ENOENT and instantly crashes the container. See todos/agent-smoke corepack crash.
ENV COREPACK_HOME=/opt/corepack
# Use the baked runtime pin even when an older workspace requests pnpm 9.
ENV COREPACK_ENABLE_PROJECT_SPEC=0 COREPACK_ENABLE_STRICT=0

# Enable pnpm via corepack, pinned to package.json. pnpm 12 still uses
# lockfileVersion 9.0.
RUN corepack enable && corepack prepare pnpm@12.3.4 --activate \
    && chmod -R a+rX /opt/corepack

# Deps are installed at /app AND mirrored to /opt/app-deps, because the two
# drivers need them in different places:
#   docker — mounts a named volume at /app/node_modules, which Docker seeds from
#            the image's /app/node_modules (see vps.ts reconcileNodeModules).
#   k8s    — mounts the previews PVC over /app (subPath={appId}), which HIDES
#            /app/node_modules. Without a copy outside /app, every new app had to
#            `pnpm install` onto Longhorn RWX: ~25k files over NFS from
#            registry.npmjs.org, i.e. the 10–16 min cold start.
# The mirror is `cp -al` in the same layer, so it is hardlinks — near-zero image
# growth, not a second copy of node_modules.
ENV APP_DEPS=/opt/app-deps
ENV PNPM_BAKED_STORE=/opt/pnpm-store

# Copy package files
COPY package.json pnpm-lock.yaml* ./
ARG NPM_REGISTRY=
# `--registry` / `NPM_REGISTRY` point at npmjs or the in-cluster pull-through
# cache; neither hosts `@joorchin/*`. Configure the scope explicitly instead of
# relying on the app tree carrying a `.npmrc` at this point in the build.
ARG JOORCHIN_NPM_REGISTRY=

# Install dependencies (non-frozen so it tolerates lockfile drift). Keep the
# store too: the incremental-install fallback (agent added a dep the image
# doesn't carry) can then resolve everything else without hitting the registry.
# pnpm install retries: the Iran npm route drops/corrupts tarballs.
# Write config without pnpm: its launcher must resolve the native binary first.
RUN set -eux; \
    if [ -n "$NPM_REGISTRY" ]; then printf 'registry=%s\n' "$NPM_REGISTRY" >> .npmrc; fi; \
    if [ -n "$JOORCHIN_NPM_REGISTRY" ]; then printf '@joorchin:registry=%s\n' "$JOORCHIN_NPM_REGISTRY" >> .npmrc; fi; \
    for i in 1 2 3 4 5; do \
      if pnpm install --ignore-scripts --store-dir="$PNPM_BAKED_STORE"; then break; fi; \
      echo "pnpm install attempt ${i} failed, retrying in 5s"; \
      [ "${i}" = "5" ] && { echo "pnpm install failed after 5 attempts"; exit 1; }; \
      sleep 5; \
    done; \
    mkdir -p "$APP_DEPS"; \
    cp -al /app/node_modules "$APP_DEPS/node_modules"; \
    cp -a /app/package.json "$APP_DEPS/"; \
    if [ -f /app/pnpm-lock.yaml ]; then cp -a /app/pnpm-lock.yaml "$APP_DEPS/"; fi; \
    chmod -R a+rX "$APP_DEPS" "$PNPM_BAKED_STORE"; \
    chown -R 1000:1000 /app/node_modules "$APP_DEPS"; \
    test -x "$APP_DEPS/node_modules/.bin/vite"

# node_modules is root-owned by default, and Docker seeds the per-app named
# volume from it — so the container (uid 1000, --read-only rootfs) could not
# write there and every dependency reconcile / `pnpm add` failed. The chown
# above makes the incremental-install fallback actually usable.

#We dont need to Copy source files for dev server

# Expose port 5173 for internal network access (router proxies here)
EXPOSE 5173

# Normalize legacy pins, then start the installed Vite without a runtime package-manager download.
COPY runtime-pnpm.cjs /opt/runtime-pnpm.cjs
CMD ["sh", "-c", "node /opt/runtime-pnpm.cjs && exec node /app/node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173"]

# Last so bumping IMAGE_VERSION does not bust the pnpm-install layer cache.
ARG PREVIEW_IMAGE_VERSION=0
LABEL joorchin.preview_image_version="${PREVIEW_IMAGE_VERSION}"
