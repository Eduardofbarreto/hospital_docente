document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost/proj/src/php/api.php';
    const formPaciente = document.getElementById('form-paciente');
    const inputId = document.getElementById('paciente-id');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnLimpar = document.getElementById('btn-limpar');
    const listaPacientes = document.getElementById('lista-pacientes');
    const inputFiltroPacientes = document.getElementById('filtro-pacientes');
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const notificationContainer = document.getElementById('notification-container');

    const remedioSelect = document.getElementById('remedio-select');
    const inputRemedioPersonalizado = document.getElementById('remedio-nome-personalizado');
    const inputRemedioHora = document.getElementById('remedio-hora');
    const inputRemedioMinuto = document.getElementById('remedio-minuto');
    const btnHourUp = document.getElementById('btn-hour-up');
    const btnHourDown = document.getElementById('btn-hour-down');
    const btnMinuteUp = document.getElementById('btn-minute-up');
    const btnMinuteDown = document.getElementById('btn-minute-down');

    const btnAdicionarRemedio = document.getElementById('btn-adicionar-remedio');
    const listaMedicamentos = document.getElementById('lista-medicamentos');

    // NOVAS REFERÊNCIAS
    const inputDataBaixa = document.getElementById('data-baixa');
    const inputBaixaHora = document.getElementById('baixa-hora');
    const inputBaixaMinuto = document.getElementById('baixa-minuto');
    const btnBaixaHourUp = document.getElementById('btn-baixa-hour-up');
    const btnBaixaHourDown = document.getElementById('btn-baixa-hour-down');
    const btnBaixaMinuteUp = document.getElementById('btn-baixa-minute-up');
    const btnBaixaMinuteDown = document.getElementById('btn-baixa-minute-down');

    let todosPacientes = [];

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

    // --- Lógica de controle de hora e minuto para Medicamento ---
    function formatTime(value) {
        return value.toString().padStart(2, '0');
    }

    btnHourUp.addEventListener('click', () => {
        let hour = parseInt(inputRemedioHora.value);
        hour = (hour + 1) % 24;
        inputRemedioHora.value = formatTime(hour);
    });

    btnHourDown.addEventListener('click', () => {
        let hour = parseInt(inputRemedioHora.value);
        hour = (hour - 1 + 24) % 24;
        inputRemedioHora.value = formatTime(hour);
    });

    btnMinuteUp.addEventListener('click', () => {
        let minute = parseInt(inputRemedioMinuto.value);
        minute = (minute + 1) % 60;
        inputRemedioMinuto.value = formatTime(minute);
    });

    btnMinuteDown.addEventListener('click', () => {
        let minute = parseInt(inputRemedioMinuto.value);
        minute = (minute - 1 + 60) % 60;
        inputRemedioMinuto.value = formatTime(minute);
    });
    
    // --- Lógica de controle de hora e minuto para Baixa (NOVO) ---
    btnBaixaHourUp.addEventListener('click', () => {
        let hour = parseInt(inputBaixaHora.value);
        hour = (hour + 1) % 24;
        inputBaixaHora.value = formatTime(hour);
    });

    btnBaixaHourDown.addEventListener('click', () => {
        let hour = parseInt(inputBaixaHora.value);
        hour = (hour - 1 + 24) % 24;
        inputBaixaHora.value = formatTime(hour);
    });

    btnBaixaMinuteUp.addEventListener('click', () => {
        let minute = parseInt(inputBaixaMinuto.value);
        minute = (minute + 1) % 60;
        inputBaixaMinuto.value = formatTime(minute);
    });

    btnBaixaMinuteDown.addEventListener('click', () => {
        let minute = parseInt(inputBaixaMinuto.value);
        minute = (minute - 1 + 60) % 60;
        inputBaixaMinuto.value = formatTime(minute);
    });

    // --- Funções de Medicação ---
    remedioSelect.addEventListener('change', () => {
        inputRemedioPersonalizado.style.display = remedioSelect.value === 'outro' ? 'inline-block' : 'none';
        if (remedioSelect.value !== 'outro') {
            inputRemedioPersonalizado.value = '';
        }
    });

    function criarItemMedicamento(remedio, horario) {
        const li = document.createElement('li');
        li.classList.add('medication-item');
        li.innerHTML = `
            <span>${remedio} - ${horario}</span>
            <div class="medication-item-actions">
                <button type="button" class="btn-edit" title="Editar">✏️</button>
                <button type="button" class="btn-delete" title="Excluir">❌</button>
            </div>
        `;
        listaMedicamentos.appendChild(li);

        li.querySelector('.btn-delete').addEventListener('click', () => {
            li.remove();
        });

        li.querySelector('.btn-edit').addEventListener('click', () => {
            const novoTexto = prompt("Editar item (Nome - Horário):", `${remedio} - ${horario}`);
            if (novoTexto !== null && novoTexto.trim() !== '') {
                const partes = novoTexto.split(' - ');
                if (partes.length === 2) {
                    li.querySelector('span').textContent = novoTexto;
                } else {
                    alert("Formato inválido. Use 'Nome - Horário'.");
                }
            }
        });
    }

    btnAdicionarRemedio.addEventListener('click', () => {
        let remedio = remedioSelect.value;
        if (remedio === 'outro') {
            remedio = inputRemedioPersonalizado.value.trim();
        }
        const hora = inputRemedioHora.value;
        const minuto = inputRemedioMinuto.value;
        const horario = `${hora}:${minuto}`;

        if (remedio && horario) {
            criarItemMedicamento(remedio, horario);
            remedioSelect.value = '';
            inputRemedioPersonalizado.value = '';
            inputRemedioPersonalizado.style.display = 'none';
            inputRemedioHora.value = '00';
            inputRemedioMinuto.value = '00';
        } else {
            mostrarNotificacao("Por favor, selecione ou digite o nome do remédio e o horário.", "error");
        }
    });

    // Funções de CRUD (API)
    async function fetchPacientes() {
        try {
            const response = await fetch(apiBaseUrl);
            const pacientes = await response.json();
            todosPacientes = pacientes;
            renderizarPacientes(todosPacientes);
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
            mostrarNotificacao('Erro ao carregar lista de pacientes.', 'error');
        }
    }

    async function salvarPaciente(paciente) {
        const method = paciente.id ? 'PUT' : 'POST';
        const url = apiBaseUrl;
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paciente)
            });
            const result = await response.json();
            if (result.error) {
                mostrarNotificacao(result.error, 'error');
            } else {
                mostrarNotificacao(result.message, 'success');
            }
            limparFormulario();
            fetchPacientes();
        } catch (error) {
            console.error('Erro ao salvar paciente:', error);
            mostrarNotificacao('Erro de conexão ou servidor.', 'error');
        }
    }

    async function deletarPaciente(id) {
        if (confirm('Tem certeza que deseja excluir este paciente?')) {
            try {
                const response = await fetch(`${apiBaseUrl}?id=${id}`, { method: 'DELETE' });
                const result = await response.json();
                if (result.error) {
                    mostrarNotificacao(result.error, 'error');
                } else {
                    mostrarNotificacao(result.message, 'success');
                }
                fetchPacientes();
            } catch (error) {
                console.error('Erro ao deletar paciente:', error);
                mostrarNotificacao('Erro de conexão ou servidor.', 'error');
            }
        }
    }

    // Funções de Interação com a UI
    function renderizarPacientes(pacientes) {
        listaPacientes.innerHTML = '';
        if (Array.isArray(pacientes)) {
            pacientes.sort((a, b) => a.nome.localeCompare(b.nome));

            pacientes.forEach(paciente => {
                const li = document.createElement('li');
                li.classList.add('paciente-item');
                
                const link = document.createElement('a');
                link.href = `paciente.html?id=${paciente.id}`;
                link.textContent = `${paciente.nome} ${paciente.sobrenome}`;
                
                li.appendChild(link);
                
                const actionsDiv = document.createElement('div');
                actionsDiv.classList.add('paciente-item-actions');
                actionsDiv.innerHTML = `
                    <button class="btn-edit-paciente" data-id="${paciente.id}">✏️</button>
                    <button class="btn-delete-paciente" data-id="${paciente.id}">❌</button>
                `;
                li.appendChild(actionsDiv);
                listaPacientes.appendChild(li);
            });
        }
    }

    // --- Preencher Formulário (MODIFICADO) ---
    function preencherFormulario(paciente) {
        inputId.value = paciente.id;
        document.getElementById('nome').value = paciente.nome;
        document.getElementById('sobrenome').value = paciente.sobrenome;
        document.getElementById('cpf').value = paciente.cpf;
        document.getElementById('data-nascimento').value = paciente.data_nascimento;
        document.getElementById('endereco').value = paciente.endereco;
        document.getElementById('procedimentos').value = paciente.procedimentos;
        
        // Novos campos de baixa
        document.getElementById('data-baixa').value = paciente.data_baixa || '';
        if (paciente.horario_baixa) {
            const [hora, minuto] = paciente.horario_baixa.split(':');
            inputBaixaHora.value = hora;
            inputBaixaMinuto.value = minuto;
        } else {
            inputBaixaHora.value = '00';
            inputBaixaMinuto.value = '00';
        }

        // Medicação
        listaMedicamentos.innerHTML = '';
        if (Array.isArray(paciente.medicacao)) {
            paciente.medicacao.forEach(item => {
                criarItemMedicamento(item.nome_remedio, item.horario);
            });
        }
        
        btnSalvar.textContent = 'Atualizar Paciente';
    }

    // --- Limpar Formulário (MODIFICADO) ---
    function limparFormulario() {
        formPaciente.reset();
        inputId.value = '';
        listaMedicamentos.innerHTML = '';
        remedioSelect.value = '';
        inputRemedioPersonalizado.value = '';
        inputRemedioPersonalizado.style.display = 'none';
        inputRemedioHora.value = '00';
        inputRemedioMinuto.value = '00';
        inputBaixaHora.value = '00';
        inputBaixaMinuto.value = '00';
        btnSalvar.textContent = 'Salvar Paciente';
    }

    // --- Eventos (MODIFICADO) ---
    formPaciente.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const horarioBaixa = `${inputBaixaHora.value}:${inputBaixaMinuto.value}`;

        const paciente = {
            id: inputId.value || null,
            nome: document.getElementById('nome').value,
            sobrenome: document.getElementById('sobrenome').value,
            cpf: document.getElementById('cpf').value,
            data_nascimento: document.getElementById('data-nascimento').value,
            endereco: document.getElementById('endereco').value,
            procedimentos: document.getElementById('procedimentos').value,
            
            // Novos campos
            data_baixa: document.getElementById('data-baixa').value || null,
            horario_baixa: horarioBaixa === '00:00' ? null : horarioBaixa,

            medicacao: Array.from(listaMedicamentos.querySelectorAll('.medication-item')).map(li => {
                const textContent = li.querySelector('span').textContent;
                const [remedio, horario] = textContent.split(' - ');
                return {
                    nome_remedio: remedio.trim(),
                    horario: horario.trim()
                };
            })
        };

        salvarPaciente(paciente);
    });

    btnLimpar.addEventListener('click', limparFormulario);

    listaPacientes.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;
        
        if (target.classList.contains('btn-edit-paciente')) {
            const response = await fetch(`${apiBaseUrl}?id=${id}`);
            const paciente = await response.json();
            if (paciente && !paciente.error) {
                preencherFormulario(paciente);
            } else {
                mostrarNotificacao("Paciente não encontrado.", 'error');
            }
        } else if (target.classList.contains('btn-delete-paciente')) {
            deletarPaciente(id);
        }
    });

    // Funções de Pesquisa
    function filtrarPacientes() {
        const termoBusca = inputFiltroPacientes.value.toLowerCase();
        const pacientesFiltrados = todosPacientes.filter(paciente => {
            const nomeCompleto = `${paciente.nome} ${paciente.sobrenome}`.toLowerCase();
            const cpf = paciente.cpf;
            return nomeCompleto.includes(termoBusca) || cpf.includes(termoBusca);
        });
        renderizarPacientes(pacientesFiltrados);
    }
    inputFiltroPacientes.addEventListener('input', filtrarPacientes);

    fetchPacientes();
});