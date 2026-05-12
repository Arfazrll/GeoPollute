FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY src/ ./src/

# Non-root user
RUN useradd -m -u 1000 producer
USER producer

CMD ["python", "-u", "src/simulate.py"]