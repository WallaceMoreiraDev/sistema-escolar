import { NoticeDTO } from '@shared/types';

/**
 * Reexporta o NoticeDTO oficial compartilhado como o tipo Notice da feature,
 * garantindo compatibilidade e fonte única da verdade (SSOT).
 */
export type Notice = NoticeDTO;
export type { NoticeDTO };
