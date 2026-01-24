# Instrucciones para Limpiar Cache del Navegador

Si experimentas errores como "404 Not Found" o "405 Method Not Allowed" después de actualizar el código, el navegador puede estar usando versiones cacheadas de los archivos JavaScript.

## Soluciones

### Opción 1: Hard Refresh (Recarga Forzada)

**Chrome/Edge/Firefox en Windows:**

- Presiona `Ctrl + Shift + R`
- O `Ctrl + F5`

**Chrome/Edge/Firefox en Mac:**

- Presiona `Cmd + Shift + R`

**Safari en Mac:**

- Presiona `Cmd + Option + R`

### Opción 2: Limpiar Cache Manualmente

**Chrome:**

1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona "Imágenes y archivos almacenados en caché"
3. Selecciona "Desde siempre" en el rango de tiempo
4. Haz clic en "Borrar datos"

**Firefox:**

1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona "Caché"
3. Selecciona "Todo" en el rango de tiempo
4. Haz clic en "Limpiar ahora"

**Edge:**

1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Archivos e imágenes almacenados en caché"
3. Selecciona "Siempre" en el rango de tiempo
4. Haz clic en "Borrar ahora"

### Opción 3: DevTools (Desarrollo)

1. Abre DevTools (`F12` o `Ctrl + Shift + I`)
2. Ve a la pestaña "Network" (Red)
3. Haz clic derecho en cualquier parte
4. Selecciona "Clear browser cache" (Limpiar caché del navegador)
5. Recarga la página con `Ctrl + Shift + R`

### Opción 4: Deshabilitar Cache (Solo Desarrollo)

1. Abre DevTools (`F12`)
2. Ve a Settings (⚙️ o `F1`)
3. En la sección "Network", marca "Disable cache (while DevTools is open)"
4. Mantén DevTools abierto mientras trabajas

## Verificar que los Cambios se Aplicaron

Después de limpiar el cache:

1. Abre DevTools (`F12`)
2. Ve a la pestaña "Network" (Red)
3. Recarga la página (`Ctrl + Shift + R`)
4. Busca archivos como `reportesService.js`, `productosService.js`, `categoriasService.js`
5. Verifica que no tengan `?t=1769248668371` al final de la URL (esto indica cache)
6. Deberían tener un timestamp nuevo como `?t=[número más grande]`

## Solución de Problemas

Si después de limpiar el cache sigues viendo errores:

1. **Verifica que el servidor de desarrollo esté corriendo:**

   ```bash
   cd frontend
   npm run dev
   ```

2. **Verifica que el backend esté corriendo:**

   ```bash
   cd backend
   run.bat  # o .\venv\Scripts\activate.ps1; python manage.py runserver
   ```

3. **Verifica las URLs en la consola del navegador:**
   - Deben ser `/api/productos/crear/` NO `/api/productos/`
   - Deben ser `/api/gastos/categorias/crear/` NO `/api/gastos/categorias/`
   - Deben ser `/api/reportes/` con `?ordering=-fecha` NO `/api/reportes/ultimo/`

4. **Si el problema persiste:**
   - Cierra completamente el navegador
   - Ábrelo de nuevo
   - Ve directamente a `http://localhost:3000`

## Prevención

Para evitar problemas de cache en el futuro:

1. Mantén DevTools abierto con "Disable cache" activado durante desarrollo
2. Usa siempre `Ctrl + Shift + R` para recargar después de cambios en el código
3. Si usas múltiples pestañas, cierra las antiguas después de actualizar el código
