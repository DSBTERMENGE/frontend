/**
 * Cria um botão e uma janela de ajuda reutilizáveis para formulários.
 * O conteúdo é montado com textContent para não interpretar HTML externo.
 */
export function criarAjudaContextual({
    titulo = 'Ajuda',
    secoes = [],
    containerBotao = '#divRelSair'
} = {}) {
    document.querySelectorAll('[data-ajuda-contextual]').forEach((elemento) => {
        elemento.remove();
    });

    instalarEstilosAjuda();

    const identificador = `titulo-ajuda-${Date.now()}`;
    const dialogo = document.createElement('dialog');
    dialogo.className = 'ajuda-contextual-dialogo';
    dialogo.dataset.ajudaContextual = 'dialogo';
    dialogo.setAttribute('aria-labelledby', identificador);

    const cabecalho = document.createElement('header');
    const tituloDialogo = document.createElement('h2');
    tituloDialogo.id = identificador;
    tituloDialogo.textContent = titulo;
    cabecalho.appendChild(tituloDialogo);
    dialogo.appendChild(cabecalho);

    const conteudo = document.createElement('div');
    conteudo.className = 'ajuda-contextual-conteudo';
    secoes.forEach((secao) => {
        const bloco = document.createElement('section');
        if (secao.titulo) {
            const subtitulo = document.createElement('h3');
            subtitulo.textContent = secao.titulo;
            bloco.appendChild(subtitulo);
        }
        (secao.paragrafos || []).forEach((texto) => {
            const paragrafo = document.createElement('p');
            paragrafo.textContent = texto;
            bloco.appendChild(paragrafo);
        });
        if (secao.itens?.length) {
            const lista = document.createElement('ul');
            secao.itens.forEach((texto) => {
                const item = document.createElement('li');
                item.textContent = texto;
                lista.appendChild(item);
            });
            bloco.appendChild(lista);
        }
        conteudo.appendChild(bloco);
    });
    dialogo.appendChild(conteudo);

    const rodape = document.createElement('footer');
    const fechar = document.createElement('button');
    fechar.type = 'button';
    fechar.textContent = 'Fechar';
    fechar.addEventListener('click', () => dialogo.close());
    rodape.appendChild(fechar);
    dialogo.appendChild(rodape);
    document.body.appendChild(dialogo);

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-ajuda-contextual';
    botao.dataset.ajudaContextual = 'botao';
    botao.textContent = 'Ajuda';
    botao.title = `Abrir ajuda: ${titulo}`;
    botao.setAttribute('aria-haspopup', 'dialog');
    botao.addEventListener('click', () => dialogo.showModal());

    const destino = document.querySelector(containerBotao);
    if (destino) {
        destino.insertBefore(botao, destino.firstChild);
    } else {
        document.body.appendChild(botao);
    }

    const destruir = () => {
        botao.remove();
        if (dialogo.open) dialogo.close();
        dialogo.remove();
    };

    return { botao, dialogo, abrir: () => dialogo.showModal(), destruir };
}

function instalarEstilosAjuda() {
    if (document.getElementById('estilos-ajuda-contextual')) return;
    const estilos = document.createElement('style');
    estilos.id = 'estilos-ajuda-contextual';
    estilos.textContent = `
        .btn-ajuda-contextual {
            margin-right: .5rem;
            padding: .45rem .8rem;
            cursor: pointer;
        }
        .ajuda-contextual-dialogo {
            width: min(44rem, calc(100vw - 3rem));
            max-height: calc(100vh - 4rem);
            padding: 0;
            border: 1px solid #777;
            border-radius: .5rem;
            box-shadow: 0 .5rem 2rem rgba(0, 0, 0, .35);
        }
        .ajuda-contextual-dialogo::backdrop {
            background: rgba(0, 0, 0, .55);
        }
        .ajuda-contextual-dialogo header,
        .ajuda-contextual-dialogo footer {
            padding: .8rem 1rem;
            background: #f4f4f4;
        }
        .ajuda-contextual-dialogo h2,
        .ajuda-contextual-dialogo h3 {
            margin: 0 0 .5rem;
        }
        .ajuda-contextual-conteudo {
            overflow: auto;
            max-height: calc(100vh - 12rem);
            padding: .5rem 1rem;
        }
        .ajuda-contextual-conteudo section {
            margin-bottom: 1rem;
        }
        .ajuda-contextual-conteudo p,
        .ajuda-contextual-conteudo li {
            line-height: 1.4;
        }
        .ajuda-contextual-dialogo footer {
            text-align: right;
        }
    `;
    document.head.appendChild(estilos);
}
