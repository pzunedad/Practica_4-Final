export const schema = `#graphql
type Vehicle {
  id: ID!
  name: String!
  manufacturer: String!
  year: Int!
  joke: String!
  parts: [Parts!]!
  }

type Parts {
  id: ID!,
  name:String!,
  price: Float!,
  vehicleId: String!,
}

type Query {
  vehicles: [Vehicle!]!
  vehicle(id: ID!): Vehicle
  parts: [Parts!]!
  vehiclesByManufacturer(manufacturer: String!): [Vehicle!]!
  partsByVehicle(vehicleId: String!): [Parts!]!
  vehiclesByYearRange(startYear: Int!, endYear: Int!): [Vehicle!]!
}

type Mutation {
  addVehicle(name: String!, manufacturer: String!, year: Int!): Vehicle!
  addParts(name: String!, price: Float!, vehicleId: String!): Parts!
  updateVehicle(id: ID!, name: String!, manufacturer: String!, year: Int!): Vehicle!
  deleteParts(id: ID!): Parts
}
`;
