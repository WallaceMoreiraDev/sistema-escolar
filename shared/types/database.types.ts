export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      avisos_gerais: {
        Row: {
          badge_destaque: Database["public"]["Enums"]["aviso_badge"]
          data_postagem: string | null
          id: string
          mensagem: string
          remetente: Database["public"]["Enums"]["aviso_remetente"]
          titulo: string
        }
        Insert: {
          badge_destaque: Database["public"]["Enums"]["aviso_badge"]
          data_postagem?: string | null
          id?: string
          mensagem: string
          remetente: Database["public"]["Enums"]["aviso_remetente"]
          titulo: string
        }
        Update: {
          badge_destaque?: Database["public"]["Enums"]["aviso_badge"]
          data_postagem?: string | null
          id?: string
          mensagem?: string
          remetente?: Database["public"]["Enums"]["aviso_remetente"]
          titulo?: string
        }
        Relationships: []
      }
      configuracao_global: {
        Row: {
          id: number
          meta_arrecadada_mes: number | null
        }
        Insert: {
          id?: number
          meta_arrecadada_mes?: number | null
        }
        Update: {
          id?: number
          meta_arrecadada_mes?: number | null
        }
        Relationships: []
      }
      eventos: {
        Row: {
          anexo_url: string | null
          categoria: Database["public"]["Enums"]["evento_categoria"]
          created_at: string | null
          criado_por: string | null
          data_hora_limite: string
          descricao: string | null
          id: string
          materia: string
          turma_id: string
        }
        Insert: {
          anexo_url?: string | null
          categoria: Database["public"]["Enums"]["evento_categoria"]
          created_at?: string | null
          criado_por?: string | null
          data_hora_limite: string
          descricao?: string | null
          id?: string
          materia: string
          turma_id: string
        }
        Update: {
          anexo_url?: string | null
          categoria?: Database["public"]["Enums"]["evento_categoria"]
          created_at?: string | null
          criado_por?: string | null
          data_hora_limite?: string
          descricao?: string | null
          id?: string
          materia?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      links_uteis: {
        Row: {
          created_at: string | null
          criado_por: string | null
          id: string
          titulo: string
          turma_id: string
          url_link: string
        }
        Insert: {
          created_at?: string | null
          criado_por?: string | null
          id?: string
          titulo: string
          turma_id: string
          url_link: string
        }
        Update: {
          created_at?: string | null
          criado_por?: string | null
          id?: string
          titulo?: string
          turma_id?: string
          url_link?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_uteis_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_uteis_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_turma: {
        Row: {
          ano: Database["public"]["Enums"]["ano_type"]
          created_at: string
          curso: string
          id: string
          justificativa: string | null
          local_sala: string | null
          status: Database["public"]["Enums"]["pedido_status"] | null
          turno: Database["public"]["Enums"]["turno_type"]
          usuario_id: string
        }
        Insert: {
          ano: Database["public"]["Enums"]["ano_type"]
          created_at?: string
          curso: string
          id?: string
          justificativa?: string | null
          local_sala?: string | null
          status?: Database["public"]["Enums"]["pedido_status"] | null
          turno: Database["public"]["Enums"]["turno_type"]
          usuario_id: string
        }
        Update: {
          ano?: Database["public"]["Enums"]["ano_type"]
          created_at?: string
          curso?: string
          id?: string
          justificativa?: string | null
          local_sala?: string | null
          status?: Database["public"]["Enums"]["pedido_status"] | null
          turno?: Database["public"]["Enums"]["turno_type"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_turma_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano: Database["public"]["Enums"]["ano_type"]
          codigo_convite: string
          curso: string
          data_criacao: string | null
          id: string
          local_sala: string | null
          nome_oficial: string
          turno: Database["public"]["Enums"]["turno_type"]
        }
        Insert: {
          ano: Database["public"]["Enums"]["ano_type"]
          codigo_convite: string
          curso: string
          data_criacao?: string | null
          id?: string
          local_sala?: string | null
          nome_oficial: string
          turno: Database["public"]["Enums"]["turno_type"]
        }
        Update: {
          ano?: Database["public"]["Enums"]["ano_type"]
          codigo_convite?: string
          curso?: string
          data_criacao?: string | null
          id?: string
          local_sala?: string | null
          nome_oficial?: string
          turno?: Database["public"]["Enums"]["turno_type"]
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          data_entrada_turma: string | null
          email: string
          id: string
          nome: string
          onboarding_concluido: boolean
          role: Database["public"]["Enums"]["user_role"] | null
          turma_id: string | null
        }
        Insert: {
          data_entrada_turma?: string | null
          email: string
          id: string
          nome: string
          onboarding_concluido?: boolean
          role?: Database["public"]["Enums"]["user_role"] | null
          turma_id?: string | null
        }
        Update: {
          data_entrada_turma?: string | null
          email?: string
          id?: string
          nome?: string
          onboarding_concluido?: boolean
          role?: Database["public"]["Enums"]["user_role"] | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aprovar_pedido_turma: {
        Args: {
          p_codigo_convite: string
          p_nome_oficial: string
          p_pedido_id: string
        }
        Returns: string
      }
      entrar_turma_por_codigo: {
        Args: { p_codigo_convite: string }
        Returns: Json
      }
      get_my_turma_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      ano_type: "1º" | "2º" | "3º"
      aviso_badge: "Urgente" | "Informativo" | "Evento"
      aviso_remetente:
        | "Diretoria ETEC"
        | "Coordenação"
        | "Administração da Plataforma"
      evento_categoria: "Prova" | "Trabalho" | "Tarefa" | "Aviso"
      pedido_status: "pendente" | "aprovado" | "rejeitado"
      turno_type: "Manhã" | "Tarde" | "Noite" | "Integral"
      user_role: "ALUNO" | "LIDER" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ano_type: ["1º", "2º", "3º"],
      aviso_badge: ["Urgente", "Informativo", "Evento"],
      aviso_remetente: [
        "Diretoria ETEC",
        "Coordenação",
        "Administração da Plataforma",
      ],
      evento_categoria: ["Prova", "Trabalho", "Tarefa", "Aviso"],
      pedido_status: ["pendente", "aprovado", "rejeitado"],
      turno_type: ["Manhã", "Tarde", "Noite", "Integral"],
      user_role: ["ALUNO", "LIDER", "ADMIN"],
    },
  },
} as const
