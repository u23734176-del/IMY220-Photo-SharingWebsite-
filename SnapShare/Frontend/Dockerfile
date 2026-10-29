#the base image that your new image will be built upon(Layer 1)
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV VITE_API_TARGET=http://host.docker.internal:3001

# Expose Vite's default dev server port
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]









