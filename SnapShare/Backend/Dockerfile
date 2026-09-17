# RUNS the Express + Socekt.IO API server on port

FROM node:20-alpine

WORKDIR /app

# iNSTALL dEPENDENCIES

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
