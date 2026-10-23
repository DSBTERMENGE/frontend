import assert from 'node:assert/strict';

import ApiFrontend from './General_Classes/frontend_api.js';
import ValidarDadosForm from './General_Classes/ValidarDadosForm.js';


const chamadas = [];
globalThis.fetch = async (url, configuracao) => {
    chamadas.push({
        url,
        payload: JSON.parse(configuracao.body)
    });
    return new Response(
        JSON.stringify({ sucesso: true, competencia_destino: '2026-01' }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );
};

const api = new ApiFrontend('FinCtl', 'http://localhost:5000');
api.const_database_name = 'financas';

const previa = await api.obter_previa_virada('2025-12');
assert.equal(previa.sucesso, true);

const semConfirmacao = await api.confirmar_virada_competencia(
    '2025-12',
    '2026-01',
    false
);
assert.equal(semConfirmacao.erro, 'confirmacao_obrigatoria');
assert.equal(chamadas.length, 1);

const virada = await api.confirmar_virada_competencia(
    '2025-12',
    '2026-01',
    true
);
assert.equal(virada.sucesso, true);
assert.equal(chamadas.length, 2);
assert.equal(chamadas[0].url, 'http://localhost:5000/agenda/previa_virada');
assert.equal(
    chamadas[1].url,
    'http://localhost:5000/agenda/gerar_proxima_competencia'
);
assert.deepEqual(chamadas[1].payload, {
    competencia_origem: '2025-12',
    competencia_destino: '2026-01',
    confirmacao: true,
    database_name: 'financas'
});

const previaSincronizacao = await api.obter_previa_sincronizacao();
assert.equal(previaSincronizacao.sucesso, true);
assert.equal(
    chamadas[2].url,
    'http://localhost:5000/agenda/previa_sincronizacao'
);

const sincronizacaoSemConfirmacao = await api.confirmar_sincronizacao_agenda(
    '2026-02',
    'assinatura-teste',
    false
);
assert.equal(sincronizacaoSemConfirmacao.erro, 'confirmacao_obrigatoria');
assert.equal(chamadas.length, 3);

const sincronizacao = await api.confirmar_sincronizacao_agenda(
    '2026-02',
    'assinatura-teste',
    true
);
assert.equal(sincronizacao.sucesso, true);
assert.equal(
    chamadas[3].url,
    'http://localhost:5000/agenda/confirmar_sincronizacao'
);
assert.deepEqual(chamadas[3].payload, {
    competencia: '2026-02',
    assinatura_previa: 'assinatura-teste',
    confirmacao: true,
    database_name: 'financas'
});

assert.deepEqual(
    ValidarDadosForm.validarValorMonetario('R$ 75,00', 'Valor'),
    { valido: true, numero: 75, erro: null }
);
assert.equal(
    ValidarDadosForm.validarValorMonetario('R$ 5.738,50', 'Valor').numero,
    5738.5
);
assert.equal(
    ValidarDadosForm.validarValorMonetario('valor inválido', 'Valor').valido,
    false
);

console.log('Testes da API frontend da agenda aprovados.');
