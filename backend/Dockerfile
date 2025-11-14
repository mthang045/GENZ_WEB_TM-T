FROM node:18-alpine
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund || npm install

# Copy source code
COPY src ./src

EXPOSE 4000
CMD ["node", "src/index.js"]
