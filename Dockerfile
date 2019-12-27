FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run compile
RUN npm test
EXPOSE 3000
CMD [ "npm", "start" ]