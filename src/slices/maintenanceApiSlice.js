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

    // get repir resquest
    getRepairRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/repairs",
        method: 'GET',
      }),
      providesTags: ["repair"]
    }),

    // get MAINTENANCE resquest
    getMaintenanceRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/maintenance",
        method: 'GET',
      }),
      providesTags: ["maintenance"]
    }),

    acceptOrRejectRepairRequest: builder.mutation({
      query: ({ repairId, accept }) => ({
        url: `${MAINTENANCE_URL}/repairs/${repairId}/accept`,
        method: "PUT",
        body: JSON.stringify({ accept }),
        headers: {
          "Content-Type": "application/json",
        },
        responseHandler: (response) => response.text(), // 👈 Tell it to handle text
      }),
      invalidatesTags: ["RepairRequest"],
    }),
    
  }),
});

export const {
  usePostRepairRequestMutation,
  useAssignRepairMutation,
  useGetRepairRequestQuery,
  useGetMaintenanceRequestQuery,
  useAcceptOrRejectRepairRequestMutation,
} = maintenanceApiSlice;
