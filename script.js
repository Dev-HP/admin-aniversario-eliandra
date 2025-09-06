// Configuração da API - Substitua pela URL do seu backend no Render
const BACKEND_URL = 'https://backend-aniversario-eliandra.onrender.com';

// Função para inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    initForm();
});

// Inicializar o formulário de confirmação
function initForm() {
    const form = document.getElementById('confirm-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('nome').value;
        const companions = document.getElementById('acompanhantes').value;
        
        // Validar se o nome foi preenchido
        if (!name.trim()) {
            alert('Por favor, informe seu nome.');
            return;
        }
        
        try {
            // Enviar para a API
            const response = await fetch(`${BACKEND_URL}/api/confirmar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    companions: companions
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Limpar formulário
                form.reset();
                
                // Mostrar mensagem de sucesso
                showSuccessMessage();
            } else {
                alert('Erro ao confirmar: ' + (result.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            // Fallback para localStorage se a API não estiver disponível
            saveToLocalStorage(name, companions);
        }
    });
}

// Função fallback para salvar no localStorage
function saveToLocalStorage(name, companions) {
    const confirmedGuests = JSON.parse(localStorage.getItem('confirmedGuests')) || [];
    
    // Verificar se já existe uma confirmação com este nome
    const existingConfirmation = confirmedGuests.find(guest => 
        guest.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingConfirmation) {
        if (confirm('Já existe uma confirmação com este nome. Deseja atualizar?')) {
            // Atualizar confirmação existente
            existingConfirmation.companions = companions;
            existingConfirmation.timestamp = new Date().toISOString();
        } else {
            return;
        }
    } else {
        // Adicionar nova confirmação
        confirmedGuests.push({
            name: name,
            companions: companions,
            timestamp: new Date().toISOString()
        });
    }
    
    // Salvar no localStorage
    localStorage.setItem('confirmedGuests', JSON.stringify(confirmedGuests));
    
    // Mostrar mensagem de sucesso
    showSuccessMessage();
    
    // Avisar que os dados foram salvos localmente
    alert('Dados salvos localmente. A conexão com o servidor pode estar indisponível.');
}

// Mostrar mensagem de sucesso
function showSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    successMessage.style.display = 'block';
    
    // Esconder mensagem após 5 segundos
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}
