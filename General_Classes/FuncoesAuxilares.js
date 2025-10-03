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
function criarEventos(element, eventType, handler, options = false, eventName = null) {
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
function removerEventos(eventName = "Todos") {
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
function listarEventos() {
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

// Exporta as funções para uso em outros módulos
export { criarEventos, removerEventos, listarEventos, habilitarControlesDeFrm, desabilitarControlesDeFrm, habilitarModoEdicao };