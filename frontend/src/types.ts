export interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

export interface UserFormData {
  name: string;
  username: string;
  role: string;
}

export interface MatchedUser extends User {
  matchedAt: string;
}

export interface LikeResult {
  message: string;
  match: boolean;
  matchedWith?: User;
}
