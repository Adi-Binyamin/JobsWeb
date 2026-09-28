const jobsContainer = document.getElementById('jobsContainer');
const addPositionButton = document.getElementById('addPositionButton');
const companyId = localStorage.getItem('userId');

addPositionButton.addEventListener('click', function() {
    window.location.href = 'newjob.html';
});

const requirements = ['JavaScript', 'Python', 'Node.js', 'MongoDB', 'React', 'Experience', 'English'];

async function loadJobs() {
    try {
        const response = await fetch(`http://localhost:3000/jobs?companyId=${companyId}`);
        const jobs = await response.json();

        if (!response.ok) {
            alert(jobs.error);
            return;
        }

        jobs.forEach(function(job) {
            createJobCard(job);
        });
    } catch (err) {
        console.error('Connection error:', err);
        alert('can not connect to server.');
    }
}

function createJobCard(job) {
    const jobCard = document.createElement('div');
    const jobTitle = document.createElement('h2');
    const companyName = document.createElement('p');
    const companyLocation = document.createElement('p');
    const jobDescription = document.createElement('p');
    const editJobButton = document.createElement('button');
    const saveJobButton = document.createElement('button');
    const deleteJobButton = document.createElement('button');
    const viewCandidatesButton = document.createElement('button');

    editJobButton.textContent = 'Edit Job';
    saveJobButton.textContent = 'Save Job';
    deleteJobButton.textContent = 'Delete Job';
    viewCandidatesButton.textContent = 'View Candidates';

    editJobButton.classList.add('edit-job-button');
    saveJobButton.classList.add('save-job-button');
    deleteJobButton.classList.add('delete-job-button');
    viewCandidatesButton.classList.add('view-candidates-button');

    const editCompanyName = document.createElement('input');
    const editCompanyLocation = document.createElement('input');
    const editJobDescription = document.createElement('input');
    const editJobTitle = document.createElement('input');
    const editPercentMatch = document.createElement('input');
    editPercentMatch.type = 'number';
    editPercentMatch.min = 0;
    editPercentMatch.max = 100;

    const editMinimumExperience = document.createElement('input');
    editMinimumExperience.type = 'number';
    editMinimumExperience.min = 0;

    const jobDetails = document.createElement('div');
    jobDetails.classList.add('job-details');

    jobDetails.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    jobCard.appendChild(jobTitle);
    jobCard.appendChild(companyName);
    jobCard.appendChild(viewCandidatesButton);
    jobDetails.appendChild(companyLocation);
    jobDetails.appendChild(jobDescription);
    jobCard.appendChild(jobDetails);
    jobDetails.appendChild(editJobButton);
    jobCard.classList.add('job-card');
    jobsContainer.appendChild(jobCard);

    const editArea = document.createElement('div');
    editArea.classList.add('edit-area');

    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Job Title';

    const companyLabel = document.createElement('label');
    companyLabel.textContent = 'Company';

    const locationLabel = document.createElement('label');
    locationLabel.textContent = 'Location';

    const descriptionLabel = document.createElement('label');
    descriptionLabel.textContent = 'Description';

    const percentMatchLabel = document.createElement('label');
    percentMatchLabel.textContent = 'Minimum Match (%)';

    const minimumExperienceLabel = document.createElement('label');
    minimumExperienceLabel.textContent = 'Minimum Experience (Years)';

    editArea.appendChild(titleLabel);
    editArea.appendChild(editJobTitle);
    editArea.appendChild(companyLabel);
    editArea.appendChild(editCompanyName);
    editArea.appendChild(locationLabel);
    editArea.appendChild(editCompanyLocation);
    editArea.appendChild(descriptionLabel);
    editArea.appendChild(editJobDescription);
    editArea.appendChild(percentMatchLabel);
    editArea.appendChild(editPercentMatch);
    editArea.appendChild(minimumExperienceLabel);
    editArea.appendChild(editMinimumExperience);

    jobDetails.appendChild(editArea);

    const requirementCheckboxes = [];
    const requirementsGrid = document.createElement('div');
    requirementsGrid.classList.add('requirements-grid');

    requirements.forEach(function(requirement) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = requirement;

        requirementCheckboxes.push(checkbox);

        const label = document.createElement('label');
        label.textContent = requirement;

        const requirementItem = document.createElement('div');

        requirementItem.appendChild(checkbox);
        requirementItem.appendChild(label);
        requirementsGrid.appendChild(requirementItem);
    });

    editArea.appendChild(requirementsGrid);
    editArea.appendChild(saveJobButton);
    editArea.appendChild(deleteJobButton);

    jobTitle.textContent = job.title;
    companyName.textContent = job.company;
    companyLocation.textContent = job.location;
    jobDescription.textContent = job.description;

    jobCard.addEventListener('click', function() {
        if (getComputedStyle(jobDetails).display === 'none') {
            jobDetails.style.display = 'block';
        } else {
            jobDetails.style.display = 'none';
        }
    });

    viewCandidatesButton.addEventListener('click', function(event) {
        event.stopPropagation();
        openCandidatesWindow(job);
    });

    editJobButton.addEventListener('click', function(event) {
        event.stopPropagation();

        jobTitle.style.display = 'none';
        companyName.style.display = 'none';
        companyLocation.style.display = 'none';
        jobDescription.style.display = 'none';
        editJobButton.style.display = 'none';
        viewCandidatesButton.style.display = 'none';

        editArea.style.display = 'block';

        editJobTitle.value = job.title;
        editCompanyName.value = job.company;
        editCompanyLocation.value = job.location;
        editJobDescription.value = job.description;
        editMinimumExperience.value = job.minimumExperience;
        editPercentMatch.value = job.minimumMatch;

        requirementCheckboxes.forEach(function(checkbox) {
            checkbox.checked = job.requirements.includes(checkbox.value);
        });
    });

    saveJobButton.addEventListener('click', async function(event) {
        event.stopPropagation();

        job.title = editJobTitle.value;
        job.company = editCompanyName.value;
        job.location = editCompanyLocation.value;
        job.description = editJobDescription.value;

        if (Number(editMinimumExperience.value) >= 0) {
            job.minimumExperience = Number(editMinimumExperience.value);
        }

        if (Number(editPercentMatch.value) >= 0 && Number(editPercentMatch.value) <= 100) {
            job.minimumMatch = Number(editPercentMatch.value);
        }

        job.requirements = [];

        requirementCheckboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
                job.requirements.push(checkbox.value);
            }
        });

        try {
            const response = await fetch(`http://localhost:3000/jobs/${job._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(job)
            });

            const updatedJob = await response.json();

            if (!response.ok) {
                alert(updatedJob.error);
                return;
            }

            job.title = updatedJob.title;
            job.company = updatedJob.company;
            job.location = updatedJob.location;
            job.description = updatedJob.description;
            job.minimumExperience = updatedJob.minimumExperience;
            job.requirements = updatedJob.requirements;
            job.minimumMatch = updatedJob.minimumMatch;

            jobTitle.textContent = job.title;
            companyName.textContent = job.company;
            companyLocation.textContent = job.location;
            jobDescription.textContent = job.description;

            editArea.style.display = 'none';

            jobTitle.style.display = 'block';
            companyName.style.display = 'block';
            companyLocation.style.display = 'block';
            jobDescription.style.display = 'block';
            editJobButton.style.display = 'block';
            viewCandidatesButton.style.display = 'block';

        } catch (err) {
            console.error('Connection error:', err);
            alert('can not connect to server');
        }
    });

    deleteJobButton.addEventListener('click', async function(event) {
        event.stopPropagation();

        try {
            const response = await fetch(`http://localhost:3000/jobs/${job._id}?companyId=${companyId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }

            jobCard.remove();

        } catch (err) {
            console.error('Connection error:', err);
            alert('can not connect to server');
        }
    });
}
function openCandidatesWindow(job) {
    const popup = document.createElement('div');
    const title = document.createElement('h2');
    const candidatesList = document.createElement('div');
    const closeButton = document.createElement('button');

    popup.classList.add('candidates-popup');
    title.classList.add('candidates-popup-title');
    candidatesList.classList.add('candidates-list');
    closeButton.classList.add('close-candidates-button');

    title.textContent = 'Candidates for ' + job.title;
    closeButton.textContent = 'Close';

    popup.appendChild(title);
    popup.appendChild(candidatesList);
    popup.appendChild(closeButton);

    job.candidates.forEach(function(candidate, index) {
        const resumeButton = document.createElement('button');

        resumeButton.textContent = 'Resume ' + (index + 1);
        resumeButton.classList.add('resume-button');

        resumeButton.addEventListener('click', function() {
            window.open(`http://localhost:3000/jobs/${job._id}/candidates/${index}`, '_blank');
        });

        candidatesList.appendChild(resumeButton);
    });

    if (job.candidates.length === 0) {
        const noCandidates = document.createElement('p');
        noCandidates.textContent = 'No candidates yet.';
        noCandidates.classList.add('no-candidates');
        candidatesList.appendChild(noCandidates);
    }

    document.body.appendChild(popup);

    closeButton.addEventListener('click', function() {
        popup.remove();
    });
}
loadJobs();