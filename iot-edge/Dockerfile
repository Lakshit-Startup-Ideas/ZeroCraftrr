FROM python:3.12-slim

WORKDIR /agent

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY ../backend/requirements.txt /tmp/backend-reqs.txt
RUN pip install --no-cache-dir paho-mqtt requests pyyaml

COPY . .

CMD ["python", "agent.py"]