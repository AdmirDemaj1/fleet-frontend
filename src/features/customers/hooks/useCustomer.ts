import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState } from "../../../app/store";
import { customerApi } from "../api/customerApi";
import { CustomerType } from "../types/customer.types";
import {
  setSelectedCustomer,
  setLoading,
  setError,
} from "../slices/customerSlice";

export const useCustomer = (id: string, customerType?: CustomerType) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { selectedCustomer, loading, error } = useSelector(
    (state: RootState) => state.customers
  );

  // Check if we're viewing an administrator based on the URL path
  const isAdministratorRoute = location.pathname.includes('/administrators/');

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) {
        console.log("useCustomer: No ID provided");
        return;
      }

      console.log("useCustomer: Fetching customer with ID:", id, "isAdministratorRoute:", isAdministratorRoute);
      dispatch(setLoading(true));

      try {
        // Use administrators endpoint if we're on an administrator route
        const customer = isAdministratorRoute 
          ? await customerApi.getAdministratorById(id)
          : await customerApi.getById(id);
        console.log("useCustomer: Customer fetched successfully:", customer);
        dispatch(setSelectedCustomer(customer));
        dispatch(setLoading(false));
      } catch (err) {
        console.error("useCustomer: Error fetching customer:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch customer";
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
      }
    };

    fetchCustomer();
  }, [id, customerType, location.pathname, dispatch]);

  return {
    customer: selectedCustomer,
    loading,
    error,
  };
};
