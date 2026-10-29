#the base image that your new image will be built upon(Layer 1)
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Layer 5
CMD [ "npm" ,"run" ,"dev" ,"--" ,"--host" ,"0.0.0.0" ,"--port" ,"5173"]


#Use  to build container first " docker build -t frontend-dev ."
#use to run the container ""

# Expose Vite's default dev server port
EXPOSE 5173








