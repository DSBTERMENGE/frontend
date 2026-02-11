/**
 * ================================================================
 * CLASSE VALIDARDADOSFORM - FRAMEWORK DSB
 * ================================================================
 * 
 * RESPONSABILIDADES:
 * - Validações comuns para todos os formulários
 * - Controle de alterações não salvas
 * - Validações de campos obrigatórios
 * - Validações de tipos e formatos
 * - Controle de navegação com dados alterados
 * 
 * FILOSOFIA:
 * - Máximo reuso de código
 * - Mínimo código específico no desenvolvedor
 * - Configuração através de propriedades (padrão framework)
 * - Herança pela classe FormComum
 * 
 * PADRÃO DE PROPRIEDADES:
 * - Arrays com separadores vírgula (igual outros construtores)
 * - Configurações flexíveis e opcionais
 * - Mensagens de erro customizáveis
 */

export default class ValidarDadosForm {
    
    /**
     * Construtor da classe ValidarDadosForm
     * Segue o padrão dos construtores do framework DSB
     * @param {Array<string>} camposObrigatorios - Array com nomes dos campos obrigatórios para salvamento ['nome', 'email', 'telefone']
     * @param {Object} opcoes - Opções avançadas (mensagens customizadas, configurações especiais)
     */
    constructor(camposObrigatorios = [], opcoes = {}) {
        
        // ============= VALIDAÇÃO DOS PARÂMETROS =============
        ValidarDadosForm.validacao(camposObrigatorios);
        
        // ============= PROPRIEDADES DE CONFIGURAÇÃO =============
        
        // Campos obrigatórios para salvamento (configurado pelo desenvolvedor)
        this.camposObrigatorios = camposObrigatorios; // ['nome', 'email', 'telefone']
        
        // Variável global para armazenar mensagem de erro atual
        this.mensagemDeErro = '';
        
        // Regex para validações de formato
        this.regex_validacao = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            telefone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
            cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
            cep: /^\d{5}-\d{3}$/,
            numero: /^\d+$/,
            decimal: /^\d+([,\.]\d{1,2})?$/,
            ...opcoes.regex_customizados // Merge com regex customizados
        };
        
        // Controle de estado interno
        this.dados_originais = {}; // Dados quando carregou/salvou
        this.dados_alterados = false; // Flag de alterações
        this.validacao_ativa = opcoes.validacao_ativa !== undefined ? opcoes.validacao_ativa : true; // Permite desabilitar validações
        
        // ============= INICIALIZAÇÃO =============
        this.inicializarValidador();
    }
    
    // ============= VALIDAÇÃO ESTÁTICA DOS PARÂMETROS =============
    
    /**
     * Validação dos parâmetros do construtor (método estático seguindo padrão framework)
     * @param {Array} camposObrigatorios - Array de campos obrigatórios
     */
    static validacao(camposObrigatorios) {
        // Verifica se é um array
        if (!Array.isArray(camposObrigatorios)) {
            throw new Error('camposObrigatorios deve ser um array');
        }
        
        // Verifica se todos os elementos são strings
        for (let campo of camposObrigatorios) {
            if (typeof campo !== 'string' || campo.trim() === '') {
                throw new Error('Todos os campos obrigatórios devem ser strings não vazias');
            }
        }
        
        console.log('✅ ValidarDadosForm: Parâmetros validados com sucesso');
    }
    
    // ============= MÉTODOS DE INICIALIZAÇÃO =============
    
    /**
     * Inicializa o validador e configura listeners básicos
     */
    inicializarValidador() {
        console.log('🔧 ValidarDadosForm: Inicializando validador...');
        
        // Configura detecção de alterações nos campos (será chamado após render)
        setTimeout(() => this.configurarDeteccaoAlteracoes(), 100);
    }
    
    /**
     * Configura detecção automática de alterações nos campos
     */
    configurarDeteccaoAlteracoes() {
        // Busca todos os inputs, selects e textareas do formulário
        const campos = document.querySelectorAll('#divFormCrud input, #divFormCrud select, #divFormCrud textarea');
        
        campos.forEach(campo => {
            campo.addEventListener('input', () => this.marcarComoAlterado());
            campo.addEventListener('change', () => this.marcarComoAlterado());
        });
        
        console.log(`✅ ValidarDadosForm: ${campos.length} campos monitorados para alterações`);
    }
    
    // ============= MÉTODOS PRINCIPAIS DE VALIDAÇÃO =============
    
    // ********* VALIDAÇÃO PARA SALVAR DADOS *********
    
    /**
     * Método principal público: Coordena todas as validações para salvamento
     * Executa validações em sequência, parando na primeira que falhar
     * @returns {boolean} true se válido, false se inválido
     */
    Validar() {
        console.log('🔍 ValidarDadosForm: Iniciando validação para salvamento...');
        
        if (!this.validacao_ativa) {
            console.log('⚠️ ValidarDadosForm: Validação desabilitada');
            return true;
        }
        
        // Validação 1: Campos obrigatórios
        const resultadoCampos = this._validarCamposObrigatorios();
        if (resultadoCampos.sucesso === false) {
            this.mensagemDeErro = resultadoCampos.mensagem;
            this._emitirMsgDeErro();
            return false;
        }
        
        // TODO: Validação 2: Tipos de dados (quando implementarmos)
        // const resultadoTipos = this._validarTipos();
        // if (resultadoTipos.sucesso === false) {
        //     this.mensagemDeErro = resultadoTipos.mensagem;
        //     this._emitirMsgDeErro();
        //     return false;
        // }
        
        // TODO: Validação 3: Tamanhos (quando implementarmos)
        // const resultadoTamanhos = this._validarTamanhos();
        // if (resultadoTamanhos.sucesso === false) {
        //     this.mensagemDeErro = resultadoTamanhos.mensagem;
        //     this._emitirMsgDeErro();
        //     return false;
        // }
        
        // TODO: Validação 4: Duplicatas (quando implementarmos)
        // const resultadoDuplicatas = this._validarDuplicatas();
        // if (resultadoDuplicatas.sucesso === false) {
        //     this.mensagemDeErro = resultadoDuplicatas.mensagem;
        //     this._emitirMsgDeErro();
        //     return false;
        // }
        
        // Se chegou até aqui, todas as validações passaram
        console.log('✅ ValidarDadosForm: Todas as validações para salvamento aprovadas');
        return true;
    }

    // ******************* VALIDAÇÃO PARA NAVEGAR *******************

    /**
     * Método principal público: Valida antes de navegar (trocar registro, formulário, etc.)
     * Verifica se há alterações não salvas antes de permitir navegação
     * @returns {boolean} true se pode navegar, false se deve permanecer
     */
    validarNavegar() {
        console.log('🔍 ValidarDadosForm: Iniciando validação para navegação...');
        
        if (!this.validacao_ativa) {
            console.log('⚠️ ValidarDadosForm: Validação desabilitada');
            return true;
        }
        
        // Validação 1: Verificar alterações não salvas
        const resultadoAlteracoes = this._verificarAlteracoesNaoSalvas();
        if (resultadoAlteracoes.sucesso === false) {
            this.mensagemDeErro = resultadoAlteracoes.mensagem;
            this._emitirMsgDeErro();
            return false;
        }
        
        // TODO: Validação 2: Outras validações para navegação (quando implementarmos)
        // const resultadoOutras = this._validarOutrasNavegacao();
        // if (resultadoOutras.sucesso === false) {
        //     this.mensagemDeErro = resultadoOutras.mensagem;
        //     this._emitirMsgDeErro();
        //     return false;
        // }
        
        // Se chegou até aqui, pode navegar
        console.log('✅ ValidarDadosForm: Validação para navegação aprovada');
        return true;
    }
    
    // ********* MÉTODOS PARA VALIDAÇÃO DE SALVAMENTO *********
    
    /**
     * Método privado: Valida campos obrigatórios
     * @returns {Object} {sucesso: boolean, mensagem: string}
     */
    _validarCamposObrigatorios() {
        const camposVazios = [];
        
        // Loop pelos campos obrigatórios configurados
        for (let nomeCampo of this.camposObrigatorios) {
            // Verifica se o campo existe no DOM
            const campo = document.querySelector(`[name="${nomeCampo}"]`);
            
            if (!campo) {
                console.warn(`⚠️ ValidarDadosForm: Campo obrigatório '${nomeCampo}' não encontrado no formulário`);
                continue;
            }
            
            // Verifica se o campo tem dados
            if (!campo.value || campo.value.trim() === '') {
                camposVazios.push(nomeCampo);
            }
        }
        
        // Se não há campos vazios, retorna sucesso
        if (camposVazios.length === 0) {
            return { sucesso: true, mensagem: '' };
        }
        
        // Montagem da mensagem de erro
        let mensagem = '';
        let listaCampos = '';
        
        // Loop para montar a lista de campos vazios
        for (let i = 0; i < camposVazios.length; i++) {
            const labelCampo = this._obterLabelDoCampo(camposVazios[i]);
            listaCampos += labelCampo;
            
            // Adiciona vírgula se não for o último campo
            if (i < camposVazios.length - 1) {
                listaCampos += ', ';
            }
        }
        
        // Monta mensagem considerando singular/plural
        if (camposVazios.length === 1) {
            mensagem = `O campo ${listaCampos} é necessário.`;
        } else {
            mensagem = `Os campos ${listaCampos} são necessários.`;
        }
        
        console.log('❌ ValidarDadosForm: Campos obrigatórios vazios:', camposVazios);
        return { sucesso: false, mensagem: mensagem };
    }
    
    // ********* MÉTODOS PARA VALIDAÇÃO DE NAVEGAÇÃO *********
    
    /**
     * Método privado: Verifica se há alterações não salvas
     * @returns {Object} {sucesso: boolean, mensagem: string}
     */
    _verificarAlteracoesNaoSalvas() {
        // TODO: Implementar lógica para detectar alterações
        // Por enquanto, retorna sempre sucesso (sem alterações)
        
        // Verifica se há dados alterados (flag simples por enquanto)
        if (this.dados_alterados) {
            const mensagem = "Há alterações não salvas. Salve antes de navegar ou as alterações serão perdidas.";
            console.log('❌ ValidarDadosForm: Alterações não salvas detectadas');
            return { sucesso: false, mensagem: mensagem };
        }
        
        // TODO: Implementar comparação mais sofisticada
        // Comparar dados atuais com this.dados_originais
        // const dadosAtuais = this._obterDadosAtuais();
        // const alteracoes = this._compararDados(this.dados_originais, dadosAtuais);
        // if (alteracoes.length > 0) {
        //     const mensagem = `Campos alterados: ${alteracoes.join(', ')}. Salve antes de navegar.`;
        //     return { sucesso: false, mensagem: mensagem };
        // }
        
        return { sucesso: true, mensagem: '' };
    }
    
    // TODO: Métodos privados futuros para navegação
    // _validarOutrasNavegacao() { 
    //     // Placeholder para outras validações de navegação futuras
    //     return { sucesso: true, mensagem: '' };
    // }
    
    // TODO: Métodos privados futuros para salvamento
    // _validarTipos() { 
    //     // Placeholder para validações de tipo futuras
    //     return { sucesso: true, mensagem: '' };
    // }
    
    // _validarTamanhos() { 
    //     // Placeholder para validações de tamanho futuras
    //     return { sucesso: true, mensagem: '' };
    // }
    
    // ============= CONTROLE DE ALTERAÇÕES =============
    
    /**
     * Marca formulário como alterado
     */
    marcarComoAlterado() {
        this.dados_alterados = true;
        console.log('📝 ValidarDadosForm: Formulário marcado como alterado');
    }
    
    /**
     * Verifica se há alterações não salvas
     * @returns {boolean} true se há alterações
     */
    verificar_alteracoes_nao_salvas() {
        return this.dados_alterados;
    }
    
    /**
     * Salva estado atual dos dados (após salvamento ou carregamento)
     */
    salvar_estado_dados() {
        this.dados_alterados = false;
        
        // Captura valores atuais
        const campos = document.querySelectorAll('#divFormCrud input, #divFormCrud select, #divFormCrud textarea');
        this.dados_originais = {};
        
        campos.forEach(campo => {
            if (campo.name) {
                this.dados_originais[campo.name] = campo.value;
            }
        });
        
        console.log('💾 ValidarDadosForm: Estado dos dados salvo');
    }
    
    /**
     * Restaura dados originais (descarta alterações)
     */
    descartar_alteracoes() {
        Object.keys(this.dados_originais).forEach(nomeCampo => {
            const campo = document.querySelector(`[name="${nomeCampo}"]`);
            if (campo) {
                campo.value = this.dados_originais[nomeCampo];
            }
        });
        
        this.dados_alterados = false;
        console.log('↶ ValidarDadosForm: Alterações descartadas');
    }
    
    // ============= MÉTODOS DE NAVEGAÇÃO =============
    
    /**
     * Valida antes de navegar (trocar registro, formulário, etc.)
     * @returns {boolean} true se pode navegar, false se deve permanecer
     */
    validar_antes_navegacao() {
        if (!this.verificar_alteracoes_nao_salvas()) {
            return true; // Sem alterações, pode navegar
        }
        
        const resposta = confirm(this.mensagens_erro.alteracoes_nao_salvas);
        
        if (resposta) {
            // Usuário quer salvar antes
            return this.validar_para_salvamento();
        } else {
            // Usuário quer descartar alterações
            const confirmaDescarte = confirm(this.mensagens_erro.confirmar_descarte);
            if (confirmaDescarte) {
                this.descartar_alteracoes();
                return true;
            }
            return false; // Usuário cancelou
        }
    }
    
    /**
     * Valida antes de encerrar aplicação
     * @returns {boolean} true se pode encerrar, false se deve permanecer
     */
    validar_antes_encerramento() {
        return this.validar_antes_navegacao(); // Mesma lógica
    }
    
    /**
     * Função privada para emitir mensagem de erro
     * Usa a variável global mensagemDeErro da classe
     * Exibe a mensagem na divRodape com botão OK para remoção
     */
    _emitirMsgDeErro() {
        if (!this.mensagemDeErro || this.mensagemDeErro.trim() === '') {
            console.warn('⚠️ ValidarDadosForm: Tentativa de emitir mensagem vazia');
            return;
        }
        
        // Obtém a divRodape
        const divRodape = document.getElementById('divRodape');
        if (!divRodape) {
            console.error('❌ ValidarDadosForm: divRodape não encontrada no DOM');
            // Fallback para alert se divRodape não existir
            alert(`❌ Erro de Validação:\n\n${this.mensagemDeErro}`);
            return;
        }
        
        // Limpa mensagens anteriores (evita acúmulo de mensagens)
        divRodape.innerHTML = '';
        
        // Cria o HTML da mensagem com ícone de alerta e botão OK
        const mensagemHTML = `
            <div style="
                background: #f8d7da; 
                border: 1px solid #f5c6cb; 
                color: #721c24; 
                padding: 10px; 
                border-radius: 4px; 
                display: flex; 
                align-items: center; 
                justify-content: space-between;
                margin: 5px 0;
                font-size: 14px;
            ">
                <div style="display: flex; align-items: center;">
                    <span style="margin-right: 8px; font-size: 16px;">⚠️</span>
                    <span>${this.mensagemDeErro}</span>
                </div>
                <button onclick="this.parentElement.remove()" style="
                    background: #721c24; 
                    color: white; 
                    border: none; 
                    padding: 5px 10px; 
                    border-radius: 3px; 
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                ">OK</button>
            </div>
        `;
        
        // Insere a mensagem na divRodape
        divRodape.innerHTML = mensagemHTML;
        
        console.log('✅ ValidarDadosForm: Mensagem de erro exibida na divRodape:', this.mensagemDeErro);
    }
    
    // ============= MÉTODOS AUXILIARES =============
    
    /**
     * Obtém labels dos campos para exibição em mensagens
     * @param {Array} nomesCampos Array com nomes dos campos
     * @returns {Array} Array com labels dos campos
     */
    _obterLabelsDosCampos(nomesCampos) {
        return nomesCampos.map(nome => this._obterLabelDoCampo(nome));
    }
    
    /**
     * Obtém label de um campo específico
     * @param {string} nomeCampo Nome do campo
     * @returns {string} Label do campo
     */
    _obterLabelDoCampo(nomeCampo) {
        const campo = document.querySelector(`[name="${nomeCampo}"]`);
        if (campo) {
            // Tenta encontrar label associado
            const label = document.querySelector(`label[for="${campo.id}"]`);
            if (label) return label.textContent.trim();
            
            // Tenta pelo placeholder
            if (campo.placeholder) return campo.placeholder;
            
            // Fallback para o nome do campo
            return nomeCampo.charAt(0).toUpperCase() + nomeCampo.slice(1);
        }
        return nomeCampo;
    }
    
    /**
     * Emite erros de validação para o usuário (método legado - manter para compatibilidade)
     * @param {Array} erros Array com mensagens de erro
     */
    _emitirErros(erros) {
        if (erros && erros.length > 0) {
            this.mensagemDeErro = erros.join('\n• ');
            this._emitirMsgDeErro();
        }
    }
    
    // ============= MÉTODOS DE CONFIGURAÇÃO =============
    
    /**
     * Configura campos obrigatórios
     * @param {Array} campos Array com nomes dos campos obrigatórios
     */
    configurarCamposObrigatorios(campos) {
        this.camposObrigatorios = Array.isArray(campos) ? campos : [];
        console.log('⚙️ ValidarDadosForm: Campos obrigatórios configurados:', this.camposObrigatorios);
    }
    
    /**
     * Habilita ou desabilita validações
     * @param {boolean} ativo true para ativar, false para desativar
     */
    configurarValidacaoAtiva(ativo) {
        this.validacao_ativa = ativo;
        console.log(`⚙️ ValidarDadosForm: Validação ${ativo ? 'ativada' : 'desativada'}`);
    }
    
    /**
     * Configura mensagens de erro customizadas
     * @param {Object} mensagens Objeto com mensagens customizadas
     */
    configurarMensagensErro(mensagens) {
        this.mensagens_erro = { ...this.mensagens_erro, ...mensagens };
        console.log('⚙️ ValidarDadosForm: Mensagens de erro customizadas configuradas');
    }
}
