/*
*===============================================================
*                 FUNÇÕES PARA CÁLCULOS MATEMÁTICOS
*===============================================================
*/

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
        let valor = dados[i][nomeColuna];
        if (!valor) valor = '0';
        valor = valor.toString().replace(/[.,]/g, '');
        if (isNaN(valor)) valor = 0;
        else valor = (valor / 100).toFixed(2);
        
        soma = soma + parseFloat(valor);
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
        let valor = dados[i][nomeColuna];
        
        if (typeof valor === 'string') {
            valor = valor.replace(/[R$%\s]/g, '').replace(',', '.');
        }
        
        const numeroConvertido = parseFloat(valor);
        if (!isNaN(numeroConvertido) && numeroConvertido > maximo) {
            maximo = numeroConvertido;
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
        let valor = dados[i][nomeColuna];
        
        if (typeof valor === 'string') {
            valor = valor.replace(/[R$%\s]/g, '').replace(',', '.');
        }
        
        const numeroConvertido = parseFloat(valor);
        if (!isNaN(numeroConvertido) && numeroConvertido < minimo) {
            minimo = numeroConvertido;
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
export function formatarResultado(resultado, nomeColuna) {
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
 * Cria título e descrição do relatório na divTituloRelatorio
 * @param {string} titulo - Título principal do relatório
 * @param {string} descricao - Descrição/subtítulo do relatório (opcional)
 */
export function CriaTituloDeFormulario(titulo, descricao) {
    const divTitulo = document.getElementById('divTituloRelatorio');
    if (!divTitulo) return;
    
    divTitulo.innerHTML = `
        <h2 style="margin: 0 0 0.5rem 0; color: #003366; font-size: 1.5rem; text-align: center;">${titulo}</h2>
        ${descricao ? `<p style="margin: 0 0 1rem 0; color: #666; font-size: 0.9rem; text-align: center; font-style: italic;">${descricao}</p>` : ''}
    `;
}