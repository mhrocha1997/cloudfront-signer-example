FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .

RUN yarn build

FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN yarn install --production

EXPOSE 3000
CMD ["node", "dist/index.js"]
