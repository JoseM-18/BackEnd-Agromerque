FROM node:18

WORKDIR /app

COPY package*.json ./ 

RUN npm install

RUN npm install -g nodemon

RUN npm install -g jsonwebtoken

RUN npm install -g bcryptjs

RUN npm install -g dotenv

RUN npm install -g cors

COPY . .

CMD ["npm", "run", "dev"]