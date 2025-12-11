function validateForm() {
    const projectName = document.getElementById("InputProjectName1").value.trim();
    const startDate = document.querySelector("input[placeholder='Start Date']").value.trim();
    const endDate = document.querySelector("input[placeholder='End Date']").value.trim();
    const description = document.getElementById("ProjectDescription").value.trim();
    const fileInput = document.getElementById("formFile");
    const technologies = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
        .map(checkbox => {
            const label = document.querySelector(`label[for='${checkbox.id}']`);
            return label ? label.textContent.trim() : checkbox.id;
        });


    if (!projectName) {
        alert("Project Name is required");
        return false;
    }

    if (!startDate) {
        alert("Start Date is required");
        return false;
    }

    if (!endDate) {
        alert("End Date is required");
        return false;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert("Start Date cannot be after End Date");
        return false;
    }

    if (!description) {
        alert("Description is required");
        return false;
    }

    if (technologies.length === 0) {
        alert("Please select at least one technology");
        return false;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please upload an image");
        return false;
    }

    const allowedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedFormats.includes(fileInput.files[0].type)) {
        alert("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
        return false;
    }

    const formData = {
        projectName,
        startDate,
        endDate,
        description,
        technologies,
        fileName: fileInput.files[0].name
    };

    // Membaca file sebagai Data URL (base64)
    const reader = new FileReader();
    reader.onload = function(e) {
        formData.imageData = e.target.result; // base64 data URL

        console.log("Form is valid!");
        console.log(formData);

        // Simpan ke Local Storage
        try {
            const raw = localStorage.getItem('projects');
            const projects = raw ? JSON.parse(raw) : [];
            projects.push(formData);
            localStorage.setItem('projects', JSON.stringify(projects));
        } catch (err) {
            console.error('Error saving to localStorage', err);
        }
        if (typeof loadSavedProjects === 'function') loadSavedProjects();
    };
    reader.readAsDataURL(fileInput.files[0]);
    return true;
}

function getProjectsFromLocalStorage() {
    try {
        const raw = localStorage.getItem('projects');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to parse projects from localStorage', e);
        return [];
    }
}

function loadSavedProjects() {
    const container = document.getElementById('savedProjects');
    if (!container) return;

    const projects = getProjectsFromLocalStorage();
    if (projects.length === 0) {
        container.innerHTML = '<p>No saved projects yet.</p>';
        return;
    }

    container.innerHTML = projects.map((p, i) => renderProjectCard(p, i)).join('');
}

function renderProjectCard(p, index) {
    const techs = p.technologies && p.technologies.length ? p.technologies.join(', ') : 'None';
    return `
    <link rel="stylesheet" href="style.css">
        <div class="card">
            <img src="${p.imageData}" alt="${p.fileName || ''}" style="width:400px;height:auto;border-radius:6px;object-fit:cover;" />
            <div>
                <h4>${p.projectName}</h4>
                <div>${p.startDate} - ${p.endDate}</div>
                <p>${p.description}</p>
                <div><strong>Technologies:</strong> ${techs}</div>
                <div>
                    <a class="button" href="/project-detail?i=${index}">Detail</a>
                    <button class="button" onclick="deleteProject(${index})">Delete</button>
                </div>
            </div>
        </div>
    `;
}

// Delete dari Local Storage dan refresh tampilan
function deleteProject(index) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
        const raw = localStorage.getItem('projects');
        const projects = raw ? JSON.parse(raw) : [];
        if (index >= 0 && index < projects.length) {
            projects.splice(index, 1);
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    } catch (err) {
        console.error('Error deleting project', err);
    }
    if (typeof loadSavedProjects === 'function') loadSavedProjects();
}
document.addEventListener('DOMContentLoaded', function() {
    loadSavedProjects();
});
