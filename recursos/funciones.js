var productos = [];
var carrito = [];

window.addEventListener('load', iniciarPagina);

function iniciarPagina() {
  cargarProductos();
  iniciarBuscador();
  iniciarBotonArriba();
  iniciarFormulario();
  iniciarCarrito();
  iniciarMenu();
}

// =========================================================================
// MENÚ HAMBURGUESA

function iniciarMenu() {
  var boton = document.getElementById('btn-menu');
  var menu = document.getElementById('menu-principal');

  if (!boton || !menu) return;

  boton.addEventListener('click', function() {
    menu.classList.toggle('activo');
  });
}

// =========================================================================
// BUSCAR PRODUCTO

function sacarTildes(texto) {
  var conTilde = 'áéíóú';
  var sinTilde = 'aeiou';
  var resultado = '';

  for (var i = 0; i < texto.length; i++) {
    var pos = conTilde.indexOf(texto[i]);
    resultado += (pos !== -1) ? sinTilde[pos] : texto[i];
  }

  return resultado;
}

function normalizar(texto) {
  return sacarTildes(texto.toLowerCase().trim());
}

function titulosDe(fila) {
  var lista = [];
  var el = fila.previousElementSibling;

  while (el) {
    if (el.matches('h4[id]') && lista.length === 0) {
      lista.push(el);
    } else if (el.matches('h3[id]')) {
      lista.push(el);
      break;
    }
    el = el.previousElementSibling;
  }

  return lista;
}

function cargarProductos() {
  var tarjetas = document.querySelectorAll('.tarjeta-producto');

  for (var i = 0; i < tarjetas.length; i++) {
    var columna = tarjetas[i].closest('[class*="col-"]');

    if (!columna) continue;

    var titulos = titulosDe(columna.parentElement);
    var seccion = '';

    for (var j = 0; j < titulos.length; j++) {
      seccion += normalizar(titulos[j].textContent) + ' ';
    }

    productos.push({
      titulo: normalizar(tarjetas[i].querySelector('.titulo-producto').textContent),
      seccion: seccion,
      titulos: titulos,
      columna: columna
    });
  }
}

function iniciarBuscador() {
  var buscador = document.getElementById('buscador');

  if (buscador) {
    buscador.addEventListener('input', filtrarProductos);
  }
}

function filtrarProductos() {
  var texto = normalizar(document.getElementById('buscador').value);
  var titulos = document.querySelectorAll('main h3[id], main h4[id]');
  var i, j;

  for (i = 0; i < titulos.length; i++) {
    titulos[i].style.display = 'none';
  }

  for (i = 0; i < productos.length; i++) {
    var p = productos[i];
    var coincide = p.titulo.includes(texto) || p.seccion.includes(texto);

    p.columna.style.display = coincide ? '' : 'none';

    if (coincide) {
      for (j = 0; j < p.titulos.length; j++) {
        p.titulos[j].style.display = '';
      }
    }
  }
}

// =========================================================================
// BOTÓN VOLVER ARRIBA

function iniciarBotonArriba() {
  var boton = document.getElementById('btn-volver-arriba');

  if (!boton) 
    return;

  window.addEventListener('scroll', function() {
    boton.classList.toggle('visible', window.scrollY > 300);
  });

  boton.addEventListener('click', function(evento) {
    evento.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// =========================================================================
// VALIDACIÓN VISUAL DEL FORMULARIO DE CONTACTO

function iniciarFormulario() {
  var formulario = document.getElementById('contactoForm');

  if (!formulario) return;

  formulario.noValidate = true;

  var campos = formulario.querySelectorAll('input, textarea');

  for (var i = 0; i < campos.length; i++) {
    campos[i].addEventListener('input', validarCampo);
  }

  formulario.addEventListener('submit', enviarFormulario);
}

function esDigito(caracter) {
  return caracter >= '0' && caracter <= '9';
}

function soloNumeros(texto) {
  return texto.split('').filter(esDigito).join('');
}

function telefonoEsValido(valor) {
  var digitos = soloNumeros(valor);
  var i;

  for (i = 0; i < valor.length; i++) {
    if (!esDigito(valor[i]) && valor[i] !== ' ' && valor[i] !== '-') {
      return false;
    }
  }

  if (digitos.length < 8 || digitos.length > 13) {
    return false;
  }

  for (i = 1; i < digitos.length; i++) {
    if (digitos[i] !== digitos[0]) {
      return true;
    }
  }

  return false;
}

function emailEsValido(valor) {
  var posArroba = valor.indexOf('@');
  var posPunto = valor.lastIndexOf('.');

  if (valor.includes(' ')) return false;
  if (posArroba < 1) return false;
  if (valor.indexOf('@', posArroba + 1) !== -1) return false;
  if (posPunto < posArroba + 2) return false;
  if (posPunto > valor.length - 3) return false;
  return true;
}

function campoEsValido(campo) {
  var valor = campo.value.trim();

  if (campo.id === 'nombre') return valor.length >= 5 && valor.includes(' ') && soloNumeros(valor) === '';
  if (campo.id === 'email') return emailEsValido(valor);
  if (campo.id === 'telefono') return telefonoEsValido(valor);
  if (campo.id === 'mensaje') return valor.length >= 10;

  return true;
}

function pintarCampo(campo) {
  var ok = campoEsValido(campo);

  campo.classList.toggle('is-valid', ok);
  campo.classList.toggle('is-invalid', !ok);
}

function validarCampo(evento) {
  pintarCampo(evento.target);
}

function enviarFormulario(evento) {
  evento.preventDefault();

  var campos = evento.target.querySelectorAll('input, textarea');
  var i;

  for (i = 0; i < campos.length; i++) {
    pintarCampo(campos[i]);
  }

  if (evento.target.querySelector('.is-invalid')) return;

  alert('¡Gracias por tu consulta! Te vamos a responder a la brevedad.');
  evento.target.reset();

  for (i = 0; i < campos.length; i++) {
    campos[i].classList.remove('is-valid', 'is-invalid');
  }
}

// =========================================================================
// CARRITO DE COMPRAS

function formato(numero) {
  return '$' + Math.round(numero).toLocaleString('es-AR');
}

function total() {
  var suma = 0;

  for (var i = 0; i < carrito.length; i++) {
    suma += carrito[i].precio * carrito[i].cantidad;
  }

  return suma;
}

function iniciarCarrito() {
  var i;

  try {
    carrito = JSON.parse(localStorage.getItem('marBlancoCarrito')) || [];
  } catch (e) {}

  document.body.insertAdjacentHTML('beforeend',
    '<div class="offcanvas offcanvas-end" id="panelCarrito" tabindex="-1">' +
      '<div class="offcanvas-header">' +
        '<h5 class="offcanvas-title">Tu carrito</h5>' +
        '<button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>' +
      '</div>' +
      '<div class="offcanvas-body d-flex flex-column p-0">' +
        '<div class="flex-grow-1 overflow-auto px-3" id="carritoLista"></div>' +
        '<div class="border-top bg-light p-3" id="carritoPie"></div>' +
      '</div>' +
    '</div>');

  var bolsa = document.querySelector('.bolsa_compra');
  if (bolsa) {
    bolsa.innerHTML =
      '<button type="button" class="btn border-0 position-relative" data-bs-toggle="offcanvas" data-bs-target="#panelCarrito">' +
        bolsa.innerHTML +
        '<span id="contador" class="badge rounded-pill bg-primary position-absolute" style="top:0; right:-6px"></span>' +
      '</button>';
  }

  var tarjetas = document.querySelectorAll('.tarjeta-producto, .tarjeta-producto-vendido');

  for (i = 0; i < tarjetas.length; i++) {
    if (!tarjetas[i].querySelector('.titulo-producto') || !tarjetas[i].querySelector('.precio-producto')) continue;

    var boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'btn btn-agregar w-100 mt-2';
    boton.textContent = 'Agregar al carrito';
    boton.addEventListener('click', clickAgregar);
    tarjetas[i].appendChild(boton);
  }

  document.getElementById('panelCarrito').addEventListener('click', clickPanel);

  dibujarCarrito();
}

function clickAgregar(evento) {
  var boton = evento.currentTarget;
  var tarjeta = boton.closest('.tarjeta-producto, .tarjeta-producto-vendido');

  var titulo = tarjeta.querySelector('.titulo-producto').textContent.trim();
  var precio = parseInt(soloNumeros(tarjeta.querySelector('.precio-producto').textContent), 10);
  var img = tarjeta.querySelector('img').getAttribute('src');

  agregar(titulo, precio, img);

  boton.textContent = '¡Agregado!';
  boton.classList.add('agregado');

  setTimeout(function() {
    boton.textContent = 'Agregar al carrito';
    boton.classList.remove('agregado');
  }, 1200);
}

function clickPanel(evento) {
  var boton = evento.target.closest('button');

  if (!boton) return;

  var accion = boton.getAttribute('data-accion');
  var i = Number(boton.getAttribute('data-indice'));

  if (accion === 'sumar') cambiar(i, 1);
  else if (accion === 'restar') cambiar(i, -1);
  else if (accion === 'quitar') cambiar(i, -carrito[i].cantidad);
  else if (accion === 'finalizar') finalizar();
  else if (accion === 'vaciar') {
    carrito = [];
    dibujarCarrito();
  }
}

function agregar(titulo, precio, img) {
  var item = null;

  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].titulo === titulo) {
      item = carrito[i];
    }
  }

  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ titulo: titulo, precio: precio, img: img, cantidad: 1 });
  }

  dibujarCarrito();

  var contador = document.getElementById('contador');
  if (contador) {
    contador.animate([{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }], 350);
  }
}

function cambiar(i, delta) {
  carrito[i].cantidad += delta;

  if (carrito[i].cantidad <= 0) {
    carrito.splice(i, 1);
  }

  dibujarCarrito();
}

function dibujarCarrito() {
  var lista = '';
  var pie = '';
  var unidades = 0;
  var suma = total();

  for (var i = 0; i < carrito.length; i++) {
    var p = carrito[i];
    unidades += p.cantidad;

    lista +=
      '<div class="d-flex align-items-center gap-2 border-bottom py-2">' +
        '<img src="' + p.img + '" width="60" height="60" style="object-fit:cover" alt="">' +
        '<div class="flex-grow-1 small">' + p.titulo + '<br><b>' + formato(p.precio * p.cantidad) + '</b></div>' +
        '<button type="button" class="btn btn-sm btn-outline-secondary" data-accion="restar" data-indice="' + i + '">-</button>' +
        '<span>' + p.cantidad + '</span>' +
        '<button type="button" class="btn btn-sm btn-outline-secondary" data-accion="sumar" data-indice="' + i + '">+</button>' +
        '<button type="button" class="btn btn-sm text-muted" data-accion="quitar" data-indice="' + i + '">✕</button>' +
      '</div>';
  }

  if (carrito.length === 0) {
    lista = '<p class="text-center text-muted mt-4">Tu carrito está vacío.</p>';
  } else {
    pie =
      '<p class="d-flex justify-content-between small mb-1"><span>Productos (' + unidades + ')</span><span>' + formato(suma) + '</span></p>' +
      '<p class="d-flex justify-content-between fs-5 fw-bold"><span>Total</span><span>' + formato(suma) + '</span></p>' +
      '<div class="small rounded p-2 mb-3" style="background:#b9eaf1">' +
        'Efectivo (15% off): ' + formato(suma * 0.85) + '<br>' +
        'Débito / Transferencia (10% off): ' + formato(suma * 0.90) + '<br>' +
        '3 cuotas sin interés con crédito de: ' + formato(suma / 3) +
      '</div>' +
      '<button type="button" class="btn btn-agregar w-100" data-accion="finalizar">Finalizar por WhatsApp</button>' +
      '<button type="button" class="btn btn-outline-secondary w-100 mt-2" data-accion="vaciar">Vaciar carrito</button>';
  }

  document.getElementById('carritoLista').innerHTML = lista;
  document.getElementById('carritoPie').innerHTML = pie;
  document.getElementById('carritoPie').hidden = carrito.length === 0;

  var contador = document.getElementById('contador');
  if (contador) {
    contador.textContent = unidades;
    contador.hidden = unidades === 0;
  }

  try {
    localStorage.setItem('marBlancoCarrito', JSON.stringify(carrito));
  } catch (e) {}
}

function finalizar() {
  var mensaje = 'Hola! Quiero hacer este pedido:\n\n';

  for (var i = 0; i < carrito.length; i++) {
    var p = carrito[i];
    mensaje += '• ' + p.cantidad + ' x ' + p.titulo + ' - ' + formato(p.precio * p.cantidad) + '\n';
  }

  mensaje += '\nTotal: ' + formato(total());

  window.open('https://wa.me/5491162575749?text=' + encodeURIComponent(mensaje), '_blank');
}