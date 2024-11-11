# Stage 1: Install dependencies
FROM node:18 AS base

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon and ts-node globally for development
RUN npm install -g nodemon ts-node typescript

# Stage 2: Development image with volume syncing
FROM base AS development

# Copy the entire project (excluding files in .dockerignore)
COPY . .

# Expose the application port (e.g., 3000)
EXPOSE 3000

# Command to run in development
CMD ["npm", "run", "dev"]

# Stage 3: Production image with built files
FROM base AS production

# Copy source code and build the app
COPY . .
RUN npm run build

# Use a lightweight production-only image
FROM node:18-alpine

# Set working directory in production
WORKDIR /app

# Copy dependencies and build artifacts from the previous stage
COPY --from=production /app/package*.json ./
COPY --from=production /app/dist ./dist

# Install only production dependencies
RUN npm install --only=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
