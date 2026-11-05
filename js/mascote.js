// O desenho e as reações vêm de desenhaMascote, em site/js/celular.js do Cé Sites, sem a tela do aparelho.
const canvasMascote = document.querySelector('.mascote');
const pincel = canvasMascote.getContext('2d');
const movimentoReduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EXPRESSOES = ['olhaLado', 'olhaBaixo', 'olhaCima', 'feliz', 'normal', 'desconfiado', 'piscadinha', 'surpreso', 'normal'];
const CORES = ['#9A4F96', '#E58FA6', '#E8B530'];
// recorte da grade original (720 × 1560) em que os olhos cabem com o olhar e o brilho
const RECORTE = { x: 40, y: 600, largura: 640, altura: 360 };
const olhar = { x: 0, y: 0, alvoX: 0, alvoY: 0 };

function formaOlho(cx, cy, largura, altura, raio, inclina, retoTopo = 0, retoBase = 0) {
  const esquerda = cx - largura / 2, direita = cx + largura / 2, topo = cy - altura / 2, base = cy + altura / 2;
  raio = Math.min(raio, altura / 2, largura / 2);
  const topoEsquerdo = topo + Math.max(0, inclina) * altura, topoDireito = topo + Math.max(0, -inclina) * altura;
  const raioTopo = raio * (1 - 0.7 * Math.max(inclina ? 1 : 0, retoTopo)), raioBase = raio * (1 - 0.7 * retoBase);
  pincel.beginPath();
  pincel.moveTo(esquerda, Math.min(topoEsquerdo + raioTopo, base - raioBase));
  pincel.quadraticCurveTo(esquerda, topoEsquerdo, esquerda + raioTopo, topoEsquerdo);
  pincel.lineTo(direita - raioTopo, topoDireito);
  pincel.quadraticCurveTo(direita, topoDireito, direita, Math.min(topoDireito + raioTopo, base - raioBase));
  pincel.lineTo(direita, base - raioBase);
  pincel.quadraticCurveTo(direita, base, direita - raioBase, base);
  pincel.lineTo(esquerda + raioBase, base);
  pincel.quadraticCurveTo(esquerda, base, esquerda, base - raioBase);
  pincel.closePath();
}

function desenhaMascote(segundos) {
  const escala = canvasMascote.width / RECORTE.largura;
  pincel.setTransform(1, 0, 0, 1, 0, 0);
  pincel.clearRect(0, 0, canvasMascote.width, canvasMascote.height);
  pincel.setTransform(escala, 0, 0, escala, -RECORTE.x * escala, -RECORTE.y * escala);

  const acende = 1 - Math.pow(1 - Math.min(1, segundos / 0.45), 3);
  const inicio = 1.5;
  const expressao = segundos < inicio ? 'normal' : EXPRESSOES[Math.floor((segundos - inicio) / 1.9) % EXPRESSOES.length];
  const fase = (segundos - inicio) % 1.9;
  const charme = segundos > 0.75 && segundos < 1.35;
  let pisca = 0;
  if (segundos >= inicio && (expressao === 'normal' || expressao === 'olhaLado') && fase > 1.45 && fase < 1.75) pisca = Math.sin((fase - 1.45) / 0.3 * Math.PI);
  const olharLado = expressao === 'olhaLado' ? Math.sin(fase / 1.9 * Math.PI * 2) * 46 : 0;
  const entra = segundos < inicio ? 1 : Math.max(0, Math.min(1, fase / 0.25, (1.9 - fase) / 0.25));

  const degrade = pincel.createLinearGradient(140, 640, 580, 880);
  degrade.addColorStop(0, CORES[1]); degrade.addColorStop(0.5, CORES[0]); degrade.addColorStop(1, CORES[2]);
  pincel.save();
  // sobre o papel o brilho do site vira borrão: fica só um halo curto
  pincel.shadowColor = 'rgba(154,79,150,.35)'; pincel.shadowBlur = 8;
  pincel.fillStyle = degrade; pincel.strokeStyle = degrade; pincel.lineCap = 'round';

  const olho = (centroX, lado) => {
    const cx = centroX + olharLado + olhar.x;
    const feliz = expressao === 'feliz' || (expressao === 'piscadinha' && lado > 0) || (charme && lado > 0);
    if (feliz && (entra > 0.5 || charme)) { pincel.lineWidth = 46; pincel.beginPath(); pincel.arc(cx, 800 + olhar.y, 78, Math.PI * 1.18, Math.PI * 1.82); pincel.stroke(); return; }
    let largura = 170, altura = 200, raio = 56, cy = 760 + olhar.y, retoTopo = 0, retoBase = 0;
    if (expressao === 'surpreso') { largura = 170 + 30 * entra; altura = 200 + 20 * entra; raio = 56 + 44 * entra; }
    if (feliz) altura *= 1 - entra * 1.6;
    largura *= 1 - 0.18 * Math.max(0, olharLado / 46 * lado);
    if (expressao === 'olhaBaixo') { cy += 36 * entra; altura -= 57 * entra; retoTopo = entra; }
    if (expressao === 'olhaCima') { cy -= 36 * entra; altura -= 57 * entra; retoBase = entra; }
    altura = Math.max(14, altura * acende * (1 - 0.92 * pisca));
    const inclina = expressao === 'desconfiado' ? 0.38 * entra * lado : 0;
    formaOlho(cx, cy, largura, altura, raio, inclina, retoTopo, retoBase);
    pincel.fill();
  };
  olho(230, -1); olho(490, 1);
  pincel.restore();
}

if (movimentoReduzido) {
  desenhaMascote(1.4);
} else {
  addEventListener('pointermove', evento => {
    const caixa = canvasMascote.getBoundingClientRect();
    const distanciaX = evento.clientX - (caixa.left + caixa.width / 2);
    const distanciaY = evento.clientY - (caixa.top + caixa.height / 2);
    const distancia = Math.hypot(distanciaX, distanciaY) || 1;
    const forca = Math.min(1, distancia / 200);
    olhar.alvoX = distanciaX / distancia * forca * 44;
    olhar.alvoY = distanciaY / distancia * forca * 30;
  });
  let visivel = false, quadro = 0, comecou = null;
  const anima = agora => {
    if (!visivel) { quadro = 0; return; }
    if (comecou === null) comecou = agora;
    olhar.x += (olhar.alvoX - olhar.x) * .12;
    olhar.y += (olhar.alvoY - olhar.y) * .12;
    desenhaMascote((agora - comecou) / 1000);
    quadro = requestAnimationFrame(anima);
  };
  new IntersectionObserver(([entrada]) => {
    visivel = entrada.isIntersecting;
    if (visivel && !quadro) quadro = requestAnimationFrame(anima);
    if (!visivel) comecou = null;
  }).observe(canvasMascote);
}
