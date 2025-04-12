import { MAINTENANCE_URL } from "../constants";
import { apiSlice } from "./apiSlice";
export const maintenanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
   
    postAsset: builder.mutation({
      query: (newAsset) => ({
        url: MAINTENANCE_URL + "/repairs", // API endpoint for posting assets
        method: "POST",
        body: newAsset, // Send the new asset data as the request body
      }),
    }),

    
  }),
});

export const {
  usePostAssetMutation,
} = assetApiSlice;
