# Blog MT Importer

A Node.js/NestJS application for importing MovableType format blog backups into PostgreSQL database.

## Features

- Import MT format blog backups
- Store blog posts in PostgreSQL
- RESTful API for blog management
- Built with NestJS and TypeScript

## Prerequisites

- Node.js (v20 or higher recommended)
- PostgreSQL
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and update the database connection settings:

```bash
cp .env.example .env
```

## Running the application

```bash
# development
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```