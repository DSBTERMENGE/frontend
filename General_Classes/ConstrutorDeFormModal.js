/**
 * Classe FormModal - Formulário Modal Draggable
 * Herda de FormComum para reaproveitar TODA a lógica de campos
 * 
 * CARACTERÍSTICAS ESPECÍFICAS:
 * - Backdrop escurecido com z-index alto
 * - Centralização automática na tela
 * - Funcionalidade de arrastar (drag & drop)
 * - Botões no próprio footer (Encerrar + Submit)
 * - Tamanho adaptativo baseado nos campos
 * - NÃO usa selects
 * - NÃO usa rodapé global para botões
 */

import FormComum from './ConstrutorDeForms.js';

export class FormModal extends FormComum {
    /**
     * Cria um formulário modal draggable
     * @param {string} titulo - Título do modal
     * @param {Array<string>} tipo - Lista de tipos de campo
     * @param {Array<string>} label - Lista de rótulos dos campos
     * @param {Array<string>} nomeCampo - Lista de nomes/ids dos campos
     * @param {Array<string|null>} format - Lista de formatos
     * @param {Array<Object>} pos - Lista de posições dos campos ({linha, coluna})
     * @param {Array<string>} alinhamento - Lista de alinhamentos ('H'/'V')
     * @param {Array<string>} largCampos - Lista de larguras dos campos em rem
     * @param {Object} opcoes - Opções específicas do modal
     * @param {Array<string>} opcoes.botoesModal - ['Encerrar', 'Submit'] - textos dos botões
     * @param {Object} opcoes.estiloModal - Configurações visuais do modal
     */
    constructor(titulo = '', tipo = [], label = [], nomeCampo = [], format = [], pos = [], alinhamento = [], largCampos = [], opcoes = {}) {
        // Remove selects e configura botões específicos do modal
        const opcoesModal = {
            ...opcoes,
            grupoBotoes: ['N', 'N', 'N'], // Não usa botões do rodapé global
            selects: null // Modal não usa selects
        };
        
        // Chama construtor do FormComum (que já faz render())
        super(titulo, tipo, label, nomeCampo, format, pos, alinhamento, largCampos, {x: 50, y: 50}, opcoesModal);
        
        // Propriedades específicas do modal
        this.botoesModal = opcoes.botoesModal || ['Encerrar', 'Submit'];
        this.estiloModal = opcoes.estiloModal || {};
        
        // Estado do drag
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.backdrop = null;
        
        // Configurações do modal
        this._configurarComportamentoModal();
    }

    /**
     * OVERRIDE: Usa container modal específico
     */
    configurarContainer() {
        const containerId = 'divFormModal';
        const formId = 'formModal';
        
        const containerElement = document.getElementById(containerId);
        const formElement = document.getElementById(formId);
        
        if (!containerElement || !formElement) {
            throw new Error(`Container '${containerId}' ou form '${formId}' não encontrado no HTML`);
        }
        
        this.setContainer(containerElement);
        this.setForm(formElement);
        
        return { containerElement, formElement };
    }

    /**
     * Configura comportamento específico do modal
     * @private
     */
    _configurarComportamentoModal() {
        if (!this.container) return;
        
        // Cria backdrop
        this._criarBackdrop();
        
        // Configura z-index alto
        this.container.style.zIndex = '10000';
        this.container.style.position = 'fixed';
        
        // Centraliza o modal
        this._centralizarModal();
        
        // Habilita funcionalidade de arrastar
        this._habilitarDrag();
        
        // Configura botões no footer local
        this._configurarBotoesLocais();
        
        // 🛡️ Ativa monitoramento de campos obrigatórios
        this._monitorarCamposObrigatorios();
        
        // Inicialmente oculto
        this.ocultar();
        
        console.log('✅ FormModal configurado: backdrop + drag + botões locais + validação');
    }

    /**
     * Cria backdrop escurecido atrás do modal
     * @private
     */
    _criarBackdrop() {
        // Remove backdrop anterior se existir
        if (this.backdrop) {
            this.backdrop.remove();
        }
        
        this.backdrop = document.createElement('div');
        this.backdrop.id = 'modal-backdrop';
        this.backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: none;
        `;
        
        // Insere backdrop antes do container do modal
        document.body.insertBefore(this.backdrop, this.container);
        
        // Fecha modal ao clicar no backdrop
        this.backdrop.addEventListener('click', () => this._onEncerrar());
    }

    /**
     * Centraliza o modal na tela
     * @private
     */
    _centralizarModal() {
        if (!this.container) return;
        
        this.container.style.cssText += `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 90vw;
            max-height: 90vh;
            overflow: auto;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
    }

    /**
     * Habilita funcionalidade de arrastar o modal
     * @private
     */
    _habilitarDrag() {
        if (!this.form) return;
        
        const header = this.form.querySelector('header, h2, .modal-header, #modalTitulo');
        if (!header) return;
        
        // Cursor indica que é arrastável
        header.style.cursor = 'move';
        header.style.userSelect = 'none';
        
        // Eventos de drag
        header.addEventListener('mousedown', (e) => this._onMouseDown(e));
        document.addEventListener('mousemove', (e) => this._onMouseMove(e));
        document.addEventListener('mouseup', () => this._onMouseUp());
        
        console.log('✅ Drag habilitado no header do modal');
    }

    /**
     * Inicia o drag do modal
     * @param {MouseEvent} e - Evento do mouse
     * @private
     */
    _onMouseDown(e) {
        this.isDragging = true;
        
        const rect = this.container.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        e.preventDefault();
    }

    /**
     * Move o modal durante o drag
     * @param {MouseEvent} e - Evento do mouse
     * @private
     */
    _onMouseMove(e) {
        if (!this.isDragging) return;
        
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Limites da viewport
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;
        
        const finalX = Math.max(0, Math.min(x, maxX));
        const finalY = Math.max(0, Math.min(y, maxY));
        
        this.container.style.left = finalX + 'px';
        this.container.style.top = finalY + 'px';
        this.container.style.transform = 'none'; // Remove centralização automática
    }

    /**
     * Finaliza o drag do modal
     * @private
     */
    _onMouseUp() {
        this.isDragging = false;
    }

    /**
     * Configura botões específicos do modal no footer local
     * @private
     */
    _configurarBotoesLocais() {
        const footer = this.form?.querySelector('footer');
        if (!footer) return;
        
        // Mostra o footer (diferente do FormComum que oculta)
        footer.style.display = 'flex';
        footer.style.justifyContent = 'flex-end';
        footer.style.gap = '1rem';
        footer.style.padding = '1rem';
        footer.style.borderTop = '1px solid #ddd';
        footer.style.backgroundColor = '#f8f9fa';
        
        // Cria botões específicos do modal
        footer.innerHTML = `
            <button type="button" id="btnModalEncerrar" class="btn-modal btn-secondary">
                ${this.botoesModal[0]}
            </button>
            <button type="button" id="btnModalSubmit" class="btn-modal btn-primary">
                ${this.botoesModal[1]}
            </button>
        `;
        
        // Configura eventos dos botões
        const btnEncerrar = footer.querySelector('#btnModalEncerrar');
        const btnSubmit = footer.querySelector('#btnModalSubmit');
        
        if (btnEncerrar) {
            btnEncerrar.addEventListener('click', () => this._onEncerrar());
        }
        
        if (btnSubmit) {
            btnSubmit.addEventListener('click', () => this._onSubmit());
        }
        
        console.log('✅ Botões locais configurados no footer do modal');
    }

    /**
     * OVERRIDE: Remove botões do rodapé global (modal usa botões locais)
     */
    _criarBotoesRodape() {
        // Modal não usa botões no rodapé global
        console.log('🚫 Modal não usa botões no rodapé global');
    }

    /**
     * OVERRIDE: Não oculta footer local (modal usa footer para botões)
     */
    _ocultarFooterLocal() {
        // Modal mantém footer visível para os botões
        console.log('✅ Modal mantém footer local visível para botões');
    }

    /**
     * OVERRIDE: Remove selects (modal não usa selects)
     */
    _criarSelects() {
        // Modal não usa selects
        console.log('🚫 Modal não usa selects');
    }

    /**
     * Exibe o modal com backdrop
     */
    exibir() {
        if (this.backdrop) {
            this.backdrop.style.display = 'block';
        }
        
        super.exibir();
        
        // Recentra após exibir (caso o conteúdo tenha mudado)
        setTimeout(() => this._centralizarModal(), 10);
        
        console.log('✅ Modal exibido com backdrop');
    }

    /**
     * Oculta o modal e backdrop
     */
    ocultar() {
        if (this.backdrop) {
            this.backdrop.style.display = 'none';
        }
        
        super.ocultar();
        
        console.log('✅ Modal ocultado');
    }

    /**
     * Handler do botão Encerrar (fecha o modal)
     * @private
     */
    _onEncerrar() {
        console.log('🚪 Encerrando modal...');
        
        // Dispara evento customizado específico do modal
        this._dispararEventoCustomizadoModal('encerrar', {
            dados: this.obterDadosFormulario()
        });
        
        // Fecha o modal
        this.ocultar();
    }

    /**
     * Handler do botão Submit (processa dados do modal)
     * @private
     */
    _onSubmit() {
        console.log('✅ Submetendo dados do modal...');
        
        // 🛡️ VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
        const erros = this._validarCamposObrigatorios();
        
        if (erros.length > 0) {
            this._exibirErros(erros);
            return; // ← BLOQUEIA submit se houver erros
        }
        
        if (this.validarEDados()) {
            // Dispara evento customizado específico do modal
            this._dispararEventoCustomizadoModal('submit', {
                dados: this.obterDadosFormulario()
            });
        } else {
            console.warn('⚠️ Dados inválidos no modal');
        }
    }

    /**
     * Dispara evento customizado específico do modal
     * @param {string} acao - Ação do modal ('encerrar', 'submit')
     * @param {Object} detalhe - Dados do evento
     * @private
     */
    _dispararEventoCustomizadoModal(acao, detalhe) {
        // Eventos do modal são disparados no próprio container (não no rodapé global)
        if (this.container) {
            const eventoCustom = new CustomEvent('form-modal-acao', {
                detail: {
                    acao: acao,
                    instancia: this,
                    dados: detalhe.dados,
                    formTipo: 'FormModal'
                },
                bubbles: true
            });
            
            this.container.dispatchEvent(eventoCustom);
            
            console.log(`🎯 Evento 'form-modal-acao.${acao}' disparado`);
        }
    }

    /**
     * 🛡️ VALIDAÇÃO: Verifica campos obrigatórios do modal
     * 
     * Identifica campos marcados como obrigatórios (label termina com ' *')
     * e verifica se foram preenchidos.
     * 
     * @returns {Array<string>} Array com nomes dos campos não preenchidos
     * @private
     */
    _validarCamposObrigatorios() {
        const erros = [];
        
        // Identifica campos obrigatórios pelos labels que terminam com ' *'
        for (let i = 0; i < this.label.length; i++) {
            const label = this.label[i];
            const nomeCampo = this.nomeCampo[i];
            
            // Verifica se label termina com ' *' (campo obrigatório)
            if (label.endsWith(' *')) {
                const elemento = document.getElementById(nomeCampo);
                
                if (elemento) {
                    const valor = elemento.value?.trim();
                    
                    // Campo vazio ou com valor padrão "Selecione..."
                    if (!valor || valor === '' || valor === 'Selecione...') {
                        // Remove o ' *' do label para exibir na mensagem
                        const labelLimpo = label.replace(' *', '');
                        erros.push(labelLimpo);
                    }
                }
            }
        }
        
        return erros;
    }

    /**
     * 🎨 EXIBIÇÃO: Mostra erros de validação visualmente
     * 
     * Destaca campos com erro (borda vermelha) e exibe mensagem ao usuário.
     * 
     * @param {Array<string>} erros - Array com nomes dos campos com erro
     * @private
     */
    _exibirErros(erros) {
        console.warn('⚠️ Campos obrigatórios não preenchidos:', erros);
        
        // Remove destaques anteriores
        this.nomeCampo.forEach(nome => {
            const elemento = document.getElementById(nome);
            if (elemento) {
                elemento.style.borderColor = '';
                elemento.style.borderWidth = '';
                elemento.style.backgroundColor = '';
            }
        });
        
        // Destaca campos com erro
        erros.forEach(labelErro => {
            // Encontra o índice do campo pelo label
            const indice = this.label.findIndex(l => l.replace(' *', '') === labelErro);
            
            if (indice !== -1) {
                const nomeCampo = this.nomeCampo[indice];
                const elemento = document.getElementById(nomeCampo);
                
                if (elemento) {
                    elemento.style.borderColor = '#dc3545'; // Vermelho Bootstrap
                    elemento.style.borderWidth = '2px';
                    elemento.style.borderStyle = 'solid';
                    elemento.style.backgroundColor = '#fff5f5'; // Fundo vermelho claro
                }
            }
        });
        
        // Mensagem amigável
        const mensagem = `⚠️ Campos obrigatórios não preenchidos:\n\n${erros.join('\n')}`;
        alert(mensagem);
        
        // Remove destaques após 3 segundos
        setTimeout(() => {
            this.nomeCampo.forEach(nome => {
                const elemento = document.getElementById(nome);
                if (elemento) {
                    elemento.style.backgroundColor = '';
                }
            });
        }, 3000);
    }

    /**
     * 🔄 ATUALIZAÇÃO: Monitora mudanças nos campos para habilitar/desabilitar botão Submit
     * 
     * Deve ser chamado após renderização para ativar monitoramento em tempo real.
     * 
     * @private
     */
    _monitorarCamposObrigatorios() {
        // Aguarda renderização completa
        setTimeout(() => {
            const btnSubmit = document.getElementById('btnModalSubmit');
            if (!btnSubmit) return;
            
            // Atualiza estado inicial
            this._atualizarEstadoBotaoSubmit();
            
            // Observa mudanças em todos os campos
            this.nomeCampo.forEach(nome => {
                const elemento = document.getElementById(nome);
                if (elemento) {
                    elemento.addEventListener('change', () => this._atualizarEstadoBotaoSubmit());
                    elemento.addEventListener('input', () => this._atualizarEstadoBotaoSubmit());
                }
            });
            
            console.log('✅ Monitoramento de campos obrigatórios ativado');
        }, 100);
    }

    /**
     * 🎯 ESTADO DO BOTÃO: Habilita/desabilita botão Submit baseado em campos obrigatórios
     * @private
     */
    _atualizarEstadoBotaoSubmit() {
        const btnSubmit = document.getElementById('btnModalSubmit');
        if (!btnSubmit) return;
        
        const erros = this._validarCamposObrigatorios();
        
        if (erros.length === 0) {
            btnSubmit.disabled = false;
            btnSubmit.style.opacity = '1';
            btnSubmit.style.cursor = 'pointer';
            btnSubmit.title = 'Confirmar seleção';
        } else {
            btnSubmit.disabled = true;
            btnSubmit.style.opacity = '0.5';
            btnSubmit.style.cursor = 'not-allowed';
            btnSubmit.title = `Preencha os campos obrigatórios: ${erros.join(', ')}`;
        }
    }

    /**
     * OVERRIDE: Não configura eventos de botões do rodapé (usa botões locais)
     */
    _configurarEventosBotoes() {
        // Modal usa botões locais, não do rodapé
        console.log('✅ Modal usa eventos de botões locais');
    }

    /**
     * OVERRIDE: Dispara eventos no container do modal (não no rodapé global)
     */
    _dispararEventoCustomizado(acao, detalhe) {
        // Redireciona para método específico do modal
        this._dispararEventoCustomizadoModal(acao, detalhe);
    }

    /**
     * OVERRIDE: Renderização específica do modal
     */
    render() {
        // Configuração específica do modal
        this.configurarContainer();
        
        // Aplica título
        this.configurarHeader(this.titulo);
        
        // Cria e posiciona os campos (herda do FormComum)
        this._criarDivsCampos();
        this._posicionarDivs();
        
        // Configura comportamento específico do modal
        this._configurarComportamentoModal();
        
        console.log('✅ FormModal renderizado com sucesso');
    }

    /**
     * Remove o modal e backdrop do DOM
     */
    destruir() {
        if (this.backdrop) {
            this.backdrop.remove();
            this.backdrop = null;
        }
        
        this.ocultar();
        
        console.log('✅ Modal destruído');
    }

    // ============= MÉTODOS PÚBLICOS ESPECÍFICOS DO MODAL =============

    /**
     * Recentra o modal na tela
     */
    recentralizar() {
        this._centralizarModal();
        console.log('✅ Modal recentralizado');
    }

    /**
     * Define novos textos para os botões
     * @param {Array<string>} novosBotoes - ['Texto Encerrar', 'Texto Submit']
     */
    redefinirBotoes(novosBotoes) {
        this.botoesModal = novosBotoes;
        this._configurarBotoesLocais();
        console.log('✅ Botões do modal redefinidos:', novosBotoes);
    }

    /**
     * Verifica se o modal está visível
     * @returns {boolean} True se visível
     */
    estaVisivel() {
        return this.backdrop && this.backdrop.style.display === 'block';
    }

    /**
     * Define título do modal dinamicamente
     * @param {string} novoTitulo - Novo título
     */
    redefinirTitulo(novoTitulo) {
        this.titulo = novoTitulo;
        this.configurarHeader(novoTitulo);
        console.log('✅ Título do modal redefinido:', novoTitulo);
    }
}

export default FormModal;
