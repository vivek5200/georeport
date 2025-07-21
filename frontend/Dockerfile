# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine
# Copy the built files from the 'build' stage
# Changed /app/build to /app/dist to match Vite's output
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 80 for Nginx
EXPOSE 80
# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]