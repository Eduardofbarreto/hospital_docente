<?php
// Linhas para depuração (remova em produção)
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
        
        // NOVO: Altera a coluna de 'checklist' para 'medicacao'
        $sql = "INSERT INTO pacientes (nome, sobrenome, cpf, data_nascimento, endereco, procedimentos, medicacao) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        // NOVO: Codifica o array de 'medicacao' para JSON
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
                // NOVO: Decodifica o JSON da coluna 'medicacao'
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
                    // NOVO: Decodifica o JSON da coluna 'medicacao' na lista
                    $row['medicacao'] = json_decode($row['medicacao'], true) ?? [];
                    $pacientes[] = $row;
                }
            }
            echo json_encode($pacientes);
        }
        break;

    case 'PUT':
    case 'PATCH':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'])) {
            echo json_encode(["error" => "ID do paciente não fornecido."]);
            break;
        }
        $id = $data['id'];
        
        // NOVO: Altera a coluna de 'checklist' para 'medicacao'
        $sql = "UPDATE pacientes SET nome=?, sobrenome=?, cpf=?, data_nascimento=?, endereco=?, procedimentos=?, medicacao=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        
        // NOVO: Codifica o array de 'medicacao' para JSON
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

    default:
        echo json_encode(["error" => "Método não suportado"]);
        break;
}

$conn->close();
?>