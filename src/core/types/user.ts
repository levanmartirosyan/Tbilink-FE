export type User = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    Id: number;
    FirstName: string;
    LastName: string;
    UserName: string;
    Email: string;
    ProfilePhotoUrl: string;
    IsEmailVerified: boolean;
  };
};
