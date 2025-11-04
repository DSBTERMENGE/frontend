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
                application_path: this.const_application_path,
                filtros: this.filtros || ""
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
                application_path: this.const_application_path,
                filtros: this.filtros || ""
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
     * � Atualiza múltiplos registros em lote (operação em massa)
     * FUNÇÃO GENÉRICA: Pode ser usada para qualquer tabela do sistema
     * 
     * Performance: 1 requisição HTTP + loop interno de UPDATEs + 1 COMMIT
     * Muito mais rápido que N chamadas individuais de update_data()
     * 
     * Ideal para:
     * - Reclassificação de despesas em massa
     * - Atualização de preços de produtos
     * - Alteração de status em múltiplos registros
     * - Qualquer operação que precise atualizar muitos registros
     * 
     * @param {string} tabela_alvo - Nome da tabela para UPDATE (ex: 'despesas', 'produtos')
     * @param {Array<Object>} dados_lote - Array de objetos com dados para atualizar
     *                                     Cada objeto deve conter a PK + campos a atualizar
     *                                     Ex: [{iddespesa: 1234, idgrupo: 3, idsubgrupo: 5}, ...]
     * @param {string} pk_field - Nome do campo chave primária (ex: 'iddespesa', 'idproduto')
     * @param {Array<string>} [campos_permitidos] - Lista de campos permitidos para atualização (segurança)
     *                                              Ex: ['idgrupo', 'idsubgrupo']
     *                                              Se não fornecido, atualiza todos os campos enviados (exceto PK)
     * @returns {Promise<Object>} Resultado com estatísticas:
     *                            {
     *                                sucesso: true/false,
     *                                total_processados: 1000,
     *                                atualizados: 950,
     *                                erros: 50,
     *                                erros_detalhes: [{registro: {...}, erro: "..."}]
     *                            }
     * 
     * @example Reclassificação de despesas
     * const resultado = await api.atualizar_lote(
     *     'despesas',
     *     [
     *         {iddespesa: 1234, idgrupo: 3, idsubgrupo: 5},
     *         {iddespesa: 1235, idgrupo: 2, idsubgrupo: 8},
     *         {iddespesa: 1236, idgrupo: 3, idsubgrupo: 5}
     *     ],
     *     'iddespesa',
     *     ['idgrupo', 'idsubgrupo']  // Só permite atualizar esses campos
     * );
     * 
     * if (resultado.sucesso) {
     *     console.log(`✅ ${resultado.atualizados} registros atualizados`);
     *     console.log(`⚠️ ${resultado.erros} erros encontrados`);
     * }
     * 
     * @example Atualização de preços em massa
     * const resultado = await api.atualizar_lote(
     *     'produtos',
     *     [
     *         {idproduto: 10, preco: 25.50, estoque: 100},
     *         {idproduto: 11, preco: 30.00, estoque: 50}
     *     ],
     *     'idproduto',
     *     ['preco', 'estoque']
     * );
     * 
     * @example Sem filtro de campos (atualiza todos os campos enviados)
     * const resultado = await api.atualizar_lote(
     *     'clientes',
     *     [{idcliente: 1, ativo: 0, observacao: 'Inativo'}],
     *     'idcliente'
     *     // Sem campos_permitidos = atualiza todos os campos (exceto PK)
     * );
     */
    async atualizar_lote(tabela_alvo, dados_lote, pk_field, campos_permitidos = null) {
        try {
            flow_marker('🔄 atualizar_lote() iniciado', {
                tabela: tabela_alvo,
                total_registros: dados_lote ? dados_lote.length : 0,
                pk: pk_field
            });
            
            // =================================================================
            // VALIDAÇÕES
            // =================================================================
            
            if (!tabela_alvo) {
                throw new Error("Parâmetro 'tabela_alvo' não fornecido");
            }
            
            if (!dados_lote || !Array.isArray(dados_lote) || dados_lote.length === 0) {
                throw new Error("Parâmetro 'dados_lote' deve ser um array não vazio");
            }
            
            if (!pk_field) {
                throw new Error("Parâmetro 'pk_field' não fornecido");
            }
            
            // Validar que todos os registros têm a PK
            const registros_sem_pk = dados_lote.filter(reg => !reg[pk_field]);
            if (registros_sem_pk.length > 0) {
                throw new Error(`${registros_sem_pk.length} registro(s) sem campo PK '${pk_field}'`);
            }
            
            // =================================================================
            // MONTA PAYLOAD
            // =================================================================
            
            const url = `${this.const_backend_url}/atualizar_lote`;
            const payload = {
                tabela_alvo: tabela_alvo,
                dados_lote: dados_lote,
                pk_field: pk_field,
                campos_permitidos: campos_permitidos,
                database_name: this.const_database_name || "",
                database_path: this.const_database_path || ""
            };
            
            flow_marker(`🌐 Enviando UPDATE em lote para: ${url}`, {
                tabela: tabela_alvo,
                registros: dados_lote.length,
                campos_permitidos: campos_permitidos
            });
            
            // =================================================================
            // EXECUTA REQUISIÇÃO
            // =================================================================
            
            const response = await fetch(url, {
                method: 'POST',
                headers: this.const_headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const resultado = await response.json();
            
            flow_marker('✅ atualizar_lote() concluído', {
                sucesso: resultado.sucesso,
                total_processados: resultado.total_processados || 0,
                atualizados: resultado.atualizados || 0,
                erros: resultado.erros || 0
            });
            
            return resultado;
            
        } catch (error) {
            error_catcher('Erro no atualizar_lote', error);
            return { 
                sucesso: false, 
                erro: error.message,
                total_processados: 0,
                atualizados: 0,
                erros: 0
            };
        }
    }
    
    /**
     * �🔍 Executa SQL personalizado diretamente no banco de dados
     * 
     * Permite execução de consultas SQL customizadas enviadas do frontend.
     * Ideal para consultas complexas, relatórios e operações que não se encaixam
     * nos métodos CRUD padrão.
     * 
     * @param {string} sql - Comando SQL a executar (SELECT, INSERT, UPDATE, DELETE, etc.)
     * @param {string} [database_path] - Caminho do banco (usa this.const_database_path se não fornecido)
     * @param {string} [database_name] - Nome do banco (usa this.const_database_name se não fornecido)
     * @returns {Promise<Object>} Resultado estruturado da execução
     * 
     * @example
     * // Consulta SELECT simples
     * const resultado = await api.executar_sql("SELECT * FROM tb_grupos WHERE ativo = 1");
     * if (resultado.sucesso) {
     *     console.log('Dados:', resultado.dados);
     * }
     * 
     * @example
     * // Consulta com SUM e alias personalizado
     * const sql = "SELECT SUM(valor) AS total_despesas FROM tb_despesas WHERE mes = 12";
     * const resultado = await api.executar_sql(sql);
     * if (resultado.sucesso) {
     *     const total = resultado.dados[0].total_despesas;
     * }
     * 
     * @example
     * // Comando DDL/DML
     * const resultado = await api.executar_sql("UPDATE tb_config SET valor = 'novo' WHERE chave = 'tema'");
     * if (resultado.sucesso) {
     *     console.log(`${resultado.registros_afetados} registros atualizados`);
     * }
     */
    async executar_sql(sql, database_path = null, database_name = null) {
        try {
            flow_marker('🔍 executar_sql() iniciado');
            
            // Validação básica do SQL
            if (!sql || sql.trim() === '') {
                throw new Error("SQL não fornecido ou vazio");
            }
            
            // Usa configurações da instância se parâmetros não fornecidos
            const db_path = database_path || this.const_database_path;
            const db_name = database_name || this.const_database_name;
            
            // Validação das configurações de banco
            if (!db_path) {
                throw new Error("database_path não configurado. Configure this.const_database_path primeiro.");
            }
            
            if (!db_name) {
                throw new Error("database_name não configurado. Configure this.const_database_name primeiro.");
            }
            
            // Monta payload para o backend
            const url = `${this.const_backend_url}/executar_sql`;
            const payload = {
                sql: sql.trim(),
                database_path: db_path,
                database_name: db_name
            };
            
            flow_marker(`🌐 Enviando SQL para: ${url}`, {
                sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
                database_path: db_path,
                database_name: db_name
            });
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.const_headers
                },
                body: JSON.stringify(payload),
                timeout: this.const_timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const resultado = await response.json();
            
            // Log do resultado baseado no tipo
            if (resultado.sucesso) {
                if (resultado.dados) {
                    flow_marker(`✅ SQL SELECT executado: ${resultado.dados.length} registro(s) retornado(s)`);
                } else {
                    flow_marker(`✅ SQL DDL/DML executado: ${resultado.registros_afetados} registro(s) afetado(s)`);
                }
            } else {
                flow_marker(`❌ Erro na execução SQL: ${resultado.erro}`);
            }
            
            return resultado;
            
        } catch (error) {
            error_catcher('❌ Erro no executar_sql():', error);
            return {
                sucesso: false,
                erro: error.message
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

            // Dispara alert imediatamente com a mensagem recebida
            if (dados.sucesso) {
                flow_marker('Processamento de extratos concluído com sucesso');
                alert(`✅ ${dados.msg}`);
                return {
                    sucesso: true,
                    msg: dados.msg
                };
            } else {
                flow_marker(`Erro no processamento: ${dados.msg}`);
                alert(`❌ ${dados.msg}`);
                return {
                    sucesso: false,
                    msg: dados.msg
                };
            }

        } catch (error) {
            error_catcher('Erro no processar_extratos_pdf', error);
            const msgErro = `Erro de conexão: ${error.message}. Verifique o arquivo log_de_erros.md para detalhes.`;
            alert(`❌ ${msgErro}`);
            return {
                sucesso: false,
                msg: msgErro
            };
        }
    }

} // FIM DA CLASSE api_fe

// Log de inicialização do módulo
console.log('🚀 Módulo frontend_api.js carregado - Classe api_fe disponível');
console.log('📖 Framework DSB - Sistema de API Frontend v2.0');