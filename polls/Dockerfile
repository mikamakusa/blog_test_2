ARG NODE_VERSION=22.0

FROM node:$NODE_VERSION AS builder

RUN groupadd -r nodejs -g 433 && \
    useradd -u 431 -r -g nodejs -s /sbin/nologin -c "Docker image user" nodejs && \
    mkdir -p /home/nodejs && \
    chown -R nodejs:nodejs /home/nodejs

USER nodejs

WORKDIR /home/nodejs

COPY --chown=nodejs:nodejs polls/package*.json ./
RUN npm install
COPY --chown=nodejs:nodejs polls/routes ./routes
COPY --chown=nodejs:nodejs polls/models ./models
COPY --chown=nodejs:nodejs polls/server.js ./server.js

FROM node:$NODE_VERSION

WORKDIR /home/nodejs

COPY --from=builder --chown=nodejs:nodejs /home/nodejs .

EXPOSE 5005

CMD ["npm", "start"]
