/**
 * Alfabeto seguro para códigos de convite legíveis:
 * Remove caracteres comumente confundidos (0, O, 1, I).
 */
const INVITE_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Gera um código de convite único aleatório de tamanho fixo em caixa alta.
 *
 * @param length Tamanho do código (padrão: 6 caracteres).
 * @returns String contendo o código gerado em caixa alta.
 */
export function generateInviteCode(length: number = 6): string {
  let result = '';
  const alphabetLength = INVITE_CODE_ALPHABET.length;

  // Usa Web Crypto API compatível com Cloudflare Workers e Node 18+
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % alphabetLength;
    result += INVITE_CODE_ALPHABET.charAt(randomIndex);
  }

  return result;
}
