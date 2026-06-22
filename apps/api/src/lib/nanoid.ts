import { nanoid } from "nanoid";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CODE_LENGTH = 7;

export function generateShortCode(length = CODE_LENGTH): string {
  return nanoid(length, ALPHABET);
}
