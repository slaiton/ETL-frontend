import {
  processCertificatesCancellation,
  searchCertificatesForCancellation,
} from "../../../api/cancellation";

export const useCertificateCancellation = () => {
  const search = async (waybills: string[]) => {
    return await searchCertificatesForCancellation(waybills);
  };

  const process = async (waybills: string[]) => {
    return await processCertificatesCancellation(waybills);
  };

  return {
    search,
    process,
  };
};