document.addEventListener('DOMContentLoaded', async () => {
    const apiBaseUrl = 'http://localhost/proj/src/php/api.php'; 

    // Pega o ID do paciente da URL (ex: paciente.html?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const pacienteId = urlParams.get('id');

    if (pacienteId) {
        try {
            // Faz a requisição para a API com o ID do paciente
            const response = await fetch(`${apiBaseUrl}?id=${pacienteId}`);
            const paciente = await response.json();

            // Preenche a página com os dados recebidos
            if (paciente && !paciente.error) {
                document.getElementById('paciente-nome').textContent = `${paciente.nome} ${paciente.sobrenome}`;
                document.getElementById('paciente-cpf').textContent = paciente.cpf;
                document.getElementById('paciente-data-nascimento').textContent = paciente.data_nascimento;
                document.getElementById('paciente-endereco').textContent = paciente.endereco;
                document.getElementById('paciente-procedimentos').textContent = paciente.procedimentos;
                
                // --- NOVO: Preenche a lista de medicamentos ---
                const listaMedicamentos = document.getElementById('paciente-medicamentos');
                listaMedicamentos.innerHTML = '';
                if (Array.isArray(paciente.medicacao)) {
                    paciente.medicacao.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = `${item.nome_remedio} - ${item.horario}`;
                        listaMedicamentos.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'Nenhuma medicação cadastrada.';
                    listaMedicamentos.appendChild(li);
                }
                // --- FIM DA MUDANÇA ---
            } else {
                document.getElementById('paciente-nome').textContent = 'Paciente não encontrado.';
            }

        } catch (error) {
            console.error('Erro ao buscar dados do paciente:', error);
            document.getElementById('paciente-nome').textContent = 'Erro ao carregar os dados.';
        }
    } else {
        document.getElementById('paciente-nome').textContent = 'ID do paciente não especificado.';
    }
});