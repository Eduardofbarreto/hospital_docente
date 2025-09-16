document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost/proj/src/php/api.php';
    const notificationContainer = document.getElementById('notification-container');
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');

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

    // Função para buscar e exibir os dados do paciente
    async function fetchPaciente() {
        const urlParams = new URLSearchParams(window.location.search);
        const pacienteId = urlParams.get('id');

        if (!pacienteId) {
            mostrarNotificacao('ID do paciente não fornecido.', 'error');
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}?id=${pacienteId}`);
            const paciente = await response.json();

            if (paciente.error) {
                mostrarNotificacao(paciente.error, 'error');
            } else {
                displayPacienteData(paciente);
            }
        } catch (error) {
            console.error('Erro ao buscar dados do paciente:', error);
            mostrarNotificacao('Erro ao carregar dados do paciente.', 'error');
        }
    }

    // Função para formatar a data
    function formatarData(data) {
        if (!data) return 'Não informada';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // Função para exibir os dados na tela (MODIFICADA)
    function displayPacienteData(paciente) {
        document.getElementById('paciente-nome').textContent = `${paciente.nome} ${paciente.sobrenome}`;
        document.getElementById('paciente-cpf').textContent = paciente.cpf;
        document.getElementById('paciente-nascimento').textContent = formatarData(paciente.data_nascimento);
        document.getElementById('paciente-endereco').textContent = paciente.endereco;
        document.getElementById('paciente-procedimentos').textContent = paciente.procedimentos;

        // NOVOS CAMPOS
        document.getElementById('data-baixa').textContent = paciente.data_baixa ? formatarData(paciente.data_baixa) : 'Não informada';
        document.getElementById('horario-baixa').textContent = paciente.horario_baixa || 'Não informado';

        // Medicação
        const listaMedicamentos = document.getElementById('lista-medicamentos');
        listaMedicamentos.innerHTML = '';
        if (paciente.medicacao && paciente.medicacao.length > 0) {
            paciente.medicacao.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.nome_remedio} - ${item.horario}`;
                listaMedicamentos.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Nenhuma medicação registrada.';
            listaMedicamentos.appendChild(li);
        }
    }

    fetchPaciente();
});