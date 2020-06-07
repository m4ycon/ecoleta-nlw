import { object, string, number, array } from "yup";

const pointSchema = object({
  name: string().required(),
  email: string().email().required(),
  whatsapp: number().required(),
  latitude: number().notOneOf([0]).required(),
  longitude: number().notOneOf([0]).required(),
  city: string().notOneOf(["0"]).required(),
  uf: string().notOneOf(["0"]).max(2).required(),
  items: array().of(number().positive()).required(),
});

export default pointSchema;
