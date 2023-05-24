FROM node:18

WORKDIR /app

COPY package*.json ./ 

RUN npm install

RUN npm install -g nodemon

RUN npm install -g jsonwebtoken

RUN npm install -g bcryptjs

RUN npm install -g dotenv

COPY . .

CMD ["npm", "run", "dev"]