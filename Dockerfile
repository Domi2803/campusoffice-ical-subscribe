# Use an official Node.js runtime (Node.js 16) as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy the entire application directory to the root of the container's working directory
COPY ./src ./

# Copy the package.json and package-lock.json files to the working directory
COPY ./src/package*.json ./

# Install TypeScript globally and other dependencies
RUN npm install -g typescript && npm install

# Compile TypeScript code
RUN tsc

# Expose port 3000 for the Express app
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
