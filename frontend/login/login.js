//const { fetch } = require("undici-types");

document.addEventListener("DOMContentLoaded", function() {
            const loginButton = document.getElementById("lgbtn");
            const signinButton = document.getElementById("snbtn");
            const defaultForm = document.getElementById("dftform");
            const loginForm = document.getElementById("lgform");
            const signinForm = document.getElementById("snform");
            
            // Button hover sound effect (uncomment if you have the sound file)
            // const buttons = document.querySelectorAll(".btn");
            // buttons.forEach(button => {
            //     button.addEventListener("mouseenter", function() {
            //         const hoverSound = new Audio('./assets/hover.mp3');
            //         hoverSound.volume = 0.2;
            //         hoverSound.play();
            //     });
            // });

            loginButton.addEventListener("click", function() {
                // Hide other forms with animation
                defaultForm.classList.remove("active");
                signinForm.classList.remove("active");
                defaultForm.classList.add("inactive");
                signinForm.classList.add("inactive");
                
                // Show login form with animation
                setTimeout(() => {
                    loginForm.classList.add("active");
                    loginForm.classList.remove("inactive");
                }, 300);
                
                // // Add subtle animation to the button clicked
                // this.classList.add("pulse");
                // signinButton.classList.remove("pulse");
                
                // Focus on the first input field
                setTimeout(() => {
                    document.getElementById("lgusername").focus();
                }, 600);
            });

            signinButton.addEventListener("click", function() {
                // Hide other forms with animation
                defaultForm.classList.remove("active");
                loginForm.classList.remove("active");
                defaultForm.classList.add("inactive");
                loginForm.classList.add("inactive");
                
                // Show signin form with animation
                setTimeout(() => {
                    signinForm.classList.add("active");
                    signinForm.classList.remove("inactive");
                }, 300);
                
                // // Add subtle animation to the button clicked
                // this.classList.add("pulse");
                // loginButton.classList.remove("pulse");
                
                // Focus on the first input field
                setTimeout(() => {
                    document.getElementById("snusername").focus();
                }, 600);
            });
            
            // Form submission handlers
    document.getElementById("lgsubmit").addEventListener("click", async function(e) {
        e.preventDefault();
        const username = document.getElementById("lgusername").value;
        const password = document.getElementById("lgpassword").value;

        if (!username || !password) {
            alert("Please fill all fields");
            return;
        }

        // Send login data to server
        try {
            let response = await fetch("http://localhost:3000/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            let data = await response.json();

            if (response.ok && data.message === "success") {
                // Store JWT token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('token', data.token)
                // Redirect to home, passing username in query (optional)
                window.location.href = `http://localhost:3000/home`;
            } else {
                alert(data.error || "Login failed");
            }

        } catch (error) {
            alert("Network error: " + error.message);
        }
});
            document.getElementById("snsubmit").addEventListener("click", function(e) {
                e.preventDefault();
                const username = document.getElementById("snusername").value;
                const email = document.getElementById("snemail").value;
                const password = document.getElementById("snpassword").value;
                
                if (!username || !email || !password) {
                    alert("Please fill all fields");
                    return;
                }
                
                // Here you would typically send the signup data to your server
                console.log("Signup attempt:", { username, email, password });
                
                //database posrequest
fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        folder: []
    })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert("Signup failed: " + data.error);
                } else {
                    document.getElementById("snusername").value="";
                    document.getElementById("snemail").value="";
                    document.getElementById("snpassword").value="";
                    alert("Signup successful! you may now login");
                }
            })
            .catch(error => {
                alert("Network error: " + error.message);
            });
            });
            
            // Add input field animations
            const inputs = document.querySelectorAll(".forminput");
            inputs.forEach(input => {
                input.addEventListener("focus", function() {
                    this.style.transform = "scale(1.03)";
                });
                
                input.addEventListener("blur", function() {
                    this.style.transform = "scale(1)";
                });
            });
        });