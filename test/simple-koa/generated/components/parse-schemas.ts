import z from "zod";

const zStringAsNumber = z.preprocess((input: unknown) => {
  const processed = z.string().regex(/^\d+$/).transform(Number).safeParse(input);
  return processed.success ? processed.data : input;
}, z.number());

export const UpdatePetPathParameterSchema = z.object({});

export const UpdatePetQueryParameterSchema = z.object({});

export const AddPetPathParameterSchema = z.object({});

export const AddPetQueryParameterSchema = z.object({});

export const FindPetsByStatusPathParameterSchema = z.object({});

export const FindPetsByStatusQueryParameterSchema = z.object({
  status: z.string().array(),
});

export const FindPetsByTagsPathParameterSchema = z.object({});

export const FindPetsByTagsQueryParameterSchema = z.object({
  tags: z.string().array(),
});

export const GetPetByIdPathParameterSchema = z.object({
  petId: zStringAsNumber,
});

export const GetPetByIdQueryParameterSchema = z.object({});

export const UpdatePetWithFormPathParameterSchema = z.object({
  petId: zStringAsNumber,
});

export const UpdatePetWithFormQueryParameterSchema = z.object({});

export const DeletePetPathParameterSchema = z.object({
  petId: zStringAsNumber,
});

export const DeletePetQueryParameterSchema = z.object({});

export const UploadFilePathParameterSchema = z.object({
  petId: zStringAsNumber,
});

export const UploadFileQueryParameterSchema = z.object({});

export const GetInventoryPathParameterSchema = z.object({});

export const GetInventoryQueryParameterSchema = z.object({});

export const PlaceOrderPathParameterSchema = z.object({});

export const PlaceOrderQueryParameterSchema = z.object({});

export const GetOrderByIdPathParameterSchema = z.object({
  orderId: zStringAsNumber,
});

export const GetOrderByIdQueryParameterSchema = z.object({});

export const DeleteOrderPathParameterSchema = z.object({
  orderId: zStringAsNumber,
});

export const DeleteOrderQueryParameterSchema = z.object({});

export const OrderSchema = z.object({
  id: zStringAsNumber,
  petId: zStringAsNumber,
  quantity: zStringAsNumber,
  shipDate: z.date(),
  status: z.string(),
  complete: z.boolean(),
});

export const CategorySchema = z.object({
  id: zStringAsNumber,
  name: z.string(),
});

export const UserSchema = z.object({
  id: zStringAsNumber,
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string(),
  phone: z.string(),
  userStatus: zStringAsNumber,
});

export const TagSchema = z.object({
  id: zStringAsNumber,
  name: z.string(),
});

export const ApiResponseSchema = z.object({
  code: zStringAsNumber,
  type: z.string(),
  message: z.string(),
});

export const PetSchema = z.object({
  id: zStringAsNumber,
  category: CategorySchema,
  name: z.string(),
  photoUrls: z.string().array(),
  tags: z.array(TagSchema),
  status: z.string(),
});
