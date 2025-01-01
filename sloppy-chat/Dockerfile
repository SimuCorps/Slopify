FROM oven/bun:latest

WORKDIR /
COPY . .

RUN bun install

ARG CHAT_ADMIN_KEY

ENV CHAT_ADMIN_KEY=$CHAT_ADMIN_KEY

EXPOSE 8080 

CMD ["bun", "run", "./server/server.ts"]