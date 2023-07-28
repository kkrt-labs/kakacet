FROM node:18

WORKDIR /app

COPY . .
RUN yarn install --offline --frozen-lockfile

EXPOSE 3000

CMD ["yarn", "start"]
