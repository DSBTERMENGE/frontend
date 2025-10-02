/**
 * Classe para construir selects com configuração baseada em propriedades
 * Focada em reutilização e flexibilidade de arranjo (linha/coluna)
 * Aplica formatação automática de labels e espaçamentos consistentes
 */

export class CriarSelects {
    /**
     * 
     * @param {Array<string>} labels - Array com os nomes dos labels que aparecerão antes de cada select
     *                                  Exemplo: ['Categoria', 'Subcategoria', 'Produto']
     *                                  Nota: Será automaticamente adicionado ":" ao final de cada label
     * 
     * @param {Array<string>} campos - Array com os nomes dos campos correspondentes para população das selects
     *                                  ou para retorno em pesquisas. Deve ter o mesmo tamanho que labels
     *                                  Exemplo: ['categoria', 'subcategoria', 'produto']
     * 
     * @param {Array<string>} largCampos - Array com as larguras de cada select
     *                                     Aceita valores em CSS (px, %, vw, em, rem)
     *                                     Exemplo: ['150px', '200px', '250px'] ou ['15%', '20%', '25%']
     * 
     * @param {string} [arranjo='linha'] - Define o arranjo visual dos selects:
     *                                     'linha' = selects horizontais (lado a lado) - PADRÃO
     *                                     'coluna' = selects verticais (um abaixo do outro)
     * 
     * @throws {Error} Lança erro se os arrays labels, campos e largCampos não tiverem o mesmo tamanho
     * @throws {Error} Lança erro se arranjo não for 'linha' ou 'coluna'
     * 
     * @example
     * // Exemplo básico - selects em linha
     * const selects = new CriarSelects(
     *     ['Categoria', 'Produto'], 
     *     ['categoria', 'produto'], 
     *     ['150px', '200px']
     * );
     * 
     * @example
     * // Exemplo com arranjo vertical
     * const selects = new CriarSelects(
     *     ['Estado', 'Cidade', 'Bairro'], 
     *     ['estado', 'cidade', 'bairro'], 
     *     ['100%', '100%', '100%'],
     *     'coluna'
     * );
     */
    constructor(labels, campos, largCampos, arranjo = 'linha') {
        // Validação dos parâmetros obrigatórios
        this._validarParametros(labels, campos, largCampos, arranjo);
        
        // Propriedades principais
        this.labels = labels;
        this.campos = campos;
        this.largCampos = largCampos;
        this.arranjo = arranjo;
        
        // Configurações de espaçamento (conforme especificado) - COMPACTO
        this.paddingLabel = '0.3rem';    // Padding entre label e select (lado a lado)
        this.paddingSelect = '0.5rem';   // Padding direito entre grupos de selects
        
        // Classes CSS padrão
        this.cssClasses = {
            container: 'selects-container',
            grupo: 'select-grupo', 
            label: 'select-label',
            select: 'select-elemento'
        };
        
        // Maps para controle interno
        this.selectsElementos = new Map(); // Cache dos elementos DOM das selects
        this.valoresAtuais = new Map();   // Cache dos valores selecionados
        
        // Configuração inicial
        this._inicializar();
    }
    
    /**
     * Valida os parâmetros fornecidos ao construtor
     * 
     * @param {Array<string>} labels - Array de labels
     * @param {Array<string>} campos - Array de campos  
     * @param {Array<string>} largCampos - Array de larguras
     * @param {string} arranjo - Tipo de arranjo
     * 
     * @throws {Error} Se alguma validação falhar
     * 
     * @private
     */
    _validarParametros(labels, campos, largCampos, arranjo) {
        // Validação de labels
        if (!Array.isArray(labels) || labels.length === 0) {
            throw new Error('O parâmetro "labels" deve ser um array não vazio.');
        }
        
        if (!labels.every(label => typeof label === 'string' && label.trim().length > 0)) {
            throw new Error('Todos os elementos de "labels" devem ser strings não vazias.');
        }
        
        // Validação de campos
        if (!Array.isArray(campos) || campos.length !== labels.length) {
            throw new Error('O parâmetro "campos" deve ser um array com o mesmo tamanho de "labels".');
        }
        
        if (!campos.every(campo => typeof campo === 'string' && campo.trim().length > 0)) {
            throw new Error('Todos os elementos de "campos" devem ser strings não vazias.');
        }
        
        // Validação de largCampos
        if (!Array.isArray(largCampos) || largCampos.length !== labels.length) {
            throw new Error('O parâmetro "largCampos" deve ser um array com o mesmo tamanho de "labels".');
        }
        
        if (!largCampos.every(largura => typeof largura === 'string' && largura.trim().length > 0)) {
            throw new Error('Todos os elementos de "largCampos" devem ser strings não vazias representando valores CSS.');
        }
        
        // Validação de arranjo
        if (!['linha', 'coluna'].includes(arranjo)) {
            throw new Error('O parâmetro "arranjo" deve ser "linha" ou "coluna".');
        }
    }

    /**
     * Inicializa as configurações internas da classe
     * Prepara os Maps de controle e configurações básicas
     * 
     * @private
     */
    _inicializar() {
        // Inicializa os Maps de controle
        this.campos.forEach(campo => {
            this.selectsElementos.set(campo, null);
            this.valoresAtuais.set(campo, '');
        });
        
        // Log de inicialização (pode ser removido em produção)
        console.log(`CriarSelects inicializada: ${this.labels.length} selects em arranjo "${this.arranjo}"`);
    }

    /**
     * Gera o HTML completo dos selects baseado nas propriedades definidas
     * @returns {string} HTML completo dos selects
     */
    gerarHTML() {
        const containerStyle = this.arranjo === 'linha' ? 
            'display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem; min-height: auto;' : 
            'display: flex; flex-direction: column; gap: 0.3rem; min-height: auto;';
        
        let html = `<div class="${this.cssClasses.container}" style="${containerStyle}">`;
        
        for (let i = 0; i < this.labels.length; i++) {
            html += this._gerarHTMLSelect(i, i === this.labels.length - 1);
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Gera HTML de um select individual com label formatado e padding
     * @param {number} index - Índice do select no array de labels/campos
     * @param {boolean} isUltimo - Se é o último select da série
     * @returns {string} HTML do select individual
     */
    _gerarHTMLSelect(index, isUltimo = false) {
        const label = this.labels[index];
        const campo = this.campos[index];
        const largura = this.largCampos[index];
        const selectId = `select_${campo}`;
        
        // Padding: select tem padding direito (exceto último)
        const paddingSelectDireito = isUltimo ? '0' : this.paddingSelect;
        
        // Estilos para arranjo do container principal (linha vs coluna) - COMPACTO
        const grupoStyle = this.arranjo === 'linha' ? 
            `display: inline-flex; flex-direction: row; align-items: center; margin-right: ${paddingSelectDireito}; min-height: auto;` :
            `display: flex; flex-direction: row; align-items: center; margin-bottom: ${this.paddingSelect}; min-height: auto;`;
        
        // Label e select ficam sempre em linha (lado a lado) - COMPACTO
        const labelStyle = `margin-right: ${this.paddingLabel}; font-weight: bold; color: #333; white-space: nowrap; font-size: 0.85rem; line-height: 1.2;`;
        const selectStyle = `width: ${largura}; padding: 0.25rem 0.4rem; border: 1px solid #ccc; border-radius: 3px; font-size: 0.85rem; height: auto; min-height: 1.8rem; line-height: 1.2;`;
        
        return `
            <div class="${this.cssClasses.grupo}" style="${grupoStyle}" data-campo="${campo}">
                <label for="${selectId}" class="${this.cssClasses.label}" style="${labelStyle}">
                    ${label}:
                </label>
                <select id="${selectId}" class="${this.cssClasses.select}" style="${selectStyle}">
                    <option value="">Selecione...</option>
                </select>
            </div>
        `;
    }

    /**
     * Gera as opções de um select (método auxiliar para futuro uso)
     * @param {Array<Object>} dados - Array de {value, text}
     * @returns {string} HTML das options
     */
    _gerarOpcoesSelect(dados) {
        if (!Array.isArray(dados)) return '';
        
        return dados.map(item => 
            `<option value="${item.value}">${item.text}</option>`
        ).join('');
    }

    /**
     * Insere os selects em um container específico
     * @param {string|HTMLElement} containerIdOuElemento - ID do container ou elemento DOM
     */
    inserirEm(containerIdOuElemento) {
        let container;
        
        if (typeof containerIdOuElemento === 'string') {
            container = document.getElementById(containerIdOuElemento);
            if (!container) {
                throw new Error(`Container com ID '${containerIdOuElemento}' não encontrado.`);
            }
        } else if (containerIdOuElemento instanceof HTMLElement) {
            container = containerIdOuElemento;
        } else {
            throw new Error('Container deve ser um ID (string) ou elemento DOM.');
        }

        // Insere o HTML no container
        container.innerHTML = this.gerarHTML();
        
        // Armazena referências dos elementos criados
        this._mapearElementos();
    }

    /**
     * Mapeia os elementos selects criados no DOM e registra event listeners
     * @private
     */
    _mapearElementos() {
        this.campos.forEach(campo => {
            const selectId = `select_${campo}`;
            const elemento = document.getElementById(selectId);
            if (elemento) {
                this.selectsElementos.set(campo, elemento);
            }
        });
        
        // Registra os event listeners após mapear todos os elementos
        this._registrarEventListeners();
        console.log('✅ Elementos mapeados e event listeners registrados');
    }

    /**
     * Obtém o elemento select de um campo específico
     * @param {string} campo - Nome do campo
     * @returns {HTMLSelectElement|null} Elemento select ou null se não encontrado
     */
    obterElementoSelect(campo) {
        return this.selectsElementos.get(campo) || null;
    }

    /**
     * Obtém todos os valores selecionados
     * @returns {Object} Objeto com {campo: valor} dos selects preenchidos
     */
    obterValores() {
        const valores = {};
        this.campos.forEach(campo => {
            const elemento = this.selectsElementos.get(campo);
            if (elemento && elemento.value && elemento.value !== '') {
                valores[campo] = elemento.value;
            }
        });
        return valores;
    }

    // ========================================
    // SEÇÃO: POPULAÇÃO DOS SELECTS
    // ========================================
    // Métodos para popular os selects com dados vindos do banco ou arrays locais
    // Suporta população individual ou em lote

    /**
     * Popula um select específico com dados
     * Substitui todas as opções existentes pelas novas
     * 
     * @param {string} campo - Nome do campo do select a ser populado
     * @param {Array<Object>} dados - Array de objetos {value, text}
     *                                Exemplo: [{value: '1', text: 'Opção 1'}, {value: '2', text: 'Opção 2'}]
     * @param {boolean} [manterPrimeiro=true] - Se deve manter a primeira opção "Selecione..."
     * 
     * @returns {boolean} true se populou com sucesso, false se select não encontrado
     * 
     * @example
     * // Popular select de categoria
     * const dadosCategoria = [
     *     {value: 'eletronicos', text: 'Eletrônicos'},
     *     {value: 'roupas', text: 'Roupas'}
     * ];
     * selects.popularSelect('categoria', dadosCategoria);
     */
    popularSelect(campo, dados, manterPrimeiro = true) {
        const elemento = this.obterElementoSelect(campo);
        if (!elemento) {
            console.warn(`Select com campo '${campo}' não encontrado para população.`);
            return false;
        }

        if (!Array.isArray(dados)) {
            console.warn(`Dados para popular o select '${campo}' devem ser um array.`);
            return false;
        }

        // Gera as opções
        let opcoesHTML = '';
        
        // Mantém a opção padrão se solicitado
        if (manterPrimeiro) {
            opcoesHTML += '<option value="">Selecione...</option>';
        }
        
        // Adiciona as novas opções
        opcoesHTML += this._gerarOpcoesSelect(dados);
        
        // Substitui o conteúdo do select
        elemento.innerHTML = opcoesHTML;
        
        return true;
    }

    /**
     * Popula múltiplos selects de uma vez
     * Útil para popular todos os selects após receber dados do servidor
     * 
     * @param {Object} todosDados - Objeto onde cada chave é um campo e o valor é o array de dados
     *                              Exemplo: {categoria: [{value: '1', text: 'Cat1'}], preco: [{value: 'baixo', text: 'Baixo'}]}
     * @param {boolean} [manterPrimeiro=true] - Se deve manter a primeira opção "Selecione..." em todos
     * 
     * @returns {Object} Relatório da população {sucesso: [], falha: []}
     * 
     * @example
     * // Popular todos os selects
     * const dados = {
     *     categoria: [{value: 'eletronicos', text: 'Eletrônicos'}],
     *     preco: [{value: 'baixo', text: 'Até R$ 100'}]
     * };
     * const resultado = selects.popularTodosSelects(dados);
     */
    popularTodosSelects(todosDados, manterPrimeiro = true) {
        const resultado = {
            sucesso: [],
            falha: []
        };

        if (!todosDados || typeof todosDados !== 'object') {
            console.warn('Dados para população devem ser um objeto.');
            return resultado;
        }

        // Popula cada select
        Object.keys(todosDados).forEach(campo => {
            const sucesso = this.popularSelect(campo, todosDados[campo], manterPrimeiro);
            if (sucesso) {
                resultado.sucesso.push(campo);
            } else {
                resultado.falha.push(campo);
            }
        });

        // Log do resultado
        if (resultado.sucesso.length > 0) {
            console.log(`✅ Selects populados: ${resultado.sucesso.join(', ')}`);
        }
        if (resultado.falha.length > 0) {
            console.warn(`❌ Falha ao popular: ${resultado.falha.join(', ')}`);
        }

        return resultado;
    }

    /**
     * Limpa as opções de um select específico
     * Deixa apenas a opção padrão "Selecione..."
     * 
     * @param {string} campo - Nome do campo do select a ser limpo
     * @returns {boolean} true se limpou com sucesso, false se select não encontrado
     */
    limparSelect(campo) {
        const elemento = this.obterElementoSelect(campo);
        if (!elemento) {
            console.warn(`Select com campo '${campo}' não encontrado para limpeza.`);
            return false;
        }

        elemento.innerHTML = '<option value="">Selecione...</option>';
        return true;
    }

      // ========================================
    // SEÇÃO: MANIPULAÇÃO DE EVENTOS (MEM)
    // ========================================
    // Métodos para registrar listeners de eventos e comunicação entre selects
    // Responsável pelo sistema de cascata através de CustomEvents

    /**
     * Registra os event listeners para todos os selects após inserção no DOM
     * Deve ser chamado automaticamente após _mapearElementos()
     * Cada select dispara evento 'select-alterada' quando alterado
     * 
     * @private
     */
    _registrarEventListeners() {
        this.campos.forEach(campo => {
            const elemento = this.selectsElementos.get(campo);
            if (elemento) {
                // Adiciona listener para mudanças no select
                elemento.addEventListener('change', (event) => {
                    this._handleSelectChange(campo, event);
                });
            }
        });
    }

    /**
     * Handler interno para mudanças em qualquer select
     * Atualiza valores internos e dispara evento customizado
     * 
     * @param {string} campo - Nome do campo que foi alterado
     * @param {Event} event - Evento original de mudança
     * @private
     */
    _handleSelectChange(campo, event) {
        const novoValor = event.target.value;
        
        // Atualiza cache interno
        this.valoresAtuais.set(campo, novoValor);
        
        // Obtém todos os valores atuais
        const selecionados = this.obterValores();
        
        // Log para debug
        console.log(`🔄 Select '${campo}' alterado para: '${novoValor}'`);
        console.log('📊 Valores selecionados:', selecionados);
        
        // Dispara evento customizado que será capturado pelo handlerSelectsCascata
        this._dispararEventoAlteracao(campo, novoValor, selecionados);
    }

    /**
     * Dispara o evento customizado 'select-alterada' 
     * Este evento será capturado pelo sistema de cascata
     * 
     * @param {string} campo - Campo que foi alterado
     * @param {string} valor - Novo valor selecionado
     * @param {Object} selecionados - Todos os valores selecionados
     * @private
     */
    _dispararEventoAlteracao(campo, valor, selecionados) {
        // Busca o container principal dos selects para disparar o evento
        const container = document.querySelector(`.${this.cssClasses.container}`);
        
        // Obtém o elemento select específico que disparou o evento
        const elemento = this.obterElementoSelect(campo);
        
        if (container) {
            // Cria evento customizado com dados necessários
            const eventoCustom = new CustomEvent('select-alterada', {
                detail: {
                    campo: campo,
                    valor: valor,
                    selecionados: selecionados,
                    camposSelects: this.campos,  // Lista de todos os campos
                    idSelect: elemento ? elemento.id : null  // ID HTML da select
                },
                bubbles: true  // Permite que o evento suba na árvore DOM
            });
            
            // Dispara o evento no container (será capturado pelo listener em divControlesTabela)
            container.dispatchEvent(eventoCustom);
            
            console.log(`📡 Evento 'select-alterada' disparado para campo '${campo}'`);
        } else {
            console.warn('⚠️ Container de selects não encontrado para disparar evento');
        }
    }

    /**
     * Método público para forçar disparo de evento
     * Útil para inicialização ou testes
     * 
     * @param {string} campo - Campo a ser "simulado" como alterado
     */
    forcarEventoAlteracao(campo) {
        const elemento = this.obterElementoSelect(campo);
        if (elemento) {
            const valor = elemento.value;
            const selecionados = this.obterValores();
            this._dispararEventoAlteracao(campo, valor, selecionados);
        }
    }

    /**
     * Remove todos os event listeners (útil para cleanup)
     * Chama antes de destruir a instância
     */
    removerEventListeners() {
        this.campos.forEach(campo => {
            const elemento = this.selectsElementos.get(campo);
            if (elemento) {
                // Remove todos os listeners (clone e substitui o elemento)
                const novoElemento = elemento.cloneNode(true);
                elemento.parentNode.replaceChild(novoElemento, elemento);
                
                // Atualiza referência no Map
                this.selectsElementos.set(campo, novoElemento);
            }
        });
        
        console.log('🧹 Event listeners removidos de todos os selects');
    }
    




}
