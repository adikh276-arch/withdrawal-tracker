# Withdrawal Tracker

A React application to track your healing journey and withdrawal symptoms.

## Features

- Track withdrawal symptoms
- Monitor intensity level over time
- View check-in history
- Multiple language support

## Tech Stack

- Vite
- React
- Tailwind CSS
- shadcn/ui
- i18next
- React Router

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

The application will be available at `http://localhost:8080/withdrawal_tracker/`.

## Deployment

The application is containerized using Docker and can be deployed to any container orchestration platform.

### Docker

```bash
docker build -t withdrawal-tracker .
docker run -p 80:80 withdrawal-tracker
```
