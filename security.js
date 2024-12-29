class AnnoyingSecurity {
    constructor() {
        this.captchaCount = 0;
        this.passwordRequirements = [
            "Must be at least 8 characters",
            "Must contain a number",
            "Must contain an uppercase letter",
            "Must contain a lowercase letter",
            "Must contain a special character",
            "Must contain an emoji",
            "Must include your grandmother's maiden name",
            "Must include pi to 5 decimal places",
            "Must match /^(?:[1-9]|[1-9][0-9]).*(?:[1-9]|[1-9][0-9])$/",
            "Must be typed with your eyes closed",
            "Must be typed while standing on one leg",
            "Must include your favorite pizza topping"
        ];
        this.revealedRequirements = [];
        this.notifications = [];
        this.setupNotificationSystem();
        console.log("Mining for bitcoin...");
        console.log("Traversing the blockchain..");
        console.log("responseDecode[1]: Awaiting API response from https://www.cia.gov/");
    }

    setupNotificationSystem() {

        const notifContainer = document.createElement('div');
        notifContainer.id = 'security-notifications';
        notifContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(notifContainer);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `security-notification ${type}`;
        notification.style.cssText = `
            background: ${type === 'error' ? '#ff5555' : '#50fa7b'};
            color: #282a36;
            padding: 15px 20px;
            border-radius: 5px;
            margin-bottom: 10px;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        const notifContainer = document.getElementById('security-notifications');
        notifContainer.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    generateMathCaptcha() {
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        let answer;
        switch (operation) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                answer = num1 - num2;
                break;
            case '*':
                answer = num1 * num2;
                break;
        }

        return {
            question: `What is ${num1} ${operation} ${num2}?`,
            answer: answer
        };
    }

    generateImageCaptcha() {
        const shapes = ['circle', 'square', 'triangle'];
        const colors = ['red', 'blue', 'green'];
        const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
        const targetColor = colors[Math.floor(Math.random() * colors.length)];

        const svgShapes = [];
        const correctAnswers = [];


        const guaranteedPosition = Math.floor(Math.random() * 9);
        for (let i = 0; i < 9; i++) {
            let shape, color;
            if (i === guaranteedPosition) {
                shape = targetShape;
                color = targetColor;
            } else {
                shape = shapes[Math.floor(Math.random() * shapes.length)];
                color = colors[Math.floor(Math.random() * colors.length)];
            }

            const x = (i % 3) * 60 + 30;
            const y = Math.floor(i / 3) * 60 + 30;

            if (shape === targetShape && color === targetColor) {
                correctAnswers.push(i);
            }

            let shapeElement;
            switch (shape) {
                case 'circle':
                    shapeElement = `<circle cx="${x}" cy="${y}" r="20" fill="${color}" data-index="${i}" class="captcha-shape" />`;
                    break;
                case 'square':
                    shapeElement = `<rect x="${x - 20}" y="${y - 20}" width="40" height="40" fill="${color}" data-index="${i}" class="captcha-shape" />`;
                    break;
                case 'triangle':
                    const points = `${x},${y - 20} ${x - 20},${y + 20} ${x + 20},${y + 20}`;
                    shapeElement = `<polygon points="${points}" fill="${color}" data-index="${i}" class="captcha-shape" />`;
                    break;
            }
            svgShapes.push(shapeElement);
        }

        return {
            svg: `<svg width="180" height="180" style="border: 1px solid #ccc">
                    ${svgShapes.join('\n')}
                  </svg>`,
            instructions: `Click all ${targetColor} ${targetShape}s`,
            correctAnswers: correctAnswers
        };
    }

    generatePhilosophicalCaptcha() {
        const challenges = [
            {
                question: "Are you an attacker? be honest man we're running out of ideas"
            },
            {
                question: "Do you think you're a good person?"
            },
            {
                question: "Are you dangerous hacker man 4chan?"
            }

            // Add more questions her idk honestly
        ];
        return challenges[Math.floor(Math.random() * challenges.length)];
    }

    validatePassword(password) {
        const validationRules = [
            {
                test: (p) => p.length >= 8,
                message: "Password must be at least 8 characters long"
            },
            {
                test: (p) => /[0-9]/.test(p),
                message: "Must contain at least one number"
            },
            {
                test: (p) => /[A-Z]/.test(p),
                message: "Must contain at least one uppercase letter"
            },
            {
                test: (p) => /[a-z]/.test(p),
                message: "Must contain at least one lowercase letter"
            },
            {
                test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
                message: "Must contain at least one special character"
            },
            {
                test: (p) => /\p{Emoji}/u.test(p),
                message: "Must contain at least one emoji"
            },
            {
                test: (p) => p.includes('3.14159'),
                message: "Must include pi to 5 decimal places"
            },
            {
                test: (p) => /^(?:[1-9]|[1-9][0-9]).*(?:[1-9]|[1-9][0-9])$/.test(p),
                message: "Must match this regex /^(?:[1-9]|[1-9][0-9]).*(?:[1-9]|[1-9][0-9])$/"
            }
        ];


        const failures = validationRules
            .filter(rule => !rule.test(password))
            .map(rule => rule.message);

        if (failures.length > 0) {
            this.showNotification(failures.join('\n'), 'error');
            return false;
        }

        return true;
    }

    revealNextRequirement() {
        const unrevealedRequirements = this.passwordRequirements.filter(
            req => !this.revealedRequirements.includes(req)
        );

        if (unrevealedRequirements.length > 0) {
            const newRequirement = unrevealedRequirements[
                Math.floor(Math.random() * unrevealedRequirements.length)
                ];
            this.revealedRequirements.push(newRequirement);
            this.showNotification(`New requirement revealed: ${newRequirement}`, 'info');
            this.updateRequirementsList();
        }
    }

    updateRequirementsList() {
        const requirementsList = document.getElementById('requirements-list');
        if (requirementsList) {
            requirementsList.innerHTML = this.revealedRequirements
                .map(req => `<div class="requirement">✨ ${req}</div>`)
                .join('');
        }
    }

    createVerificationDialog(check) {
        return new Promise(resolve => {
            const dialog = document.createElement('div');
            dialog.className = 'verification-dialog';
            dialog.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #282a36;
                padding: 20px;
                border-radius: 8px;
                z-index: 2001;
                box-shadow: 0 0 20px rgba(0,0,0,0.5);
                text-align: center;
            `;

            dialog.innerHTML = `
                <h3 style="margin-bottom: 20px;">${check.question}</h3>
                <button class="verify-btn yes">Yes</button>
                <button class="verify-btn no">No</button>
            `;

            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 2000;
            `;

            document.body.appendChild(overlay);
            document.body.appendChild(dialog);

            const buttons = dialog.querySelectorAll('.verify-btn');
            buttons.forEach(btn => {
                btn.style.cssText = `
                    padding: 10px 20px;
                    margin: 0 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    background: ${btn.classList.contains('yes') ? '#50fa7b' : '#ff5555'};
                    color: #282a36;
                `;
                btn.onclick = () => {
                    const result = btn.classList.contains('yes');
                    dialog.remove();
                    overlay.remove();
                    resolve(result);
                };
            });
        });
    }

    async register(username, password) {

        if (!this.validatePassword(password)) {
            this.revealNextRequirement();
            return false;
        }


        const checks = [
            {
                question: "Are you currently standing on one leg?",
                failMessage: "Please assume the proper password entry position."
            },
            {
                question: "Did you type this password with your eyes closed?",
                failMessage: "Please close your eyes and try again."
            },
            {
                question: "Did you include your grandmother's maiden name?",
                failMessage: "Your grandmother would be disappointed."
            }
        ];

        for (const check of checks) {
            const result = await this.createVerificationDialog(check);
            if (!result) {
                this.showNotification(check.failMessage, 'error');
                return false;
            }
        }


        if (Math.random() < 0.1) {
            this.showNotification("Everything was perfect, but Mercury is in retrograde. Please try again later.", 'error');
            return false;
        }

        this.showNotification("Registration successful! Threat level: harmless", 'info');
        return true;
    }
}


const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .security-notification {
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .requirement {
        padding: 5px;
        background: #44475a;
        margin: 5px 0;
        border-radius: 3px;
    }

    .captcha-shape {
        transition: stroke 0.2s ease;
        cursor: pointer;
    }

    .captcha-shape:hover {
        stroke: #fff;
        stroke-width: 2;
    }
`;
document.head.appendChild(style);

window.AnnoyingSecurity = AnnoyingSecurity;
