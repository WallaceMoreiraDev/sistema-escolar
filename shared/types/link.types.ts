export interface LinkDTO {
  id: string;
  turmaId: string;
  titulo: string;
  urlLink: string;
  criadoPor: string | null;
  createdAt: string;
}

export interface CreateLinkPayload {
  titulo: string;
  urlLink: string;
}
