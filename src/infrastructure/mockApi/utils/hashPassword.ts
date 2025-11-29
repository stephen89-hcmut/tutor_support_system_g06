export function hashPassword(password: string): string {
  return btoa(password);
}



