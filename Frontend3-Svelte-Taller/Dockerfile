FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# App standalone (SvelteKit estático) + bundle MFE (ES module para single-spa)
RUN npm run build && npm run build:mfe

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/dist-mfe /usr/share/nginx/html/mfe-assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
