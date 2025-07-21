# Use an official Node.js runtime as a parent image
FROM node:18-alpine
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
# Install app dependencies
RUN npm install
# Bundle app source
COPY . .
# Your app binds to port 5000, so you need to expose it
EXPOSE 5000
# Define the command to run your app
CMD ["node", "server.js"]
# Build the image
# docker build -t georeport-backend ./backend   

# Tag the image for Artifact Registry
#ocker tag georeport-backend asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/my-docker-repo/georeport-backend:latest



