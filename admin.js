// Cole A MESMA URL do seu aplicativo da web do Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz04yKUOFiB6aoCsNGNTGoEaCQmcL2zSxL2kUEYkXwlz4MVi9qxzNJWuiRtQkuLGpjxdg/exec";

// Configurações de senha
const ADMIN_PASSWORD = 'eliandra2025';

// --- FUNÇÕES DE AUTENTICAÇÃO ---

// Função de login
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

// Função de logout
function logout() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('password').value = '';
}

// --- FUNÇÕES DE DADOS (COMUNICAÇÃO COM A PLANILHA) ---

// Carregar confirmações da Planilha Google
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

// Exibir confirmações na lista (a função original, sem alterações)
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
    
    // O script já retorna os dados com o mais recente primeiro
    confirmations.forEach(confirmation => {
        const guestItem = document.createElement('div');
        guestItem.className = 'guest-item';
        
        // A data/hora já vem formatada do script
        const formattedDate = confirmation.timestamp; 
        
        guestItem.innerHTML = `
            <div>
                <div class="guest-name">${confirmation.name}</div>
                <div class="guest-date">Confirmado em: ${formattedDate}</div>
            </div>
            <div class="guest-companions">${confirmation.companions} acompanhante(s)</div>
        `;
        
        guestList.appendChild(guestItem);
        
        // Calcular total de pessoas (convidado + acompanhantes)
        totalGuests += 1 + parseInt(confirmation.companions || 0);
    });
    
    totalConfirmationsElement.textContent = confirmations.length;
    totalGuestsElement.textContent = totalGuests;
}

// Atualizar dados (simplesmente chama a função de carregar)
function refreshData() {
    loadConfirmations();
}

// Exportar dados para CSV
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

// Adiciona um listener para a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Permite fazer login apertando a tecla "Enter"
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
});
