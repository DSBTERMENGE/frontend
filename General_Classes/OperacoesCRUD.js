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
//                      LISTENERS
//************************************************************

 // 🎧 CONFIGURA LISTENERS PARA EVENTOS DE BOTÕES DO FORMULÁRIO
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

                    btnRodapeForm_Click(acao, instancia, dados);
                } else {

                }
            });
            
            listenerConfigurado = true; // Marca como configurado

        } else {

        }
    }, 1500);
}

//************************************************************
//            RESPOSTAS AS CLICKS DOS BOTÕES
//************************************************************

/**
 * 🔄 RESPOSTA AOS CLICKS DOS BOTÕES DA BARRA DE FERRAMENTAS NO RODAPÉ DOS FORMULARIOS
 * @param {string} acao - Ação (primeiro, anterior, proximo, ultimo, encerrar, editar, incluir, salvar, deletar)
 * @param {Object} instancia - Instância do formulário
 * @param {Object} dados - Dados do formulário
 */

function btnRodapeForm_Click(acao, instancia, dados) {
    
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
            // dadosOriginaisRegistro já foi populado na função _popularFormularioAutomatico (linha 842)
            // Não sobrescrever aqui pois perderia o idgrupo!
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
            processarDeletar();
            break;
            
        default:
            console.error(`❌ Ação não implementada: ${acao}`);
    }
}

//************************************************************
//            HANDLERS PARA OPERAÇÕES CRUD
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
 // Sem necessidade de código, As manipulações ja foram feitas no switch case
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
   /*const confirmacao = confirm("Deseja salvar este registro?");
    
    if (!confirmacao) {
        return; // Usuário cancelou - aborta operação
    }
    */
   flow_marker('Iniciando processo de salvar');

   // Chama a função de validação
    if (!valida_salvar()) {
        return; // Aborta operação se validação falher
    }
    
    // DECISÃO: Edição ou Inclusão baseada no botão ativo
    if (botao_ativo === 'editar') {
        flow_marker('📝 Modo EDITAR detectado - chamando atualizar_registro()');
        atualizar_registro();
        
    } else if (botao_ativo === 'incluir') {
        flow_marker('➕ Modo INCLUIR detectado - chamando incluir_registro_novo()');
        incluir_registro_novo();
        
    } else {
        error_catcher('Estado inválido para salvar', `botao_ativo: ${botao_ativo}`);
        alert('Estado inválido para operação de salvamento.');
    } 
    
}

/**
 * 🗑️ Handler para ação DELETAR
 */
async function processarDeletar() {
    try {
        const confirmacao = confirm("Tem certeza que deseja deletar este registro?");
        
        if (!confirmacao) {
            return; // Usuário cancelou - aborta operação
        }

        flow_marker('🗑️ processarDeletar() iniciado');

        if (!window.api_info) {
            throw new Error("API global não disponível (window.api_info)");
        }

        // Captura dados do registro atual para enviar como identificação
        const registroParaDeletar = dadosDisponiveis[reg_num];
        
        if (!registroParaDeletar) {
            throw new Error("Registro atual não encontrado para exclusão");
        }

        flow_marker('🗑️ Dados do registro para exclusão', registroParaDeletar);

        // Chama API para deletar no backend (quando implementada)
        // const resultadoAPI = await window.api_info.deletar_registro(registroParaDeletar);
        
        // SIMULAÇÃO: Por enquanto simula sucesso até implementar endpoint DELETE
        const resultadoAPI = { sucesso: true, mensagem: "Registro deletado com sucesso" };

        if (resultadoAPI.sucesso) {
            flow_marker('✅ Registro deletado com sucesso');

            // 🔄 SINCRONIZAÇÃO DELETE: Remove registro do array local
            dadosDisponiveis.splice(reg_num, 1);

            // 📍 AJUSTE DE POSIÇÃO: Move reg_num uma unidade para trás
            reg_num = reg_num - 1;

            if (reg_num < 0 || dadosDisponiveis.length === 0) {
                // 🎯 CENÁRIO 2: DELETE último registro → Auto modo inclusão
                reg_num = -1;
                
                // Ativa modo inclusão automático
                botao_ativo = 'incluir';
                _setModoEditarNovo(true);
                _limparFormulario();
                
                flow_marker('🎯 Modo inclusão automático ativado - último registro deletado', {
                    total_registros: dadosDisponiveis.length
                });
            } else {
                // Popula com registro anterior
                _popularFormularioAutomatico(dadosDisponiveis[reg_num]);
                flow_marker('🔄 DELETE - navegou para registro anterior', {
                    reg_num: reg_num,
                    total_registros: dadosDisponiveis.length
                });
            }

            return {
                sucesso: true,
                mensagem: resultadoAPI.mensagem || "Registro deletado com sucesso"
            };
        } else {
            throw new Error(resultadoAPI.mensagem || "Erro na exclusão");
        }

    } catch (error) {
        error_catcher('Erro no processarDeletar', error);
        alert(`Erro ao deletar registro: ${error.message}`);
        return {
            sucesso: false,
            mensagem: `Erro: ${error.message}`
        };
    }
}

//*************************************************************
//              POPULAÇÃO DE FORMULÁRIOS E CRUD
// ************************************************************

/**
 * 📝 Popula formulário com dados da API
 * @returns {Object} Resultado da operação
 */
async function popularFormulario() {
    console.log('🔄 Iniciando população do formulário...');
    
    try {
        
        if (!window.api_info) {
            throw new Error("API global não disponível (window.api_info)");
        }
        
        const resultadoAPI = await window.api_info.consulta_dados_form();
        
        if (resultadoAPI.mensagem === "sucesso") {
            const dadosRecebidos = resultadoAPI.dados.dados;
            if (dadosRecebidos && dadosRecebidos.length > 0) {
                
                // Verifica se é registro vazio (backend normalizado)
                const primeiroRegistro = dadosRecebidos[0];
                const isRegistroVazio = Object.values(primeiroRegistro).every(valor => valor === "");
                
                if (isRegistroVazio) {
                    // 🎯 CENÁRIO: Backend retornou registro vazio normalizado
                    console.warn("⚠️ Backend retornou registro vazio - ativando modo inclusão automático");
                    
                    dadosDisponiveis = dadosRecebidos; // Mantém o registro vazio para consistência
                    reg_num = 0;
                    
                    // Popula formulário com campos vazios
                    _popularFormularioAutomatico(primeiroRegistro);
                    
                    // Ativa modo inclusão automático
                    botao_ativo = 'incluir';
                    _setModoEditarNovo(true);
                    
                    flow_marker('🎯 Modo inclusão automático ativado - registro vazio do backend');
                    
                    return {
                        sucesso: true,
                        dados: dadosRecebidos,
                        mensagem: "Registro vazio - modo inclusão ativado automaticamente"
                    };
                } else {
                    // 🎯 CENÁRIO: Dados reais do backend
                    dadosDisponiveis = dadosRecebidos || [];
                    reg_num = 0;

                    _popularFormularioAutomatico(dadosRecebidos[0]);
                    
                    // Popula select de navegação se existir função
                    if (typeof _popularSelectNavegacao === 'function') {
                        _popularSelectNavegacao("grupos", dadosRecebidos);
                    }
                    
                    console.log('✅ População concluída com sucesso - Formulário populado com dados');
                    
                    return {
                        sucesso: true,
                        dados: dadosRecebidos,
                        mensagem: `Formulário populado com ${dadosRecebidos.length} registros`
                    };
                }
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

/**
 * 📝 Atualiza registro existente no banco de dados
 * Captura dados atuais do formulário e envia para API
 * @returns {Object} Resultado da operação de update
 */
async function atualizar_registro() {
  try {
        flow_marker('🔄 atualizar_registro() iniciado');
        
        if (!window.api_info) {
            throw new Error("API global não disponível (window.api_info)");
        }
        
        // Captura alterações do formulário (mantém semântica da função)
        const alteracoesDom = _capturarDadosAtuaisFormulario();
        
        // DEBUG: Verificar dados antes da mesclagem
        flow_marker('🔍 ANTES MESCLAGEM - dadosOriginaisRegistro', dadosOriginaisRegistro);
        flow_marker('🔍 ANTES MESCLAGEM - alteracoesDom', alteracoesDom);
        
        // Mescla com dados persistentes para preservar chave primária
        const dados_para_update = { ...dadosOriginaisRegistro, ...alteracoesDom };
        
        // DEBUG: Verificar resultado da mesclagem
        flow_marker('🔍 APÓS MESCLAGEM - dados_para_update', dados_para_update);
        
        if (!dados_para_update || Object.keys(dados_para_update).length === 0) {
            throw new Error("Nenhum dado capturado do formulário");
        }
        
        flow_marker('📋 Dados capturados do formulário', dados_para_update);
        
        // Chama API para atualizar no backend
        const resultadoAPI = await window.api_info.update_data(dados_para_update);
        
        if (resultadoAPI.sucesso) {
            flow_marker('✅ Registro atualizado com sucesso');
            
            // 🔄 SINCRONIZAÇÃO SILENCIOSA: Atualiza dadosDisponiveis e recalcula reg_num
            if (resultadoAPI.dados_atualizados && dadosDisponiveis[reg_num]) {
                // 1. Captura PK do registro atual (antes de substituir array)
                const pkAtual = dadosDisponiveis[reg_num].idgrupo;
                
                // 2. Substitui array completo com dados atualizados do backend
                dadosDisponiveis = resultadoAPI.dados_atualizados;
                
                // 3. Localiza nova posição da PK no array atualizado
                const novaPosicao = dadosDisponiveis.findIndex(item => item.idgrupo === pkAtual);
                
                // 4. Atualiza reg_num para nova posição (se encontrada)
                if (novaPosicao !== -1) {
                    reg_num = novaPosicao;
                    flow_marker('🔄 Sincronização UPDATE completa', { 
                        pk_registro: pkAtual,
                        nova_posicao: reg_num,
                        total_registros: dadosDisponiveis.length
                    });
                }
            }
            
            // Sair do modo edição
            _setModoEditarNovo(false);
            botao_ativo = '';
            
            // Atualiza backup dos dados originais com dados do array atualizado
            if (dadosDisponiveis[reg_num]) {
                dadosOriginaisRegistro = { ...dadosDisponiveis[reg_num] };
            }
            
            return {
                sucesso: true,
                mensagem: resultadoAPI.mensagem || "Registro atualizado com sucesso"
            };
        } else {
            throw new Error(resultadoAPI.mensagem || "Erro na atualização");
        }
        
    } catch (error) {
        error_catcher('Erro no atualizar_registro', error);
        return {
            sucesso: false,
            mensagem: `Erro: ${error.message}`
        };
    } 
}

/**
 * ➕ Inclui novo registro no banco de dados
 * Captura dados atuais do formulário e envia para API
 * @returns {Object} Resultado da operação de inserção
 */
async function incluir_registro_novo() {
    try {
        flow_marker('➕ incluir_registro_novo() iniciado');
        
        if (!window.api_info) {
            throw new Error("API global não disponível (window.api_info)");
        }
        
        // Captura dados atuais do formulário
        const dados_novo_registro = _capturarDadosAtuaisFormulario();
        
        if (!dados_novo_registro || Object.keys(dados_novo_registro).length === 0) {
            throw new Error("Nenhum dado capturado do formulário");
        }
        
        flow_marker('📋 Dados capturados do formulário para inserção', dados_novo_registro);
        
        // Chama API para inserir no backend
        const resultadoAPI = await window.api_info.incluir_reg_novo(dados_novo_registro);
        
        if (resultadoAPI.sucesso) {
            flow_marker('✅ Novo registro inserido com sucesso');
            
            // 🔄 SINCRONIZAÇÃO SILENCIOSA: Atualiza dadosDisponiveis e localiza novo registro
            if (resultadoAPI.dados_atualizados) {
                // 1. Guarda array antigo para comparação
                const arrayAntigo = [...dadosDisponiveis];
                
                // 2. Substitui array completo com dados atualizados do backend
                dadosDisponiveis = resultadoAPI.dados_atualizados;
                
                // 3. Varre array novo procurando PK que não existe no antigo
                let pkNovoRegistro = null;
                for (let i = 0; i < dadosDisponiveis.length; i++) {
                    const pkAtual = dadosDisponiveis[i].idgrupo;
                    const existeNoArrayAntigo = arrayAntigo.some(item => item.idgrupo === pkAtual);
                    
                    if (!existeNoArrayAntigo) {
                        // Encontrou! Esta é a PK do novo registro
                        reg_num = i; // Posição já é base 0
                        pkNovoRegistro = pkAtual;
                        break; // Interrompe o laço
                    }
                }
                
                // 4. Log da sincronização (se encontrou)
                if (pkNovoRegistro !== null) {
                    flow_marker('🔄 Sincronização INSERT completa', { 
                        pk_novo_registro: pkNovoRegistro,
                        posicao_no_array: reg_num,
                        total_registros: dadosDisponiveis.length
                    });
                }
            }
            
            // Sair do modo inclusão
            _setModoEditarNovo(false);
            botao_ativo = '';
            
            return {
                sucesso: true,
                mensagem: resultadoAPI.mensagem || "Registro inserido com sucesso"
            };
        } else {
            throw new Error(resultadoAPI.mensagem || "Erro na inserção");
        }
        
    } catch (error) {
        error_catcher('Erro no incluir_registro_novo', error);
        return {
            sucesso: false,
            mensagem: `Erro: ${error.message}`
        };
    }
}


//************************************************************
//                    INICIALIZAÇÃO
//************************************************************

// Configura listeners ao carregar o módulo
configurarListenersNavegacao();


//*************************************************************
//                      FUNÇÕES PARA VALIDAÇÃO
// ************************************************************

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

/*
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

function valida_salvar() {
    // Verifica se está em modo de edição ou inclusão válido
    if (botao_ativo !== 'editar' && botao_ativo !== 'incluir') {
        alert('Para salvar é necessário estar em modo de edição ou inclusão.');
        return false;
    } else {
        // Confirma a intenção de salvar
        const confirmarSalvar = confirm('Deseja realmente salvar as alterações?');
        if (!confirmarSalvar) {
            return false;
        }
        // Se confirmou, o fluxo continua...
    }
    
    // Para modo editar: verifica se houve alterações nos dados
    if (botao_ativo === 'editar') {
        const dadosAtuais = _capturarDadosAtuaisFormulario();
        const camposAlterados = [];
        
        // Compara cada campo com os dados originais
        Object.keys(dadosOriginaisRegistro).forEach(campo => {
            const valorOriginal = dadosOriginaisRegistro[campo] || '';
            const valorAtual = dadosAtuais[campo] || '';
            
            if (valorOriginal.toString() !== valorAtual.toString()) {
                camposAlterados.push(campo);
            }
        });
        
        // Se não houve alterações, não permite salvar
        if (camposAlterados.length === 0) {
            alert('Nenhuma alteração foi detectada no registro.');
            return false;
        }
    }
    // Para modo incluir: verifica se há dados inseridos nos campos
    if (botao_ativo === 'incluir') {
        const dadosAtuais = _capturarDadosAtuaisFormulario();
        const temDadosInseridos = Object.values(dadosAtuais).some(valor => 
            valor && valor.toString().trim() !== ''
        );
        
        // Se não há dados inseridos, não permite salvar
        if (!temDadosInseridos) {
            alert('Nenhum dado foi inserido nos campos para inclusão.');
            return false;
        }
    }

    // Verifica campos obrigatórios
    const camposObrigatorios = window.api_info.campos_obrigatorios || [];
    const dadosAtuais = _capturarDadosAtuaisFormulario();
    const camposFaltando = [];
    
    camposObrigatorios.forEach(campo => {
        if (!dadosAtuais[campo]) {
            camposFaltando.push(campo);
        }
    });
    
    if (camposFaltando.length > 0) {
        alert(`Os seguintes campos obrigatórios ainda estão vazios: ${camposFaltando.join(', ')}`);
        return false;
    }
    
    return true;
}


/* ============================================================
                   FUNÇÕES AUXILIARES
=============================================================
*/
 /* 📥 CAPTURA DADOS ATUAIS DO FORMULÁRIO
 * Coleta todos os valores atuais dos campos do formulário
 * @returns {Object} Objeto com valores atuais dos campos
 */
function _capturarDadosAtuaisFormulario() {
    const dados = {};
    
    // 🎯 CORREÇÃO: Captura apenas campos do formCrud específico
    const formCrud = document.getElementById('formCrud');
    if (!formCrud) {
        console.warn('⚠️ formCrud não encontrado');
        return {};
    }
    
    const campos = formCrud.querySelectorAll('input, textarea, select');
    
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
 * 🧹 LIMPA TODOS OS CAMPOS DO FORMULÁRIO
 * Usado quando array fica vazio após DELETE
 */
function _limparFormulario() {
    const formCrud = document.getElementById('formCrud');
    if (!formCrud) {
        console.warn('⚠️ formCrud não encontrado para limpeza');
        return;
    }
    
    const campos = formCrud.querySelectorAll('input, textarea, select');
    
    campos.forEach(campo => {
        if (campo.type === 'checkbox') {
            campo.checked = false;
        } else {
            campo.value = '';
        }
    });
    
    // Garante que campos ficam readonly (modo visualização)
    _setModoEditarNovo(false);
}

 //* ⚠️ BEEP: Indica que chegou ao limite de navegação
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

 /* 🔧 ALTERA FUNDO DOS FORMULÁRIOS NO MODO EDITAR/INCLUIR
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

 // 🔄 POPULA FORM. AUTOMATICAMENTE COM DADOS FORNECIDOS
function _popularFormularioAutomatico(dados) {
    // DEBUG: Verificar dados recebidos para população
    flow_marker('🔍 DEBUG POPULAÇÃO - dados recebidos', dados);
    
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


 // 🚨 ALERTA QUE O FORMULÁRIO ESTÁ EM EDIÇÃO OU INCLUSÃO
function AlertaEstadoDeEdicao_Inclusao() {
    const operacao = botao_ativo === 'editar' ? 'edição' : 'inclusão';
    alert(`Um processo de ${operacao} está em andamento. Para sair do processo clique em "Encerrar" ou "Salvar".`);
}

/* ============================================================
                   SISTEMA DE POPULAÇÃO DE SELECTS
===============================================================

RESPONSABILIDADES TRANSFERIDAS DO ConstrutorDeForms.js:
- Population de selects individuais e em grupo
- Sistema de selects em cascata (Estado → Cidade → Bairro) 
- Gestão de eventos entre selects interligadas
- Limpeza e manutenção de selects

ARQUITETURA:
- Funciona com instâncias FormComum (this.objSelect)
- Suporte a selects simples e em cascata
- Eventos customizados para comunicação entre selects
- Integração com backend para dados dinâmicos

ÚLTIMA ATUALIZAÇÃO: Transferência completa do ConstrutorDeForms.js
*/

// ============= MÉTODOS DE POPULATION INDIVIDUAL =============

/**
 * 🔄 POPULAR SELECT ESPECÍFICA: Preenche uma select individual usando configuração
 * 
 * @param {FormComum} instanciaForm - Instância do formulário com objSelect
 * @param {string} campo - Nome do campo da select
 * @param {Object} configPopularSelects - Configuração com dados da select
 * @param {boolean} manterPrimeiro - Se deve manter "Selecione..."
 * @returns {boolean} Sucesso da operação
 */
async function popularSelectIndividual(instanciaForm, campo, configPopularSelects, manterPrimeiro = true) {
    if (!instanciaForm || !instanciaForm.objSelect) {
        console.warn('❌ Instância do formulário ou objSelect não disponível');
        return false;
    }
    
    try {
        // Busca dados usando a configuração
        const dados = await buscarDadosParaSelect(configPopularSelects);
        
        if (dados && dados.length > 0) {
            return instanciaForm.objSelect.popularSelect(campo, dados, manterPrimeiro);
        } else {
            console.warn(`⚠️ Nenhum dado retornado para select '${campo}'`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erro ao popular select '${campo}':`, error);
        return false;
    }
}

/**
 * 🔄 POPULAR TODAS AS SELECTS: Preenche múltiplas selects usando pool de configurações
 * 
 * @param {FormComum} instanciaForm - Instância do formulário
 * @param {Object} poolConfigPopularSelects - Pool de configurações {campo: config}
 * @param {boolean} manterPrimeiro - Se deve manter "Selecione..."
 * @returns {Object} Relatório {sucesso: [], falha: []}
 */
async function popularTodasSelects(instanciaForm, poolConfigPopularSelects, manterPrimeiro = true) {
    if (!instanciaForm || !instanciaForm.objSelect) {
        console.warn('❌ Instância do formulário ou objSelect não disponível');
        return { sucesso: [], falha: [] };
    }
    
    const relatorio = { sucesso: [], falha: [] };
    
    // Itera sobre cada configuração do pool
    for (const [campo, config] of Object.entries(poolConfigPopularSelects)) {
        try {
            const sucesso = await popularSelectIndividual(instanciaForm, campo, config, manterPrimeiro);
            if (sucesso) {
                relatorio.sucesso.push(campo);
            } else {
                relatorio.falha.push(campo);
            }
        } catch (error) {
            console.error(`❌ Erro ao popular select '${campo}':`, error);
            relatorio.falha.push(campo);
        }
    }
    
    return relatorio;
}

/**
 * 🧹 LIMPAR SELECT: Remove todas as opções exceto "Selecione..."
 * 
 * @param {FormComum} instanciaForm - Instância do formulário
 * @param {string} campo - Nome do campo da select
 * @returns {boolean} Sucesso da operação
 */
function limparSelectIndividual(instanciaForm, campo) {
    if (!instanciaForm || !instanciaForm.objSelect) {
        console.warn('❌ Instância do formulário ou objSelect não disponível');
        return false;
    }
    
    return instanciaForm.objSelect.limparSelect(campo);
}

// ============= SISTEMA DE SELECTS EM CASCATA =============

/**
 * 🔗 CONFIGURAR CASCATA: Configura selects interligadas (Estado → Cidade → Bairro)
 * 
 * @param {FormComum} instanciaForm - Instância do formulário
 * @param {Object} configCascata - Configuração das dependências
 * @example
 * configurarSelectsCascata(formEndereco, {
 *   estado: { dependente: 'cidade', endpoint: '/api/cidades' },
 *   cidade: { dependente: 'bairro', endpoint: '/api/bairros' }
 * });
 */
function configurarSelectsCascata(instanciaForm, configCascata) {
    if (!instanciaForm || !instanciaForm.objSelect) {
        console.warn('❌ Instância do formulário não disponível para cascata');
        return;
    }
    
    // Registra listener para eventos de mudança
    const container = instanciaForm.form.querySelector('.controles-container');
    if (container) {
        container.addEventListener('select-alterada', (event) => {
            handlerSelectsCascata(event, configCascata, instanciaForm);
        });
        
        console.log('✅ Sistema de cascata configurado para:', Object.keys(configCascata));
    }
}

/**
 * 🎯 HANDLER DE CASCATA: Processa mudanças em selects interligadas
 * 
 * @param {CustomEvent} event - Evento de alteração da select
 * @param {Object} configCascata - Configuração das dependências
 * @param {FormComum} instanciaForm - Instância do formulário
 */
async function handlerSelectsCascata(event, configCascata, instanciaForm) {
    const { campo, valor, selecionados } = event.detail;
    
    console.log(`🔄 Processando cascata para: ${campo} = ${valor}`);
    
    // Verifica se este campo tem dependentes
    if (configCascata[campo] && configCascata[campo].dependente) {
        const campoDependente = configCascata[campo].dependente;
        const endpoint = configCascata[campo].endpoint;
        
        try {
            // Limpa select dependente
            limparSelectIndividual(instanciaForm, campoDependente);
            
            if (valor) {
                // Busca dados para o dependente
                const dadosDependente = await buscarDadosSelect(endpoint, { [campo]: valor });
                
                if (dadosDependente && dadosDependente.length > 0) {
                    popularSelectIndividual(instanciaForm, campoDependente, dadosDependente);
                    console.log(`✅ Select '${campoDependente}' populada com ${dadosDependente.length} itens`);
                }
            }
            
            // Limpa selects dependentes do dependente (cascata completa)
            limparDependentesRecursivo(campoDependente, configCascata, instanciaForm);
            
        } catch (error) {
            console.error(`❌ Erro na cascata ${campo} → ${campoDependente}:`, error);
        }
    }
}

/**
 * 🧹 LIMPAR DEPENDENTES RECURSIVO: Limpa toda a cadeia de dependências
 */
function limparDependentesRecursivo(campo, configCascata, instanciaForm) {
    if (configCascata[campo] && configCascata[campo].dependente) {
        const proximoDependente = configCascata[campo].dependente;
        limparSelectIndividual(instanciaForm, proximoDependente);
        
        // Continua recursivamente
        limparDependentesRecursivo(proximoDependente, configCascata, instanciaForm);
    }
}

// ============= INTEGRAÇÃO COM BACKEND =============

/**
 * 📊 BUSCAR DADOS PARA SELECT: Faz requisição ao backend usando configuração
 * 
 * @param {Object} configPopularSelects - Configuração da select
 * @param {string} configPopularSelects.view_name - Nome da view no backend
 * @param {Array} configPopularSelects.colunasDeDados - Colunas a buscar
 * @param {string} configPopularSelects.campo_exibir - Campo para texto da option
 * @param {string} configPopularSelects.campo_value - Campo para value da option
 * @returns {Promise<Array>} Array de {value, text}
 */
async function buscarDadosParaSelect(configPopularSelects) {
    try {
        const { view_name, colunasDeDados, campo_exibir, campo_value } = configPopularSelects;
        
        console.log(`📤 Buscando dados para select da view: ${view_name}`);
        
        if (!window.api_info) {
            throw new Error("API global não disponível (window.api_info)");
        }
        
        // Configura API para buscar dados específicos da select
        const configOriginal = {
            view: window.api_info.view,
            campos: window.api_info.campos
        };
        
        // Aplica configuração da select
        window.api_info.view = view_name;
        window.api_info.campos = colunasDeDados;
        
        const resultadoAPI = await window.api_info.consulta_dados_form();
        
        // Restaura configuração original
        window.api_info.view = configOriginal.view;
        window.api_info.campos = configOriginal.campos;
        
        if (resultadoAPI.mensagem === "sucesso") {
            // Converte para formato {value, text}
            const dadosFormatados = resultadoAPI.dados.dados.map(item => ({
                value: item[campo_value],
                text: item[campo_exibir]
            }));
            
            console.log(`📥 Dados formatados para select:`, dadosFormatados);
            return dadosFormatados;
        } else {
            throw new Error(resultadoAPI.mensagem || "Erro na consulta da view");
        }
        
    } catch (error) {
        console.error(`❌ Erro ao buscar dados para select:`, error);
        return [];
    }
}

// ============= MÉTODOS DE CONVENIÊNCIA =============

/**
 * 📋 OBTER VALORES DAS SELECTS: Extrai valores selecionados
 * 
 * @param {FormComum} instanciaForm - Instância do formulário
 * @returns {Object} Mapeamento {campo: valor}
 */
function obterValoresSelects(instanciaForm) {
    if (!instanciaForm || !instanciaForm.objSelect) {
        console.warn('❌ Instância do formulário não disponível');
        return {};
    }
    
    return instanciaForm.objSelect.obterValores();
}

/**
 * 🎯 OBTER ELEMENTO SELECT: Retorna elemento DOM da select
 * 
 * @param {FormComum} instanciaForm - Instância do formulário
 * @param {string} campo - Nome do campo
 * @returns {HTMLSelectElement|null} Elemento select
 */
function obterElementoSelect(instanciaForm, campo) {
    if (!instanciaForm || !instanciaForm.objSelect) {
        console.warn('❌ Instância do formulário não disponível');
        return null;
    }
    
    return instanciaForm.objSelect.obterElementoSelect(campo);
}

// ============= SISTEMA DE FILTROS COM SELECTS =============

/**
 * 🎯 PROCESSAR FILTRO SELECT: Função genérica para filtros baseados em selects
 * 
 * Esta função implementa o padrão de filtros do framework onde mudanças em selects
 * de filtro (ex: grupo) disparam consultas filtradas para popular outras selects
 * (ex: subgrupos) e automaticamente atualizam o formulário.
 * 
 * @param {Object} config - Configuração do filtro
 * @param {string} config.selectOrigem - Nome da select que disparou o evento (ex: 'grupo')
 * @param {string} config.selectDestino - Nome da select a ser populada (ex: 'subgrupo')
 * @param {string} config.nomeFiltro - Nome do filtro para a API (ex: 'idgrupo')
 * @param {string} config.valor - Valor selecionado na select origem
 * @param {Object} config.instanciaForm - Instância do formulário (opcional)
 * @returns {Promise<boolean>} Sucesso da operação
 * 
 * @example
 * // Uso no event listener 'select-alterada'
 * document.addEventListener('select-alterada', async (event) => {
 *   const { campo, valor } = event.detail;
 *   
 *   if (campo === 'grupo') {
 *     await processarFiltroSelect({
 *       selectOrigem: 'grupo',
 *       selectDestino: 'subgrupo', 
 *       nomeFiltro: 'idgrupo',
 *       valor: valor
 *     });
 *   }
 * });
 */
async function processarFiltroSelect(config) {
    try {
        console.log(`🎯 Iniciando processamento de filtro select:`, config);
        
        const { selectOrigem, selectDestino, nomeFiltro, valor, instanciaForm } = config;
        
        if (!selectOrigem || !selectDestino || !nomeFiltro) {
            throw new Error('Configuração inválida: selectOrigem, selectDestino e nomeFiltro são obrigatórios');
        }
        
        // 1. LIMPEZA: Limpa select de destino
        const selectDestinoElement = document.querySelector(`select[name="${selectDestino}"]`);
        if (selectDestinoElement) {
            selectDestinoElement.innerHTML = '<option value="">Selecione...</option>';
            console.log(`🧹 Select '${selectDestino}' limpa`);
        }
        
        // 2. FILTRO: Se há valor, busca dados filtrados
        if (valor && valor !== '') {
            // Verifica se API está disponível
            if (!window.api_info) {
                throw new Error("API global não disponível (window.api_info)");
            }
            
            // Monta objeto de filtros para a API
            const filtros = { [nomeFiltro]: valor };
            console.log(`📤 Consultando dados com filtros:`, filtros);
            
            // Faz consulta filtrada à API
            const resultadoAPI = await window.api_info.consulta_dados_form(filtros);
            
            if (resultadoAPI.mensagem === "sucesso" && resultadoAPI.dados.dados.length > 0) {
                const dados = resultadoAPI.dados.dados;
                
                // Verifica se são dados reais ou registro vazio
                const primeiroRegistro = dados[0];
                const isRegistroVazio = Object.values(primeiroRegistro).every(valor => valor === "");
                
                if (!isRegistroVazio) {
                    // 3. POPULAÇÃO: Popula select de destino
                    await popularSelectComDados(selectDestino, dados);
                    
                    // 4. SELEÇÃO AUTOMÁTICA: Seleciona primeiro item automaticamente
                    if (selectDestinoElement && selectDestinoElement.children.length > 1) {
                        const primeiraOpcao = selectDestinoElement.children[1]; // Pula "Selecione..."
                        selectDestinoElement.value = primeiraOpcao.value;
                        
                        console.log(`✅ Primeira opção selecionada automaticamente: ${primeiraOpcao.value}`);
                        
                        // 5. EVENTO: Dispara evento para atualizar formulário
                        const eventoAlteracao = new CustomEvent('select-alterada', {
                            detail: {
                                campo: selectDestino,
                                valor: primeiraOpcao.value,
                                elemento: selectDestinoElement
                            }
                        });
                        selectDestinoElement.dispatchEvent(eventoAlteracao);
                        
                        // 6. POPULAÇÃO DO FORMULÁRIO: Atualiza formulário com primeiro registro
                        _popularFormularioAutomatico(dados[0]);
                    }
                    
                    console.log(`✅ Filtro processado com sucesso - ${dados.length} registros encontrados`);
                    return true;
                } else {
                    console.log(`⚠️ Nenhum registro encontrado para o filtro ${nomeFiltro} = ${valor}`);
                }
            } else {
                console.log(`⚠️ Nenhum dado retornado da API para filtro ${nomeFiltro} = ${valor}`);
            }
        } else {
            console.log(`⚠️ Valor vazio para filtro - select '${selectDestino}' mantida limpa`);
        }
        
        return true;
        
    } catch (error) {
        console.error(`❌ Erro ao processar filtro select:`, error);
        return false;
    }
}

/**
 * 📋 POPULAR SELECT COM DADOS: Popula select com array de dados
 * 
 * @param {string} nomeSelect - Nome da select a popular
 * @param {Array} dados - Array de dados do backend
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function popularSelectComDados(nomeSelect, dados) {
    try {
        const selectElement = document.querySelector(`select[name="${nomeSelect}"]`);
        if (!selectElement) {
            console.warn(`⚠️ Select não encontrada: ${nomeSelect}`);
            return false;
        }
        
        // Mantém opção "Selecione..."
        selectElement.innerHTML = '<option value="">Selecione...</option>';
        
        // Determina automaticamente as colunas para value e text
        const primeiroRegistro = dados[0];
        const colunas = Object.keys(primeiroRegistro);
        
        // Convenção: primeira coluna = value (geralmente ID), segunda = text (nome/descrição)
        const colunaValue = colunas[0];
        const colunaText = colunas.length > 1 ? colunas[1] : colunas[0];
        
        // Adiciona opções
        dados.forEach(item => {
            const option = document.createElement('option');
            option.value = item[colunaValue];
            option.textContent = item[colunaText];
            selectElement.appendChild(option);
        });
        
        console.log(`✅ Select '${nomeSelect}' populada com ${dados.length} opções`);
        return true;
        
    } catch (error) {
        console.error(`❌ Erro ao popular select '${nomeSelect}':`, error);
        return false;
    }
}

// ============= FUNÇÃO SIMPLES PARA RETROCOMPATIBILIDADE =============

/**
 * 🔄 POPULAR SELECT SIMPLES: Versão simplificada para casos básicos
 * 
 * @param {string} tipo - Tipo/ID da select
 * @param {Array} dados - Array de dados {valor, texto}
 */
function popularSelect(tipo, dados) {
    const select = document.getElementById(`select_${tipo}`);
    if (!select) {
        console.warn(`⚠️ Select não encontrado: select_${tipo}`);
        return;
    }

    // Limpa opções existentes
    select.innerHTML = '';

    // Adiciona novas opções
    dados.forEach(item => {
        const option = document.createElement('option');
        option.value = item.valor;
        option.textContent = item.texto;
        select.appendChild(option);
    });
}

/**
 * 🔗 CAPTURA CAMPOS RELACIONADOS: Captura valores de selects para campos relacionados
 * 
 * Função auxiliar que localiza selects correspondentes aos campos relacionados
 * definidos em window.api_info.campos_relacionados e captura seus valores (IDs)
 * para adicionar ao array de dados do registro.
 * 
 * @returns {Object} Objeto com os campos relacionados e seus valores
 * @example
 * // Se campos_relacionados = ['idgrupo'] e select grupo tem value = 2
 * // Retorna: {idgrupo: 2}
 */
function capturaCamposRelacionados() {
    console.log('🔗 Iniciando captura de campos relacionados...');
    
    const camposCapturados = {};
    
    // Só executa se houver campos relacionados configurados
    if (!window.api_info.campos_relacionados || window.api_info.campos_relacionados.length === 0) {
        console.log('📝 Nenhum campo relacionado configurado - retornando objeto vazio');
        return camposCapturados;
    }
    
    // Itera pelos campos relacionados configurados
    window.api_info.campos_relacionados.forEach(nomeCampo => {
        console.log(`🔍 Procurando select para campo relacionado: ${nomeCampo}`);
        
        // Tenta localizar a select correspondente (por name ou id)
        let selectElement = document.querySelector(`select[name="${nomeCampo}"]`) || 
                           document.querySelector(`select[id="${nomeCampo}"]`) ||
                           document.querySelector(`select[name="${nomeCampo.replace('id', '')}"]`) ||
                           document.querySelector(`select[id="${nomeCampo.replace('id', '')}"]`);
        
        if (selectElement && selectElement.value) {
            camposCapturados[nomeCampo] = selectElement.value;
            console.log(`✅ Campo relacionado capturado: ${nomeCampo} = ${selectElement.value}`);
        } else {
            console.warn(`⚠️ Select não encontrada ou sem valor para campo relacionado: ${nomeCampo}`);
        }
    });
    
    console.log('🔗 Campos relacionados capturados:', camposCapturados);
    return camposCapturados;
}

export {
    popularFormulario,  // Única função externa - para população inicial
    // Novos métodos de selects transferidos do ConstrutorDeForms.js
    popularSelectIndividual,
    popularTodasSelects,
    limparSelectIndividual,
    configurarSelectsCascata,
    buscarDadosParaSelect,  // Nova função com configuração
    obterValoresSelects,
    obterElementoSelect,
    popularSelect,  // Retrocompatibilidade
    capturaCamposRelacionados,  // Nova função para campos relacionados
    // Novas funções para sistema de filtros genérico
    processarFiltroSelect,
    popularSelectComDados
};


