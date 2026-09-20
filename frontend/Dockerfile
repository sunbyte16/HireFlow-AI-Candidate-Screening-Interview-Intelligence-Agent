FROM node:24-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["node", "./node_modules/vite/bin/vite.js", "--host", "0.0.0.0", "--port", "5173"]
