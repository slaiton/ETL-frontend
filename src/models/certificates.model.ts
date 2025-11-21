export interface CertificatesIndicator {
  issued: number;
  cancelled: number;
  no_invoice: number;
  start_date: string;
  end_date: string;
  customer_id: number | null;
}

export interface CertificatesIndicatorByPeriod {
  issued: number;
  cancelled: number;
  period: string;
  customer_id: number | null;
}

export interface CertificatesResponse {
  general: CertificatesIndicator;
  period: CertificatesIndicatorByPeriod[];
}