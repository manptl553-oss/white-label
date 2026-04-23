import { z } from "zod";

export const idType = z.enum(["DL", "Passport"]);

export type DocumentIdType =
  | "Driving License"
  | "Passport"
  | "International ID";

export type DocumentType = {
  typeId: number;
  documentType: DocumentIdType;
};

export const VALID_DOCUMENTS = [
  "Passport",
  "Driving License",
  "International ID",
];

export const DOCUMENT_TYPE_MAP: Record<number, DocumentIdType> = {
  1: "Driving License",
  2: "Passport",
  7: "International ID",
};

export const idScanDetailsFormSchema = z.object({
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  middleName: z.string().nullish(),
  city: z.string().nonempty("City is required"),
  country: z.string().nonempty("Country is required"),
  countryCode: z.string().nonempty("Country is required"),
  state: z.string().nonempty("State is required"),
  stateCode: z.string().nonempty("State is required"),
  zip: z.string().nonempty("ZIP code is required"),
  address: z.string().nonempty("Address is required"),
  stateId: z.string().nullish(),
  countryId: z.string().nullish(),
});

export type idScanDetailsFormType = z.infer<typeof idScanDetailsFormSchema>;

const BeingLevelHistorySchema = z.object({
  level: z.number().nullish(),
  timestamp: z.string().nullish(),
});

const CoordinatesSchema = z.object({
  lat: z.number().nullish(),
  lng: z.number().nullish(),
});
export type CoordinatesType = z.infer<typeof CoordinatesSchema>;

const LegalAddressResponseSchema = z.object({
  success: z.boolean(),
  distance: z.number().nullish(),
  legalAddressCoordinates: CoordinatesSchema.nullish(),
  currentLocationCoordinates: CoordinatesSchema.nullish(),
  currentBeingId: z.number().nullish(),
  updatedBeingId: z.number().nullish(),
});

export type LegalAddressResponseType = z.infer<
  typeof LegalAddressResponseSchema
>;

export const UpdateAddressSchema = z.object({
  userId: z.string().uuid(),
  level: z.number().nullish(),
  history: BeingLevelHistorySchema.array().nullish(),
  updatedAt: z.string().nullish(),
  addressMatchResponse: z.string().nullish(),
  legalAddressResponse: LegalAddressResponseSchema.nullish(),
});
