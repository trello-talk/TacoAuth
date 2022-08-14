export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
}

export interface TrelloMember {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  initials: string;
  url: string;
}
