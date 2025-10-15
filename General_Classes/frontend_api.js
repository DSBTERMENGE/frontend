// Importando funções de debugging (primeiro para seguir critério)
import { flow_marker, error_catcher, unexpected_error_catcher } from './Debugger.js';

/**
 * 🌐 CLASSE PRINCIPAL: API Frontend para comunicação com Backend
 * 
 * Classe instanciável para gerenciar comunicação HTTP entre frontend e backend.
 * Suporta operações CRUD, consultas de views, e população automática de formulários.
 * Projetada para reutilização em múltiplas aplicações do Framework DSB.
 * 
 * ✅ Comunicação HTTP padronizada via fetch()
 * ✅ Operações CRUD automáticas (inserir, atualizar, excluir)
 * ✅ Consultas de views com filtros
 * ✅ População automática de formulários
 * ✅ Configuração flexível por propriedades
 * ✅ Error handling robusto
 * ✅ Logging automático para debug
 * 
 * @example
 * // PADRÃO RECOMENDADO: Instância local com configuração por propriedades
 * const api = new api_fe        console.log('🗄️ Database:', config.database_config);
        console.log('📋 View atual:', config.view);
        console.log('🎯 Tabela alvo:', config.tabela_alvo);
        console.log('📝 Campos obrigatórios:', config.campos_obrigatorios);
        console.log('📥 Dados form in:', config.dados_form_in); * api.aplicacao = "FinCtl";
 * api.backend_url = "http://localhost:5000";
 * api.database_name = "financas.db";
 * api.database_path = "c:\\path\\to\\database";
 * api.view = "vw_grupos";
 * api.tabela_alvo = "tb_grupos";
 * api.campos = ["Todos"];
 * api.campos_obrigatorios = ["grupo", "descricao"];
 * 
 * // Uso para consultas
 * const dados = await api.obter_view();
 * 
 * // Uso para população de formulários
 * await api.popularform("grupos", "vw_grupos", {modo: "primeiro"});
 * 
 * @author Framework DSB
 * @version 3.0.0 - Reorganização com padrão DSB e property-based configuration
 */

/**
 * 🎯 CLASSE api_fe - API Frontend instanciável para múltiplas aplicações
 * 
 * Permite comunicação padronizada entre frontend JavaScript e backend Python.
 * Cada instância pode ser configurada para aplicações específicas mantendo
 * independência de configurações e estados.
 * 
 * @property {string} aplicacao - Nome da aplicação que utiliza esta instância
 * @property {string} application_path - Caminho do repositório da aplicação (ex: "C:\\Applications_DSB\\FinCtl")
 * @property {string} versao - Versão da aplicação (opcional)
 * @property {boolean} debug - Flag para ativar logs detalhados de debug
 * @property {string} backend_url - URL completa do servidor backend (ex: "http://localhost:5000")
 * @property {number} timeout - Timeout em ms para requisições HTTP (padrão: 10000)
 * @property {Object} headers - Headers HTTP padrão para requisições
 * 
 * @property {string} database_name - Nome do arquivo de banco de dados (ex: "financas.db")
 * @property {string} database_path - Caminho completo para o diretório do banco
 * @property {string} database_host - Host do banco (para bancos remotos)
 * 
 * @property {string} view - Nome da view ativa para consultas (ex: "vw_grupos")
 * @property {string} tabela_alvo - Nome da tabela para operações CRUD (ex: "tb_grupos")
 * @property {Array<string>} campos - Campos retornados de consultas: ["Todos"] (padrão) ou ["campo1", "campo2"] (específicos)
 * @property {Array<string>} campos_obrigatorios - Campos obrigatórios para validação CRUD: ["campo1", "campo2"] ou ["Todos"] (todos obrigatórios)
 * 
 * @property {Object} dados_form_out - Template de dados enviado para formulário (estrutura vazia)
 * @property {Object} dados_form_in - Dados preenchidos recebidos do formulário
 */
export default class api_fe {
    /**
     * 🏗️ CONSTRUCTOR: Inicializa instância de API Frontend
     * 
     * ⚡ PADRÃO RECOMENDADO: Constructor minimalista + configuração por propriedades
     * 
     * @param {string} [app_name="framework_app"] - Nome da aplicação
     * @param {string} [backend_url="http://localhost:5000"] - URL do servidor backend
     * 
     * @example
     * // ✅ MODO RECOMENDADO: Instância local + configuração por propriedades
     * const api = new api_fe();
     * api.aplicacao = "MeuApp";
     * api.backend_url = "http://localhost:8000";
     * api.database_name = "meuapp.db";
     * 
     * @example
     * // ✅ MODO ALTERNATIVO: Constructor com parâmetros básicos
     * const api = new api_fe("FinCtl", "http://localhost:5000");
     */
    constructor(app_name = "framework_app", backend_url = "http://localhost:5000") {
        
        // =====================================
        // 🎯 CONFIGURAÇÕES DA APLICAÇÃO
        // =====================================
        
        /**
         * Nome da aplicação que utiliza esta instância da API
         * @type {string}
         * @example "FinCtl", "Estoque", "CRM"
         */
        this.const_aplicacao = app_name;
        
        /**
         * Caminho do repositório da aplicação (path completo)
         * @type {string}
         * @example "C:\\Applications_DSB\\FinCtl", "C:\\Applications_DSB\\Estoque"
         */
        this.const_application_path = "";
        
        /**
         * Versão da aplicação (informativo)
         * @type {string}
         * @example "1.0.0", "2.1.3-beta"
         */
        this.const_versao = "";
        
        /**
         * Flag para ativar logs detalhados de debug
         * @type {boolean}
         */
        this.const_debug = false;
        
        // =====================================
        // 🌐 CONFIGURAÇÕES DE COMUNICAÇÃO
        // =====================================
        
        /**
         * URL completa do servidor backend
         * @type {string}
         * @example "http://localhost:5000", "https://api.meusite.com"
         */
        this.const_backend_url = backend_url;
        
        /**
         * Timeout para requisições HTTP em milissegundos
         * @type {number}
         */
        this.const_timeout = 10000; // 10 segundos
        
        /**
         * Referência ao formulário atualmente ativo no sistema
         * @type {HTMLElement|null}
         * @example document.querySelector('#form-subgrupos')
         */
        this.form_ativo = null;
        
        /**
         * Headers HTTP padrão para todas as requisições
         * @type {Object}
         */
        this.const_headers = {};
        
        // =====================================
        // 🗄️ CONFIGURAÇÕES DO BANCO DE DADOS
        // =====================================
        
        /**
         * Nome do arquivo de banco de dados
         * @type {string}
         * @example "financas.db", "estoque.db"
         */
        this.const_database_name = "";
        
        /**
         * Caminho completo para o diretório do banco de dados
         * @type {string}
         * @example "c:\\apps\\backend\\database", "/home/user/db"
         */
        this.const_database_path = "";
        
        /**
         * Host do servidor de banco (para bancos remotos)
         * @type {string}
         * @example "localhost", "192.168.1.100"
         */
        this.const_database_host = "";
        
        // =====================================
        // 📋 CONFIGURAÇÕES DE DADOS
        // =====================================
        
        /**
         * Nome da view por pdarão deve ser o nome da tabela alvo + "_view" 
         * @type {string}
         * @example "vw_grupos", "vw_lancamentos_completos"
         * @usage Usado em: popularform(), buscar_todos(), consultas gerais
         */
        this.view = '';
        
        /**
         * Nome da view específica para popular selects de filtro
         * @type {string}
         * @example "grupos_view", "estados_view" 
         * @usage Usado para consultas específicas de dados que vão popular selects de filtro
         * @description View otimizada para retornar apenas os dados necessários para options das selects
         */
        this.view_Select = '';
        
        /**
         * Nome da tabela para operações CRUD (OPERAÇÕES DE ESCRITA)
         * @type {string}
         * @example "tb_grupos", "tb_lancamentos"
         * @usage Usado em: inserir(), atualizar(), excluir() - NÃO usado em consultas
         */
        this.tabela_alvo = '';
        
        /**
         * Campos que serão retornados das consultas (OPERAÇÕES DE LEITURA)
         * 
         * CONVENÇÃO OBRIGATÓRIA: Os nomes dos elementos HTML devem ser idênticos aos nomes das colunas da view.
         * Exemplo: Se a view tem coluna 'grupo', o HTML deve ter <input name="grupo"> ou <input id="grupo">
         * 
         * @type {Array<string>}
         * @example ["Todos"] para todos os campos ou ["grupo", "descricao"] para específicos
         * @usage Usado em: popularform(), buscar_todos(), consultas gerais
         * @convention HTML elements name/id = view column name (required for auto-population)
         */
        /**
         * Array com nomes dos campos que vão para o formulário, se usar 'Todos" todos os campos da view serão retornados
         * @type {Array<string>}
         * @example ["Todos"] para todos os campos ou ["grupo", "descricao"] para específicos
         * @usage Usado em: popularform(), buscar_todos(), consultas gerais
         * @convention HTML elements name/id = view column name (required for auto-population)
         */
        this.campos = ["Todos"];
        
        /**
         * Array com nomes dos campos obrigatórios para operações CRUD (OPERAÇÕES DE ESCRITA)
         * @type {Array<string>}
         * @example ["grupo", "descricao"] para validação em inserção/atualização
         * @usage Usado em: inserir(), atualizar() - NÃO usado em consultas
         */
        this.campos_obrigatorios = [];
        
        // =====================================
        // 🔄 DADOS DE FORMULÁRIOS
        // =====================================
        
        /**
         * Dados que entram no formulário vindos do banco de dados (dicionário para popular formulário)
         * @type {Object}
         * @example {nome: "João", email: "joao@email.com", telefone: "123456"}
         */
        this.dados_form_in = {};
        
        /**
         * Dados que saem do formulário para o banco de dados (formato dicionário de dados)
         * @type {Object}
         * @example {nome: "Maria", email: "maria@email.com", telefone: "654321"}
         */
        this.dados_form_out = {};
        
        /**
         * Chave primária da tabela (opcional - fallback: descoberta automática)
         * @type {string}
         * @example "idgrupo", "idsubgrupo"
         */
        this.pk = "";
        
        /**
         * Array com nomes dos campos relacionados para capturar IDs de selects
         * @type {Array<string>}
         * @example [], ["idgrupo"], ["idcategoria", "idsubcategoria"]
         */
        this.campos_relacionados = [];
        
        /**
         * String de filtros para sistema de selects em cascata
         * @type {string}
         * @example "var1 = *, var2 = *, var3 = RJ", "idgrupo = 5, idcategoria = *"
         * @description Controla filtros aplicados nas consultas de selects de filtro
         */
        this.filtros = "";
        
        console.log(`✅ api_fe inicializada para aplicação '${app_name}' apontando para ${backend_url}`);
    }
    
    // ===============================================================
    // 📋 MÉTODO ATIVO - REQUISIÇÕES
    // ===============================================================
    
    /**
     * Método genérico para buscar dados do backend para população de formulários
     * 
     * @param {string} the_view - View específica a ser consultada
     * @returns {Promise<Object>} Dados recebidos do backend ou dicionário vazio
     */
    async consulta_dados_form(the_view) {
        try {
            flow_marker('📋 consulta_dados_form() iniciado');
            
            // Validação básica
            if (!this.view) {
                throw new Error("View não configurada. Configure this.view primeiro.");
            }
            
            // Faz requisição direta para o endpoint /consultar_dados_db
            const url = `${this.const_backend_url}/consultar_dados_db`;
            
            // Validar filtro antes de enviar - se contém *, enviar vazio
            const filtros = this.filtros.includes(' = *') ? '' : this.filtros;
            
            const payload = {
                view: the_view,
                campos: this.campos || ["Todos"],
                database_path: this.const_database_path || "",
                database_name: this.const_database_name || "",
                application_path: this.const_application_path,
                filtros: filtros
            };

            flow_marker(`🌐 Fazendo requisição para: ${url}`, payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: this.const_headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const resultado = await response.json();
            flow_marker('✅ consulta_dados_form() concluído');
            return resultado; // Backend já retorna no formato { dados: [...], mensagem: "sucesso" }
            
        } catch (error) {
            error_catcher('❌ Erro no consulta_dados_form():', error);
            return {
                dados: [],
                mensagem: error.message
            };
        }
    }
    
    /**
     * 📝 Atualiza registro existente no banco de dados
     * 
     * @param {Object} dados_para_update - Dados para atualizar (dicionário chave-valor)
     * @returns {Promise<Object>} Resultado da operação de update
     */
    async update_data(dados_para_update) {
        try {
            flow_marker('🔄 update_data() iniciado');
            
            // Validação básica das propriedades obrigatórias
            if (!this.tabela_alvo) {
                throw new Error("Propriedade tabela_alvo não configurada");
            }
            
            if (!dados_para_update || Object.keys(dados_para_update).length === 0) {
                throw new Error("Dados para update não fornecidos");
            }
            
            // Monta payload completo para o backend
            const url = `${this.const_backend_url}/update_data_db`;
            const payload = {
                tabela_alvo: this.tabela_alvo,
                campos: this.campos || [],
                campos_obrigatorios: this.campos_obrigatorios || [],
                database_name: this.const_database_name || "",
                database_path: this.const_database_path || "",
                dados: dados_para_update,
                application_path: this.const_application_path
            };
            
            flow_marker(`🌐 Enviando UPDATE para: ${url}`, payload);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: this.const_headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const resultado = await response.json();
            flow_marker('✅ update_data() concluído');
            return resultado;
            
        } catch (error) {
            error_catcher('Erro no update_data', error);
            return { 
                sucesso: false, 
                mensagem: error.message 
            };
        }
    }
    
    /**
     * ➕ Insere novo registro no banco de dados
     * 
     * @param {Object} dados_novo_registro - Dados do novo registro (dicionário chave-valor)
     * @returns {Promise<Object>} Resultado da operação de inserção
     */
    async incluir_reg_novo(dados_novo_registro) {
        try {
            flow_marker('➕ incluir_reg_novo() iniciado');
            
            // Validação básica das propriedades obrigatórias
            if (!this.tabela_alvo) {
                throw new Error("Propriedade tabela_alvo não configurada");
            }
            
            if (!dados_novo_registro || Object.keys(dados_novo_registro).length === 0) {
                throw new Error("Dados para inserção não fornecidos");
            }
            
            // Monta payload completo para o backend
            const url = `${this.const_backend_url}/incluir_reg_novo_db`;
            const payload = {
                tabela_alvo: this.tabela_alvo,
                campos: this.campos || [],
                campos_obrigatorios: this.campos_obrigatorios || [],
                database_name: this.const_database_name || "",
                database_path: this.const_database_path || "",
                dados: dados_novo_registro,
                application_path: this.const_application_path
            };
            
            flow_marker(`🌐 Enviando INSERT para: ${url}`, payload);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: this.const_headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const resultado = await response.json();
            flow_marker('✅ incluir_reg_novo() concluído');
            return resultado;
            
        } catch (error) {
            error_catcher('Erro no incluir_reg_novo', error);
            return { 
                sucesso: false, 
                mensagem: error.message 
            };
        }
    }
    

 /**
     * Método genérico para atualizar registros noend 
     * 
     * @returns {Promise<Object>} Retorna True se bem sucedido na atualização
     */

    /**
     * Processa extratos PDF e extrai despesas automaticamente
     * 
     * Executa o processo completo de:
     * 1. Validação dos arquivos PDF na pasta de extratos
     * 2. Extração dos dados financeiros
     * 3. Classificação das despesas
     * 4. Salvamento no banco de dados
     * 
     * @returns {Promise<Object>} Objeto com resultado do processamento
     * @example
     * // Exemplo de uso
     * const resultado = await api_info.processar_extratos_pdf();
     * if (resultado.sucesso) {
     *     console.log('Extratos processados:', resultado.dados_processados);
     * } else {
     *     console.error('Erro:', resultado.erro);
     * }
     */
    async processar_extratos_pdf() {
        flow_marker('INÍCIO frontend_api.processar_extratos_pdf');
        
        try {
            const configuracao = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            flow_marker('Enviando requisição para /processar_extratos_pdf');
            
            const response = await fetch('/processar_extratos_pdf', configuracao);
            const dados = await response.json();

            flow_marker('Resposta recebida do backend', dados);

            if (response.ok && dados.sucesso) {
                flow_marker('Processamento de extratos concluído com sucesso');
                return {
                    sucesso: true,
                    mensagem: dados.mensagem,
                    dados_processados: dados.dados_processados
                };
            } else {
                flow_marker(`Erro no processamento: ${dados.erro} (Etapa: ${dados.etapa})`);
                return {
                    sucesso: false,
                    erro: dados.erro,
                    etapa: dados.etapa || 'desconhecida'
                };
            }

        } catch (error) {
            error_catcher('Erro no processar_extratos_pdf', error);
            return {
                sucesso: false,
                erro: `Erro de conexão: ${error.message}`,
                etapa: 'conexao'
            };
        }
    }

} // FIM DA CLASSE api_fe

// Log de inicialização do módulo
console.log('🚀 Módulo frontend_api.js carregado - Classe api_fe disponível');
console.log('📖 Framework DSB - Sistema de API Frontend v2.0');