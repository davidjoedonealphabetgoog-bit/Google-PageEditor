const lienzo = document.getElementById('lienzo');
const bloques = document.querySelectorAll('.bloque-disponible');
const btnGuardar = document.getElementById('btn-guardar');
const btnLimpiar = document.getElementById('btn-limpiar');
const btnEditarBloqueado = document.getElementById('btn-editar-bloqueado');
const sidebar = document.getElementById('sidebar');
const promptIa = document.getElementById('prompt-ia');
const btnEjecutarIa = document.getElementById('btn-ejecutar-ia');

let bloqueArrastradoTipo = null;
let elementoEnMovimiento = null;
let offsetX = 0, offsetY = 0;

// --- 1. INTERRUPTOR DE MODO EDICIÓN / MODO COMPLETO ANCLADO ---
btnEditarBloqueado.addEventListener('click', () => {
  if (document.body.classList.contains('modo-anclado')) {
    document.body.classList.remove('modo-anclado');
    btnEditarBloqueado.innerText = "✕";
  } else {
    document.body.classList.add('modo-anclado');
    btnEditarBloqueado.innerText = "⚙️";
  }
});

// --- 2. MOTOR SEMÁNTICO DE IA MINIMALISTA ---
btnEjecutarIa.addEventListener('click', () => {
  const instruccion = promptIa.value.toLowerCase().trim();
  if (!instruccion) return;

  let colorFondo = "#2b2930";
  let colorBorde = "rgba(255,255,255,0.05)";
  let textoContenido = "Módulo Inteligente Personalizado";
  
  if (instruccion.includes("violeta") || instruccion.includes("morado")) { colorFondo = "#381e72"; colorBorde = "#d0bcff"; }
  if (instruccion.includes("oscuro")) { colorFondo = "#141218"; }
  if (instruccion.includes("gris")) { colorFondo = "#49454f"; }
  
  const coincidenciaTexto = instruccion.match(/["'](.*?)["']/);
  if (coincidenciaTexto) {
    textoContenido = coincidenciaTexto[1];
  }

  const nodoIaHtml = `
    <div style="background:${colorFondo}; border: 1px solid ${colorBorde}; padding:20px; border-radius:20px; min-width:220px; text-align:center; box-shadow: 0 4px 16px rgba(0,0,0,0.2);">
      <p style="margin:0; font-size:14px; font-weight:500; letter-spacing:0.2px; color:#e6e1e5;">${textoContenido}</p>
    </div>
  `;

  crearComponenteHTML('ia-generado', window.innerWidth / 2 - 110, window.innerHeight / 2 - 40, nodoIaHtml);
  promptIa.value = "";
});

// --- 3. SISTEMA DRAG & DROP SEGURO ---
bloques.forEach(bloque => {
  bloque.addEventListener('dragstart', (e) => bloqueArrastradoTipo = e.target.getAttribute('data-tipo'));
});

lienzo.addEventListener('dragover', (e) => e.preventDefault());
lienzo.addEventListener('drop', (e) => {
  e.preventDefault();
  const rect = lienzo.getBoundingClientRect();
  if (bloqueArrastradoTipo) {
    crearComponenteHTML(bloqueArrastradoTipo, e.clientX - rect.left, e.clientY - rect.top);
    bloqueArrastradoTipo = null;
  }
});

// --- 4. RENDERIZADOR NATIVO DE COMPONENTES ---
function crearComponenteHTML(tipo, x, y, contenidoGuardado = null) {
  const contenedor = document.createElement('div');
  contenedor.classList.add('elemento-html');
  contenedor.style.left = `${x}px`; contenedor.style.top = `${y}px`;
  contenedor.setAttribute('data-tipo-comp', tipo);

  const menu = document.createElement('div');
  menu.classList.add('menu-elemento');
  menu.innerHTML = `<button class="btn-del">✕</button>`;
  menu.querySelector('.btn-del').addEventListener('click', () => contenedor.remove());
  contenedor.appendChild(menu);

  const cuerpo = document.createElement('div');
  
  switch(tipo) {
    case 'titulo':
      cuerpo.innerHTML = `<h1 class="componente-titulo" contenteditable="true">${contenidoGuardado || 'Escribe algo...'}</h1>`;
      break;
    case 'buscador':
      cuerpo.innerHTML = `<div class="componente-buscador"><input type="text" placeholder="Buscar en la red o escribir dirección..." autofocus></div>`;
      const input = cuerpo.querySelector('input');
      if(contenidoGuardado) input.value = contenidoGuardado;
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== "") {
          let q = input.value.trim();
          window.location.href = (q.includes('.') && !q.includes(' ')) ? (q.startsWith('http') ? q : `https://${q}`) : `https://google.com{encodeURIComponent(q)}`;
        }
      });
      break;
    case 'reloj':
      cuerpo.innerHTML = `<div class="componente-reloj">00:00</div>`;
      const actualizarReloj = () => {
        const d = new Date();
        cuerpo.querySelector('.componente-reloj').innerText = d.toTimeString().split(' ')[0].substring(0,5);
      };
      actualizarReloj(); setInterval(actualizarReloj, 1000);
      break;
    case 'nota':
      cuerpo.innerHTML = `<textarea class="componente-nota" placeholder="Apunta algo rápido...">${contenidoGuardado || ''}</textarea>`;
      break;
    case 'clima':
      cuerpo.innerHTML = `<div class="componente-clima"><h4>Guatire</h4><h2>26°C</h2></div>`;
      break;
    case 'contador':
      let count = contenidoGuardado || 0;
      cuerpo.innerHTML = `<div class="componente-contador"><span style="font-size:14px;">Contador: <b class="num">${count}</b></span><button>+1</button></div>`;
      cuerpo.querySelector('button').addEventListener('click', () => {
        count++; cuerpo.querySelector('.num').innerText = count;
        contenedor.setAttribute('data-custom', count);
      });
      contenedor.setAttribute('data-custom', count);
      break;
    case 'frase':
      const frases = ["Hazlo simple, pero significativo.", "Menos es más.", "La simplicidad es la máxima sofisticación."];
      cuerpo.innerHTML = `<div class="componente-frase">"${contenidoGuardado || frases[Math.floor(Math.random()*frases.length)]}"</div>`;
      break;
    case 'dibujo':
      cuerpo.innerHTML = `<canvas class="componente-canvas" width="180" height="110"></canvas>`;
      setTimeout(() => configurarCanvas(cuerpo.querySelector('canvas')), 50);
      break;
    case 'ia-generado':
      cuerpo.innerHTML = contenidoGuardado;
      break;
  }

  contenedor.appendChild(cuerpo);
  lienzo.appendChild(contenedor);
  configurarMovimientoMouse(contenedor);
}

// --- 5. LOGICA DE BOCETOS MINIMALISTAS ---
function configurarCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let pintando = false;
  canvas.addEventListener('mousedown', () => pintando = true);
  canvas.addEventListener('mouseup', () => { pintando = false; ctx.beginPath(); });
  canvas.addEventListener('mousemove', (e) => {
    if(!pintando) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#rgba(255,255,255,0.4)';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  });
}

// --- 6. TRANSLACIÓN POR MOUSE ---
function configurarMovimientoMouse(elemento) {
  elemento.addEventListener('mousedown', (e) => {
    if (['INPUT', 'TEXTAREA', 'BUTTON', 'CANVAS'].includes(e.target.tagName) || e.target.getAttribute('contenteditable') === 'true') return;
    elementoEnMovimiento = elemento;
    const rect = elemento.getBoundingClientRect();
    offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
    document.addEventListener('mousemove', moverElemento);
    document.addEventListener('mouseup', detenerElemento);
  });
}

function moverElemento(e) {
  if (!elementoEnMovimiento) return;
  const rectLienzo = lienzo.getBoundingClientRect();
  let x = Math.max(0, Math.min(e.clientX - rectLienzo.left - offsetX, rectLienzo.width - elementoEnMovimiento.offsetWidth));
  let y = Math.max(0, Math.min(e.clientY - rectLienzo.top - offsetY, rectLienzo.height - elementoEnMovimiento.offsetHeight));
  elementoEnMovimiento.style.left = `${x}px`; elementoEnMovimiento.style.top = `${y}px`;
}

function detenerElemento() { elementoEnMovimiento = null; document.removeEventListener('mousemove', moverElemento); document.removeEventListener('mouseup', detenerElemento); }

// --- 7. ALMACENAMIENTO SEGURO DE ESTADOS ---
btnGuardar.addEventListener('click', () => {
  const datos = [];
  lienzo.querySelectorAll('.elemento-html').forEach(el => {
    const tipo = el.getAttribute('data-tipo-comp');
    let contenido = null;
    if (tipo === 'titulo') contenido = el.querySelector('.componente-titulo').innerText;
    if (tipo === 'buscador') contenido = el.querySelector('input').value;
    if (tipo === 'nota') contenido = el.querySelector('textarea').value;
    if (tipo === 'contador') contenido = el.getAttribute('data-custom');
    if (tipo === 'frase') contenido = el.querySelector('div').innerText.replace(/"/g, "");
    if (tipo === 'ia-generado') contenido = el.children[1].innerHTML;

    datos.push({ tipo: tipo, x: parseInt(el.style.left), y: parseInt(el.style.top), contenido: contenido });
  });

  chrome.storage.local.set({ lienzoHTML: datos }, () => {
    document.body.classList.add('modo-anclado');
    btnEditarBloqueado.innerText = "⚙️";
    alert("Diseño anclado con éxito.");
  });
});

window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['lienzoHTML'], (res) => {
    if (res.lienzoHTML) res.lienzoHTML.forEach(item => crearComponenteHTML(item.tipo, item.x, item.y, item.contenido));
  });
});

btnLimpiar.addEventListener('click', () => { if(confirm("¿Restaurar lienzo original?")) chrome.storage.local.remove('lienzoHTML', () => lienzo.innerHTML = ''); });
