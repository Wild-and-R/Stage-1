function Contact() {
        location.href = "contact.html";
    }
function Home() {
        location.href = "day4.html";
    }
function Project() {
        location.href = "Project.html";
    }
function validateForm() {
    const projectName = document.getElementById("InputProjectName1").value.trim();
    const startDate = document.querySelector("input[placeholder='Start Date']").value.trim();
    const endDate = document.querySelector("input[placeholder='End Date']").value.trim();
    const description = document.getElementById("ProjectDescription").value.trim();
    const fileInput = document.getElementById("formFile");
    const technologies = [];
    document.querySelectorAll("input[type='checkbox']:checked").forEach(checkbox => {
        technologies.push(checkbox.id);
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

    console.log("Form is valid!");
    console.log({
        projectName,
        startDate,
        endDate,
        description,
        technologies,
        file: fileInput.files[0].name
    });

    return false;
}