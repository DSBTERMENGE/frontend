/**
 * FeedbackOperacao.js
 * Classe para exibir feedback visual durante operações longas
 * - Barra de progresso com contador
 * - Overlay para bloquear interação
 * - Atualização automática de percentual
 */

class FeedbackOperacao {
    constructor() {
        this.overlay = null;
        this.container = null;
        this.barraProgresso = null;
        this.textoProgresso = null;
        this.total = 0;
        this.atual = 0;
    }

    /**
     * Inicia o feedback de progresso
     * @param {number} total - Total de registros a processar
     * @param {string} mensagem - Mensagem a exibir (ex: "Reagendando despesas")
     */
    iniciar(total, mensagem = "Processando") {
        this.total = total;
        this.atual = 0;

        // Criar overlay escuro
        this.overlay = document.createElement('div');
        this.overlay.className = 'feedback-overlay';
        
        // Criar container do feedback
        this.container = document.createElement('div');
        this.container.className = 'feedback-container';
        
        // Título/Mensagem
        const titulo = document.createElement('div');
        titulo.className = 'feedback-titulo';
        titulo.textContent = mensagem;
        
        // Container da barra
        const barraContainer = document.createElement('div');
        barraContainer.className = 'feedback-barra-container';
        
        // Barra de progresso
        this.barraProgresso = document.createElement('div');
        this.barraProgresso.className = 'feedback-barra-progresso';
        this.barraProgresso.style.width = '0%';
        
        barraContainer.appendChild(this.barraProgresso);
        
        // Texto do progresso
        this.textoProgresso = document.createElement('div');
        this.textoProgresso.className = 'feedback-texto';
        this.textoProgresso.textContent = `0 / ${total} registros (0%)`;
        
        // Montar estrutura
        this.container.appendChild(titulo);
        this.container.appendChild(barraContainer);
        this.container.appendChild(this.textoProgresso);
        this.overlay.appendChild(this.container);
        
        // Adicionar ao body
        document.body.appendChild(this.overlay);
    }

    /**
     * Atualiza o progresso (incrementa 1)
     */
    atualizar() {
        this.atual++;
        this._renderizar();
    }

    /**
     * Define o progresso atual manualmente
     * @param {number} atual - Número atual de registros processados
     */
    definir(atual) {
        this.atual = atual;
        this._renderizar();
    }

    /**
     * Renderiza o estado atual da barra
     */
    _renderizar() {
        if (!this.barraProgresso || !this.textoProgresso) return;

        const percentual = this.total > 0 ? Math.round((this.atual / this.total) * 100) : 0;
        
        // Atualizar barra
        this.barraProgresso.style.width = `${percentual}%`;
        
        // Atualizar texto
        this.textoProgresso.textContent = `${this.atual} / ${this.total} registros (${percentual}%)`;
    }

    /**
     * Finaliza e remove o feedback
     * @param {number} delay - Delay em ms antes de remover (padrão: 500ms)
     */
    finalizar(delay = 500) {
        if (!this.overlay) return;

        // Garantir que mostra 100%
        this.atual = this.total;
        this._renderizar();

        // Remover após delay
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
            this.container = null;
            this.barraProgresso = null;
            this.textoProgresso = null;
        }, delay);
    }

    /**
     * Remove imediatamente sem delay
     */
    remover() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
        this.container = null;
        this.barraProgresso = null;
        this.textoProgresso = null;
    }
}

// Exportar para uso global
window.FeedbackOperacao = FeedbackOperacao;
