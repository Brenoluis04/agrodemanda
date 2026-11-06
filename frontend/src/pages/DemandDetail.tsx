import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock3, Settings } from 'lucide-react';
import { api } from '../api';
import type { Demand } from '../api';
import { useAuth } from '../context/AuthContext';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, osmUrl } from '../constants';
import { Heading } from '../components/Heading';
import { Status } from '../components/Status';
import { Fact } from '../components/Fact';

export function DemandDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [d, setD] = useState<Demand | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const [assigned, setAssigned] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const isStaff = user?.role !== 'farmer';

  async function load() {
    try {
      const demand = await api<Demand>(`/demands/${id}`);
      setD(demand);
      setAssigned(demand.assigned_to || '');
      setPriority(demand.priority);
      setStatus(demand.status);
      setHistory(await api<any[]>(`/demands/${id}/history`));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function save() {
    try {
      await api(`/demands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, priority, assigned_to: assigned, note }),
      });
      setNote('');
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!d) {
    return (
      <>
        <Heading
          eyebrow="DETALHES"
          title="Solicitação"
          sub="Informações e histórico de atendimento."
        />
        {error && <div className="error">{error}</div>}
      </>
    );
  }

  return (
    <>
      <Heading
        eyebrow="ACOMPANHAMENTO"
        title={d.title}
        sub={`Protocolo ${d.protocol} · registrada em ${new Date(d.created_at).toLocaleDateString('pt-BR')}`}
      />

      {error && <div className="error">{error}</div>}

      <div className="detail-grid">
        <div className="panel detail-main">
          <div className="detail-top">
            <div>
              <span className="eyebrow green">SITUAÇÃO ATUAL</span>
              <h2>{d.title}</h2>
            </div>
            <Status value={d.status} />
          </div>

          <p className="detail-description">{d.description}</p>

          <div className="detail-facts">
            <Fact label="Comunidade" value={d.community_name} />
            <Fact label="Categoria" value={d.category} />
            <Fact label="Tipo" value={d.kind} />
            <Fact label="Solicitante" value={d.requester_name} />
            <Fact
              label="Quantidade estimada"
              value={d.estimated_quantity ? `${d.estimated_quantity} ${d.quantity_unit || ''}` : 'Não informada'}
            />
            <Fact label="Localização" value={d.location_text || 'Não informada'} />
            <Fact label="Prioridade" value={d.priority} />
            <Fact label="Responsável" value={d.assigned_to || 'A definir'} />
          </div>

          {d.latitude && d.longitude && (
            <a
              className="text-link"
              target="_blank"
              href={osmUrl(d.latitude, d.longitude)}
              rel="noreferrer"
            >
              <MapPin size={15} /> Abrir localização no mapa
            </a>
          )}
        </div>

        <div className="panel history-panel">
          <div className="panel-head">
            <div>
              <h3>Histórico</h3>
              <p>Atualizações da solicitação</p>
            </div>
            <Clock3 size={18} />
          </div>
          <div className="timeline">
            {history.map((h) => (
              <div className="timeline-item" key={h.id}>
                <i />
                <b>{h.new_status}</b>
                <span>{new Date(h.created_at).toLocaleString('pt-BR')}</span>
                {h.note && <p>{h.note}</p>}
              </div>
            ))}
          </div>
        </div>

        {isStaff && (
          <div className="panel admin-edit">
            <div className="panel-head">
              <div>
                <h3>Atualizar atendimento</h3>
                <p>Registre o andamento da solicitação.</p>
              </div>
              <Settings size={18} />
            </div>

            <div className="form-grid">
              <label>
                Status
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Prioridade
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITY_OPTIONS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="wide">
                Equipe ou responsável
                <input
                  value={assigned}
                  onChange={(e) => setAssigned(e.target.value)}
                  placeholder="Nome do responsável"
                />
              </label>
              <label className="wide">
                Observação do histórico
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Descreva a atualização realizada..."
                />
              </label>
            </div>

            <button className="btn primary" onClick={save}>
              Salvar atualização
            </button>
          </div>
        )}
      </div>
    </>
  );
}
