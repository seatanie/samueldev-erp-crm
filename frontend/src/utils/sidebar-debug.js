// Script de debug para verificar el estado del sidebar
// Ejecutar en la consola del navegador (F12)

console.log('🔍 DEBUG DEL SIDEBAR');

// Verificar si el sidebar está colapsado
const sidebar = document.querySelector('.navigation');
if (sidebar) {
  const width = sidebar.offsetWidth;
  console.log('Ancho del sidebar:', width);
  console.log('¿Está colapsado?', width <= 100);
  
  // Verificar si el botón existe
  const button = sidebar.querySelector('.ant-btn');
  if (button) {
    console.log('✅ Botón encontrado');
    console.log('Estilos del botón:', {
      width: button.style.width,
      height: button.style.height,
      backgroundColor: button.style.backgroundColor,
      border: button.style.border,
      display: button.style.display
    });
  } else {
    console.log('❌ Botón NO encontrado');
  }
  
  // Verificar el área del logo
  const logo = sidebar.querySelector('.logo');
  if (logo) {
    console.log('✅ Área del logo encontrada');
    console.log('Estilos del logo:', {
      backgroundColor: logo.style.backgroundColor,
      borderBottom: logo.style.borderBottom,
      boxShadow: logo.style.boxShadow
    });
  } else {
    console.log('❌ Área del logo NO encontrada');
  }
} else {
  console.log('❌ Sidebar NO encontrado');
}

// Verificar el estado del contexto
console.log('Para verificar el estado del contexto, revisa Redux DevTools o el estado de la aplicación');








