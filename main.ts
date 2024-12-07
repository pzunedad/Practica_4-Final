import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { MongoClient } from "mongodb";
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import { VehicleModel, PartsModel } from "./types.ts";

const MONGO_URL = "mongodb+srv://otheruser:123456aaabbb@clusterpedro.txa9b.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPedro";

if (!MONGO_URL) {
  throw new Error("Please provide a MONGO_URL");
}

// Conexión con MongoDB
const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();
console.info("Connected to MongoDB");

const mongoDB = mongoClient.db("vehiculos");

// Colecciones de MongoDB
const VehiclesCollection = mongoDB.collection<VehicleModel>("vehiculos");
const PartsCollection = mongoDB.collection<PartsModel>("partes");

// Configuración del servidor Apollo
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async () => ({
    VehicleCollection: VehiclesCollection, // Cambiar el nombre aquí
    PartsCollection,
  }),
});


console.info(`🚀 Server ready at ${url}`);
