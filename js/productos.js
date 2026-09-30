// =====================================================
// PRODUCTOS DE PRUEBA
// =====================================================
// Para agregar una prenda nueva, copia un bloque completo,
// pégalo antes del ]; final y cambia sus datos.
//
// destacado: true  -> aparece en Inicio
// moda: true       -> aparece en la página Moda
// etiquetas        -> crean filtros automáticos en Catálogo
// imagen            -> una imagen principal (formato antiguo, aún funciona)
// imagenes          -> permite varias vistas: frontal, laterales y trasera
// =====================================================

const PRODUCTOS = [

    // =====================================================
    // POLERAS
    // =====================================================

    {
        id: "polera-basica",
        nombre: "Polera Básica",
        precio: 9990,
        descripcionCorta: "Polera de demostración de estilo básico.",
        descripcion: "Producto de prueba utilizado para mostrar cómo funciona una ficha de producto con descripción, precio, tallas y stock.",
        imagen: "../imagenes/Polera Generica.jpg",
        etiquetas: ["Poleras", "Básicos"],
        destacado: true,
        moda: false,
        tallas: [
            { nombre: "S", stock: 3 },
            { nombre: "M", stock: 5 },
            { nombre: "L", stock: 4 },
            { nombre: "XL", stock: 2 }
        ]
    },

    {
        id: "polera-urbana",
        nombre: "Polera Urbana",
        precio: 12990,
        descripcionCorta: "Modelo de prueba con estilo urbano.",
        descripcion: "Ejemplo de una polera urbana pensada únicamente para probar el diseño y funcionamiento del catálogo.",
        imagen: "../imagenes/Polera Generica.jpg",
        etiquetas: ["Poleras", "Urbano"],
        destacado: true,
        moda: true,
        tallas: [
            { nombre: "S", stock: 2 },
            { nombre: "M", stock: 6 },
            { nombre: "L", stock: 3 },
            { nombre: "XL", stock: 1 }
        ]
    },

    {
        id: "polera-minimal",
        nombre: "Polera Minimalista",
        precio: 15000,
        descripcionCorta: "Diseño simple y minimalista de demostración.",
        descripcion: "Producto genérico utilizado para probar categorías, filtros y visualización de detalles.",
        imagen: "../imagenes/Polera Generica.jpg",
        etiquetas: ["Poleras", "Minimalista"],
        destacado: false,
        moda: true,
        tallas: [
            { nombre: "S", stock: 0 },
            { nombre: "M", stock: 4 },
            { nombre: "L", stock: 4 },
            { nombre: "XL", stock: 2 }
        ]
    },

    {
        id: "polera-grafica",
        nombre: "Polera Gráfica",
        precio: 13990,
        descripcionCorta: "Ejemplo de una polera con diseño gráfico.",
        descripcion: "Ficha de demostración para representar un producto con una propuesta gráfica sin utilizar diseños reales de una marca.",
        imagen: "../imagenes/Polera Generica.jpg",
        etiquetas: ["Poleras", "Gráficas"],
        destacado: true,
        moda: true,
        tallas: [
            { nombre: "S", stock: 2 },
            { nombre: "M", stock: 3 },
            { nombre: "L", stock: 5 },
            { nombre: "XL", stock: 0 }
        ]
    },

    {
        id: "polera-oversize",
        nombre: "Polera Oversize",
        precio: 14990,
        descripcionCorta: "Modelo oversize utilizado como producto de ejemplo.",
        descripcion: "Producto genérico para mostrar cómo una misma tienda puede organizar distintos estilos y categorías.",
        imagen: "../imagenes/Polera Generica.jpg",
        etiquetas: ["Poleras", "Oversize"],
        destacado: false,
        moda: true,
        tallas: [
            { nombre: "S", stock: 1 },
            { nombre: "M", stock: 4 },
            { nombre: "L", stock: 5 },
            { nombre: "XL", stock: 3 }
        ]
    },

    // =====================================================
    // POLERONES
    // =====================================================

    {
        id: "poleron-clasico",
        nombre: "Polerón Clásico",
        precio: 22990,
        descripcionCorta: "Polerón genérico de estilo clásico.",
        descripcion: "Producto de prueba para representar un polerón dentro del catálogo y comprobar filtros, tallas y stock.",
        imagen: "../imagenes/Poleron Generico.jpg",
        etiquetas: ["Polerones", "Clásicos"],
        destacado: false,
        moda: false,
        tallas: [
            { nombre: "S", stock: 2 },
            { nombre: "M", stock: 4 },
            { nombre: "L", stock: 6 },
            { nombre: "XL", stock: 2 }
        ]
    },

    {
        id: "poleron-premium",
        nombre: "Polerón Premium",
        precio: 27990,
        descripcionCorta: "Modelo de demostración de una línea premium.",
        descripcion: "Ejemplo genérico de un producto de mayor valor para probar distintos precios y categorías dentro de la tienda.",
        imagen: "../imagenes/Poleron Generico.jpg",
        etiquetas: ["Polerones", "Premium"],
        destacado: true,
        moda: true,
        tallas: [
            { nombre: "S", stock: 3 },
            { nombre: "M", stock: 3 },
            { nombre: "L", stock: 3 },
            { nombre: "XL", stock: 3 }
        ]
    }

    // =====================================================
    // PLANTILLA PARA UNA PRENDA NUEVA
    // =====================================================
    //
    // {
    //     id: "nombre-unico",
    //     nombre: "Nombre del producto",
    //     precio: 14990,
    //     descripcionCorta: "Texto corto para la tarjeta.",
    //     descripcion: "Descripción completa al abrir Ver producto.",
    //     // Puedes usar una sola imagen:
    //     imagen: "../imagenes/mi-producto.jpg",
    //
    //     // Recomendado: cuatro vistas del producto.
    //     // Si usas "imagenes", esta opción tiene prioridad sobre "imagen":
    //     imagenes: [
    //         { src: "../imagenes/mi-producto-frontal.jpg", vista: "Frontal" },
    //         { src: "../imagenes/mi-producto-lateral-derecho.jpg", vista: "Lateral derecho" },
    //         { src: "../imagenes/mi-producto-trasera.jpg", vista: "Trasera" },
    //         { src: "../imagenes/mi-producto-lateral-izquierdo.jpg", vista: "Lateral izquierdo" }
    //     ],
    //
    //     etiquetas: ["Poleras", "Nueva categoría"],
    //     destacado: false,
    //     moda: false,
    //     tallas: [
    //         { nombre: "S", stock: 5 },
    //         { nombre: "M", stock: 5 },
    //         { nombre: "L", stock: 5 },
    //         { nombre: "XL", stock: 5 }
    //     ]
    // }

];
