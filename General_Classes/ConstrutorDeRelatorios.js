/**
 * Classe GridDados - Sistema independente de exibição de dados tabulares
 * Sistema avançado de exibição de dados tabulares
 * + Sistema avançado de cálculos estatísticos
 * + Integração com CriarBtnRodape
 * + Formatação e alinhamento avançados
 */

import { CriarBtnRodape } from './ConstrutorBtnRodapeForms.js';
import { 
    executarOperacao, 
    determinarOperacaoColuna, 
    obterLabelOperacao, 
    formatarResultado 
} from './FuncoesAuxiliaresRelatorios.js';

// ===== FUNÇÕES UTILITÁRIAS PARA CONVERSÃO MONETÁRIA =====
/**
 * Converte string formatada em moeda brasileira para número puro
 * @param {string} valorFormatado - Valor no formato "3.125,00" ou "3125,00"
 * @returns {number} - Número puro: 3125.00
 * @example converterMoedaParaNumero("3.125,00") // retorna 3125.00
 */
function converterMoedaParaNumero(valorFormatado) {
    if (typeof valorFormatado === 'number') return valorFormatado;
    if (!valorFormatado || valorFormatado === '') return 0;
    // Remove pontos de milhar e substitui vírgula por ponto
    const valorLimpo = String(valorFormatado).replace(/\./g, '').replace(',', '.');
    return parseFloat(valorLimpo) || 0;
}

/**
 * Converte número puro para formato de moeda brasileira
 * @param {number} numero - Número puro: 3125.00
 * @returns {string} - Valor formatado: "3.125,00"
 * @example converterNumeroParaMoeda(3125.00) // retorna "3.125,00"
 */
function converterNumeroParaMoeda(numero) {
    if (typeof numero !== 'number') numero = parseFloat(numero) || 0;
    return numero.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

// ===== CONTADOR GLOBAL PARA CONTAINERS ÚNICOS =====
let contadorContainers = 0;

    export class GridDados {
    /**
     * Construtor da classe GridDados - Sistema avançado de exibição de dados tabulares
     * 
     * @description Cria uma tabela interativa com analytics, formatação automática e controles
     * @usage const myRelatorio = new GridDados(titulo, descricao, cabecalho, larguras, alinhamentos, formatos, posicao, opcoes);
     * 
     * @param {string} titulo - Título principal exibido no header da tabela
     * @param {string} descricao - Descrição/subtítulo da tabela (opcional, pode ser '')
     * 
     * @param {Array<string>} cabecalho - Nomes das colunas da tabela
     * @example ['Descrição', 'Valor', 'Data', 'Status']
     * 
     * @param {Array<number>} larguraColunas - Larguras das colunas em vw (viewport width)
     * @example [40, 20, 25, 15] // = 100vw total
     * 
     * @param {Array<string>} alinhamento - Alinhamento de cada coluna
     * @example ['E', 'D', 'C', 'C'] // E=Esquerda, C=Centro, D=Direita
     * 
     * @param {Array<string>} formato - Formato de exibição de cada coluna
     * @example ['T', 'M', 'D', 'T'] // T=Texto, M=Moeda, D=Data, %=Porcentagem
     * 
     * @param {Object} [posicaoGrid={x: 0, y: 0}] - Posição da div no grid
     * @param {number} posicaoGrid.x - Coluna do grid (0-based)
     * @param {number} posicaoGrid.y - Linha do grid (0-based)
     * 
     * @param {Object} [opcoes={}] - Configurações avançadas opcionais
     * @param {Array<string>} [opcoes.configResultados=null] - Config. analytics no footer
     * @param {Array<string>} [opcoes.grupoBotoes] - Botões personalizados no footer
     * 
     * @example
     * // Relatório financeiro simples
     * const myRelatorio = new GridDados(
     *     'Despesas Mensais',
     *     'Relatório de outubro/2025',
     *     ['Descrição', 'Valor', 'Vencimento'],
     *     [50, 30, 20],
     *     ['E', 'D', 'C'],
     *     ['T', 'M', 'D']
     * );
     * 
    /**
     * Construtor da classe GridDados - Sistema avançado de exibição de dados tabulares
     * 
     * @description Cria uma instância vazia. Todas as propriedades devem ser definidas após instanciação.
     * @usage const myObj = new GridDados(); // Depois definir propriedades manualmente
     * 
     * @example
     * // Padrão do projeto DSB
     * const myRelatorio = new GridDados();
     * myRelatorio.titulo = 'Análise de Receitas';
     * myRelatorio.descricao = 'Com totalizadores';
     * myRelatorio.cabecalho = ['Item', 'Valor', 'Percentual'];
     * myRelatorio.larguraColunas = [40, 30, 30];
     * myRelatorio.alinhamento = ['E', 'D', 'D'];
     * myRelatorio.formato = ['T', 'M', '%'];
     * myRelatorio.colunasComOperacao = ['Valor', 'Percentual'];
     * myRelatorio.colunasComOperacaoTipo = ['Tot', 'Med'];
     * myRelatorio.configFooter = 'rotulado'; // Escolhe o layout do footer
     * myRelatorio.setDados(dados);
     */
    constructor() {
        // ===== PROPRIEDADES PRINCIPAIS (definidas após instanciação) =====
        /** @type {string} Título principal exibido no header da tabela */
        this.titulo = '';
        
        /** @type {string} Descrição/subtítulo da tabela */
        this.descricao = '';

        /** @type {Array<string>} Nomes das colunas */
        this.cabecalho = [];
        
        /** @type {Array<number>} Larguras das colunas em vw */
        this.larguraColunas = [];
        
        /** @type {Array<string>} Alinhamento das colunas (E/C/D) */
        this.alinhamento = [];
        
        /** @type {Array<string>} Formato das colunas (T/M/D/%) */
        this.formato = [];
        
        /** @type {Array<Object>} Dados da tabela (preenchido via setDados()) */
        this.dados = [];
        
        // ===== PROPRIEDADES CONFIGURÁVEIS (definidas após instanciação) =====
        /** @type {Array<string>} Nomes das colunas que terão operações matemáticas no footer */
        this._colunasComOperacao = [];
        
        /** @type {Array<string>} Tipos de operação para cada coluna em colunasComOperacao
         * Valores aceitos: 'Tot', 'Med', 'Cnt', 'Max', 'Min', 'DPad', 'Var', 'MDn', 'Q1', 'Q3', 'CV', 'Amp'
         * Exemplo: ['Tot', 'Med', 'Max'] para 3 colunas com Soma, Média e Máximo */
        this.colunasComOperacaoTipo = [];
        
        /** @type {string} Tipo de organização/layout do footer
         * Valores aceitos: 
         * 'simples' - Uma linha com valores apenas
         * 'rotulado' - Rótulo + valor na mesma célula (ex: "Soma: R$ 1.500")
         * 'duplo' - Duas linhas (linha 1: rótulos, linha 2: valores)
         * 'inline' - Valores com prefixos inline (ex: "Total R$ 1.500")
         * 'compacto' - Apenas valores, sem rótulos
         * 'detalhado' - Linha de rótulos + linha de valores + linha de análise */
        this.configFooter = 'simples';
        
        // ===== CONFIGURAÇÕES AVANÇADAS =====
        /** @type {Array<string>|null} Config. analytics no footer (Tot, Med, Max, etc.) */
        this.configResultados = null;
        
        /** @type {Object} Configurações adicionais da tabela */
        this.tabelaConfig = {};
        
        // ===== INTEGRAÇÃO COM OUTROS COMPONENTES =====
        /** @type {CriarBtnRodape|null} Objeto de botões personalizados */
        this.objBotoes = null;
        
        // ===== PROPRIEDADES DE CONTROLE DE UI (independentes do FormularioBase) =====
        /** @type {Array<number>} Posição da tabela no canvas [x, y] em vw/vh. [] = centralizado automático */
        this.posicao = [];
        
        /** @type {HTMLElement|null} Referência ao container HTML da tabela (#divTabela) */
        this.container = null;
        
        /** @type {string} Tipo de tabela para escolher gerador HTML apropriado */
        this.tipoTabela = 'simples';
        
        // ===== INICIALIZAÇÃO =====
        // Não executa validação nem renderização automática
        // Propriedades devem ser definidas manualmente antes do uso
    }

    // ===== MÉTODOS BÁSICOS DE UI (substituem funcionalidades do FormularioBase) =====
    
    /**
     * Conecta a instância atual a um container dinâmico único no DOM
     * Cria automaticamente uma div filha de divRelatorio com ID único
     * Substitui a dependência do this.form do FormularioBase
     * @returns {HTMLElement} Referência ao container conectado
     * @throws {Error} Se container pai não for encontrado no DOM
     */
    _conectarContainer() {
        // Usa função global padronizada
        this.container = criarDivFilhaRelatorio('divSubRel', 'container-sub-relatorio');
        return this.container;
    }

    /**
     * Posiciona a div filha no grid usando this.posicao
     * Suporte a coordenadas [x, y] no grid, centralização automática [] ou layout vertical
     * @example
     * // Posição customizada no grid
     * this.posicao = [1, 2]; // coluna 1, linha 2 do grid
     * this._posicionarDivFilha();
     * 
     * // Centralização automática
     * this.posicao = []; // Array vazio = centralizado
     * this._posicionarDivFilha();
     * 
     * // Layout vertical para múltiplas tabelas
     * this.posicao = ['vertical']; // Organiza verticalmente
     * this._posicionarDivFilha();
     */
    _posicionarDivFilha() {
        if (!this.container) {
            this._conectarContainer();
        }
        
        if (this.posicao.length === 0) {
            // Posicionamento automático (fluxo normal do HTML)
            this.container.style.position = 'relative';
            this.container.style.left = 'auto';
            this.container.style.top = 'auto';
        } else {
            // Posicionamento específico [x, y] em pixels
            const [x, y] = this.posicao;
            this.container.style.position = 'absolute';
            this.container.style.left = `${x}px`;
            this.container.style.top = `${y}px`;
        }
    }

    /**
     * Setter personalizado para colunasComOperacao que automaticamente zera propriedades relacionadas
     * @param {Array<string>} valor - Array com nomes das colunas ou array vazio
     */
    set colunasComOperacao(valor) {
        this._colunasComOperacao = valor;
        
        // Se array vazio, zera propriedades relacionadas automaticamente
        if (!valor || valor.length === 0) {
            this.colunasComOperacaoTipo = [];
        }
    }

    /**
     * Getter para colunasComOperacao
     * @returns {Array<string>}
     */
    get colunasComOperacao() {
        return this._colunasComOperacao || [];
    }

    /*
    ======================================================================
     *                 VALIDAÇÕES INTERNAS DE PROPRIEDADES E OUTROS
    *======================================================================
     */
    _validarPropriedades() {
        // ===== VALIDAÇÃO GRUPO 1: PROPRIEDADES PRINCIPAIS (baseadas em cabecalho) =====
        const nCol = this.cabecalho.length;
        
        // 1.1 Cabeçalho (propriedade guia)
        if (!Array.isArray(this.cabecalho) || nCol === 0) {
            throw new Error('Cabeçalho deve ser um array não vazio.');
        }
        
        // 1.2 Largura das colunas
        if (!Array.isArray(this.larguraColunas) || this.larguraColunas.length !== nCol) {
            throw new Error(`LarguraColunas deve ter ${nCol} elementos (mesmo número que cabeçalho).`);
        }
        if (!this.larguraColunas.every(x => typeof x === 'number' && !isNaN(x))) {
            throw new Error('LarguraColunas deve conter apenas números válidos.');
        }
        
        // 1.3 Alinhamento das colunas
        if (!Array.isArray(this.alinhamento) || this.alinhamento.length !== nCol) {
            throw new Error(`Alinhamento deve ter ${nCol} elementos (mesmo número que cabeçalho).`);
        }
        if (!this.alinhamento.every(x => ['E','C','D'].includes(x))) {
            throw new Error('Alinhamento só pode conter "E" (esquerda), "C" (centro) ou "D" (direita).');
        }
        
        // 1.4 Formato das colunas
        if (!Array.isArray(this.formato) || this.formato.length !== nCol) {
            throw new Error(`Formato deve ter ${nCol} elementos (mesmo número que cabeçalho).`);
        }
        const formatosValidos = ['T', 'M', 'D', '%'];
        if (!this.formato.every(x => formatosValidos.includes(x))) {
            throw new Error('Formato só pode conter "T" (texto), "M" (moeda), "D" (data) ou "%" (porcentagem).');
        }
        
        // ===== VALIDAÇÃO GRUPO 2: PROPRIEDADES DE OPERAÇÃO (baseadas em colunasComOperacao) =====
        const nColOperacao = this.colunasComOperacao.length;
        
        if (nColOperacao > 0) {
            // 2.1 Verificar se colunas de operação existem no cabeçalho
            const colunasInvalidas = this.colunasComOperacao.filter(col => !this.cabecalho.includes(col));
            if (colunasInvalidas.length > 0) {
                throw new Error(`Colunas de operação inválidas: ${colunasInvalidas.join(', ')}. Devem existir no cabeçalho.`);
            }
            
            // 2.2 Tipos de operação
            if (!Array.isArray(this.colunasComOperacaoTipo) || this.colunasComOperacaoTipo.length !== nColOperacao) {
                throw new Error(`ColunasComOperacaoTipo deve ter ${nColOperacao} elementos (mesmo número que colunasComOperacao).`);
            }
            
            const tiposPermitidos = ['Tot', 'Med', 'Cnt', 'Max', 'Min', 'DPad', 'Var', 'MDn', 'Q1', 'Q3', 'CV', 'Amp'];
            const tiposInvalidos = this.colunasComOperacaoTipo.filter(tipo => !tiposPermitidos.includes(tipo));
            if (tiposInvalidos.length > 0) {
                throw new Error(`Tipos de operação inválidos: ${tiposInvalidos.join(', ')}. Tipos válidos: ${tiposPermitidos.join(', ')}.`);
            }
        }
        
        // ===== VALIDAÇÃO GRUPO 3: CONFIGURAÇÕES AVANÇADAS =====
        
        // 3.1 ConfigResultados (sistema legado - manter compatibilidade)
        if (this.configResultados !== null) {
            if (!Array.isArray(this.configResultados)) {
                throw new Error('ConfigResultados deve ser um array ou null.');
            }
            if (this.configResultados.length !== nCol) {
                throw new Error(`ConfigResultados deve ter ${nCol} elementos (mesmo número que cabeçalho).`);
            }
            
            const tiposPermitidos = [null, 'Tot', 'Med', 'Cnt', 'Max', 'Min', 'DPad', 'Var', 'MDn', 'Q1', 'Q3', 'CV', 'Amp'];
            for (let i = 0; i < this.configResultados.length; i++) {
                const valor = this.configResultados[i];
                if (valor !== null && typeof valor === 'string') {
                    if (!tiposPermitidos.includes(valor) && valor.trim() === '') {
                        throw new Error(`ConfigResultados[${i}]: strings vazias não são permitidas.`);
                    }
                } else if (valor !== null) {
                    throw new Error(`ConfigResultados[${i}]: deve ser null, string (tipo de cálculo) ou label personalizado.`);
                }
            }
        }
        
        // 3.2 ConfigFooter
        const footersValidos = ['simples', 'rotulado', 'duplo', 'inline', 'compacto', 'detalhado'];
        if (!footersValidos.includes(this.configFooter)) {
            throw new Error(`ConfigFooter deve ser um dos valores: ${footersValidos.join(', ')}.`);
        }
    }

    /**
     * Define os dados da tabela com validação
     * @param {Array<Object>} dados - Array de objetos com dados da tabela
     */
    setDados(dados) {
        if (!Array.isArray(dados)) {
            throw new Error('Dados deve ser um array de objetos.');
        }
        
        this.dados = dados;
        this.calcularAlturaMaxima();
        
        // ✅ CONSTRÓI A TABELA automaticamente quando dados são definidos
        if (dados.length > 0 && this.cabecalho.length > 0) {
            this.construirTabela();
            // ✅ RENDERIZA automaticamente após construir a tabela
            this.render();
        }
    }

    /**
     * Popula a tabela com novos dados e reconstrói (usado pelo sistema de cascata)
     * @param {Array<Object>} dadosArray - Array de dados para popular a tabela
     */
    popularTabela(dadosArray) {
        // Mapeia os dados para o formato correto se necessário
        let dadosFormatados = dadosArray;
        
        // Se recebeu dados com estrutura {nome, estado, cidade, curso}, converte para {Nome, Estado, Cidade, Curso}
        if (dadosArray.length > 0 && dadosArray[0].nome) {
            dadosFormatados = dadosArray.map(item => ({
                'Nome': item.nome,
                'Estado': item.estado, 
                'Cidade': item.cidade,
                'Curso': item.curso
            }));
        }
        
        this.setDados(dadosFormatados);
        
        // Reconstrói a tabela se já estiver configurada
        if (this.cabecalho.length > 0 && this.dados.length > 0) {
            this.construirTabela();
        }
    }

    /**
     * Conversão de alinhamento (REAPROVEITADA!)
     */
    _alinhamentoCSS(codigo) {
        switch (codigo) {
            case 'E': return 'left';
            case 'C': return 'center';
            case 'D': return 'right';
            default: return 'left';
        }
    }

    /**
     * Formatação de células (REAPROVEITADA e MELHORADA!)
     */
    _formatarCelula(valor, formato) {
        if (valor === null || valor === undefined) return '';
        
        switch (formato) {
            case 'M': // Moeda COM símbolo (R$ 3.125,00)
                return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(Number(valor) || 0);
                
            case 'V': // Valor monetário SEM símbolo (3.125,00)
                return new Intl.NumberFormat('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(valor) || 0);
                
            case '%': // Percentual
                return new Intl.NumberFormat('pt-BR', {
                    style: 'percent',
                    minimumFractionDigits: 2
                }).format(Number(valor) / 100 || 0);
                
            case 'D': // Decimal
                return new Intl.NumberFormat('pt-BR', {
                    minimumFractionDigits: 2
                }).format(Number(valor) || 0);
                
            case 'T': // Texto
            default:
                return String(valor);
        }
    }

    /**
     * SISTEMA AVANÇADO DE CÁLCULOS ESTATÍSTICOS (REAPROVEITADO!)
     * Gera linha de resultados (tfoot) com 12 tipos de cálculo
     */
    _gerarLinhaResultados() {
        if (!this.configResultados || this.dados.length === 0) return '';
        
        // Verifica se tem configuração válida
        const temConfiguracao = this.configResultados.some(config => config !== null);
        if (!temConfiguracao) return '';

        const dados = this.dados;
        const larguras = [...this.larguraColunas];
        const somaLargVW = larguras.reduce((a, b) => a + b, 0);
        
        // ✅ CORREÇÃO: Mantém medidas responsivas em VW (não px)

        // Tipos de cálculo predefinidos (TODOS os 12 tipos!)
        const tiposCalculo = ['Tot', 'Med', 'Cnt', 'Max', 'Min', 'DPad', 'Var', 'MDn', 'Q1', 'Q3', 'CV', 'Amp'];

        let celulasResultado = '';

        this.configResultados.forEach((config, index) => {
            const nomeColuna = this.cabecalho[index];
            const formato = this.formato[index];
            const alinhamento = this._alinhamentoCSS(this.alinhamento[index]);
            const larguraVW = larguras[index]; // Mantém em vw

            let conteudo = '';

            if (config === null) {
                // Célula vazia
                conteudo = '';
            } else if (tiposCalculo.includes(config)) {
                // Cálculo automático
                const valoresNumericos = dados.map(linha => {
                    const valor = parseFloat(linha[nomeColuna]);
                    return isNaN(valor) ? 0 : valor;
                });

                switch (config) {
                    case 'Tot': // Total/Soma
                        conteudo = valoresNumericos.reduce((sum, val) => sum + val, 0);
                        break;
                    case 'Med': // Média
                        const soma = valoresNumericos.reduce((sum, val) => sum + val, 0);
                        conteudo = dados.length > 0 ? soma / dados.length : 0;
                        break;
                    case 'Cnt': // Contagem
                        conteudo = dados.length;
                        break;
                    case 'Max': // Máximo
                        conteudo = valoresNumericos.length > 0 ? Math.max(...valoresNumericos) : 0;
                        break;
                    case 'Min': // Mínimo
                        conteudo = valoresNumericos.length > 0 ? Math.min(...valoresNumericos) : 0;
                        break;
                    case 'DPad': // Desvio Padrão
                        if (valoresNumericos.length > 1) {
                            const media = valoresNumericos.reduce((sum, val) => sum + val, 0) / valoresNumericos.length;
                            const somaQuadrados = valoresNumericos.reduce((sum, val) => sum + Math.pow(val - media, 2), 0);
                            conteudo = Math.sqrt(somaQuadrados / (valoresNumericos.length - 1));
                        } else {
                            conteudo = 0;
                        }
                        break;
                    case 'Var': // Variância
                        if (valoresNumericos.length > 1) {
                            const media = valoresNumericos.reduce((sum, val) => sum + val, 0) / valoresNumericos.length;
                            const somaQuadrados = valoresNumericos.reduce((sum, val) => sum + Math.pow(val - media, 2), 0);
                            conteudo = somaQuadrados / (valoresNumericos.length - 1);
                        } else {
                            conteudo = 0;
                        }
                        break;
                    case 'MDn': // Mediana
                        const ordenados = [...valoresNumericos].sort((a, b) => a - b);
                        const meio = Math.floor(ordenados.length / 2);
                        if (ordenados.length % 2 === 0) {
                            conteudo = (ordenados[meio - 1] + ordenados[meio]) / 2;
                        } else {
                            conteudo = ordenados[meio];
                        }
                        break;
                    case 'Q1': // Primeiro Quartil (25%)
                        const ordenadosQ1 = [...valoresNumericos].sort((a, b) => a - b);
                        const posQ1 = Math.floor(ordenadosQ1.length * 0.25);
                        conteudo = ordenadosQ1[posQ1] || 0;
                        break;
                    case 'Q3': // Terceiro Quartil (75%)
                        const ordenadosQ3 = [...valoresNumericos].sort((a, b) => a - b);
                        const posQ3 = Math.floor(ordenadosQ3.length * 0.75);
                        conteudo = ordenadosQ3[posQ3] || 0;
                        break;
                    case 'CV': // Coeficiente de Variação (%)
                        if (valoresNumericos.length > 1) {
                            const media = valoresNumericos.reduce((sum, val) => sum + val, 0) / valoresNumericos.length;
                            if (media !== 0) {
                                const somaQuadrados = valoresNumericos.reduce((sum, val) => sum + Math.pow(val - media, 2), 0);
                                const desvio = Math.sqrt(somaQuadrados / (valoresNumericos.length - 1));
                                conteudo = (desvio / media) * 100;
                            } else {
                                conteudo = 0;
                            }
                        } else {
                            conteudo = 0;
                        }
                        break;
                    case 'Amp': // Amplitude (Max - Min)
                        if (valoresNumericos.length > 0) {
                            const max = Math.max(...valoresNumericos);
                            const min = Math.min(...valoresNumericos);
                            conteudo = max - min;
                        } else {
                            conteudo = 0;
                        }
                        break;
                }

                // Aplica formatação da coluna ao resultado
                conteudo = this._formatarCelula(conteudo, formato);
            } else {
                // Label personalizado (ex: "Totais", "Resumo", etc.)
                conteudo = config;
            }

            celulasResultado += `<td style="width:${larguraVW}vw; text-align:${alinhamento}; font-weight: bold; background-color: #b3d9ff; box-sizing:border-box; padding: 0.25rem; border: 0.0625rem solid #666; font-size: 0.875rem; line-height: 1.2;">${conteudo}</td>`;
        });

        return `<tfoot><tr style="border-top: 0.125rem solid #666;">${celulasResultado}</tr></tfoot>`;
    }

    /**
     * Configura o sistema de eventos em cascata (Estado → Cidade → Tabela)
     */
    _configurarEventosCascata() {
        const divControles = this.container.querySelector('#divControlesTabela');
        if (!divControles) return;
        
        // Remove listener anterior para evitar duplicação
        divControles.removeEventListener('select-alterada', this._handlerSelectsCascata);
        
        // Adiciona listener para capturar eventos das selects
        this._handlerSelectsCascata = (event) => {
            const { campo, valor, selecionados } = event.detail;
            
            console.log(`🔄 Cascata ativada: ${campo} = "${valor}"`);
            
            if (campo === 'estado') {
                this._popularCidadesPorEstado(valor);
            } else if (campo === 'cidade') {
                this._popularTabelaPorCidade(valor, selecionados.estado);
            }
        };
        
        divControles.addEventListener('select-alterada', this._handlerSelectsCascata);
        console.log('🎯 Sistema de cascata configurado!');
    }

    /**
     * Popula a select de cidade baseada no estado selecionado
     */

    /**
     * Configurar botões no divRodape (conforme arquitetura acordada)
     */
    _configurarBotoesRodape() {
        const divRodape = document.getElementById('divRodape');
        if (!divRodape || !this.objBotoes) return;
        
        // Limpa botões anteriores do rodapé
        const divBotoes = divRodape.querySelector('#divBotoes');
        if (divBotoes) {
            divBotoes.innerHTML = '';
            
            // Adiciona botões no rodapé
            const botoesHTML = this.objBotoes.gerarHTML();
            divBotoes.innerHTML = botoesHTML;
        }
    }

    /**
     * Gerenciamento de mensagens no footer do formulário
     */
    
    /**
     * Exibe uma mensagem no footer da tabela
     * @param {string} mensagem - Mensagem a ser exibida (máx. 150 caracteres)
     * @param {string} tipo - Tipo da mensagem: 'info', 'success', 'warning', 'error'
     */
    exibirMensagem(mensagem, tipo = 'info') {
        // Sistema simplificado - exibe no console por enquanto
        // TODO: Implementar sistema de mensagens visual quando necessário
        console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
    }
    
    /**
     * Oculta a mensagem do footer (volta altura 0)
     */
    ocultarMensagem() {
        // Sistema simplificado - apenas avisa no console
        console.log('[INFO] Mensagem ocultada');
    }
    
    /**
     * Mensagem temporária que desaparece automaticamente
     * @param {string} mensagem - Mensagem a ser exibida
     * @param {string} tipo - Tipo da mensagem
     * @param {number} duracao - Duração em milissegundos (padrão: 5000ms)
     */
    exibirMensagemTemporaria(mensagem, tipo = 'info', duracao = 5000) {
        this.exibirMensagem(mensagem, tipo);
        
        setTimeout(() => {
            this.ocultarMensagem();
        }, duracao);
    }

    /**
     * Fechar tabela (método de instância)
     */
    fechar() {
        this.ocultar();
        this._limparConteudo();
    }

    /**
     * Limpa todo o conteúdo da tabela
     */
    _limparConteudo() {
        if (!this.container) return;
        
        // Limpa área de controles
        const controlesEl = this.container.querySelector('#divControlesTabela');
        if (controlesEl) controlesEl.innerHTML = '';

        // Limpa a tabela principal
        const mainTabelaEl = this.container.querySelector('#mainTabela');
        if (mainTabelaEl) mainTabelaEl.innerHTML = '';

        // Limpa mensagens do footer
        this.ocultarMensagem();
        
        // Limpa botões do rodapé
        const divBotoes = document.getElementById('divBotoes');
        if (divBotoes) divBotoes.innerHTML = '';
    }

    /**
     * Renderização completa da tabela (OVERRIDE da classe base)
     * Sequência organizada: Preparação → Cálculos → Renderização
     */
    render() {
        // 🚀 EXECUÇÃO DA SEQUÊNCIA COMPLETA DE RENDERIZAÇÃO
        
        // 3️⃣ CÁLCULOS: Processa operações matemáticas (se configuradas)
        if (this.colunasComOperacao && this.colunasComOperacao.length > 0) {
            this._processarOperacoesMatematicas();
        }
        
        // 4️⃣ MONTAGEM: Gera HTML completo (Header + Tabela + Footer)
        const htmlCompleto = this._gerarTabelaCompleta();
        
        // 5️⃣ RENDERIZAÇÃO: Materializa no DOM
        this.container.innerHTML = htmlCompleto;
        
        // 6️⃣ FINALIZAÇÃO: Remove classe hidden e aplica posicionamento
        this.container.classList.remove('hidden');
        
        if (this.posicao.length > 0 || this.posicao.length === 0) {
            this._posicionarDivFilha();
        }
    }
    
    /**
     * Processa todas as operações matemáticas antes da renderização
     * Garante que todos os cálculos estejam prontos
     */
    _processarOperacoesMatematicas() {
        // Pré-calcula todas as operações para otimizar a renderização
        this.colunasComOperacao.forEach(nomeColuna => {
            const operacao = determinarOperacaoColuna(nomeColuna);
            const resultado = executarOperacao(this.dados, nomeColuna, operacao);
            
            // Armazena resultado em cache para uso posterior (opcional)
            if (!this._cacheOperacoes) {
                this._cacheOperacoes = {};
            }
            this._cacheOperacoes[nomeColuna] = {
                operacao: operacao,
                resultado: resultado
            };
        });
    }

    /*
    *===============================================================
        *                 CONSTRUÇÃO E POPULAÇÃO DA TABELA
    * ===============================================================
     */
    construirTabela() {
        // Conecta ao container (#divTabela) se ainda não conectado
        this._conectarContainer();
        
        // Gera HTML completo com controle de overflow
        const htmlCompleto = this._gerarTabelaCompleta();
        
        // Remove classe hidden para mostrar tabela
        this.container.classList.remove('hidden');
        
        // Aplica posicionamento se configurado
        if (this.posicao.length > 0 || this.posicao.length === 0) {
            this._posicionarDivFilha();
        }
    }

    /**
     * Calcula altura máxima baseada no conteúdo (REAPROVEITADO!)
     */
    calcularAlturaMaxima() {
        if (this.dados.length === 0) return;
        
        // ✅ CORREÇÃO: Usa VH para alturas (vertical) e REM para cálculos base
        // Altura estimada baseada em unidades responsivas
        const alturaLinhaRem = 2.5; // rem por linha (responsivo)
        const alturaHeaderRem = 3.5; // rem para header
        const alturaFooterRem = this.configResultados ? 3 : 0; // rem para footer
        const margemExtraRem = 4; // rem de margem extra
        
        // Converte REM para VH aproximadamente (1rem ≈ 1.5vh em telas normais)
        const fatorConversao = 1.5;
        const alturaTotal = (alturaHeaderRem + (this.dados.length * alturaLinhaRem) + alturaFooterRem + margemExtraRem) * fatorConversao;
        const alturaMaxVH = Math.min(alturaTotal, 80); // Máximo 80vh
        
        if (this.container) {
            this.container.style.height = `${alturaMaxVH}vh`;
            this.container.style.minHeight = `25vh`; // Altura mínima em vh
        }
    }

    /**
     * Método estático para criação simplificada (MELHORADO!)
     * 
     * ⚠️ FUNÇÃO COMENTADA - CÓDIGO LEGADO NÃO UTILIZADO
     * Esta função não é usada internamente nem externamente no projeto.
     * Mantida comentada para eventual remoção definitiva.
     */
    /*
    static criar(titulo, descricao, cabecalho, larguraColunas, alinhamento, formato, dados = [], posicaoGrid = {x: 0, y: 0}, opcoes = {}) {
        const tabela = new GridDados();
        
        // Configura propriedades
        tabela.titulo = titulo;
        tabela.descricao = descricao;
        tabela.cabecalho = cabecalho;
        tabela.larguraColunas = larguraColunas;
        tabela.alinhamento = alinhamento;
        tabela.formato = formato;
        tabela.posicao = [posicaoGrid.x, posicaoGrid.y];
        
        if (dados.length > 0) {
            tabela.setDados(dados);
        }
        
        tabela.construirTabela();
        
        return tabela;
    }
    */

    /**
     * Cria header visual da tabela com título e descrição na mesma linha
     * Layout horizontal com separador para economizar altura
     * Diferente do <thead> - este é o cabeçalho visual acima da tabela
     * Usa this.titulo e this.descricao
     * @returns {string} HTML do header visual
     */
    _criarHeaderTabela() {
        if (!this.titulo && !this.descricao) {
            return ''; // Sem header se não há título nem descrição
        }
        
        let header = `<div class="tabela-header" style="
            margin-bottom: 0.75rem; 
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            width: auto;
            max-width: 100%;
            word-wrap: break-word;
            flex-wrap: wrap;
        ">`;
        
        if (this.titulo) {
            header += `<h2 style="
                margin: 0; 
                color: #003366; 
                font-size: 1.25rem; 
                font-weight: bold;
            ">${this.titulo}</h2>`;
        }
        
        // Separador apenas se ambos existirem
        if (this.titulo && this.descricao) {
            header += `<span style="
                color: #666;
                font-size: 1rem;
                font-weight: normal;
            "> - </span>`;
        }
        
        if (this.descricao) {
            header += `<p style="
                margin: 0; 
                color: #666; 
                font-size: 0.875rem; 
                font-style: italic;
            ">${this.descricao}</p>`;
        }
        
        header += '</div>';
        return header;
    }

    /**
     * Cria footer da tabela com operações matemáticas nas colunas especificadas
     * Mapeia automaticamente o tipo de operação baseado no nome da coluna
     * Usa this.colunasComOperacao para determinar quais colunas calcular
     * @returns {string} HTML do tfoot com resultados das operações
     */
    _criarFooterTabela() {
        if (!this.colunasComOperacao || this.colunasComOperacao.length === 0) {
            return ''; // Sem footer se não há colunas para calcular
        }
        
        let tfoot = `<tfoot>`;
        
        // Para cada coluna com operação, calcula o resultado
        this.colunasComOperacao.forEach(nomeColuna => {
            const operacao = determinarOperacaoColuna(nomeColuna);
            const resultado = executarOperacao(this.dados, nomeColuna, operacao);
            
            // Criar linha de totais
            tfoot += `<tr style="background-color: #e3f2fd; font-weight: bold;">`;
            
            // Percorrer todas as colunas da tabela
            this.cabecalho.forEach((coluna, index) => {
                if (coluna === nomeColuna) {
                    // Coluna com resultado
                    tfoot += `<td style="
                        text-align: ${this.alinhamento[index] === 'D' ? 'right' : this.alinhamento[index] === 'C' ? 'center' : 'left'};
                        padding: 0.5rem;
                        border: 0.0625rem solid #003366;
                        background-color: #e3f2fd;
                        color: #003366;
                        font-weight: bold;
                    ">${formatarResultado(resultado, nomeColuna)}</td>`;
                } else if (index === 0) {
                    // Primeira coluna mostra o label da operação - ALINHADO À DIREITA
                    tfoot += `<td style="
                        text-align: right;
                        padding: 0.5rem;
                        border: 0.0625rem solid #003366;
                        background-color: #e3f2fd;
                        color: #003366;
                        font-weight: bold;
                    ">${obterLabelOperacao(operacao)}</td>`;
                } else {
                    // Outras colunas ficam vazias
                    tfoot += `<td style="
                        padding: 0.5rem;
                        border: 0.0625rem solid #003366;
                        background-color: #e3f2fd;
                    "></td>`;
                }
            });
            
            tfoot += `</tr>`;
        });
        
        tfoot += '</tfoot>';
        return tfoot;
    }

    /**
     * Determina automaticamente o tipo de operação baseado no nome da coluna
     * @param {string} nomeColuna - Nome da coluna
     * @returns {string} Tipo de operação (Tot, Med, Max, Min, Cnt, etc.)
     */
    _determinarOperacaoColuna(nomeColuna) {
        const nomeMinusculo = nomeColuna.toLowerCase();
        
        // Mapeamento inteligente baseado no nome da coluna
        if (nomeMinusculo.includes('valor') || 
            nomeMinusculo.includes('preco') || 
            nomeMinusculo.includes('total') ||
            nomeMinusculo.includes('custo') ||
            nomeMinusculo.includes('receita') ||
            nomeMinusculo.includes('despesa')) {
            return 'Tot'; // Soma para valores monetários
        }
        
        if (nomeMinusculo.includes('quantidade') || 
            nomeMinusculo.includes('qtd') ||
            nomeMinusculo.includes('numero') ||
            nomeMinusculo.includes('num')) {
            return 'Tot'; // Soma para quantidades
        }
        
        if (nomeMinusculo.includes('media') || 
            nomeMinusculo.includes('avg')) {
            return 'Med'; // Média quando explicitamente solicitada
        }
        
        if (nomeMinusculo.includes('data') || 
            nomeMinusculo.includes('date')) {
            return 'Cnt'; // Contagem para datas
        }
        
        // Padrão: soma para campos numéricos, contagem para outros
        return 'Tot';
    }

    /**
     * Obtém o label descritivo para a operação
     * @param {string} operacao - Tipo de operação
     * @returns {string} Label para exibição
     */
    _obterLabelOperacao(operacao) {
        const labels = {
            'Tot': 'Total',
            'Med': 'Média', 
            'Max': 'Máximo',
            'Min': 'Mínimo',
            'Cnt': 'Contagem',
            'Sum': 'Soma',
            'Avg': 'Média',
            'StdDev': 'Desvio Padrão',
            'Var': 'Variância',
            'Range': 'Amplitude',
            'First': 'Primeiro',
            'Last': 'Último'
        };
        
        return labels[operacao] || operacao;
    }

    /**
     * Formata o resultado da operação para exibição
     * @param {number} resultado - Resultado da operação
     * @param {string} nomeColuna - Nome da coluna (para contexto de formatação)
     * @returns {string} Resultado formatado
     */
    _formatarResultado(resultado, nomeColuna) {
        const nomeMinusculo = nomeColuna.toLowerCase();
        
        // Se é valor monetário, formata como moeda
        if (nomeMinusculo.includes('valor') || 
            nomeMinusculo.includes('preco') || 
            nomeMinusculo.includes('custo') ||
            nomeMinusculo.includes('receita') ||
            nomeMinusculo.includes('despesa')) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(resultado);
        }
        
        // Se é contagem, não usa decimais
        if (Number.isInteger(resultado)) {
            return resultado.toLocaleString('pt-BR');
        }
        
        // Padrão: 2 casas decimais
        return resultado.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
    *===============================================================
    *                            GERADORES DE HTML
    *===============================================================
     */
    
    /**
     * Calcula a largura total da tabela em vw
     * Esta é a largura real da tabela baseada na soma das colunas
     * O container se adaptará a esta largura + margem de segurança
     * @returns {number} Largura total em vw (mínimo 30vw)
     */
    _calcularLarguraTotal() {
        const somaLargVW = this.larguraColunas.reduce((a, b) => a + b, 0);
        return Math.max(somaLargVW, 30); // Mínimo 30vw
    }
    
    /**
     * Gera HTML do header da tabela (<thead>)
     * Usa this.cabecalho, this.larguraColunas, this.alinhamento
     * @returns {string} HTML do thead completo
     */
    _gerarHTMLHeader() {
        let thead = '<thead><tr>';
        
        this.cabecalho.forEach((titulo, index) => {
            const alinhamento = this._alinhamentoCSS(this.alinhamento[index]);
            const larguraVW = this.larguraColunas[index];
            
            thead += `<th style="
                width: ${larguraVW}vw;
                text-align: ${alinhamento};
                background-color: #003366;
                color: white;
                font-weight: bold;
                padding: 0.25rem;
                border: 0.0625rem solid #ddd;
                box-sizing: border-box;
                font-size: 0.875rem;
                line-height: 1.1;
            ">${titulo}</th>`;
        });
        
        return thead + '</tr></thead>';
    }
    
    /**
     * Gera HTML do body da tabela (<tbody>)
     * Usa this.dados, this.cabecalho, this.formato, this.alinhamento
     * @returns {string} HTML do tbody completo
     */
    _gerarHTMLBody() {
        let tbody = '<tbody>';
        
        this.dados.forEach((linha) => {
            tbody += '<tr>';
            
            this.cabecalho.forEach((coluna, index) => {
                const valor = linha[coluna];
                const formato = this.formato[index];
                const alinhamento = this._alinhamentoCSS(this.alinhamento[index]);
                const larguraVW = this.larguraColunas[index];
                const conteudo = this._formatarCelula(valor, formato);
                
                tbody += `<td style="
                    width: ${larguraVW}vw;
                    text-align: ${alinhamento};
                    padding: 0.25rem;
                    border: 0.0625rem solid #ddd;
                    box-sizing: border-box;
                    font-size: 0.875rem;
                    line-height: 1.2;
                    min-height: 1.5rem;
                ">${conteudo}</td>`;
            });
            
            tbody += '</tr>';
        });
        
        return tbody + '</tbody>';
    }
    
    /**
     * Calcula limites máximos para evitar overflow no canvas
     * Container se adapta à tabela, respeitando limites do canvas
     * @returns {Object} {maxWidth, maxHeight} em vw/vh
     */
    _calcularLimitesCanvas() {
        const larguraTabelaVW = this._calcularLarguraTotal();
        const margemSeguranca = 3; // 3vw para padding + margem
        const larguraContainerVW = larguraTabelaVW + margemSeguranca;
        
        // Limites do canvas (considerando espaço disponível real)
        const limiteCanvasVW = 90; // 90vw deixa margem para interface
        const limiteCanvasVH = 80; // 80vh para altura
        
        const maxWidth = Math.min(larguraContainerVW, limiteCanvasVW);
        const maxHeight = limiteCanvasVH;
        
        return { 
            maxWidth, 
            maxHeight, 
            larguraTabela: larguraTabelaVW,
            precisaScroll: larguraContainerVW > limiteCanvasVW
        };
    }
    
    /**
     * Cria container com controle de overflow para qualquer conteúdo de tabela
     * Evita overflow no canvas, coloca scroll na tabela
     * @param {string} conteudoTabela - HTML da tabela completa
     * @returns {string} HTML do container com overflow controlado
     */
    _criarContainerComOverflow(conteudoTabela) {
        const { maxWidth, maxHeight, larguraTabela, precisaScroll } = this._calcularLimitesCanvas();
        
        return `
            <div class="tabela-wrapper" style="
                width: fit-content;
                max-width: ${maxWidth}vw;
                max-height: ${maxHeight}vh;
                overflow-x: ${precisaScroll ? 'auto' : 'hidden'};
                overflow-y: auto;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-sizing: border-box;
                padding: 0.5rem;
                background-color: #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
                ${conteudoTabela}
            </div>
        `;
    }
    
    /**
     * Gera tabela completa com header visual, tabela, footer e controle de overflow
     * Sequência organizada: Header → Tabela → Footer → Render
     * @returns {string} HTML completo da tabela com container
     */
    _gerarTabelaCompleta() {
        // 1️⃣ PREPARAÇÃO: Header Visual (título e descrição)
        const headerVisual = this._criarHeaderTabela();
        
        // 2️⃣ PREPARAÇÃO: Estrutura da Tabela
        const thead = this._gerarHTMLHeader();
        const tbody = this._gerarHTMLBody();
        const tfoot = this._criarFooterTabela(); // Footer integrado como tfoot
        
        // 3️⃣ CÁLCULOS: Largura da tabela (pode exceder viewport)
        const larguraTotalVW = this._calcularLarguraTotal();
        
        // 4️⃣ MONTAGEM: Estrutura HTML completa
        const conteudoTabela = `
            ${headerVisual}
            <table style="
                width: ${larguraTotalVW}vw;
                border-collapse: collapse;
                margin: 0;
                font-size: 0.875rem;
                table-layout: fixed;
                border: 0.125rem solid #003366;
            ">
                ${thead}
                ${tbody}
                ${tfoot}
            </table>
        `;
        
        // 6️⃣ RENDERIZAÇÃO: Container com overflow e HTML final
        return this._criarContainerComOverflow(conteudoTabela);
    }

   
}


// ===============================================================================
// 🧮 CLASSE GRIDANALISE - TABELAS DE RESULTADOS E ANÁLISES
// ===============================================================================

/**
 * Classe GridAnalise - Especializada em tabelas de resultados calculados
 * 
 * Diferente da GridDados (dados do banco), esta classe é otimizada para:
 * - Tabelas de análise com campos calculados
 * - Resumos financeiros e estatísticos  
 * - Dashboards com totalizadores
 * - Layout fixo de 2 colunas (Descrição | Valor)
 * - Linhas separadoras visuais
 * 
 * @example
 * const analise = new GridAnalise();
 * analise.titulo = "Análise Mensal";
 * analise.cabecalho = ["Descrição", "Valor"];
 * analise.setDados([
 *     {descricao: "Receita Total", valor: "5.000,00"},
 *     {separador: true},
 *     {descricao: "Despesas", valor: "3.200,00"}
 * ]);
 */
export class GridAnalise {
    
    constructor() {
        // ===== PROPRIEDADES ESSENCIAIS =====
        /** @type {string} Título da análise */
        this.titulo = '';
        
        /** @type {Array<string>} Cabeçalho da tabela (normalmente ["Descrição", "Valor"]) */
        this.cabecalho = ["Descrição", "Valor"];
        
        /** @type {Array<Object>} Dados da análise (preenchido via setDados()) */
        this.dados = [];
        
        // ===== CONFIGURAÇÕES VISUAIS =====
        /** @type {Array<number>} Larguras das colunas em % (padrão: 70% desc, 30% valor) */
        this.larguraColunas = [70, 30];
        
        /** @type {Array<string>} Alinhamento das colunas */
        this.alinhamento = ['E', 'D']; // Esquerda para descrição, Direita para valor
        
        /** @type {string} Classe CSS para estilização específica */
        this.cssClass = 'grid-analise';
        
        // ===== CONTROLE DE POSICIONAMENTO =====
        /** @type {Array<number>} Posição da div no layout [x, y] */
        this.posicao = [];
        
        /** @type {HTMLElement|null} Container da análise */
        this.container = null;
        
        console.log('✅ GridAnalise inicializada');
    }
    
    /**
     * Define os dados da análise com validação
     * @param {Array<Object>} dados - Array de objetos com dados da análise
     * @example 
     * [
     *   {descricao: "Receita", valor: "1000,00"},
     *   {separador: true},
     *   {descricao: "Despesa", valor: "800,00"}
     * ]
     */


    setDados(dados) {
        if (!Array.isArray(dados)) {
            throw new Error('Dados deve ser um array de objetos.');
        }
        
        this.dados = dados;
        
        // Constrói automaticamente quando dados são definidos
        if (dados.length > 0 && this.titulo) {
            this.construirAnalise();
        }
    }
    
    /**
     * Conecta a instância a um container dinâmico único
     * Cria div filha com ID padrão divSubRelEsp_nn
     */
    _conectarContainer() {
        // Usa função global padronizada
        this.container = criarDivFilhaRelatorio('divSubRelEsp', `container-analise ${this.cssClass}`);
        return this.container;
    }
    
    /**
     * Posiciona a div da análise conforme this.posicao
     */
    _posicionarDiv() {
        if (!this.container) {
            this._conectarContainer();
        }
        
        if (this.posicao.length === 0) {
            // Posicionamento automático (fluxo normal)
            this.container.style.position = 'relative';
            this.container.style.left = 'auto';
            this.container.style.top = 'auto';
        } else {
            // Posicionamento específico [x, y]
            const [x, y] = this.posicao;
            this.container.style.position = 'absolute';
            this.container.style.left = `${x}px`;
            this.container.style.top = `${y}px`;
        }
    }
    
    /**
     * Gera HTML da tabela de análise
     * @returns {string} HTML completo da tabela
     */
    _gerarHTMLAnalise() {
        // Header com título
        const header = `
            <div class="header-analise">
                <h3>${this.titulo}</h3>
            </div>
        `;
        
        // Cabeçalho da tabela
        const thead = `
            <thead>
                <tr>
                    ${this.cabecalho.map((col, i) => 
                        `<th style="width: ${this.larguraColunas[i]}%; text-align: ${this._alinhamentoCSS(this.alinhamento[i])}">${col}</th>`
                    ).join('')}
                </tr>
            </thead>
        `;
        
        // Corpo da tabela
        const tbody = `
            <tbody>
                ${this.dados.map(linha => {
                    if (linha.separador) {
                        return '<tr class="separador"><td colspan="2"><hr></td></tr>';
                    }
                    
                    return `
                        <tr>
                            <td style="text-align: ${this._alinhamentoCSS(this.alinhamento[0])}">${linha.descricao || ''}</td>
                            <td style="text-align: ${this._alinhamentoCSS(this.alinhamento[1])}">${linha.valor || ''}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        
        // Tabela completa
        const tabela = `
            <table class="tabela-analise">
                ${thead}
                ${tbody}
            </table>
        `;
        
        return header + tabela;
    }
    
    /**
     * Conversão de código de alinhamento para CSS
     * @param {string} codigo - Código de alinhamento (E/C/D)
     * @returns {string} Valor CSS
     */
    _alinhamentoCSS(codigo) {
        switch (codigo) {
            case 'E': return 'left';
            case 'C': return 'center';
            case 'D': return 'right';
            default: return 'left';
        }
    }
    
    /**
     * Constrói e renderiza a análise completa
     */
    construirAnalise() {
        // Conecta ao container se necessário
        if (!this.container) {
            this._conectarContainer();
        }
        
        // Gera HTML e insere no container
        const htmlCompleto = this._gerarHTMLAnalise();
        this.container.innerHTML = htmlCompleto;
        
        // Aplica posicionamento
        this._posicionarDiv();
        
        // Remove classe hidden se existir
        this.container.classList.remove('hidden');
        
        console.log(`✅ GridAnalise "${this.titulo}" construída no container ${this.container.id}`);
    }
    
    /**
     * Oculta a análise
     */
    ocultar() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }
    
    /**
     * Remove a análise do DOM
     */
    destruir() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }
    }
}

// ===============================================================================
// 📊 CLASSE GRIDCHART - GRÁFICOS INTERATIVOS COM CHART.JS
// ===============================================================================

/**
 * Classe GridChart - Especializada em criação de gráficos interativos
 * 
 * Utiliza Chart.js para criar gráficos modernos e responsivos:
 * - Gráficos de pizza, barras, linhas, donut
 * - Configuração flexível de dados e cores
 * - Arranjo horizontal ou vertical configurável
 * - Container único divSubRelChart_nn
 * - Integração automática com Chart.js
 * 
 * @example
 * const grafico = new GridChart();
 * grafico.titulo = "Despesas por Categoria";
 * grafico.tipo = "pizza";
 * grafico.arranjo = "horizontal";  // Legenda à direita
 * grafico.labels = ["Alimentação", "Transporte", "Lazer"];
 * grafico.valores = [1200, 800, 400];
 * grafico.criarGrafico();
 * 
 * @example
 * const colunas = new GridChart();
 * colunas.tipo = "barras";
 * colunas.arranjo = "vertical";  // Colunas verticais
 * colunas.labels = ["Jan", "Fev", "Mar"];
 * colunas.valores = [1000, 1500, 1200];
 * colunas.criarGrafico();
 */
export class GridChart {
    
    constructor() {
        // ===== PROPRIEDADES ESSENCIAIS =====
        /** @type {string} Título do gráfico */
        this.titulo = '';
        
        /** @type {string} Tipo do gráfico: 'pizza', 'barras', 'linhas', 'donut' */
        this.tipo = 'pizza';
        
        /** 
         * @type {string} Arranjo do gráfico
         * 'horizontal' = Padrão (barras verticais/colunas, legenda embaixo)
         * 'vertical' = Alternativo (barras horizontais, legenda ao lado)
         */
        this.arranjo = 'horizontal';
        
        /** @type {number} Largura do gráfico em pixels */
        this.largura = 400;
        
        /** @type {number} Altura do gráfico em pixels */
        this.altura = 300;
        
        // ===== DADOS DO GRÁFICO =====
        /** @type {Array<string>} Labels para o gráfico */
        this.labels = [];
        
        /** @type {Array<number>|Array<Array<number>>} Valores - simples ou múltiplas séries */
        this.valores = [];
        
        /** @type {Array<string>} Cores personalizadas (opcional - gera automático se vazio) */
        this.cores = [];
        
        // ===== CONTROLE DE POSICIONAMENTO =====
        /** @type {Array<number>} Posição da div no layout [x, y] */
        this.posicao = [];
        
        /** @type {HTMLElement|null} Container do gráfico */
        this.container = null;
        
        /** @type {Object|null} Instância do Chart.js */
        this.chartInstance = null;
        
        console.log('✅ GridChart inicializada');
    }
    
    /**
     * Conecta a instância a um container dinâmico único
     * Cria div filha com ID padrão divSubRelChart_nn
     */
    _conectarContainer() {
        // Usa função global padronizada
        this.container = criarDivFilhaRelatorio('divSubRelChart', 'container-grafico');
        return this.container;
    }
    
    /**
     * Posiciona a div do gráfico conforme this.posicao
     */
    _posicionarDivFilha() {
        if (!this.container) {
            this._conectarContainer();
        }
        
        if (this.posicao.length === 0) {
            // Posicionamento automático (fluxo normal do HTML)
            this.container.style.position = 'relative';
            this.container.style.left = 'auto';
            this.container.style.top = 'auto';
        } else {
            // Posicionamento específico [x, y] em pixels
            const [x, y] = this.posicao;
            this.container.style.position = 'absolute';
            this.container.style.left = `${x}px`;
            this.container.style.top = `${y}px`;
            console.log(`🔧 GridChart posicionado em: position: absolute, left: ${x}px, top: ${y}px`);
        }
    }
    
    /**
     * Gera cores automáticas se não fornecidas
     * @param {number} quantidade - Quantidade de cores necessárias
     * @returns {Array<string>} Array de cores em formato hexadecimal
     */
    _gerarCoresAutomaticas(quantidade) {
        const coresPadrao = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
            '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
        ];
        
        const cores = [];
        for (let i = 0; i < quantidade; i++) {
            cores.push(coresPadrao[i % coresPadrao.length]);
        }
        
        return cores;
    }
    
    /**
     * Formata dados conforme o tipo de gráfico
     * @returns {Object} Dados formatados para Chart.js
     */
    _formatarDados() {
        const cores = this.cores.length > 0 ? this.cores : this._gerarCoresAutomaticas(this.labels.length);
        
        switch (this.tipo) {
            case 'pizza':
            case 'donut':
                return {
                    labels: this.labels,
                    datasets: [{
                        data: this.valores,
                        backgroundColor: cores,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                };
                
            case 'barras':
                return {
                    labels: this.labels,
                    datasets: [{
                        label: this.titulo || 'Dados',
                        data: this.valores,
                        backgroundColor: cores[0] || '#36A2EB',
                        borderColor: cores[0] || '#36A2EB',
                        borderWidth: 1
                    }]
                };
                
            case 'linhas':
                return {
                    labels: this.labels,
                    datasets: [{
                        label: this.titulo || 'Dados',
                        data: this.valores,
                        borderColor: cores[0] || '#36A2EB',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    }]
                };
                
            default:
                throw new Error(`Tipo de gráfico "${this.tipo}" não suportado`);
        }
    }
    
    /**
     * Gera configurações do Chart.js baseadas no tipo
     * @returns {Object} Configurações para Chart.js
     */
    _gerarConfiguracoes() {
        const configBase = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: !!this.titulo,
                    text: this.titulo,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        };
        
        // Configurações específicas por tipo
        switch (this.tipo) {
            case 'pizza':
                return {
                    type: 'pie',
                    data: this._formatarDados(),
                    options: {
                        ...configBase,
                        plugins: {
                            ...configBase.plugins,
                            legend: {
                                display: true,
                                position: this.arranjo === 'vertical' ? 'right' : 'bottom'
                            }
                        }
                    }
                };
                
            case 'donut':
                return {
                    type: 'doughnut',
                    data: this._formatarDados(),
                    options: {
                        ...configBase,
                        plugins: {
                            ...configBase.plugins,
                            legend: {
                                display: true,
                                position: this.arranjo === 'vertical' ? 'right' : 'bottom'
                            }
                        }
                    }
                };
                
            case 'barras':
                return {
                    type: 'bar',
                    data: this._formatarDados(),
                    options: {
                        ...configBase,
                        indexAxis: this.arranjo === 'vertical' ? 'y' : 'x',
                        scales: {
                            [this.arranjo === 'vertical' ? 'x' : 'y']: {
                                beginAtZero: true
                            }
                        }
                    }
                };
                
            case 'linhas':
                return {
                    type: 'line',
                    data: this._formatarDados(),
                    options: {
                        ...configBase,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                };
                
            default:
                throw new Error(`Tipo de gráfico "${this.tipo}" não suportado`);
        }
    }
    
    /**
     * Valida se Chart.js está disponível
     * @throws {Error} Se Chart.js não estiver carregado
     */
    _validarChartJS() {
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js não está carregado. Adicione o script Chart.js ao HTML: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
        }
    }
    
    /**
     * Cria e renderiza o gráfico
     */
    criarGrafico() {
        try {
            // Validações
            this._validarChartJS();
            
            if (this.labels.length === 0 || this.valores.length === 0) {
                throw new Error('Labels e valores são obrigatórios');
            }
            
            if (this.labels.length !== this.valores.length) {
                throw new Error('Labels e valores devem ter o mesmo tamanho');
            }
            
            // Conecta ao container se necessário
            if (!this.container) {
                this._conectarContainer();
            }
            
            // Destrói gráfico anterior se existir
            if (this.chartInstance) {
                this.chartInstance.destroy();
            }
            
            // Cria canvas para o gráfico
            const canvas = document.createElement('canvas');
            canvas.id = `chart_${this.container.id}`;
            canvas.width = this.largura;
            canvas.height = this.altura;
            
            // Limpa container e adiciona canvas
            this.container.innerHTML = '';
            this.container.appendChild(canvas);
            
            // Aplica estilos ao container ANTES do posicionamento
            this.container.style.width = `${this.largura}px`;
            this.container.style.height = `${this.altura}px`;
            this.container.style.border = '1px solid #ddd';
            this.container.style.borderRadius = '4px';
            this.container.style.padding = '10px';
            this.container.style.backgroundColor = '#fff';
            this.container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            
            // Cria instância Chart.js
            const ctx = canvas.getContext('2d');
            const config = this._gerarConfiguracoes();
            this.chartInstance = new Chart(ctx, config);
            
            // Remove classe hidden se existir
            this.container.classList.remove('hidden');
            
            // ===== APLICA POSICIONAMENTO APÓS CHART.JS TERMINAR =====
            setTimeout(() => {
                this._posicionarDivFilha();
            }, 100);
            
            console.log(`✅ GridChart "${this.titulo}" criado no container ${this.container.id}`);
            
        } catch (error) {
            console.error('❌ Erro ao criar gráfico:', error.message);
            
            // Exibe erro no container
            if (this.container) {
                this.container.innerHTML = `
                    <div style="
                        color: red; 
                        text-align: center; 
                        padding: 20px;
                        border: 1px solid red;
                        border-radius: 4px;
                        background-color: #ffe6e6;
                    ">
                        <strong>Erro ao criar gráfico:</strong><br>
                        ${error.message}
                    </div>
                `;
            }
        }
    }
    
    /**
     * Atualiza dados do gráfico existente
     * @param {Array<string>} novasLabels - Novos labels
     * @param {Array<number>} novosValores - Novos valores
     */
    atualizarDados(novasLabels, novosValores) {
        if (!this.chartInstance) {
            throw new Error('Gráfico não foi criado ainda. Use criarGrafico() primeiro.');
        }
        
        this.labels = novasLabels;
        this.valores = novosValores;
        
        const dadosFormatados = this._formatarDados();
        this.chartInstance.data = dadosFormatados;
        this.chartInstance.update();
        
        console.log('✅ Dados do gráfico atualizados');
    }

    /**
     * Atualiza a posição do gráfico (pode ser chamado após criação)
     * @param {Array<number>} novaPosicao - Nova posição [x, y] ou [] para automático
     */
    atualizarPosicao(novaPosicao) {
        this.posicao = novaPosicao || [];
        this._posicionarDivFilha();
        console.log('✅ Posição do gráfico atualizada');
    }
    
    /**
     * Oculta o gráfico
     */
    ocultar() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }
    
    /**
     * Remove o gráfico do DOM
     */
    destruir() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }
    }
}

// ===============================================================================
// 🔎 CLASSE GRIDLFiltros - CONTRUÇÃO DE FILTROS DINÂMICOS
// ===============================================================================
/**
 * GridFiltros
 * Configuração mínima:
 *  new GridFiltros({ titulo: 'Filtros', fields: [ {key,label,type:'select', optionsProvider: async ()=>[...] } ] })
 *
 * Comportamento:
 * - render(parentId='divRelatorio') cria uma div filha do container de relatórios
 *   seguindo o padrão divSubRelFiltro_N (preservando o padrão do projeto)
 * - para cada field do tipo 'select', chama field.optionsProvider() (se existir)
 *   para popular o select (assíncrono). optionsProvider deve retornar array {value,label}
 * - fornece onApply(cb) para registrar callback quando o usuário clicar em Aplicar
 * - dispara CustomEvent 'gridfiltros:apply' no container com detail = values
 */
export class GridFiltros {
    constructor(config = {}) {
        this.titulo = config.titulo || '';
        this.fields = Array.isArray(config.fields) ? config.fields : [];
        this.posicao = config.posicao || [];
        this.container = null;
        this._callbacks = [];
        this._id = `divSubRelFiltro_${++contadorContainers}`;
    }

    // Cria o container e renderiza os controles
    async render(parentId = 'divRelatorio') {
        const parent = document.getElementById(parentId) || document.body;

        // Tentar usar helper global criarDivFilhaRelatorio quando disponível
        if (typeof criarDivFilhaRelatorio === 'function') {
            this.container = criarDivFilhaRelatorio('divSubRelFiltro', this._id);
        } else {
            // fallback: criar manualmente
            this.container = document.createElement('div');
            this.container.id = this._id;
            this.container.className = 'divSubRelFiltro';
            parent.appendChild(this.container);
        }

        // aplicar posição se definida
        if (this.posicao && this.posicao.length === 2) {
            this.container.style.position = 'absolute';
            this.container.style.left = `${this.posicao[0]}px`;
            this.container.style.top = `${this.posicao[1]}px`;
        }

        // Cabecalho
        if (this.titulo) {
            const h = document.createElement('h4');
            h.textContent = this.titulo;
            h.style.margin = '0 0 0.4rem 0';
            this.container.appendChild(h);
        }

        const form = document.createElement('div');
        form.className = 'grid-filtros-form';
        this.container.appendChild(form);

        // criar campos
        for (const field of this.fields) {
            const fieldWrapper = document.createElement('div');
            fieldWrapper.className = 'grid-filtros-field';
            fieldWrapper.style.display = 'inline-block';
            fieldWrapper.style.marginRight = '0.5rem';
            fieldWrapper.style.verticalAlign = 'middle';

            const label = document.createElement('label');
            label.textContent = field.label || field.key || '';
            label.style.fontSize = '0.85rem';
            
            // Checkbox: label e input na mesma linha
            if (field.type === 'checkbox') {
                label.style.display = 'inline-block';
                label.style.marginLeft = '0.3rem';
                label.style.verticalAlign = 'middle';
                label.style.cursor = 'pointer';
            } else {
                label.style.display = 'block';
                label.style.marginBottom = '0.15rem';
            }
            
            fieldWrapper.appendChild(label);

            if (field.type === 'select') {
                const select = document.createElement('select');
                select.name = field.key;
                select.dataset.fieldKey = field.key;
                select.style.minWidth = '120px';
                select.appendChild(new Option('--', ''));

                // popular via optionsProvider (assíncrono) ou via options estático
                if (typeof field.optionsProvider === 'function') {
                    try {
                        const opts = await field.optionsProvider();
                        if (Array.isArray(opts)) {
                            for (const o of opts) {
                                select.appendChild(new Option(o.label, o.value));
                            }
                        }
                    } catch (e) {
                        console.error('Erro ao popular select via optionsProvider:', e);
                    }
                } else if (Array.isArray(field.options)) {
                    for (const o of field.options) {
                        select.appendChild(new Option(o.label, o.value));
                    }
                }

                if (field.value != null) select.value = field.value;
                fieldWrapper.appendChild(select);
            } else if (field.type === 'checkbox') {
                // Suporte a checkbox - INSERIR ANTES DO LABEL
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.name = field.key;
                input.dataset.fieldKey = field.key;
                input.checked = field.value || false;
                input.style.width = 'auto';
                input.style.cursor = 'pointer';
                input.style.verticalAlign = 'middle';
                
                // Inserir checkbox ANTES do label (já foi appendChild acima)
                fieldWrapper.insertBefore(input, label);
            } else {
                // fallback: input text
                const input = document.createElement('input');
                input.type = 'text';
                input.name = field.key;
                input.dataset.fieldKey = field.key;
                
                // Detectar campo monetário (type='currency' ou formato='M' ou formato='moeda')
                const isCurrency = field.type === 'currency' || 
                                  field.formato === 'M' || 
                                  field.formato === 'moeda';
                
                if (isCurrency) {
                    // Marcar como campo monetário
                    input.dataset.tipoMonetario = 'true';
                    input.placeholder = '0,00';
                    
                    // Formatar valor inicial se existir
                    if (field.value != null) {
                        const valorNumerico = typeof field.value === 'number' ? 
                                             field.value : 
                                             converterMoedaParaNumero(field.value);
                        input.value = converterNumeroParaMoeda(valorNumerico);
                    }
                    
                    // Adicionar formatação automática durante digitação
                    input.addEventListener('input', (e) => {
                        // Remove tudo exceto números
                        let apenasNumeros = e.target.value.replace(/\D/g, '');
                        if (!apenasNumeros) {
                            e.target.value = '';
                            return;
                        }
                        // Converte para número (centavos) e divide por 100
                        const valorNumerico = parseInt(apenasNumeros) / 100;
                        // Formata de volta
                        e.target.value = converterNumeroParaMoeda(valorNumerico);
                    });
                } else {
                    // Campo não-monetário: apenas atribui valor
                    if (field.value != null) input.value = field.value;
                }
                
                fieldWrapper.appendChild(input);
            }

            form.appendChild(fieldWrapper);
        }

        // botões
        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'grid-filtros-actions';
        btnWrapper.style.display = 'inline-block';
        btnWrapper.style.verticalAlign = 'middle';
        btnWrapper.style.marginLeft = '0.5rem';

        const btnApply = document.createElement('button');
        btnApply.type = 'button';
        btnApply.textContent = 'Aplicar';
        btnApply.className = 'btn-apply-filtros';
        btnApply.addEventListener('click', () => this._handleApply());
        btnWrapper.appendChild(btnApply);

        form.appendChild(btnWrapper);

        return this.container;
    }

    // Retorna um objeto com os valores dos campos
    getValues() {
        if (!this.container) return {};
        const values = {};
        const elements = this.container.querySelectorAll('[data-field-key]');
        elements.forEach(el => {
            const key = el.dataset.fieldKey;
            const tipoMonetario = el.dataset.tipoMonetario === 'true';
            
            if (el.type === 'checkbox') {
                // Checkbox retorna boolean
                values[key] = el.checked;
            } else if (tipoMonetario) {
                // Campo monetário: converte "3.125,00" → 3125.00
                values[key] = converterMoedaParaNumero(el.value);
            } else {
                // Outros campos retornam string
                values[key] = el.value;
            }
        });
        return values;
    }

    onApply(cb) {
        if (typeof cb === 'function') this._callbacks.push(cb);
    }

    _handleApply() {
        const values = this.getValues();
        // chamar callbacks
        for (const cb of this._callbacks) {
            try { cb(values); } catch (e) { console.error(e); }
        }
        // disparar evento customizado no container
        if (this.container) {
            const ev = new CustomEvent('gridfiltros:apply', { detail: values });
            this.container.dispatchEvent(ev);
        }
    }

    // Remove container e listeners
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }
    }
}

// ===== ***** FUNÇÕES AUXILIARES ***** =====

/**
 * FUNÇÃO GLOBAL PARA CRIAR DIVS FILHAS PADRONIZADAS
 * Centraliza a criação de containers para todas as classes
 * @param {string} prefixoId - Prefixo para o ID da div (ex: 'divSubRel', 'divSubRelChart')
 * @param {string} className - Classe CSS a ser aplicada
 * @returns {HTMLElement} Container criado e anexado ao DOM
 */
function criarDivFilhaRelatorio(prefixoId = 'divSubRel', className = 'container-sub-relatorio') {
    // Busca container pai
    const containerPai = document.getElementById('divRelatorio');
    
    if (!containerPai) {
        throw new Error('Container pai #divRelatorio não encontrado no DOM. Verifique se o HTML possui este elemento.');
    }
    
    // Gera ID único usando contador global
    contadorContainers++;
    const numeroFormatado = String(contadorContainers).padStart(2, '0');
    const novoId = `${prefixoId}_${numeroFormatado}`;
    
    // Cria div filha com ID único
    const novoContainer = document.createElement('div');
    novoContainer.id = novoId;
    novoContainer.className = className;
    
    // Anexa ao container pai
    containerPai.appendChild(novoContainer);
    
    return novoContainer;
}
