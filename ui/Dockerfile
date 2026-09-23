FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM deps AS build
COPY . .
ARG API_URL=https://api-intervivo.rr-dev.ro/api/v1
# Angular does not read process.env at build time, so the API base URL must
# be written into this file before `ng build` runs, not just exported as an
# env var — see ui/src/app/core/config/api.config.ts.
RUN echo "export const API_BASE_URL = '${API_URL}';" \
      > src/app/core/config/api.config.ts
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=build /app/dist/ui/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
