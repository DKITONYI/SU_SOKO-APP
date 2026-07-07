export const isStrathmoreEmail = (email: string) => {
  return email.endsWith("@strathmore.edu");
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