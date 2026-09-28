const jobsContainer = document.getElementById('jobsContainer');
const settingButton = document.getElementById('setting');
const userId = localStorage.getItem('userId');
const requirements = ['JavaScript', 'Python', 'Node.js', 'MongoDB', 'React', 'Experience', 'English'];

async function loadJobs() {
    try {
        const userResponse = await fetch(`http://localhost:3000/users/${userId}/settings`);
        const user = await userResponse.json();

        if (!userResponse.ok) {
            alert(user.error);
            return;
        }

        const response = await fetch('http://localhost:3000/alljobs');
        const jobs = await response.json();

        if (!response.ok) {
            alert(jobs.error);
            return;
        }

        jobs.forEach(function(job) {
            const jobRequirements = job.requirements;
            const userRequirements = user.personal_requirements;
            const matchedRequirements = jobRequirements.filter(function(requirement) {
                return userRequirements.includes(requirement);
            });

            const matchPercentage = jobRequirements.length === 0 ? 100 : (matchedRequirements.length / jobRequirements.length) * 100;
            const hasEnoughExperience = user.personal_min_experience >= job.minimumExperience;

            if (matchPercentage >= job.minimumMatch && hasEnoughExperience) {
                createJobCard(job);
            }
        });
    } catch (err) {
        console.error('Connection error:', err);
        alert('can not connect to server.');
    }
}

function createJobCard(job) {
    const position = document.createElement('div');
    const positionName = document.createElement('p');
    const companyName = document.createElement('p');
    const details = document.createElement('div');
    const companyLocation = document.createElement('p');
    const positionDescription = document.createElement('p');
    const applyButton = document.createElement('button');

    position.classList.add('job-card');
    positionName.classList.add('job-title');
    companyName.classList.add('company-name');
    details.classList.add('job-details');
    companyLocation.classList.add('job-location');
    positionDescription.classList.add('job-description');
    applyButton.classList.add('apply-button');

    positionName.textContent = job.title;
    companyName.textContent = job.company;
    companyLocation.textContent = job.location;
    positionDescription.textContent = job.description;
    applyButton.textContent = 'Apply';

    position.appendChild(positionName);
    position.appendChild(companyName);
    position.appendChild(details);
    details.appendChild(companyLocation);
    details.appendChild(positionDescription);
    details.appendChild(applyButton);

    jobsContainer.appendChild(position);

    position.addEventListener('click', function() {
        if (getComputedStyle(details).display === 'none') {
            details.style.display = 'block';
        } else {
            details.style.display = 'none';
        }
    });

    applyButton.addEventListener('click', function(event) {
        event.stopPropagation();
        openApplyWindow(job);
    });
}

function openApplyWindow(job) {
    const popup = document.createElement('div');
    const title = document.createElement('h2');
    const resumeInput = document.createElement('input');
    const submitButton = document.createElement('button');
    const closeButton = document.createElement('button');

    popup.classList.add('apply-popup');
    title.classList.add('apply-popup-title');
    resumeInput.classList.add('resume-input');
    submitButton.classList.add('submit-application-button');
    closeButton.classList.add('close-popup-button');

    title.textContent = 'Apply for ' + job.title;
    resumeInput.type = 'file';
    resumeInput.accept = 'application/pdf';
    submitButton.textContent = 'Submit';
    closeButton.textContent = 'Close';

    popup.appendChild(title);
    popup.appendChild(resumeInput);
    popup.appendChild(submitButton);
    popup.appendChild(closeButton);
    document.body.appendChild(popup);

    closeButton.addEventListener('click', function() {
        popup.remove();
    });

    submitButton.addEventListener('click', async function() {
        if (resumeInput.files.length === 0) {
            alert('Please select a PDF file');
            return;
        }

        const formData = new FormData();
        formData.append('resume', resumeInput.files[0]);

        try {
            const response = await fetch(`http://localhost:3000/jobs/${job._id}/apply`, {method: 'POST', body: formData});
            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }

            alert('Application submitted successfully!');
            popup.remove();
        } catch (err) {
            console.error('Connection error:', err);
            alert('can not connect to server');
        }
    });
}

settingButton.addEventListener('click', async function() {
    const popup = document.createElement('div');
    const title = document.createElement('h2');
    const experienceLabel = document.createElement('label');
    const experienceInput = document.createElement('input');
    const requirementsBoard = document.createElement('div');
    const save = document.createElement('button');
    const close = document.createElement('button');

    popup.classList.add('settings-popup');
    title.classList.add('settings-title');
    requirementsBoard.classList.add('requirements-board');
    save.classList.add('settings-save');
    close.classList.add('settings-close');

    title.textContent = 'Settings';
    experienceLabel.textContent = 'Years of experience';
    experienceInput.type = 'number';
    experienceInput.min = 0;
    save.textContent = 'Save';
    close.textContent = 'Close';

    try {
        const response = await fetch(`http://localhost:3000/users/${userId}/settings`);
        const user = await response.json();

        if (!response.ok) {
            alert(user.error);
            return;
        }

        experienceInput.value = user.personal_min_experience;

        requirements.forEach(function(requirement) {
            const checkbox = document.createElement('input');
            const label = document.createElement('label');

            checkbox.type = 'checkbox';
            checkbox.value = requirement;
            checkbox.checked = user.personal_requirements.includes(requirement);

            label.textContent = requirement;
            requirementsBoard.appendChild(checkbox);
            requirementsBoard.appendChild(label);
        });
    } catch (err) {
        console.error('Connection error:', err);
        alert('can not connect to server');
        return;
    }

    popup.appendChild(title);
    popup.appendChild(experienceLabel);
    popup.appendChild(experienceInput);
    popup.appendChild(requirementsBoard);
    popup.appendChild(save);
    popup.appendChild(close);
    document.body.appendChild(popup);

    close.addEventListener('click', function() {
        popup.remove();
    });

    save.addEventListener('click', async function() {
        const selectedRequirements = [];

        requirementsBoard.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
            if (checkbox.checked) {
                selectedRequirements.push(checkbox.value);
            }
        });

        const experience = Number(experienceInput.value);

        if (experience < 0) {
            alert('Experience can not be negative');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}/settings`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({personal_min_experience: experience, personal_requirements: selectedRequirements})
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }

            alert('Settings saved successfully!');
            popup.remove();
            jobsContainer.innerHTML = '';
            loadJobs();
        } catch (err) {
            console.error('Connection error:', err);
            alert('can not connect to server');
        }
    });
});

loadJobs();