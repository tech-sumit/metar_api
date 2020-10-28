FROM node:10-slim

WORKDIR /metar
COPY . /metar

RUN npm install

EXPOSE ${PORT}

CMD node index.js
