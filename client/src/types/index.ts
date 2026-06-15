export interface EmployeeListItem {
  id: number;
  fullName: string;
  position: string;
  photoUrl: string;
  likes: number;
  dislikes: number;
}

export interface AdminEmployee extends EmployeeListItem {
  description: string;
  isActive: boolean;
}

export interface EmployeeDetail {
  id: number;
  fullName: string;
  position: string;
  description: string;
  photoUrl: string;
  isActive: boolean;
  likes: number;
  dislikes: number;
}

export interface Comment {
  id: number;
  employeeId: number;
  text: string;
  createdAt: string;
}

export interface RatingItem {
  id: number;
  fullName: string;
  position: string;
  description: string;
  photoUrl: string;
  likes: number;
  dislikes: number;
  commentsCount: number;
  score: number;
}

export type VoteType = "LIKE" | "DISLIKE";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}
