import { Collection, ObjectId } from "mongodb";
import { Vehicle, VehicleModel, Parts, PartsModel } from "./types.ts";
import { fromModelToVehicle, fromModelToparts,fetchJoke } from "./utils.ts";

export const resolvers = {
  Query: {
    vehicles: async (
      _: unknown,
      __: unknown,  
      context: { VehicleCollection: Collection<VehicleModel> , PartsCollection: Collection<PartsModel> },
    ): Promise<Vehicle[]> => {
      const vehiclesModel = await context.VehicleCollection.find().toArray();
      return Promise.all(
        vehiclesModel.map(async (vehicleModel) => {
          const joke = await fetchJoke();
          const partsModel = await context.PartsCollection.find({ vehicleId: vehicleModel._id!.toString() }).toArray();
          const parts = partsModel.map((partModel) => fromModelToparts(partModel));
          return fromModelToVehicle(vehicleModel, parts, joke);
        }),
      );
    },

    vehicle: async (
      _: unknown,
      { id }: { id: string },
      context: { VehicleCollection: Collection<VehicleModel>, PartsCollection: Collection<PartsModel> },
    ): Promise<Vehicle | null> => {
      const vehicleModel = await context.VehicleCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!vehicleModel) return null;
      const joke = await fetchJoke();
      const partsModel = await context.PartsCollection.find({ vehicleId: id }).toArray();
      const parts = partsModel.map((partModel) => fromModelToparts(partModel));

      return fromModelToVehicle(vehicleModel, parts, joke);
    },

    parts: async (
      _: unknown,
      __: unknown,
      context: { PartsCollection: Collection<PartsModel> },
    ): Promise<Parts[]> => {
      const partsModel = await context.PartsCollection.find().toArray();
      return partsModel.map((partModel) => fromModelToparts(partModel));
    },

    vehiclesByManufacturer: async (
      _: unknown,
       manufacturer : { manufacturer: string },
      context: { VehicleCollection: Collection<VehicleModel>, PartsCollection: Collection<PartsModel> },
    ): Promise<Vehicle[]> => {
      const vehicleM = await context.VehicleCollection.find(manufacturer).toArray();
      return Promise.all(
        vehicleM.map(async (vehicleModel) => {
          const joke = await fetchJoke();
          return fromModelToVehicle(vehicleModel, [], joke);
        }),
      );
    },

    partsByVehicle: async (
      _: unknown,
      { vehicleId }: { vehicleId: string },
      context: { PartsCollection: Collection<PartsModel> },
    ): Promise<Parts[]> => {
      const partsModel = await context.PartsCollection.find({
        vehicleId,
      }).toArray();
      return partsModel.map((partsModel) => fromModelToparts(partsModel));
    },

    vehiclesByYearRange: async (
      _: unknown,
      { startYear, endYear }: { startYear: number; endYear: number },
      context: { VehicleCollection: Collection<VehicleModel> },
    ): Promise<Vehicle[]> => {
      const vehiclesModel = await context.VehicleCollection.find({
        year: { $gte: startYear, $lte: endYear },
      }).toArray();
      return Promise.all(
        vehiclesModel.map(async (vehicleModel) => {
          const joke = await fetchJoke();
          return fromModelToVehicle(vehicleModel, [], joke);
        }),
      );
    },
  },

  Mutation: {
    addVehicle: async (
      _: unknown,
      args: { name: string; manufacturer: string; year: number },
      context: {
        VehicleCollection: Collection<VehicleModel>;
        PartCollection: Collection<PartsModel>;
      },
    ): Promise<Vehicle | null> => {
      const { name, manufacturer, year } = args;
    
      const result = await context.VehicleCollection.findOne({ manufacturer, year });
    
      if (result?.name === name) {
        return null;
      }
    
      // Inserta un nuevo vehículo
      const { insertedId } = await context.VehicleCollection.insertOne({
        name,
        manufacturer,
        year,
      });
    
      const vModel = {
        _id: insertedId,
        name,
        manufacturer,
        year,
        parts: [], // Corregido el uso del arreglo
      };
    
      return fromModelToVehicle(vModel, [], await fetchJoke());
    },
    

    addParts: async (
      _: unknown,
      args: { name: string; price: number; vehicleId: string },
      context: { PartsCollection: Collection<PartsModel> },
    ): Promise<Parts> => {
      const { name, price, vehicleId } = args;
      const { insertedId } = await context.PartsCollection.insertOne({
        name,
        price,
        vehicleId,
      });
      const partsModel = {
        _id: insertedId,
        name,
        price,
        vehicleId,
      };
      return fromModelToparts(partsModel);
    },

    updateVehicle: async (
      _: unknown,
      { id, name, manufacturer, year }: { id: string; name: string; manufacturer: string; year: number },
      context: { VehiclesCollection: Collection<VehicleModel> },
    ): Promise<Vehicle | null> => {
      const result = await context.VehiclesCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { name, manufacturer, year } },
        { returnDocument: "after" },
      );

      if (!result) return null;

      return fromModelToVehicle(result, [], ""); 
    },

    deleteParts: async (
      _: unknown,
      args: { id: string },
      context: { PartsCollection: Collection<PartsModel> },
    ): Promise<Parts | null> => {
      const result = await context.PartsCollection.findOneAndDelete({
        _id: new ObjectId(args.id),
      });
      if (!result) return null;
      return fromModelToparts(result);
    },
  },
};
