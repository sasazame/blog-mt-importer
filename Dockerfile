FROM node:18-alpine

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create directories for logs and exports
RUN mkdir -p logs exports

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "run", "start"]