# syntax=docker/dockerfile:1

# ---- Build stage: install all dependencies and run the CI pipeline ----
# Linting, testing and compiling all run here. If any step fails, the image
# build fails and the pipeline is interrupted. This satisfies the requirement
# that the pipeline steps run inside the Docker image build.
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies from the lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and run the pipeline steps
COPY . .
RUN npm run lint
RUN npm test
RUN npm run build

# ---- Runtime stage: minimal image with production dependencies only ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only production dependencies are needed to run the compiled server
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Compiled server output and the static client assets
COPY --from=build /app/build ./build
COPY --from=build /app/client ./client

EXPOSE 3000
CMD ["node", "build/index.js"]
