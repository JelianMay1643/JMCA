import axios from "axios";

export const getErrorMessage = (
  err: unknown,
  fallback = "Something went wrong. Please try again."
) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};