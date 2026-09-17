FROM node:20-alpine

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Run Vite bound to all network interfaces so localhost port forwarding works
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]




