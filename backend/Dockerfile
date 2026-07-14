# Use an official lightweight Node.js image
FROM node:20.9.0-bullseye-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (only production) using npm ci for reproducibility
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

# Set environment variables for production mode
ENV NODE_ENV=production

# Expose the port the app runs on (default 3000)
EXPOSE 3000

# Create writable data directory for reviews
RUN mkdir -p data/reviews && chown -R node:node data

# Use non‑root user provided by the node image
USER node

# Default command (will use npm start if script exists)
CMD ["npm", "start"]
