const authForm = document.getElementById('authForm');

if (authForm) {
    authForm.addEventListener('submit', async function(e) {

        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const user_type = document.querySelector('input[name="user_type"]:checked').value;

        const submitButton = e.submitter;

        try {
            // SIGN IN 
            if (submitButton.id === 'signInBtn') {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        user_type: user_type
                    })
                });

                const data = await response.json();

                console.log('Login response:', data);
                console.log('Login userId:', data.userId);

                if (response.ok) {
                    localStorage.setItem('userId', data.userId);
                    console.log('Saved userId:', localStorage.getItem('userId'));

                    if (data.user_type === 'company') {
                        window.location.href = 'company.html';
                    } else {
                        window.location.href = 'personal.html';
                    }
                } else {
                    alert(data.error);
                }
            }
            // SIGN UP 
            else if (submitButton.id === 'signUpBtn') {
                const response = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        user_type: user_type
                    })
                });

                const data = await response.json();

                console.log('Register response:', data);
                console.log('Register userId:', data.userId);

                if (response.ok) {
                    localStorage.setItem('userId', data.userId);
                    console.log('Saved userId:', localStorage.getItem('userId'));

                    if (user_type === 'company') {
                        window.location.href = 'company.html';
                    } else {
                        window.location.href = 'personal.html';
                    }
                } else {
                    alert(data.error);
                }
            }

        } catch (err) {
            console.error('Connection error:', err);
            alert('can not connect to Momgo');
        }
    });
}