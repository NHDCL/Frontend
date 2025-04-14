import { MAINTENANCE_URL } from "../constants";
import { apiSlice } from "./apiSlice";
export const maintenanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
   
    postRepairRequest: builder.mutation({
      query: (requestData) => ({
        url: MAINTENANCE_URL + "/repairs", // API endpoint for posting assets
        method: "POST",
        body: requestData, // Send the new asset data as the request body
      }),
    }),

    assignRepair: builder.mutation({
      query: ({ repairId, email }) => ({
        url: MAINTENANCE_URL + `/schedule/${repairId}`,
        method: "PUT",
        body: { email },
      }),
      invalidatesTags: ["MaintenanceRequest"], // adjust as needed
    }),

    
  }),
});

export const {
  usePostRepairRequestMutation,
  useAssignRepairMutation,
} = maintenanceApiSlice;
