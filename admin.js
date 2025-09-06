// Cole A MESMA URL do seu aplicativo da web do Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz04yKUOFiB6aoCsNGNTGoEaCQmcL2zSxL2kUEYkXwlz4MVi9qxzNJWuiRtQkuLGpjxdg/exec";

// Configurações de senha
const ADMIN_PASSWORD = 'eliandra2025';

// --- FUNÇÕES DE AUTENTICAÇÃO ---

function login() {
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('login-error').style.display = 'none';
        loadConfirmations();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function logout() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('password').value = '';
}

// --- FUNÇÕES DE DADOS ---

async function loadConfirmations() {
    try {
        const response = await fetch(SCRIPT_URL);
        if (!response.ok) {
            throw new Error('Erro de rede ao buscar confirmações.');
        }
        const confirmations = await response.json();
        displayConfirmations(confirmations);
    } catch (error) {
        console.error('Erro ao carregar confirmações:', error);
        document.getElementById('guest-list').innerHTML = '<div class="guest-item">Falha ao carregar dados. Tente atualizar a página.</div>';
    }
}

function displayConfirmations(confirmations) {
    const guestList = document.getElementById('guest-list');
    const totalConfirmationsElement = document.getElementById('total-confirmations');
    const totalGuestsElement = document.getElementById('total-guests');
    
    guestList.innerHTML = '';
    
    if (!confirmations || confirmations.length === 0) {
        guestList.innerHTML = '<div class="guest-item">Nenhuma confirmação ainda.</div>';
        totalConfirmationsElement.textContent = '0';
        totalGuestsElement.textContent = '0';
        return;
    }
    
    let totalGuests = 0;
    
    confirmations.forEach(confirmation => {
        const guestItem = document.createElement('div');
        guestItem.className = 'guest-item';
        const formattedDate = confirmation.timestamp; 
        
        guestItem.innerHTML = `
            <div>
                <div class="guest-name">${confirmation.name}</div>
                <div class="guest-date">Confirmado em: ${formattedDate}</div>
            </div>
            <div class="guest-companions">${confirmation.companions} acompanhante(s)</div>
        `;
        
        guestList.appendChild(guestItem);
        totalGuests += 1 + parseInt(confirmation.companions || 0);
    });
    
    totalConfirmationsElement.textContent = confirmations.length;
    totalGuestsElement.textContent = totalGuests;
}

function refreshData() {
    loadConfirmations();
}

async function exportData() {
    try {
        const response = await fetch(SCRIPT_URL);
        const confirmations = await response.json();

        if (confirmations.length === 0) {
            alert('Nenhum dado para exportar.');
            return;
        }
        
        let csv = 'Nome,Acompanhantes,Data/Hora\n';
        confirmations.forEach(confirmation => {
            csv += `"${confirmation.name}",${confirmation.companions},"${confirmation.timestamp}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'confirmacoes-aniversario.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        alert('Erro ao exportar dados.');
    }
}

// --- INICIALIZAÇÃO DA PÁGINA ---

// Adiciona os eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Conecta as funções aos botões
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('refresh-btn').addEventListener('click', refreshData);
    document.getElementById('export-btn').addEventListener('click', exportData);
    
    // Permite fazer login apertando a tecla "Enter"
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
});
