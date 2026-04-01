
import { useEffect, useState } from "react";
import axios from 'axios';
import './App.css';


function Select({ value, onChange, options, placeholder }) {
  const [aberto, setAberto] = useState(false)
  return (
   
    <div className="select-custom" onClick={() => setAberto(!aberto)}>
      <div className="select-valor">
        {value || placeholder}
        <span className="select-seta">▾</span>
      </div>
      {aberto && (
        <div className="select-opcoes">
          {options.map((op) => (
            <div key={op} className="select-opcao"
              onClick={(e) => { 
                e.stopPropagation()  // ← adiciona isso
                onChange(op)
                setAberto(false) 
              }}>
              {op}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [dados, setDados] = useState([])
  const [cliente, setCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [servico, setServico] = useState('')
  const [profissional, setProfissional] = useState('')
  const [dataHora, setDataHora] = useState('')


useEffect(() => {
  buscarDados()
},[])

const buscarDados = async () =>{
  
  try {
    const resposta = await axios.get("http://localhost:8080/agendamentos/todos")
    setDados(resposta.data)
  }catch (error){
    console.error("Erro ao buscar dados:", error)
  
  }
}

const [toast, setToast] = useState(null)

const showToast = (mensagem, tipo = 'sucesso') => {
  setToast({ mensagem, tipo })
  setTimeout(() => setToast(null), 3000)

  {toast && (
  <div style={{
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: toast.tipo === 'sucesso' ? '#0d9488' : '#dc2626',
    color: '#fff',
    padding: '14px 24px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '14px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease'
  }}>
    {toast.mensagem}
  </div>
)}
}

const salvar = async () => {   
  if (!cliente || !servico || !dataHora) {
    alert('Preencha cliente, serviço e data!')
    
    
    return
  }

  try {
    await axios.post('http://localhost:8080/agendamentos', {
      cliente,
      telefoneCliente: telefone,
      servico,
      profissional,
      dataHoraAgendamento: dataHora + ':00'
    })
     showToast('Agendamento criado! ✓')
    setCliente('')
    setTelefone('')
    setServico('')
    setProfissional('')
    setDataHora('')
    buscarDados()
  } catch (error) {
    showToast('Erro ao salvar: ' + error.message, 'erro') 
  }
}

const deletar = async (cliente, dataHoraAgendamento) => {
  try {
    await axios.delete('http://localhost:8080/agendamentos', {
      params: { cliente, dataHoraAgendamento }
    })
      showToast('Agendamento deletado! ✓')
    buscarDados()
  } catch (error) {
    showToast('Erro ao deletar: ' + error.message, 'erro')
  }
}

const formatarData = (dataHora) => {
  if (!dataHora) return '—'
  const data = new Date(dataHora)
  return data.toLocaleDateString('pt-BR') + ' às ' + 
         data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}



return (
<div className="container">
  <div className="header">
    <div className="badge">● SISTEMA ONLINE · v1.0</div>
    <h1>AGENDADOR DE HORÁRIOS</h1>
    <p className="subtitle">Sistema integrado Java + React</p>
  </div>


 {/* Lado Esquerdo: Formulário de Cadastro */}

  <main className="content">
    <section className="form-container">
      <div className="card">
      <h3>//Novo Agendamento</h3>

      <div className="empty-state">
        <div className="form-row">

          <div className="form-group">
            <label htmlFor="cliente">CLIENTE</label>
            <input type="text" id="cliente" placeholder="Nome do cliente" 
             value={cliente} onChange={(e) => setCliente(e.target.value)}/>
          </div>

          <div className="form-group">
            <label htmlFor="telefone">TELEFONE</label>
            <input 
            type="text" 
            id="telefone" 
            placeholder="(00) 00000-0000"
            value={telefone} 
            onChange={(e) => {
            let v = e.target.value.replace(/\D/g, '')
            if (v.length <= 11) {
            v = v.replace(/^(\d{2})(\d)/, '($1) $2')
            v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2')
      }
      setTelefone(v)
    }}
  />
</div>

          <div className="form-group">
            <label htmlFor="servico">SERVIÇO</label>
            <Select  
            value={servico} onChange={setServico}placeholder="selecione o serviço"
            options={['Corte','Manicure','Pedicure','Coloração','Escova','Barba']}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profissional">PROFISSIONAL</label>
            
            <Select value={profissional} onChange={setProfissional}placeholder=" Profissional"
            options={['Lucas','Ana','Maria']}
            />
              
          </div>

          <div className="form-group">
            <label htmlFor="dataHora">DATA E HORA</label>
            <input type="datetime-local" id="dataHora" value={dataHora} onChange={(e) => setDataHora(e.target.value)}/>
          </div>
        </div>

        <button  className="btn-agendar" onClick={salvar}>
          ► AGENDAR
           </button>

           
      </div>
      </div>
    </section>

    {/* Lado Direito: Lista de Agendamentos que vem do Backend */}
    <section className="list-container">
      <div className="card">
        <h3>//Agendamentos</h3>
        
        {dados.length > 0 ? (
        dados.map((item) => (

          <div key={item.id} className="agenda-item">
          <div className="agenda-name">{item.cliente}</div> 
          <div className="agenda-meta">
            SERVIÇO: <span>{item.servico}</span> PROFISSIONAL: <span>{item.profissional}</span>
           
          </div>
          <div className="agenda-time">{formatarData (item.dataHoraAgendamento)}</div>
          <button className="btn-deletar"
           onClick={() => deletar(item.cliente, item.dataHoraAgendamento)}>
           ✕ DELETAR
          </button>
        </div> 
        ))
        ) : (
          <div className="empty-state">Nenhum agendamento encontrado.</div>
        )}
      </div>
    </section>
  </main>



</div>

)
}
  
export default App;