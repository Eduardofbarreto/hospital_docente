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

    // Novas referências para os elementos de medicação
    const inputRemedioNome = document.getElementById('remedio-nome');
    const inputRemedioHorario = document.getElementById('remedio-horario');
    const btnAdicionarRemedio = document.getElementById('btn-adicionar-remedio');
    const listaMedicamentos = document.getElementById('lista-medicamentos');

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

    // --- Início das Funções de Medicação (Novo) ---
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
            const novoNome = prompt("Editar nome do remédio:", remedio);
            if (novoNome !== null && novoNome.trim() !== '') {
                const novoHorario = prompt("Editar horário:", horario);
                if (novoHorario !== null && novoHorario.trim() !== '') {
                    li.querySelector('span').textContent = `${novoNome} - ${novoHorario}`;
                }
            }
        });
    }

    btnAdicionarRemedio.addEventListener('click', () => {
        const remedio = inputRemedioNome.value.trim();
        const horario = inputRemedioHorario.value.trim();
        if (remedio && horario) {
            criarItemMedicamento(remedio, horario);
            inputRemedioNome.value = '';
            inputRemedioHorario.value = '';
        }
    });

    inputRemedioHorario.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnAdicionarRemedio.click();
        }
    });
    // --- Fim das Funções de Medicação ---

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

    // --- Preencher Formulário (Modificado) ---
    function preencherFormulario(paciente) {
        inputId.value = paciente.id;
        document.getElementById('nome').value = paciente.nome;
        document.getElementById('sobrenome').value = paciente.sobrenome;
        document.getElementById('cpf').value = paciente.cpf;
        document.getElementById('data-nascimento').value = paciente.data_nascimento;
        document.getElementById('endereco').value = paciente.endereco;
        document.getElementById('procedimentos').value = paciente.procedimentos;
        
        // Limpa e preenche a nova lista de medicamentos
        listaMedicamentos.innerHTML = '';
        if (Array.isArray(paciente.medicacao)) {
            paciente.medicacao.forEach(item => {
                criarItemMedicamento(item.nome_remedio, item.horario);
            });
        }
        
        btnSalvar.textContent = 'Atualizar Paciente';
    }

    // --- Limpar Formulário (Modificado) ---
    function limparFormulario() {
        formPaciente.reset();
        inputId.value = '';
        listaMedicamentos.innerHTML = ''; // Limpa a lista de medicação
        btnSalvar.textContent = 'Salvar Paciente';
    }

    // Eventos
    formPaciente.addEventListener('submit', async (e) => {
        e.preventDefault();
        const paciente = {
            id: inputId.value || null,
            nome: document.getElementById('nome').value,
            sobrenome: document.getElementById('sobrenome').value,
            cpf: document.getElementById('cpf').value,
            data_nascimento: document.getElementById('data-nascimento').value,
            endereco: document.getElementById('endereco').value,
            procedimentos: document.getElementById('procedimentos').value,
            // Nova lógica para capturar os dados da medicação
            medicacao: Array.from(listaMedicamentos.querySelectorAll('.medication-item')).map(li => {
                const textContent = li.querySelector('span').textContent;
                const [remedio, horario] = textContent.split(' - ');
                return {
                    nome_remedio: remedio,
                    horario: horario
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