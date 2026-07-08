export const isStrathmoreEmail = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    normalizedEmail.endsWith("@strathmore.edu") ||
    normalizedEmail === "admin@stratmore.edu"
  );
};

export const passwordsMatch = (
  password: string,
  confirmPassword: string
) => {
  return password === confirmPassword;
};

export const isEmpty = (...values: string[]) => {
  return values.some((value) => value.trim() === "");
};
