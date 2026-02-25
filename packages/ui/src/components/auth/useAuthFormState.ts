import * as React from "react";

export type AuthFormState = {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useAuthFormState(initial?: { email?: string; password?: string }): AuthFormState {
  const [email, setEmail] = React.useState(initial?.email ?? "");
  const [password, setPassword] = React.useState(initial?.password ?? "");
  const [isLoading, setIsLoading] = React.useState(false);

  return { email, setEmail, password, setPassword, isLoading, setIsLoading };
}
