export class UserDto {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  accessToken: string;
  refreshToken: string;

  constructor(user: any, tokens: any) {
    this.id = user.id;
    this.email = user.email;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }
}