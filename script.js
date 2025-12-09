function login(event) {
  event.preventDefault();
  const usuarioCorreto = "admin";
  const senhaCorreta = "1234";
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === usuarioCorreto && password === senhaCorreta) {
    window.location.href = "index.html";
  } else {
    alert("Usuário ou senha incorretos.");
  }
  return false;
}

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('nav a');
  const body = document.body;

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });

  body.style.opacity = '1';
});

function filtrarCategoria() {
  const categoriaSelecionada = document.getElementById("categoria").value;
  const cards = document.querySelectorAll(".servico-card");

  cards.forEach(card => {
    const categoria = card.getAttribute("data-categoria");
    if (categoriaSelecionada === "todos" || categoria === categoriaSelecionada) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function carregarProfissionais() {
  const servicosLista = document.getElementById('servicos-lista');
  servicosLista.innerHTML = '';

  const profissionais = JSON.parse(localStorage.getItem('profissionais')) || [];

  if (profissionais.length === 0) {
    servicosLista.innerHTML = '<p style="text-align: center;">Nenhum profissional cadastrado.</p>';
    return;
  }

  profissionais.forEach(profissional => {
    const categoriaDisplay = profissional.profissao.charAt(0).toUpperCase() + profissional.profissao.slice(1);
    const emojiMap = {
      marceneiro: '🔨',
      pedreiro: '🧱',
      pintor: '🎨',
      eletricista: '⚡️',
      gesseiro: '🏬',
      encanador: '🚰'
    };

    const card = document.createElement('div');
    card.className = 'servico-card';
    card.setAttribute('data-categoria', profissional.profissao);

    card.innerHTML = `
      <div class="servico-header">
        <img src="${profissional.imagem}" alt="${profissional.nome}" class="profile-img" onerror="handleImageError(this)">
        <div>
          <h3>${profissional.nome}</h3>
          <p class="categoria"><strong>Categoria:</strong> ${categoriaDisplay} ${emojiMap[profissional.profissao]}</p>
          <div class="avaliacao" data-id="${profissional.id}" data-rating="0">
            <strong>Avaliação:</strong>
            <span class="estrela" data-value="1">★</span>
            <span class="estrela" data-value="2">★</span>
            <span class="estrela" data-value="3">★</span>
            <span class="estrela" data-value="4">★</span>
            <span class="estrela" data-value="5">★</span>
          </div>
        </div>
      </div>
      <div class="servico-info">
        <p class="preco"><strong>Preço Médio:</strong> R$ ${profissional.valor.toFixed(2)}</p>
        <p class="contato"><strong>Contato:</strong> ${profissional.contato}</p>
        <p class="descricao"><strong>Descrição:</strong> ${profissional.descricao || 'Serviço de ' + profissional.profissao}</p>
        <p class="cnpj"><strong>CNPJ:</strong> ${profissional.temCnpj === 'sim' ? 'Possui' : 'Não possui'}</p>
      </div>
      <button onclick="abrirWhatsapp('${profissional.contato}', '${profissional.nome}')">Selecionar via WhatsApp</button>
    `;

    servicosLista.appendChild(card);
  });

  inicializarAvaliacoes();
}

function handleImageError(imgElement) {
  console.log(`Erro ao carregar a imagem: ${imgElement.src}. Usando imagem padrão 'construtec.png'.`);
  imgElement.src = 'construtec.png';
  imgElement.onerror = null;
}

function mostrarCampos() {
  const select = document.getElementById("profissao");
  const campos = document.getElementById("camposAdicionais");
  campos.style.display = select.value ? "block" : "none";
}

function salvarProfissional(event) {
  event.preventDefault();

  const cpf = document.getElementById('cpf').value.trim();
  if (!cpf) {
    alert('Por favor, preencha o CPF.');
    return;
  }

  const profissionais = JSON.parse(localStorage.getItem('profissionais')) || [];
  const cpfExiste = profissionais.some(p => p.cpf === cpf);

  if (cpfExiste) {
    alert('Este CPF já está cadastrado.');
    return;
  }

  const profissao = document.getElementById('profissao').value;

  const imagemPorProfissao = {
    marceneiro: 'https://images.unsplash.com/photo-1608110114011-3a8b7953e8c0',
    pedreiro: 'https://images.unsplash.com/photo-1581091870622-2c1bd329f2e6',
    pintor: 'https://images.unsplash.com/photo-1581091012184-1d235f4cc7c7',
    eletricista: 'https://images.unsplash.com/photo-1596993893065-9f84b161a0f7',
    gesseiro: 'https://images.unsplash.com/photo-1601182429433-769d4e9ffbcc',
    encanador: 'https://images.unsplash.com/photo-1617099276883-65ba0f87a668'
  };

  const profissional = {
    profissao,
    nome: document.getElementById('nome').value,
    cpf,
    endereco: document.getElementById('endereco').value,
    valor: parseFloat(document.getElementById('valor').value.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
    contato: document.getElementById('contato').value,
    descricao: document.getElementById('descricao').value || `Serviço de ${profissao}`,
    imagem: imagemPorProfissao[profissao] || 'construtec.png',
    temCnpj: document.querySelector('input[name="temCnpj"]:checked').value,
    id: Date.now()
  };

  profissionais.push(profissional);
  localStorage.setItem('profissionais', JSON.stringify(profissionais));

  alert('Profissional cadastrado com sucesso!');
  document.getElementById('formProfissional').reset();
  mostrarCampos();
}

function inicializarAvaliacoes() {
  const avaliacoes = document.querySelectorAll('.avaliacao');
  const modal = document.getElementById('avaliacao-modal');
  const closeBtn = modal.querySelector('.close');
  const form = document.getElementById('avaliacao-form');
  let currentAvaliacao = null;

  avaliacoes.forEach(avaliacao => {
    const estrelas = avaliacao.querySelectorAll('.estrela');

    estrelas.forEach(estrela => {
      estrela.addEventListener('click', () => {
        currentAvaliacao = avaliacao;
        modal.style.display = 'flex';
        form.reset();
      });
    });

    const id = avaliacao.dataset.id;
    const savedRating = parseInt(localStorage.getItem(`avaliacao_${id}`)) || 0;
    atualizarEstrelas(avaliacao, savedRating);
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    currentAvaliacao = null;
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
      currentAvaliacao = null;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentAvaliacao) {
      alert("Selecione uma avaliação válida.");
      return;
    }

    let yesCount = 0;
    for (let i = 1; i <= 5; i++) {
      if (form.querySelector(`input[name="q${i}"][value="yes"]:checked`)) {
        yesCount++;
      }
    }

    const id = currentAvaliacao.dataset.id;
    localStorage.setItem(`avaliacao_${id}`, yesCount);
    atualizarEstrelas(currentAvaliacao, yesCount);
    modal.style.display = 'none';
    currentAvaliacao = null;
  });
}

function atualizarEstrelas(container, valor) {
  const estrelas = container.querySelectorAll('.estrela');
  estrelas.forEach((estrela, index) => {
    estrela.classList.toggle('selecionada', index < valor);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const items = track.children;
    let index = 0;

    setInterval(() => {
      index = (index + 1) % items.length;
      track.style.transform = `translateX(-${index * 100}%)`;
    }, 4000);
  });
});

function abrirWhatsapp(contato, nome) {
  const numeroLimpo = contato.replace(/\D/g, '');
  const mensagem = encodeURIComponent(`Olá ${nome}, encontrei seu serviço na ConstruTech e gostaria de saber qual disponibilidade de horários para um serviço?.`);
  const url = `https://wa.me/${numeroLimpo}?text=${mensagem}`;
  window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      let input = e.target.value.replace(/\D/g, '');
      if (input.length > 11) input = input.slice(0, 11);
      input = input.replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = input;
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const contatoInput = document.getElementById('contato');
  if (contatoInput) {
    contatoInput.addEventListener('input', (e) => {
      let input = e.target.value.replace(/\D/g, '');
      input = input.length <= 10 
        ? input.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
        : input.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      e.target.value = input;
    });
  }
});

function formatarMoeda(element) {
  let valor = element.value.replace(/\D/g, "");
  valor = (valor / 100).toFixed(2) + "";
  valor = valor.replace(".", ",");
  valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  element.value = "R$ " + valor;
}

document.addEventListener('DOMContentLoaded', carregarProfissionais);
