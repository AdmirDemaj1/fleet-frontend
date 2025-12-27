import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { customerApi } from "../api/customerApi";
import {
  setSelectedCustomer,
  setLoading,
  setError,
} from "../slices/customerSlice";

export const useAdministrator = (id: string) => {
  const dispatch = useDispatch();
  const { selectedCustomer, loading, error } = useSelector(
    (state: RootState) => state.customers
  );

  useEffect(() => {
    const fetchAdministrator = async () => {
      if (!id) {
        console.log("useAdministrator: No ID provided");
        return;
      }

      console.log("useAdministrator: Fetching administrator with ID:", id);
      dispatch(setLoading(true));

      try {
        // Always use administrators endpoint for administrators
        const administrator = await customerApi.getAdministratorById(id);
        console.log("useAdministrator: Administrator fetched successfully:", administrator);
        dispatch(setSelectedCustomer(administrator));
        dispatch(setLoading(false));
      } catch (err) {
        console.error("useAdministrator: Error fetching administrator:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch administrator";
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
      }
    };

    fetchAdministrator();
  }, [id, dispatch]);

  return {
    administrator: selectedCustomer,
    loading,
    error,
  };
};

