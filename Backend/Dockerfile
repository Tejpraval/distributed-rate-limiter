# Use official Node 20 Alpine image for a small footprint
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install all dependencies (including dev tools like typescript needed for building)
RUN npm install

# Copy everything else from the Backend folder
COPY . .

# Compile TypeScript code -> dist/
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the compiled raw JavaScript app (no ts-node in production)
CMD ["npm", "run", "start:prod"]
