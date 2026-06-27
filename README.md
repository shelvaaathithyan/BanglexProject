# Banglex Project

## Docker Commands for the Backend

### Build the Docker image
```bash
# From the project root
docker build -t banglex-backend ./backend
```

### Run the container (up)
```bash
# Expose port 3000 and load environment variables from the .env file
docker run --rm -p 3000:3000 --env-file ./backend/.env banglex-backend
```

### Stop the container (down)
If you started the container in the background (e.g., with `-d`), you can stop it using:
```bash
# Find the container ID and stop it
docker ps --filter "ancestor=banglex-backend"
# Then stop using the container ID, e.g.:
docker stop <container_id>
```

*Alternatively, if you use Docker Compose (once a `docker-compose.yml` is added), you can bring the service up and down with:* 
```bash
docker compose up -d   # start
docker compose down    # stop
```
