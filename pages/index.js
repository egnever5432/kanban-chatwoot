import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [dadosKanban, setDadosKanban] = useState(null);
  const [agenteAtivo, setAgenteAtivo] = useState(null);
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [showNovoCardModal, setShowNovoCardModal] = useState(false);
  const [contatoAtual, setContatoAtual] = useState(null);
  const [contatoData, setContatoData] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/kanban');
      const data = await response.json();
      setDadosKanban(data);
      
      // Ativa primeira tab
      if (data.conversasPorAgente) {
        const firstAgent = data.conversasPorAgente['nao_atribuidas'] ? 'nao_atribuidas' : data.agentes[0]?.id;
        setAgenteAtivo(firstAgent);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do kanban');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className={theme === 'dark' ? 'dark-mode' : ''}>
      <Head>
        <title>Converte Kanban</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="header">
        <div>
          <h1>📋 Converte Kanban</h1>
          <div className="stats">
            <span>Total de conversas: <strong>{dadosKanban?.totalConversas || 0}</strong></span>
          </div>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Noturno'}</span>
          </button>
          <button className="btn btn-success" onClick={() => setShowNovoCardModal(true)}>
            ➕ Novo Card
          </button>
          <button className="btn btn-secondary" onClick={carregarDados}>
            🔄 Recarregar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando dados do Converte...</p>
        </div>
      ) : (
        <>
          <AgentTabs 
            dadosKanban={dadosKanban} 
            agenteAtivo={agenteAtivo}
            setAgenteAtivo={setAgenteAtivo}
          />
          
          <KanbanBoard 
            dadosKanban={dadosKanban}
            agenteAtivo={agenteAtivo}
            onReload={carregarDados}
            setContatoAtual={setContatoAtual}
            setShowCustomFieldsModal={setShowCustomFieldsModal}
          />
        </>
      )}

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f7fa;
          padding: 20px;
        }
        
        .dark-mode {
          background: #1a1d24;
          color: #e4e6eb;
        }
        
        .header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .dark-mode .header {
          background: #242831;
        }
        
        .header h1 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .stats {
          font-size: 14px;
          color: #6c757d;
        }
        
        .dark-mode .stats {
          color: #b0b3b8;
        }
        
        .header-actions {
          display: flex;
          gap: 10px;
        }
        
        .btn {
          background: #1f93ff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .btn-secondary {
          background: #6c757d;
        }
        
        .btn-success {
          background: #28a745;
        }
        
        .theme-toggle {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          color: #495057;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        
        .dark-mode .theme-toggle {
          background: #2a2f3a;
          border-color: #3a3f4b;
          color: #e4e6eb;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
        }
        
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #1f93ff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Componente de Tabs de Agentes
function AgentTabs({ dadosKanban, agenteAtivo, setAgenteAtivo }) {
  if (!dadosKanban) return null;

  const { agentes, conversasPorAgente } = dadosKanban;

  const calcularTotal = (agenteId) => {
    const data = conversasPorAgente[agenteId];
    if (!data) return 0;
    return Object.values(data.conversasPorEtiqueta).reduce((sum, convs) => sum + convs.length, 0);
  };

  return (
    <div className="agent-tabs">
      <div 
        className={`agent-tab ${agenteAtivo === 'nao_atribuidas' ? 'active' : ''}`}
        onClick={() => setAgenteAtivo('nao_atribuidas')}
      >
        <span>👤 Não Atribuídas</span>
        <span className="agent-tab-badge">{calcularTotal('nao_atribuidas')}</span>
      </div>

      {agentes.map(agente => {
        const iniciais = agente.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return (
          <div 
            key={agente.id}
            className={`agent-tab ${agenteAtivo === agente.id ? 'active' : ''}`}
            onClick={() => setAgenteAtivo(agente.id)}
          >
            <div className="agent-avatar">{iniciais}</div>
            <span>{agente.name}</span>
            <span className="agent-tab-badge">{calcularTotal(agente.id)}</span>
          </div>
        );
      })}

      <style jsx>{`
        .agent-tabs {
          background: white;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          gap: 8px;
          overflow-x: auto;
          flex-wrap: wrap;
        }
        
        .agent-tab {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          color: #495057;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        
        .agent-tab:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
        
        .agent-tab.active {
          background: #1f93ff;
          color: white;
          border-color: #1f93ff;
        }
        
        .agent-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1f93ff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
        }
        
        .agent-tab-badge {
          background: rgba(0,0,0,0.1);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .agent-tab.active .agent-tab-badge {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}

// Componente principal do Kanban Board
function KanbanBoard({ dadosKanban, agenteAtivo, onReload, setContatoAtual, setShowCustomFieldsModal }) {
  if (!dadosKanban || !agenteAtivo) return null;

  const agenteData = dadosKanban.conversasPorAgente[agenteAtivo];
  if (!agenteData) return null;

  const handleDragStart = (e, conversa) => {
    e.dataTransfer.setData('conversaId', conversa.id);
    e.dataTransfer.setData('etiquetaOrigem', conversa.labels[0] || 'Sem Etiqueta');
  };

  const handleDrop = async (e, etiquetaDestino) => {
    e.preventDefault();
    const conversaId = e.dataTransfer.getData('conversaId');
    const etiquetaOrigem = e.dataTransfer.getData('etiquetaOrigem');

    if (etiquetaOrigem === etiquetaDestino) return;

    try {
      const response = await fetch('/api/conversations/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversaId, newLabel: etiquetaDestino })
      });

      const result = await response.json();
      if (result.success) {
        onReload();
      }
    } catch (error) {
      console.error('Erro ao mover conversa:', error);
    }
  };

  return (
    <div className="kanban-board">
      {dadosKanban.etiquetas.map(etiqueta => (
        <KanbanColumn
          key={etiqueta.title}
          titulo={etiqueta.title}
          cor={etiqueta.color}
          conversas={agenteData.conversasPorEtiqueta[etiqueta.title] || []}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          setContatoAtual={setContatoAtual}
          setShowCustomFieldsModal={setShowCustomFieldsModal}
        />
      ))}

      <KanbanColumn
        titulo="Sem Etiqueta"
        cor="#6c757d"
        conversas={agenteData.conversasPorEtiqueta['Sem Etiqueta'] || []}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        setContatoAtual={setContatoAtual}
        setShowCustomFieldsModal={setShowCustomFieldsModal}
      />

      <style jsx>{`
        .kanban-board {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

// Componente de Coluna do Kanban
function KanbanColumn({ titulo, cor, conversas, onDragStart, onDrop, setContatoAtual, setShowCustomFieldsModal }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="column-title">
          <span style={{ width: 12, height: 12, background: cor, borderRadius: '50%', display: 'inline-block' }} />
          {titulo}
        </div>
        <span className="column-count">{conversas.length}</span>
      </div>
      
      <div 
        className={`column-body ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { onDrop(e, titulo); setDragOver(false); }}
      >
        {conversas.length === 0 ? (
          <div className="empty-state">Nenhuma conversa</div>
        ) : (
          conversas.map(conversa => (
            <KanbanCard 
              key={conversa.id} 
              conversa={conversa} 
              onDragStart={onDragStart}
              setContatoAtual={setContatoAtual}
              setShowCustomFieldsModal={setShowCustomFieldsModal}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .kanban-column {
          background: white;
          border-radius: 8px;
          min-width: 300px;
          max-width: 300px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          max-height: 600px;
        }
        
        .column-header {
          padding: 16px;
          border-bottom: 2px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }
        
        .column-title {
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .column-count {
          background: #1f93ff;
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .column-body {
          padding: 12px;
          flex: 1;
          overflow-y: auto;
          min-height: 100px;
        }
        
        .column-body.drag-over {
          background: #e7f3ff;
          border: 2px dashed #1f93ff;
          border-radius: 6px;
        }
        
        .empty-state {
          text-align: center;
          padding: 30px 20px;
          color: #6c757d;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

// Componente de Card
function KanbanCard({ conversa, onDragStart, setContatoAtual, setShowCustomFieldsModal }) {
  const nomeCliente = conversa.meta?.sender?.name || conversa.meta?.sender?.email || 'Cliente sem nome';
  const dataAtividade = conversa.last_activity_at 
    ? new Date(conversa.last_activity_at * 1000).toLocaleString('pt-BR')
    : 'Sem atividade';

  const abrirConversa = () => {
    window.open(conversa.url, '_blank');
  };

  const editarContato = (e) => {
    e.stopPropagation();
    setContatoAtual(conversa.meta?.sender?.id);
    setShowCustomFieldsModal(true);
  };

  return (
    <div 
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, conversa)}
      onClick={abrirConversa}
    >
      <div className="card-actions">
        <button className="card-action-btn edit-btn" onClick={editarContato} title="Editar contato">
          ✏️
        </button>
      </div>

      <div className="card-header">
        <div className="card-title">{nomeCliente}</div>
        <div className="card-id">#{conversa.id}</div>
      </div>

      <div className="card-meta">
        <div className="status-badge status-open">{conversa.status}</div>
        <div>⏰ {dataAtividade}</div>
        {conversa.messages_count && <div>💬 {conversa.messages_count} mensagens</div>}
      </div>

      <style jsx>{`
        .kanban-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        
        .kanban-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .kanban-card:hover .card-actions {
          opacity: 1;
        }
        
        .card-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .card-action-btn {
          background: #28a745;
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .card-title {
          font-weight: 600;
          font-size: 14px;
          flex: 1;
        }
        
        .card-id {
          color: #6c757d;
          font-size: 11px;
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
        }
        
        .card-meta {
          font-size: 12px;
          color: #6c757d;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          background: #d1ecf1;
          color: #0c5460;
        }
      `}</style>
    </div>
  );
}
