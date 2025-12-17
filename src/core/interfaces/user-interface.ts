export interface UpdateUser {
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  Email?: string;
  Country?: string;
  City?: string;
  PhoneNumber?: string;
  ProfilePhotoUrl?: string | null;
  CoverPhotoUrl?: string | null;
  Description?: string;

  IsPublicProfile?: boolean;
  ShowEmail?: boolean;
  ShowPhone?: boolean;
  AllowTagging?: boolean;

  EmailNotifications?: boolean;
  PushNotifications?: boolean;
  SmsNotifications?: boolean;
  MarketingEmails?: boolean;

  Language?: string;
  TimeZone?: string;
}
