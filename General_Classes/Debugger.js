/*
************************************************************
                    DEBUGGER - FRAMEWORK DSB
************************************************************

Módulo utilitário para debugging básico.

************************************************************
*/

/**
 * � FUNÇÃO INTERNA: Obtém localização da chamada (arquivo:linha)
 * @returns {Object} {arquivo, linha}
 */
function _obterLocalizacao() {
    try {
        const stack = new Error().stack.split('\n');
        const linhaChamadora = stack[3]; // Pula Error, _obterLocalizacao e função que chamou
        
        // Extrai arquivo:linha do stack trace
        const match = linhaChamadora.match(/(\w+\.js):(\d+)/);
        
        if (match) {
            const [, arquivo, linha] = match;
            return { arquivo, linha };
        } else {
            return { arquivo: 'arquivo desconhecido', linha: 'linha desconhecida' };
        }
    } catch (error) {
        return { arquivo: 'erro localização', linha: 'erro localização' };
    }
}

/**
 * � FLOW MARKER: Marca pontos de passagem do fluxo de execução
 * @param {string} msg - Mensagem opcional (padrão: "Fluxo passou por aqui")
 */
function flow_marker(msg = 'Fluxo passou por aqui') {
    const { arquivo, linha } = _obterLocalizacao();
    console.log(`${arquivo}, linha ${linha}, ${msg}`);
}

/**
 * 🚨 ERROR CATCHER: Captura e reporta erros com localização
 * @param {string} msgDesenvolvedor - Mensagem do desenvolvedor (padrão: "erro capturado")
 * @param {Error} errorObj - Objeto de erro do catch
 */
function error_catcher(msgDesenvolvedor = 'erro capturado', errorObj) {
    const { arquivo, linha } = _obterLocalizacao();
    const descricaoErro = errorObj ? errorObj.message : 'erro desconhecido';
    console.error(`${arquivo}, linha: ${linha}, ${msgDesenvolvedor}, ${descricaoErro}`);
}

/**
 * 🚨 UNEXPECTED ERROR CATCHER: Captura erros inesperados globalmente com stack trace
 * Registra event handlers para capturar erros não tratados em qualquer módulo
 */
function unexpected_error_catcher() {
    // Captura erros síncronos globais
    window.addEventListener('error', function(event) {
        const { filename, lineno, message, error } = event;
        const arquivo = filename ? filename.split('/').pop() : 'arquivo desconhecido';
        
        console.group('🚨 ERRO INESPERADO CAPTURADO');
        console.error(`${arquivo}, linha ${lineno}, Descrição do erro pelo sys: ${message}`);
        
        // Stack trace detalhado se disponível
        if (error && error.stack) {
            console.error('📋 Stack trace completo:');
            const stackLines = error.stack.split('\n').slice(1, 6); // Primeiras 5 linhas
            stackLines.forEach(linha => {
                if (linha.trim()) {
                    console.error(`  ↳ ${linha.trim()}`);
                }
            });
        }
        console.groupEnd();
    });
    
    // Captura promises rejeitadas não tratadas
    window.addEventListener('unhandledrejection', function(event) {
        const erro = event.reason;
        
        console.group('🚨 PROMISE REJEITADA');
        console.error(`Promise não tratada, Descrição do erro pelo sys: ${erro}`);
        
        if (erro && erro.stack) {
            console.error('📋 Stack trace:');
            const stackLines = erro.stack.split('\n').slice(1, 6);
            stackLines.forEach(linha => {
                if (linha.trim()) {
                    console.error(`  ↳ ${linha.trim()}`);
                }
            });
        }
        console.groupEnd();
    });
    
    console.log('🚨 Unexpected Error Catcher ativado - monitorando erros globais');
}

export {
    flow_marker,
    error_catcher,
    unexpected_error_catcher
};
