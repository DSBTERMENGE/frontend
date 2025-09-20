// exemplo_invctl_main.js
// Exemplo de como uma aplicação InvCtl usaria a mesma estratégia

import {api_fe} from '../framework_dsb/frontend/General_Classes/frontend_api.js';

/*
************************************************************
       INSTÂNCIA GLOBAL DA API DO INVCTL
************************************************************
 */

// Criando instância global da API para o InvCtl (controle de inventário)
window.api_invctl = new api_fe();

// Configurando propriedades específicas do InvCtl
window.api_invctl.aplicacao = "InvCtl";
window.api_invctl.versao = "1.0.0";
window.api_invctl.base_url = "http://localhost:5001"; // Porta diferente se necessário
window.api_invctl.debug = true;

console.log('✅ API InvCtl inicializada:', window.api_invctl);

/*
************************************************************
       EXEMPLO DE USO EM FORMULÁRIOS DO INVCTL
************************************************************
 */

// Em qualquer formulário do InvCtl, você pode usar:

async function exemploUsoAPIInvCtl() {
    
    // ========== LISTAGEM ==========
    // Para obter produtos do inventário
    window.api_invctl.tabela = 'vw_produtos_inventario';
    const produtos = await window.api_invctl.obter_view();
    
    // ========== INSERÇÃO ==========
    // Para inserir novo produto
    window.api_invctl.tabela = 'tb_produtos';
    window.api_invctl.dados = {
        codigo: 'PROD001',
        nome: 'Produto Exemplo',
        categoria: 'Eletrônicos',
        preco: 299.99,
        estoque: 50
    };
    const resultadoInsercao = await window.api_invctl.inserir();
    
    // ========== ATUALIZAÇÃO ==========
    // Para atualizar produto existente
    window.api_invctl.tabela = 'tb_produtos';
    window.api_invctl.dados = {
        nome: 'Produto Atualizado',
        preco: 349.99,
        estoque: 45
    };
    window.api_invctl.condicao = "codigo = 'PROD001'";
    const resultadoAtualizacao = await window.api_invctl.atualizar();
    
    // ========== EXCLUSÃO ==========
    // Para excluir produto
    window.api_invctl.tabela = 'tb_produtos';
    window.api_invctl.condicao = "codigo = 'PROD001'";
    const resultadoExclusao = await window.api_invctl.excluir();
    
    console.log('Operações InvCtl executadas:', {
        produtos,
        resultadoInsercao,
        resultadoAtualizacao,
        resultadoExclusao
    });
}

/*
************************************************************
       VANTAGENS DESTA ABORDAGEM
************************************************************
 
1. ✅ UMA INSTÂNCIA POR APLICAÇÃO
   - window.api_info para FinCtl
   - window.api_invctl para InvCtl
   - window.api_cliente para outro sistema...

2. ✅ CONFIGURAÇÃO GLOBAL ÚNICA
   - Propriedades definidas uma vez no main.js
   - Todos os formulários herdam a configuração
   - Fácil manutenção e alteração

3. ✅ ZERO CONFLITOS ENTRE APLICAÇÕES
   - Cada app tem sua própria instância
   - Configurações independentes
   - Bancos de dados separados se necessário

4. ✅ SINTAXE LIMPA E SEMÂNTICA
   - api_info.tabela = "grupos"
   - api_info.dados = {...}
   - api_info.inserir()

5. ✅ REUTILIZAÇÃO TOTAL DO FRAMEWORK
   - Mesma classe api_fe para todas as aplicações
   - Sem duplicação de código
   - Manutenção centralizada

 */
