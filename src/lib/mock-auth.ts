import type { Role } from "@/types";

export interface MockEmployeeAccount {
  employeeId: string;
  password: string;
  role: Role;
}

export const MOCK_EMPLOYEE_ACCOUNTS: MockEmployeeAccount[] = [
  {
    employeeId: "EMP-0421-M",
    password: "manager123",
    role: "manager",
  },
  {
    employeeId: "EMP-0421-S",
    password: "staff123",
    role: "staff",
  },
];

export function authenticateMockEmployee(employeeId: string, password: string) {
  const normalizedEmployeeId = employeeId.trim().toUpperCase();

  return (
    MOCK_EMPLOYEE_ACCOUNTS.find(
      (account) =>
        account.employeeId === normalizedEmployeeId &&
        account.password === password,
    ) ?? null
  );
}
