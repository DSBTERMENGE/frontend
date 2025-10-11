/**
 * Nova classe GridDados que herda de FormularioBase
 * Sistema avançado de exibição de dados tabulares
 * + Sistema avançado de cálculos estatísticos
 * + Integração com CriarBtnRodape
 * + Formatação e alinhamento avançados
 */

import { FormularioBase } from './ConstrutorDeFormularioBase.js';
import { CriarBtnRodape } from './ConstrutorBtnRodapeForms.js';

export class GridDados extends FormularioBase {
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
     * @param {Object} [posicaoCanvas={x: 3, y: 5}] - Posição da tabela no canvas
     * @param {number} posicaoCanvas.x - Posição horizontal em vw
     * @param {number} posicaoCanvas.y - Posição vertical em vh
     * 
     * @param {Object} [opcoes={}] - Configurações avançadas opcionais
     * @param {boolean} [opcoes.edicaoDeDados=false] - Permite edição inline das células
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
        super('', {x: 3, y: 5}, 'tabela');
        
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
        /** @type {boolean} Permite edição inline das células */
        this.edicaoDeDados = false;
        
        /** @type {Array<string>|null} Config. analytics no footer (Tot, Med, Max, etc.) */
        this.configResultados = null;
        
        /** @type {Object} Configurações adicionais da tabela */
        this.tabelaConfig = {};
        
        // ===== INTEGRAÇÃO COM OUTROS COMPONENTES =====
        /** @type {CriarBtnRodape|null} Objeto de botões personalizados */
        this.objBotoes = null;
        
        // ===== INICIALIZAÇÃO =====
        // Não executa validação nem renderização automática
        // Propriedades devem ser definidas manualmente antes do uso
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

    /**
     * Validação robusta de consistência entre propriedades correlacionadas
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
     */
    setDados(dados) {
        if (!Array.isArray(dados)) {
            throw new Error('Dados deve ser um array de objetos.');
        }
        
        this.dados = dados;
        this.calcularAlturaMaxima();
        
        // ✅ CONSTRÓI A TABELA automaticamente quando dados são definidos
        if (dados.length > 0 && this.form && this.form.querySelector('#mainTabela')) {
            this.construirTabela();
        }
    }

    /**
     * Popula a tabela com novos dados e reconstrói (usado pelo sistema de cascata)
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
        
        // Reconstrói a tabela se já estiver renderizada
        if (this.form && this.form.querySelector('#mainTabela')) {
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
            case 'M': // Moeda
                return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
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

            celulasResultado += `<td style="width:${larguraVW}vw; text-align:${alinhamento}; font-weight: bold; background-color: #b3d9ff; box-sizing:border-box; padding: 0.5rem; border: 0.0625rem solid #666; font-size: 0.875rem;">${conteudo}</td>`;
        });

        return `<tfoot><tr style="border-top: 0.125rem solid #666;">${celulasResultado}</tr></tfoot>`;
    }

    /**
     * Configura event listeners para edição (se habilitada)
     */
    _configurarEdicao() {
        if (!this.form) return;
        
        const celulasEditaveis = this.form.querySelectorAll('td[contenteditable="true"]');
        celulasEditaveis.forEach((celula, index) => {
            celula.addEventListener('blur', () => {
                // Atualiza dados quando célula perde foco
                const linha = Math.floor(index / this.cabecalho.length);
                const coluna = index % this.cabecalho.length;
                const nomeColuna = this.cabecalho[coluna];
                
                if (this.dados[linha]) {
                    this.dados[linha][nomeColuna] = celula.textContent;
                }
            });
        });
    }

    /**
     * Configura o sistema de eventos em cascata (Estado → Cidade → Tabela)
     */
    _configurarEventosCascata() {
        const divControles = this.form.querySelector('#divControlesTabela');
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
    _popularCidadesPorEstado(estado) {
        if (!estado || !this.objSelect) return;
        
        // Dados simulados de cidades por estado
        const cidadesPorEstado = {
            'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'],
            'RJ': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Nova Friburgo'],
            'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
            'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria'],
            'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'],
            'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa'],
            'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José'],
            'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde'],
            'PE': ['Recife', 'Jaboatão', 'Olinda', 'Caruaru'],
            'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú']
        };
        
        const cidades = cidadesPorEstado[estado] || [];
        
        // Formata dados para a select
        const dadosSelect = [
            { value: '', text: 'Selecione uma Cidade' },
            { value: 'Todas', text: 'Todas' },
            ...cidades.map(cidade => ({ value: cidade, text: cidade }))
        ];
        
        // Popula a segunda select (cidade)
        this.objSelect.popularSelect('cidade', dadosSelect);
        
        console.log(`🏙️ Populadas ${cidades.length} cidades para ${estado}`);
    }

    /**
     * Popula a tabela baseada na cidade selecionada
     */
    _popularTabelaPorCidade(cidade, estado) {
        if (!cidade || !estado) {
            // Limpa a tabela se não há seleção válida
            this.setDados([]);
            return;
        }
        
        // Dados simulados de estudantes
        const estudantesPorCidade = {
            'São Paulo': [
                { Nome: 'Ana Souza', Estado: 'SP', Cidade: 'São Paulo', Curso: 'Engenharia' },
                { Nome: 'Daniel Alves', Estado: 'SP', Cidade: 'São Paulo', Curso: 'Arquitetura' },
                { Nome: 'Carlos Silva', Estado: 'SP', Cidade: 'São Paulo', Curso: 'Medicina' }
            ],
            'Campinas': [
                { Nome: 'Maria Santos', Estado: 'SP', Cidade: 'Campinas', Curso: 'Computação' },
                { Nome: 'João Costa', Estado: 'SP', Cidade: 'Campinas', Curso: 'Administração' }
            ],
            'Santos': [
                { Nome: 'Pedro Lima', Estado: 'SP', Cidade: 'Santos', Curso: 'Direito' }
            ],
            'Rio de Janeiro': [
                { Nome: 'Lucia Pereira', Estado: 'RJ', Cidade: 'Rio de Janeiro', Curso: 'Design' },
                { Nome: 'Roberto Silva', Estado: 'RJ', Cidade: 'Rio de Janeiro', Curso: 'Jornalismo' }
            ],
            'Belo Horizonte': [
                { Nome: 'Fernanda Costa', Estado: 'MG', Cidade: 'Belo Horizonte', Curso: 'Psicologia' }
            ]
        };
        
        let dadosTabela = [];
        
        if (cidade === 'Todas') {
            // Se selecionou "Todas", mostra dados de todas as cidades do estado
            Object.keys(estudantesPorCidade).forEach(key => {
                const estudantes = estudantesPorCidade[key];
                if (estudantes.length > 0 && estudantes[0].Estado === estado) {
                    dadosTabela = dadosTabela.concat(estudantes);
                }
            });
        } else {
            // Mostra dados da cidade específica
            dadosTabela = estudantesPorCidade[cidade] || [];
        }
        
        // Popula a tabela
        this.popularTabela(dadosTabela);
        
        console.log(`📊 Populada tabela com ${dadosTabela.length} estudantes de ${cidade}, ${estado}`);
    }

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
        const divMensagem = this.form?.querySelector('#divMensagemTabela');
        const labelMensagem = this.form?.querySelector('#labelMensagem');
        
        if (!divMensagem || !labelMensagem) return;
        
        // Trunca a mensagem se for muito longa
        const mensagemTruncada = mensagem.length > 150 ? 
            mensagem.substring(0, 147) + '...' : mensagem;
        
        // Define cores baseadas no tipo
        const cores = {
            info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' },
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
        };
        
        const cor = cores[tipo] || cores.info;
        
        // Aplica a mensagem e estilo
        labelMensagem.textContent = mensagemTruncada;
        divMensagem.style.display = 'block';
        divMensagem.style.backgroundColor = cor.bg;
        divMensagem.style.borderTopColor = cor.border;
        labelMensagem.style.color = cor.text;
    }
    
    /**
     * Oculta a mensagem do footer (volta altura 0)
     */
    ocultarMensagem() {
        const divMensagem = this.form?.querySelector('#divMensagemTabela');
        const labelMensagem = this.form?.querySelector('#labelMensagem');
        
        if (divMensagem && labelMensagem) {
            divMensagem.style.display = 'none';
            labelMensagem.textContent = '';
        }
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
     * Limpa todo o conteúdo da tabela (REAPROVEITADO!)
     */
    _limparConteudo() {
        if (!this.form) return;
        
        // Limpa área de controles
        const controlesEl = this.form.querySelector('#divControlesTabela');
        if (controlesEl) controlesEl.innerHTML = '';

        // Limpa a tabela principal
        const mainTabelaEl = this.form.querySelector('#mainTabela');
        if (mainTabelaEl) mainTabelaEl.innerHTML = '';

        // Limpa mensagens do footer
        this.ocultarMensagem();
        
        // Limpa botões do rodapé
        const divBotoes = document.getElementById('divBotoes');
        if (divBotoes) divBotoes.innerHTML = '';
    }

    /**
     * Renderização completa da tabela (OVERRIDE da classe base)
     */
    render() {
        // Configuração específica da tabela - NÃO chama super.render() para evitar conflitos
        this.configurarContainer();
        this.posicionarNoCanvas(this.posicaoCanvas.x, this.posicaoCanvas.y);
        this.exibir();
        
        // Aplica título e descrição específicos da tabela
        if (this.descricao) {
            this.configurarHeader(this.titulo, this.descricao);
        } else {
            this.configurarHeader(this.titulo);
        }
        
        // Footer tem sistema de mensagens
    }

    /**
     * Construção principal da tabela (método essencial)
     */
    construirTabela() {
        const mainTabelaEl = this.form?.querySelector('#mainTabela');
        if (!mainTabelaEl) return;

        // ✅ CORREÇÃO COMPLETA: VW (horizontal) + VH (vertical) + REM (spacing/font)
        // As larguras já vêm em vw do construtor - mantém responsividade horizontal
        const larguras = [...this.larguraColunas];
        const somaLargVW = larguras.reduce((a, b) => a + b, 0);
        const larguraTotalVW = Math.max(somaLargVW, 30); // Mínimo 30vw

        // Gera header
        let thead = '<thead><tr>';
        this.cabecalho.forEach((titulo, index) => {
            const alinhamento = this._alinhamentoCSS(this.alinhamento[index]);
            const larguraVW = larguras[index]; // Mantém em vw (horizontal)
            
            thead += `<th style="
                width: ${larguraVW}vw;
                text-align: ${alinhamento};
                background-color: #003366;
                color: white;
                font-weight: bold;
                padding: 0.5rem;
                border: 0.0625rem solid #ddd;
                box-sizing: border-box;
                font-size: 0.875rem;
                line-height: 1.2;
            ">${titulo}</th>`;
        });
        thead += '</tr></thead>';

        // Gera corpo da tabela
        let tbody = '<tbody>';
        this.dados.forEach((linha) => {
            tbody += '<tr>';
            this.cabecalho.forEach((coluna, index) => {
                const valor = linha[coluna];
                const formato = this.formato[index];
                const alinhamento = this._alinhamentoCSS(this.alinhamento[index]);
                const larguraVW = larguras[index]; // Mantém em vw (horizontal)
                const conteudo = this._formatarCelula(valor, formato);
                
                const contenteditable = this.edicaoDeDados ? 'contenteditable="true"' : '';
                
                tbody += `<td style="
                    width: ${larguraVW}vw;
                    text-align: ${alinhamento};
                    padding: 0.5rem;
                    border: 0.0625rem solid #ddd;
                    box-sizing: border-box;
                    font-size: 0.875rem;
                    line-height: 1.4;
                    min-height: 2.5rem;
                " ${contenteditable}>${conteudo}</td>`;
            });
            tbody += '</tr>';
        });
        tbody += '</tbody>';

        // Gera footer (se configurado)
        const tfoot = this._gerarLinhaResultados();

        // Monta tabela completa com medidas responsivas adequadas
        mainTabelaEl.innerHTML = `
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

        // Configura edição se habilitada
        if (this.edicaoDeDados) {
            this._configurarEdicao();
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
        
        if (this.form) {
            this.form.style.height = `${alturaMaxVH}vh`;
            this.form.style.minHeight = `25vh`; // Altura mínima em vh
        }
    }

    /**
     * Método estático para criação simplificada (MELHORADO!)
     */
    static criar(titulo, descricao, cabecalho, larguraColunas, alinhamento, formato, dados = [], posicaoCanvas = {x: 3, y: 5}, opcoes = {}) {
        const tabela = new CriarTabelas(
            titulo, descricao, cabecalho, larguraColunas, 
            alinhamento, formato, posicaoCanvas, opcoes
        );
        
        if (dados.length > 0) {
            tabela.setDados(dados);
        }
        
        tabela.render();
        
        return tabela;
    }

    /**
     * Método estático para fechar qualquer tabela ativa (COMPATIBILIDADE!)
     */
    static fecharTabela() {
        const divFormTabela = document.getElementById('divFormTabela');
        if (divFormTabela) {
            divFormTabela.classList.add('hidden');
        }
    }
}
