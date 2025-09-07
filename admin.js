// Configurações de senha
const ADMIN_PASSWORD = 'eliandra2025';

// --- FUNÇÕES DE AUTENTICAÇÃO ---

function login() {
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
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

// --- FUNÇÕES DE DADOS (COMUNICAÇÃO COM O FIREBASE) ---

async function loadConfirmations() {
    try {
        // A variável 'db' vem do script de inicialização no arquivo index.html
        const snapshot = await db.collection("confirmacoes").orderBy("timestamp", "desc").get();
        
        // Criamos uma lista vazia para armazenar os dados
        const confirmations = []; 
        
        // Preenchemos a lista com os dados de cada documento do Firebase
        snapshot.forEach(doc => {
            confirmations.push(doc.data());
        });
        
        // Passamos a lista já formatada para a função de exibição
        displayConfirmations(confirmations);

    } catch (error) {
        console.error('Erro ao carregar confirmações:', error);
        document.getElementById('guest-list').innerHTML = '<div class="guest-item">Falha ao carregar dados do Firebase.</div>';
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
    
    // 'confirmations' agora é uma lista (array) e o .forEach vai funcionar
    confirmations.forEach(confirmation => {
        const guestItem = document.createElement('div');
        guestItem.className = 'guest-item';
        const date = confirmation.timestamp ? confirmation.timestamp.toDate() : new Date();
        const formattedDate = date.toLocaleString('pt-BR');
        
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
        const snapshot = await db.collection("confirmacoes").orderBy("timestamp", "desc").get();
        if (snapshot.empty) {
            alert('Nenhum dado para exportar.');
            return;
        }

        let csv = 'Nome,Acompanhantes,Data/Hora\n';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.toDate().toLocaleString('pt-BR') : 'N/A';
            csv += `"${data.name}",${data.companions},"${date}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'confirmacoes-aniversario.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        alert('Erro ao exportar dados.');
    }
}

// --- INICIALIZAÇÃO DA PÁGINA ---

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('refresh-btn').addEventListener('click', refreshData);
    document.getElementById('export-btn').addEventListener('click', exportData);
    
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
});
