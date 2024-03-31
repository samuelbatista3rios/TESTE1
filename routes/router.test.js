const express = require('express');
const fs = require('fs');
const app = express();
const router = require('./uploadRoutes')(app);

// Mock do multer
jest.mock('multer', () => {
    return jest.fn().mockReturnValue({
        any: jest.fn()
    });
});

// Importe o módulo router.js depois de mockar o multer
//const router = require('./uploadRoutes')(express());

describe('Testes do Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Testar conversão de arquivo TXT para JSON', () => {
        const mockFilePath = 'test.txt';
        const mockData = '["data1","data2","data3"]';
        const expectedResult = ['data1', 'data2', 'data3'];

        fs.readFileSync.mockReturnValueOnce(mockData);

        const result = router.converterTxtParaJson(mockFilePath);

        expect(result).toEqual(expectedResult);
        expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8');
    });

    test('Testar salvamento de arquivo JSON', () => {
        const mockFilePath = 'test.json';
        const mockData = [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }];
        const expectedData = JSON.stringify(mockData, null, 2);

        const result = router.salvarJson(mockFilePath, mockData);

        expect(result).toBe(true);
        expect(fs.writeFileSync).toHaveBeenCalledWith(mockFilePath, expectedData);
    });

    test('Testar rota de upload de arquivos', async () => {
        const mockReq = {
            files: [
                { fieldname: 'pedidosFile', path: 'pedidosPath', originalname: 'pedidos.txt' },
                { fieldname: 'notasFile', path: 'notasPath', originalname: 'notas.txt' }
            ]
        };
        const mockRes = {
            status: jest.fn(() => mockRes),
            send: jest.fn()
        };

        fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);
        fs.unlinkSync.mockImplementation(() => {});

        await router.handleUpload(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith('Nenhum arquivo foi enviado.');

        fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(true);
        fs.unlinkSync.mockImplementation(() => {});

        await router.handleUpload(mockReq, mockRes);

        expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
        expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
        expect(mockRes.send).toHaveBeenCalledWith('Arquivos foram processados e salvos com sucesso em formato JSON.');
    });
});
