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

export interface Certificate {
  id: number;
  consecutive: string;
  factus_bill_consecutive: string;
  waybill: string;
  policy_id: number;
  start_at: string;      // ISO datetime
  end_at: string;        // ISO datetime
  customer_id: number | null;
  bill_url: string | null;
  billing_price: string;
  created_at: string;    // ISO datetime
  deleted_at: string | null;
}