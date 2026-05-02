import { compare, genSalt, hash } from 'bcrypt';

export const hashPassword = async (password: string) => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};
export const checkPassword = async (enteredPassword: string, storedHash: string) => {
  return await compare(enteredPassword, storedHash);
};
