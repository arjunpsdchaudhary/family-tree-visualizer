// src/neo4j/client.ts

import neo4j from "neo4j-driver";

const uri = process.env.NEO4J_URI;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

if (!uri) {
  throw new Error("NEO4J_URI is not configured");
}

if (!username) {
  throw new Error("NEO4J_USERNAME is not configured");
}

if (!password) {
  throw new Error("NEO4J_PASSWORD is not configured");
}

export const neo4jDriver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password),
);
