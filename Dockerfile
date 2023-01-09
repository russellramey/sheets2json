# NodeJS base
FROM node:latest
# Set app working directory
WORKDIR /app
# Copy dependencies list
COPY package*.json ./
# Run npm install for dependencies
RUN npm install
# Copy app source code to working directory
COPY . .
# Expose port
EXPOSE 33033
# Run app
CMD ["node", "index.js"]
