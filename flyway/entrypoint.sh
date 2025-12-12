#!/bin/bash

# Read secrets from files
CRM_FLYWAY_URL=$(cat "${CRM_FLYWAY_URL_FILE}")
FLYWAY_USER=$(cat "${FLYWAY_USER_FILE}")
FLYWAY_PASSWORD=$(cat "${FLYWAY_PASSWORD_FILE}")

# Run the Flyway command with the secrets
/flyway/flyway \
  -locations="filesystem:./sql" \
  -connectRetries=60 \
  -baselineOnMigrate=true \
  migrate \
  -url="${CRM_FLYWAY_URL}" \
  -user="${FLYWAY_USER}" \
  -password="${FLYWAY_PASSWORD}"
 