/*
************************************************************
        OPERAÇÕES CRUD - FRAMEWORK DSB
************************************************************

Este arquivo implementa as operações de CRUD, navegação e filtros
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

//************************************************************
//                    FUNÇÕES AUXILIARES
//************************************************************

/**
 * ⚠️ BEEP: Indica que chegou ao limite de navegação
 */
function emitirBeepLimite(limite) {
    console.log(`🔊 BEEP! Chegou ao ${limite} registro`);
    
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
        console.log('🔊 BEEP SIMULADO (áudio não disponível)');
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
    console.log('🔧 DEBUG OperacoesCRUD: Tentando configurar listeners...');
    
    // Aguarda o DOM estar pronto
    setTimeout(() => {
        const formFooter = document.querySelector('footer');
        
        if (formFooter && !listenerConfigurado) {
            console.log('🔧 DEBUG OperacoesCRUD: Configurando listeners de navegação genéricos');
            
            formFooter.addEventListener('formulario-acao', function(event) {
                // Validação defensiva: verifica se event.detail existe
                if (!event.detail) {
                    console.warn('⚠️ Evento sem detail - ignorando');
                    return;
                }
                
                const { acao, instancia, dados } = event.detail;
                
                console.log('🚨🚨🚨 TESTE BREAKPOINT: OperacoesCRUD RECEBEU EVENTO! 🚨🚨🚨');
                console.log('📍 Evento capturado no OperacoesCRUD.js:', acao);
                console.log('📊 Detalhes completos:', event.detail);
                
                // Processa TODAS as ações: navegação + CRUD
                if (['primeiro', 'anterior', 'proximo', 'ultimo', 'encerrar', 'editar', 'incluir', 'salvar', 'deletar'].includes(acao)) {
                    console.log(`🎯 DEBUG OperacoesCRUD: Processando ação: ${acao}`);
                    console.log('🔄 DIRECIONANDO PARA processarAcaoGenerica...');
                    processarAcaoGenerica(acao, instancia, dados);
                } else {
                    console.log(`⚠️ AÇÃO NÃO RECONHECIDA: ${acao} (ignorando)`);
                }
            });
            
            listenerConfigurado = true; // Marca como configurado
            console.log('✅ DEBUG OperacoesCRUD: Listeners de navegação configurados');
        } else {
            console.error('❌ DEBUG OperacoesCRUD: Footer não encontrado!');
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
    console.log('🚨🚨🚨 CHEGOU NO processarAcaoGenerica! 🚨🚨🚨');
    console.log(`🔄 Processando ação: ${acao}`);
    
    switch (acao) {
        // ======= AÇÕES DE NAVEGAÇÃO =======
        case 'primeiro':
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
            _setModoEditarNovo(true);
            processarEditar(instancia, dados);
            break;
            
        case 'incluir':
            botao_ativo = 'incluir';
            _setModoEditarNovo(true);
            processarIncluir(instancia, dados);
            break;
            
        case 'salvar':
            processarSalvar(instancia, dados);
            break;
            
        case 'deletar':
            processarDeletar(instancia, dados);
            break;
            
        default:
            console.error(`❌ Ação não implementada: ${acao}`);
    }
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
            console.warn(`⚠️ Ação de navegação desconhecida: ${acao}`);
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
    console.log('🚪 PROCESSANDO ENCERRAR (Sair)');
    console.log('📊 Instância recebida:', instancia);
    console.log('🎯 Estado do botão ativo:', botao_ativo);
    
    // COMPORTAMENTO 1: Se estiver em modo Editar ou Incluir = CANCELAR operação
    if (botao_ativo === 'editar' || botao_ativo === 'incluir') {
        console.log('🔄 CANCELANDO operação de ' + botao_ativo.toUpperCase());
        
        // Sair do modo edição/inclusão
        _setModoEditarNovo(false);
        
        // Resetar o estado do botão
        botao_ativo = '';
        
        console.log('✅ Operação cancelada, voltando ao modo de visualização');
        return; // Não fecha o formulário, apenas cancela a operação
    }
    
    // COMPORTAMENTO 2: Encerramento normal do formulário
    console.log('🚪 Encerrando formulário normalmente');
    
    try {
        // 🎭 ENCERRAMENTO DE FORMULÁRIOS TIPO MODAL
        // Formulários modais são destruídos completamente do DOM
        const modal = document.querySelector('.modal-formulario');
        
        if (modal) {
            console.log('🎯 Modal encontrado, fechando...');
            
            // Remove o modal do DOM (destruição completa)
            modal.remove();
            
            console.log('✅ Formulário modal encerrado com sucesso');
        } else {
            // 📋 ENCERRAMENTO DE FORMULÁRIOS COMUNS
            // Estes formulários por problemas de código não são de fato encerrados, são ocultados.
            // Posteriormente, em caso de abrir outros formulários, são substituídos.
            console.warn('⚠️ Modal não encontrado - processando formulário comum');
            
            // Fallback: usa método oficial de ocultar da instância
            if (instancia && typeof instancia.ocultar === 'function') {
                console.log('🔄 Ocultando formulário comum via instância...');
                instancia.ocultar();
                console.log('✅ Formulário comum ocultado (preservado para reutilização)');
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
 * @param {Object} instancia - Instância do formulário  
 * @param {Object} dados - Dados do formulário
 */
function processarEditar(instancia, dados) {
    console.log('✏️ HANDLER EDITAR - SERÁ IMPLEMENTADO');
    // TODO: Implementar lógica de edição
}

/**
 * ➕ Handler para ação INCLUIR
 * @param {Object} instancia - Instância do formulário
 * @param {Object} dados - Dados do formulário
 */
function processarIncluir(instancia, dados) {
    console.log('➕ HANDLER INCLUIR - SERÁ IMPLEMENTADO');
    // TODO: Implementar lógica de inclusão
}

/**
 * 💾 Handler para ação SALVAR
 * @param {Object} instancia - Instância do formulário
 * @param {Object} dados - Dados do formulário
 */
function processarSalvar(instancia, dados) {
    console.log('💾 HANDLER SALVAR - SERÁ IMPLEMENTADO');
    // TODO: Implementar lógica de salvamento
}

/**
 * 🗑️ Handler para ação DELETAR
 * @param {Object} instancia - Instância do formulário
 * @param {Object} dados - Dados do formulário
 */
function processarDeletar(instancia, dados) {
    console.log('🗑️ HANDLER DELETAR - SERÁ IMPLEMENTADO');
    // TODO: Implementar lógica de exclusão
}

// ============= UTILITÁRIO ATIVO =============

/**
 * 🔄 Popula formulário automaticamente com dados fornecidos
 */
function _popularFormularioAutomatico(dados) {
    console.log('🔄 Populando formulário automaticamente...');
    console.log('📊 Dados recebidos:', dados);
    
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
            console.log(`📝 Campo '${campo}' populado: '${dados[campo]}'`);
        } else {
            console.log(`⚠️ Campo '${campo}' não encontrado no DOM`);
        }
    });
    
    console.log('✅ População automática concluída');
    _setModoEditarNovo(false); // Proteger campos contra alteração involuntária
}

// ============= POPULAÇÃO DE FORMULÁRIOS =============

/**
 * � Popula formulário com dados da API
 * @returns {Object} Resultado da operação
 */
async function popularFormulario() {
    try {
        console.log(`📋 Populando formulário`);
        
        if (!window.api_finctl) {
            throw new Error("API global não disponível (window.api_finctl)");
        }
        
        const resultadoAPI = await window.api_finctl.consulta_dados_form();
        
        if (resultadoAPI.mensagem === "sucesso") {
            const dadosRecebidos = resultadoAPI.dados;
            if (dadosRecebidos && dadosRecebidos.length > 0) {
                dadosDisponiveis = dadosRecebidos || [];
                reg_num = 0; 
                console.log(`📊 Navegação inicializada: ${dadosDisponiveis.length} registros disponíveis`);
                
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
console.log('📋 Módulo OperacoesCRUD.js (Framework DSB) carregado - Sistema de botões ativo');

//************************************************************
//                      EXPORTS
//************************************************************

export { 
    popularFormulario  // Única função externa - para população inicial
};

