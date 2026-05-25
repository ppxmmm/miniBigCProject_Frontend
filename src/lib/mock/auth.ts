export type MockUser = {
  id: string;
  email: string;
  name: string;
  password: string; // plain-text for mock only
  role?: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "u_001",
    email: "employee@example.com",
    name: "Employee One",
    password: "password123",
    role: "staff",
  },
  {
    id: "u_002",
    email: "manager@example.com",
    name: "Manager Mae",
    password: "managerpw",
    role: "manager",
  },
];

export function verifyCredentials(email: string, password: string) {
  const user = mockUsers.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  // Return a lightweight session object for demo purposes
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? "staff",
    token: `mock-token-${user.id}`,
  };
}
