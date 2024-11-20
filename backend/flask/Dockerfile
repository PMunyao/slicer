# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install necessary packages
RUN pip install flask

# Copy the Flask app code
COPY app.py.

# Expose a port for web access
EXPOSE 5001

# Start the Flask app by default
CMD ["flask", "run", "--host=0.0.0.0"]
