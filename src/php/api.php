<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root"; 
$password = "root"; 
$dbname = "local_edu";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Falha na conexão: " . $conn->connect_error]));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            echo json_encode(["error" => "Dados inválidos."]);
            break;
        }
        
        $sql = "INSERT INTO pacientes (nome, sobrenome, cpf, data_nascimento, endereco, procedimentos, medicacao) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        $medicacaoJson = json_encode($data['medicacao'] ?? []);
        
        $stmt->bind_param("sssssss", $data['nome'], $data['sobrenome'], $data['cpf'], $data['data_nascimento'], $data['endereco'], $data['procedimentos'], $medicacaoJson);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Paciente cadastrado com sucesso!", "id" => $conn->insert_id]);
        } else {
            echo json_encode(["error" => "Erro ao cadastrar paciente: " . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'GET':
        if (isset($_GET['id'])) {
            $sql = "SELECT * FROM pacientes WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $_GET['id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $paciente = $result->fetch_assoc();
            
            if ($paciente) {
                // Adiciona o histórico de internações
                $sql_historico = "SELECT * FROM historico_internacoes WHERE paciente_id = ? ORDER BY data_saida DESC";
                $stmt_historico = $conn->prepare($sql_historico);
                $stmt_historico->bind_param("i", $_GET['id']);
                $stmt_historico->execute();
                $result_historico = $stmt_historico->get_result();
                $paciente['historico'] = [];
                while ($row = $result_historico->fetch_assoc()) {
                    $row['medicacao'] = json_decode($row['medicacao'], true) ?? [];
                    $paciente['historico'][] = $row;
                }
                
                // Decodifica os dados da internação ativa
                $paciente['medicacao'] = json_decode($paciente['medicacao'], true) ?? [];
                
                echo json_encode($paciente);
            } else {
                echo json_encode(["error" => "Paciente não encontrado."]);
            }
            $stmt->close();
        } else {
            $sql = "SELECT * FROM pacientes";
            $result = $conn->query($sql);
            $pacientes = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $row['medicacao'] = json_decode($row['medicacao'], true) ?? [];
                    $pacientes[] = $row;
                }
            }
            echo json_encode($pacientes);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'])) {
            echo json_encode(["error" => "ID do paciente não fornecido."]);
            break;
        }
        $id = $data['id'];
        
        $sql = "UPDATE pacientes SET nome=?, sobrenome=?, cpf=?, data_nascimento=?, endereco=?, procedimentos=?, medicacao=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        
        $medicacaoJson = json_encode($data['medicacao'] ?? []);

        $stmt->bind_param("sssssssi", $data['nome'], $data['sobrenome'], $data['cpf'], $data['data_nascimento'], $data['endereco'], $data['procedimentos'], $medicacaoJson, $id);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Paciente atualizado com sucesso!"]);
        } else {
            echo json_encode(["error" => "Erro ao atualizar paciente: " . $stmt->error]);
        }
        $stmt->close();
        break;
        
    case 'DELETE':
        if (!isset($_GET['id'])) {
            echo json_encode(["error" => "ID do paciente não fornecido."]);
            break;
        }
        $id = $_GET['id'];
        $sql = "DELETE FROM pacientes WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Paciente excluído com sucesso!"]);
        } else {
            echo json_encode(["error" => "Erro ao excluir paciente: " . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PATCH':
        // Lógica para dar alta ao paciente e salvar o histórico
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['paciente_id'])) {
            echo json_encode(["error" => "ID do paciente não fornecido para a alta."]);
            break;
        }

        // 1. Salva a internação atual no histórico
        $sql_historico = "INSERT INTO historico_internacoes (paciente_id, data_entrada, data_saida, horario_saida, procedimentos, medicacao) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_historico = $conn->prepare($sql_historico);

        $procedimentos_historico = $data['procedimentos'];
        $medicacao_historico = json_encode($data['medicacao']);
        $data_entrada = $data['data_entrada'];
        $data_saida = $data['data_saida'];
        $horario_saida = $data['horario_saida'];

        $stmt_historico->bind_param("isssss", $data['paciente_id'], $data_entrada, $data_saida, $horario_saida, $procedimentos_historico, $medicacao_historico);

        if ($stmt_historico->execute()) {
            // 2. Limpa os dados de internação atual na tabela de pacientes
            $sql_limpa = "UPDATE pacientes SET procedimentos = '', medicacao = '[]' WHERE id = ?";
            $stmt_limpa = $conn->prepare($sql_limpa);
            $stmt_limpa->bind_param("i", $data['paciente_id']);
            $stmt_limpa->execute();
            
            echo json_encode(["message" => "Paciente deu entrada no histórico com sucesso!"]);
        } else {
            echo json_encode(["error" => "Erro ao dar entrada no histórico: " . $stmt_historico->error]);
        }
        
        $stmt_historico->close();
        break;

    default:
        echo json_encode(["error" => "Método não suportado"]);
        break;
}

$conn->close();
?>