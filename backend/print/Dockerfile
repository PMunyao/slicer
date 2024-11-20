FROM python:3.9-slim

# Install dependencies
RUN pip install bambu-cli

# Set the working directory
WORKDIR /app

# Copy the Bambu CLI configuration file
COPY bambu-cli.conf /app/

# Expose the port
EXPOSE 8080

# Run the Bambu CLI command
CMD ["bambu-cli", "start", "-c", "/app/bambu-cli.conf"]
