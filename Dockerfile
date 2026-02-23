FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
