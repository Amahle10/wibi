# Use Node 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy all source files
COPY . .

# Expose the port your server runs on
EXPOSE 5000

# Set environment variable for ESM (optional, usually not needed if "type": "module" in package.json)
ENV NODE_OPTIONS=--experimental-specifier-resolution=node

# Start server
CMD ["node", "src/server.js"]
