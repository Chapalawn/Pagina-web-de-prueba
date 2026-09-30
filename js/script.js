// =====================================================
// TIENDA DEMO - FUNCIONES GENERALES
// =====================================================

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(precio);
}

function obtenerStockTotal(producto) {
    return producto.tallas.reduce((total, talla) => total + talla.stock, 0);
}

function normalizarImagenProducto(imagen, indice = 0) {
    if (typeof imagen === "string") {
        return {
            src: imagen,
            vista: indice === 0 ? "Frontal" : `Vista ${indice + 1}`
        };
    }

    if (imagen && typeof imagen === "object" && imagen.src) {
        return {
            src: imagen.src,
            vista: imagen.vista || imagen.alt || `Vista ${indice + 1}`
        };
    }

    return null;
}

function obtenerImagenesProducto(producto) {
    if (Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
        return producto.imagenes
            .map((imagen, indice) => normalizarImagenProducto(imagen, indice))
            .filter(Boolean);
    }

    if (producto.imagen) {
        return [{
            src: producto.imagen,
            vista: "Frontal"
        }];
    }

    return [];
}

function obtenerImagenPrincipal(producto) {
    const imagenPrincipal = obtenerImagenesProducto(producto)[0];
    return imagenPrincipal ? imagenPrincipal.src : "";
}

function crearImagenProducto(producto, clase = "") {
    const imagen = obtenerImagenesProducto(producto)[0];

    if (imagen) {
        return `
            <img
                class="${clase}"
                src="${imagen.src}"
                alt="${producto.nombre} - ${imagen.vista}"
            >
        `;
    }

    return `
        <div class="imagen-placeholder ${clase}">
            Imagen del producto
        </div>
    `;
}

// =====================================================
// TARJETAS DE PRODUCTO
// =====================================================

function crearTarjetaProducto(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto producto-clickeable";
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute("role", "button");
    tarjeta.setAttribute("aria-label", `Abrir ${producto.nombre}`);

    const etiquetasHTML = producto.etiquetas
        .map(etiqueta => `<span>#${etiqueta}</span>`)
        .join("");

    const stockTotal = obtenerStockTotal(producto);

    const imagenPrincipal = obtenerImagenPrincipal(producto);

    tarjeta.innerHTML = `
        <div class="imagen-producto">
            ${imagenPrincipal
                ? `<img src="${imagenPrincipal}" alt="${producto.nombre}">`
                : "<span>Imagen del producto</span>"
            }
        </div>

        <div class="producto-info">
            <div class="etiquetas-producto">
                ${etiquetasHTML}
            </div>

            <h3>${producto.nombre}</h3>
            <p class="descripcion-producto">${producto.descripcionCorta}</p>
            <p class="precio">${formatearPrecio(producto.precio)}</p>

            <p class="stock ${stockTotal > 0 ? "disponible" : "agotado"}">
                ${stockTotal > 0 ? `${stockTotal} unidades disponibles` : "Agotado"}
            </p>
        </div>
    `;

    const abrir = () => abrirProducto(producto.id);

    tarjeta.addEventListener("click", abrir);

    tarjeta.addEventListener("keydown", evento => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            abrir();
        }
    });

    return tarjeta;
}

function renderizarLista(contenedor, lista) {
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <p class="mensaje-vacio">No hay productos en esta sección.</p>
        `;
        return;
    }

    lista.forEach(producto => {
        contenedor.appendChild(crearTarjetaProducto(producto));
    });
}

// =====================================================
// PÁGINA MODA
// =====================================================

function renderizarModa() {
    const contenedor = document.getElementById("productos-moda");
    if (!contenedor) return;

    const productosModa = PRODUCTOS.filter(producto => producto.moda === true);
    renderizarLista(contenedor, productosModa);
}

// =====================================================
// CATÁLOGO POR SECCIONES
// =====================================================

const ESTADO_SECCIONES = {};
const PRODUCTOS_VISIBLES_ESCRITORIO = 3;
const PRODUCTOS_VISIBLES_MOVIL = 1;
const ANCHO_MOVIL_CATALOGO = 700;
const TIEMPO_ROTACION_SECCION = 6000;

function obtenerCantidadVisiblePorSeccion() {
    return window.innerWidth <= ANCHO_MOVIL_CATALOGO
        ? PRODUCTOS_VISIBLES_MOVIL
        : PRODUCTOS_VISIBLES_ESCRITORIO;
}

function obtenerSeccionProducto(producto) {
    return producto.etiquetas[0] || "Otros";
}

function obtenerProductosPorSeccion() {
    const secciones = {};

    PRODUCTOS.forEach(producto => {
        const seccion = obtenerSeccionProducto(producto);

        if (!secciones[seccion]) {
            secciones[seccion] = [];
        }

        secciones[seccion].push(producto);
    });

    return secciones;
}

function obtenerProductosVisiblesSeccion(productos, indice) {
    const cantidadVisible = obtenerCantidadVisiblePorSeccion();

    if (productos.length <= cantidadVisible) {
        return productos;
    }

    const visibles = [];

    for (let i = 0; i < cantidadVisible; i++) {
        visibles.push(productos[(indice + i) % productos.length]);
    }

    return visibles;
}

function renderizarContenidoSeccion(nombreSeccion) {
    const estado = ESTADO_SECCIONES[nombreSeccion];
    if (!estado) return;

    const bloque = document.querySelector(
        `[data-seccion="${CSS.escape(nombreSeccion)}"]`
    );

    if (!bloque) return;

    const grilla = bloque.querySelector(".productos-seccion");
    const controles = bloque.querySelector(".controles-seccion");

    grilla.innerHTML = "";

    obtenerProductosVisiblesSeccion(
        estado.productos,
        estado.indice
    ).forEach(producto => {
        grilla.appendChild(crearTarjetaProducto(producto));
    });

    controles.hidden =
        estado.productos.length <= obtenerCantidadVisiblePorSeccion();
}

function moverSeccion(nombreSeccion, direccion) {
    const estado = ESTADO_SECCIONES[nombreSeccion];
    if (!estado) return;

    estado.indice =
        (estado.indice + direccion + estado.productos.length) %
        estado.productos.length;

    renderizarContenidoSeccion(nombreSeccion);
    reiniciarRotacionSeccion(nombreSeccion);
}

function reiniciarRotacionSeccion(nombreSeccion) {
    const estado = ESTADO_SECCIONES[nombreSeccion];
    if (!estado) return;

    clearInterval(estado.temporizador);

    if (estado.productos.length <= obtenerCantidadVisiblePorSeccion()) {
        return;
    }

    estado.temporizador = setInterval(() => {
        estado.indice =
            (estado.indice + 1) %
            estado.productos.length;

        renderizarContenidoSeccion(nombreSeccion);
    }, TIEMPO_ROTACION_SECCION);
}

function renderizarCatalogoPorSecciones() {
    const contenedor = document.getElementById("catalogo-por-secciones");
    if (!contenedor) return;

    Object.values(ESTADO_SECCIONES).forEach(estado => {
        clearInterval(estado.temporizador);
    });

    const secciones = obtenerProductosPorSeccion();

    Object.keys(ESTADO_SECCIONES).forEach(clave => {
        delete ESTADO_SECCIONES[clave];
    });

    contenedor.innerHTML = "";

    Object.entries(secciones).forEach(([nombreSeccion, productos]) => {
        ESTADO_SECCIONES[nombreSeccion] = {
            productos,
            indice: 0,
            temporizador: null
        };

        const bloque = document.createElement("section");
        bloque.className = "catalogo-grupo";
        bloque.dataset.seccion = nombreSeccion;

        const urlCategoria =
            `categoria.html?categoria=${encodeURIComponent(nombreSeccion)}`;

        bloque.innerHTML = `
            <div class="catalogo-grupo-cabecera">
                <div>
                    <p class="titulo-pequeno">SECCIÓN</p>
                    <h2>${nombreSeccion}</h2>
                </div>

                <div class="catalogo-grupo-acciones">
                    <a
                        class="ver-todo-seccion"
                        href="${urlCategoria}"
                    >
                        Ver todo en ${nombreSeccion}
                    </a>

                    <div class="controles-seccion">
                        <button
                            class="seccion-flecha anterior"
                            type="button"
                            aria-label="Ver prendas anteriores de ${nombreSeccion}"
                        >
                            ←
                        </button>

                        <button
                            class="seccion-flecha siguiente"
                            type="button"
                            aria-label="Ver más prendas de ${nombreSeccion}"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>

            <div class="productos productos-seccion"></div>
        `;

        bloque
            .querySelector(".seccion-flecha.anterior")
            .addEventListener("click", () => {
                moverSeccion(nombreSeccion, -1);
            });

        bloque
            .querySelector(".seccion-flecha.siguiente")
            .addEventListener("click", () => {
                moverSeccion(nombreSeccion, 1);
            });

        contenedor.appendChild(bloque);

        renderizarContenidoSeccion(nombreSeccion);
        reiniciarRotacionSeccion(nombreSeccion);
    });
}

// =====================================================
// CATÁLOGO RESPONSIVE
// En escritorio muestra 3 productos por sección.
// En celular muestra 1 y rota con flechas/temporizador.
// =====================================================

function configurarCatalogoResponsive() {
    if (!document.getElementById("catalogo-por-secciones")) {
        return;
    }

    let anchoAnterior = window.innerWidth;

    window.addEventListener("resize", () => {
        const antesEraMovil = anchoAnterior <= ANCHO_MOVIL_CATALOGO;
        const ahoraEsMovil = window.innerWidth <= ANCHO_MOVIL_CATALOGO;

        if (antesEraMovil !== ahoraEsMovil) {
            Object.keys(ESTADO_SECCIONES).forEach(nombreSeccion => {
                ESTADO_SECCIONES[nombreSeccion].indice = 0;
                renderizarContenidoSeccion(nombreSeccion);
                reiniciarRotacionSeccion(nombreSeccion);
            });
        }

        anchoAnterior = window.innerWidth;
    });
}

// =====================================================
// BUSCADOR DEL CATÁLOGO
// =====================================================

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function buscarProductos(termino) {
    const consulta = normalizarTexto(termino.trim());

    if (!consulta) {
        return [];
    }

    return PRODUCTOS.filter(producto => {
        const contenido = normalizarTexto([
            producto.nombre,
            producto.descripcionCorta,
            producto.descripcion,
            ...producto.etiquetas
        ].join(" "));

        return contenido.includes(consulta);
    });
}

function configurarBuscadorCatalogo() {
    const input = document.getElementById("buscador-catalogo");
    const limpiarBusqueda = document.getElementById("limpiar-busqueda");
    const estado = document.getElementById("estado-busqueda");
    const resultados = document.getElementById("resultados-busqueda");
    const productosResultados = document.getElementById("productos-busqueda");
    const tituloResultados = document.getElementById("titulo-resultados");
    const carruselModa = document.querySelector(".carrusel-moda");
    const catalogoSecciones = document.querySelector(".catalogo-secciones");

    const botonFiltros = document.getElementById("alternar-filtros-catalogo");
    const panelFiltros = document.getElementById("filtros-catalogo-panel");
    const categoriasContenedor = document.getElementById("filtros-categorias-catalogo");
    const estilosContenedor = document.getElementById("filtros-estilos-catalogo");
    const soloDisponibles = document.getElementById("solo-disponibles-catalogo");
    const limpiarFiltros = document.getElementById("limpiar-filtros-catalogo");

    if (
        !input ||
        !limpiarBusqueda ||
        !estado ||
        !resultados ||
        !productosResultados ||
        !tituloResultados ||
        !carruselModa ||
        !catalogoSecciones ||
        !botonFiltros ||
        !panelFiltros ||
        !categoriasContenedor ||
        !estilosContenedor ||
        !soloDisponibles ||
        !limpiarFiltros
    ) {
        return;
    }

    const categorias = obtenerCategoriasCatalogo();

    categoriasContenedor.innerHTML = categorias
        .map(categoria => `
            <label class="filtro-check">
                <input
                    type="checkbox"
                    name="categoria-catalogo"
                    value="${categoria}"
                >
                <span>${categoria}</span>
            </label>
        `)
        .join("");

    function obtenerCategoriasSeleccionadas() {
        return [...categoriasContenedor.querySelectorAll(
            'input[name="categoria-catalogo"]:checked'
        )].map(input => input.value);
    }

    function obtenerEstilosSeleccionados() {
        return [...estilosContenedor.querySelectorAll(
            'input[name="estilo-catalogo"]:checked'
        )].map(input => input.value);
    }

    function reconstruirFiltrosEstilo() {
        const seleccionadosAntes = new Set(obtenerEstilosSeleccionados());
        const categoriasSeleccionadas = obtenerCategoriasSeleccionadas();

        const productosBase = categoriasSeleccionadas.length === 0
            ? PRODUCTOS
            : PRODUCTOS.filter(producto =>
                categoriasSeleccionadas.includes(obtenerSeccionProducto(producto))
            );

        const estilos = [...new Set(
            productosBase.flatMap(producto => producto.etiquetas.slice(1))
        )];

        estilosContenedor.innerHTML = estilos.length
            ? estilos
                .map(estilo => `
                    <label class="filtro-check">
                        <input
                            type="checkbox"
                            name="estilo-catalogo"
                            value="${estilo}"
                            ${seleccionadosAntes.has(estilo) ? "checked" : ""}
                        >
                        <span>${estilo}</span>
                    </label>
                `)
                .join("")
            : '<p class="filtro-vacio">No hay estilos disponibles.</p>';
    }

    function actualizarTextoBotonFiltros() {
        const cantidadActivos =
            obtenerCategoriasSeleccionadas().length +
            obtenerEstilosSeleccionados().length +
            (soloDisponibles.checked ? 1 : 0);

        botonFiltros.textContent =
            cantidadActivos > 0
                ? `Filtros (${cantidadActivos})`
                : "Filtros";
    }

    function aplicarFiltrosCatalogo() {
        const consulta = normalizarTexto(input.value.trim());
        const categoriasSeleccionadas = obtenerCategoriasSeleccionadas();
        const estilosSeleccionados = obtenerEstilosSeleccionados();
        const soloConStock = soloDisponibles.checked;

        const hayFiltrosActivos =
            consulta.length > 0 ||
            categoriasSeleccionadas.length > 0 ||
            estilosSeleccionados.length > 0 ||
            soloConStock;

        limpiarBusqueda.hidden = consulta.length === 0;
        actualizarTextoBotonFiltros();

        if (!hayFiltrosActivos) {
            resultados.hidden = true;
            carruselModa.hidden = false;
            catalogoSecciones.hidden = false;
            estado.textContent = "";
            productosResultados.innerHTML = "";
            return;
        }

        const filtrados = PRODUCTOS.filter(producto => {
            const textoProducto = normalizarTexto([
                producto.nombre,
                producto.descripcionCorta,
                producto.descripcion,
                ...producto.etiquetas
            ].join(" "));

            const coincideBusqueda =
                !consulta ||
                textoProducto.includes(consulta);

            const coincideCategoria =
                categoriasSeleccionadas.length === 0 ||
                categoriasSeleccionadas.includes(
                    obtenerSeccionProducto(producto)
                );

            const coincideEstilo =
                estilosSeleccionados.length === 0 ||
                estilosSeleccionados.some(estilo =>
                    producto.etiquetas.includes(estilo)
                );

            const coincideStock =
                !soloConStock ||
                obtenerStockTotal(producto) > 0;

            return (
                coincideBusqueda &&
                coincideCategoria &&
                coincideEstilo &&
                coincideStock
            );
        });

        resultados.hidden = false;
        carruselModa.hidden = true;
        catalogoSecciones.hidden = true;

        if (input.value.trim()) {
            tituloResultados.textContent =
                `Resultados para “${input.value.trim()}”`;
        } else if (categoriasSeleccionadas.length === 1) {
            tituloResultados.textContent =
                categoriasSeleccionadas[0];
        } else {
            tituloResultados.textContent =
                "Productos filtrados";
        }

        estado.textContent =
            filtrados.length === 1
                ? "1 producto encontrado"
                : `${filtrados.length} productos encontrados`;

        renderizarLista(productosResultados, filtrados);
    }

    botonFiltros.addEventListener("click", () => {
        const seAbre = panelFiltros.hidden;

        panelFiltros.hidden = !seAbre;
        botonFiltros.setAttribute(
            "aria-expanded",
            String(seAbre)
        );
    });

    input.addEventListener("input", aplicarFiltrosCatalogo);

    limpiarBusqueda.addEventListener("click", () => {
        input.value = "";
        aplicarFiltrosCatalogo();
        input.focus();
    });

    categoriasContenedor.addEventListener("change", () => {
        reconstruirFiltrosEstilo();
        aplicarFiltrosCatalogo();
    });

    estilosContenedor.addEventListener("change", aplicarFiltrosCatalogo);
    soloDisponibles.addEventListener("change", aplicarFiltrosCatalogo);

    limpiarFiltros.addEventListener("click", () => {
        categoriasContenedor
            .querySelectorAll('input[type="checkbox"]')
            .forEach(input => {
                input.checked = false;
            });

        soloDisponibles.checked = false;
        reconstruirFiltrosEstilo();

        estilosContenedor
            .querySelectorAll('input[type="checkbox"]')
            .forEach(input => {
                input.checked = false;
            });

        aplicarFiltrosCatalogo();
    });

    reconstruirFiltrosEstilo();
    aplicarFiltrosCatalogo();
}

// =====================================================
// PÁGINA DE CATEGORÍA CON FILTROS
// =====================================================

function obtenerCategoriasCatalogo() {
    return [...new Set(
        PRODUCTOS.map(producto => obtenerSeccionProducto(producto))
    )];
}

function obtenerCategoriaActual() {
    const parametros = new URLSearchParams(window.location.search);
    const solicitada = parametros.get("categoria");
    const categorias = obtenerCategoriasCatalogo();

    if (solicitada && categorias.includes(solicitada)) {
        return solicitada;
    }

    return categorias[0] || "Productos";
}

function configurarPaginaCategoria() {
    const pagina = document.getElementById("pagina-categoria");
    if (!pagina) return;

    const categoriaActual = obtenerCategoriaActual();
    const productosCategoria = PRODUCTOS.filter(
        producto => obtenerSeccionProducto(producto) === categoriaActual
    );

    const titulo = document.getElementById("categoria-titulo");
    const ruta = document.getElementById("categoria-ruta");
    const listaCategorias = document.getElementById("filtro-categorias");
    const listaEstilos = document.getElementById("filtro-estilos");
    const productosContenedor = document.getElementById("productos-categoria");
    const cantidad = document.getElementById("cantidad-resultados");
    const buscador = document.getElementById("buscador-categoria");
    const limpiarBusqueda = document.getElementById("limpiar-busqueda-categoria");
    const stockDisponible = document.getElementById("solo-disponibles");
    const botonFiltros = document.getElementById("alternar-filtros");
    const panel = document.getElementById("panel-filtros");
    const hostMovil = document.getElementById("host-filtros-movil");
    const anclaDesktop = document.getElementById("ancla-filtros-desktop");

    if (
        !titulo ||
        !ruta ||
        !listaCategorias ||
        !listaEstilos ||
        !productosContenedor ||
        !cantidad ||
        !buscador ||
        !limpiarBusqueda ||
        !stockDisponible ||
        !botonFiltros ||
        !panel ||
        !hostMovil ||
        !anclaDesktop
    ) {
        return;
    }

    document.title = `Tienda Demo | ${categoriaActual}`;
    titulo.textContent = categoriaActual;
    ruta.textContent = categoriaActual;
    buscador.placeholder = `Buscar dentro de ${categoriaActual.toLowerCase()}...`;

    const categorias = obtenerCategoriasCatalogo();

    listaCategorias.innerHTML = categorias
        .map(categoria => {
            const activa = categoria === categoriaActual ? "activa" : "";

            return `
                <a
                    class="filtro-categoria-link ${activa}"
                    href="categoria.html?categoria=${encodeURIComponent(categoria)}"
                >
                    ${categoria}
                </a>
            `;
        })
        .join("");

    const estilos = [...new Set(
        productosCategoria.flatMap(producto => producto.etiquetas.slice(1))
    )];

    listaEstilos.innerHTML = estilos.length
        ? estilos
            .map(estilo => `
                <label class="filtro-check">
                    <input
                        type="checkbox"
                        name="estilo"
                        value="${estilo}"
                    >
                    <span>${estilo}</span>
                </label>
            `)
            .join("")
        : '<p class="filtro-vacio">No hay subcategorías disponibles.</p>';

    function obtenerEstilosSeleccionados() {
        return [...listaEstilos.querySelectorAll(
            'input[name="estilo"]:checked'
        )].map(input => input.value);
    }

    function aplicarFiltros() {
        const consulta = normalizarTexto(buscador.value.trim());
        const estilosSeleccionados = obtenerEstilosSeleccionados();
        const soloConStock = stockDisponible.checked;

        const filtrados = productosCategoria.filter(producto => {
            const textoProducto = normalizarTexto([
                producto.nombre,
                producto.descripcionCorta,
                producto.descripcion,
                ...producto.etiquetas
            ].join(" "));

            const coincideBusqueda =
                !consulta ||
                textoProducto.includes(consulta);

            const coincideEstilo =
                estilosSeleccionados.length === 0 ||
                estilosSeleccionados.some(estilo =>
                    producto.etiquetas.includes(estilo)
                );

            const coincideStock =
                !soloConStock ||
                obtenerStockTotal(producto) > 0;

            return (
                coincideBusqueda &&
                coincideEstilo &&
                coincideStock
            );
        });

        renderizarLista(productosContenedor, filtrados);

        cantidad.textContent =
            filtrados.length === 1
                ? "1 producto"
                : `${filtrados.length} productos`;

        limpiarBusqueda.hidden =
            buscador.value.trim().length === 0;
    }

    function esMovil() {
        return window.innerWidth <= 700;
    }

    function actualizarBotonFiltros(abierto) {
        botonFiltros.setAttribute("aria-expanded", String(abierto));
        botonFiltros.textContent = abierto
            ? "Ocultar filtros"
            : "Mostrar filtros";
    }

    function establecerFiltros(abierto) {
        pagina.classList.toggle("filtros-ocultos", !abierto);
        panel.hidden = !abierto;
        actualizarBotonFiltros(abierto);
    }

    function ubicarPanelSegunPantalla(inicial = false) {
        if (esMovil()) {
            if (panel.parentElement !== hostMovil) {
                hostMovil.appendChild(panel);
            }

            if (inicial) {
                establecerFiltros(false);
            }
        } else {
            if (panel.parentElement !== anclaDesktop) {
                anclaDesktop.appendChild(panel);
            }

            if (inicial) {
                establecerFiltros(true);
            }
        }
    }

    buscador.addEventListener("input", aplicarFiltros);

    limpiarBusqueda.addEventListener("click", () => {
        buscador.value = "";
        aplicarFiltros();
        buscador.focus();
    });

    listaEstilos.addEventListener("change", aplicarFiltros);
    stockDisponible.addEventListener("change", aplicarFiltros);

    botonFiltros.addEventListener("click", () => {
        const abierto =
            botonFiltros.getAttribute("aria-expanded") === "true";

        establecerFiltros(!abierto);
    });

    let eraMovil = esMovil();

    window.addEventListener("resize", () => {
        const ahoraEsMovil = esMovil();

        if (ahoraEsMovil !== eraMovil) {
            ubicarPanelSegunPantalla(true);
            eraMovil = ahoraEsMovil;
        }
    });

    ubicarPanelSegunPantalla(true);
    aplicarFiltros();
}

// =====================================================
// CARRUSEL "PRODUCTOS DE MODA"
// =====================================================

let indiceModa = 0;
let temporizadorModa = null;

function obtenerProductosModa() {
    return PRODUCTOS.filter(producto => producto.moda === true);
}

function mostrarProductoModa(indice) {
    const contenedor = document.getElementById("carrusel-moda-producto");
    const indicadores = document.getElementById("carrusel-indicadores");
    if (!contenedor || !indicadores) return;

    const productosModa = obtenerProductosModa();

    if (productosModa.length === 0) {
        contenedor.innerHTML = `
            <p class="mensaje-vacio">No hay productos marcados como moda.</p>
        `;
        indicadores.innerHTML = "";
        return;
    }

    indiceModa = (indice + productosModa.length) % productosModa.length;
    const producto = productosModa[indiceModa];

    contenedor.innerHTML = `
        <article
            class="slide-moda producto-clickeable"
            role="button"
            tabindex="0"
            aria-label="Abrir ${producto.nombre}"
        >
            <div class="slide-moda-imagen">
                ${crearImagenProducto(producto)}
            </div>

            <div class="slide-moda-info">
                <div class="etiquetas-producto">
                    ${producto.etiquetas.map(etiqueta => `<span>#${etiqueta}</span>`).join("")}
                </div>

                <p class="slide-contador">
                    ${String(indiceModa + 1).padStart(2, "0")}
                    /
                    ${String(productosModa.length).padStart(2, "0")}
                </p>

                <h3>${producto.nombre}</h3>
                <p>${producto.descripcionCorta}</p>
                <p class="precio">${formatearPrecio(producto.precio)}</p>
            </div>
        </article>
    `;

    const slide = contenedor.querySelector(".slide-moda");
    const abrir = () => abrirProducto(producto.id);

    slide.addEventListener("click", abrir);

    slide.addEventListener("keydown", evento => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            abrir();
        }
    });

    indicadores.innerHTML = productosModa
        .map((_, posicion) => `
            <span class="${posicion === indiceModa ? "activo" : ""}"></span>
        `)
        .join("");
}

function iniciarCarruselModa() {
    const anterior = document.getElementById("moda-anterior");
    const siguiente = document.getElementById("moda-siguiente");

    if (!anterior || !siguiente) return;

    mostrarProductoModa(0);

    const reiniciarTemporizador = () => {
        clearInterval(temporizadorModa);

        temporizadorModa = setInterval(() => {
            mostrarProductoModa(indiceModa + 1);
        }, 5000);
    };

    anterior.addEventListener("click", () => {
        mostrarProductoModa(indiceModa - 1);
        reiniciarTemporizador();
    });

    siguiente.addEventListener("click", () => {
        mostrarProductoModa(indiceModa + 1);
        reiniciarTemporizador();
    });

    reiniciarTemporizador();
}

// =====================================================
// DETALLE DE PRODUCTO A PANTALLA COMPLETA
// =====================================================

let tallaSeleccionada = null;

function abrirProducto(idProducto) {
    const modal = document.getElementById("modal-producto");
    const modalContenido = document.getElementById("modal-contenido");

    if (!modal || !modalContenido) return;

    const producto = PRODUCTOS.find(producto => producto.id === idProducto);
    if (!producto) return;

    tallaSeleccionada = null;

    const stockTotal = obtenerStockTotal(producto);
    const imagenes = obtenerImagenesProducto(producto);
    let indiceImagen = 0;

    const tallasHTML = producto.tallas
        .map(talla => `
            <button
                type="button"
                class="talla-selector ${talla.stock === 0 ? "agotada" : ""}"
                data-talla="${talla.nombre}"
                ${talla.stock === 0 ? "disabled" : ""}
            >
                <strong>${talla.nombre}</strong>
                <span>${talla.stock > 0 ? `${talla.stock} disponibles` : "Agotada"}</span>
            </button>
        `)
        .join("");

    const etiquetasHTML = producto.etiquetas
        .map(etiqueta => `<span>#${etiqueta}</span>`)
        .join("");

    const imagenPrincipalHTML = imagenes.length
        ? `
            <img
                id="imagen-principal-producto"
                src="${imagenes[0].src}"
                alt="${producto.nombre} - ${imagenes[0].vista}"
            >
        `
        : `
            <div class="imagen-placeholder">
                Imagen del producto
            </div>
        `;

    const miniaturasHTML = imagenes.length > 1
        ? imagenes
            .map((imagen, indice) => `
                <button
                    type="button"
                    class="miniatura-producto ${indice === 0 ? "activa" : ""}"
                    data-imagen-index="${indice}"
                    aria-label="Ver ${imagen.vista.toLowerCase()} de ${producto.nombre}"
                    title="${imagen.vista}"
                >
                    <img src="${imagen.src}" alt="${producto.nombre} - ${imagen.vista}">
                    <span>${imagen.vista}</span>
                </button>
            `)
            .join("")
        : "";

    modalContenido.innerHTML = `
        <article class="detalle-producto detalle-producto-pantalla">

            <div class="detalle-principal">
                <section class="galeria-producto" aria-label="Imágenes del producto">
                    <div class="galeria-principal">
                        ${imagenPrincipalHTML}

                        ${imagenes.length
                            ? `<span id="vista-imagen-producto" class="vista-imagen-producto">${imagenes[0].vista}</span>`
                            : ""
                        }

                        ${imagenes.length > 1
                            ? `
                                <button
                                    type="button"
                                    class="galeria-flecha galeria-anterior"
                                    aria-label="Imagen anterior"
                                >
                                    ←
                                </button>

                                <button
                                    type="button"
                                    class="galeria-flecha galeria-siguiente"
                                    aria-label="Imagen siguiente"
                                >
                                    →
                                </button>
                            `
                            : ""
                        }
                    </div>

                    ${imagenes.length > 1
                        ? `
                            <div class="galeria-miniaturas">
                                ${miniaturasHTML}
                            </div>
                        `
                        : ""
                    }
                </section>

                <section class="detalle-informacion">
                    <div class="etiquetas-producto">
                        ${etiquetasHTML}
                    </div>

                    <h1>${producto.nombre}</h1>
                    <p class="precio-modal">${formatearPrecio(producto.precio)}</p>
                    <p class="descripcion-completa">${producto.descripcion}</p>

                    <div class="separador"></div>

                    <section class="bloque-solicitud">
                        <h2>Elige tu talla</h2>
                        <p class="texto-ayuda">
                            Selecciona una talla disponible para preparar tu solicitud.
                        </p>

                        <div class="tallas-selector">
                            ${tallasHTML}
                        </div>

                        <div class="cantidad-solicitud">
                            <label for="cantidad-producto">Cantidad</label>
                            <input
                                id="cantidad-producto"
                                type="number"
                                min="1"
                                value="1"
                                inputmode="numeric"
                            >
                        </div>

                        <p class="stock-modal">
                            ${stockTotal > 0
                                ? `${stockTotal} unidades disponibles en total`
                                : "Producto agotado"
                            }
                        </p>

                        <button
                            id="solicitar-producto"
                            class="boton-solicitud"
                            type="button"
                            ${stockTotal === 0 ? "disabled" : ""}
                        >
                            Solicitar prenda
                        </button>

                        <div id="mensaje-solicitud" class="mensaje-solicitud" aria-live="polite"></div>
                    </section>
                </section>
            </div>

            <section class="seccion-resenas detalle-resenas">
                <div class="cabecera-resenas">
                    <div>
                        <p class="titulo-pequeno">COMUNIDAD</p>
                        <h2>Opiniones</h2>
                    </div>
                </div>

                <div id="lista-resenas" class="lista-resenas"></div>

                <form id="form-resena" class="form-resena">
                    <h3>Deja tu opinión</h3>

                    <label for="nombre-resena">Nombre</label>
                    <input id="nombre-resena" type="text" maxlength="40" required>

                    <label for="estrellas-resena">Calificación</label>
                    <select id="estrellas-resena" required>
                        <option value="5">★★★★★</option>
                        <option value="4">★★★★</option>
                        <option value="3">★★★</option>
                        <option value="2">★★</option>
                        <option value="1">★</option>
                    </select>

                    <label for="texto-resena">Comentario</label>
                    <textarea id="texto-resena" maxlength="300" required></textarea>

                    <button type="submit" class="boton-guardar-resena">
                        Guardar opinión
                    </button>
                </form>
            </section>
        </article>
    `;

    function mostrarImagen(indice) {
        if (imagenes.length === 0) return;

        indiceImagen =
            (indice + imagenes.length) %
            imagenes.length;

        const imagenPrincipal =
            document.getElementById("imagen-principal-producto");

        if (imagenPrincipal) {
            imagenPrincipal.src = imagenes[indiceImagen].src;
            imagenPrincipal.alt =
                `${producto.nombre} - ${imagenes[indiceImagen].vista}`;
        }

        const etiquetaVista =
            document.getElementById("vista-imagen-producto");

        if (etiquetaVista) {
            etiquetaVista.textContent =
                imagenes[indiceImagen].vista;
        }

        modalContenido
            .querySelectorAll(".miniatura-producto")
            .forEach((miniatura, posicion) => {
                miniatura.classList.toggle(
                    "activa",
                    posicion === indiceImagen
                );
            });
    }

    modalContenido
        .querySelectorAll(".miniatura-producto")
        .forEach(miniatura => {
            miniatura.addEventListener("click", () => {
                mostrarImagen(Number(miniatura.dataset.imagenIndex));
            });
        });

    const anterior = modalContenido.querySelector(".galeria-anterior");
    const siguiente = modalContenido.querySelector(".galeria-siguiente");

    if (anterior) {
        anterior.addEventListener("click", () => {
            mostrarImagen(indiceImagen - 1);
        });
    }

    if (siguiente) {
        siguiente.addEventListener("click", () => {
            mostrarImagen(indiceImagen + 1);
        });
    }

    modalContenido.querySelectorAll(".talla-selector:not(.agotada)").forEach(boton => {
        boton.addEventListener("click", () => {
            tallaSeleccionada = boton.dataset.talla;

            modalContenido.querySelectorAll(".talla-selector").forEach(item => {
                item.classList.remove("seleccionada");
            });

            boton.classList.add("seleccionada");
        });
    });

    const botonSolicitar = document.getElementById("solicitar-producto");

    if (botonSolicitar) {
        botonSolicitar.addEventListener("click", () => {
            const mensaje = document.getElementById("mensaje-solicitud");
            const cantidad = Number(document.getElementById("cantidad-producto").value);

            if (!tallaSeleccionada) {
                mensaje.textContent = "Selecciona una talla antes de continuar.";
                mensaje.className = "mensaje-solicitud error";
                return;
            }

            if (!cantidad || cantidad < 1) {
                mensaje.textContent = "Ingresa una cantidad válida.";
                mensaje.className = "mensaje-solicitud error";
                return;
            }

            mensaje.innerHTML = `
                <strong>Solicitud preparada.</strong><br>
                ${producto.nombre} · Talla ${tallaSeleccionada} · Cantidad ${cantidad}.<br>
                <span>En la versión final este paso se conectará con la cuenta del cliente y el carrito.</span>
            `;

            mensaje.className = "mensaje-solicitud exito";
        });
    }

    renderizarResenas(producto.id);

    document.getElementById("form-resena").addEventListener("submit", evento => {
        evento.preventDefault();
        guardarResena(producto.id);
    });

    modal.showModal();
    document.body.classList.add("producto-abierto");
    modal.scrollTop = 0;
}

function configurarModal() {
    const modal = document.getElementById("modal-producto");
    const botonCerrar = document.getElementById("cerrar-modal");

    if (!modal || !botonCerrar) return;

    const cerrar = () => {
        modal.close();
        document.body.classList.remove("producto-abierto");
    };

    botonCerrar.addEventListener("click", cerrar);

    modal.addEventListener("close", () => {
        document.body.classList.remove("producto-abierto");
    });
}

// =====================================================
// RESEÑAS - DEMOSTRACIÓN LOCAL
// =====================================================
// En esta demo las reseñas siguen guardándose solo en el navegador.
// Los controles de borrado NO se muestran al público.
// Cuando exista autenticación real, las acciones administrativas
// deberán validarse en el backend, no únicamente ocultarse con CSS.

function obtenerClaveResenas(idProducto) {
    return `demo_resenas_${idProducto}`;
}

function obtenerResenas(idProducto) {
    try {
        const datos = localStorage.getItem(obtenerClaveResenas(idProducto));
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        console.error("No se pudieron leer las reseñas:", error);
        return [];
    }
}

function guardarResenas(idProducto, resenas) {
    localStorage.setItem(
        obtenerClaveResenas(idProducto),
        JSON.stringify(resenas)
    );
}

function guardarResena(idProducto) {
    const nombre = document.getElementById("nombre-resena").value.trim();
    const estrellas = Number(document.getElementById("estrellas-resena").value);
    const comentario = document.getElementById("texto-resena").value.trim();

    if (!nombre || !comentario) return;

    const resenas = obtenerResenas(idProducto);

    resenas.unshift({
        nombre,
        estrellas,
        comentario,
        fecha: new Date().toLocaleDateString("es-CL")
    });

    guardarResenas(idProducto, resenas);
    document.getElementById("form-resena").reset();
    renderizarResenas(idProducto);
}

function renderizarResenas(idProducto) {
    const contenedor = document.getElementById("lista-resenas");
    if (!contenedor) return;

    const resenas = obtenerResenas(idProducto);
    contenedor.innerHTML = "";

    if (resenas.length === 0) {
        contenedor.innerHTML = `
            <p class="sin-resenas">Todavía no hay opiniones guardadas en este dispositivo.</p>
        `;
        return;
    }

    resenas.forEach(resena => {
        const articulo = document.createElement("article");
        articulo.className = "resena";

        articulo.innerHTML = `
            <div class="resena-cabecera">
                <div>
                    <strong>${resena.nombre}</strong>
                    <span class="estrellas">${"★".repeat(resena.estrellas)}</span>
                </div>
            </div>

            <p>${resena.comentario}</p>
            <small>${resena.fecha}</small>
        `;

        contenedor.appendChild(articulo);
    });
}

// =====================================================
// INICIAR SEGÚN LA PÁGINA
// =====================================================

renderizarModa();
renderizarCatalogoPorSecciones();
configurarCatalogoResponsive();
configurarBuscadorCatalogo();
configurarPaginaCategoria();
iniciarCarruselModa();
configurarModal();
