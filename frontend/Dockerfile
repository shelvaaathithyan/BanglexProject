
FROM node:20

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./


RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 80

CMD ["npx", "serve", "-s", "dist", "-l", "80"] 

