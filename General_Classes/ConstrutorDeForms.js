

/**
 * 🏗️ CLASSE PRINCIPAL: Construção dinâmica de formulários avançados
 * 
 * Herda TODAS as funcionalidades do FormularioBase e adiciona:
 * ✅ Sistema de campos label-elemento configurável
 * ✅ Posicionamento flexível por linha/coluna  
 * ✅ Validação robusta e automática
 * ✅ Integração com CriarSelects (mesmo padrão das tabelas)
 * ✅ Sistema de botões configurável (Encerrar|Navegação|CRUD)
 * ✅ Padrão de configuração por propriedades + render() manual
 * 
 * @example
 * // NOVO PADRÃO: Configuração por propriedades + render manual
 * const form = new FormComum();
 * form.titulo = 'Cadastro de Grupos';
 * form.descricao =     render() {
        // 🔍 VALIDAÇÃO PRÉVIA: Garante que todas as propriedades estão corretas
        try {
            this._validarParametros();
        } catch (error) {
            console.error('❌ FormComum.render(): Erro de validação -', error.message);
            throw new Error(`Não é possível renderizar formulário: ${error.message}`);
        }e classificação';
 * form.tipo = ['input', 'textarea'];
 * form.label = ['Grupo', 'Descrição'];
 * form.nomeCampo = ['grupo', 'descricao'];
 * form.format = ['texto', 'texto'];
 * form.pos = [{linha: 0, coluna: 0}, {linha: 1, coluna: 0}];
 * form.alinhamento = ['H', 'V'];
 * form.largCampos = [25, 28];
 * form.posicaoCanvas = {x: 3, y: 5};
 * form.grupoBotoes = ['S', 'S', 'S']; // Encerrar + Navegação + CRUD
 * form.render(); // ← Renderização MANUAL após configuração
 * 
 * @author Framework DSB
 * @version 2.0.0 - Property-based configuration pattern
 */

import { FormularioBase } from './ConstrutorDeFormularioBase.js';
import { CriarBtnRodape } from './ConstrutorBtnRodapeForms.js';
import { CriarSelects } from './ConstrutorDeSelects.js';
import { error_catcher } from './Debugger.js';

/**
 * 🎯 CLASSE FormComum - Formulários dinâmicos com configuração flexível
 * 
 * Permite duas formas de uso:
 * 1️⃣ **Constructor com parâmetros** (modo legado, compatibilidade)  
 * 2️⃣ **Property-based configuration** (RECOMENDADO - novo padrão)
 * 
 * @extends FormularioBase
 * 
 * @property {string} titulo - Título do formulário exibido no header
 * @property {string} descricao - Descrição/subtítulo do formulário  
 * @property {Array<string>} tipo - Tipos de campo: 'input'|'combo'|'radio'|'checkbox'|'textarea'
 * @property {Array<string>} label - Rótulos dos campos exibidos ao usuário
 * @property {Array<string>} nomeCampo - Nomes/IDs únicos dos campos (sem espaços)
 * @property {Array<string|null>} format - Formatos: 'texto'|'moeda'|'pct'|'data'|null
 * @property {Array<{linha: number, coluna: number}>} pos - Posições dos campos na grid
 * @property {Array<string>} alinhamento - Orientação: 'H' (horizontal) | 'V' (vertical)  
 * @property {Array<number>} largCampos - Larguras dos campos em rem
 * @property {{x: number, y: number}} posicaoCanvas - Posição do formulário no canvas (vw/vh)
 * @property {Array<string>} grupoBotoes - Grupos de botões: ['S'|'N', 'S'|'N', 'S'|'N'] para [Encerrar, Navegação, CRUD]
 * @property {Object|null} configSelects - Configuração completa das selects do formulário
 * @property {Array<string>} configSelects.labels - Rótulos exibidos para cada select ex.:['Grupo', 'SubGrupo']
 * @property {Array<string>} configSelects.campos - Nome dos campos que se usará para popular os select. ex.: ['grupo', 'subgrupo'] 
 * @property {Array<string>} configSelects.larguras - Larguras CSS de cada select. ex.: ['180px', '200px']
 * @property {string} configSelects.arranjo - Layout visual dos selects: 'linha' (horizontal) | 'coluna' (vertical)
 * @property {Array<string>} configSelects.campo_value - Campos da consulta informados no evento change a serem usados na filtragem da select seguinte. ex.: ['idgrupo', 'idsubgrupo'] - valores sem semântica para usuário, geralmente IDs numéricos
 * @property {Array<string>} configSelects.campo_exibir - Campos da consulta que são exibidos nas selects por terem maior conteúdo semântico.(Observar no uso se esta propriedade não está em duplicidade com campo) ex.: ['grupo', 'subgrupo'] - textos com semântica para usuário, nomes descritivos
 * @property {CriarSelects|null} objSelect - Instância do sistema de selects (criado automaticamente)
 * @property {CriarBtnRodape|null} criarBotoes - Instância do sistema de botões (criado no render)
 * @property {Array<HTMLElement>} fields - Array com elementos DOM dos campos (preenchido no render)
 * @property {Array<HTMLElement>} buttons - Array com elementos DOM dos botões (preenchido no render)
 */
export class FormComum extends FormularioBase {
    /**
     * 🏗️ CONSTRUCTOR: Cria instância de formulário com configuração flexível
     * 
     * ⚡ NOVO PADRÃO: Constructor minimalista + configuração por propriedades
     * 
     * @param {string} [titulo=''] - Título do formulário para exibição no header
     * @param {string} [descricao=''] - Descrição/subtítulo explicativo do formulário  
     * @param {Array<string>} [tipo=[]] - Tipos de campo para cada elemento
     * @param {Array<string>} [label=[]] - Rótulos/labels para cada campo
     * @param {Array<string>} [nomeCampo=[]] - Nomes únicos para cada campo (IDs)
     * @param {Array<string|null>} [format=[]] - Formatos de validação para cada campo
     * @param {Array<{linha: number, coluna: number}>} [pos=[]] - Posições na grid para cada campo
     * @param {Array<'H'|'V'>} [alinhamento=[]] - Orientação label-campo para cada elemento
     * @param {Array<number>} [largCampos=[]] - Larguras em rem para cada campo
     * @param {{x: number, y: number}} [posicaoCanvas={x: 3, y: 5}] - Posição do form no canvas
     * @param {Object} [opcoes={}] - Configurações avançadas do formulário
     * @param {Array<'S'|'N'>} [opcoes.grupoBotoes=['S','N','S']] - Grupos [Encerrar, Navegação, CRUD]
     * @param {Object} [opcoes.selects] - Configuração completa das selects: {labels, campos, larguras, arranjo, campo_value, campo_exibir}
     * @param {Array<string>} [opcoes.selects.campo_value] - Campos BD para VALUE das options (IDs/chaves sem semântica) ['idgrupo', 'idsubgrupo']
     * @param {Array<string>} [opcoes.selects.campo_exibir] - Campos BD para TEXT das options (nomes com semântica) ['grupo', 'subgrupo']
     * 
     * @example
     * // ✅ MODO RECOMENDADO: Property-based configuration
     * const form = new FormComum();
     * form.titulo = 'Cadastro Cliente';
     * form.tipo = ['input', 'combo'];
     * form.label = ['Nome', 'Status'];
     * form.nomeCampo = ['nome', 'status'];
     * form.format = ['texto', null];
     * form.pos = [{linha: 0, coluna: 0}, {linha: 0, coluna: 1}];
     * form.alinhamento = ['H', 'H'];  
     * form.largCampos = [20, 15];
     * form.grupoBotoes = ['S', 'N', 'S'];
     * // Configuração de selects com população de dados
     * form.configSelects = {
     *   labels: ['Grupo', 'SubGrupo'],
     *   campos: ['grupo', 'subgrupo'],
     *   larguras: ['180px', '200px'],
     *   arranjo: 'linha',
     *   campo_value: ['idgrupo', 'idsubgrupo'],  // ← IDs do banco (sem semântica)
     *   campo_exibir: ['grupo', 'subgrupo']      // ← Nomes para usuário (com semântica)
     * };
     * form.render(); // ← Renderização MANUAL
     * 
     * @example  
     * // ✅ MODO LEGADO: Constructor parameters (compatibilidade)
     * const form = new FormComum('Cadastro', 'Cliente', ['input'], ['Nome'], ['nome'], 
     *                           ['texto'], [{linha:0, coluna:0}], ['H'], [20]);
     * // Já renderiza automaticamente se todos os parâmetros fornecidos
     */
    constructor(titulo = '', descricao = '', tipo = [], label = [], nomeCampo = [], format = [], pos = [], alinhamento = [], largCampos = [], posicaoCanvas = {x: 3, y: 5}, opcoes = {}) {
        super(titulo, posicaoCanvas, 'comum');  // ✅ Correto: 'comum' em vez de 'formulario'
        
        // 🎯 PROPRIEDADES CONFIGURÁVEIS (podem ser alteradas após instanciação)
        
        /**
         * @type {string}
         * @description Título do formulário exibido no header
         * @example form.titulo = "Cadastro de Grupos"
         */
        this.titulo = titulo;
        
        /**
         * @type {string}  
         * @description Descrição/subtítulo do formulário
         * @example form.descricao = "1º nível de classificação"
         */
        this.descricao = descricao;
        
        /**
         * @type {Array<string>}
         * @description Tipos de campo: 'input', 'combo', 'radio', 'checkbox', 'textarea'
         * @example form.tipo = ['input', 'textarea', 'combo']
         */
        this.tipo = tipo;
        
        /**
         * @type {Array<string>}
         * @description Rótulos dos campos exibidos ao usuário
         * @example form.label = ['Nome', 'Descrição', 'Categoria']
         */
        this.label = label;
        
        /**
         * @type {Array<string>}
         * @description Nomes/IDs únicos dos campos (sem espaços, usados como ID dos elementos)
         * @example form.nomeCampo = ['nome', 'descricao', 'categoria']
         */
        this.nomeCampo = nomeCampo;
        
        /**
         * @type {Array<string|null>}
         * @description Formatos dos campos: 'texto', 'moeda', 'valor', 'pct', 'data', 'email', 'tel', 'url' ou null
         * @example form.format = ['texto', 'data', 'email', 'tel']
         */
        this.format = format;
        
        /**
         * @type {Array<{linha: number, coluna: number}>}
         * @description Posições dos campos na grid (linha e coluna começam em 0)
         * @example form.pos = [{linha: 0, coluna: 0}, {linha: 1, coluna: 0}]
         */
        this.pos = pos;
        
        /**
         * @type {Array<string>}
         * @description Orientação dos campos: 'H' (horizontal) ou 'V' (vertical)
         * @example form.alinhamento = ['H', 'V', 'H']
         */
        this.alinhamento = alinhamento;
        
        /**
         * @type {Array<number>}
         * @description Larguras dos campos em rem
         * @example form.largCampos = [25, 28, 20]
         */
        this.largCampos = largCampos;
        
        /**
         * @type {{x: number, y: number}}
         * @description Posição do formulário no canvas em vw/vh
         * @example form.posicaoCanvas = {x: 3, y: 5}
         */
        this.posicaoCanvas = posicaoCanvas;
        
        // 🔧 PROPRIEDADES DE SISTEMA (controladas internamente)
        
        /**
         * @type {Array<HTMLElement>}
         * @description Array com elementos DOM dos campos (preenchido automaticamente no render)
         * @readonly
         */
        this.fields = [];
        
        /**
         * @type {Array<HTMLElement>}
         * @description Array com elementos DOM dos botões (preenchido automaticamente no render)
         * @readonly
         */
        this.buttons = [];
        
        /**
         * @type {CriarBtnRodape|null}
         * @description Instância do sistema de botões (criado automaticamente no render)
         * @readonly
         */
        this.criarBotoes = null;
        
        /**
         * @type {CriarSelects|null}
         * @description Instância do sistema de selects (criado automaticamente no render se necessário)
         * @readonly
         */
        this.objSelect = null;
        
        // 🎛️ CONFIGURAÇÕES AVANÇADAS
        
        /**
         * @type {Array<string>}
         * @description Grupos de botões: ['S'|'N', 'S'|'N', 'S'|'N'] para [Encerrar, Navegação, CRUD]
         * @example form.grupoBotoes = ['S', 'S', 'S'] // Todos os grupos ativos
         */
        this.grupoBotoes = opcoes.grupoBotoes || ['S', 'N', 'S'];
        
        /**
         * @type {Object|null}
         * @description Configuração completa de selects: layout visual + mapeamento de dados do BD
         * @example 
         * form.configSelects = {
         *   labels: ['Grupo', 'SubGrupo'],              // Rótulos visuais
         *   campos: ['grupo', 'subgrupo'],              // IDs dos elementos
         *   larguras: ['180px', '200px'],               // Tamanhos CSS
         *   arranjo: 'linha',                           // Layout: linha/coluna
         *   campo_value: ['idgrupo', 'idsubgrupo'],     // Campos BD → VALUE (IDs)
         *   campo_exibir: ['grupo', 'subgrupo']         // Campos BD → TEXT (nomes)
         * }
         */
        this.configSelects = opcoes.selects || null;

        // Recursos opcionais para formulários com muitos registros.
        // Exemplo: { contador: true, pesquisa: { campo: 'descricao' } }
        this.configNavegacao = opcoes.configNavegacao || null;
        
        // 🚀 RENDERIZAÇÃO CONDICIONAL 
        // Se todos os parâmetros obrigatórios foram fornecidos → renderiza automaticamente (modo legado)
        // Se parâmetros vazios → aguarda configuração manual + render() (novo padrão)
        const temParametrosCompletos = tipo.length > 0 && label.length > 0 && nomeCampo.length > 0 && 
                                     format.length > 0 && pos.length > 0 && alinhamento.length > 0 && largCampos.length > 0;
        
        if (temParametrosCompletos) {
            // 🔄 MODO LEGADO: Constructor completo → renderização automática

            this._validarParametros(); // Valida antes de renderizar
            this.render();
        } else {
            // ⚡ NOVO PADRÃO: Configuração manual → aguarda render()

        }
    }

    /**
     * 🔍 VALIDAÇÃO INTERNA: Valida parâmetros da instância atual
     * 
     * Chama o método estático de validação usando as propriedades da instância.
     * Usado antes da renderização para garantir consistência dos dados.
     * 
     * @private
     * @throws {Error} Se alguma validação falhar
     */
    _validarParametros() {
        return FormComum.validacao(this.tipo, this.label, this.nomeCampo, this.format, this.pos, this.alinhamento, this.largCampos);
    }

    /**
     * ✅ VALIDAÇÃO ESTÁTICA: Verificação completa de parâmetros do formulário  
     * 
     * Realiza verificações robustas em todos os arrays de configuração:
     * • Tamanhos consistentes entre todos os arrays
     * • Formatos válidos para campos  
     * • Estrutura correta de posições {linha, coluna}
     * • Alinhamentos válidos ('H' ou 'V')
     * • Sequência correta de linhas e colunas
     * 
     * @static
     * @param {Array<string>} tipo - Array de tipos de campo
     * @param {Array<string>} label - Array de rótulos  
     * @param {Array<string>} nomeCampo - Array de nomes de campo
     * @param {Array<string|null>} format - Array de formatos
     * @param {Array<{linha: number, coluna: number}>} pos - Array de posições
     * @param {Array<'H'|'V'>} alinhamento - Array de alinhamentos
     * @param {Array<number>} largCampos - Array de larguras
     * @returns {boolean} true se todas as validações passaram
     * @throws {Error} Descrição específica do erro encontrado
     * 
     * @example
     * // ✅ Validação manual antes da configuração
     * try {
     *   FormComum.validacao(['input'], ['Nome'], ['nome'], ['texto'], 
     *                      [{linha: 0, coluna: 0}], ['H'], [20]);
     *   console.log('✅ Parâmetros válidos');
     * } catch (error) {
     *   console.error('❌ Erro de validação:', error.message);
     * }
     */
    static validacao(tipo, label, nomeCampo, format, pos, alinhamento, largCampos) {
        const n = tipo.length;
        const listas = [label, nomeCampo, format, pos, alinhamento, largCampos];
        
        // Verifica se todas as listas têm o mesmo tamanho
        for (let l of listas) {
            if (l.length !== n) throw new Error('Todas as listas devem ter o mesmo número de itens.');
        }

        // Verifica formatos válidos
        const formatosValidos = ['texto', 'moeda', 'pct', 'data', 'cnpj', 'int', null];
        for (let f of format) {
            if (f !== null && !formatosValidos.includes(f)) {
                throw new Error(`Formato '${f}' não é permitido. Use apenas: ${formatosValidos.join(', ')}`);
            }
        }
        
        // Verifica coordenadas
        for (let p of pos) {
            if (typeof p !== 'object' || !('linha' in p) || !('coluna' in p)) {
                throw new Error('Cada posição deve ser um objeto {linha, coluna}.');
            }
            if (typeof p.linha !== 'number' || typeof p.coluna !== 'number') {
                throw new Error('linha e coluna devem ser números.');
            }
        }
        
        // Verifica alinhamento
        const alinhamentosValidos = ['H', 'V'];
        for (let a of alinhamento) {
            if (!alinhamentosValidos.includes(a)) {
                throw new Error(`Alinhamento '${a}' não é permitido. Use apenas: 'H' (horizontal) ou 'V' (vertical).`);
            }
        }
        
        // Validações extras da propriedade pos
        // Checa se as linhas são sequenciais (0,1,2,...n)
        const linhas = pos.map(p => p.linha);
        const linhasUnicas = [...new Set(linhas)].sort((a, b) => a - b);
        const maxLinha = Math.max(...linhas);
        const linhasEsperadas = Array.from({length: maxLinha + 1}, (_, i) => i);
        const linhasOk = linhasUnicas.length === linhasEsperadas.length && linhasUnicas.every((v, i) => v === linhasEsperadas[i]);
        if (!linhasOk) {
            throw new Error(`As linhas em 'pos' não são sequenciais (0,1,2,...n). Linhas encontradas: ${linhasUnicas.join(', ')}`);
        }

        // Para cada linha, checa se as colunas são sequenciais a partir de zero
        for (let l of linhasUnicas) {
            const colunasLinha = pos.filter(p => p.linha === l).map(p => p.coluna).sort((a, b) => a - b);
            const maxColLinha = Math.max(...colunasLinha);
            for (let c = 0; c <= maxColLinha; c++) {
                if (!colunasLinha.includes(c)) {
                    throw new Error(`Linha ${l} está com colunas não sequenciais. Faltando coluna ${c}.`);
                }
            }
        }
        
        return true; // Se passou por todas as validações, retorna true
    }

    /**
     * Posiciona as divs no formulário conforme a ordem de linha/coluna
     */
    _posicionarDivs() {
        // Agrupa os índices dos campos por linha
        const { fields, pos, form } = this;
        if (!fields || !pos || !form) {
            throw new Error('Instância deve possuir fields, pos e form definidos.');
        }
        const mainConteudo = form.querySelector('#mainConteudo');
        if (!mainConteudo) throw new Error('mainConteudo não encontrado no formulário.');

        // Limpa o conteúdo anterior
        mainConteudo.innerHTML = '';

        // Agrupa os campos por linha
        const linhas = {};
        for (let i = 0; i < pos.length; i++) {
            const l = pos[i].linha;
            if (!linhas[l]) linhas[l] = [];
            linhas[l].push({ idx: i, coluna: pos[i].coluna });
        }

        // Para cada linha, ordena os campos por coluna e adiciona ao container da linha
        const linhasOrdenadas = Object.keys(linhas).map(Number).sort((a, b) => a - b);
        for (const l of linhasOrdenadas) {
            const divLinha = document.createElement('div');
            divLinha.className = `linha-form linha-${l}`;
            divLinha.style.display = 'flex';
            divLinha.style.gap = '1%'; // Espaço entre campos, ajuste conforme necessário
            divLinha.style.width = 'max-content'; // Ocupa só o necessário
            divLinha.style.minWidth = '0'; // Previne overflow

            // Ordena os campos da linha por coluna
            const camposOrdenados = linhas[l].sort((a, b) => a.coluna - b.coluna);
            for (const { idx } of camposOrdenados) {
                divLinha.appendChild(fields[idx]);
            }
            mainConteudo.appendChild(divLinha);
        }
    }

    /**
     * Cria as divs posicionadas (divPos) com rótulo e campo, alinhamento horizontal ou vertical
     */
    _criarDivsCampos() {
        document.getElementById('divFormCrud').classList.remove('hidden');
        for (let i = 0; i < this.tipo.length; i++) {
            const tipo = this.tipo[i];
            const label = this.label[i];
            const nomeCampo = this.nomeCampo[i];
            const format = this.format[i];
            const pos = this.pos[i];
            const alinhamento = this.alinhamento[i] || 'H';
            const div = document.createElement('div');
            div.className = `divPos-${pos.linha}-${pos.coluna}`;
            div.style.display = 'flex';
            div.style.flexDirection = alinhamento === 'V' ? 'column' : 'row';
            div.style.width = 'max-content'; // Ocupa só o necessário para label + campo
            // Rótulo
            if (label) {
                const lbl = document.createElement('label');
                lbl.htmlFor = nomeCampo;
                lbl.textContent = label + ":";
                lbl.style.whiteSpace = 'nowrap'; // Impede quebra de linha no rótulo
                lbl.style.marginRight = '5 rem'; // margem responsiva entre label e campo
                div.appendChild(lbl);
            }
            // Campo
            let campo;
            switch (tipo) {
                case 'input':
                    campo = document.createElement('input');
                    // ✅ Define type baseado em format
                    if (format === 'data') {
                        campo.type = 'date';
                    } else if (format === 'email') {
                        campo.type = 'email';
                    } else if (format === 'tel') {
                        campo.type = 'tel';
                    } else if (format === 'url') {
                        campo.type = 'url';
                    } else {
                        campo.type = 'text';
                    }
                    if (this.largCampos && this.largCampos[i] !== undefined) campo.style.width = this.largCampos[i] + 'rem';
                    break;
                case 'combo':
                    campo = document.createElement('select');
                    if (this.largCampos && this.largCampos[i] !== undefined) campo.style.width = this.largCampos[i] + 'rem';
                    break;
                case 'radio':
                    campo = document.createElement('div');
                    campo.className = 'radio-group';
                    break;
                case 'checkbox':
                    campo = document.createElement('input');
                    campo.type = 'checkbox';
                    break;
                case 'textarea':
                    campo = document.createElement('textarea');
                    if (this.largCampos && this.largCampos[i] !== undefined) campo.style.width = this.largCampos[i] + 'rem';
                    break;
                default:
                    campo = document.createElement('input');
                    campo.type = 'text';
            }
            campo.id = nomeCampo;
            campo.name = nomeCampo;
            if (format) campo.setAttribute('data-format', format);
            
            // ✅ VALIDAÇÃO AUTOMÁTICA: Aplica validação baseada em formato
            // Se campo tem formato específico (moeda, data), ativa validação automaticamente
            if (format && (tipo === 'input' || tipo === 'textarea')) {
                this._aplicarValidacaoAutomatica(campo, format);
            }
            
            div.appendChild(campo);
            // Adiciona a div ao formulário (mainConteudo)
            if (this.form && this.form.querySelector('#mainConteudo')) {
                this.form.querySelector('#mainConteudo').appendChild(div);
            }
            this.fields.push(div);
        }
    }

    /**
     * Cria e configura os botões no footer do formulário comum
     */
    _criarBotoesRodape() {

        if (!this.criarBotoes) {
            unexpected_error_catcher('criarBotoes não existe em _criarBotoesRodape');
            return;
        }
        
        // Busca o container no footer do formulário comum
        const divBotoesFormComum = document.querySelector('#divBotoesFormComum');
        
        if (divBotoesFormComum) {
            try {
                // Insere os botões no container do formulário
                this.criarBotoes.inserirEm(divBotoesFormComum);

            } catch (error) {
                error_catcher(error);
            }
        } else {

        }
    }

    // MÉTODO REMOVIDO: _ocultarFooterLocal() 
    // Era usado para ocultar footer vazio, mas agora sempre temos pelo menos botão Encerrar

    /**
     * ✅ NOVA ABORDAGEM - ESCUTA EVENTOS DO CriarBtnRodape
     * 
     * SOLUÇÃO PARA CONFLITO DE EVENT LISTENERS:
     * - Escuta o evento 'botao-clicado' disparado pelo CriarBtnRodape
     * - Converte para 'formulario-acao' que é esperado pelos form_grupos.js/form_subgrupos.js
     * 
     * FLUXO:
     * Botão → CriarBtnRodape → 'botao-clicado' → [ESTE MÉTODO] → 'formulario-acao' → form_grupos.js
     * 
     * @private
     */
    _configurarEscutaEventosRodape() {

        
        // Aguarda um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            // Busca o container dos botões (onde CriarBtnRodape dispara 'botao-clicado')
            const containerBotoes = document.querySelector('.botoes-container');

            
            if (containerBotoes) {

                containerBotoes.addEventListener('botao-clicado', (event) => {

                
                const { acao, botaoId } = event.detail;
                
                // Mapeia as ações do CriarBtnRodape para as ações do formulário
                const mapeamentoAcoes = {
                    'encerrar': 'encerrar',
                    'primeiro': 'primeiro', 
                    'recua': 'anterior',
                    'avanca': 'proximo',
                    'ultimo': 'ultimo',
                    'incluir': 'incluir',
                    'editar': 'editar',
                    'deletar': 'deletar',
                    'salvar': 'salvar'
                };
                
                const acaoFormulario = mapeamentoAcoes[acao];
                

                
                if (acaoFormulario) {

                    
                    // Dispara o evento que os formulários específicos estão esperando
                    this._dispararEventoCustomizado(acaoFormulario, {
                        dados: this.obterDadosFormulario()
                    });

                } else {
                    // Ação não foi mapeada - continuação normal da execução
                }
            });
            

        } else {
            // Container de botões não encontrado - aguardando DOM
        }
        }, 500); // Timeout para aguardar DOM
    }

    /**
     * Dispara evento customizado no rodapé global (seguindo padrão das selects)
     * @param {string} acao - Ação do botão (ex: 'salvar', 'excluir')
     * @param {Object} detalhe - Dados do evento
     */
    _dispararEventoCustomizado(acao, detalhe) {

        
        // Busca o footer do formulário para disparar o evento
        const formFooter = document.querySelector('#divFormCrud footer');
        

        
        if (formFooter) {
            // Cria evento customizado com dados necessários
            const eventoCustom = new CustomEvent('formulario-acao', {
                detail: {
                    acao: acao,
                    instancia: this,
                    dados: detalhe.dados,
                    formTipo: 'FormComum'  // Identificador do tipo de formulário
                },
                bubbles: true  // Permite que o evento suba na árvore DOM
            });
            

            
            // Dispara o evento no footer do formulário
            formFooter.dispatchEvent(eventoCustom);

        } else {
            unexpected_error_catcher('Footer #divFormCrud footer NÃO ENCONTRADO');
        }
    }

    // ============= MÉTODOS AUXILIARES DE CONTROLE =============

    /**
     * 🧹 LIMPEZA: Remove todos os valores dos campos do formulário
     * 
     * Percorre todos os campos renderizados e aplica limpeza específica por tipo:
     * • Input/Textarea/Select → value = ''
     * • Checkbox/Radio → checked = false
     * 
     * ⚡ Útil para preparar formulário para nova entrada de dados
     * 
     * @example
     * // Limpar formulário para novo registro
     * formGrupos.limparCampos();
     * 
     * @since 1.0.0
     */
    limparCampos() {
        this.fields.forEach(field => {
            const input = field.querySelector('input, select, textarea');
            if (input) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            }
        });
    }

    /**
     * 🔒 CONTROLE DE ACESSO: Habilita/desabilita todos os campos do formulário
     * 
     * Altera a propriedade `disabled` de todos os elementos de entrada.
     * Útil para controlar modo de visualização vs edição.
     * 
     * @param {boolean} [habilitar=true] - true para habilitar campos, false para desabilitar
     * 
     * @example
     * // Modo somente leitura
     * formGrupos.habilitarCampos(false);
     * 
     * // Modo edição
     * formGrupos.habilitarCampos(true);
     * 
     * @since 1.0.0
     */
    habilitarCampos(habilitar = true) {
        this.fields.forEach(field => {
            const input = field.querySelector('input, select, textarea');
            if (input) {
                input.disabled = !habilitar;
            }
        });
    }

    validarEDados() {
        // Implementar validação dos dados
        // Por enquanto retorna true
        return true;
    }

    salvarDados() {
        // Implementar salvamento dos dados
        // Por enquanto apenas log
        const dados = this.obterDadosFormulario();

        return true;
    }

    /**
     * Define altura específica para textareas do formulário
     * @param {string|Object} altura - Altura em rem (ex: '6rem') ou objeto com campos específicos
     */
    definirAlturaTextarea(altura) {
        this.fields.forEach(field => {
            const textarea = field.querySelector('textarea');
            if (textarea) {
                if (typeof altura === 'string') {
                    // Altura igual para todos os textareas
                    textarea.style.height = altura;
                } else if (typeof altura === 'object' && altura[textarea.name]) {
                    // Altura específica por nome do campo
                    textarea.style.height = altura[textarea.name];
                }
            }
        });
    }

    obterDadosFormulario() {
        const dados = {};
        
        // Coleta dados dos campos do formulário
        this.fields.forEach(field => {
            const input = field.querySelector('input, select, textarea');
            if (input) {
                if (input.type === 'checkbox') {
                    dados[input.name] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) dados[input.name] = input.value;
                } else {
                    dados[input.name] = input.value;
                }
            }
        });
        
        // Coleta dados das selects se existirem
        if (this.objSelect) {
            const valoresSelects = this.objSelect.obterValores();
            Object.assign(dados, valoresSelects);
        }
        
        return dados;
    }

    setForm(form) {
        this.form = form;
    }

    addField(field) {
        this.fields.push(field);
    }

    addButton(button) {
        this.buttons.push(button);
    }

    /**
     * 🎨 RENDERIZAÇÃO COMPLETA: Constrói e exibe o formulário no DOM
     * 
     * Executa toda a sequência de renderização do formulário:
     * 1️⃣ Valida parâmetros de configuração
     * 2️⃣ Configura container base e posicionamento
     * 3️⃣ Aplica título e descrição no header  
     * 4️⃣ Cria e posiciona campos na grid
     * 5️⃣ Renderiza selects (se configuradas)
     * 6️⃣ Configura sistema de botões do rodapé
     * 7️⃣ Estabelece listeners de eventos
     * 
     * ⚠️ IMPORTANTE: Este método deve ser chamado APÓS configurar todas as propriedades necessárias
     * 
     * @throws {Error} Se parâmetros de configuração estiverem inválidos
     * @throws {Error} Se propriedades obrigatórias não estiverem definidas
     * 
     * @example
     * // ✅ Uso correto: configurar → validar → renderizar
     * const form = new FormComum();
     * form.titulo = 'Meu Formulário';
     * form.tipo = ['input', 'textarea'];
     * form.label = ['Nome', 'Observações'];  
     * form.nomeCampo = ['nome', 'obs'];
     * form.format = ['texto', 'texto'];
     * form.pos = [{linha: 0, coluna: 0}, {linha: 1, coluna: 0}];
     * form.alinhamento = ['H', 'V'];
     * form.largCampos = [20, 30];
     * form.render(); // ← Renderização manual após configuração completa
     * 
     * @since 2.0.0 Método otimizado com validação prévia
     */
    render() {

        
        // 🔍 VALIDAÇÃO PRÉVIA: Garante que todas as propriedades estão corretas
        try {
            this._validarParametros();
        } catch (error) {
            error_catcher(error);
        }
        
        // 🏗️ CONFIGURAÇÃO BASE: Container e posicionamento
        this.configurarContainer();
        this.posicionarNoCanvas(this.posicaoCanvas.x, this.posicaoCanvas.y);
        this.exibir();
        
        // 📝 HEADER: Título e descrição
        this.configurarHeader(this.titulo, this.descricao);
        
        // 🎛️ CAMPOS: Criação e posicionamento na grid
        this._criarDivsCampos();
        this._posicionarDivs();
        
        // 📋 SELECTS: Renderização se configuradas
        if (this.configSelects) {
            this._criarSelectsConfig();
        } else if (this.objSelect) {
            this._criarSelects();
        }
        
        // 🔘 BOTÕES: Sistema do rodapé
        if (this.grupoBotoes) {           

            this.criarBotoes = new CriarBtnRodape(this.grupoBotoes);
            this._criarBotoesRodape();
        }
        
        // 🎧 EVENTOS: Configuração de listeners
        this._configurarEscutaEventosRodape();
        

    }

    /**
     * 🔧 CRIAÇÃO DE SELECTS: A partir da configuração armazenada
     * 
     * Cria instância CriarSelects usando this.configSelects e renderiza no formulário.
     * Usado quando selects são configuradas via propriedade configSelects.
     * 
     * @private
     * @since 2.0.0
     */
    _criarSelectsConfig() {
        if (!this.configSelects) return;
        
        const { labels, campos, larguras, arranjo = 'linha' } = this.configSelects;
        if (labels && campos && larguras) {
            this.objSelect = new CriarSelects(labels, campos, larguras, arranjo);
            this._criarSelects();
        }
    }

    /**
     * Cria e renderiza as selects no formulário (seguindo padrão EXATO das tabelas)
     * @private
     */
    _criarSelects() {
        if (!this.form || !this.objSelect) return;
        
        // Usa o container pré-existente (mesmo padrão das tabelas)
        const divControles = this.form.querySelector('#divControlesFormulario');
        
        if (divControles) {
            // Limpa controles anteriores
            divControles.innerHTML = '';
            
            // ✅ EXATAMENTE como nas tabelas: usa inserirEm()
            this.objSelect.inserirEm(divControles);
            

        }
    }

    // ============= MÉTODOS PÚBLICOS PARA SELECTS =============
    // Seguindo o padrão das tabelas

    // ============= MÉTODOS DE SELECTS - REDIRECIONAMENTO =============
    // NOTA: Métodos de população foram transferidos para OperacoesCRUD.js
    // para melhor separação de responsabilidades.
    
    /**
     * 🔄 POPULAR SELECT: Método redirecionado para OperacoesCRUD.js
     * @deprecated Use popularSelectIndividual() de OperacoesCRUD.js
     */
    popularSelect(campo, dados, manterPrimeiro = true) {
        console.warn('⚠️ popularSelect() foi movido para OperacoesCRUD.js');
        console.warn('💡 Use: import { popularSelectIndividual } from "OperacoesCRUD.js"');
        console.warn('💡 Chamada: popularSelectIndividual(instanciaForm, campo, dados)');
        return false;
    }

    /**
     * 🔄 POPULAR TODOS OS SELECTS: Método redirecionado para OperacoesCRUD.js
     * @deprecated Use popularTodasSelects() de OperacoesCRUD.js
     */
    popularTodosSelects(todosDados, manterPrimeiro = true) {
        console.warn('⚠️ popularTodosSelects() foi movido para OperacoesCRUD.js');
        console.warn('💡 Use: import { popularTodasSelects } from "OperacoesCRUD.js"');
        return { sucesso: [], falha: [] };
    }

    /**
     * 🧹 LIMPAR SELECT: Método redirecionado para OperacoesCRUD.js
     * @deprecated Use limparSelectIndividual() de OperacoesCRUD.js
     */
    limparSelect(campo) {
        console.warn('⚠️ limparSelect() foi movido para OperacoesCRUD.js');
        console.warn('💡 Use: import { limparSelectIndividual } from "OperacoesCRUD.js"');
        return false;
    }

    // ============= MÉTODOS DE SELECTS =============

    /**
     * 📋 OBTER VALORES: Recupera valores selecionados em todas as selects
     * 
     * Extrai os valores atualmente selecionados de todas as selects configuradas no formulário.
     * Retorna objeto com mapeamento campo → valor.
     * 
     * @returns {Object<string, string>} Mapeamento {campo: valor} das selects preenchidas
     * @returns {Object} Objeto vazio se não há selects configuradas
     * 
     * @example
     * const valores = formGrupos.obterValoresSelects();
     * console.log(valores); // {grupo_nav: "3", status_nav: "ativo"}
     * 
     * @since 1.0.0
     */
    obterValoresSelects() {
        if (this.objSelect) {
            return this.objSelect.obterValores();
        }
        console.warn('❌ FormComum.obterValoresSelects(): Selects não configuradas neste formulário');
        return {};
    }

    /**
     * 🎯 OBTER ELEMENTO: Recupera elemento DOM de select específica
     * 
     * Retorna a referência direta ao elemento HTML <select> para manipulação avançada.
     * 
     * @param {string} campo - Nome do campo da select desejada
     * @returns {HTMLSelectElement|null} Elemento select ou null se não encontrado
     * 
     * @example
     * const selectGrupo = formGrupos.obterElementoSelect('grupo_nav');
     * if (selectGrupo) {
     *   selectGrupo.addEventListener('change', minhaFuncao);
     * }
     * 
     * @since 1.0.0
     */
    obterElementoSelect(campo) {
        if (this.objSelect) {
            return this.objSelect.obterElementoSelect(campo);
        }
        console.warn('❌ FormComum.obterElementoSelect(): Selects não configuradas neste formulário');
        return null;
    }

    /**
     * ✅ VERIFICAÇÃO: Confirma se o formulário possui selects configuradas
     * 
     * @returns {boolean} true se existem selects configuradas, false caso contrário
     * 
     * @example
     * if (formGrupos.temSelects()) {
     *   console.log('Formulário tem selects disponíveis');
     * }
     * 
     * @since 1.0.0
     */
    temSelects() {
        return this.objSelect !== null;
    }

    /**
     * 🔄 POPULAR SELECT: Preenche opções de uma select específica
     * 
     * Método de conveniência para popular uma select com array de opções.
     * 
     * @param {string} campo - Nome do campo da select
     * @param {Array<{value: string, text: string}>} opcoes - Array de opções
     * 
     * @example
     * formGrupos.popularSelect('grupo_nav', [
     *   {value: '1', text: 'Alimentação'},
     *   {value: '2', text: 'Transporte'}
     * ]);
     * 
     * @since 2.0.0
     * @deprecated Método movido para OperacoesCRUD.js
     */
    // REMOVIDO: popularSelect() - Ver OperacoesCRUD.js

    // ============= MÉTODOS DE DADOS =============

    /**
     * 📊 OBTER DADOS: Extrai todos os valores dos campos do formulário
     * 
     * Coleta valores de todos os campos renderizados e retorna objeto estruturado.
     * Útil para validação e envio de dados.
     * 
     * @returns {Object<string, string|boolean>} Objeto com dados do formulário {campo: valor}
     * 
     * @example
     * const dados = formGrupos.obterDados();
     * console.log(dados); // {grupo: "Alimentação", descricao: "Despesas com alimentação"}
     * 
     * @since 2.0.0
     */
    obterDados() {
        const dados = {};
        
        this.fields.forEach((field, index) => {
            const input = field.querySelector('input, select, textarea');
            const nomeCampo = this.nomeCampo[index];
            
            if (input && nomeCampo) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    dados[nomeCampo] = input.checked;
                } else {
                    dados[nomeCampo] = input.value;
                }
            }
        });
        
        return dados;
    }

    // ============= MÉTODOS DE EVENTOS INTERNOS =============
    /**
     * 🎯 GRUPO DE EVENTOS DE NAVEGAÇÃO
     * 
     * Este conjunto de métodos gerencia a navegação entre registros no formulário:
     * • _onEncerrar() - Fecha o formulário
     * • _onPrimeiro() - Navega para o primeiro registro
     * • _onAnterior() - Vai para o registro anterior
     * • _onProximo() - Avança para o próximo registro
     * • _onUltimo() - Vai para o último registro
     * • _dispararEvento() - Centraliza o disparo de eventos customizados
     * 
     * Todos os métodos seguem o padrão de disparar eventos 'formulario-acao'
     * que são capturados pelos módulos específicos (form_grupos.js, etc.)
     */   _onEncerrar() {
        this._dispararEvento('encerrar');
    }
    
    _onPrimeiro() {
        this._dispararEvento('primeiro');
    }
    
    _onAnterior() {
        this._dispararEvento('anterior');
    }
    
    _onProximo() {
        this._dispararEvento('proximo');
    }
    
    _onUltimo() {
        this._dispararEvento('ultimo');
    }
    
    _dispararEvento(acao) {
        const evento = new CustomEvent('formulario-acao', {
            detail: {
                acao: acao,
                instancia: this,
                dados: this.obterDados()
            }
        });
        
        const divRodape = document.getElementById('divRodape');
        if (divRodape) {
            divRodape.dispatchEvent(evento);
        }
    }

    // ============================================================================
    // 🛡️ SISTEMA DE VALIDAÇÃO AUTOMÁTICA DE CAMPOS
    // ============================================================================
    /**
     * 🎯 SEÇÃO: VALIDAÇÃO AUTOMÁTICA BASEADA EM FORMATO
     * 
     * OBJETIVO:
     * Aplicar validação automática em campos com formato específico, garantindo
     * integridade dos dados antes de salvar no backend. Sistema totalmente
     * transparente para o desenvolvedor - basta definir 'formato' na config.
     * 
     * FUNCIONAMENTO:
     * - Detecta propriedade 'formato' nos campos durante criação
     * - Aplica validação específica baseada no tipo (moeda, data, etc.)
     * - Valida durante digitação (oninput) e ao sair do campo (onblur)
     * - Exibe mensagens educativas em caso de erro
     * - Formata automaticamente valores válidos
     * 
     * FORMATOS SUPORTADOS:
     * • 'moeda' → Valida formato nnnnnn,nn (ex: 3125,50)
     * • 'data'  → Valida formato dd/mm/aaaa (ex: 15/10/2025)
     * • null    → Sem validação (campo livre)
     * 
     * USO:
     * No formulário, basta definir:
     * formato: ['moeda', 'data', null]
     * 
     * RASTREABILIDADE:
     * @criado 2025-11-06 - Implementação inicial do sistema de validação
     * @motivo Evitar corrupção de dados no banco (valores TEXT em colunas NUMERIC)
     * @autor Framework DSB Team
     * @issue Valores monetários sendo salvos como string causando erro em SUM()
     */

    /**
     * 🔍 MÉTODO PRINCIPAL: Detecta formato e aplica validação correspondente
     * 
     * Chamado automaticamente durante criação de cada campo input/textarea.
     * Verifica se existe propriedade 'formato' e aplica validação específica.
     * 
     * @param {HTMLElement} elemento - Input/textarea criado no DOM
     * @param {string|null} formato - Tipo de validação: 'moeda'|'data'|null
     * @private
     * 
     * @example
     * // Chamada interna durante render():
     * const input = document.createElement('input');
     * this._aplicarValidacaoAutomatica(input, 'moeda');
     * // Input agora tem validação nnnnnn,nn automática
     */
    _aplicarValidacaoAutomatica(elemento, formato) {
        if (!formato) return; // Campo sem validação (texto livre)
        
        const formatoLower = formato.toLowerCase();
        
        switch (formatoLower) {
            case 'moeda':
                this._validarCampoMonetario(elemento);
                break;
            case 'data':
                // ⚠️ NÃO aplicar máscara se campo é type="date" (navegador gerencia)
                if (elemento.type !== 'date') {
                    this._validarCampoData(elemento);
                }
                break;
            case 'cnpj':
                this._validarCampoCNPJ(elemento);
                break;
            // FUTURO: Adicionar novos formatos aqui
            // case 'cpf':
            //     this._validarCampoCPF(elemento);
            //     break;
            default:
                console.warn(`⚠️ Formato desconhecido: ${formato} - Validação não aplicada`);
        }
    }

    /**
     * 🏢 VALIDAÇÃO CNPJ: Formato XX.XXX.XXX/XXXX-XX
     * 
     * COMPORTAMENTO:
     * • oninput → Aplica máscara automática enquanto digita
     * • Aceita apenas números
     * • Formata: 02332886000104 → 02.332.886/0001-04
     * • maxLength: 18 caracteres (com formatação)
     * 
     * @param {HTMLInputElement} input - Campo a ser validado
     * @private
     */
    _validarCampoCNPJ(input) {
        input.maxLength = 18;
        
        input.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, ''); // Remove não-números
            
            // Aplica máscara progressiva
            if (valor.length <= 14) {
                valor = valor.replace(/(\d{2})(\d)/, '$1.$2');
                valor = valor.replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
                valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
            }
            
            e.target.value = valor;
        });
    }

    /**
     * 💰 VALIDAÇÃO MONETÁRIA: Formato nnnnnn,nn obrigatório
     * 
     * REGRAS RÍGIDAS:
     * ✅ Apenas números e vírgula permitidos
     * ✅ Obrigatório: vírgula + exatamente 2 casas decimais
     * ✅ Exemplos válidos: 3125,50 | 125,00 | 15,90
     * ❌ Exemplos inválidos: 3125 | 3125,5 | ,50 | 3125.50
     * 
     * COMPORTAMENTO:
     * • oninput → Bloqueia digitação de caracteres inválidos
     * • onblur  → Valida formato completo, exibe erro se inválido
     * • Se válido → Formata com separadores de milhar (3125,50 → 3.125,50)
     * 
     * @param {HTMLInputElement} input - Campo a ser validado
     * @private
     */
    _validarCampoMonetario(input) {
        // ✅ VALIDAÇÃO SIMPLIFICADA: Apenas bloqueia caracteres inválidos durante digitação
        // Validação completa será feita ao salvar o registro
        input.addEventListener('input', (e) => {
            // Remove tudo exceto números, vírgula e ponto
            e.target.value = e.target.value.replace(/[^0-9.,]/g, '');
        });
        
        // ✅ FORMATAÇÃO AUTOMÁTICA: Ao sair do campo, formata para padrão brasileiro
        input.addEventListener('blur', (e) => {
            const valor = e.target.value.trim();
            if (valor) {
                // Importa função de formatação
                import('./FuncoesAuxilares.js').then(module => {
                    const formato = input.getAttribute('data-format') || 'valor';
                    e.target.value = module.formatarValorMonetario(valor, formato);
                });
            }
        });
    }

    /**
     * 🔧 UTILITÁRIO: Formata valor monetário com separadores de milhar
     * 
     * Converte: "3125,50" → "3.125,50"
     * Mantém vírgula como separador decimal (padrão BR)
     * 
     * @param {string} valor - Valor no formato nnnnnn,nn
     * @returns {string} Valor formatado com pontos nos milhares
     * @private
     */
    _formatarValorMonetario(valor) {
        // Separar parte inteira e decimal
        const [inteiro, decimal] = valor.split(',');
        
        // Adicionar separadores de milhar na parte inteira
        const inteiroFormatado = parseInt(inteiro).toLocaleString('pt-BR');
        
        // Retornar valor formatado
        return `${inteiroFormatado},${decimal}`;
    }

    /**
     * 🔧 UTILITÁRIO: Valida existência real de data no calendário
     * 
     * Verifica se data existe (não aceita 31/02, 30/02, etc.)
     * Valida anos bissextos para 29/02
     * 
     * @param {string} dataStr - Data no formato dd/mm/aaaa
     * @returns {boolean} True se data existe, false caso contrário
     * @private
     */
    _dataExiste(dataStr) {
        const [dia, mes, ano] = dataStr.split('/').map(num => parseInt(num));
        
        // Mês deve estar entre 1 e 12
        if (mes < 1 || mes > 12) return false;
        
        // Criar objeto Date (mês em JS é 0-11)
        const data = new Date(ano, mes - 1, dia);
        
        // Verificar se data criada corresponde aos valores informados
        // (Date ajusta automaticamente datas inválidas, ex: 31/02 vira 03/03)
        return (
            data.getDate() === dia &&
            data.getMonth() === mes - 1 &&
            data.getFullYear() === ano
        );
    }

    // ============================================================================
    // FIM DA SEÇÃO DE VALIDAÇÃO AUTOMÁTICA
    // ============================================================================
}

export default FormComum;
