export function ensureString (input: string | string[] | undefined): string {
  return input ? (Array.isArray(input) ? input.join(' ') : input) : '';
}