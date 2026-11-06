import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import type { Demand, Community } from '../api';
import { CATEGORIES } from '../constants';
import { Heading } from '../components/Heading';

export function NewDemand() {
  const nav = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    kind: 'Individual',
    estimated_quantity: '',
    quantity_unit: 'hectares',
    community_id: '',
    association_name: '',
    location_text: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    api<Community[]>('/communities')
      .then(setCommunities)
      .catch((e) => setError(e.message));
  }, []);

  function change(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        community_id: Number(form.community_id),
        estimated_quantity: form.estimated_quantity ? Number(form.estimated_quantity) : null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };
      const d = await api<Demand>('/demands', { method: 'POST', body: JSON.stringify(payload) });
      setSuccess(`Solicitação registrada! Protocolo: ${d.protocol}`);
      setTimeout(() => nav(`/demands/${d.id}`), 1100);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Heading
        eyebrow="NOVA SOLICITAÇÃO"
        title="Registrar uma demanda"
        sub="Descreva a necessidade da comunidade. Os campos com * são obrigatórios."
      />

      <form className="form-layout" onSubmit={submit}>
        <div className="panel form-panel">
          <div className="form-section-title">
            <span>01</span>
            <div>
              <h3>Informações da solicitação</h3>
              <p>Conte o que a comunidade precisa.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="wide">
              Título da demanda *
              <input
                value={form.title}
                onChange={(e) => change('title', e.target.value)}
                placeholder="Ex.: Preparo de solo para plantio"
                required
                minLength={4}
              />
            </label>
            <label>
              Tipo de solicitação *
              <select value={form.kind} onChange={(e) => change('kind', e.target.value)}>
                <option>Individual</option>
                <option>Coletiva</option>
              </select>
            </label>
            <label>
              Categoria do serviço *
              <select value={form.category} onChange={(e) => change('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="wide">
              Descrição detalhada *
              <textarea
                value={form.description}
                onChange={(e) => change('description', e.target.value)}
                placeholder="Explique a necessidade, o local e outras informações importantes..."
                required
                minLength={10}
                rows={4}
              />
            </label>
            <label>
              Quantidade estimada
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.estimated_quantity}
                onChange={(e) => change('estimated_quantity', e.target.value)}
                placeholder="Ex.: 2,5"
              />
            </label>
            <label>
              Unidade
              <select
                value={form.quantity_unit}
                onChange={(e) => change('quantity_unit', e.target.value)}
              >
                <option value="hectares">Hectares</option>
                <option value="unidades">Unidades</option>
                <option value="quilômetros">Quilômetros</option>
                <option value="litros">Litros</option>
                <option value="famílias">Famílias</option>
                <option value="outro">Outro</option>
              </select>
            </label>
          </div>

          <div className="form-section-title separated">
            <span>02</span>
            <div>
              <h3>Localização</h3>
              <p>Identifique onde o atendimento é necessário.</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Comunidade rural *
              <select
                required
                value={form.community_id}
                onChange={(e) => change('community_id', e.target.value)}
              >
                <option value="">Selecione a comunidade</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Associação (se aplicável)
              <input
                value={form.association_name}
                onChange={(e) => change('association_name', e.target.value)}
                placeholder="Nome da associação"
              />
            </label>
            <label className="wide">
              Referência ou endereço
              <input
                value={form.location_text}
                onChange={(e) => change('location_text', e.target.value)}
                placeholder="Sítio, estrada, ponto de referência..."
              />
            </label>
            <label>
              Latitude (opcional)
              <input
                type="number"
                min={-90}
                max={90}
                step="any"
                value={form.latitude}
                onChange={(e) => change('latitude', e.target.value)}
                placeholder="-7.95"
              />
            </label>
            <label>
              Longitude (opcional)
              <input
                type="number"
                min={-180}
                max={180}
                step="any"
                value={form.longitude}
                onChange={(e) => change('longitude', e.target.value)}
                placeholder="-36.20"
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn ghost" onClick={() => nav(-1)}>
              Cancelar
            </button>
            <button className="btn primary" disabled={busy}>
              {busy ? 'Enviando...' : 'Registrar solicitação'} <ArrowUpRight size={17} />
            </button>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </div>

        <aside className="form-aside">
          <div className="aside-icon">
            <ShieldCheck />
          </div>
          <h3>Transparência do início ao fim</h3>
          <p>
            Após o registro, você receberá um protocolo para acompanhar cada atualização da
            solicitação.
          </p>
          <div className="steps-mini">
            <div>
              <i>1</i>
              <span>Registro da demanda</span>
            </div>
            <div>
              <i>2</i>
              <span>Análise pela Secretaria</span>
            </div>
            <div>
              <i>3</i>
              <span>Programação do atendimento</span>
            </div>
            <div>
              <i>4</i>
              <span>Execução e conclusão</span>
            </div>
          </div>
        </aside>
      </form>
    </>
  );
}
