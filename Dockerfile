FROM node:18

WORKDIR /app

COPY package*.json ./ 

RUN npm install

RUN npm install -g nodemon

RUN npm install -g jsonwebtoken

COPY . .

CMD ["npm", "start"]