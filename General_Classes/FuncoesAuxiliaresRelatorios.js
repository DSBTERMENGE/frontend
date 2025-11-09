// Import para tratamento de erros
import { flow_marker, error_catcher, unexpected_error_catcher } from './Debugger.js';

/*
*===============================================================
*                 FUNÇÕES PARA CÁLCULOS MATEMÁTICOS
*===============================================================
*/

/**
 * 🔢 CONVERSÃO UNIVERSAL - Converte qualquer valor para número
 * Similar ao Val() do Visual Basic - aceita números, strings formatadas, etc.
 * @param {any} valor - Valor a converter (número, string formatada "3.125,00", etc)
 * @returns {number} Valor numérico ou 0 se inválido
 */
export function Val(valor) {
    // Se já é número, retorna direto
    if (typeof valor === 'number') {
        return isNaN(valor) ? 0 : valor;
    }
    
    // Se é string, limpa formatação brasileira
    if (typeof valor === 'string') {
        // Remove espaços, R$, %, etc
        let limpo = valor.replace(/[R$%\s]/g, '');
        // Remove pontos de milhares
        limpo = limpo.replace(/\./g, '');
        // Troca vírgula decimal por ponto
        limpo = limpo.replace(',', '.');
        // Converte para número
        const numero = parseFloat(limpo);
        return isNaN(numero) ? 0 : numero;
    }
    
    // Null, undefined, ou qualquer outra coisa = 0
    return 0;
}

/**
 * 🎭 FUNÇÃO ORQUESTRADORA - Executa operação matemática em uma coluna
 * Gerencia todo o processo: validação → cálculo → resultado
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna a ser processada
 * @param {string} tipoOperacao - Tipo de operação (Tot, Med, Max, Min, etc.)
 * @returns {number} Resultado da operação matemática
 */
export function executarOperacao(dados, nomeColuna, tipoOperacao) {
    // 1️⃣ VALIDAÇÃO: Verificar se há dados válidos
    if (!dados || dados.length === 0) {
        return 0;
    }
    
    // 2️⃣ SELEÇÃO: Executar operação específica
    switch (tipoOperacao) {
        case 'Tot':
        case 'Sum':


            return calcularSoma(dados, nomeColuna);
        
        case 'Med':
        case 'Avg':
            return calcularMedia(dados, nomeColuna);
        
        case 'Max':
            return calcularMaximo(dados, nomeColuna);
        
        case 'Min':
            return calcularMinimo(dados, nomeColuna);
        
        case 'Cnt':
            return calcularContagem(dados, nomeColuna);
        
        case 'StdDev':
            return calcularDesvioPadrao(dados, nomeColuna);
        
        case 'Var':
            return calcularVariancia(dados, nomeColuna);
        
        case 'Range':
            return calcularAmplitude(dados, nomeColuna);
        
        case 'First':
            return obterPrimeiro(dados, nomeColuna);
        
        case 'Last':
            return obterUltimo(dados, nomeColuna);
        
        default:
            console.warn(`⚠️ Operação '${tipoOperacao}' não reconhecida. Usando soma por padrão.`);
            return calcularSoma(dados, nomeColuna);
    }
}

/**
 * ➕ SOMA - Calcula soma total de uma coluna
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna onde a soma ocorrerá
 * @returns {number} Soma total dos valores da coluna
 */
export function calcularSoma(dados, nomeColuna) {
    let soma = 0;
    
    for (let i = 0; i < dados.length; i++) {
        soma += Val(dados[i][nomeColuna]);
    }
    
    return soma;
}

/**
 * ➕ SOMA CONDICIONAL - Soma coluna baseada em critério de outra coluna
 * @param {Array} dados - Array de dados
 * @param {string} colunaTarget - Nome da coluna a ser somada
 * @param {string} colunaRef - Nome da coluna de referência para critério
 * @param {'Empty'|'NotEmpty'|'S'|'N'} valor - Critério para soma (apenas um dos valores)
 * @returns {number} Soma condicional dos valores
 */
export function calcularSomaSe(dados, colunaTarget, colunaRef, valor) {
    // Função vazia por enquanto
}

/**
 * 📊 MÉDIA ARITMÉTICA
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna
 * @returns {number} Média dos valores
 */
export function calcularMedia(dados, nomeColuna) {
    const soma = calcularSoma(dados, nomeColuna);
    const quantidade = calcularContagem(dados, nomeColuna);
    return quantidade > 0 ? soma / quantidade : 0;
}

/**
 * 📈 VALOR MÁXIMO
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna
 * @returns {number} Maior valor
 */
export function calcularMaximo(dados, nomeColuna) {
    let maximo = -Infinity;
    
    for (let i = 0; i < dados.length; i++) {
        const valor = Val(dados[i][nomeColuna]);
        if (valor > maximo) {
            maximo = valor;
        }
    }
    
    return maximo === -Infinity ? 0 : maximo;
}

/**
 * 📉 VALOR MÍNIMO
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna
 * @returns {number} Menor valor
 */
export function calcularMinimo(dados, nomeColuna) {
    let minimo = Infinity;
    
    for (let i = 0; i < dados.length; i++) {
        const valor = Val(dados[i][nomeColuna]);
        if (valor < minimo) {
            minimo = valor;
        }
    }
    
    return minimo === Infinity ? 0 : minimo;
}

/**
 * 🔢 CONTAGEM DE REGISTROS
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna
 * @returns {number} Quantidade de valores válidos
 */
export function calcularContagem(dados, nomeColuna) {
    let contador = 0;
    
    for (let i = 0; i < dados.length; i++) {
        let valor = dados[i][nomeColuna];
        
        if (typeof valor === 'string') {
            valor = valor.replace(/[R$%\s]/g, '').replace(',', '.');
        }
        
        const numeroConvertido = parseFloat(valor);
        if (!isNaN(numeroConvertido)) {
            contador++;
        }
    }
    
    return contador;
}

/**
 * 📏 DESVIO PADRÃO
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna
 * @returns {number} Desvio padrão dos valores
 */
export function calcularDesvioPadrao(dados, nomeColuna) {
    const variancia = calcularVariancia(dados, nomeColuna);
    return Math.sqrt(variancia);
}

/**
 * 📐 VARIÂNCIA
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna
 * @returns {number} Variância dos valores
 */
export function calcularVariancia(dados, nomeColuna) {
    const media = calcularMedia(dados, nomeColuna);
    const quantidade = calcularContagem(dados, nomeColuna);
    
    if (quantidade === 0) return 0;
    
    let somaQuadrados = 0;
    
    for (let i = 0; i < dados.length; i++) {
        let valor = dados[i][nomeColuna];
        
        if (typeof valor === 'string') {
            valor = valor.replace(/[R$%\s]/g, '').replace(',', '.');
        }
        
        const numeroConvertido = parseFloat(valor);
        if (!isNaN(numeroConvertido)) {
            somaQuadrados += Math.pow(numeroConvertido - media, 2);
        }
    }
    
    return somaQuadrados / quantidade;
}

/**
 * 📊 AMPLITUDE (Range)
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna
 * @returns {number} Diferença entre máximo e mínimo
 */
export function calcularAmplitude(dados, nomeColuna) {
    const maximo = calcularMaximo(dados, nomeColuna);
    const minimo = calcularMinimo(dados, nomeColuna);
    return maximo - minimo;
}

/**
 * 🥇 PRIMEIRO VALOR
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna
 * @returns {number} Primeiro valor válido
 */
export function obterPrimeiro(dados, nomeColuna) {
    for (let i = 0; i < dados.length; i++) {
        let valor = dados[i][nomeColuna];
        
        if (typeof valor === 'string') {
            valor = valor.replace(/[R$%\s]/g, '').replace(',', '.');
        }
        
        const numeroConvertido = parseFloat(valor);
        if (!isNaN(numeroConvertido)) {
            return numeroConvertido;
        }
    }
    return 0;
}

/**
 * 🏁 ÚLTIMO VALOR
 * @param {Array} dados - Array de dados
 * @param {string} nomeColuna - Nome da coluna
 * @returns {number} Último valor válido
 */
export function obterUltimo(dados, nomeColuna) {
    for (let i = dados.length - 1; i >= 0; i--) {
        let valor = dados[i][nomeColuna];
        
        if (typeof valor === 'string') {
            valor = valor.replace(/[R$%\s]/g, '').replace(',', '.');
        }
        
        const numeroConvertido = parseFloat(valor);
        if (!isNaN(numeroConvertido)) {
            return numeroConvertido;
        }
    }
    return 0;
}

/**
 * Determina automaticamente o tipo de operação baseado no nome da coluna
 * @param {string} nomeColuna - Nome da coluna
 * @returns {string} Tipo de operação (Tot, Med, Max, Min, etc.)
 */
export function determinarOperacaoColuna(nomeColuna) {
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
export function obterLabelOperacao(operacao) {
    const labels = {
        'Tot': 'Total',
        'Med': 'Média', 
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
export function formatarResultado(resultado, nomeColuna) {
    const nomeMinusculo = nomeColuna.toLowerCase();
    
    // Se é valor monetário, formata como número (SEM R$)
    if (nomeMinusculo.includes('valor') || 
        nomeMinusculo.includes('preco') || 
        nomeMinusculo.includes('custo') ||
        nomeMinusculo.includes('receita') ||
        nomeMinusculo.includes('despesa')) {
        return resultado.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
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
 * Cria título e descrição em container específico
 * @param {string} titulo - Título principal 
 * @param {string} descricao - Descrição/subtítulo (opcional)
 * @param {string} containerId - ID do container ("Relatorio" para divTituloRelatorio ou ID específico)
 */
export function CriaTituloDeRelatorios(titulo, descricao, containerId) {
    try {
        // Busca os elementos h1 e h2 fixos criados no HTML (estrutura base do index.html)
        const h1 = document.getElementById('h1TituloRelatorio');
        const h2 = document.getElementById('h2DescricaoRelatorio');
        
        if (!h1 || !h2) {
            throw new Error('Elementos h1TituloRelatorio ou h2DescricaoRelatorio não encontrados no DOM');
        }
        
        // Popula os elementos com os valores recebidos
        h1.textContent = titulo;
        h2.textContent = descricao || '';
        
        // Garantir que o container principal de relatórios esteja visível
        try {
            const divRelatorio = document.getElementById('divRelatorio');
            if (divRelatorio && divRelatorio.classList.contains('hidden')) {
                divRelatorio.classList.remove('hidden');
                // opcional: garantir display padrão caso haja regras CSS que escondam
                divRelatorio.style.display = divRelatorio.style.display || '';
            }
        } catch (e) {
            // não interromper a criação do título por causa deste ajuste
            console.warn('CriaTituloDeRelatorios: não foi possível garantir visibilidade de #divRelatorio', e);
        }
        
    } catch (error) {
        error_catcher('FuncoesAuxiliaresRelatorios.js', 0, `Erro ao criar título: ${error.message}`);
    }
}

/**
 * 🗑️ FUNÇÃO DE ENCERRAMENTO DE RELATÓRIOS
 * Limpa memória, elementos HTML e variáveis do relatório
 */
export function encerrarRelatorio() {
    try {
        console.log('🗑️ Iniciando encerramento do relatório...');
        
        // 1. LIMPAR ELEMENTOS HTML
        const divRelatorio = document.getElementById('divRelatorio');
        if (divRelatorio) {
            // NÃO remover toda a estrutura do container (preservar título/controles estáticos)
            // Remover apenas os filhos dinâmicos do relatório, preservando o elemento
            // estrutural `#divTituloRelatorio` (onde ficam os botões de controle).
            const children = Array.from(divRelatorio.children);
            for (const child of children) {
                if (child.id === 'divTituloRelatorio') {
                    // Limpar somente o conteúdo textual do título (se existir wrapper)
                    const wrapper = child.querySelector('.titulo-rel-wrapper');
                    if (wrapper) {
                        wrapper.innerHTML = '';
                    } else {
                        // Se não houver wrapper, tente limpar h2/p diretos
                        const h2 = child.querySelector('h2');
                        if (h2) h2.textContent = '';
                        const p = child.querySelector('p');
                        if (p) p.textContent = '';
                    }
                    // Preserve o elemento de título (não remover)
                    continue;
                }

                // Remover elementos dinâmicos do relatório
                try {
                    if (child.parentNode) child.parentNode.removeChild(child);
                } catch (e) {
                    // ignorar erro de remoção e continuar
                    console.warn('Não foi possível remover child do divRelatorio:', e);
                }
            }
            divRelatorio.classList.add('hidden'); // Oculta o relatório
        }
        
        // 2. DESTRUIR GRÁFICOS Chart.js (se existirem)
        if (window.Chart && window.Chart.instances) {
            Object.values(window.Chart.instances).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
        }
        
        // 3. LIMPAR CONTADORES DE DIVS
        if (window.subrelatorio_counter) {
            window.subrelatorio_counter = 1;
        }
        if (window.subrelatorio_esp_counter) {
            window.subrelatorio_esp_counter = 1;
        }
        if (window.subrelatorio_chart_counter) {
            window.subrelatorio_chart_counter = 1;
        }
        
        // 4. FORÇAR GARBAGE COLLECTION (se disponível)
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        console.log('✅ Relatório encerrado e memória limpa');
        
    } catch (error) {
        error_catcher('FuncoesAuxiliaresRelatorios.js', 0, `Erro ao encerrar relatório: ${error.message}`);
    }
}

/**
 * Popula uma <select> HTML com opções vindas de uma consulta SQL.
 * @param {HTMLElement|string} selectOrId - elemento <select> ou id do elemento
 * @param {string} sql - consulta SQL que retorna linhas com colunas para value/label
 * @param {Object} [options]
 * @param {string} [options.valueCol] - nome da coluna a usar como value (se ausente usa primeira coluna)
 * @param {string} [options.labelCol] - nome da coluna a usar como label (se ausente usa value)
 * @param {boolean} [options.includeTodos=true] - incluir opção inicial 'TODOS' com value ''
 * @returns {Promise<Array<{value:string,label:string}>>} array de opções populadas
 */
export async function populaSelectFiltro(selectOrId, sql, options = {}) {
    const { valueCol = null, labelCol = null, includeTodos = true } = options;

    // localizar elemento
    let selectEl = null;
    if (typeof selectOrId === 'string') selectEl = document.getElementById(selectOrId);
    else if (selectOrId instanceof HTMLElement) selectEl = selectOrId;

    if (!selectEl) {
        console.warn('populaSelectFiltro: select não encontrado', selectOrId);
        return [];
    }

    // limpar select e colocar placeholder de carregamento
    selectEl.innerHTML = '';
    if (includeTodos) {
        selectEl.appendChild(new Option('TODOS', ''));
    }
    const loadingOption = new Option('Carregando...', '');
    loadingOption.disabled = true;
    selectEl.appendChild(loadingOption);

    try {
        const res = await window.api_rel_info.executar_sql(sql, window.api_rel_info.const_database_path, window.api_rel_info.const_database_name);
        // remover loading
        try { selectEl.removeChild(loadingOption); } catch (e) {}

        const rows = res && Array.isArray(res.dados) ? res.dados : [];
        const opts = [];
        for (const row of rows) {
            // determinar value e label
            let value;
            if (valueCol && row.hasOwnProperty(valueCol)) value = row[valueCol];
            else value = row[Object.keys(row)[0]];

            let label;
            if (labelCol && row.hasOwnProperty(labelCol)) label = row[labelCol];
            else label = value;

            const opt = new Option(String(label), String(value));
            selectEl.appendChild(opt);
            opts.push({ value: String(value), label: String(label) });
        }

        return opts;
    } catch (error) {
        console.warn('populaSelectFiltro: erro ao executar SQL', error);
        try { selectEl.removeChild(loadingOption); } catch (e) {}
        return [];
    }
}