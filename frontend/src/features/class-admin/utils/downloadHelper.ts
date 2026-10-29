import { isSafeUrl } from '@/utils/urlSecurity';

/**
 * Aciona o download seguro de um arquivo no navegador utilizando um elemento âncora invisível.
 * Substitui o window.open() pós-await, contornando bloqueadores de pop-up em navegadores mobile (Safari e Chrome Mobile).
 *
 * @param url URL do arquivo ou URL assinada temporária para download
 * @param filename Nome opcional com o qual o arquivo deve ser salvo
 */
export function triggerFileDownload(url: string, filename?: string): void {
  if (!isSafeUrl(url)) {
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  if (filename) {
    link.download = filename;
  }
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
