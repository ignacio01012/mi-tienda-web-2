    // =============== CONFIGURACIÓN BÁSICA =================
    // Número de WhatsApp en formato internacional (Chile: 56 + 9 + número)
    const WHATSAPP_DEFAULT = "56922502689"; // ← reemplaza con tu número real

    // Texto adicional que se incluye en el mensaje de WhatsApp
    const MENSAJE_EXTRA = "Hola, quiero este producto:";

    // Formateador CLP
    const fmt = new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });

    // =============== LISTA DE PRODUCTOS (EJEMPLO) =================
    // Puedes pegar tus URLs reales de imágenes (JPG/PNG/WebP). Si no tienes, deja vacío y se verá un fondo.
    // Campos: id, nombre, precio, categoria, descripcion, imagen (URL opcional), phone (opcional)
    const productos = [
      { id: 1, nombre: "zapato de cueca hombre", precio: 12000, categoria: "calzado", descripcion: "zapato de cueca de hombre 23 - 29", imagen: "IMG/bota_2.jpg", phone: "56922502689" },
      { id: 2, nombre: "zapato de charol mujer", precio: 10000, categoria: "calzado", descripcion: "zapato de charol de dama 24 - 29", imagen: "IMG/charol_1.jpg" },
      { id: 3, nombre: "zapatos de cueca hombre", precio: 12000, categoria: "calzado", descripcion: "zapato de cueca de hombre 30 - 39", imagen: "IMG/bota_1.jpg" },
      { id: 4, nombre: "pañuelo sin diseño", precio: 1000, categoria: "Accesorios", descripcion: "pañuelos de hombre con diseño", imagen: "IMG/kjk.jpg" },
      { id: 5, nombre: "zapato de opaco mujer", precio: 10000, categoria: "calzado", descripcion: "zapato de opaco de dama 30 - 41", imagen: "IMG/opaco_2.jpg" },
      { id: 6, nombre: "zapato de cueca mujer", precio: 10000, categoria: "calzado", descripcion: "zapato de charol de dama 30 - 41", imagen: "IMG/charol_2.jpg" },
      { id: 7, nombre: "pañuelo mujer", precio: 1000, categoria: "Accesorios", descripcion: "pañuelos de mujer con diseño", imagen: "IMG/ghg.jpg" },
      { id: 8, nombre: "pañuelo hombre", precio: 1000, categoria: "Accesorios", descripcion: "pañuelos de hombre con diseño", imagen: "IMG/pa.jpg" }
    ];

    // =============== UI / ESTADO =================
    const state = { q:"", category:"", sort:"relevance" };

    // Rellenar categorías únicas
    const catSelect = document.querySelector('#category');
    const categorias = Array.from(new Set(productos.map(p=>p.categoria))).sort();
    for(const c of categorias){
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c; catSelect.appendChild(opt);
    }

    // Escuchadores de controles
    document.querySelector('#q').addEventListener('input', (e)=>{ state.q = e.target.value.trim().toLowerCase(); render(); });
    document.querySelector('#category').addEventListener('change', (e)=>{ state.category = e.target.value; render(); });
    document.querySelector('#sort').addEventListener('change', (e)=>{ state.sort = e.target.value; render(); });

    // Lógica de filtro + orden
    function filtrarOrdenar(lista){
      let out = lista.filter(p=>{
        const okQ = !state.q || (p.nombre+" "+(p.descripcion||"")).toLowerCase().includes(state.q);
        const okC = !state.category || p.categoria === state.category;
        return okQ && okC;
      });
      switch(state.sort){
        case 'price_asc': out.sort((a,b)=>a.precio-b.precio); break;
        case 'price_desc': out.sort((a,b)=>b.precio-a.precio); break;
        case 'name_asc': out.sort((a,b)=>a.nombre.localeCompare(b.nombre)); break;
        default: /* relevance (simple: por coincidencia en nombre primero) */
          if(state.q){
            out.sort((a,b)=>{
              const an = a.nombre.toLowerCase().includes(state.q);
              const bn = b.nombre.toLowerCase().includes(state.q);
              return (bn-an) || a.precio-b.precio;
            });
          }
      }
      return out;
    }

    // Construir URL de WhatsApp
    function waLink(producto){
      const phone = (producto.phone || WHATSAPP_DEFAULT).replace(/\D/g,'');
      const texto = `${MENSAJE_EXTRA} %0A• Producto: ${encodeURIComponent(producto.nombre)}%0A• Precio: ${encodeURIComponent(fmt.format(producto.precio))}`;
      return `https://wa.me/${phone}?text=${texto}`;
    }

    // Render del grid
    function render(){
      const grid = document.querySelector('#grid');
      grid.innerHTML = '';
      const lista = filtrarOrdenar(productos);

      if(lista.length === 0){
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:#94a3b8;">No hay resultados. Prueba con otro término o categoría.</div>`;
        return;
      }

      for(const p of lista){
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
          <div class="media">${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}">` : ''}</div>
          <div class="content">
            <div class="title">${p.nombre}</div>
            <div class="desc">${p.descripcion || ''}</div>
            <div class="meta">
              <div class="price">${fmt.format(p.precio)}</div>
              <div class="chip">${p.categoria}</div>
            </div>
            <div class="actions">
              <a class="btn" href="#" aria-label="Copiar enlace de WhatsApp" data-copy="${p.id}">Copiar enlace</a>
              <a class="btn whatsapp" href="${waLink(p)}" target="_blank" rel="noopener" aria-label="Pedir por WhatsApp">Pedir por WhatsApp</a>
            </div>
          </div>`;
        grid.appendChild(card);
      }

      // Copiar enlace rápido
      document.querySelectorAll('[data-copy]').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
          e.preventDefault();
          const id = +btn.getAttribute('data-copy');
          const prod = productos.find(x=>x.id===id);
          const link = waLink(prod);
          navigator.clipboard.writeText(link)
            .then(()=>{
              btn.textContent = '¡Copiado!';
              setTimeout(()=>btn.textContent='Copiar enlace', 1200);
            })
            .catch(()=>{
              window.prompt('Copia el enlace de WhatsApp:', link);
            });
        });
      });
    }

    // Primer render
    render();