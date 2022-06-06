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
EXPOSE 3030
# Run app
CMD ["node", "index.js"]
