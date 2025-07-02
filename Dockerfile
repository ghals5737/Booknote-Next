FROM node:20-alpine as builder

WORKDIR /app

COPY . .
RUN npm install

RUN npm run build


EXPOSE 3000

CMD ["npm", "start"]