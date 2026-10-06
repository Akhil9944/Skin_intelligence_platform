# Use official lightweight Node.js 20 image
FROM node:20-alpine

WORKDIR /app

# Copy package definitions
COPY package.json package-lock.json* ./

# Install npm packages
RUN npm install

# Copy application code
COPY . .

# Set production environment variables
ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_ENV=production

# Build Next.js application
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
