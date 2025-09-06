/**
 ****************                } catch (error) {
                    console.error(`❌ REAL: Erro ao registrar listener para ${botaoId}:`, error);
                }
            } else {
                console.warn(`⚠️ REAL: Elemento não encontrado para botão: ${botaoId}`);
                        // TESTE: Verificar se o el        console.log(`📊 DEBUG: Total de listeners registrados: ${listenersRegistrados} de ${this.botoesElementos.size}`);
        
        // TESTE IMEDIATO: Buscar botão pelo ID e testar
        console.log('🤖 TESTE IMEDIATO: Buscando botão Encerrar...');
        const botaoTeste = document.getElementById('btn_encerrar');
        if (botaoTeste) {
            console.log('✅ TESTE: Botão encontrado pelo ID!');
            console.log('📋 TESTE: Propriedades:', {
                id: botaoTeste.id,
                tagName: botaoTeste.tagName,
                className: botaoTeste.className,
                textContent: botaoTeste.textContent,
                disabled: botaoTeste.disabled,
                offsetWidth: botaoTeste.offsetWidth,
                offsetHeight: botaoTeste.offsetHeight
            });
            
            // Teste direto de clique
            botaoTeste.onclick = function() {
                console.log('🎯🎯🎯 TESTE MANUAL ONCLICK FUNCIONOU! 🎯🎯🎯');
                alert('SUCESSO! Botão funcionou com onclick direto!');
            };
            
            console.log('✅ TESTE: onclick adicionado! Agora clique manualmente no botão.');
        } else {
            console.error('❌ TESTE: Botão btn_encerrar NÃO encontrado!');
        }
    }ento é o correto
                    console.log(`🔍 DETALHES ELEMENTO ${botaoId}:`);
                    console.log(`  ID: "${elemento.id}"`);
                    console.log(`  Classes: "${elemento.className}"`);
                    console.log(`  TagName: "${elemento.tagName}"`);
                    console.log(`  IsConnected: ${elemento.isConnected}`);
                    console.log(`  Disabled: ${elemento.disabled}`);
                    console.log(`  Style.display: "${elemento.style.display}"`);
                    console.log(`  Style.visibility: "${elemento.style.visibility}"`);
                    console.log(`  OffsetWidth: ${elemento.offsetWidth}`);
                    console.log(`  OffsetHeight: ${elemento.offsetHeight}`);
                    console.log(`  ParentElement:`, elemento.parentElement?.tagName);
                    console.log(`  OuterHTML: ${elemento.outerHTML.substring(0, 150)}...`);}
        });rutorBtnRodapeForms *******************
 * Constrói os grupos de botões dos formulários que são exibidos no rodapé da interface da aplicação
 */

/**
 * Classe para construir botões de formulário com grupos configuráveis
 *                     elemento.addEventListener('mouseleave', () => {
                        this._resetarEstadoBotao(elemento, botaoId);
                    });
                    
                    // Força reset quando focus é perdido
                    elemento.addEventListener('blur', () => {
                        this._resetarEstadoBotao(elemento, botaoId);
                    });
                    
                    // Event listener para mouse hover
                    elemento.addEventListener('mouseenter', () => {
                        if (!elemento.disabled) {
                            elemento.classList.add('hover-ativo');
                        }
                    });
                } catch (error) {
                    console.error('❌ DEBUG: ERRO ao registrar listeners para:', botaoId, error);
                }
            } else {
                console.error('❌ DEBUG: Elemento não encontrado para:', botaoId);
            }
        });
        
        console.log('📊 DEBUG: Total de listeners registrados:', listenersRegistrados, 'de', this.botoesElementos.size);
    }idade de grupos (Encerrar, Navegação, CRUD)
 * Sistema de ativação por array ['S','N','S'] para cada grupo
 */

export class CriarBtnRodape {
    /**
     * Construtor da classe CriarBtnRodape
     * 
     * @param {Array<string>} grupoBotoes - Array com 'S' ou 'N' para cada grupo de botões
     *                                     Posição 0: grupoBtn01 (Encerrar)
     *                                     Posição 1: grupoBtn02 (Navegação) 
     *                                     Posição 2: grupoBtn03 (CRUD)
     *                                     Exemplo: ['S','N','S'] = Encerrar + CRUD
     * 
     * @throws {Error} Lança erro se grupoBotoes não for um array de 3 elementos
     * @throws {Error} Lança erro se algum elemento não for 'S' ou 'N'
     * 
     * @example
     * // Apenas botão Encerrar
     * const botoes = new CriarBtnRodape(['S','N','N']);
     * 
     * @example
     * // Todos os grupos
     * const botoes = new CriarBtnRodape(['S','S','S']);
     * 
     * @example
     * // Navegação + CRUD (sem Encerrar)
     * const botoes = new CriarBtnRodape(['N','S','S']);
     */
    constructor(grupoBotoes) {
        // Validação dos parâmetros
        this._validarParametros(grupoBotoes);
        
        // Propriedade principal
        this.grupoBotoes = grupoBotoes;
        
        // Classes CSS padrão
        this.cssClasses = {
            container: 'botoes-container',
            grupo: 'grupo-botoes',
            botao: 'btn-formulario'
        };
        
        // Maps para controle interno
        this.botoesElementos = new Map(); // Cache dos elementos DOM dos botões
        
        // Configuração inicial
        this._inicializar();
    }
    
    /**
     * Valida os parâmetros fornecidos ao construtor
     * 
     * @param {Array<string>} grupoBotoes - Array de controle dos grupos
     * 
     * @throws {Error} Se alguma validação falhar
     * 
     * @private
     */
    _validarParametros(grupoBotoes) {
        // Validação de grupoBotoes
        if (!Array.isArray(grupoBotoes) || grupoBotoes.length !== 3) {
            throw new Error('O parâmetro "grupoBotoes" deve ser um array com exatamente 3 elementos.');
        }
        
        if (!grupoBotoes.every(item => typeof item === 'string' && ['S', 'N'].includes(item))) {
            throw new Error('Todos os elementos de "grupoBotoes" devem ser "S" ou "N".');
        }
    }

    /**
     * Inicializa as configurações internas da classe
     * Prepara os Maps de controle
     * 
     * @private
     */
    _inicializar() {
        // Log de inicialização
        const gruposAtivos = this.grupoBotoes.map((status, index) => 
            status === 'S' ? `grupo${index + 1}` : null
        ).filter(Boolean);
        
        console.log(`CriarBtnRodape inicializada: Grupos ativos [${gruposAtivos.join(', ')}]`);
    }

    /**
     * Gera o HTML completo dos botões baseado nos grupos ativos
     * @returns {string} HTML completo dos botões
     */
    gerarHTML() {
        let html = `<div class="${this.cssClasses.container}">`;
        
        // Gera grupos na ordem: 3, 2, 1 (esquerda para direita)
        if (this.grupoBotoes[2] === 'S') { // Grupo 3 - CRUD
            html += this._criarGrupoBtn03();
        }
        
        if (this.grupoBotoes[1] === 'S') { // Grupo 2 - Navegação
            html += this._criarGrupoBtn02();
        }
        
        if (this.grupoBotoes[0] === 'S') { // Grupo 1 - Encerrar
            html += this._criarGrupoBtn01();
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Cria o HTML do Grupo 1 - Botão Encerrar
     * @returns {string} HTML do grupo 1
     * @private
     */
    _criarGrupoBtn01() {
        return `
            <div class="${this.cssClasses.grupo} grupo-btn01" data-grupo="grupoBtn01">
                <button id="btn_encerrar" class="${this.cssClasses.botao}" data-acao="encerrar" title="Encerrar formulário">
                    <img src="/framework_dsb/frontend/Assets/icon-sair.svg" alt="Encerrar">
                </button>
            </div>
        `;
    }

    /**
     * Cria o HTML do Grupo 2 - Botões de Navegação
     * @returns {string} HTML do grupo 2
     * @private
     */
    _criarGrupoBtn02() {
        return `
            <div class="${this.cssClasses.grupo} grupo-btn02" data-grupo="grupoBtn02">
                <button id="btn_primeiro" class="${this.cssClasses.botao}" data-acao="primeiro" title="Primeiro registro">
                    <img src="/framework_dsb/frontend/Assets/icon-primeiro.svg" alt="Primeiro">
                </button>
                <button id="btn_recua" class="${this.cssClasses.botao}" data-acao="recua" title="Registro anterior">
                    <img src="/framework_dsb/frontend/Assets/icon-anterior.svg" alt="Anterior">
                </button>
                <button id="btn_avanca" class="${this.cssClasses.botao}" data-acao="avanca" title="Próximo registro">
                    <img src="/framework_dsb/frontend/Assets/icon-proximo.svg" alt="Próximo">
                </button>
                <button id="btn_ultimo" class="${this.cssClasses.botao}" data-acao="ultimo" title="Último registro">
                    <img src="/framework_dsb/frontend/Assets/icon-ultimo.svg" alt="Último">
                </button>
            </div>
        `;
    }

    /**
     * Cria o HTML do Grupo 3 - Botões CRUD
     * @returns {string} HTML do grupo 3
     * @private
     */
    _criarGrupoBtn03() {
        return `
            <div class="${this.cssClasses.grupo} grupo-btn03" data-grupo="grupoBtn03">
                <button id="btn_editar" class="${this.cssClasses.botao}" data-acao="editar" title="Editar registro atual">
                    <img src="/framework_dsb/frontend/Assets/icon-editar.svg" alt="Editar">
                </button>
                <button id="btn_incluir" class="${this.cssClasses.botao}" data-acao="incluir" title="Incluir novo registro">
                    <img src="/framework_dsb/frontend/Assets/icon-incluir.svg" alt="Incluir">
                </button>
                <button id="btn_salvar" class="${this.cssClasses.botao}" data-acao="salvar" title="Salvar alterações">
                    <img src="/framework_dsb/frontend/Assets/icon-salvar.svg" alt="Salvar">
                </button>
                <button id="btn_deletar" class="${this.cssClasses.botao}" data-acao="deletar" title="Deletar registro atual">
                    <img src="/framework_dsb/frontend/Assets/icon-deletar.svg" alt="Deletar">
                </button>
            </div>
        `;
    }

    /**
     * Insere os botões em um container específico
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
        
        // Armazena referências dos elementos criados e registra event listeners
        this._mapearElementos();
    }

    /**
     * Mapeia os elementos botões criados no DOM e registra event listeners
     * @private
     */
    _mapearElementos() {
        console.log('🔍 DEBUG: this é:', this);
        console.log('🔍 DEBUG: this.botoesElementos é:', this.botoesElementos);
        
        // Lista de todos os possíveis botões
        const todosBotoes = [
            'btn_encerrar', 'btn_primeiro', 'btn_recua', 'btn_avanca', 
            'btn_ultimo', 'btn_editar', 'btn_incluir', 'btn_salvar', 'btn_deletar'
        ];
        
        todosBotoes.forEach(botaoId => {
            const elemento = document.getElementById(botaoId);
            if (elemento) {
                this.botoesElementos.set(botaoId, elemento);
            }
        });
        
        // Registra os event listeners após mapear todos os elementos
        this._registrarEventListeners();
    }

    /**
     * Registra os event listeners para todos os botões após inserção no DOM
     * Cada botão dispara evento 'botao-clicado' quando clicado
     * 
     * @private
     */
    _registrarEventListeners() {
        console.log('🔍 DEBUG: Iniciando _registrarEventListeners, Map tem:', this.botoesElementos.size, 'elementos');
        
        let listenersRegistrados = 0;
        
        this.botoesElementos.forEach((elemento, botaoId) => {
            if (elemento) {
                try {
                    console.log(`🔧 REAL: Registrando listener para botão: ${botaoId}`);
                    
                    // Event listener padrão para o botão
                    elemento.addEventListener('click', (event) => {
                        console.log(`🎯 Botão clicado: ${botaoId}`);
                        this._handleBotaoClick(botaoId, event);
                    });
                    
                    // TESTE: Verificar se o elemento é o correto
                    console.log(`� TESTE: Elemento ${botaoId}:`, {
                        id: elemento.id,
                        className: elemento.className,
                        tagName: elemento.tagName,
                        parentElement: elemento.parentElement,
                        isConnected: elemento.isConnected
                    });
                    
                    listenersRegistrados++;
                    console.log(`✅ REAL: Listener registrado para: ${botaoId}`);
                    
                    // Event listeners para mouse
                    elemento.addEventListener('mouseleave', () => {
                        this._resetarEstadoBotao(elemento, botaoId);
                    });
                    
                    elemento.addEventListener('blur', () => {
                        this._resetarEstadoBotao(elemento, botaoId);
                    });
                    
                    elemento.addEventListener('mouseenter', () => {
                        if (!elemento.disabled) {
                            elemento.classList.add('hover-ativo');
                        }
                    });
                    
                } catch (error) {
                    console.error('❌ DEBUG: ERRO ao registrar listeners para:', botaoId, error);
                }
            } else {
                console.error('❌ DEBUG: Elemento não encontrado para:', botaoId);
            }
        });
        
        console.log('📊 DEBUG: Total de listeners registrados:', listenersRegistrados, 'de', this.botoesElementos.size);
    }
    
    /**
     * Reseta o estado visual do botão para o padrão
     * Corrige problema do estado "travado"
     * 
     * @param {HTMLButtonElement} elemento - Elemento do botão
     * @param {string} botaoId - ID do botão
     * @private
     */
    _resetarEstadoBotao(elemento, botaoId) {
        if (!elemento || elemento.disabled) return;
        
        // Remove classes temporárias
        elemento.classList.remove('hover-ativo');
        
        // Força aplicação dos estilos padrão via JavaScript como fallback
        setTimeout(() => {
            if (!elemento.matches(':hover') && !elemento.matches(':focus')) {
                // Detecta qual grupo pertence para aplicar cor correta
                const grupoContainer = elemento.closest('[data-grupo]');
                const grupo = grupoContainer?.getAttribute('data-grupo');
                
                // ✅ PRESERVA o atributo title antes do reset (se houver reset de classes)
                const tituloOriginal = elemento.getAttribute('title');
                
                // Remove estilos inline que possam estar travados
                elemento.style.backgroundColor = '';
                elemento.style.color = '';
                elemento.style.borderColor = '';
                elemento.style.transform = '';
                elemento.style.boxShadow = '';
                
                // ✅ RESTAURA o atributo title se foi preservado
                if (tituloOriginal) {
                    elemento.setAttribute('title', tituloOriginal);
                }
                
                // Log para debug
                console.log(`🔄 Estado resetado para botão ${botaoId} do ${grupo}`);
            }
        }, 50);
    }

    /**
     * Handler interno para cliques em qualquer botão
     * Dispara evento customizado
     * 
     * @param {string} botaoId - ID do botão que foi clicado
     * @param {Event} event - Evento original de clique
     * @private
     */
    _handleBotaoClick(botaoId, event) {
        console.log('🎯🎯🎯 *** CLIQUE MANUAL DETECTADO! *** 🎯🎯🎯');
        console.log('📍 PROVA ABSOLUTA: _handleBotaoClick foi chamado!');
        console.log('🔍 Detalhes do clique:', { botaoId, event, target: event.target });
        
        // Impede o comportamento padrão (submit do formulário)
        event.preventDefault();
        
        console.log(`🚀 CRIARBTARODAPE: Clique detectado no botão!`, {
            botaoId,
            target: event.target,
            classList: event.target.classList.toString()
        });
        
        const acao = event.target.closest('button').getAttribute('data-acao');
        const grupo = event.target.closest('[data-grupo]')?.getAttribute('data-grupo');
        
        console.log(`🔘 CRIARBTARODAPE: Processando clique '${acao}' (ID: ${botaoId}, Grupo: ${grupo})`);
        
        // Dispara evento customizado que será capturado pelo sistema externo
        this._dispararEventoBotao(botaoId, acao, grupo);
    }

    /**
     * Dispara o evento customizado 'botao-clicado' 
     * Este evento será capturado pelo sistema externo (ex: ui_tabelas1.js)
     * 
     * @param {string} botaoId - ID do botão clicado
     * @param {string} acao - Ação do botão (data-acao)
     * @param {string} grupo - Grupo do botão
     * @private
     */
    _dispararEventoBotao(botaoId, acao, grupo) {
        // Busca o container principal dos botões para disparar o evento
        const container = document.querySelector(`.${this.cssClasses.container}`);
        
        console.log(`📡 CRIARBTARODAPE: Tentando disparar evento...`, {
            container: container ? 'ENCONTRADO' : 'NÃO ENCONTRADO',
            cssContainer: this.cssClasses.container,
            acao,
            botaoId,
            grupo
        });
        
        if (container) {
            // Cria evento customizado com dados necessários
            const eventoCustom = new CustomEvent('botao-clicado', {
                detail: {
                    botaoId: botaoId,
                    acao: acao,
                    grupo: grupo,
                    gruposAtivos: this.grupoBotoes
                },
                bubbles: true  // Permite que o evento suba na árvore DOM
            });
            
            // Dispara o evento no container com try-catch para capturar erros
            try {
                container.dispatchEvent(eventoCustom);
                console.log(`✅ CRIARBTARODAPE: Evento 'botao-clicado' disparado com sucesso para ação '${acao}'`);
            } catch (error) {
                console.error('❌ ERRO ao disparar evento botao-clicado:', error);
                console.error('Stack trace:', error.stack);
                console.error('Evento que causou erro:', eventoCustom);
            }
        } else {
            console.warn('❌ CRIARBTARODAPE: Container de botões não encontrado para disparar evento');
        }
    }

    /**
     * Obtém o elemento botão de um ID específico
     * @param {string} botaoId - ID do botão
     * @returns {HTMLButtonElement|null} Elemento botão ou null se não encontrado
     */
    obterElementoBotao(botaoId) {
        return this.botoesElementos.get(botaoId) || null;
    }

    /**
     * Habilita ou desabilita um botão específico
     * @param {string} botaoId - ID do botão
     * @param {boolean} habilitado - true para habilitar, false para desabilitar
     * @returns {boolean} true se operação bem-sucedida
     */
    habilitarBotao(botaoId, habilitado) {
        const elemento = this.obterElementoBotao(botaoId);
        if (elemento) {
            elemento.disabled = !habilitado;
            return true;
        }
        console.warn(`Botão '${botaoId}' não encontrado para habilitar/desabilitar.`);
        return false;
    }

    /**
     * Remove todos os event listeners (útil para cleanup)
     * Chama antes de destruir a instância
     */
    removerEventListeners() {
        this.botoesElementos.forEach((elemento, botaoId) => {
            if (elemento) {
                // Remove todos os listeners (clone e substitui o elemento)
                const novoElemento = elemento.cloneNode(true);
                elemento.parentNode.replaceChild(novoElemento, elemento);
                
                // Atualiza referência no Map
                this.botoesElementos.set(botaoId, novoElemento);
            }
        });
        
        console.log('🧹 Event listeners removidos de todos os botões');
    }
}
