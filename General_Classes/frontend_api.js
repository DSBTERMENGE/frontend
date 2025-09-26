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
        this.aplicacao = app_name;
        
        /**
         * Caminho do repositório da aplicação (path completo)
         * @type {string}
         * @example "C:\\Applications_DSB\\FinCtl", "C:\\Applications_DSB\\Estoque"
         */
        this.application_path = "";
        
        /**
         * Versão da aplicação (informativo)
         * @type {string}
         * @example "1.0.0", "2.1.3-beta"
         */
        this.versao = "";
        
        /**
         * Flag para ativar logs detalhados de debug
         * @type {boolean}
         */
        this.debug = false;
        
        // =====================================
        // 🌐 CONFIGURAÇÕES DE COMUNICAÇÃO
        // =====================================
        
        /**
         * URL completa do servidor backend
         * @type {string}
         * @example "http://localhost:5000", "https://api.meusite.com"
         */
        this.backend_url = backend_url;
        
        /**
         * Timeout para requisições HTTP em milissegundos
         * @type {number}
         */
        this.timeout = 10000; // 10 segundos
        
        /**
         * Headers HTTP padrão para todas as requisições
         * @type {Object}
         */
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // =====================================
        // 🗄️ CONFIGURAÇÕES DO BANCO DE DADOS
        // =====================================
        
        /**
         * Nome do arquivo de banco de dados
         * @type {string}
         * @example "financas.db", "estoque.db"
         */
        this.database_name = "";
        
        /**
         * Caminho completo para o diretório do banco de dados
         * @type {string}
         * @example "c:\\apps\\backend\\database", "/home/user/db"
         */
        this.database_path = "";
        
        /**
         * Host do servidor de banco (para bancos remotos)
         * @type {string}
         * @example "localhost", "192.168.1.100"
         */
        this.database_host = "";
        
        // =====================================
        // 📋 CONFIGURAÇÕES DE DADOS
        // =====================================
        
        /**
         * Nome da view ativa para consultas de dados (OPERAÇÕES DE LEITURA)
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
            if (!the_view) {
                error_catcher('❌ Erro no consulta_dados_form():', error);
            }
            
            // Faz requisição direta para o endpoint /consultar_dados_db
            const url = `${this.backend_url}/consultar_dados_db`;
            const payload = {
                view: the_view,
                campos: this.campos || ["Todos"],
                database_path: this.database_path || "",
                database_name: this.database_name || "",
                application_path: this.application_path,
                filtros: this.filtros
            };

            flow_marker(`🌐 Fazendo requisição para: ${url}`, payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
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
            const url = `${this.backend_url}/update_data_db`;
            const payload = {
                tabela_alvo: this.tabela_alvo,
                campos: this.campos || [],
                campos_obrigatorios: this.campos_obrigatorios || [],
                database_name: this.database_name || "",
                database_path: this.database_path || "",
                dados: dados_para_update,
                application_path: this.application_path
            };
            
            flow_marker(`🌐 Enviando UPDATE para: ${url}`, payload);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
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
            const url = `${this.backend_url}/incluir_reg_novo_db`;
            const payload = {
                tabela_alvo: this.tabela_alvo,
                campos: this.campos || [],
                campos_obrigatorios: this.campos_obrigatorios || [],
                database_name: this.database_name || "",
                database_path: this.database_path || "",
                dados: dados_novo_registro,
                application_path: this.application_path
            };
            
            flow_marker(`🌐 Enviando INSERT para: ${url}`, payload);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
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













/*
*********************************************************************
                       CÓDDIGO OBSOLETO - NÃO USAR
*********************************************************************
*/

    /**
     * Configura a view e tabela ativas para operações de dados
     * 
     * @param {string} nome_view - Nome da view para consultas (ex: "vw_grupos")
     * @param {string} nome_tabela - Nome da tabela para CRUD (ex: "tb_grupos") 
     * @param {Array<string>} [campos_obrigatorios=["Todos"]] - Array de campos obrigatórios para operação
     * 
     * @example 
     * // Configuração para grupos
     * api.configurar_dados("vw_grupos", "tb_grupos", ["grupo", "descricao"]);
     * 
     * // Configuração para consulta complexa
     * api.configurar_dados("vw_lancamentos_completos", "tb_lancamentos", ["Todos"]);
     */
    configurar_dados(nome_view, nome_tabela, campos_obrigatorios = ["Todos"]) {
        this.view = nome_view;
        this.tabela_alvo = nome_tabela;
        this.campos_obrigatorios = campos_obrigatorios;
        console.log(`✅ Dados configurados - View: ${nome_view}, Tabela: ${nome_tabela}, Campos obrigatórios:`, campos_obrigatorios);
    }
    
    /**
     * Configura dados que vão para o formulário (template/estrutura)
     * 
     * @param {Object} dados - Objeto com estrutura dos dados
     * 
     * @example
     * // Template para formulário de grupos
     * api.configurar_dados_form_out({
     *     grupo: "",
     *     descricao: ""
     * });
     */
    configurar_dados_form_out(dados) {
        this.dados_form_out = dados;
        console.log('✅ Template de formulário configurado:', dados);
    }
    
    /**
     * Configura dados que vêm do formulário (valores preenchidos)
     * 
     * @param {Object} dados - Objeto com dados preenchidos pelo usuário
     * 
     * @example
     * // Dados vindos do formulário
     * api.configurar_dados_form_in({
     *     grupo: "Alimentação",
     *     descricao: "Despesas com comida e bebida"
     * });
     */
    configurar_dados_form_in(dados) {
        this.dados_form_in = dados;
        console.log('✅ Dados de formulário configurados:', dados);
    }
    
    /**
     * Atualiza configuração do banco de dados
     * 
     * @param {Object} config - Nova configuração do database
     * 
     * @example
     * // Configuração de banco SQLite local
     * api.configurar_database({
     *     tipo: "sqlite",
     *     nome: "financas.db",
     *     caminho: "./dados/"
     * });
     */
    
    /**
     * Atualiza URL do backend
     * 
     * @param {string} nova_url - Nova URL do backend
     * 
     * @example
     * api.atualizar_backend_url("https://api.meusite.com");
     */
    atualizar_backend_url(nova_url) {
        this.backend_url = nova_url;
        console.log(`✅ Backend URL atualizada para: ${nova_url}`);
    }
    
    // =====================================
    // 🔧 MÉTODOS AUXILIARES INTERNOS
    // =====================================
    
    /**
     * Realiza requisição HTTP para o backend
     * 
     * @param {string} operacao - Tipo de operação (select_all, insert, update, delete, etc.)
     * @param {Object} dados - Dados a serem enviados no payload
     * @returns {Promise<Object>} Resposta do backend
     * 
     * @private
     * @example
     * // Uso interno - não chamar diretamente
     * const response = await this.fazer_requisicao("select_all", {
     *     tabela_or_view: "vw_grupos",
     *     database_config: this.database_config
     * });
     */
    async fazer_requisicao(operacao, dados) {
        try {
            const payload = {
                operacao: operacao,
                app_name: this.app_name,
                ...dados
            };
            
            console.log(`🌐 Enviando requisição - Operação: ${operacao}`, payload);
            
            const config = {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(payload)
            };
            
            const response = await fetch(this.backend_url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const resultado = await response.json();
            console.log(`🌐 Resposta recebida:`, resultado);
            
            return resultado;
            
        } catch (error) {
            console.error(`❌ Erro na requisição HTTP:`, error);
            throw error;
        }
    }
    
    /**
     * Valida se a configuração básica está completa
     * 
     * @param {string} tipo_operacao - Tipo de operação para validar
     * @returns {boolean} True se válida, false caso contrário
     * 
     * @private
     * @example
     * // Uso interno
     * if (!this.validar_configuracao("consulta")) {
     *     throw new Error("Configuração incompleta");
     * }
     */
    validar_configuracao(tipo_operacao) {
        if (tipo_operacao === "consulta" && !this.view) {
            console.error("❌ View não configurada para consulta");
            return false;
        }
        
        if (["insert", "update", "delete"].includes(tipo_operacao) && !this.tabela_alvo) {
            console.error("❌ Tabela alvo não configurada para operação CRUD");
            return false;
        }
        
        // ✅ CORREÇÃO: Valida propriedades individuais ao invés de database_config
        if (!this.database_name && !this.database_path) {
            console.error("❌ Configuração de database não definida (database_name ou database_path necessário)");
            return false;
        }
        
        return true;
    }
    
    // =====================================
    // 🗄️ MÉTODOS CRUD - DATABASE
    // =====================================
    
    
    /**
     * Insere novo registro na tabela configurada
     * 
     * @param {Object} dados_registro - Dados do novo registro
     * @returns {Promise<Object>} Resultado da inserção
     * 
     * @example
     * // Inserir novo grupo
     * const resultado = await api.inserir({
     *     grupo: "Transporte",
     *     descricao: "Despesas com combustível e manutenção"
     * });
     * 
     * @example
     * // Com validação de resultado
     * try {
     *     const resultado = await api.inserir(novoDado);
     *     if (resultado.sucesso) {
     *         console.log(`Registro inserido com ID: ${resultado.id_inserido}`);
     *     }
     * } catch (error) {
     *     alert("Erro ao salvar: " + error.message);
     * }
     */
    async inserir(dados_registro) {
        try {
            if (!this.validar_configuracao("insert")) {
                throw new Error("Configuração inválida para inserção");
            }
            
            const operacao = "insert";
            const dados = {
                tabela: this.tabela_alvo,
                dados: dados_registro,
                database_path: this.database_path || "",
                database_name: this.database_name || "",
                database_host: this.database_host || ""
            };
            
            console.log(`📝 Inserindo novo registro em ${this.tabela_alvo}:`, dados_registro);
            const response = await this.fazer_requisicao(operacao, dados);
            
            if (response.sucesso) {
                console.log(`✅ Registro inserido com sucesso. ID: ${response.id_inserido}`);
                return response;
            } else {
                throw new Error(response.erro || "Erro na inserção");
            }
        } catch (error) {
            console.error("❌ Erro ao inserir registro:", error);
            throw error;
        }
    }
    
    /**
     * Atualiza registro existente na tabela
     * 
     * @param {number|string} id - ID do registro a atualizar
     * @param {Object} dados_atualizacao - Dados para atualização
     * @returns {Promise<Object>} Resultado da atualização
     * 
     * @example
     * // Atualizar descrição de um grupo
     * await api.atualizar(3, {
     *     descricao: "Nova descrição para o grupo"
     * });
     * 
     * @example
     * // Atualização completa
     * const dadosNovos = {
     *     grupo: "Lazer Atualizado",
     *     descricao: "Entretenimento e diversão"
     * };
     * await api.atualizar(grupoId, dadosNovos);
     */
    async atualizar(id, dados_atualizacao) {
        try {
            if (!this.validar_configuracao("update")) {
                throw new Error("Configuração inválida para atualização");
            }
            
            const operacao = "update";
            const dados = {
                tabela: this.tabela_alvo,
                id: id,
                dados: dados_atualizacao,
                database_path: this.database_path || "",
                database_name: this.database_name || "",
                database_host: this.database_host || ""
            };
            
            console.log(`📝 Atualizando registro ID ${id} em ${this.tabela_alvo}:`, dados_atualizacao);
            const response = await this.fazer_requisicao(operacao, dados);
            
            if (response.sucesso) {
                console.log("✅ Registro atualizado com sucesso");
                return response;
            } else {
                throw new Error(response.erro || "Erro na atualização");
            }
        } catch (error) {
            console.error(`❌ Erro ao atualizar registro ID ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Remove registro da tabela
     * 
     * @param {number|string} id - ID do registro a remover
     * @returns {Promise<Object>} Resultado da remoção
     * 
     * @example
     * // Remover grupo
     * if (confirm("Deseja realmente excluir este grupo?")) {
     *     await api.remover(grupoId);
     *     console.log("Grupo removido com sucesso");
     * }
     * 
     * @example
     * // Com tratamento de erro
     * try {
     *     await api.remover(id);
     *     alert("Registro excluído com sucesso!");
     * } catch (error) {
     *     alert("Erro ao excluir: " + error.message);
     * }
     */
    async remover(id) {
        try {
            if (!this.validar_configuracao("delete")) {
                throw new Error("Configuração inválida para remoção");
            }
            
            const operacao = "delete";
            const dados = {
                tabela: this.tabela_alvo,
                id: id,
                database_path: this.database_path || "",
                database_name: this.database_name || "",
                database_host: this.database_host || ""
            };
            
            console.log(`🗑️ Removendo registro ID ${id} de ${this.tabela_alvo}`);
            const response = await this.fazer_requisicao(operacao, dados);
            
            if (response.sucesso) {
                console.log("✅ Registro removido com sucesso");
                return response;
            } else {
                throw new Error(response.erro || "Erro na remoção");
            }
        } catch (error) {
            console.error(`❌ Erro ao remover registro ID ${id}:`, error);
            throw error;
        }
    }
    
    // =====================================
    // 📋 MÉTODOS DE FORMULÁRIOS
    // =====================================
    
    
    // =====================================
    // 🔧 MÉTODOS UTILITÁRIOS
    // =====================================
    
    /**
     * Testa conectividade com o backend
     * 
     * @returns {Promise<Object>} Status da conexão
     * 
     * @example
     * // Teste simples
     * const status = await api.testar_conexao();
     * if (status.sucesso) {
     *     console.log("Backend disponível");
     * }
     * 
     * @example
     * // Com tratamento completo
     * try {
     *     const resultado = await api.testar_conexao();
     *     console.log("Status do backend:", resultado);
     * } catch (error) {
     *     console.error("Backend inacessível:", error);
     * }
     */
    async testar_conexao() {
        try {
            const response = await fetch(`${this.backend_url}/health`, {
                method: 'GET',
                headers: this.headers
            });
            
            if (response.ok) {
                const dados = await response.json();
                console.log('✅ Conexão com backend OK:', dados);
                return { 
                    sucesso: true, 
                    dados: dados,
                    url: this.backend_url 
                };
            } else {
                throw new Error(`Backend retornou status ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erro ao testar conexão:', error);
            return { 
                sucesso: false, 
                erro: error.message,
                url: this.backend_url
            };
        }
    }
    
    /**
     * Limpa todos os dados configurados na instância
     * 
     * @example
     * // Limpar dados de formulário
     * api.limpar_dados();
     * console.log("Dados limpos");
     */
    limpar_dados() {
        this.dados_form_in = {};
        this.dados_form_out = {};
        console.log('🧹 Dados da instância API limpos');
    }
    
    /**
     * Obtém configuração atual completa da instância
     * 
     * @returns {Object} Configuração atual
     * 
     * @example
     * // Verificar configuração
     * const config = api.obter_configuracao();
     * console.log("Configuração atual:", config);
     * 
     * @example
     * // Salvar configuração para debug
     * const backup = api.obter_configuracao();
     * localStorage.setItem('api_backup', JSON.stringify(backup));
     */
    obter_configuracao() {
        return {
            // Identificação
            app_name: this.app_name,
            
            // Comunicação
            backend_url: this.backend_url,
            timeout: this.timeout,
            
            // Database
            database_config: this.database_config,
            database_name: this.database_name,
            database_path: this.database_path,
            database_host: this.database_host,
            
            // Dados
            view: this.view,
            tabela_alvo: this.tabela_alvo,
            campos: this.campos,
            campos_obrigatorios: this.campos_obrigatorios,
            
            // Formulários
            dados_form_in: this.dados_form_in,
            dados_form_out: this.dados_form_out
        };
    }
    
    /**
     * Exibe resumo das configurações no console para debug
     * 
     * @example
     * // Debug rápido
     * api.debug_configuracao();
     */
    debug_configuracao() {
        const config = this.obter_configuracao();
        console.group(`🐛 Debug da API - ${this.app_name}`);
        console.log('🌐 Backend URL:', config.backend_url);
        console.log('🗄️ Database:', config.database_config);
        console.log('� View atual:', config.view);
        console.log('🎯 Tabela alvo:', config.tabela_alvo);
        console.log('📝 Campos ativos:', config.campos_ativos);
        console.log('📥 Dados form in:', config.dados_form_in);
        console.log('📤 Dados form out:', config.dados_form_out);
        console.groupEnd();
    }
}


// Log de inicialização do módulo
console.log('🚀 Módulo frontend_api.js carregado - Classe api_fe disponível');
console.log('📖 Framework DSB - Sistema de API Frontend v2.0');

