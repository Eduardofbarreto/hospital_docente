document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost/proj/src/php/api.php';
    const formPaciente = document.getElementById('form-paciente');
    const inputId = document.getElementById('paciente-id');
    const inputDataEntrada = document.getElementById('data-entrada');
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
    const checkboxSN = document.getElementById('sn-checkbox');

    // NOVO: Referências para a seção de alta
    const altaSection = document.getElementById('alta-section');
    const inputDataAlta = document.getElementById('data-alta');
    const inputAltaHora = document.getElementById('alta-hora');
    const inputAltaMinuto = document.getElementById('alta-minuto');
    const btnAltaHourUp = document.getElementById('btn-alta-hour-up');
    const btnAltaHourDown = document.getElementById('btn-alta-hour-down');
    const btnAltaMinuteUp = document.getElementById('btn-alta-minute-up');
    const btnAltaMinuteDown = document.getElementById('btn-alta-minute-down');
    const btnDarAlta = document.getElementById('btn-dar-alta');
    
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

    // Lógica de controle de hora e minuto (geral)
    function formatTime(value) {
        return value.toString().padStart(2, '0');
    }

    function setupTimeControls(hourInput, minuteInput, hourUp, hourDown, minuteUp, minuteDown) {
        hourUp.addEventListener('click', () => {
            let hour = parseInt(hourInput.value);
            hour = (hour + 1) % 24;
            hourInput.value = formatTime(hour);
        });
        hourDown.addEventListener('click', () => {
            let hour = parseInt(hourInput.value);
            hour = (hour - 1 + 24) % 24;
            hourInput.value = formatTime(hour);
        });
        minuteUp.addEventListener('click', () => {
            let minute = parseInt(minuteInput.value);
            minute = (minute + 1) % 60;
            minuteInput.value = formatTime(minute);
        });
        minuteDown.addEventListener('click', () => {
            let minute = parseInt(minuteInput.value);
            minute = (minute - 1 + 60) % 60;
            minuteInput.value = formatTime(minute);
        });
    }

    setupTimeControls(inputRemedioHora, inputRemedioMinuto, btnHourUp, btnHourDown, btnMinuteUp, btnMinuteDown);
    setupTimeControls(inputAltaHora, inputAltaMinuto, btnAltaHourUp, btnAltaHourDown, btnAltaMinuteUp, btnAltaMinuteDown);

    // Funções de Medicação
    remedioSelect.addEventListener('change', () => {
        inputRemedioPersonalizado.style.display = remedioSelect.value === 'outro' ? 'inline-block' : 'none';
        if (remedioSelect.value !== 'outro') {
            inputRemedioPersonalizado.value = '';
        }
    });
    
    function criarItemMedicamento(remedio, horario, sn) {
        const li = document.createElement('li');
        li.classList.add('medication-item');
        
        const medicationText = document.createElement('span');
        medicationText.textContent = `${remedio} - ${horario}`;
        
        const snLabel = document.createElement('label');
        snLabel.classList.add('sn-label');
        const snCheckbox = document.createElement('input');
        snCheckbox.type = 'checkbox';
        snCheckbox.checked = sn;
        snLabel.appendChild(snCheckbox);
        snLabel.append('SN');
        
        li.appendChild(medicationText);
        li.appendChild(snLabel);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('medication-item-actions');
        actionsDiv.innerHTML = `
            <button type="button" class="btn-edit" title="Editar">✏️</button>
            <button type="button" class="btn-delete" title="Excluir">❌</button>
        `;
        li.appendChild(actionsDiv);
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
        const sn = checkboxSN.checked;

        if (remedio && horario) {
            criarItemMedicamento(remedio, horario, sn);
            remedioSelect.value = '';
            inputRemedioPersonalizado.value = '';
            inputRemedioPersonalizado.style.display = 'none';
            inputRemedioHora.value = '00';
            inputRemedioMinuto.value = '00';
            checkboxSN.checked = false;
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

    // NOVO: Função para dar alta ao paciente
    async function darAltaPaciente(paciente) {
        try {
            const response = await fetch(apiBaseUrl, {
                method: 'PATCH',
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
            console.error('Erro ao dar alta:', error);
            mostrarNotificacao('Erro de conexão ou servidor.', 'error');
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
        inputDataEntrada.value = paciente.data_nascimento; // Reutilizando a data de nascimento como data de entrada
        document.getElementById('nome').value = paciente.nome;
        document.getElementById('sobrenome').value = paciente.sobrenome;
        document.getElementById('cpf').value = paciente.cpf;
        document.getElementById('data-nascimento').value = paciente.data_nascimento;
        document.getElementById('endereco').value = paciente.endereco;
        document.getElementById('procedimentos').value = paciente.procedimentos;
        
        // Medicação
        listaMedicamentos.innerHTML = '';
        if (Array.isArray(paciente.medicacao)) {
            paciente.medicacao.forEach(item => {
                criarItemMedicamento(item.nome_remedio, item.horario, item.sn);
            });
        }
        
        btnSalvar.textContent = 'Atualizar Paciente';
        altaSection.style.display = 'block';
    }

    // --- Limpar Formulário (MODIFICADO) ---
    function limparFormulario() {
        formPaciente.reset();
        inputId.value = '';
        inputDataEntrada.value = '';
        listaMedicamentos.innerHTML = '';
        remedioSelect.value = '';
        inputRemedioPersonalizado.value = '';
        inputRemedioPersonalizado.style.display = 'none';
        inputRemedioHora.value = '00';
        inputRemedioMinuto.value = '00';
        checkboxSN.checked = false;
        btnSalvar.textContent = 'Salvar Paciente';
        altaSection.style.display = 'none';
        inputDataAlta.value = '';
        inputAltaHora.value = '00';
        inputAltaMinuto.value = '00';
    }

    // --- Eventos (MODIFICADO) ---
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
            medicacao: Array.from(listaMedicamentos.querySelectorAll('.medication-item')).map(li => {
                const textContent = li.querySelector('span').textContent;
                const [remedio, horario] = textContent.split(' - ');
                const sn = li.querySelector('.sn-label input').checked;
                return {
                    nome_remedio: remedio.trim(),
                    horario: horario.trim(),
                    sn: sn
                };
            })
        };

        salvarPaciente(paciente);
    });

    // NOVO: Evento para o botão de Dar Alta
    btnDarAlta.addEventListener('click', () => {
        if (!inputId.value) {
            mostrarNotificacao("Selecione um paciente para dar alta.", 'error');
            return;
        }

        const altaData = {
            paciente_id: inputId.value,
            data_entrada: inputDataEntrada.value,
            data_saida: inputDataAlta.value,
            horario_saida: `${inputAltaHora.value}:${inputAltaMinuto.value}`,
            procedimentos: document.getElementById('procedimentos').value,
            medicacao: Array.from(listaMedicamentos.querySelectorAll('.medication-item')).map(li => {
                const textContent = li.querySelector('span').textContent;
                const [remedio, horario] = textContent.split(' - ');
                const sn = li.querySelector('.sn-label input').checked;
                return {
                    nome_remedio: remedio.trim(),
                    horario: horario.trim(),
                    sn: sn
                };
            })
        };
        
        darAltaPaciente(altaData);
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