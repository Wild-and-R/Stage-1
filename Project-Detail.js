function BacktoProject() {
        location.href = "Project.html";
    }
// Baca parameter i dari URL
function getProjectsFromLocalStorage() {
    try {
        const raw = localStorage.getItem('projects');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to parse projects from localStorage', e);
        return [];
    }
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function renderProjectDetail(p) {
    if (!p) {
        return '<p>Project not found.</p>';
    }

    const techs = p.technologies && p.technologies.length ? p.technologies.join(', ') : 'None';

    return `
        <link rel="stylesheet" href="style.css">
        <div>
            <img src="${p.imageData}" alt="${p.fileName || ''}" style="width:400px;height:auto;border-radius:6px;object-fit:cover;" />
            <div>
                <h4>${p.projectName}</h4>
                <div>${p.startDate} - ${p.endDate}</div>
                <p>${p.description}</p>
                <div><strong>Technologies:</strong> ${techs}</div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    const i = parseInt(getQueryParam('i'), 10);
    const projects = getProjectsFromLocalStorage();
    const project = Number.isInteger(i) && i >= 0 && i < projects.length ? projects[i] : null;

    const container = document.getElementById('projectDetail');
    if (container) {
        container.innerHTML = renderProjectDetail(project);
    }
});
