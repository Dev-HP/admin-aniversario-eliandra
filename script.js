// Configurações
const ADMIN_PASSWORD = 'eliandra2025'; // Altere para uma senha mais segura

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

// Carregar confirmações
function loadConfirmations() {
    try {
        // Tenta carregar do localStorage primeiro
        const confirmations = JSON.parse(localStorage.getItem('confirmedGuests')) || [];
        displayConfirmations(confirmations);
        
        // Se não houver dados no localStorage, tenta carregar do backend
        if (confirmations.length === 0) {
            // Você pode implementar uma chamada para um backend aqui se necessário
            console.log('Nenhuma confirmação encontrada no localStorage');
        }
    } catch (error) {
        console.error('Erro ao carregar confirmações:', error);
    }
}

// Exibir confirmações na lista
function displayConfirmations(confirmations) {
    const guestList = document.getElementById('guest-list');
    const totalConfirmationsElement = document.getElementById('total-confirmations');
    const totalGuestsElement = document.getElementById('total-guests');
    
    guestList.innerHTML = '';
    
    if (confirmations.length === 0) {
        guestList.innerHTML = '<div class="guest-item">Nenhuma confirmação ainda.</div>';
        totalConfirmationsElement.textContent = '0';
        totalGuestsElement.textContent = '0';
        return;
    }
    
    let totalGuests = 0;
    
    // Ordenar por data (mais recente primeiro)
    confirmations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    confirmations.forEach(confirmation => {
        const guestItem = document.createElement('div');
        guestItem.className = 'guest-item';
        
        const date = new Date(confirmation.timestamp);
        const formattedDate = date.toLocaleString('pt-BR');
        
        guestItem.innerHTML = `
            <div>
                <div class="guest-name">${confirmation.name}</div>
                <div class="guest-date">Confirmado em: ${formattedDate}</div>
            </div>
            <div class="guest-companions">${confirmation.companions} acompanhante(s)</div>
        `;
        
        guestList.appendChild(guestItem);
        
        // Calcular total de pessoas
        totalGuests += 1 + parseInt(confirmation.companions);
    });
    
    totalConfirmationsElement.textContent = confirmations.length;
    totalGuestsElement.textContent = totalGuests;
}

// Atualizar dados
function refreshData() {
    loadConfirmations();
}

// Exportar dados
function exportData() {
    try {
        const confirmations = JSON.parse(localStorage.getItem('confirmedGuests')) || [];
        if (confirmations.length === 0) {
            alert('Nenhum dado para exportar.');
            return;
        }
        
        // Converter para CSV
        let csv = 'Nome,Acompanhantes,Data/Hora\n';
        confirmations.forEach(confirmation => {
            csv += `"${confirmation.name}",${confirmation.companions},"${new Date(confirmation.timestamp).toLocaleString('pt-BR')}"\n`;
        });
        
        // Criar arquivo para download
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

// Inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado (apenas para desenvolvimento)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        loadConfirmations();
    }
});