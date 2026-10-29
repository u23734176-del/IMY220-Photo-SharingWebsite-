# RUNS the Express + Socekt.IO API server on port

# specifies the base image that your new image will be built upon 
FROM node:20-alpine

# sets the working directory for any command that follows it in the image
WORKDIR /app

# INSTALL dEPENDENCIES
#    instruction copies a local file from the host machine into the current working directory
#    COPY <file> <location>
COPY package*.json ./
#   used to execute any commands during the image build process
#   --omit=dev  = image is smaller
RUN npm install --omit=dev 
#    copy all files in the hosts current directory to the images current directory 
COPY . .
#   is used to set environmental variables inside the image which will be available during build time/running the application
#   ENV <key> <value>
ENV NODE_ENV=production
ENV PORT=3001
#    is used to tell docker which ports the container will listen to when it is running
EXPOSE 3001
#   sets the command that will be executed when a container is run from the image
#   CMD [ “<first part of command>”, “<second part of command>” ]
CMD ["node", "server.js"]
