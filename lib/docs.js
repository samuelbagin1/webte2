// Local:  "http://localhost:8080/api/athletes"
// Server: "/zapocet/api/athletes"  (relative, nginx handles it)
const API = "http://localhost:8080/api/athletes";

async function fetchAthletes() {
    try {
        const response = await fetch(API);
        const data = await response.json();

        const container = document.getElementById("athletes")
        
        if (data.length === 0) {
            container.innerHTML = "<p>No athletes found.</p>";
            return;
        }

        container.innerHTML = data.map(athlete =>
            `<div class="athlete">
                <strong>#${athlete.id}</strong> - ${athlete.name} ${athlete.last_name} - ${athlete.sport}
            </div>`
        ).join("");

    } catch (error) {
        document.getElementById("athletes").textContent = "Failed to load data.";
        console.error(error);
    }
}


async function getAthleteById() {
    const id = document.getElementById("getId").value;

    if (!id) {
        alert("Enter ID!");
        return;
    }

    try {
        const response = await fetch(`${API}/${id}`);
        const data = await response.json();

        const container = document.getElementById("athleteDetail");

        if (!response.ok) {
            container.innerHTML = `<p style="color: red;">${data.error}</p>`;
            return;
        }

        container.innerHTML = `<div class="athlete"
            <strong>#${data.id}</strong> - ${data.name} ${data.last_name} - ${data.sport}
        </div>`;

    } catch (error) {
        document.getElementById("athleteDetail").textContent = "Failed to load athlete.";
        console.error(error);
    }
}


async function postAthlete() {
    const name = document.getElementById("name").value;
    const last_name = document.getElementById("last_name").value;
    const sport = document.getElementById("sport").value;

    if (!name || !last_name || !sport) {
        alert("Fill in all fields");
        return;
    }

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, last_name, sport })
        });

        const result = await response.json();

        if (!response.ok) {
            alert("Error: " + result.error);
            return;
        }

        document.getElementById("name").value = "";
        document.getElementById("last_name").value = "";
        document.getElementById("sport").value = "";

        fetchAthletes(); // refresh the list

    } catch (error) {
        console.error(error);
        alert("Failed to add athlete.");
    }
}


async function deleteAthlete() {
    const id = document.getElementById("deleteId").value;

    if (!id) {
        alert("Enter an ID!");
        return;
    }

    try {
        const response = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert("Error: " + result.error);
            return;
        }

        document.getElementById("deleteId").value = "";
        fetchAthletes(); // refresh the list
    } catch (error) {
        console.error(error);
    }
}


fetchAthletes();