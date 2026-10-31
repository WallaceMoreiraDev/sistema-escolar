/**
 * Utilitário de moderação em 1ª camada (Filtro Local em Memória).
 * Executa em < 1ms através de normalização textual e regexes estritas em português.
 */

// Termos e expressões ofensivas, termos de ódio, pornografia e calúnias em português (sem acentuação)
const PROFANITY_PATTERNS: RegExp[] = [
  // Palavrões e xingamentos comuns
  /\bcaralh[oa]s?\b/i,
  /\bp[oe]rr?as?\b/i,
  /\bput[ao]s?\b/i,
  /\bputinh[ao]s?\b/i,
  /\bfod[a-z0-9_-]*\b/i, // foda, foder, fodeu, fodase, fodasse, etc.
  /\bfud[a-z0-9_-]*\b/i, // fudeu, fudido, fudida, etc.
  /\bmerd[ao]s?\b/i,
  /\bbostas?\b/i,
  /\bcacetes?\b/i,
  /\bbucet[ao]s?\b/i,
  /\bbucetinh[ao]s?\b/i,
  /\barrombad[ao]s?\b/i,
  /\bdesgracad[ao]s?\b/i,
  /\bvagabund[ao]s?\b/i,
  /\botari[ao]s?\b/i,
  /\bbabacas?\b/i,
  /\bcorn[ao]s?\b/i,
  /\bchifrud[ao]s?\b/i,
  /\btrouxas?\b/i,
  /\bcu(z|s)[aã]os?\b/i,
  /\bcu\b/i,
  /\bvadi[ao]s?\b/i,
  /\bpiranhas?\b/i,
  /\bescrot[ao]s?\b/i,
  /\bfilh[ao]\s+d[ae]\s+put[ao]\b/i,
  /\bvai\s+(se\s+)?(foder|fuder|tomar\s+no\s+cu)\b/i,
  /\btnc\b/i,
  /\bfdp\b/i,
  /\bvsf\b/i,

  // Termos homofóbicos, transfóbicos e discriminatórios
  /\bviad[ao]s?\b/i,
  /\bviadinh[ao]s?\b/i,
  /\bbichas?\b/i,
  /\bsapat[aã]os?\b/i,
  /\btravecos?\b/i,
  /\bretardad[ao]s?\b/i,
  /\bmongol(oide)?s?\b/i,
  /\bnazistas?\b/i,
  /\bhitler\b/i,

  // Conteúdo sexual, pornografia e nudez
  /\bporn[oô](grafia)?s?\b/i,
  /\bnudes?\b/i,
  /\bxvideos\b/i,
  /\bredtube\b/i,
  /\bonlyfans\b/i,
  /\bboquetes?\b/i,
  /\bpunhet[ao]s?\b/i,
  /\bmasturba[a-z]*\b/i,
  /\bpenis\b/i,
  /\bvagina\b/i,
  /\borgasmos?\b/i,

  // Drogas ilícitas e apostas predatórias no contexto escolar
  /\bcocaina\b/i,
  /\bcrack\b/i,
  /\bheroina\b/i,
  /\btigrinho\b/i,
  /\bcassino\b/i,
];

/**
 * Normaliza o texto removendo acentuações, pontuações redundantes,
 * convertendo substituições leetspeak simples e colapsando caracteres repetidos.
 */
function normalizeText(input: string): string {
  if (!input) return '';

  let normalized = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase();

  // Substituições de leetspeak e camuflagem de caracteres
  normalized = normalized
    .replace(/[@4]/g, 'a')
    .replace(/[#*&3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's');

  // Colapsa 3 ou mais caracteres repetidos consecutivos para 1 (ex: puuuta -> puta)
  normalized = normalized.replace(/(.)\1{2,}/g, '$1');

  return normalized;
}

/**
 * Valida síncrona e localmente se o texto contém palavras de baixo calão, ofensas ou termos inapropriados.
 * Retorna { isClean: true } se limpo, ou { isClean: false, detectedTerm: string } se ofensivo.
 */
export function checkLocalProfanity(text: string): { isClean: boolean; detectedTerm?: string } {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return { isClean: true };
  }

  const normalized = normalizeText(text);

  for (const pattern of PROFANITY_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      return {
        isClean: false,
        detectedTerm: match[0],
      };
    }
  }

  return { isClean: true };
}
