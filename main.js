// main.js
// Importando as funções do arquivo ui_teste.js
import {criarTitulos} from './ui_menu.js';
import {constroiMenus} from './ui_menu.js';
import {registrarListeners} from './ui_menu.js';

// Importando funções de debugging
import { unexpected_error_catcher } from './General_Classes/Debugger.js';

// Ativando captura de erros inesperados
unexpected_error_catcher();

// Criando o box de títulos
criarTitulos()

// Criando o sistema de Menus
constroiMenus()

// Registrando os listeners de botões
registrarListeners()

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('divFormLogin').classList.remove('hidden');
  document.getElementById('formLogin').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('divFormLogin').classList.add('hidden');
    // Aqui pode adicionar lógica de autenticação, se necessário
  });
});