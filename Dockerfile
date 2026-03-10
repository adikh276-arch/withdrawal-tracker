FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for public environment variables
ARG VITE_DATABASE_URL
ARG VITE_NEON_PROJECT_ID
ARG VITE_NEON_API_KEY

# Set environment variables for the build process
ENV VITE_DATABASE_URL=$VITE_DATABASE_URL
ENV VITE_NEON_PROJECT_ID=$VITE_NEON_PROJECT_ID
ENV VITE_NEON_API_KEY=$VITE_NEON_API_KEY

# Also include the requested non-VITE prefixed ones for system context
ENV DATABASE_URL=$VITE_DATABASE_URL
ENV NEON_PROJECT_ID=$VITE_NEON_PROJECT_ID
ENV NEON_API_KEY=$VITE_NEON_API_KEY

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist /usr/share/nginx/html/withdrawal_tracker

RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
