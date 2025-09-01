/**
 * Classe base especializada para FormComum, FormModal e CriarTabelas
 * Concentra funcionalidades comuns: header, footer, posicionamento, validação
 */
export class FormularioBase {
    /**
     * Construtor da classe base para formulários posicionáveis
     * @param {string} titulo - Título do formulário
     * @param {Object} posicaoCanvas - Posição no canvas {x, y} em unidades responsivas (vw/vh)
     * @param {string} containerType - Tipo do container ('comum', 'modal', 'tabela')
     */
    constructor(titulo = '', posicaoCanvas = {x: 30, y: 2}, containerType = 'comum') {
        this.titulo = titulo;
        this.posicaoCanvas = posicaoCanvas;
        this.containerType = containerType;
        this.container = null;
        this.form = null;
        this.fields = [];
        this.buttons = [];
    }

    /**
     * Configura o container baseado no tipo (FormComum, FormModal ou CriarTabelas)
     */
    configurarContainer() {
        let containerId, formId;
        
        switch (this.containerType) {
            case 'comum':
                containerId = 'divFormCrud';
                formId = 'formCrud';
                break;
            case 'tabela':
                containerId = 'divFormTabela';
                formId = 'formTabela';
                break;
            case 'modal':
                containerId = 'divFormModal';
                formId = 'formModal';
                break;
            default:
                throw new Error(`Tipo de container '${this.containerType}' não suportado`);
        }
        
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
     * Gerencia header: título e descrição
     * @param {string} titulo - Título do formulário
     * @param {string} descricao - Descrição opcional
     */
    configurarHeader(titulo = null, descricao = null) {
        if (!this.form) return;
        
        // Aplica título
        const tituloAtual = titulo || this.titulo;
        if (tituloAtual) {
            const seletores = ['#formTitulo', '#tituloTabela', '#modalTitulo', 'h2']; // Flexível para diferentes layouts
            for (const seletor of seletores) {
                const elemento = this.form.querySelector(seletor);
                if (elemento) {
                    elemento.textContent = tituloAtual;
                    break;
                }
            }
        }
        
        // Aplica descrição se fornecida
        if (descricao) {
            const seletores = ['#formDescricao', '#descricaoTabela', '#modalDescricao', 'p'];
            for (const seletor of seletores) {
                const elemento = this.form.querySelector(seletor);
                if (elemento) {
                    elemento.textContent = descricao;
                    break;
                }
            }
        }
    }

    /**
     * Gerencia footer: altura mínima para cálculos, botões em divRodape
     */
    configurarFooter() {
        if (!this.form) return;
        
        const footer = this.form.querySelector('footer');
        if (footer) {
            // Footer com altura 0 mas disponível para uso futuro
            footer.style.height = '0px';
            footer.style.minHeight = '0px';
            footer.style.padding = '0';
            footer.style.margin = '0';
            footer.style.overflow = 'hidden';
            
            // Mas mantém estrutura para cálculos futuros
            footer.setAttribute('data-available', 'true');
            footer.setAttribute('data-original-height', '4vh'); // Altura quando ativado (responsiva)
        }
    }

    /**
     * Calcula altura máxima disponível para conteúdo (especialmente tabelas)
     * Considera: viewport - cabeçalho - rodapé global - footer do form (se ativo)
     */
    calcularAlturaMaximaConteudo() {
        const alturaViewport = window.innerHeight;
        const cabecalho = document.getElementById('divCabecalho');
        const rodapeGlobal = document.getElementById('divRodape');
        const footerForm = this.form?.querySelector('footer');
        
        let alturaUsada = 0;
        
        if (cabecalho) alturaUsada += cabecalho.offsetHeight;
        if (rodapeGlobal) alturaUsada += rodapeGlobal.offsetHeight;
        
        // Footer do formulário: considera altura original se estiver disponível
        if (footerForm) {
            const alturaOriginal = footerForm.getAttribute('data-original-height');
            if (alturaOriginal && footerForm.getAttribute('data-available') === 'true') {
                alturaUsada += parseInt(alturaOriginal) || 0;
            }
        }
        
        // Margem de segurança
        const margemSeguranca = 2; // 2vh de margem
        
        return Math.max(30, alturaViewport - alturaUsada - margemSeguranca); // Mínimo 30vh
    }

    /**
     * Ativa footer do formulário (para uso especial)
     * @param {boolean} ativar - true para ativar, false para desativar
     */
    ativarFooter(ativar = true) {
        const footer = this.form?.querySelector('footer');
        if (!footer) return;
        
        if (ativar) {
            footer.style.height = 'auto';
            footer.style.minHeight = footer.getAttribute('data-original-height') || '4vh';
            footer.style.padding = '1vh 1vw';
            footer.style.overflow = 'visible';
        } else {
            this.configurarFooter(); // Volta ao estado mínimo
        }
    }

    /**
     * Posiciona o formulário no canvas (divCorpo) usando coordenadas responsivas
     * @param {number} x - Posição horizontal em vw (viewport width)
     * @param {number} y - Posição vertical em vh (viewport height)
     */
    posicionarNoCanvas(x = null, y = null) {
        if (x !== null) this.posicaoCanvas.x = x;
        if (y !== null) this.posicaoCanvas.y = y;
        
        if (this.container) {
            this.container.style.position = 'absolute';
            this.container.style.left = this.posicaoCanvas.x + 'vw';
            this.container.style.top = this.posicaoCanvas.y + 'vh';
            this.container.style.zIndex = '5'; // Z-index baixo para ficar atrás do cabeçalho (z-index: 1000)
        }
    }

    /**
     * Exibe o formulário e o posiciona no canvas
     */
    exibir() {
        if (this.container) {
            this.container.classList.remove('hidden');
            this.posicionarNoCanvas();
        }
    }

    /**
     * 🚪 OCULTA O FORMULÁRIO (ENCERRAMENTO SEGURO)
     * 
     * Este método é usado para encerramento de formulários no sistema CRUD.
     * O formulário NÃO é destruído ou removido do DOM porque todo o sistema
     * usa a mesma infraestrutura HTML. Destruir o formulário destrói a aplicação.
     * 
     * ⚠️ IMPORTANTE: Não usar remove() - apenas ocultar com classe 'hidden'
     * ✅ SEGURO: Preserva estrutura HTML para reutilização
     * 🔄 REUTILIZAÇÃO: Permite substituição por outros formulários
     */
    ocultar() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    /**
     * Define o elemento do formulário
     */
    setForm(form) {
        this.form = form;
    }

    /**
     * Define o container do formulário
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * Adiciona um campo ao formulário
     */
    addField(field) {
        this.fields.push(field);
    }

    /**
     * Adiciona um botão ao formulário
     */
    addButton(button) {
        this.buttons.push(button);
    }

    /**
     * Renderização base: configura header, footer e posicionamento
     */
    render() {
        this.configurarContainer();
        this.configurarHeader();
        this.configurarFooter();
        
        // Comportamento específico por tipo
        if (this.containerType === 'modal') {
            // Modais não usam posicionamento canvas
            if (this.container) {
                this.container.classList.remove('hidden');
            }
        } else {
            // FormComum e CriarTabelas usam posicionamento canvas
            this.exibir();
        }
        
        console.log(`Renderizando ${this.containerType}:`, this.titulo);
    }
}
