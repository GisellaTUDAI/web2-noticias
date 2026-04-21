Actividad Obligatoria N°1 - WEB II
Alumno/a: Gisella Janet Burgos
Fecha de entrega: 20/04/2026
Enlace al repositorio: 

--

Punto 1 - Diagrama de flujo
El siguiente diagrama representa el algoritmo completo del servidor Node.js, inlcuyendo todas las rutas, el manejo de GET/POST, la caché de archivos estáticos y el manejo de errores.

![Diagrama de flujo](./diagrama.png)
Diagrama editable: [diagrama.png](./docs/diagrama.png)
--

Punto 2 - Arquitectura y selección de librerías
2.a - Módulos nativos de Node.js

Se utilizaron tres módulos nativos de Node.js

*1.Módulo `http`
Este módulo permite crear un servidor web que escucha peticiones HTTP. En la aplicación se utiliza la función `createServer()` para crear el servidor y `listen()` para ponerlo a la escucha en el puerto 3000. También se usan los métodos `writeHead()` para enviar los códigos de estado HTTP y `end()` para finalizar la respuesta. Se eligió este módulo porque es la base de Node.js para construir servidores. Permite controlar manualmente el flujo de peticiones y respuestas sin depender de framworks externos.

*2. Módulo `fs/promises`
Este módulo permite acceder al sistema de archivos. En la aplicación se utiliza `readFile()` para leer el archivo `noticias.txt` y `appendFile()` para agregar nuevas noticias. Se eligió la versión con promesas (`fs/promises`) porque permite un código más limpio y legible que usar callbacks, evitando el "callback hell".

*3. Módulo `url`
Este módulo facilita el análisis de las URLs de las peticiones. Se utiliza la clase `URL` para parsear la URL completa, extrayendo el `pathname` (ruta solicitada) y los parámetros GET mediante el método `searchParams.get()`. Se eligió porque es la forma estándar y segura de trabajar con URLs en Node.js.

2.b - Paquetes de npm
Paquete utilizado: mime
-Nombre: mime
-Versión: 3.0.0
-Comando de instalación: `npm install mime@3.0.0`

El paquete `mime` determina el tipo MIME (Content-Type) de un archivo a partir de su extensión. Por ejemplo, si recibe un archivo con extensión `.css`, devuelve `text/css`; si recibe `.html`, devuelve `text/html`; si recibe `.jpg` devuelve `image/jpeg`.
-Método principal utilizado: `mime.getType()`
Este método recibe como parámetro la ruta o nombre de un archivo, analiza la extensión del archvio y devuelve el tipo MIME correspondiente. Si no reconoce la extensión, devuelve `null`.
Elegí este paquete primero porque es el estándar en la comunidad Node.js para resolver tipos MIME, segundo porque evita tener que mantener manualmente un objeto con todas las extensiones y sus tipos MIME. Finalmente porque esta actualizado constantemente con los últimos tipos MIME. 

Además de los módulos principales (http, fs/promises y url), no fue necesario utilizar otros módulos nativos de Node.js, ya que la funcionalidad requerida fue completamente resuelta con estos tres. Esto permitió mantener la aplicación simple, clara y sin dependencias innecesarias.


Punto 3 - Explicación de la implementación

Bloque A - Servidor HTTP y routing
El servidor se crea utilizando el método `http.createServer()`, que recibe una función callback. Esta función se ejecuta cada vez que llega un petición HTTP al servidor.
Dentro de esta función, lo primero que se hace es crear un objeto de la clase `URL` para parsear la dirección completa. Para esto se usa `new URL(req.url, `http://localhost:3000`)`. A partir de este objeto se extraen dos datos fundamentales: el `pathname` y el `method` (que indica si la petición es GET o POST).
Luego, mediante una serie de estructuras `if`, se evalúa qué ruta y qué método se solicitaron. Dependiendo del resultado, se ejecuta un bloque de código u otro. Por ejemplo, si el `pathname` es `/` es GET, se muestra el listado de noticias. Si el `pathname` es `/public/formulario.html` y el `method` es POST, se guarda una nueva noticia.
Una característica fundamental de esta implementación es que Node.js trabaja bajo un modelo asincrónico, basado en un event loop. Esto significa que el servidor no se detiene mientras espera operaciones lentas como lectura o escritura de archivos, sino que puede seguir atendiendo otras peticiones simultáneamente.
Las operaciones que aprovechan este modelo son principalmente: la lectura del archivo noticias.txt mediante fs.readFile(), la escritura de nuevas noticias mediante fs.appendFile() y la recepción de datos de formularios mediante los eventos req.on('data') y req.on('end').

Bloque B - Servicio de archivos estáticos con caché
Cuando la ruta solicitada comienza con `/public`, el servidor sabe que se trata de un archivo estático (CSS, HTML). El proceso es el siguiente:
Primero se construye la ruta real del archivo en el servidor, agregando un punto al principio: `'.' + pathname`. Esto convierte `/public/estilos.css` en `./public/estilos.css`, que es la ruta válida en el sistema de archivos.
Luego, se verifica si el archivo ya está almacenado en la caché. La caché es un objeto vacío `CACHE ={}` que se va llenando a medida que se leen archivos. Si el archivo está en la caché, se sirve directamente desde la memoria RAM, lo cual es mucho más rápido que leer el disco. En la consola se muestra el mensaje "Sirviendo desde caché".
Si el archivo no está en la caché, se lee del disco usando `fs.readFile()`. Una vez leído, se guarda en la caché para futuras peticiones y luego se envía al navegador.
Antes de enviar el archivo, se determina su tipo MIME usando el paquete `mime` y el método `mieme.getType()`. Esto es importante porque el navegador necesita saber si el archivo es CSS, HTML, una imagen, etc., para procesarlo correctamente. Finalmente, se responde con el código 200 y el contenido del archivo.

Bloque C - Captura de datos POST
Cuando el usuario envía el formulario de publicación de noticias, el navegador hace una petición POST a la ruta `/public/formulario.html`. Los datos del formulario no llegan todos juntos, sino que se envían en partes llamadas "chunks".
Para capturarlos, se utiliza el objeto `req` (petición) y se escuchan dos eventos:
-El evento `'data'` se ejecuta cada vez que llega un fragmento de datos. En la función anonima asociada, ese fragmento se concatena a una varibale llamada `body`.
-El evento `'end'` se ejecuta cuando todos los fragmentos han llegado. En ese momento la variable `body` contiene todos los datos completos del formulario.
Luego se parsean los datos usando `new URLSearchParams(body)`, que convierte el texto recibido en un objeto del cual se pueden extraer los campos individuales con `get('nombreDelCampo)`. En este caso se extraen los campos `titulo` y `texto` del formulario.

Bloque D - Parámetros GET
Para ver el detalle de una noticia específica, el sistema utiliza la ruta `noticia?id=N`, donde `N` es el número de la noticia. El número sen envía como parámetro en la URL.
El servidor captura este número utilizando `url.searchParams.get('id')`. Este método busca en la URL el parámetro llamado `id` y devuelve su valor.
Una vez obtenido el número, se lee el archivo `noticias.txt` y se divide en líneas usando `split('\n)`. Cada línea representa una noticia con el formato `titulo|contenido`. Como el usuario ve las noticias numeradas desde 1, pero el array de JavaScript comienza en 0, se accede a la posición `id -1` del array.
Si en esa posición existe una noticia, se genera una página HTML con el título y el contenido, y se responde con código 200. Si no existe (por ejemplo, si el usuario pide la noticia número 9 pero solo hay 3 noticias), se responde con código 404 y un mensaje indicando que la noticia no existe.

Bloque E - Persistencia en archivo de texto
Todas las noticias se almacenan en un archivo ded texto llamado `noticias.txt`, ubicado dentro de la carpeta `public/`. El formato utilizado es muy simple: cada noticia ocupa una línea, con el título y el contenido separados por el carácter `|`. Para agregar una nueva noticia se utiliza `fs.appenFile('public/noticias.txt', nuevaLinea)`. Este método abre el archivo, escribe la nueva línea al final y lo cierra automáticamente. Es importante que no sobreescribe el contenido existente, sino que agrega al final.
Para leer todas las noticias se utiliza `fs.readFile('public/noticias.txt', 'utf-8')`. El segundo parámetro `'utf-8'` indica que el archivo se debe interpretar como texto. El cotenido se divide en líneas y cada línea se procesa para generar el listado o buscar una noticia específica.
