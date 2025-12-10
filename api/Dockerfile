FROM denoland/deno:alpine-2.5.1

EXPOSE 7777

WORKDIR /app

COPY src/deps.js .
COPY deno.json .

RUN DENO_FUTURE=1 deno install

ENV ENV=production

COPY . .

CMD [ "run", "--allow-net", "--allow-read", "--allow-env", "src/server.js"]
