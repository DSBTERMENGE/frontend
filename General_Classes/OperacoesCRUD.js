/*
************************************************************
        OPERAÇÕES CRUD - FRAMEWORK DSB
************************************************************

Este arquivo implementa as operações de CRUD, navegação e manipulação
para formulários após validação de dados (Framework DSB).

ESPECIALIZAÇÃO: Manipulação de interface e população de formulários
- Recebe dados da API e popula formulários
- Executa operações de navegação e filtros
- Gerencia interface durante operações

FLUXO DE EXECUÇÃO:
1. ValidarDadosForms.js → Validação obrigatória
2. OperacoesCRUD.js → Execução das operações (este arquivo)

************************************************************
*/

// Importando funções de debugging (primeiro para seguir critério)
import { flow_marker, error_catcher } from './Debugger.js';

/**
 * 🚨 ALERTA DE ESTADO - Informa usuário sobre processo de edição/inclusão em andamento
 * Emite mensagem específica baseada no valor da variável botao_ativo
 */
function AlertaEstadoDeEdicao_Inclusao() {
    const operacao = botao_ativo === 'editar' ? 'edição' : 'inclusão';
    alert(`Um processo de ${operacao} está em andamento. Para sair do processo clique em "Encerrar" ou "Salvar".`);
}

/**
 * 🔍 VALIDAÇÃO ENCERRAR EDIÇÃOpulação
para formulários após validação de dados (Framework DSB).

ESPECIALIZAÇÃO: Manipulação de interface e população de formulários
- Recebe dados da API e popula formulários
- Executa operações de navegação e filtros
- Gerencia interface durante operações

FLUXO DE EXECUÇÃO:
1. ValidarDadosForms.js → Validação obrigatória
2. OperacoesCRUD.js → Execução das operações (este arquivo)

RESPONSABILIDADES:
- Popular formulários com dados recebidos da API
- Executar operações de navegação (próximo, anterior, primeiro, último)
- Executar filtros de busca
- Executar inserção de novos registros
- Executar atualização de registros existentes
- Gerenciar interface durante operações

INTEGRAÇÃO:
- Trabalha com dados da frontend_api.js
- Atualiza interface de formulários
- Funciona para múltiplas aplicações

ÚLTIMA ATUALIZAÇÃO: Reorganizado - Sistema ativo de botões (Framework DSB)
************************************************************
*/

//************************************************************
//                    VARIÁVEIS GLOBAIS
//************************************************************

let dadosDisponiveis = [];    // Dados recebidos da API
let reg_num = 0;             // Registro atual (BASE 0) 
let botao_ativo = null;      // Último botão clicado
let listenerConfigurado = false;  // Evita múltiplos listeners
let contadorExecucoes = 0;   // Debug: contador de execuções
let dadosOriginaisRegistro = {}; // Backup dos dados originais do registro atual

//************************************************************
//                    FUNÇÕES AUXILIARES
//************************************************************

/**
 * ⚠️ BEEP: Indica que chegou ao limite de navegação
 */
function emitirBeepLimite(limite) {

    
    // Tentativa de beep real (alguns navegadores suportam)
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Frequência do beep
        gainNode.gain.value = 0.1; // Volume baixo
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1); // Beep de 100ms
    } catch (error) {
        // Fallback: apenas log no console

    }
}

/**
 * 🔧 MODO EDITAR/NOVO: Controla estado dos campos
 * @param {boolean} ativar - true = campos editáveis/amarelos, false = readonly/cor padrão
 */
function _setModoEditarNovo(ativar) {
    // Captura TODOS os tipos de campos criados pelo framework
    const campos = document.querySelectorAll('input, textarea, select, input[type="checkbox"], .radio-group');
    const botaoEncerrar = document.getElementById('btn_encerrar');
    
    campos.forEach(campo => {
        if (ativar) {
            // Tornar editáveis e fundo amarelo
            campo.removeAttribute('readonly');
            campo.removeAttribute('disabled');
            campo.style.backgroundColor = 'yellow';
        } else {
            // Tornar readonly e cor padrão
            campo.setAttribute('readonly', true);
            if (campo.tagName === 'SELECT' || campo.type === 'checkbox') {
                campo.setAttribute('disabled', true);
            }
            campo.style.backgroundColor = '';
        }
    });
    
    if (botaoEncerrar) {
        if (ativar) {
            // Cor azul VS Code
            botaoEncerrar.style.backgroundColor = '#0078d4';
        } else {
            // Cor original
            botaoEncerrar.style.backgroundColor = '';
        }
    }
}

//************************************************************
//                      LISTENERS
//************************************************************

/**
 * 🎧 Configura listeners para eventos de botões genericamente
 */
function configurarListenersNavegacao() {

    
    // Aguarda o DOM estar pronto
    setTimeout(() => {
        const formFooter = document.querySelector('footer');
        
        if (formFooter && !listenerConfigurado) {

            
            formFooter.addEventListener('formulario-acao', function(event) {
                // Validação defensiva: verifica se event.detail existe
                if (!event.detail) {
                    console.warn('⚠️ Evento sem detail - ignorando');
                    return;
                }
                
                const { acao, instancia, dados } = event.detail;
                

                
                // Processa TODAS as ações: navegação + CRUD
                if (['primeiro', 'anterior', 'proximo', 'ultimo', 'encerrar', 'editar', 'incluir', 'salvar', 'deletar'].includes(acao)) {

                    processarAcaoGenerica(acao, instancia, dados);
                } else {

                }
            });
            
            listenerConfigurado = true; // Marca como configurado

        } else {

        }
    }, 1500);
}

//************************************************************
//                  PROCESSADOR PRINCIPAL
//************************************************************

/**
 * 🔄 PROCESSADOR PRINCIPAL: Switch case para TODAS as ações (navegação + CRUD)
 * @param {string} acao - Ação (primeiro, anterior, proximo, ultimo, encerrar, editar, incluir, salvar, deletar)
 * @param {Object} instancia - Instância do formulário
 * @param {Object} dados - Dados do formulário
 */
function processarAcaoGenerica(acao, instancia, dados) {

    
    // 🛡️ PROTEÇÃO: Verificar se está em modo edição/inclusão
    if (botao_ativo === 'editar' || botao_ativo === 'incluir') {
        if (acao !== 'salvar' && acao !== 'encerrar') {

            AlertaEstadoDeEdicao_Inclusao();
            return; // Para aqui, não executa a ação
        }
    }
    
    switch (acao) {
        // ======= AÇÕES DE NAVEGAÇÃO =======
        case 'primeiro':
            flow_marker('Iniciando processo de navegação para o primeiro registro');
            _Valida_Navegar('primeiro');
            break;
            
        case 'anterior':
            _Valida_Navegar('anterior');
            break;
            
        case 'proximo':
            _Valida_Navegar('proximo');
            break;
            
        case 'ultimo':
            _Valida_Navegar('ultimo');
            break;
            
        // ======= AÇÕES CRUD =======
        case 'encerrar':
            processarEncerrar(instancia, dados);
            break;
            
        case 'editar':
            botao_ativo = 'editar';
            // Captura dados originais antes de entrar em modo edição
            dadosOriginaisRegistro = _capturarDadosAtuaisFormulario();
            _setModoEditarNovo(true);
            processarEditar();
            break;
            
        case 'incluir':
            botao_ativo = 'incluir';
            _setModoEditarNovo(true);
            processarIncluir();
            break;
            
        case 'salvar':
            processarSalvar();
            break;
            
        case 'deletar':
            flow_marker('Iniciando processo de deletar');
            processarDeletar();
            break;
            
        default:
            console.error(`❌ Ação não implementada: ${acao}`);
    }
}

/**
 * � VALIDAÇÃO ENCERRAR EDIÇÃO
 * Compara valores atuais dos campos com os dados originais do registro
 * Se houver alterações, pergunta se deseja cancelar as alterações
 * @returns {boolean} true = pode encerrar, false = abortar encerramento
 */
function valida_Encerrar_Edicao() {
    const camposAlterados = [];
    const dadosAtuais = _capturarDadosAtuaisFormulario();
    
    // Compara cada campo com os dados originais
    Object.keys(dadosOriginaisRegistro).forEach(campo => {
        const valorOriginal = dadosOriginaisRegistro[campo] || '';
        const valorAtual = dadosAtuais[campo] || '';
        
        if (valorOriginal.toString() !== valorAtual.toString()) {
            camposAlterados.push(campo);
        }
    });
    
    // Se não há alterações, libera encerramento
    if (camposAlterados.length === 0) {
        return true;
    }
    
    // Se há alterações, pergunta ao usuário
    const listaCampos = camposAlterados.join(', ');
    const confirmacao = confirm(
        `Os seguintes campos foram alterados: ${listaCampos}\n\n` +
        `Deseja cancelar as alterações e encerrar a edição?`
    );
    
    if (confirmacao) {
        // Usuário confirmou: repopula o registro original
        _popularFormularioAutomatico(dadosOriginaisRegistro);
        return true;
    } else {
        // Usuário cancelou: aborta o encerramento
        return false;
    }
}

/**
 * 🔍 VALIDAÇÃO ENCERRAR NOVO
 * Verifica se algum campo foi preenchido durante inclusão
 * Se houver dados, pergunta se deseja encerrar o processo de inclusão
 * @returns {boolean} true = pode encerrar, false = abortar encerramento
 */
function valida_Encerrar_Novo() {
    const dadosAtuais = _capturarDadosAtuaisFormulario();
    const camposPreenchidos = [];
    
    // Verifica quais campos foram preenchidos
    Object.keys(dadosAtuais).forEach(campo => {
        const valor = dadosAtuais[campo];
        if (valor && valor.toString().trim() !== '') {
            camposPreenchidos.push(campo);
        }
    });
    
    // Se nenhum campo foi preenchido, encerra normalmente
    if (camposPreenchidos.length === 0) {
        // Repopula o registro atual se existir
        if (dadosDisponiveis.length > 0 && dadosDisponiveis[reg_num]) {
            _popularFormularioAutomatico(dadosDisponiveis[reg_num]);
        }
        return true;
    }
    
    // Se há campos preenchidos, pergunta ao usuário
    const confirmacao = confirm(
        `Foram feitas alterações nos campos durante a inclusão.\n\n` +
        `Deseja encerrar o processo de inclusão?`
    );
    
    if (confirmacao) {
        // Usuário confirmou: repopula o registro atual se existir
        if (dadosDisponiveis.length > 0 && dadosDisponiveis[reg_num]) {
            _popularFormularioAutomatico(dadosDisponiveis[reg_num]);
        }
        return true;
    } else {
        // Usuário cancelou: aborta o encerramento
        return false;
    }
}

/**
 * 📥 CAPTURA DADOS ATUAIS DO FORMULÁRIO
 * Coleta todos os valores atuais dos campos do formulário
 * @returns {Object} Objeto com valores atuais dos campos
 */
function _capturarDadosAtuaisFormulario() {
    const dados = {};
    const campos = document.querySelectorAll('input, textarea, select');
    
    campos.forEach(campo => {
        if (campo.id) {
            if (campo.type === 'checkbox') {
                dados[campo.id] = campo.checked;
            } else {
                dados[campo.id] = campo.value;
            }
        }
    });
    
    return dados;
}

/**
 * Valida se é possível navegar para o registro solicitado e executa a navegação.
 * @param {string} acao - Ação de navegação: 'primeiro', 'ultimo', 'proximo', 'anterior'
 */
function _Valida_Navegar(acao) {
    if (!Array.isArray(dadosDisponiveis) || dadosDisponiveis.length === 0) {
        console.warn('⚠️ Nenhum dado disponível para navegação');
        return false;
    }

    switch (acao) {
        case 'primeiro':
            if (reg_num === 0) {
                emitirBeepLimite('primeiro');
                return;
            }
            reg_num = 0;
            _popularFormularioAutomatico(dadosDisponiveis[reg_num]);
            break;
            
        case 'ultimo':
            if (reg_num === dadosDisponiveis.length - 1) {
                emitirBeepLimite('último');
                return;
            }
            reg_num = dadosDisponiveis.length - 1;
            _popularFormularioAutomatico(dadosDisponiveis[reg_num]);
            break;
            
        case 'proximo':
            if (reg_num >= dadosDisponiveis.length - 1) {
                emitirBeepLimite('último');
                return;
            }
            reg_num++;
            _popularFormularioAutomatico(dadosDisponiveis[reg_num]);
            break;
            
        case 'anterior':
            if (reg_num <= 0) {
                emitirBeepLimite('primeiro');
                return;
            }
            reg_num--;
            _popularFormularioAutomatico(dadosDisponiveis[reg_num]);
            break;
            
        default:

    }
}

//************************************************************
//                 HANDLERS DE NAVEGAÇÃO
//************************************************************

//************************************************************
//                    HANDLERS CRUD
//************************************************************

/**
 * 🚪 Handler para ação ENCERRAR (Sair/Fechar formulário)
 * @param {Object} instancia - Instância do formulário
 * @param {Object} dados - Dados do formulário
 */
function processarEncerrar(instancia, dados) {

    
    // COMPORTAMENTO 1: Se estiver em modo Editar = Validar alterações
    if (botao_ativo === 'editar') {
        const podeEncerrar = valida_Encerrar_Edicao();
        if (!podeEncerrar) {
            return; // Usuário cancelou o encerramento
        }
        
        // Sair do modo edição
        _setModoEditarNovo(false);
        botao_ativo = '';
        return; // Não fecha formulário, apenas cancela a operação
    }
    
    // COMPORTAMENTO 2: Se estiver em modo Incluir = Validar dados inseridos
    if (botao_ativo === 'incluir') {
        const podeEncerrar = valida_Encerrar_Novo();
        if (!podeEncerrar) {
            return; // Usuário cancelou o encerramento
        }
        
        // Sair do modo inclusão
        _setModoEditarNovo(false);
        botao_ativo = '';
        return; // Não fecha formulário, apenas cancela a operação
    }
    
    // COMPORTAMENTO 3: Encerramento normal do formulário (modo visualização)

    
    try {
        // 🎭 ENCERRAMENTO DE FORMULÁRIOS TIPO MODAL
        // Formulários modais são destruídos completamente do DOM
        const modal = document.querySelector('.modal-formulario');
        
        if (modal) {

            
            // Remove o modal do DOM (destruição completa)
            modal.remove();
            

        } else {
            // 📋 ENCERRAMENTO DE FORMULÁRIOS COMUNS
            // Estes formulários por problemas de código não são de fato encerrados, são ocultados.
            // Posteriormente, em caso de abrir outros formulários, são substituídos.
            console.warn('⚠️ Modal não encontrado - processando formulário comum');
            
            // Fallback: usa método oficial de ocultar da instância
            if (instancia && typeof instancia.ocultar === 'function') {

                instancia.ocultar();

            } else {
                console.error('❌ Não foi possível encerrar o formulário - instância sem método ocultar');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao encerrar formulário:', error);
    }
}

/**
 * ✏️ Handler para ação EDITAR
 */
function processarEditar() {

    // TODO: Implementar lógica de edição
}

/**
 * ➕ Handler para ação INCLUIR
 * Limpa todos os campos do formulário para nova inclusão
 */
function processarIncluir() {
    const campos = document.querySelectorAll('input, textarea, select');
    
    campos.forEach(campo => {
        if (campo.type === 'checkbox') {
            campo.checked = false;
        } else {
            campo.value = '';
        }
    });
}

/**
 * 💾 Handler para ação SALVAR
 */
function processarSalvar() {

    // TODO: Implementar lógica de salvamento
}

/**
 * 🗑️ Handler para ação DELETAR
 */
function processarDeletar() {
    const confirmacao = confirm("Tem certeza que deseja deletar este registro?");
    
    if (!confirmacao) {
        return; // Usuário cancelou - aborta operação
    }
    
    // TODO: Implementar lógica de exclusão após confirmação
}

// ============= UTILITÁRIO ATIVO =============

/**
 * 🔄 Popula formulário automaticamente com dados fornecidos
 */
function _popularFormularioAutomatico(dados) {

    
    if (!dados) {
        console.warn('⚠️ Nenhum dado fornecido para popular formulário');
        return;
    }
    
    // Itera sobre as propriedades dos dados
    Object.keys(dados).forEach(campo => {
        const elemento = document.getElementById(campo);
        
        if (elemento) {
            // Define valor baseado no tipo do elemento
            if (elemento.type === 'checkbox') {
                elemento.checked = !!dados[campo];
            } else {
                elemento.value = dados[campo] || '';
            }

        } else {

        }
    });
    

    _setModoEditarNovo(false); // Proteger campos contra alteração involuntária
    
    // Atualiza backup dos dados originais para navegação
    dadosOriginaisRegistro = { ...dados };
}

// ============= POPULAÇÃO DE FORMULÁRIOS =============

/**
 * � Popula formulário com dados da API
 * @returns {Object} Resultado da operação
 */
async function popularFormulario() {
    try {

        
        if (!window.api_finctl) {
            throw new Error("API global não disponível (window.api_finctl)");
        }
        
        const resultadoAPI = await window.api_finctl.consulta_dados_form();
        
        if (resultadoAPI.mensagem === "sucesso") {
            const dadosRecebidos = resultadoAPI.dados;
            if (dadosRecebidos && dadosRecebidos.length > 0) {
                dadosDisponiveis = dadosRecebidos || [];
                reg_num = 0; 

                
                _popularFormularioAutomatico(dadosRecebidos[0]);
                
                // Popula select de navegação se existir função
                if (typeof _popularSelectNavegacao === 'function') {
                    _popularSelectNavegacao("grupos", dadosRecebidos);
                }
                
                return {
                    sucesso: true,
                    dados: dadosRecebidos,
                    mensagem: `Formulário populado com ${dadosRecebidos.length} registros`
                };
            } else {
                console.warn("⚠️ Nenhum dado retornado da API");
                return {
                    sucesso: false,
                    dados: [],
                    mensagem: "Nenhum registro encontrado"
                };
            }
        } else {
            throw new Error(`Erro na API: ${resultadoAPI.mensagem}`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao popular formulário:', error);
        return {
            sucesso: false,
            dados: [],
            mensagem: `Erro: ${error.message}`
        };
    }
}

//************************************************************
//                    INICIALIZAÇÃO
//************************************************************

// Configura listeners ao carregar o módulo
configurarListenersNavegacao();

// Log de inicialização

//************************************************************
//                      EXPORTS
//************************************************************

export { 
    popularFormulario  // Única função externa - para população inicial
};

