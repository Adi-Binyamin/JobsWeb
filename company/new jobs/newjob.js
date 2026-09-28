const jobTitle = document.getElementById('jobTitle');
const companyName = document.getElementById('companyName');
const companyLocation = document.getElementById('companyLocation');
const jobDescription = document.getElementById('jobDescription');
const percentMatch = document.getElementById('percentMatch');
const minimumExperience = document.getElementById('minimumExperience');
const createJobButton = document.getElementById('createJobButton');
const requirementCheckboxes = document.querySelectorAll('.requirements-grid input[type="checkbox"]');
const companyId = localStorage.getItem('userId');

createJobButton.addEventListener('click', async function() {
    const newJob = {
        title: jobTitle.value,
        company: companyName.value,
        companyId: companyId,
        location: companyLocation.value,
        description: jobDescription.value,
        minimumExperience: Number(minimumExperience.value),
        requirements: [],
        minimumMatch: Number(percentMatch.value)
    };

    requirementCheckboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            newJob.requirements.push(checkbox.value);
        }
    });

    try {
        const response = await fetch('http://localhost:3000/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newJob)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        window.history.back();

    } catch (err) {
        console.error('Connection error:', err);
        alert('can not connect to server');
    }
});