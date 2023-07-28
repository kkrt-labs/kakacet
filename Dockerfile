FROM node:18

WORKDIR /app

COPY package*.json ./
RUN yarn install
RUN yarn config set registry https://registry.npmjs.org/
RUN yarn config set network-timeout 1200000

COPY . .
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
