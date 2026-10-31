import { AppError } from '../utils/AppError';
import { checkLocalProfanity } from '../utils/profanityFilter';

interface GeminiModerationResponse {
  approved: boolean;
  motivo?: string | null;
}

export class ModerationService {
  constructor(private readonly apiKey?: string) {}

  /**
   * Valida o conteúdo em duas camadas:
   * 1ª Camada: Filtro local síncrono por regex e termos ofensivos (< 1ms).
   * 2ª Camada: Moderação semântica assíncrona com Gemini 3.5 Flash Lite (caso a API key esteja configurada).
   *
   * Dispara AppError('CONTENT_POLICY_VIOLATION', 422) se o conteúdo for reprovado.
   * Em caso de falha de conexão com a IA, aciona o modo fail-safe permitindo prosseguimento seguro.
   */
  async validate(textToModerate: string): Promise<void> {
    if (!textToModerate || textToModerate.trim() === '') {
      return;
    }

    // -------------------------------------------------------------------------
    // CAMADA 1: Filtro Local em Memória
    // -------------------------------------------------------------------------
    const localCheck = checkLocalProfanity(textToModerate);
    if (!localCheck.isClean) {
      const termoInfo = localCheck.detectedTerm ? ` (termo detectado: "${localCheck.detectedTerm}")` : '';
      throw new AppError(
        'CONTENT_POLICY_VIOLATION',
        422,
        `Publicação bloqueada pela moderação escolar${termoInfo}. Por favor, revise o vocabulário.`
      );
    }

    // Se não houver chave da API do Gemini configurada, encerra com aprovação da Camada 1
    if (!this.apiKey || this.apiKey.trim() === '') {
      return;
    }

    // -------------------------------------------------------------------------
    // CAMADA 2: Moderação Semântica com Gemini 3.5 Flash Lite
    // -------------------------------------------------------------------------
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${this.apiKey}`;

      const payload = {
        systemInstruction: {
          parts: [
            {
              text:
                "Você é o moderador de conteúdo da plataforma escolar Prumo. Sua função é avaliar se o conteúdo submetido por alunos e líderes é adequado ao ambiente escolar e acadêmico. Avalie rigorosamente se há assédio, ofensas veladas, cyberbullying, discriminação, conteúdo sexual, pornografia, links para sites adultos, phishing, malware ou incitação à violência. Caso reprove, descreva no campo 'motivo' uma justificativa clara, concisa e respeitosa em português explicando o que deve ser corrigido. Responda ESTRITAMENTE um objeto JSON no formato: {\"approved\": boolean, \"motivo\": string | null}.",
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Avalie o seguinte conteúdo para publicação escolar:\n\n${textToModerate}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.0,
          responseMimeType: 'application/json',
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000), // Timeout de 4 segundos
      });

      if (!response.ok) {
        console.warn(
          `Aviso: Chamada ao Gemini retornou status ${response.status}. Ativando fail-safe.`
        );
        return;
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        console.warn('Aviso: Resposta do Gemini sem candidatos de texto válidos. Ativando fail-safe.');
        return;
      }

      const moderationResult = JSON.parse(candidateText) as GeminiModerationResponse;

      if (moderationResult.approved === false) {
        const motivo = moderationResult.motivo?.trim() || 'Linguagem ou conteúdo inadequado ao ambiente acadêmico.';
        throw new AppError(
          'CONTENT_POLICY_VIOLATION',
          422,
          `Publicação bloqueada pela moderação escolar: ${motivo}`
        );
      }
    } catch (error) {
      // Se for o erro de violação lançado por nós, relança para propagação HTTP 422
      if (error instanceof AppError) {
        throw error;
      }

      // Fail-Safe: falha de timeout, rede ou indisponibilidade da IA não bloqueia o usuário
      console.warn('Falha na moderação semântica Gemini (fail-safe ativado):', error);
    }
  }
}
