// import neo4j from "neo4j-driver";

// const uri = process.env.NEO4J_URI!;
// const username = process.env.NEO4J_USERNAME!;
// const password = process.env.NEO4J_PASSWORD!;

// export const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

import neo4j from "neo4j-driver";

const uri = process.env.NEO4J_URI!;
const user = process.env.NEO4J_USER!;
const password = process.env.NEO4J_PASSWORD!;

export const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "example123"),
);

const connectDB = () => {
  return driver.session();
};

// export default connectDB;
