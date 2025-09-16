document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost/proj/src/php/api.php';
    const formPaciente = document.getElementById('form-paciente');
    const inputId = document.getElementById('paciente-id');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnLimpar = document.getElementById('btn-limpar');
    const listaPacientes = document.getElementById('lista-pacientes');
    const inputNovoItem = document.getElementById('novo-item');
    const btnAdicionarCheck = document.getElementById('btn-adicionar');
    const listaChecklist = document.getElementById('lista-checklist');
    const inputFiltroPacientes = document.getElementById('filtro-pacientes');

    let todosPacientes = []; // Variável para armazenar todos os pacientes

    // Funções da Checklist
    function criarItemChecklist(texto, completo = false) {
        const li = document.createElement('li');
        li.classList.add('checklist-item');
        li.innerHTML = `
            <label>
                <input type="checkbox" ${completo ? 'checked' : ''}>
                <span>${texto}</span>
            </label>
            <div class="checklist-item-actions">
                <button type="button" class="btn-edit" title="Editar">✏️</button>
                <button type="button" class="btn-delete" title="Excluir">❌</button>
            </div>
        `;
        listaChecklist.appendChild(li);

        li.querySelector('.btn-delete').addEventListener('click', () => {
            li.remove();
        });

        li.querySelector('.btn-edit').addEventListener('click', () => {
            const novoTexto = prompt("Editar item:", texto);
            if (novoTexto !== null && novoTexto.trim() !== '') {
                li.querySelector('span').textContent = novoTexto;
            }
        });

        li.querySelector('input[type="checkbox"]').addEventListener('change', () => {
            // Aqui você pode adicionar lógica para salvar o estado do checkbox, se necessário
        });
    }

    btnAdicionarCheck.addEventListener('click', () => {
        const texto = inputNovoItem.value.trim();
        if (texto) {
            criarItemChecklist(texto);
            inputNovoItem.value = '';
        }
    });

    inputNovoItem.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnAdicionarCheck.click();
        }
    });

    // Funções de CRUD (API)
    async function fetchPacientes() {
        try {
            const response = await fetch(apiBaseUrl);
            const pacientes = await response.json();
            todosPacientes = pacientes; // Armazena a lista completa
            renderizarPacientes(todosPacientes); // Renderiza a lista completa
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
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
            return await response.json();
        } catch (error) {
            console.error('Erro ao salvar paciente:', error);
            return { error: 'Erro de conexão ou servidor.' };
        }
    }

    async function deletarPaciente(id) {
        if (confirm('Tem certeza que deseja excluir este paciente?')) {
            try {
                const response = await fetch(`${apiBaseUrl}?id=${id}`, { method: 'DELETE' });
                return await response.json();
            } catch (error) {
                console.error('Erro ao deletar paciente:', error);
                return { error: 'Erro de conexão ou servidor.' };
            }
        }
    }

    // Funções de Interação com a UI
    function renderizarPacientes(pacientes) {
        listaPacientes.innerHTML = '';
        if (Array.isArray(pacientes)) {
            // Ordena os pacientes em ordem alfabética pelo nome
            pacientes.sort((a, b) => a.nome.localeCompare(b.nome));

            pacientes.forEach(paciente => {
                const li = document.createElement('li');
                li.classList.add('paciente-item');
                
                // Cria o link clicável
                const link = document.createElement('a');
                link.href = `paciente.html?id=${paciente.id}`;
                link.textContent = `${paciente.nome} ${paciente.sobrenome}`;
                
                // Adiciona o link e os botões à lista
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

    function preencherFormulario(paciente) {
        inputId.value = paciente.id;
        document.getElementById('nome').value = paciente.nome;
        document.getElementById('sobrenome').value = paciente.sobrenome;
        document.getElementById('cpf').value = paciente.cpf;
        document.getElementById('data-nascimento').value = paciente.data_nascimento;
        document.getElementById('endereco').value = paciente.endereco;
        document.getElementById('procedimentos').value = paciente.procedimentos;
        
        listaChecklist.innerHTML = '';
        if (Array.isArray(paciente.checklist)) {
            paciente.checklist.forEach(item => {
                criarItemChecklist(item.texto, item.completo);
            });
        }
        
        btnSalvar.textContent = 'Atualizar Paciente';
    }

    function limparFormulario() {
        formPaciente.reset();
        inputId.value = '';
        listaChecklist.innerHTML = '';
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
            checklist: Array.from(listaChecklist.querySelectorAll('.checklist-item')).map(li => {
                return {
                    texto: li.querySelector('span').textContent,
                    completo: li.querySelector('input[type="checkbox"]').checked
                };
            })
        };

        const result = await salvarPaciente(paciente);
        alert(result.message || result.error);
        limparFormulario();
        fetchPacientes(); // Atualiza a lista
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
                alert("Paciente não encontrado.");
            }
        } else if (target.classList.contains('btn-delete-paciente')) {
            const result = await deletarPaciente(id);
            alert(result.message || result.error);
            fetchPacientes();
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