/**
 * VOTAÇÃO DO MELHOR DO MUNDO 2026
 * Trabalho de Desenvolvimento Web
 * Autora: Ana
 * 
 * Funcionalidades:
 * - Votação em tempo real com cálculo de porcentagens
 * - Pódio com os 3 mais votados
 * - Filtro de jogadores por posição e busca por texto
 * - Cadastro de novos jogadores através de modal
 * - Armazenamento no LocalStorage para não perder os votos
 */

// Lista inicial de jogadores da votação
const JOGADORES_INICIAIS = [
  {
    id: 1,
    nome: "Vinicius Jr.",
    clube: "Real Madrid",
    pais: "Brasil",
    posicao: "Atacante",
    votos: 42,
    foto: "images/vini-jr.jpg"
  },
  {
    id: 2,
    nome: "Rodri",
    clube: "Manchester City",
    pais: "Espanha",
    posicao: "Meio-Campista",
    votos: 38,
    foto: "images/rodri.jpg"
  },
  {
    id: 3,
    nome: "Jude Bellingham",
    clube: "Real Madrid",
    pais: "Inglaterra",
    posicao: "Meio-Campista",
    votos: 31,
    foto: "images/bellingham.jpg"
  },
  {
    id: 4,
    nome: "Kylian Mbappé",
    clube: "Real Madrid",
    pais: "França",
    posicao: "Atacante",
    votos: 27,
    foto: "images/mbappe.jpg"
  },
  {
    id: 5,
    nome: "Erling Haaland",
    clube: "Manchester City",
    pais: "Noruega",
    posicao: "Atacante",
    votos: 25,
    foto: "images/haaland.jpg"
  },
  {
    id: 6,
    nome: "Lamine Yamal",
    clube: "Barcelona",
    pais: "Espanha",
    posicao: "Atacante",
    votos: 22,
    foto: "images/yamal.jpg"
  },
  {
    id: 7,
    nome: "Lionel Messi",
    clube: "Inter Miami",
    pais: "Argentina",
    posicao: "Atacante",
    votos: 19,
    foto: "images/messi.jpg"
  },
  {
    id: 8,
    nome: "Cristiano Ronaldo",
    clube: "Al-Nassr",
    pais: "Portugal",
    posicao: "Atacante",
    votos: 18,
    foto: "images/ronaldo.jpg"
  }
];

// Chave para salvar no LocalStorage
const STORAGE_KEY = "votacao_melhor_mundo_ana";

// Variáveis de controle de estado
let listaJogadores = [];
let filtroPosicao = "todas";
let termoBusca = "";
let ordenacao = "votos";

// ==========================================================================
// 1. CARREGAR E SALVAR DADOS (LOCALSTORAGE)
// ==========================================================================
function carregarDados() {
  const salvos = localStorage.getItem(STORAGE_KEY);
  if (salvos) {
    try {
      const dadosRecuperados = JSON.parse(salvos);
      // Mantém os votos salvos associando às fotos locais
      listaJogadores = JOGADORES_INICIAIS.map(padrao => {
        const encontrado = dadosRecuperados.find(item => item.id === padrao.id);
        return {
          ...padrao,
          votos: encontrado ? encontrado.votos : padrao.votos
        };
      });
      // Acrescenta jogadores novos criados pelo usuário
      const criadosPeloUsuario = dadosRecuperados.filter(item => !JOGADORES_INICIAIS.some(p => p.id === item.id));
      listaJogadores = [...listaJogadores, ...criadosPeloUsuario];
    } catch (e) {
      console.error("Erro ao ler localStorage:", e);
      listaJogadores = [...JOGADORES_INICIAIS];
    }
  } else {
    listaJogadores = [...JOGADORES_INICIAIS];
  }
  salvarDados();
}

function salvarDados() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaJogadores));
}

// ==========================================================================
// 2. CÁLCULOS ESTATÍSTICOS
// ==========================================================================
function calcularTotalVotos() {
  return listaJogadores.reduce((total, jogador) => total + (jogador.votos || 0), 0);
}

function obterLider() {
  if (listaJogadores.length === 0) return null;
  const ordenados = [...listaJogadores].sort((a, b) => b.votos - a.votos);
  return ordenados[0].votos > 0 ? ordenados[0] : null;
}

// Gera um avatar simples com as iniciais caso não tenha foto
function gerarAvatarIniciais(nome) {
  const partes = nome.trim().split(" ");
  let iniciais = partes[0][0];
  if (partes.length > 1) {
    iniciais += partes[partes.length - 1][0];
  }
  iniciais = iniciais.toUpperCase();

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231e3a5f"/><text x="50" y="55" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${iniciais}</text></svg>`;
}

// ==========================================================================
// 3. RENDERIZAÇÃO DA PÁGINA
// ==========================================================================
function atualizarTela() {
  renderizarResumo();
  renderizarPodio();
  renderizarListaJogadores();
}

function renderizarResumo() {
  const total = calcularTotalVotos();
  const lider = obterLider();

  document.getElementById("total-votos").textContent = total.toLocaleString("pt-BR");
  document.getElementById("total-jogadores").textContent = listaJogadores.length;

  const elementoLider = document.getElementById("nome-lider");
  if (lider) {
    elementoLider.textContent = lider.nome;
  } else {
    elementoLider.textContent = "Nenhum voto";
  }
}

function renderizarPodio() {
  const containerPodio = document.getElementById("container-podio");
  const totalVotos = calcularTotalVotos();

  // Pega os 3 mais votados
  const ordenados = [...listaJogadores].sort((a, b) => b.votos - a.votos);
  const top3 = ordenados.slice(0, 3);

  containerPodio.innerHTML = "";

  const medalhas = ["🥇", "🥈", "🥉"];
  const classesLugar = ["lugar-1", "lugar-2", "lugar-3"];

  top3.forEach((jogador, index) => {
    const porcentagem = totalVotos > 0 ? ((jogador.votos / totalVotos) * 100).toFixed(1) : 0;
    const foto = jogador.foto || gerarAvatarIniciais(jogador.nome);

    const card = document.createElement("div");
    card.className = `card-podio ${classesLugar[index]}`;

    card.innerHTML = `
      <div class="medalha-podio">${medalhas[index]}</div>
      <img class="foto-podio" src="${foto}" alt="${jogador.nome}" onerror="this.src='${gerarAvatarIniciais(jogador.nome)}'">
      <div class="info-podio">
        <h4 class="nome-podio">${jogador.nome}</h4>
        <div class="clube-podio">${jogador.clube} (${jogador.pais})</div>
        <div class="votos-podio-texto">
          <span>${jogador.votos.toLocaleString("pt-BR")} votos</span>
          <span>${porcentagem}%</span>
        </div>
        <div class="barra-podio">
          <div class="progresso-podio" style="width: ${porcentagem}%"></div>
        </div>
      </div>
    `;

    containerPodio.appendChild(card);
  });
}

function renderizarListaJogadores() {
  const grid = document.getElementById("grid-jogadores");
  const semResultados = document.getElementById("sem-resultados");
  const totalVotos = calcularTotalVotos();
  const lider = obterLider();

  // Filtra por texto de busca e por posição
  let filtrados = listaJogadores.filter(jogador => {
    const termo = termoBusca.toLowerCase().trim();
    const bateuBusca = !termo || (
      jogador.nome.toLowerCase().includes(termo) ||
      jogador.clube.toLowerCase().includes(termo) ||
      jogador.pais.toLowerCase().includes(termo) ||
      (jogador.posicao && jogador.posicao.toLowerCase().includes(termo))
    );

    const bateuPosicao = (filtroPosicao === "todas") ||
      (jogador.posicao && jogador.posicao.toLowerCase() === filtroPosicao.toLowerCase());

    return bateuBusca && bateuPosicao;
  });

  // Ordena a lista
  if (ordenacao === "votos") {
    filtrados.sort((a, b) => b.votos - a.votos);
  } else if (ordenacao === "nome") {
    filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  grid.innerHTML = "";

  if (filtrados.length === 0) {
    semResultados.style.display = "block";
    return;
  }
  semResultados.style.display = "none";

  filtrados.forEach(jogador => {
    const porcentagem = totalVotos > 0 ? ((jogador.votos / totalVotos) * 100).toFixed(1) : 0;
    const ehLider = lider && lider.id === jogador.id && jogador.votos > 0;
    const foto = jogador.foto || gerarAvatarIniciais(jogador.nome);

    const card = document.createElement("div");
    card.className = "card-jogador";

    card.innerHTML = `
      <div class="area-foto-jogador">
        <img class="foto-jogador" src="${foto}" alt="${jogador.nome}" onerror="this.src='${gerarAvatarIniciais(jogador.nome)}'">
        <span class="tag-posicao-card">${jogador.posicao || 'Jogador'}</span>
        ${ehLider ? '<span class="tag-lider-card">👑 Líder</span>' : ''}
      </div>

      <div class="corpo-card">
        <h4 class="nome-jogador">${jogador.nome}</h4>
        <div class="clube-pais-jogador">
          <i class="fa-solid fa-shield-halved"></i> ${jogador.clube} &bull; ${jogador.pais}
        </div>

        <div class="area-estatistica-votos">
          <div class="linha-votos">
            <span class="total-votos-card">${jogador.votos.toLocaleString("pt-BR")} votos</span>
            <span class="porcentagem-votos-card">${porcentagem}%</span>
          </div>
          <div class="barra-fundo">
            <div class="barra-preenchimento" style="width: ${porcentagem}%"></div>
          </div>
        </div>

        <button class="btn-votar" data-id="${jogador.id}">
          <i class="fa-solid fa-check"></i> Votar
        </button>
      </div>
    `;

    // Evento de voto no botão
    const btnVotar = card.querySelector(".btn-votar");
    btnVotar.addEventListener("click", () => {
      votarNoJogador(jogador.id);
    });

    grid.appendChild(card);
  });
}

// ==========================================================================
// 4. FUNÇÃO DE VOTO & ALERTA DE SUCESSO
// ==========================================================================
function votarNoJogador(idJogador) {
  const jogador = listaJogadores.find(j => j.id === idJogador);
  if (!jogador) return;

  jogador.votos += 1;
  salvarDados();
  atualizarTela();

  exibirAlerta(`Voto registrado para ${jogador.nome}!`);
}

let timeoutAlerta = null;
function exibirAlerta(texto) {
  const caixaAlerta = document.getElementById("mensagem-alerta");
  const textoAlerta = document.getElementById("texto-alerta");

  textoAlerta.textContent = texto;
  caixaAlerta.style.display = "flex";

  if (timeoutAlerta) clearTimeout(timeoutAlerta);

  timeoutAlerta = setTimeout(() => {
    caixaAlerta.style.display = "none";
  }, 3000);
}

// ==========================================================================
// 5. FILTROS, BUSCA E ORDENAÇÃO
// ==========================================================================
// Filtros por Posição
const botoesPosicao = document.querySelectorAll(".btn-filtro");
botoesPosicao.forEach(botao => {
  botao.addEventListener("click", () => {
    botoesPosicao.forEach(b => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    filtroPosicao = botao.dataset.pos;
    renderizarListaJogadores();
  });
});

// Campo de Busca
const inputPesquisa = document.getElementById("input-pesquisa");
const btnLimparPesquisa = document.getElementById("btn-limpar-pesquisa");
const btnRedefinirBusca = document.getElementById("btn-redefinir-busca");

inputPesquisa.addEventListener("input", (e) => {
  termoBusca = e.target.value;
  btnLimparPesquisa.style.display = termoBusca ? "block" : "none";
  renderizarListaJogadores();
});

btnLimparPesquisa.addEventListener("click", () => {
  inputPesquisa.value = "";
  termoBusca = "";
  btnLimparPesquisa.style.display = "none";
  inputPesquisa.focus();
  renderizarListaJogadores();
});

if (btnRedefinirBusca) {
  btnRedefinirBusca.addEventListener("click", () => {
    inputPesquisa.value = "";
    termoBusca = "";
    btnLimparPesquisa.style.display = "none";
    filtroPosicao = "todas";
    botoesPosicao.forEach(b => b.classList.remove("ativo"));
    document.querySelector('.btn-filtro[data-pos="todas"]').classList.add("ativo");
    renderizarListaJogadores();
  });
}

// Ordenação
const selectOrdenar = document.getElementById("select-ordenar");
selectOrdenar.addEventListener("change", (e) => {
  ordenacao = e.target.value;
  renderizarListaJogadores();
});

// Zerar Votação
const btnZerar = document.getElementById("btn-zerar-votos");
btnZerar.addEventListener("click", () => {
  const confirmou = confirm("Tem certeza que deseja zerar todos os votos desta votação?");
  if (confirmou) {
    listaJogadores.forEach(j => j.votos = 0);
    salvarDados();
    atualizarTela();
    exibirAlerta("Todos os votos foram zerados.");
  }
});

// ==========================================================================
// 6. MODAL PARA ADICIONAR NOVO JOGADOR
// ==========================================================================
const modal = document.getElementById("modal-adicionar");
const btnAbrirModal = document.getElementById("btn-novo-jogador");
const btnFecharModal = document.getElementById("btn-fechar-modal");
const btnCancelar = document.getElementById("btn-cancelar");
const formNovoJogador = document.getElementById("form-novo-jogador");

function abrirModal() {
  modal.style.display = "flex";
  document.getElementById("campo-nome").focus();
}

function fecharModal() {
  modal.style.display = "none";
  formNovoJogador.reset();
}

btnAbrirModal.addEventListener("click", abrirModal);
btnFecharModal.addEventListener("click", fecharModal);
btnCancelar.addEventListener("click", fecharModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) fecharModal();
});

// Fechar modal ao apertar ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.style.display === "flex") {
    fecharModal();
  }
});

// Salvar novo jogador
formNovoJogador.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("campo-nome").value.trim();
  const clube = document.getElementById("campo-clube").value.trim();
  const pais = document.getElementById("campo-pais").value.trim();
  const posicao = document.getElementById("campo-posicao").value;
  const foto = document.getElementById("campo-foto").value.trim();

  if (!nome || !clube || !pais) {
    alert("Por favor, preencha os campos obrigatórios (*).");
    return;
  }

  const novoJogador = {
    id: Date.now(),
    nome: nome,
    clube: clube,
    pais: pais,
    posicao: posicao,
    votos: 1, // Começa com 1 voto de quem cadastrou
    foto: foto || ""
  };

  listaJogadores.unshift(novoJogador);
  salvarDados();
  atualizarTela();

  fecharModal();
  exibirAlerta(`${nome} foi cadastrado com sucesso!`);
});

// ==========================================================================
// 7. INICIALIZAÇÃO
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
  atualizarTela();
});
