function Cancel() {
        location.href = "Project.html";
    }

function getProjectsFromLocalStorage() {
    const data = localStorage.getItem('projects');
    return data ? JSON.parse(data) : [];
}

function saveProjectsToLocalStorage(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function showCurrentImageIfExists(dataUrl) {
    const img = document.getElementById('currentImage');
    if (dataUrl) {
        img.src = dataUrl;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
}

function populateForm(project) {
    document.getElementById('InputProjectName1').value = project.projectName || '';
    const startInput = document.querySelector("input[placeholder='Start Date']");
    const endInput = document.querySelector("input[placeholder='End Date']");
    if (startInput) startInput.value = project.startDate || '';
    if (endInput) endInput.value = project.endDate || '';
    document.getElementById('ProjectDescription').value = project.description || '';

    Array.from(document.querySelectorAll("input[type='checkbox']")).map(cb => {
        const label = document.querySelector(`label[for='${cb.id}']`);
        const text = label ? label.textContent.trim() : cb.id;
        cb.checked = project.technologies && project.technologies.includes(text);
        return cb;
    });

    showCurrentImageIfExists(project.imageData);
}

function validateBasic(fields) {
    if (!fields.projectName) return 'Project name is required';
    if (!fields.startDate) return 'Start date is required';
    if (!fields.endDate) return 'End date is required';
    if (!fields.description) return 'Description is required';
    return null;
}

function saveEditedProject(event) {
    event.preventDefault();
    const index = parseInt(getQueryParam('i'));
    if (isNaN(index)) return alert('Invalid project index');

    const projects = getProjectsFromLocalStorage();
    if (index < 0 || index >= projects.length) return alert('Project not found');

    const project = projects[index];
    const name = document.getElementById('InputProjectName1').value.trim();
    const startInput = document.querySelector("input[placeholder='Start Date']");
    const endInput = document.querySelector("input[placeholder='End Date']");
    const startDate = startInput ? startInput.value.trim() : '';
    const endDate = endInput ? endInput.value.trim() : '';
    const description = document.getElementById('ProjectDescription').value.trim();

    const technologies = Array.from(document.querySelectorAll("input[type='checkbox']"))
        .map(cb => {
            const label = document.querySelector(`label[for='${cb.id}']`);
            return cb.checked ? (label ? label.textContent.trim() : cb.id) : null;
        })
        .filter(Boolean);

    const validationError = validateBasic({ projectName: name, startDate, endDate, description });
    if (validationError) {
        alert(validationError);
        return false;
    }

    const fileInput = document.getElementById('formFile');
    const file = fileInput.files && fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            project.imageData = e.target.result;
            project.projectName = name;
            project.startDate = startDate;
            project.endDate = endDate;
            project.description = description;
            project.technologies = technologies;
            saveProjectsToLocalStorage(projects);
            window.location.href = 'Project.html';
        };
        reader.readAsDataURL(file);
    } else {
        // simpan tanpa mengubah gambar
        project.projectName = name;
        project.startDate = startDate;
        project.endDate = endDate;
        project.description = description;
        project.technologies = technologies;
        saveProjectsToLocalStorage(projects);
        window.location.href = 'Project.html';
    }

    return false;
}

// Saat masuk, isi form dengan data proyek yang ada
window.addEventListener('DOMContentLoaded', () => {
    const index = parseInt(getQueryParam('i'));
    if (isNaN(index)) {
        alert('Missing project index');
        window.location.href = 'Project.html';
        return;
    }
    const projects = getProjectsFromLocalStorage();
    if (index < 0 || index >= projects.length) {
        alert('Project not found');
        window.location.href = 'Project.html';
        return;
    }
    const project = projects[index];
    populateForm(project);
});
