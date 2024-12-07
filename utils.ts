import { Vehicle, Parts, PartsModel, VehicleModel } from "./types.ts";

export const fromModelToVehicle = (vehicleModel: VehicleModel,parts: Parts[] = [],joke: string): Vehicle => {
  return {
    id: vehicleModel._id!.toString(),
    name: vehicleModel.name,
    manufacturer: vehicleModel.manufacturer,
    year: vehicleModel.year,
    joke: joke, 
    parts,
  };
};


export const fromModelToparts= (partsModel: PartsModel): Parts=> {
  return {
    id: partsModel._id!.toString(),
    name: partsModel.name,
    price: partsModel.price,
    vehicleId: partsModel.vehicleId,
  };
};

export const fetchJoke = async (): Promise<string> => {
  const response = await fetch("https://official-joke-api.appspot.com//jokes/random");
  if (!response.ok) {
    return "No joke available at the moment.";
  }
  const data = await response.json();
  return data.setup + " - " + data.punchline;
};