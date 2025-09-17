document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost/proj/src/php/api.php';
    const params = new URLSearchParams(window.location.search);
    const pacienteId = params.get('id');

    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const notificationContainer = document.getElementById('notification-container');
    const pacienteDetalhesDiv = document.getElementById('paciente-detalhes');
    const nomePacienteTitle = document.getElementById('nome-paciente-title');
    
    // NOVO: Referência para a lista de histórico
    const historicoLista = document.getElementById('historico-lista');

    // Funções do Modo Escuro
    function aplicarTema(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        toggleDarkModeBtn.textContent = isDark ? 'Modo Claro' : 'Modo Escuro';
    }

    function carregarPreferenciaDeTema() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        aplicarTema(isDark);
    }

    toggleDarkModeBtn.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        aplicarTema(isDark);
    });

    carregarPreferenciaDeTema();

    // Funções de Notificação
    function mostrarNotificacao(mensagem, tipo) {
        const notification = document.createElement('div');
        notification.classList.add('notification', tipo);
        notification.textContent = mensagem;
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Função para buscar e renderizar os detalhes do paciente
    async function fetchPaciente() {
        if (!pacienteId) {
            pacienteDetalhesDiv.innerHTML = '<p>Paciente não encontrado.</p>';
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}?id=${pacienteId}`);
            const paciente = await response.json();

            if (paciente && !paciente.error) {
                renderizarPaciente(paciente);
            } else {
                pacienteDetalhesDiv.innerHTML = '<p>Paciente não encontrado.</p>';
                mostrarNotificacao('Paciente não encontrado.', 'error');
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes do paciente:', error);
            mostrarNotificacao('Erro de conexão ou servidor.', 'error');
        }
    }

    // Função para renderizar os detalhes do paciente na tela
    function renderizarPaciente(paciente) {
        nomePacienteTitle.textContent = `${paciente.nome} ${paciente.sobrenome}`;
        
        const medicacaoHtml = paciente.medicacao.length > 0
            ? paciente.medicacao.map(med => `<li>${med.nome_remedio} - ${med.horario} ${med.sn ? '(SN)' : ''}</li>`).join('')
            : 'Nenhuma medicação registrada.';
            
        pacienteDetalhesDiv.innerHTML = `
            <p><strong>CPF:</strong> ${paciente.cpf}</p>
            <p><strong>Data de Nascimento:</strong> ${paciente.data_nascimento || 'Não informada'}</p>
            <p><strong>Endereço:</strong> ${paciente.endereco || 'Não informado'}</p>
            <p><strong>Procedimentos:</strong> ${paciente.procedimentos || 'Nenhum procedimento registrado'}</p>
            <h3>Medicação</h3>
            <ul class="medication-list-display">${medicacaoHtml}</ul>
        `;
    }

    // NOVO: Função para buscar e renderizar o histórico de internações
    async function fetchHistoricoInternacoes() {
        if (!pacienteId) return;

        try {
            const response = await fetch(`${apiBaseUrl}?historico=true&id=${pacienteId}`);
            const historico = await response.json();

            if (historico && Array.isArray(historico)) {
                renderizarHistorico(historico);
            } else {
                historicoLista.innerHTML = '<p>Nenhum histórico de internações encontrado.</p>';
            }
        } catch (error) {
            console.error('Erro ao buscar histórico de internações:', error);
            historicoLista.innerHTML = '<p>Erro ao carregar o histórico.</p>';
        }
    }

    // NOVO: Função para renderizar o histórico na tela
    function renderizarHistorico(historico) {
        historicoLista.innerHTML = '';
        if (historico.length === 0) {
            historicoLista.innerHTML = '<p>Nenhum histórico de internações encontrado.</p>';
            return;
        }

        historico.forEach(internacao => {
            const internacaoItem = document.createElement('li');
            internacaoItem.classList.add('historico-item');

            const medicacaoHistoricoHtml = internacao.medicacao.length > 0
                ? internacao.medicacao.map(med => `<li>${med.nome_remedio} - ${med.horario} ${med.sn ? '(SN)' : ''}</li>`).join('')
                : 'Nenhuma medicação registrada.';

            internacaoItem.innerHTML = `
                <h4>Internação de ${internacao.data_entrada} a ${internacao.data_saida}</h4>
                <p><strong>Hora da Alta:</strong> ${internacao.horario_saida}</p>
                <p><strong>Procedimentos:</strong> ${internacao.procedimentos || 'Nenhum'}</p>
                <h5>Medicação</h5>
                <ul class="medication-list-display">${medicacaoHistoricoHtml}</ul>
            `;
            historicoLista.appendChild(internacaoItem);
        });
    }

    // Executa as funções ao carregar a página
    fetchPaciente();
    fetchHistoricoInternacoes();
});