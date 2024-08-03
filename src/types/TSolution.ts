export interface UserSolutionItem {
  Key: string;
  Value: Array<{ Key: string; Value: string }>;
}
export interface TUserSolution {
  userSolution: UserSolutionItem[]
}
