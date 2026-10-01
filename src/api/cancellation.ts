import { axiosClient } from "../shared/api/axiosClient";

export const searchCertificatesForCancellation = async (
  waybills: string[]
) => {
  const response = await axiosClient.post(
    "/certificates/cancellation/search",
    waybills
  );

  return response.data;
};

export const processCertificatesCancellation = async (
  waybills: string[]
) => {
  const response = await axiosClient.post(
    "/certificates/cancellation/process",
    waybills
  );

  return response.data;
};