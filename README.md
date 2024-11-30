# Durak (Server)

## Prerequisites

Make sure you have the following tools installed:
- [Docker](https://docs.docker.com/engine/install)
- [Node.js (>= v18.x)](https://nodejs.org/en/download/package-manager)
- [pnpm](https://pnpm.io/installation)

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/geforseN/durak-server
   cd durak-server
   ```

2. **Setup environment variables**:
   ```bash
   mv .env.example .env
   ```

3. **Run Docker**:
   ```bash
   docker compose up -d
   ```
   This will start the PostgreSQL container in detached mode.

4. **Install dependencies**:
   ```bash
   pnpm i
   ```

5. **Run the development server**:
   ```bash
   pnpm dev
   ```
