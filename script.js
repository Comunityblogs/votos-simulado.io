document.addEventListener("DOMContentLoaded", () => {
    const voteLuisaBtn = document.getElementById("vote-luisa");
    const voteDanielBtn = document.getElementById("vote-daniel");
    const barLuisa = document.getElementById("bar-luisa");
    const barDaniel = document.getElementById("bar-daniel");
    const percentageLuisa = document.getElementById("percentage-luisa");
    const percentageDaniel = document.getElementById("percentage-daniel");
    const status = document.getElementById("status");

    let votes = {
        "Luisa Gonzales": 0,
        "Daniel Noboa": 0,
    };
    let totalVotes = 0;
    const maxVotes = 100;

    function updateUI() {
        const percentageLuisa = totalVotes > 0 ? (votes["Luisa Gonzales"] / totalVotes) * 100 : 0;
        const percentageDaniel = totalVotes > 0 ? (votes["Daniel Noboa"] / totalVotes) * 100 : 0;

        barLuisa.style.width = `${percentageLuisa}%`;
        barDaniel.style.width = `${percentageDaniel}%`;

        percentageLuisa.textContent = `${percentageLuisa.toFixed(1)}%`;
        percentageDaniel.textContent = `${percentageDaniel.toFixed(1)}%`;

        if (totalVotes >= maxVotes) {
            status.textContent = "¡Votación cerrada!";
            voteLuisaBtn.disabled = true;
            voteDanielBtn.disabled = true;
        }
    }

    const hasVoted = localStorage.getItem("hasVoted");
    if (hasVoted) {
        voteLuisaBtn.disabled = true;
        voteDanielBtn.disabled = true;
        status.textContent = "Ya has votado desde este dispositivo.";
    }

    const peer = new Peer();

    peer.on('open', (id) => {
        console.log('Mi ID de PeerJS:', id); 
    });

    const connections = [];

    peer.on('connection', (conn) => {
        console.log('Nuevo cliente conectado');

        connections.push(conn);

        conn.on('open', () => {
            conn.send({ votes, totalVotes });
        });

        conn.on('data', (data) => {
            votes = data.votes;
            totalVotes = data.totalVotes;
            updateUI();
        });
    });

    const connectToPeer = (peerId) => {
        const conn = peer.connect(peerId);

        connections.push(conn);

        conn.on('open', () => {
            conn.send({ votes, totalVotes });
        });

        conn.on('data', (data) => {
            votes = data.votes;
            totalVotes = data.totalVotes;
            updateUI();
        });
    };

    function vote(candidate) {
        if (totalVotes >= maxVotes || localStorage.getItem("hasVoted")) return;

        votes[candidate]++;
        totalVotes++;

        localStorage.setItem("hasVoted", true);
        voteLuisaBtn.disabled = true;
        voteDanielBtn.disabled = true;
        status.textContent = "Gracias por votar.";

        connections.forEach((conn) => {
            conn.send({ votes, totalVotes });
        });

        updateUI();
    }

    voteLuisaBtn.addEventListener("click", () => vote("Luisa Gonzales"));
    voteDanielBtn.addEventListener("click", () => vote("Daniel Noboa"));

    updateUI();
});