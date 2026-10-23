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

    // ============= MÉTODOS ESTÁTICOS DE VALIDAÇÃO (USO PÚBLICO) =============

    /**
     * ✅ VALIDAR CNPJ - Função estática para validação de CNPJ
     *
     * Valida se um CNPJ é válido seguindo as regras da Receita Federal:
     * - Formato: 00.000.000/0000-00 (com ou sem formatação)
     * - Verifica dígitos verificadores (algoritmo oficial)
     * - Rejeita CNPJs conhecidos como inválidos (00.000.000/0000-00, 11.111.111/1111-11, etc)
     *
     * @param {string} cnpj - CNPJ a ser validado (com ou sem máscara)
     * @returns {boolean} true se válido, false se inválido
     *
     * @example
     * // Uso em formulários
     * import ValidarDadosForm from './ValidarDadosForm.js';
     *
     * const cnpjValido = ValidarDadosForm.validarCNPJ('11.222.333/0001-81');
     * if (!cnpjValido) {
     *     alert('CNPJ inválido!');
     * }
     *
     * @since 2.0.0
     * @static
     */
    static validarCNPJ(cnpj) {
        // Remove formatação (mantém apenas números)
        cnpj = cnpj.replace(/[^\d]/g, '');

        // Valida tamanho
        if (cnpj.length !== 14) {
            console.warn('⚠️ CNPJ inválido: deve ter 14 dígitos');
            return false;
        }

        // Rejeita CNPJs conhecidos como inválidos (todos dígitos iguais)
        if (/^(\d)\1{13}$/.test(cnpj)) {
            console.warn('⚠️ CNPJ inválido: todos os dígitos são iguais');
            return false;
        }

        // Validação dos dígitos verificadores
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        // Valida primeiro dígito verificador
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado != digitos.charAt(0)) {
            console.warn('⚠️ CNPJ inválido: primeiro dígito verificador incorreto');
            return false;
        }

        // Valida segundo dígito verificador
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado != digitos.charAt(1)) {
            console.warn('⚠️ CNPJ inválido: segundo dígito verificador incorreto');
            return false;
        }

        console.log('✅ CNPJ válido:', cnpj);
        return true;
    }

    /**
     * 🎭 FORMATAR CNPJ - Função estática para formatação de CNPJ
     *
     * Formata string numérica no padrão CNPJ: 00.000.000/0000-00
     * Remove caracteres não numéricos antes de formatar
     *
     * @param {string} cnpj - CNPJ sem formatação (apenas números)
     * @returns {string} CNPJ formatado ou string original se inválido
     *
     * @example
     * const cnpjFormatado = ValidarDadosForm.formatarCNPJ('11222333000181');
     * console.log(cnpjFormatado); // "11.222.333/0001-81"
     *
     * @since 2.0.0
     * @static
     */
    static formatarCNPJ(cnpj) {
        // Remove formatação existente
        cnpj = cnpj.replace(/[^\d]/g, '');

        // Valida tamanho
        if (cnpj.length !== 14) {
            console.warn('⚠️ Não é possível formatar: CNPJ deve ter 14 dígitos');
            return cnpj; // Retorna sem formatação
        }

        // Formata: 00.000.000/0000-00
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }

    /**
     * 🧹 LIMPAR CNPJ - Função estática para remover formatação
     *
     * Remove todos os caracteres não numéricos de um CNPJ
     * Útil antes de enviar dados para o backend
     *
     * @param {string} cnpj - CNPJ com ou sem formatação
     * @returns {string} CNPJ apenas com números
     *
     * @example
     * const cnpjLimpo = ValidarDadosForm.limparCNPJ('11.222.333/0001-81');
     * console.log(cnpjLimpo); // "11222333000181"
     *
     * @since 2.0.0
     * @static
     */
    static limparCNPJ(cnpj) {
        return cnpj.replace(/[^\d]/g, '');
    }

    // ============= MÉTODOS ESTÁTICOS DE VALORES MONETÁRIOS (USO PÚBLICO) =============

    /**
     * 💰 CONFIGURAR CAMPO MONETÁRIO - Adiciona formatação automática a um campo
     *
     * Configura um campo input para aceitar e formatar valores monetários automaticamente.
     * Diferença entre "valor" e "moeda":
     * - data-format="valor" → Exibe "95.138,00" (sem R$)
     * - data-format="moeda" → Exibe "R$ 95.138,00" (com R$)
     *
     * Ambos salvam NÚMERO PURO no PostgreSQL (95138.00)
     *
     * @param {string} idCampo - ID do campo input a ser configurado
     * @param {boolean} [comCifrao=false] - Se true, usa "moeda" (R$), se false usa "valor"
     *
     * @example
     * // Uso em formulários após render()
     * setTimeout(() => {
     *     ValidarDadosForm.configurarCampoMonetario('capital_social');         // sem R$
     *     ValidarDadosForm.configurarCampoMonetario('valor_aplicado', true);   // com R$
     * }, 200);
     *
     * @returns {boolean} true se configurado com sucesso, false se campo não encontrado
     * @since 2.0.0
     * @static
     */
    static configurarCampoMonetario(idCampo, comCifrao = false) {
        const campo = document.getElementById(idCampo);

        if (!campo) {
            console.warn(`⚠️ Campo "${idCampo}" não encontrado no DOM`);
            return false;
        }

        // Marca campo para processamento pelo backend
        // "moeda" e "valor" são tratados IGUALMENTE - ambos salvam número puro
        // Diferença é só na EXIBIÇÃO (com ou sem R$)
        campo.setAttribute('data-format', comCifrao ? 'moeda' : 'valor');

        // Formatar valor inicial se vier do banco (número puro)
        const valorInicial = campo.value;
        if (valorInicial && !isNaN(valorInicial) && valorInicial.trim() !== '') {
            const numero = parseFloat(valorInicial);
            if (!isNaN(numero)) {
                const formatado = numero.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                campo.value = comCifrao ? `R$ ${formatado}` : formatado;
            }
        }

        // Formatação ao sair do campo
        campo.addEventListener('blur', function() {
            let valor = this.value.trim();
            if (!valor || valor === '') return;

            // Remove tudo exceto números, vírgula e ponto
            valor = valor.replace(/[^\d.,]/g, '');
            if (!valor) return;

            // Converte para número (aceita tanto 1234.56 quanto 1.234,56)
            let numero;
            if (valor.includes(',')) {
                numero = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
            } else {
                numero = parseFloat(valor);
            }

            if (!isNaN(numero) && numero >= 0) {
                // Formata com 2 casas decimais e separador de milhares
                const formatado = numero.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                this.value = comCifrao ? `R$ ${formatado}` : formatado;
            }
        });

        // Limpeza ao focar (facilita edição)
        campo.addEventListener('focus', function() {
            // Remove R$, pontos e troca vírgula por ponto
            let valor = this.value.replace(/[^\d,]/g, '');
            this.value = valor;
        });

        console.log(`✅ Campo monetário "${idCampo}" configurado (comCifrao: ${comCifrao})`);
        return true;
    }

    /**
     * 💰 VALIDAR E CONVERTER VALOR MONETÁRIO - Função única de validação e conversão
     *
     * Valida formato e converte para número. Aceita múltiplos formatos:
     * - Brasileiro: "1.275,36" ou "653,25"
     * - Americano: "12387.79"
     * - Simples: "95138"
     *
     * @param {string|number} valor - Valor a validar e converter
     * @param {string} nomeCampo - Nome do campo (para mensagem de erro)
     * @returns {Object} {valido: boolean, numero: number, erro: string}
     *
     * @example
     * const resultado = ValidarDadosForm.validarValorMonetario('1.275,36', 'Valor Aplicado');
     * if (!resultado.valido) {
     *     alert(resultado.erro);
     *     return;
     * }
     * // Usar resultado.numero para salvar no banco
     *
     * @since 2.1.0
     * @static
     */
    static validarValorMonetario(valor, nomeCampo = 'Campo') {
        // Aceita valores vazios (validação de obrigatório é separada)
        if (valor === null || valor === undefined || valor === '') {
            return {valido: true, numero: null, erro: null};
        }

        // Se já é número válido, retorna
        if (typeof valor === 'number' && !isNaN(valor)) {
            return {valido: true, numero: valor, erro: null};
        }

        // Converte para string para processar
        const valorStr = String(valor).trim();

        // Remove R$, espaços, %
        let limpo = valorStr.replace(/[R$%\s]/g, '');

        // ❌ VALIDAÇÃO: Só pode conter números, ponto e vírgula
        if (!/^[\d.,]+$/.test(limpo)) {
            return {
                valido: false,
                numero: null,
                erro: `❌ ERRO: "${nomeCampo}"\n\n` +
                      `Valor digitado: "${valorStr}"\n\n` +
                      `Formato inválido! Use apenas números e separadores.\n\n` +
                      `✅ Formatos aceitos:\n` +
                      `   • 95138 (sem centavos)\n` +
                      `   • 653,25 (vírgula para centavos)\n` +
                      `   • 12387.79 (ponto para centavos)\n` +
                      `   • 1.275,36 (ponto mil, vírgula centavos)\n` +
                      `   • R$ 95.138,00 (com cifrão)`
            };
        }

        // 🎯 CONVERSÃO INTELIGENTE
        const temVirgula = limpo.includes(',');
        const temPonto = limpo.includes('.');

        try {
            if (temVirgula && temPonto) {
                // Formato BR completo: "1.275,36" → 1275.36
                limpo = limpo.replace(/\./g, '').replace(',', '.');
            } else if (temVirgula) {
                // Apenas vírgula: "653,25" → 653.25
                limpo = limpo.replace(',', '.');
            } else if (temPonto) {
                // Apenas ponto: detectar se é decimal ou milhar
                const partes = limpo.split('.');
                if (partes.length === 2) {
                    if (partes[1].length === 2) {
                        // 2 casas: decimal "12387.79" → 12387.79
                        // Mantém
                    } else if (partes[1].length === 3) {
                        // 3 casas: milhar "1.275" → 1275
                        limpo = limpo.replace(/\./g, '');
                    } else {
                        // Outros casos: assumir milhar
                        limpo = limpo.replace(/\./g, '');
                    }
                }
            }

            const numero = parseFloat(limpo);

            // Valida resultado
            if (isNaN(numero)) {
                throw new Error('Conversão resultou em NaN');
            }

            if (numero < 0) {
                return {
                    valido: false,
                    numero: null,
                    erro: `❌ ERRO: "${nomeCampo}"\n\nValor não pode ser negativo!`
                };
            }

            return {valido: true, numero: numero, erro: null};

        } catch (e) {
            return {
                valido: false,
                numero: null,
                erro: `❌ ERRO: "${nomeCampo}"\n\n` +
                      `Não foi possível converter "${valorStr}" para número.\n\n` +
                      `Use formatos: 95138 | 653,25 | 12387.79 | 1.275,36`
            };
        }
    }

    /**
     * 🧹 LIMPAR FORMATAÇÃO MONETÁRIA - Remove formatação de valor monetário
     *
     * ⚠️ DEPRECATED: Use validarValorMonetario() que valida E converte.
     * Esta função será removida em versão futura.
     *
     * Remove todos os caracteres de formatação (R$, pontos, vírgulas) e
     * converte para número float puro, pronto para envio ao backend.
     *
     * @param {string|number} valor - Valor formatado (ex: "R$ 1.235,50" ou "1.235,50")
     * @returns {number} Número float puro (ex: 1235.50)
     *
     * @example
     * ValidarDadosForm.limparFormatacaoMonetaria('R$ 1.235,50');  // 1235.50
     * ValidarDadosForm.limparFormatacaoMonetaria('1.235,50');     // 1235.50
     * ValidarDadosForm.limparFormatacaoMonetaria('1235.50');      // 1235.50
     * ValidarDadosForm.limparFormatacaoMonetaria(1235.50);        // 1235.50
     *
     * @since 2.0.0
     * @static
     */
    static limparFormatacaoMonetaria(valor) {
        // Se já é número, retorna direto
        if (typeof valor === 'number') return valor;

        // Remove tudo exceto números, vírgula e ponto
        let valorLimpo = String(valor).replace(/[^\d.,]/g, '');

        // Converte para número (aceita tanto 1234.56 quanto 1.234,56)
        if (valorLimpo.includes(',')) {
            // Formato brasileiro: remove pontos e troca vírgula por ponto
            valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.');
        }

        return parseFloat(valorLimpo) || 0;
    }
}\n
