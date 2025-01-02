FROM python:3-slim

WORKDIR /app

# Copy all static files
COPY . .

# Expose port 3000
EXPOSE 3000

# Run Python's HTTP server on port 3000
CMD ["python3", "-m", "http.server", "3000"]