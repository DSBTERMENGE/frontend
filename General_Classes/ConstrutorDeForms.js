

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
 * @property {Object|null} configSelects - Config das selects: {labels, campos, larguras, arranjo}
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
     * @param {Object} [opcoes.selects] - Config selects: {labels, campos, larguras, arranjo}
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
        this.titulo = titulo;
        this.descricao = descricao;
        this.tipo = tipo;
        this.label = label;
        this.nomeCampo = nomeCampo;
        this.format = format;
        this.pos = pos;
        this.alinhamento = alinhamento;
        this.largCampos = largCampos;
        this.posicaoCanvas = posicaoCanvas;
        
        // 🔧 PROPRIEDADES DE SISTEMA (controladas internamente)
        this.fields = [];      // Elementos DOM dos campos (preenchido no render)
        this.buttons = [];     // Elementos DOM dos botões (preenchido no render)
        this.criarBotoes = null; // Instância CriarBtnRodape (criado no render)
        this.objSelect = null;   // Instância CriarSelects (criado no render se necessário)
        
        // 🎛️ CONFIGURAÇÕES AVANÇADAS
        this.grupoBotoes = opcoes.grupoBotoes || ['S', 'N', 'S']; // Padrão: Encerrar + CRUD (sem Navegação)
        this.configSelects = opcoes.selects || null; // Configuração de selects para criação posterior
        
        // 🚀 RENDERIZAÇÃO CONDICIONAL 
        // Se todos os parâmetros obrigatórios foram fornecidos → renderiza automaticamente (modo legado)
        // Se parâmetros vazios → aguarda configuração manual + render() (novo padrão)
        const temParametrosCompletos = tipo.length > 0 && label.length > 0 && nomeCampo.length > 0 && 
                                     format.length > 0 && pos.length > 0 && alinhamento.length > 0 && largCampos.length > 0;
        
        if (temParametrosCompletos) {
            // 🔄 MODO LEGADO: Constructor completo → renderização automática
            console.log('🔄 FormComum: Modo legado - renderização automática');
            this._validarParametros(); // Valida antes de renderizar
            this.render();
        } else {
            // ⚡ NOVO PADRÃO: Configuração manual → aguarda render()
            console.log('⚡ FormComum: Novo padrão - aguardando configuração manual + render()');
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
        const formatosValidos = ['texto', 'moeda', 'pct', 'data', null];
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
                    campo.type = 'text';
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
        console.log('🔧 DEBUG: _criarBotoesRodape() chamado');
        console.log('🔧 DEBUG: this.criarBotoes existe?', !!this.criarBotoes);
        
        if (!this.criarBotoes) {
            console.log('❌ criarBotoes não existe, saindo...');
            return;
        }
        
        console.log('✅ Inserindo botões no footer do formulário comum...');
        
        // Busca o container no footer do formulário comum
        const divBotoesFormComum = document.querySelector('#divBotoesFormComum');
        
        console.log('🔧 DEBUG: divBotoesFormComum encontrado?', !!divBotoesFormComum);
        
        if (divBotoesFormComum) {
            try {
                // Insere os botões no container do formulário
                this.criarBotoes.inserirEm(divBotoesFormComum);
                console.log('✅ Botões inseridos no divBotoesFormComum via inserirEm()');
            } catch (error) {
                console.error('❌ Erro ao inserir botões:', error);
            }
        } else {
            console.log('❌ divBotoesFormComum não encontrado no formulário');
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
        console.log('🔧 DEBUG FRAMEWORK: Configurando escuta de eventos do CriarBtnRodape');
        
        // Aguarda um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            // Busca o container dos botões (onde CriarBtnRodape dispara 'botao-clicado')
            const containerBotoes = document.querySelector('.botoes-container');
            console.log('🔧 DEBUG FRAMEWORK: Container de botões encontrado:', containerBotoes);
            
            if (containerBotoes) {
                console.log('🔧 DEBUG ConstrutorDeForms: Adicionando listener para botao-clicado');
                containerBotoes.addEventListener('botao-clicado', (event) => {
                    console.log('🎯 DEBUG ConstrutorDeForms: *** EVENTO BOTAO-CLICADO RECEBIDO! ***', event.detail);
                
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
                    'deletar': 'excluir',
                    'salvar': 'salvar'
                };
                
                const acaoFormulario = mapeamentoAcoes[acao];
                
                console.log('🔄 DEBUG ConstrutorDeForms: Mapeando ação:', acao, '→', acaoFormulario);
                
                if (acaoFormulario) {
                    console.log(`🎯 DEBUG ConstrutorDeForms: *** CONVERTENDO '${acao}' → '${acaoFormulario}' ***`);
                    
                    // Dispara o evento que os formulários específicos estão esperando
                    this._dispararEventoCustomizado(acaoFormulario, {
                        dados: this.obterDadosFormulario()
                    });
                    console.log('✅ DEBUG ConstrutorDeForms: Evento formulario-acao DISPARADO!');
                } else {
                    console.warn(`❌ DEBUG ConstrutorDeForms: Ação '${acao}' NÃO MAPEADA!`);
                }
            });
            
            console.log('✅ DEBUG FRAMEWORK: Listener configurado no container de botões');
        } else {
            console.warn('⚠️ DEBUG FRAMEWORK: Container de botões (.botoes-container) não encontrado');
        }
        }, 500); // Timeout para aguardar DOM
    }

    /**
     * Dispara evento customizado no rodapé global (seguindo padrão das selects)
     * @param {string} acao - Ação do botão (ex: 'salvar', 'excluir')
     * @param {Object} detalhe - Dados do evento
     */
    _dispararEventoCustomizado(acao, detalhe) {
        console.log('🚀 DEBUG ConstrutorDeForms: _dispararEventoCustomizado chamado:', acao, detalhe);
        
        // Busca o footer do formulário para disparar o evento
        const formFooter = document.querySelector('#divFormCrud footer');
        
        console.log('📍 DEBUG ConstrutorDeForms: Footer encontrado:', formFooter);
        
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
            
            console.log('🎯 DEBUG ConstrutorDeForms: *** DISPARANDO EVENTO formulario-acao ***', eventoCustom.detail);
            
            // Dispara o evento no footer do formulário
            formFooter.dispatchEvent(eventoCustom);
            console.log('✅ DEBUG ConstrutorDeForms: Evento formulario-acao ENVIADO!');
        } else {
            console.error('❌ DEBUG ConstrutorDeForms: Footer #divFormCrud footer NÃO ENCONTRADO!');
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
        console.log('Dados para salvar:', dados);
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
        // � DEBUG TEMPORÁRIO: Rastrear chamadas de render()
        console.log('🚨 DEBUG: render() chamado!', new Error().stack);
        
        // �🔍 VALIDAÇÃO PRÉVIA: Garante que todas as propriedades estão corretas
        try {
            this._validarParametros();
        } catch (error) {
            console.error('❌ FormComum.render(): Erro de validação -', error.message);
            throw new Error(`Não é possível renderizar formulário: ${error.message}`);
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
            console.log('✅ Criando instância CriarBtnRodape com grupos:', this.grupoBotoes);
            this.criarBotoes = new CriarBtnRodape(this.grupoBotoes);
            this._criarBotoesRodape();
        }
        
        // 🎧 EVENTOS: Configuração de listeners
        this._configurarEscutaEventosRodape();
        
        console.log('✅ FormComum.render(): Formulário renderizado com sucesso');
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
            
            console.log('✅ Selects criadas seguindo padrão das tabelas');
        }
    }

    // ============= MÉTODOS PÚBLICOS PARA SELECTS =============
    // Seguindo o padrão das tabelas

    /**
     * Popula um select específico com dados
     * @param {string} campo - Nome do campo do select
     * @param {Array<Object>} dados - Array de {value, text}
     * @param {boolean} manterPrimeiro - Se deve manter "Selecione..."
     * @returns {boolean} Sucesso da operação
     */
    popularSelect(campo, dados, manterPrimeiro = true) {
        if (this.objSelect) {
            return this.objSelect.popularSelect(campo, dados, manterPrimeiro);
        }
        console.warn('❌ Selects não configuradas neste formulário');
        return false;
    }

    /**
     * Popula todos os selects de uma vez
     * @param {Object} todosDados - {campo: [{value, text}]}
     * @param {boolean} manterPrimeiro - Se deve manter "Selecione..."
     * @returns {Object} Relatório {sucesso: [], falha: []}
     */
    popularTodosSelects(todosDados, manterPrimeiro = true) {
        if (this.objSelect) {
            return this.objSelect.popularTodosSelects(todosDados, manterPrimeiro);
        }
        console.warn('❌ Selects não configuradas neste formulário');
        return { sucesso: [], falha: [] };
    }

    /**
     * Limpa um select específico
     * @param {string} campo - Nome do campo do select
     * @returns {boolean} Sucesso da operação
     */
    limparSelect(campo) {
        if (this.objSelect) {
            return this.objSelect.limparSelect(campo);
        }
        console.warn('❌ Selects não configuradas neste formulário');
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
     */
    popularSelect(campo, opcoes) {
        if (this.objSelect) {
            this.objSelect.popularSelect(campo, opcoes);
        } else {
            console.warn('❌ FormComum.popularSelect(): Selects não configuradas neste formulário');
        }
    }

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
}

export default FormComum;