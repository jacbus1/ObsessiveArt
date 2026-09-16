FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json server.mjs index.html style.css manifest.webmanifest sw.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node assets ./assets
USER node
ENV HOST=0.0.0.0 PORT=4173
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:4173/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
