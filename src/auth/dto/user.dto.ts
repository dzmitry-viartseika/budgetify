export class UserDto {
  userId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  accessToken: string;
  refreshToken: string;

  constructor(user: any, tokens: { accessToken: string; refreshToken: string }) {
    this.userId = user._id;
    this.email = user.email;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }
}