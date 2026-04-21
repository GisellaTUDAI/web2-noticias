const http = require('http');
const fs = require('fs').promises;
const { URL } = require('url');
const mime = require('mime');

const PORT = 3000;
const CACHE = {};

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;
        const method = req.method;

        // Ruta principal - Listado de noticias
        if (pathname === '/' && method === 'GET') {
            let contenido = await fs.readFile('public/noticias.txt', 'utf-8')
            let lineas = contenido.split('\n').filter(l => l.trim());

            let html = `<!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <title>Listado de Noticias</title>
          <link rel="stylesheet" href="/public/estilos.css">
      </head>
      <body>
          <div class="container">
              <div class="card">
                  <div class="card-header">
                      <h1>Listado de Noticias</h1>
                      <p>Total de noticias: ${lineas.length}</p>
                  </div>
                  <div class="card-body">
                      ${lineas.length === 0 ?
                    '<div class="alert alert-info">No hay noticias aun. ¡Se el primero en publicar!</div>' :
                    `<ul class="noticias-list">
                              ${lineas.map((linea, i) => {
                        let [titulo] = linea.split('|');
                        return `<li class="noticia-item">
                                      <a href="/noticia?id=${i + 1}">${titulo}</a>
                                  </li>`;
                    }).join('')}
                          </ul>`
                }
                      <div style="text-align: center; margin-top: 30px;">
                          <a href="/public/formulario.html" class="btn btn-primary">Publicar Nueva Noticia</a>
                          <a href="/public/index.html" class="btn btn-secondary">Ir al Inicio</a>
                      </div>
                  </div>
              </div>
              <div class="footer">Sistema de Noticias - Programacion Web II</div>
          </div>
      </body>
      </html>`;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(html);
        }

        // Detalle de noticia individual
        if (pathname === '/noticia' && method === 'GET') {
            const id = url.searchParams.get('id');
            const contenido = await fs.readFile('public/noticias.txt', 'utf-8')
            const lineas = contenido.split('\n').filter(l => l.trim());
            const noticia = lineas[parseInt(id) - 1];

            if (!noticia) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end(`<!DOCTYPE html>
        <html>
        <head><title>404</title><link rel="stylesheet" href="/public/estilos.css"></head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="card-header"><h1>Error 404</h1></div>
                    <div class="card-body">
                        <div class="alert alert-error">La noticia no existe</div>
                        <a href="/" class="btn btn-primary">Volver</a>
                    </div>
                </div>
            </div>
        </body>
        </html>`);
            }

            const [titulo, texto] = noticia.split('|');
            const html = `<!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <title>${titulo}</title>
          <link rel="stylesheet" href="/public/estilos.css">
      </head>
      <body>
          <div class="container">
              <div class="card">
                  <div class="card-header"><h1>${titulo}</h1></div>
                  <div class="card-body">
                      <div class="noticia-detalle">
                          <div class="noticia-contenido">${texto.replace(/\n/g, '<br>')}</div>
                      </div>
                      <a href="/" class="btn btn-primary">Volver</a>
                  </div>
              </div>
          </div>
      </body>
      </html>`;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(html);
        }

        // Guardar nueva noticia (POST)
        if (pathname === '/public/formulario.html' && method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                const params = new URLSearchParams(body);
                const titulo = params.get('titulo');
                const texto = params.get('texto');
                const nuevaLinea = `${titulo}|${texto}\n`;
                await fs.appendFile('public/noticias.txt', nuevaLinea);
                res.writeHead(302, { Location: '/' });
                res.end();
            });
            return;
        }

        // Archivos estaticos con cache
        if (pathname.startsWith('/public/')) {
            const filePath = '.' + pathname;

            if (CACHE[filePath]) {
                console.log('Sirviendo desde cache:', filePath);
                const tipoMime = mime.getType(filePath) || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': tipoMime });
                return res.end(CACHE[filePath]);
            }

            const data = await fs.readFile(filePath);
            CACHE[filePath] = data;
            const tipoMime = mime.getType(filePath) || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': tipoMime });
            return res.end(data);
        }

        // Error 404
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
    <html>
    <head><title>404</title><link rel="stylesheet" href="/public/estilos.css"></head>
    <body>
        <div class="container">
            <div class="card">
                <div class="card-header"><h1>Error 404</h1></div>
                <div class="card-body">
                    <div class="alert alert-error">La pagina que buscas no existe</div>
                    <a href="/" class="btn btn-primary">Volver al inicio</a>
                </div>
            </div>
        </div>
    </body>
    </html>`);

    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
    <html>
    <head><title>Error 500</title><link rel="stylesheet" href="/public/estilos.css"></head>
    <body>
        <div class="container">
            <div class="card">
                <div class="card-header"><h1>Error 500</h1></div>
                <div class="card-body">
                    <div class="alert alert-error">Error interno del servidor. Intente mas tarde.</div>
                   
                </div>
            </div>
        </div>
    </body>
    </html>`);
    }
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

