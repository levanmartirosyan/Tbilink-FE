export type User = {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
  data: {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    profilePhotoUrl: string;
    role: string;
    isEmailVerified: boolean;
  };
};

export type FullUser = {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  country: string | null;
  city: string | null;
  phoneNumber: string | null;
  registerDate: string;
  isEmailVerified: boolean;
  refreshToken: string;
  refreshTokenExpires: string;
  passwordHash: string;
  passwordSalt: string;
  role: string;
  profilePhotoUrl: string;
  coverPhotoUrl: string | null;
  description: string | null;
  photos: any[];
  posts: any[];
  comments: any[];
  likedPosts: any[];
  postCount: number;
  followersCount: number;
  followingCount: number;
  isPublicProfile: boolean;
  showEmail: boolean;
  showPhone: boolean;
  allowTagging: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  timeZone: string;
  isOnline: boolean;
  lastActive: string;
  id: number;
};
