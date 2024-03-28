const express = require('express');
const fs = require('fs');
const multer = require('multer');
const app = express();
const port = 3000;

// Configurar multer para lidar com o upload de arquivos
const upload = multer({ dest: 'uploads/' });

// Diretórios para salvar os arquivos JSON
const diretorioPedidos = './uploads/pedidos';
const diretorioNotas = './uploads/notas';

// Verificar se os diretórios de pedidos e notas existem, se não, criá-los
if (!fs.existsSync(diretorioPedidos)) {
    fs.mkdirSync(diretorioPedidos, { recursive: true });
}
if (!fs.existsSync(diretorioNotas)) {
    fs.mkdirSync(diretorioNotas, { recursive: true });
}

// Função para converter arquivo TXT para JSON
function converterTxtParaJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8').trim().split('\n');
        const jsonData = data.map(line => JSON.parse(line));
        return jsonData;
    } catch (error) {
        console.error('Erro ao converter arquivo TXT para JSON:', error);
        return null;
    }
}

// Função para salvar arquivo JSON
function salvarJson(filePath, jsonData) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
        console.log(`Arquivo JSON salvo em: ${filePath}`);
        return true;
    } catch (error) {
        console.error('Erro ao salvar arquivo JSON:', error);
        return false;
    }
}

// Rota para lidar com o upload de arquivos
app.post('/upload', upload.any(), (req, res) => {
    // Verificar se os arquivos foram enviados
    if (!req.files || req.files.length === 0) {
        res.status(400).send('Nenhum arquivo foi enviado.');
        return;
    }

    req.files.forEach(file => {
        const jsonData = converterTxtParaJson(file.path);
        const filePath = file.originalname.endsWith('.txt') ? file.originalname.replace('.txt', '.json') : file.originalname + '.json';

        if (file.fieldname === 'pedidosFile') {
            salvarJson(`${diretorioPedidos}/${filePath}`, jsonData);
        } else if (file.fieldname === 'notasFile') {
            salvarJson(`${diretorioNotas}/${filePath}`, jsonData);
        }

        fs.unlinkSync(file.path); // Remover arquivo temporário de upload
    });

    res.send('Arquivos foram processados e salvos com sucesso em formato JSON.');
});

// Servir o HTML da página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
