FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG SITE_URL
ARG COMPANY_NAME
ARG SUPABASE_URL
ENV SITE_URL=${SITE_URL}
ENV COMPANY_NAME=${COMPANY_NAME}
ENV SUPABASE_URL=${SUPABASE_URL}
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/node_modules ./node_modules/

ENV HOST=0.0.0.0
ENV PORT=3000
ARG SITE_URL
ARG COMPANY_NAME
ARG SUPABASE_URL
ENV SITE_URL=${SITE_URL}
ENV COMPANY_NAME=${COMPANY_NAME}
ENV SUPABASE_URL=${SUPABASE_URL}
EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"] 