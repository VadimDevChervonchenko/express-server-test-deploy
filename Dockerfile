FROM node:14.17-alpine AS build

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json package-lock.json ./
RUN npm install --silent
COPY . ./

EXPOSE 8080

CMD ["npm", "start"]
