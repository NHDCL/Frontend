import { MAINTENANCE_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const maintenanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST Repair Request
    postRepairRequest: builder.mutation({
      query: (requestData) => ({
        url: MAINTENANCE_URL + "/repairs",
        method: "POST",
        body: requestData,
      }),
    }),

    // GET All Repairs
    getAllRepairs: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/repairs",
        method: "GET",
      }),
      transformResponse: (response) => {
        // Assuming response is { success: true, data: [...] }
        return response.data;
      },
    }),
  }),
});

export const { usePostRepairRequestMutation, useGetAllRepairsQuery } =
  maintenanceApiSlice;
