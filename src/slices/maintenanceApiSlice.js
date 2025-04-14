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
        return response.data;
      },
    }),

    // Assign Repair
    assignRepair: builder.mutation({
      query: ({ repairId, email }) => ({
        url: MAINTENANCE_URL + `/schedule/${repairId}`,
        method: "PUT",
        body: { email },
      }),
      invalidatesTags: ["MaintenanceRequest"],
    }),

    // GET Repair Requests
    getRepairRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/repairs",
        method: "GET",
      }),
      providesTags: ["repair"],
    }),

    // GET Maintenance Requests
    getMaintenanceRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/maintenance",
        method: "GET",
      }),
      providesTags: ["maintenance"],
    }),

    // Accept or Reject Repair Request
    acceptOrRejectRepairRequest: builder.mutation({
      query: ({ repairId, accept }) => ({
        url: `${MAINTENANCE_URL}/repairs/${repairId}/accept`,
        method: "PUT",
        body: JSON.stringify({ accept }),
        headers: {
          "Content-Type": "application/json",
        },
        responseHandler: (response) => response.text(),
      }),
      invalidatesTags: ["RepairRequest"],
    }),
  }),
});

export const {
  usePostRepairRequestMutation,
  useGetAllRepairsQuery,
  useAssignRepairMutation,
  useGetRepairRequestQuery,
  useGetMaintenanceRequestQuery,
  useAcceptOrRejectRepairRequestMutation,
} = maintenanceApiSlice;
