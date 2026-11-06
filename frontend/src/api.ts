const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'farmer';
};

export type Community = {
  id: number;
  name: string;
  description?: string;
};

export type Demand = {
  id: number;
  protocol: string;
  title: string;
  description: string;
  category: string;
  kind: string;
  estimated_quantity?: number;
  quantity_unit?: string;
  community_id: number;
  community_name: string;
  requester_id: number;
  requester_name: string;
  association_name?: string;
  location_text?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  priority: string;
  assigned_to?: string;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
};

export type Dashboard = {
  total: number;
  farmers: number;
  communities: number;
  associations: number;
  by_status: Record<string, number>;
  by_community: { name: string; total: number }[];
  by_category: { name: string; total: number }[];
  average_days: number;
  completed_rate: number;
};

// ---------------------------------------------------------------------------
// Token de autenticação
// ---------------------------------------------------------------------------
export function token() {
  return localStorage.getItem('agro_token');
}

// ---------------------------------------------------------------------------
// Tratamento de erros da API
// ---------------------------------------------------------------------------
const FIELD_LABELS: Record<string, string> = {
  email: 'E-mail',
  password: 'Senha',
  name: 'Nome',
  phone: 'Telefone',
  title: 'Título',
  description: 'Descrição',
  category: 'Categoria',
  estimated_quantity: 'Quantidade estimada',
  community_id: 'Comunidade',
  latitude: 'Latitude',
  longitude: 'Longitude',
};

/**
 * Converte o campo `detail` de um erro do FastAPI em texto legível.
 * Pode ser uma string simples ou uma lista de erros de validação.
 */
export function formatApiError(
  detail: unknown,
  fallback = 'Não foi possível concluir a operação.',
): string {
  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    const messages = detail.map((item: any) => {
      const field = Array.isArray(item?.loc) ? String(item.loc[item.loc.length - 1]) : '';
      const label = FIELD_LABELS[field] || field;
      const message = item?.msg ?? 'valor inválido';
      return label ? `${label}: ${message}` : message;
    });
    return messages.join(' · ') || fallback;
  }

  return fallback;
}

// ---------------------------------------------------------------------------
// Cliente HTTP
// ---------------------------------------------------------------------------
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token()) {
    headers.set('Authorization', `Bearer ${token()}`);
  }

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      message = formatApiError(body.detail, message);
    } catch {
      // resposta sem JSON: mantém a mensagem padrão
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------
export const login = (email: string, password: string) =>
  api<{ access_token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
