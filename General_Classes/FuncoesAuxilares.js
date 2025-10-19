import { _popularFormularioAutomaticoPorIndice } from './OperacoesCRUD.js';

//=================FUNÇÕES AUXILIARES RELATIVAS A EVENTOS=========================//

// ============= GERENCIAMENTO DE EVENTOS =============

/**
 * Coleção global para armazenar todos os eventos criados
 * Estrutura: { element, eventType, handler, options, eventName }
 * @type {Array<Object>}
 */
let eventsCollection = [];

/**
 * 🎧 CRIAR EVENTOS: Adiciona event listener e armazena na coleção para gerenciamento
 * 
 * Adiciona um event listener ao elemento especificado e armazena todos os dados
 * necessários para remoção posterior. Permite controle total sobre todos os 
 * eventos criados no sistema.
 * 
 * @param {Element|Document|Window} element - Elemento que receberá o evento
 * @param {string} eventType - Tipo do evento (click, change, select-alterada, etc.)
 * @param {Function} handler - Função que será executada quando o evento ocorrer
 * @param {Object|boolean} [options] - Opções do addEventListener (capture, passive, once, etc.)
 * @param {string} [eventName] - Nome identificador do evento para remoção específica
 * 
 * @example
 * // Evento básico
 * criarEventos(document, 'click', minhaFuncao);
 * 
 * // Evento com nome para remoção específica
 * criarEventos(divFormCrud, 'select-alterada', handlerSelect, false, 'filtroSubgrupos');
 * 
 * // Evento com opções avançadas
 * criarEventos(button, 'click', handler, { once: true, passive: true }, 'botaoSubmit');
 * 
 * @returns {void}
 * @since 1.0.0
 */
function criarListener(element, eventType, handler, options = false, eventName = null) {
    try {
        // Adiciona o event listener normalmente
        element.addEventListener(eventType, handler, options);
        
        // Armazena na coleção para controle
        eventsCollection.push({
            element: element,
            eventType: eventType,
            handler: handler,
            options: options,
            eventName: eventName || `${eventType}_${Date.now()}` // Nome automático se não fornecido
        });
        
        console.log(`📎 Evento criado: ${eventType} (Total na coleção: ${eventsCollection.length})`);
        
    } catch (error) {
        console.error(`❌ Erro ao criar evento ${eventType}:`, error);
    }
}

/**
 * 🗑️ REMOVER EVENTOS: Remove event listeners específicos ou todos da coleção
 * 
 * Remove eventos da coleção e do DOM. Permite remoção específica por nome
 * ou limpeza total de todos os eventos. Essencial para evitar vazamentos
 * de memória e eventos duplicados.
 * 
 * @param {string} [eventName="Todos"] - Nome do evento a remover ou "Todos" para limpar tudo
 * 
 * @example
 * // Remove todos os eventos
 * removerEventos();
 * removerEventos("Todos");
 * 
 * // Remove evento específico
 * removerEventos("filtroSubgrupos");
 * 
 * // Remove todos eventos de um tipo
 * removerEventos("click");
 * 
 * @returns {number} Quantidade de eventos removidos
 * @since 1.0.0
 */
function removerListener(eventName = "Todos") {
    try {
        let removidosCount = 0;
        
        if (eventName === "Todos") {
            // Remove todos os eventos
            console.log(`🧹 Removendo todos os ${eventsCollection.length} eventos...`);
            
            eventsCollection.forEach(({ element, eventType, handler }) => {
                element.removeEventListener(eventType, handler);
                removidosCount++;
            });
            
            // Limpa a coleção
            eventsCollection = [];
            
        } else {
            // Remove eventos específicos por nome ou tipo
            console.log(`🎯 Removendo eventos: ${eventName}...`);
            
            eventsCollection = eventsCollection.filter(event => {
                const shouldRemove = event.eventName === eventName || 
                                   event.eventType === eventName;
                
                if (shouldRemove) {
                    event.element.removeEventListener(event.eventType, event.handler);
                    removidosCount++;
                    return false; // Remove da coleção
                }
                return true; // Mantém na coleção
            });
        }
        
        console.log(`✅ ${removidosCount} evento(s) removido(s). Restam: ${eventsCollection.length}`);
        return removidosCount;
        
    } catch (error) {
        console.error(`❌ Erro ao remover eventos:`, error);
        return 0;
    }
}

/**
 * 📊 LISTAR EVENTOS: Retorna informações sobre eventos na coleção (debug)
 * 
 * @returns {Array<Object>} Lista dos eventos ativos
 * @since 1.0.0
 */
function listarListener() {
    console.log(`📋 Eventos ativos (${eventsCollection.length}):`, eventsCollection);
    return eventsCollection;
}

// ============= GERENCIAMENTO DE CONTROLES DE FORMULÁRIO =============

/**
 * 🔓 HABILITAR CONTROLES: Habilita campos do formulário seguindo regras específicas
 * 
 * Habilita controles do formulário com lógica diferenciada:
 * - Selects de filtro/pesquisa (id inicia com 'select_'): SEMPRE habilitadas
 * - Outros campos (inputs, textareas, etc.): Habilitados normalmente
 * 
 * Substitui lógica específica de habilitação, centralizando regras de negócio
 * e permitindo reutilização em diferentes contextos.
 * 
 * @param {Element} [form=null] - Elemento form específico ou null para usar form ativo
 * 
 * @example
 * // Usar form ativo atual
 * habilitarControlesDeFrm();
 * 
 * // Usar form específico
 * const meuForm = document.getElementById('formCrud');
 * habilitarControlesDeFrm(meuForm);
 * 
 * @returns {number} Quantidade de controles habilitados
 * @since 1.0.0
 */
function habilitarControlesDeFrm(form = null) {
    try {
        // Determina qual formulário usar
        const formulario = form || window.api_info?.form_ativo?.form;
        
        if (!formulario) {
            console.warn('⚠️ habilitarControlesDeFrm: Nenhum formulário disponível');
            return 0;
        }
        
        // Busca todos os controles do formulário
        const controles = formulario.querySelectorAll('input, textarea, select, input[type="checkbox"], .radio-group');
        let habilitadosCount = 0;
        
        controles.forEach(controle => {
            if (controle.id && controle.id.startsWith('select_')) {
                // SELECTS DE FILTRO/PESQUISA: Sempre habilitadas
                controle.removeAttribute('disabled');
                controle.removeAttribute('readonly');
                habilitadosCount++;
                
            } else {
                // CAMPOS NORMAIS: Habilitação padrão
                controle.removeAttribute('disabled');
                controle.removeAttribute('readonly');
                // Remove background de modo edição se existir
                controle.style.backgroundColor = '';
                habilitadosCount++;
            }
        });
        
        console.log(`✅ habilitarControlesDeFrm: ${habilitadosCount} controles habilitados`);
        return habilitadosCount;
        
    } catch (error) {
        console.error('❌ Erro em habilitarControlesDeFrm:', error);
        return 0;
    }
}

/**
 * 🔒 DESABILITAR CONTROLES: Desabilita campos do formulário seguindo regras específicas
 * 
 * Desabilita controles do formulário com lógica diferenciada:
 * - Selects de filtro/pesquisa (id inicia com 'select_'): SEMPRE habilitadas (nunca desabilita)
 * - Outros campos (inputs, textareas, etc.): Desabilitados para modo readonly
 * 
 * Essencial para formulários sem registros ou modo visualização, mantendo
 * selects ativas para permitir filtros e pesquisas.
 * 
 * @param {Element} [form=null] - Elemento form específico ou null para usar form ativo
 * 
 * @example
 * // Usar form ativo atual
 * desabilitarControlesDeFrm();
 * 
 * // Usar form específico
 * const meuForm = document.getElementById('formCrud');
 * desabilitarControlesDeFrm(meuForm);
 * 
 * @returns {number} Quantidade de controles processados
 * @since 1.0.0
 */
function desabilitarControlesDeFrm(form = null) {
    try {
        // Determina qual formulário usar
        const formulario = form || window.api_info?.form_ativo?.form;
        
        if (!formulario) {
            console.warn('⚠️ desabilitarControlesDeFrm: Nenhum formulário disponível');
            return 0;
        }
        
        // Busca todos os controles do formulário
        const controles = formulario.querySelectorAll('input, textarea, select, input[type="checkbox"], .radio-group');
        let processadosCount = 0;
        
        controles.forEach(controle => {
            if (controle.id && controle.id.startsWith('select_')) {
                // SELECTS DE FILTRO/PESQUISA: Sempre habilitadas (NUNCA desabilita)
                controle.removeAttribute('disabled');
                controle.removeAttribute('readonly');
                
            } else {
                // CAMPOS NORMAIS: Desabilitar para modo readonly
                controle.setAttribute('readonly', true);
                
                // Selects e checkboxes precisam de disabled além de readonly
                if (controle.tagName === 'SELECT' || controle.type === 'checkbox') {
                    controle.setAttribute('disabled', true);
                }
                
                // Remove background de modo edição
                controle.style.backgroundColor = '';
            }
            processadosCount++;
        });
        
        console.log(`🔒 desabilitarControlesDeFrm: ${processadosCount} controles processados`);
        return processadosCount;
        
    } catch (error) {
        console.error('❌ Erro em desabilitarControlesDeFrm:', error);
        return 0;
    }
}

/**
 * 🎨 HABILITAR MODO EDIÇÃO: Habilita controles com visual de modo edição
 * 
 * Combina habilitação com visual específico para modo edição:
 * - Selects de filtro/pesquisa: Sempre habilitadas
 * - Outros campos: Habilitados + fundo amarelo (indicativo de edição)
 * 
 * @param {Element} [form=null] - Elemento form específico ou null para usar form ativo
 * @returns {number} Quantidade de controles configurados para edição
 * @since 1.0.0
 */
function habilitarModoEdicao(form = null) {
    try {
        const formulario = form || window.api_info?.form_ativo?.form;
        
        if (!formulario) {
            console.warn('⚠️ habilitarModoEdicao: Nenhum formulário disponível');
            return 0;
        }
        
        const controles = formulario.querySelectorAll('input, textarea, select, input[type="checkbox"], .radio-group');
        let configuradosCount = 0;
        
        controles.forEach(controle => {
            if (controle.id && controle.id.startsWith('select_')) {
                // SELECTS DE FILTRO/PESQUISA: Sempre habilitadas, sem fundo amarelo
                controle.removeAttribute('disabled');
                controle.removeAttribute('readonly');
                
            } else {
                // CAMPOS NORMAIS: Habilitados + fundo amarelo para edição
                controle.removeAttribute('disabled');
                controle.removeAttribute('readonly');
                controle.style.backgroundColor = 'yellow';
            }
            configuradosCount++;
        });
        
        console.log(`🎨 habilitarModoEdicao: ${configuradosCount} controles configurados para edição`);
        return configuradosCount;
        
    } catch (error) {
        console.error('❌ Erro em habilitarModoEdicao:', error);
        return 0;
    }
}

// ============= POPULAÇÃO INTELIGENTE DE SELECTS =============

/**
 * 🔍 DETECTAR TIPO DE FORMULÁRIO
 * Analisa configSelects e retorna o tipo de formulário. O tipo de formulário
 * será definido pela quantidade de selects (campos) em configSelects´.
 * Cada tipo de formulário terá uma estratégia de população específica.
 */
function detectarTipoFormulario(configSelects) {
    if (!configSelects || !configSelects.campos || configSelects.campos.length === 0) {
        return 'SEM_SELECTS';
    }
    
    const numCampos = configSelects.campos.length;
    
    switch(numCampos) {
        case 0: return 'SEM_SELECTS';        // Formulários sem selects
        case 1: return '0_FILTROS&1_PESQUISA';        // Formulários que só têm select de pesquisa
        case 2: return '1_FILTRO&1_PESQUISA';    // Formulários com 1 filtro + 1 pesquisa
        default: return 'MULTI_FILTROS&PESQUISA';     // Formulários com múltiplos filtros + pesquisa
    }
}

/**
 * 🔄 POPULAÇÃO INTELIGENTE DE SELECTS
 * Detecta automaticamente o tipo de formulário e aplica a população apropriada
 * @param {Object} formInstance - Instância do formulário com configSelects
 */
async function popularSelectPorConfiguracao(formInstance) {
    console.log('🔄 Iniciando população inteligente de selects...');
    
    try {
        // 1. Detectar tipo
        const tipo = detectarTipoFormulario(formInstance.configSelects);
        console.log(`📋 Tipo detectado: ${tipo}`);
        
        // 2. Aplicar população específica
        switch(tipo) {
            case 'SEM_SELECTS':
                // Não há população de selects vai direto para população do formulário
                console.log('📋 Formulário sem selects - nenhuma população necessária');
                break;

            case '0_FILTROS&1_PESQUISA':
                // Popula select de pesquisa com os mesmos dados que será populado o formulário
                await popularSelect0F_1P(formInstance);
                break;
                
            case '1_FILTRO&1_PESQUISA':
                await popularSelect1F_1P(formInstance);
                break;

            case 'MULTI_FILTROS&PESQUISA':
                await popularSelectMultiF_1P(formInstance);
                break;
                
            default:
                console.warn(`⚠️ Tipo de formulário não reconhecido: ${tipo}`);
        }
        
    } catch (error) {
        console.error('❌ Erro na população inteligente:', error);
    }
}

/**
 * 🎯 POPULAR SELECT PESQUISA SIMPLES (1 select)
 */
async function popularSelect0F_1P(formInstance) {
    console.log('🎯 Populando select de pesquisa simples (0 filtros + 1 pesquisa)...');
    
    try {
        if (!formInstance.configSelects) {
            console.warn('⚠️ configSelects não encontrada na instância');
            return;
        }
        
        // Importa popularSelect do OperacoesCRUD
        const { popularSelect } = await import('./OperacoesCRUD.js');
        
        // Popula única select de pesquisa
        await popularSelect(formInstance.configSelects);
        
        console.log('✅ Select de pesquisa 0F+1P populada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao popular select 0F+1P:', error);
    }
}

/**
 * 🔄 POPULAR COM 1 SELECT DE FILTRO 1 DE PESQUISA(2 selects)  
 */
async function popularSelect1F_1P(formInstance) {
    console.log('🔄 Populando selects com 1 filtro + 1 pesquisa...');
    
    try {
        if (!formInstance.configSelects) {
            console.warn('⚠️ configSelects não encontrada na instância');
            return;
        }
        
        // Importa popularSelect do OperacoesCRUD
        const { popularSelect } = await import('./OperacoesCRUD.js');
        
        // Popula select de filtro usando configSelects
        await popularSelect(formInstance.configSelects);
        
        console.log('✅ Selects 1F+1P populadas com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao popular selects 1F+1P:', error);
    }
}

/**
 * 🌟  * 🔄 POPULAR COM MAIS DE 1 SELECT DE FILTRO 1 DE PESQUISA(2 selects) 
 */
async function popularSelectMultiF_1P(formInstance) {
    console.log('🌟 Populando selects com múltiplos filtros...');
    // TODO: Implementar lógica para formulários com múltiplos filtros

    try {
        if (!formInstance.configSelects) {
            console.warn('⚠️ configSelects não encontrada na instância');
            return;
        }
        
        // Importa popularSelect do OperacoesCRUD
        const { popularSelect } = await import('./OperacoesCRUD.js');
        
        // Popula select de filtro usando configSelects
        await popularSelect(formInstance.configSelects);
        
        console.log('✅ Selects 1F+1P populadas com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao popular selects 1F+1P:', error);
    }
}

// Exporta as funções para uso em outros módulos
export { 
    criarListener, 
    removerListener, 
    listarListener, 
    habilitarControlesDeFrm, 
    desabilitarControlesDeFrm, 
    habilitarModoEdicao,
    popularSelectPorConfiguracao,
    detectarTipoFormulario,
    garbageCollector,
    form_listener
};

//************************************************************
//                ENCERRAMENTO DE FORMULÁRIO
//************************************************************

/**
 * 🗑️ GARBAGE COLLECTOR: Limpa resíduos de formulário da memória
 * Função orquestradora que chama todas as operações de limpeza necessárias
 * para evitar vazamentos de memória e conflitos entre formulários
 * 
 * @param {Object} formTarget - Instância do formulário a ser descartado
 */
function garbageCollector(formTarget) {
    console.log('🗑️ Iniciando limpeza de memória para formulário...');
    
    try {
        // 1. Remover event listeners do formulário
        removerListener();
        console.log('✅ Event listeners removidos');
        
        // 2. Limpar window.api_info (resetar estado global preservando funções e constantes)
        Object.keys(window.api_info).forEach(key => {
            if (typeof window.api_info[key] !== 'function' && !key.startsWith('const_')) {
                const tipo = typeof window.api_info[key];
                
                switch(tipo) {
                    case 'string':
                        window.api_info[key] = "";
                        break;
                    case 'number':
                        window.api_info[key] = 0;
                        break;
                    case 'boolean':
                        window.api_info[key] = false;
                        break;
                    case 'object':
                        if (Array.isArray(window.api_info[key])) {
                            window.api_info[key] = [];
                        } else {
                            window.api_info[key] = {};
                        }
                        break;
                    default:
                        window.api_info[key] = null;
                }
            }
        });
        console.log('✅ window.api_info limpo (funções e constantes preservadas, tipos mantidos)');
        
        // 3. Limpar DOM específico do formulário (usar formTarget, não document)
        if (formTarget && formTarget.form) {
            // Limpa apenas o CONTEÚDO dos containers dinâmicos, preservando elementos estruturais
            const formElement = formTarget.form;
            
            // Limpar container principal onde JS insere os campos
            const mainConteudo = formElement.querySelector('#mainConteudo');
            if (mainConteudo) {
                mainConteudo.innerHTML = '';
                console.log('✅ Conteúdo de #mainConteudo limpo (elemento preservado)');
            }
            
            // Limpar container onde JS insere selects, filtros, botões
            const divControles = formElement.querySelector('#divControlesFormulario');
            if (divControles) {
                divControles.innerHTML = '';
                console.log('✅ Conteúdo de #divControlesFormulario limpo (elemento preservado)');
            }
            
            console.log('✅ Conteúdo dinâmico do formulário removido (containers estruturais preservados)');
        }
        
        console.log('✅ Estado do framework resetado');
        
        // 4. Limpar cache de dados específico do formulário
        if (formTarget && formTarget.id) {
            window.localStorage.removeItem(`formData_${formTarget.id}`);
            console.log('✅ Cache de dados limpo');
        }
        
        // 5. Descartar referência do objeto formTarget
        formTarget = null;
        console.log('✅ Objeto formTarget descartado');
        
        console.log('🎉 Limpeza de memória concluída com sucesso');
        
    } catch (error) {
        console.error('❌ Erro durante limpeza de memória:', error);
    }
}

//************************************************************
//              CONSTRUINDO SELECTS DE FILTROS
//************************************************************

/**
 * 🔄 PREPARAR STRING DE FILTRO: Reconstrói filtros quando select é alterada
 * 
 * Mantém valores até a select alterada e coloca * nas posteriores
 * Função auxiliar necessária para o sistema de cascata de selects
 * 
 * @param {string} campoAlterado - Campo que foi alterado (ex: "grupo")  
 * @param {string} novoValor - Novo valor do campo (ex: "2")
 * @param {Object} configSelects - Configuração das selects do formulário
 */
function prepararStrFiltro(campoAlterado, novoValor, configSelects) {
    try {
        if (!window.api_info.filtros || !campoAlterado) {
            return;
        }
        
        // Encontra índice do campo alterado
        const indice = configSelects.campos.indexOf(campoAlterado);
        if (indice === -1) {
            return; // Campo não encontrado
        }
        
        // Split da string por AND
        const pares = window.api_info.filtros.split(' AND ');
        
        // Altera valor na posição correspondente e * nas posteriores
        for (let i = 0; i < pares.length; i++) {
            const [campo, valor] = pares[i].split(' = ');
            if (i < indice) {
                // Mantém valores anteriores
                continue;
            } else if (i === indice) {
                // Novo valor na posição alterada
                // Se for string (não numérico), adiciona aspas
                const valorFormatado = isNaN(novoValor) ? `'${novoValor}'` : novoValor;
                pares[i] = `${campo} = ${valorFormatado}`;
            } else {
                // * nas posições posteriores
                pares[i] = `${campo} = *`;
            }
        }
        
        // Reconstrói string
        window.api_info.filtros = pares.join(' AND ');
    } catch (error) {
        console.error('❌ Erro em prepararStrFiltro:', error);
    }
}

/**
 * 🎧 FORM LISTENER: Processa eventos de alteração em selects de filtros
 * 
 * Função genérica que centraliza a lógica de cascata de selects em formulários.
 * Substitui código repetitivo nos formulários por uma função reutilizável.
 * 
 * @param {Object} formObj - Instância do formulário (ex: formDespGlobal)
 * @param {string} campo - Nome do campo alterado (ex: 'ano')
 * @param {string} valor - Valor selecionado (ex: '2025')
 * 
 * @example
 * // Uso em formulários:
 * criarListener(document, 'select-alterada', async (event) => {
 *     const { campo, valor } = event.detail;
 *     await form_listener(formDespGlobal, campo, valor);
 * });
 */
async function form_listener(formObj, campo, valor, event) {
    try {
        // ✅ RECONSTRUÇÃO INTELIGENTE DE FILTROS
        if (window.api_info.filtros) {
            prepararStrFiltro(campo, valor, formObj.configSelects);
            console.log(`✅ Filtro reconstruído: "${window.api_info.filtros}"`);
        }

        // ✅ DETECÇÃO INTELIGENTE DA ÚLTIMA SELECT DE FILTRO
        const campos = formObj.configSelects.campos;
        const indiceAtual = campos.indexOf(campo);
        const ultimaFiltroIndex = campos.length - 2;  // Penúltima posição (última de filtro)
        
        console.log(`📊 Campo: ${campo}, Índice: ${indiceAtual}, Última filtro: ${ultimaFiltroIndex}`);

        // ✅ SE É A ÚLTIMA SELECT DE FILTRO → DISPARA CONSULTA
        if (indiceAtual === ultimaFiltroIndex && indiceAtual >= 0) {
            console.log(`🎯 ÚLTIMA SELECT DE FILTRO (${campo}) alterada - Disparando consulta ao BD!`);
            
            // Importa processarFiltroSelect do OperacoesCRUD
            const { processarFiltroSelect } = await import('./OperacoesCRUD.js');
            
            // Popula select de pesquisa (usando lógica existente)
            await processarFiltroSelect({
                selectOrigem: campo,
                selectDestino: campos[campos.length - 1], // Última select (pesquisa)
                nomeFiltro: `id${campo}`, // Converte campo para nome do ID
                valor: valor,
                configSelects: formObj.configSelects // Adiciona configuração dos selects
            });
        }
        // ✅ SE É UMA SELECT DE FILTRO INTERMEDIÁRIA → SÓ ATUALIZA FILTRO
        else if (indiceAtual < ultimaFiltroIndex) {
            console.log(`📋 Select de filtro intermediária (${campo}) - Apenas atualizando filtro`);
            // Filtro já foi atualizado acima, não faz mais nada
        }
        // ✅ SE É A SELECT DE PESQUISA → POPULA FORMULÁRIO
        else if (indiceAtual === campos.length - 1 && valor) {
            console.log(`🎯 Select de pesquisa (${campo}) selecionada - Populando formulário`);
            
            // Obtém o índice da opção selecionada diretamente do evento
            const indiceSelecionado = event.detail.objSelect.selectedIndex - 1; // -1 porque primeira opção é "Selecione..."
            
            try {
                // Chama função que recebe índice e atualiza reg_num automaticamente
                _popularFormularioAutomaticoPorIndice(indiceSelecionado);
                console.log('✅ Formulário populado via select de pesquisa');
            } catch (error) {
                console.error('❌ Erro ao popular formulário:', error);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro no form_listener:', error);
    }
}