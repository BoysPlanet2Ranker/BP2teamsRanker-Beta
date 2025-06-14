// app.js - VERSÃO FINAL COM RANK E UNRANK

// --- ESTADO DA APLICAÇÃO ---
let activeTeamContext = null; 
let teamRankings = {}; 

// --- SELEÇÃO DOS ELEMENTOS ---
const imageBox = document.querySelector('.box-image');
const allMissionContents = document.querySelectorAll('.mission-content');
const missionsContainer = document.querySelector('.missions-container');
const initialContent = document.getElementById('initial-content');
const missao1Panel = document.getElementById('missao1'); 

// --- FUNÇÃO DE RENDERIZAÇÃO DE TIME ---
// Esta função já adiciona o 'data-trainee-id' que precisamos, então está correta.
function renderTeam(missionId, teamId) {
    const teamData = dadosMissoes[missionId]?.teams[teamId];
    if (!teamData) return;

    const teamTitleElement = document.getElementById(`${teamId}-title`);
    const unrankedContainer = document.getElementById(`${teamId}-unranked-container`);
    const rankedContainer = document.getElementById(`${teamId}-ranked-container`);
    
    if (!teamTitleElement || !unrankedContainer || !rankedContainer) return;
    
    teamTitleElement.textContent = `Team: ${teamData.nome}`;
    unrankedContainer.innerHTML = '';
    rankedContainer.innerHTML = '';

    const allTeamMembers = trainees.filter(t => teamData.traineeIds.includes(t.id));
    
    if (!teamRankings[teamId]) {
        teamRankings[teamId] = { rankedIds: [] };
    }
    const rankedIds = teamRankings[teamId].rankedIds;

    const rankedMembers = rankedIds.map(id => allTeamMembers.find(t => t.id === id)).filter(Boolean);
    
    rankedMembers.forEach((trainee, index) => {
        let starHTML = '';
        const isRankingComplete = rankedMembers.length === allTeamMembers.length;

        if (index === 0) {
            starHTML = '<span class="star gold">★</span>';
        } else if (isRankingComplete && index === rankedMembers.length - 1) {
            starHTML = '<span class="star red">★</span>';
        }

        // Adicionamos o data-trainee-id aqui para saber quem remover
        const rankedItemHTML = `
            <div class="ranking-item" data-trainee-id="${trainee.id}" style="cursor: pointer;">
                <span class="rank-number">${index + 1}.</span>
                <img class="rank-img" src="${trainee.imagem}" alt="${trainee.nome}">
                <span class="rank-name">${trainee.nome}</span>
                ${starHTML}
            </div>
        `;
        rankedContainer.innerHTML += rankedItemHTML;
    });

    const unrankedMembers = allTeamMembers.filter(t => !rankedIds.includes(t.id));

    unrankedMembers.forEach(trainee => {
        const traineeCardHTML = `
            <div class="trainee-card" data-trainee-id="${trainee.id}">
                <img src="${trainee.imagem}" alt="${trainee.nome}">
                <p class="trainee-name">${trainee.nome}</p>
            </div>
        `;
        unrankedContainer.innerHTML += traineeCardHTML;
    });
}

// --- FUNÇÃO AUXILIAR PARA TROCAR DE PAINEL ---
function showPanel(panelToShow) {
    allMissionContents.forEach(content => content.classList.remove('active'));
    if (panelToShow) {
        panelToShow.classList.add('active');
    }
}

// --- OUVINTES DE EVENTOS ---
imageBox.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'IMG' && target.dataset.page) {
        showPanel(document.getElementById(target.dataset.page));
    }
});

missionsContainer.addEventListener('click', (event) => {
    const target = event.target;
    const [missionId, teamId] = activeTeamContext || [null, null];

    // --- Lógica de Navegação ---
    if (target.classList.contains('back-button')) showPanel(initialContent);
    if (target.classList.contains('back-to-mission')) showPanel(missao1Panel);
    
    // --- Lógica de Interação do Ranking ---
    if (target.classList.contains('reset-ranking-button')) {
        const teamToReset = target.dataset.teamId;
        if (teamRankings[teamToReset]) {
            teamRankings[teamToReset].rankedIds = [];
        }
        if(missionId && teamToReset) {
            renderTeam(missionId, teamToReset);
        }
    }
    
    if (target.tagName === 'IMG' && target.closest('.team')) {
        const newMissionId = target.closest('.mission-content').id;
        const newTeamId = target.dataset.page;
        activeTeamContext = [newMissionId, newTeamId];
        renderTeam(newMissionId, newTeamId);
        showPanel(document.getElementById(newTeamId));
    }

    // Clica em um card de trainee disponível para RANKear
    const clickedUnrankedCard = target.closest('.trainee-card');
    if (clickedUnrankedCard && clickedUnrankedCard.parentElement.id.includes('-unranked-container')) {
        const traineeId = parseInt(clickedUnrankedCard.dataset.traineeId);
        if (teamId && teamRankings[teamId]) {
            teamRankings[teamId].rankedIds.push(traineeId);
            renderTeam(missionId, teamId);
        }
    }

    // =================================================================
    // === A LÓGICA QUE FALTAVA FOI ADICIONADA AQUI ===
    // =================================================================
    // Clica em um item já rankeado para DES-rankear
    const clickedRankedItem = target.closest('.ranking-item');
    if (clickedRankedItem) {
        // Pega o ID do trainee a ser removido
        const traineeIdToRemove = parseInt(clickedRankedItem.dataset.traineeId);
        if (teamId && teamRankings[teamId]) {
            // Cria uma nova lista de rankeados, filtrando e removendo o ID do trainee clicado
            teamRankings[teamId].rankedIds = teamRankings[teamId].rankedIds.filter(id => id !== traineeIdToRemove);
            // Re-renderiza a tela para mostrar a mudança
            renderTeam(missionId, teamId);
        }
    }
});