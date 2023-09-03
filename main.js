const marcas = [];

const cargarMarcas = async () => {
  try {
    const response = await fetch('./json/marcas.json'); 
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo JSON');
    }
    
    const data = await response.json(); 
    marcas.push(...data); 
    llenarMarcas();
  } catch (error) {
    console.error('Error al cargar las marcas:', error);
  }
};

const llenarAnios = () => {
  const selectAnio = document.getElementById('anio');
 
  for (let i = 2000; i <= 2023; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.text = i;
    selectAnio.appendChild(option);
  }
};

const llenarMarcas = () => {
  const inputMarca = document.getElementById('marca');
  const divNoResultados = document.getElementById('noResultados');

  $(inputMarca).autocomplete({
    source: marcas,
    response: function(event, ui) {
      if (ui.content.length === 0) {
        divNoResultados.style.display = 'block';
      } else {
        divNoResultados.style.display = 'none';
      }
    }
  });
};

const mostrarCotizacionesGuardadas = () => {
  const cotizacionesPrevias = JSON.parse(localStorage.getItem('cotizaciones')) || [];
  const listaCotizaciones = document.getElementById('listaCotizaciones');

  if (cotizacionesPrevias.length === 0) {
    listaCotizaciones.innerHTML = '<p>No hay cotizaciones guardadas</p>';
  } else {
    let html = '';
    cotizacionesPrevias.forEach((cotizacion, index) => {
      html += `<li>Marca: ${cotizacion.marca}, Modelo: ${cotizacion.modelo}, Año: ${cotizacion.anio}, Tipo de Seguro: ${cotizacion.tipoSeguro}, Cotización: $${cotizacion.cotizacion}, Fecha: ${cotizacion.fecha}`;
      html += `<button class="btn btn-danger btn-sm ml-2" onclick="eliminarCotizacion(${index})">X</button></li>`;
    });
    listaCotizaciones.innerHTML = html;
  }
};

const eliminarCotizacion = (index) => {
  const cotizacionesPrevias = JSON.parse(localStorage.getItem('cotizaciones')) || [];

  if (index >= 0 && index < cotizacionesPrevias.length) {
    cotizacionesPrevias.splice(index, 1);
    localStorage.setItem('cotizaciones', JSON.stringify(cotizacionesPrevias));
    mostrarCotizacionesGuardadas();
  }
};

const toggleCotizaciones = () => {
  const cotizacionesGuardadasDiv = document.getElementById('cotizacionesGuardadas');
  const botonMostrarCotizaciones = document.getElementById('botonMostrarCotizaciones');

  if (cotizacionesGuardadasDiv.style.display === 'none') {
    cotizacionesGuardadasDiv.style.display = 'block';
    botonMostrarCotizaciones.innerText = 'Ocultar Cotizaciones Guardadas';
  } else {
    cotizacionesGuardadasDiv.style.display = 'none';
    botonMostrarCotizaciones.innerText = 'Mostrar Cotizaciones Guardadas';
  }
};

const botonMostrarCotizaciones = document.getElementById('botonMostrarCotizaciones');
botonMostrarCotizaciones.addEventListener('click', toggleCotizaciones);

const cotizarSeguro = () => {
  const marca = document.getElementById('marca').value;
  const modelo = document.getElementById('modelo').value;
  const anio = parseInt(document.getElementById('anio').value);
  const tipoSeguro = document.getElementById('tipoSeguro').value;
  const resultadoCotizacion = document.getElementById('resultadoCotizacion');
  const mensajeError = document.getElementById('mensajeError');

  if (!marca || !modelo || !anio || !tipoSeguro) {
    mensajeError.innerText = 'Por favor, llena todos los campos antes de cotizar';
    mensajeError.style.display = 'block';
    resultadoCotizacion.style.display = 'none';
    return;
  }

  let baseCotizacion = 0;

  switch (marca) {
    case 'Toyota':
      baseCotizacion = 1000;
      break;
    case 'Honda':
      baseCotizacion = 1200;
      break;
    // Agrega casos para otras marcas
    default:
      baseCotizacion = 100;
      break;
  }

  if (anio < 2000 || anio > 2023) {
    mensajeError.innerText = 'Solo ofrecemos seguros para vehículos entre los años 2000 y 2023';
    mensajeError.style.display = 'block';
    resultadoCotizacion.style.display = 'none';
    return;
  } else {
    const factorIncremento = 1.05; // 5% de incremento por año
    const aniosDesde2000 = anio - 2000;
    baseCotizacion = baseCotizacion * Math.pow(factorIncremento, aniosDesde2000);
  }

  switch (tipoSeguro) {
    case 'basico':
      // No se aplica ningún factor de ajuste al costo base
      break;
    case 'estandar':
      baseCotizacion = baseCotizacion * 1.2; // Factor de ajuste del 20%
      break;
    case 'premium':
      baseCotizacion = baseCotizacion * 1.5; // Factor de ajuste del 50%
      break;
    default:
      break;
  }

  resultadoCotizacion.innerText = 'La cotización de su seguro es: $' + Math.round(baseCotizacion);
  resultadoCotizacion.style.display = 'block';
  mensajeError.style.display = 'none';

  const cotizacionGuardada = {
    marca: marca,
    modelo: modelo,
    anio: anio,
    tipoSeguro: tipoSeguro,
    cotizacion: Math.round(baseCotizacion),
    fecha: new Date().toLocaleDateString()
  };

  let cotizacionesPrevias = JSON.parse(localStorage.getItem('cotizaciones')) || [];
  cotizacionesPrevias.push(cotizacionGuardada);
  localStorage.setItem('cotizaciones', JSON.stringify(cotizacionesPrevias));

  mostrarCotizacionesGuardadas();
};

const botonCotizar = document.getElementById('botonCotizar');
botonCotizar.addEventListener('click', cotizarSeguro);

const botonLimpiar = document.getElementById('botonLimpiar');
botonLimpiar.addEventListener('click', () => {
  document.getElementById('marca').value = '';
  document.getElementById('modelo').value = '';
  document.getElementById('anio').value = '';
  document.getElementById('resultadoCotizacion').style.display = 'none';
  document.getElementById('mensajeError').style.display = 'none';
});

window.onload = () => {
  llenarAnios();
  cargarMarcas(); 
  mostrarCotizacionesGuardadas();
};