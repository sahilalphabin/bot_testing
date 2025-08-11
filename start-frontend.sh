#!/bin/bash

# Start the frontend development server from repo root
cd frontend || exit 1

# Prefer bun over npm
bun run dev

