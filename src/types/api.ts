export interface ImageSettings {
  isCard: string;
  isText: string;
  isMode: string;
  contributeCount: number;
}

export interface UserData {
  lastUpdated?: string;
  imageSettings?: ImageSettings;
  loginId?: string;
  first_login?: string;
  last_login?: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
}
