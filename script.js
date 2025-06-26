// nikhil
class Terminal {
    constructor() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('commandInput');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.isTyping = false;
        this.typeSpeed = 8; // milliseconds per character (reduced from 15)
        this.currentTypingPromise = null;
        this.shouldStopTyping = false;
        this.startTime = Date.now(); // Add start time for uptime command
        
        this.themes = {
            amber: {
                name: 'Amber Classic',
                colors: {
                    '--console-color': '#ffb347',
                    '--console-bg': '#1a1106',
                    '--text': '#f4e8c1',
                    '--love': '#d97757'
                }
            },
            green: {
                name: 'Matrix Green',
                colors: {
                    '--console-color': '#00ff41',
                    '--console-bg': '#0d1117',
                    '--text': '#00ff41',
                    '--love': '#ff0000'
                }
            },
            blue: {
                name: 'IBM Blue',
                colors: {
                    '--console-color': '#00d4ff',
                    '--console-bg': '#000080',
                    '--text': '#ffffff',
                    '--love': '#ff6b6b'
                }
            }
        };
        this.currentTheme = 'amber';
        this.soundEnabled = true;
        this.commandSuggestions = [];
        this.selectedSuggestion = -1;
        
        // Command list for suggestions
        this.allCommands = [
            'help', 'about', 'skills', 'projects', 'contact', 'resume',
            'clear', 'exit', 'echo', 'neofetch', 'ls', 'pwd', 'whoami', 'date',
            'uptime', 'cat', 'tree', 'history', 'fortune', 'cowsay', 'figlet',
            'theme', 'sound', 'matrix', 'hack', 'coffee', 'weather'
        ];
        
        this.easterEggs = [
            'sudo rm -rf /', 'sudo', 'rm -rf /', 'hack nasa', 'hack pentagon',
            'install gentoo', 'systemctl start coffee', 'make me a sandwich',
            'pwd | sudo tee'
        ];
        
        this.init();
    }

    init() {
        // Start typing the terminal overlay immediately
        this.typeTerminalOverlay();
        
        // Delay welcome message to sync with CRT turn-on effect
        setTimeout(() => {
            this.showWelcome();
            this.input.focus();
        }, 3200);
        
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Keep input focused and allow typing during animations
        this.input.addEventListener('blur', () => {
            setTimeout(() => this.input.focus(), 10);
        });
        
        // Refocus on click anywhere
        document.addEventListener('click', () => this.input.focus());
        
        // Add command suggestions
        this.setupCommandSuggestions();
        
        // Random glitch effects
        this.startRandomGlitches();
        
        // Initial focus
        this.input.focus();
    }

    async typeTerminalOverlay() {
        const overlay = document.querySelector('.crt-overlay');
        const text = 'TERMINAL-01';
        overlay.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            overlay.textContent = text.slice(0, i + 1);
            await this.sleep(150);
        }
        
        // Hide overlay after typing completes
        setTimeout(() => {
            overlay.style.visibility = 'hidden';
        }, 1000);
    }

    async typeText(element, text, speed = this.typeSpeed) {
        this.isTyping = true;
        this.input.disabled = true;
        
        for (let i = 0; i < text.length; i++) {
            element.innerHTML = text.slice(0, i + 1);
            await this.sleep(speed);
        }
        
        this.isTyping = false;
        this.input.disabled = false;
        this.input.focus();
    }

    async typeHTML(element, html, speed = this.typeSpeed) {
        this.isTyping = true;
        this.shouldStopTyping = false;
        
        // Set initial styles to match final output
        element.style.fontFamily = "'VT323', monospace";
        element.style.fontSize = "inherit";
        element.style.lineHeight = "inherit";
        
        // Create a temporary element to parse HTML and get plain text
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const textContent = temp.textContent || temp.innerText || '';
        
        // Type character by character as plain text with consistent styling
        for (let i = 0; i < textContent.length; i++) {
            if (this.shouldStopTyping) {
                element.innerHTML = html;
                // Ensure final HTML maintains consistent styling
                this.applyConsistentStyling(element);
                break;
            }
            
            // Create a text node to maintain consistent font rendering
            const textSpan = document.createElement('span');
            textSpan.style.fontFamily = "'VT323', monospace";
            textSpan.style.fontSize = "inherit";
            textSpan.style.lineHeight = "inherit";
            textSpan.textContent = textContent.slice(0, i + 1);
            
            element.innerHTML = '';
            element.appendChild(textSpan);
            
            // Scroll to bottom during typing for smooth follow effect
            this.scrollToBottom();
            
            // Random loading pauses (5% chance per character)
            if (Math.random() < 0.05) {
                await this.sleep(Math.random() * 200 + 100); // 100-300ms pause
            }
            
            await this.sleep(speed);
        }
        
        // Set the full HTML with formatting at the end
        if (!this.shouldStopTyping) {
            element.innerHTML = html;
            // Apply consistent styling to all child elements
            this.applyConsistentStyling(element);
        }
        
        // Final scroll to ensure we're at the bottom
        this.scrollToBottom();
        
        this.isTyping = false;
        this.input.focus();
    }

    // New method to ensure consistent styling
    applyConsistentStyling(element) {
        // Apply consistent styling to the element and all its children
        const allElements = [element, ...element.querySelectorAll('*')];
        allElements.forEach(el => {
            el.style.fontFamily = "'VT323', monospace";
            el.style.fontSize = "inherit";
            el.style.lineHeight = "inherit";
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleInput(e) {
        // Allow input even while typing - interrupt on Enter
        if (e.key === 'Enter') {
            // Interrupt current typing if any
            if (this.isTyping) {
                this.shouldStopTyping = true;
            }
            
            const command = this.input.value.trim();
            if (command) {
                this.addOutput(`<span class="prompt">nikhil@portfolio:~$</span> ${command}`, true);
                this.executeCommand(command);
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;
            }
            this.input.value = '';
            
            // Scroll to bottom after command input
            this.scrollToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
            }
        } else if (e.key === 'Escape') {
            // ESC key to interrupt typing
            if (this.isTyping) {
                this.shouldStopTyping = true;
            }
        }
    }

    setupCommandSuggestions() {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'command-suggestions';
        suggestionsDiv.id = 'suggestions';
        // Append to body instead of prompt-line for fixed positioning
        document.body.appendChild(suggestionsDiv);
        
        this.input.addEventListener('input', (e) => this.handleInputChange(e));
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTabCompletion();
            } else if (e.key === 'ArrowUp' && this.commandSuggestions.length > 0) {
                e.preventDefault();
                this.navigateSuggestions(-1);
            } else if (e.key === 'ArrowDown' && this.commandSuggestions.length > 0) {
                e.preventDefault();
                this.navigateSuggestions(1);
            }
        });
    }

    handleInputChange(e) {
        const value = e.target.value.toLowerCase();
        if (value.length > 0) {
            this.commandSuggestions = this.allCommands.filter(cmd => 
                cmd.startsWith(value)
            ).slice(0, 8); // Show more suggestions since they're inline
            this.showSuggestions();
        } else {
            this.hideSuggestions();
        }
    }

    showSuggestions() {
        const suggestionsDiv = document.getElementById('suggestions');
        if (this.commandSuggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        // Create vertical suggestion display for right side
        const suggestionItems = this.commandSuggestions.map((cmd, index) => 
            `<div class="suggestion-item${index === this.selectedSuggestion ? ' selected' : ''}" 
                 onclick="terminal.selectSuggestion('${cmd}')">${cmd}</div>`
        );
        
        suggestionsDiv.innerHTML = suggestionItems.join('');
        suggestionsDiv.style.display = 'block';
        
        // Position the suggestions box relative to terminal
        const terminalBody = document.querySelector('.terminal-body');
        const rect = terminalBody.getBoundingClientRect();
        suggestionsDiv.style.top = `${rect.top + 20}px`;
        suggestionsDiv.style.right = '20px';
    }

    hideSuggestions() {
        const suggestionsDiv = document.getElementById('suggestions');
        suggestionsDiv.style.display = 'none';
        suggestionsDiv.innerHTML = '';
        this.selectedSuggestion = -1;
    }

    selectSuggestion(cmd) {
        this.input.value = cmd;
        this.hideSuggestions();
        this.input.focus();
    }

    handleTabCompletion() {
        if (this.commandSuggestions.length === 1) {
            this.input.value = this.commandSuggestions[0];
            this.hideSuggestions();
        } else if (this.selectedSuggestion >= 0) {
            this.input.value = this.commandSuggestions[this.selectedSuggestion];
            this.hideSuggestions();
        } else if (this.commandSuggestions.length > 1) {
            // Find common prefix like real terminals do
            const commonPrefix = this.findCommonPrefix(this.commandSuggestions);
            if (commonPrefix.length > this.input.value.length) {
                this.input.value = commonPrefix;
            }
        }
    }

    findCommonPrefix(commands) {
        if (commands.length === 0) return '';
        if (commands.length === 1) return commands[0];
        
        let prefix = commands[0];
        for (let i = 1; i < commands.length; i++) {
            while (commands[i].indexOf(prefix) !== 0) {
                prefix = prefix.substring(0, prefix.length - 1);
                if (prefix === '') return '';
            }
        }
        return prefix;
    }

    navigateSuggestions(direction) {
        if (this.commandSuggestions.length === 0) return;
        
        this.selectedSuggestion += direction;
        if (this.selectedSuggestion < -1) {
            this.selectedSuggestion = this.commandSuggestions.length - 1;
        } else if (this.selectedSuggestion >= this.commandSuggestions.length) {
            this.selectedSuggestion = -1;
        }
        this.showSuggestions();
    }

    executeCommand(command) {
        // Hide suggestions when executing command
        this.hideSuggestions();
        
        // Check for Easter eggs first
        if (this.easterEggs.includes(command.toLowerCase())) {
            this.handleEasterEgg(command);
            return;
        }
        
        // Reset typing interrupt flag for new command
        this.shouldStopTyping = false;
        
        const [cmd, ...args] = command.split(' ');
        const cmdLower = cmd.toLowerCase();
        
        switch(cmdLower) {
            // Original portfolio commands
            case 'help':
                this.showHelp();
                break;
            case 'about':
                this.showAbout();
                break;
            case 'skills':
                this.showSkills();
                break;
            // Add this case after line ~385
            case 'clear':
                this.clearTerminal();
                break;
            case 'projects':
                this.showProjects();
                break;
            case 'contact':
                this.showContact();
                break;
            case 'resume':
                this.showResume();
                break;
            case 'exit':
                this.exitTerminal();
                break;
            
            // Popular terminal commands
            case 'echo':
                this.cmdEcho(args.join(' '));
                break;
            case 'neofetch':
                this.cmdNeofetch();
                break;
            case 'ls':
                this.cmdLs(args);
                break;
            case 'pwd':
                this.cmdPwd();
                break;
            case 'whoami':
                this.cmdWhoami();
                break;
            case 'date':
                this.cmdDate();
                break;
            case 'uptime':
                this.cmdUptime();
                break;
            case 'cat':
                this.cmdCat(args);
                break;
            case 'mkdir':
                this.cmdMkdir(args);
                break;
            case 'touch':
                this.cmdTouch(args);
                break;
            case 'rm':
                this.cmdRm(args);
                break;
            case 'uname':
                this.cmdUname(args);
                break;
            case 'ps':
                this.cmdPs();
                break;
            case 'df':
                this.cmdDf();
                break;
            case 'free':
                this.cmdFree();
                break;
            case 'history':
                this.cmdHistory();
                break;
            case 'top':
                this.cmdTop();
                break;
            case 'fortune':
                this.cmdFortune();
                break;
            case 'cowsay':
                this.cmdCowsay(args.join(' '));
                break;
            case 'figlet':
                this.cmdFiglet(args.join(' '));
                break;
            case 'tree':
                this.cmdTree();
                break;
            case 'curl':
                this.cmdCurl(args);
                break;
            case 'ping':
                this.cmdPing(args);
                break;
                
            // New commands
            case 'theme':
                this.cmdTheme(args);
                break;
            case 'sound':
                this.cmdSound(args);
                break;
            case 'matrix':
                this.cmdMatrix();
                break;
            case 'hack':
                this.cmdHack(args);
                break;
            case 'coffee':
                this.cmdCoffee();
                break;
            case 'weather':
                this.cmdWeather(args);
                break;
            
            default:
                this.addOutput(`<div class="error">Command not found: ${cmd}</div><div class="info">Type 'help' for available commands</div>`);
        }
    }

    async handleEasterEgg(command) {
        const responses = {
            'sudo rm -rf /': 'Nice try! This is a portfolio, not your production server.',
            'sudo': 'sudo: you are not in the sudoers file. This incident will be reported.',
            'rm -rf /': 'rm: cannot remove \'/\': Permission denied (and thank goodness!)',
            'hack nasa': 'Hacking NASA... 10%... 50%... ERROR: Nice try, but I only hack for money!',
            'hack pentagon': 'The Pentagon called. They said "cute portfolio"',
            'install gentoo': 'ERROR: Life too short for compiling everything from source',
            'systemctl start coffee': 'Coffee service started (virtual coffee, but still good!)',
            'make me a sandwich': 'What? Make it yourself! (Or type "sudo make me a sandwich")',
            'pwd | sudo tee': 'Ah, a person of culture! You know your Unix jokes'
        };
        
        await this.addOutput(`<div class="warning">${responses[command.toLowerCase()]}</div>`);
    }

    // New command implementations
    async cmdTheme(args) {
        if (!args.length) {
            await this.addOutput('<div class="info">Available themes: amber, green, blue</div>');
            await this.addOutput(`<div class="info">Current theme: ${this.currentTheme}</div>`);
            await this.addOutput('<div class="info">Usage: theme [name]</div>');
            return;
        }
        
        const theme = args[0].toLowerCase();
        if (this.themes[theme]) {
            this.currentTheme = theme;
            this.applyTheme(theme);
            await this.addOutput(`<div class="success">Theme changed to: ${this.themes[theme].name}</div>`);
        } else {
            await this.addOutput('<div class="error">Theme not found. Available: amber, green, blue</div>');
        }
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }

    async cmdSound(args) {
        if (!args.length) {
            await this.addOutput(`<div class="info">Sound is ${this.soundEnabled ? 'enabled' : 'disabled'}</div>`);
            await this.addOutput('<div class="info">Usage: sound [on|off]</div>');
            return;
        }
        
        const setting = args[0].toLowerCase();
        if (setting === 'on') {
            this.soundEnabled = true;
            await this.addOutput('<div class="success">Sound effects enabled</div>');
        } else if (setting === 'off') {
            this.soundEnabled = false;
            await this.addOutput('<div class="success">Sound effects disabled</div>');
        } else {
            await this.addOutput('<div class="error">Usage: sound [on|off]</div>');
        }
    }

    async cmdMatrix() {
        await this.addOutput('<div class="info">Matrix effect has been disabled in this version</div>');
        await this.addOutput('<div class="success">You took the red pill</div>');
        await this.addOutput('<div class="info">There is no spoon... only code</div>');
    }

    async cmdHack(args) {
        const target = args.join(' ') || 'mainframe';
        
        await this.addOutput(`<div class="info">Initiating hack sequence on ${target}...</div>`);
        
        const hackSteps = [
            'Scanning for vulnerabilities...',
            'Buffer overflow detected...',
            'Injecting payload...',
            'Bypassing firewall...',
            'Cracking encryption...',
            'Accessing mainframe...',
            'Downloading files...'
        ];
        
        for (const step of hackSteps) {
            await this.sleep(Math.random() * 800 + 400);
            await this.addOutput(`<div class="warning">${step}</div>`);
            
            // Add random glitch effect
            if (Math.random() < 0.3) {
                this.triggerGlitch();
            }
        }
        
        await this.addOutput('<div class="success">HACK COMPLETE! (Just kidding, this is a portfolio)</div>');
    }

    async cmdCoffee() {
        const coffeeArt = [
            '      (  )   (   )  )',
            '     ) (   )  (  (  (',
            '   ( )  ) )   (  )  )',
            '      ) (     ) (',
            '            ________',
            '         .-"        "-.',
            '        /              \\',
            '       /                \\',
            '      |   ____________   |',
            '      |  |            |  |',
            '      |  |   COFFEE   |  |',
            '      |  |____________|  |',
            '      |                  |',
            '       \\                /',
            '        \\______________/',
            '          \\____________/',
            '',
            'Coffee is ready!'
        ];
        
        await this.addOutput('<div class="info">Brewing coffee...</div>');
        await this.sleep(1000);
        
        await this.addOutput('<div class="command-output"><pre>' + coffeeArt.join('\n') + '</pre></div>');
    }

    async cmdWeather(args) {
        const city = args.join(' ') || 'localhost';
        
        await this.addOutput(`<div class="info">Checking weather for ${city}...</div>`);
        await this.sleep(Math.random() * 1000 + 500);
        
        // Mock weather data
        const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy'];
        const temp = Math.floor(Math.random() * 35 + 5);
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        const weatherLines = [
            `Weather for ${city}:`,
            `Temperature: ${temp}°C`,
            `Condition: ${condition}`,
            `Humidity: ${Math.floor(Math.random() * 60 + 30)}%`,
            `Wind: ${Math.floor(Math.random() * 20 + 5)} km/h`,
            '',
            '(Simulated weather data for portfolio demo)'
        ];
        
        for (const line of weatherLines) {
            await this.addOutput(`<div>${line}</div>`);
            await this.sleep(100);
        }
    }

    async addOutput(html, instant = false) {
        const div = document.createElement('div');
        div.className = 'output-line';
        // Set consistent initial styling
        div.style.fontFamily = "'VT323', monospace";
        div.style.fontSize = "38px";
        div.style.lineHeight = "1.2";
        
        this.output.appendChild(div);
        
        if (instant) {
            div.innerHTML = html;
            this.applyConsistentStyling(div);
        } else {
            await this.typeHTML(div, html);
        }
        
        // Auto-scroll to bottom like a real terminal
        this.scrollToBottom();
    }

    scrollToBottom() {
        // Scroll both the terminal body and the output container to bottom
        const terminalBody = document.querySelector('.terminal-body');
        terminalBody.scrollTop = terminalBody.scrollHeight;
        this.output.scrollTop = this.output.scrollHeight;
    }

    clearTerminal() {
        this.output.innerHTML = '';
        // Scroll to top after clearing
        this.scrollToBottom();
    }

    async showWelcome() {
        const welcomeLines = [
            `<div class="success">Welcome to nikhil's terminal portfolio!</div>`,
            `<div class="info">Type <span class="help-command">help</span> to see available commands.</div>`,
            `<div class="command-list">Try: <span class="command-name">about</span>, <span class="command-name">skills</span>, <span class="command-name">projects</span></div>`
        ];

        for (const line of welcomeLines) {
            await this.addOutput(line);
            await this.sleep(300);
        }
        
        // Ensure we're scrolled to bottom after welcome
        this.scrollToBottom();
    }

    async showHelp() {
        const helpLines = [
            `<div class="command-output"><h2>Portfolio Commands:</h2></div>`,
            `<ul><li><span class="command-name">about</span> - Learn about me</li></ul>`,
            `<ul><li><span class="command-name">skills</span> - View my technical skills</li></ul>`,
            `<ul><li><span class="command-name">projects</span> - See my featured projects</li></ul>`,
            `<ul><li><span class="command-name">contact</span> - Get in touch</li></ul>`,
            `<ul><li><span class="command-name">resume</span> - View my resume</li></ul>`,
            ``,
            `<div class="command-output"><h2>Terminal Commands:</h2></div>`,
            `<ul><li><span class="command-name">echo</span> [text] - Display text</li></ul>`,
            `<ul><li><span class="command-name">neofetch</span> - System information</li></ul>`,
            `<ul><li><span class="command-name">ls</span> [-la] - List directory contents</li></ul>`,
            `<ul><li><span class="command-name">pwd</span> - Print working directory</li></ul>`,
            `<ul><li><span class="command-name">whoami</span> - Display current user</li></ul>`,
            `<ul><li><span class="command-name">date</span> - Display current date and time</li></ul>`,
            `<ul><li><span class="command-name">uptime</span> - System uptime</li></ul>`,
            `<ul><li><span class="command-name">cat</span> [file] - Display file contents</li></ul>`,
            `<ul><li><span class="command-name">tree</span> - Display directory tree</li></ul>`,
            `<ul><li><span class="command-name">history</span> - Command history</li></ul>`,
            `<ul><li><span class="command-name">fortune</span> - Random quote</li></ul>`,
            `<ul><li><span class="command-name">cowsay</span> [text] - Cow says text</li></ul>`,
            `<ul><li><span class="command-name">figlet</span> [text] - ASCII art text</li></ul>`,
            `<ul><li><span class="command-name">mkdir</span> [dir] - Create directory (sim)</li></ul>`,
            `<ul><li><span class="command-name">touch</span> [file] - Create file (sim)</li></ul>`,
            `<ul><li><span class="command-name">rm</span> [file] - Remove file (sim)</li></ul>`,
            `<ul><li><span class="command-name">uname</span> [-a] - System information</li></ul>`,
            `<ul><li><span class="command-name">ps</span> - Show running processes</li></ul>`,
            `<ul><li><span class="command-name">df</span> - Show disk usage</li></ul>`,
            `<ul><li><span class="command-name">free</span> - Show memory usage</li></ul>`,
            `<ul><li><span class="command-name">top</span> - Display running processes</li></ul>`,
            `<ul><li><span class="command-name">curl</span> [url] - Fetch data from URL</li></ul>`,
            `<ul><li><span class="command-name">ping</span> [host] - Ping a host</li></ul>`,
            ``,
            `<div class="command-output"><h2>Fun Commands:</h2></div>`,
            `<ul><li><span class="command-name">theme</span> [amber|green|blue] - Change theme</li></ul>`,
            `<ul><li><span class="command-name">sound</span> [on|off] - Toggle sound effects</li></ul>`,
            `<ul><li><span class="command-name">matrix</span> - Enter the matrix</li></ul>`,
            `<ul><li><span class="command-name">hack</span> [target] - Initiate hack sequence</li></ul>`,
            `<ul><li><span class="command-name">coffee</span> - Brew some coffee</li></ul>`,
            `<ul><li><span class="command-name">weather</span> [city] - Check weather</li></ul>`,
            ``,
            `<ul><li><span class="command-name">clear</span> - Clear terminal</li></ul>`,
            `<ul><li><span class="command-name">exit</span> - Exit terminal</li></ul>`,
            `<div class="info">Tip: Press Enter or ESC to interrupt typing animations</div>`,
            `<div class="info">Tip: Use Tab for command completion, Up/Down arrows for history</div>`
        ];

        for (const line of helpLines) {
            if (this.shouldStopTyping) break;
            await this.addOutput(line);
            await this.sleep(25); // Reduced from 50ms
        }
    }

    // Terminal command implementations
    async cmdEcho(text) {
        if (!text.trim()) {
            await this.addOutput('');
        } else {
            await this.addOutput(`<div>${text}</div>`);
        }
    }

    async cmdNeofetch() {
        // Add initial loading delay
        await this.addOutput(`<div class="info">Fetching system information...</div>`);
        await this.sleep(Math.random() * 800 + 400); // 400-1200ms loading
        
        const archLogoAndInfo = [
            `                   -`                    + `                    nikhil@portfolio`,
            `                  .o+`                   + `                   ----------------`,
            `                 \`ooo/`                  + `                  OS: Portfolio Terminal v1.0`,
            `                \`+oooo: `                + `                 Host: CRT Emulator`,
            `               \`+oooooo: `               + `                Kernel: portfolio-kernel`,
            `               -+oooooo+: `              + `                Shell: portfolio-sh`,
            `             \`/:-:++oooo+: `             + `               Resolution: ${window.screen.width}x${window.screen.height}`,
            `            \`/++++/+++++++: `            + `              Terminal: Retro CRT`,
            `           \`/++++++++++++++: `           + `             CPU: JavaScript Engine`,
            `          \`/+++ooooooooooooo/\` `         + `            Memory: Unlimited`,
            `         ./ooosssso++osssssso+\` `        + `           Uptime: ${Math.floor((Date.now() - this.startTime) / 1000)}s`,
            `        .oossssso-\`\`\`\`/ossssss+\` `       + `          Packages: ${this.commandHistory.length} commands run`,
            `       -osssssso.      :ssssssso. `      + `         Theme: Rose Pine [CRT]`,
            `      :osssssss/        osssso+++. `     + `        Icons: Terminal ASCII`,
            `     /ossssssss/        +ssssooo/- `     + `       Browser: ${navigator.userAgent.split(' ')[0]}`,
            `   \`/ossssso+/:-        -:/+osssso+- `   + `      `,
            `  \`+sso+:-\`                 \`.-/+oso: `    + `     `,
            ` \`++:.                           \`-/+/ `   + `    `,
            ` .\`                                 \`/ `   + `   `
        ].join('\n');

        const neofetchHtmlBlock = [
            `<div class="command-output">`,
            // Ensure the <pre> tag preserves whitespace and uses a monospace font for the ASCII art.
            `<pre style="color: var(--foam); white-space: pre; font-family: monospace;">${archLogoAndInfo}</pre>`,
            `</div>`
        ].join('');
        
        // Output the entire block. The typeHTML method will handle typing out the textContent.
        await this.addOutput(neofetchHtmlBlock);
    }

    async cmdLs(args) {
        // Add loading simulation for ls
        if (args.includes('-la') || args.includes('-al')) {
            await this.addOutput(`<div class="info">Reading directory contents...</div>`);
            await this.sleep(Math.random() * 300 + 200); // 200-500ms loading
        }
        
        const files = [
            'portfolio.md', 'skills.txt', 'projects/', 'resume.pdf', 
            'contact.json', 'timeline.log', '.gitignore', 'README.md',
            'package.json', 'src/', 'assets/', '.env'
        ];
        
        if (args.includes('-la') || args.includes('-al')) {
            const lsLines = [
                `<div class="command-output">`,
                `<div>total 42</div>`,
                `<div>drwxr-xr-x  3 nikhil nikhil  4096 ${new Date().toLocaleDateString()} portfolio/</div>`,
                `<div>-rw-r--r--  1 nikhil nikhil  1337 ${new Date().toLocaleDateString()} portfolio.md</div>`,
                `<div>-rw-r--r--  1 nikhil nikhil   256 ${new Date().toLocaleDateString()} skills.txt</div>`,
                `<div>drwxr-xr-x  2 nikhil nikhil  4096 ${new Date().toLocaleDateString()} projects/</div>`,
                `<div>-rw-r--r--  1 nikhil nikhil  2048 ${new Date().toLocaleDateString()} resume.pdf</div>`,
                `<div>-rw-r--r--  1 nikhil nikhil   512 ${new Date().toLocaleDateString()} contact.json</div>`,
                `<div>-rw-r--r--  1 nikhil nikhil  1024 ${new Date().toLocaleDateString()} timeline.log</div>`,
                `</div>`
            ];
            
            for (const line of lsLines) {
                await this.addOutput(line);
                await this.sleep(25); // Reduced from 50ms
            }
        } else {
            await this.addOutput(`<div class="command-output">${files.join('  ')}</div>`);
        }
    }

    async cmdPwd() {
        await this.addOutput('<div>/home/nikhil/portfolio</div>');
    }

    async cmdWhoami() {
        await this.addOutput('<div>nikhil</div>');
    }

    async cmdDate() {
        const now = new Date();
        await this.addOutput(`<div>${now.toString()}</div>`);
    }

    async cmdUptime() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        
        await this.addOutput(`<div>up ${hours}h ${minutes}m ${seconds}s, 1 user, load average: 0.42, 0.69, 1.33</div>`);
    }

    async cmdCat(args) {
        if (!args.length) {
            await this.addOutput('<div class="error">cat: missing file operand</div>');
            return;
        }

        const file = args[0];
        
        // Add loading simulation for cat
        await this.addOutput(`<div class="info">Reading file: ${file}...</div>`);
        await this.sleep(Math.random() * 500 + 300); // 300-800ms loading
        
        const fileContents = {
            'portfolio.md': '# Nikhil\'s Portfolio\n\nA terminal-based portfolio showcasing my projects and skills.',
            'skills.txt': 'Languages: C, C++, Python, JavaScript, Go, Java\nDatabases: MySQL, PostgreSQL, Firebase\nFrameworks: Flutter, Scikit-Learn',
            'resume.pdf': '[Binary file - use \'resume\' command to view]',
            'contact.json': '{\n  "github": "nikhilm25",\n  "email": "available_on_resume",\n  "status": "available"\n}',
            'README.md': '# Portfolio Terminal\n\nA retro CRT-style terminal portfolio built with vanilla JavaScript.\n\n## Features\n- Authentic terminal commands\n- CRT monitor effects\n- Typing animations',
            '.env': 'NODE_ENV=portfolio\nVERSION=1.0.0\nAUTHOR=nikhil'
        };

        if (fileContents[file]) {
            const lines = fileContents[file].split('\n');
            for (const line of lines) {
                await this.addOutput(`<div>${line}</div>`);
                await this.sleep(25); // Reduced from 50ms
            }
        } else {
            await this.addOutput(`<div class="error">cat: ${file}: No such file or directory</div>`);
        }
    }

    async cmdHistory() {
        // Add loading simulation
        await this.addOutput(`<div class="info">Loading command history...</div>`);
        await this.sleep(Math.random() * 400 + 200); // 200-600ms loading
        
        for (let i = 0; i < this.commandHistory.length; i++) {
            await this.addOutput(`<div>  ${i + 1}  ${this.commandHistory[i]}</div>`);
            await this.sleep(15); // Reduced from 30ms
        }
    }

    async cmdTree() {
        // Add loading simulation
        await this.addOutput(`<div class="info">Scanning directory structure...</div>`);
        await this.sleep(Math.random() * 600 + 400); // 400-1000ms loading
        
        const treeLines = [
            '<div class="command-output">',
            '<pre>',
            '.',
            '├── portfolio.md',
            '├── skills.txt',
            '├── projects/',
            '│   ├── shell-in-java/',
            '│   │   ├── src/',
            '│   │   ├── lib/',
            '│   │   └── README.md',
            '│   ├── kafka-from-scratch/',
            '│   │   ├── broker/',
            '│   │   ├── producer/',
            '│   │   ├── consumer/',
            '│   │   └── protocol/',
            '│   ├── relevant-leetcode/',
            '│   │   ├── algorithms/',
            '│   │   ├── data-structures/',
            '│   │   └── solutions.md',
            '│   ├── life-checklist/',
            '│   │   ├── lib/',
            '│   │   ├── assets/',
            '│   │   └── pubspec.yaml',
            '│   └── terminal-portfolio/',
            '│       ├── index.html',
            '│       ├── script.js',
            '│       └── styles.css',
            '├── resume.pdf',
            '├── contact.json',
            '├── timeline.log',
            '├── src/',
            '│   ├── script.js',
            '│   ├── styles.css',
            '│   └── index.html',
            '└── assets/',
            '    ├── fonts/',
            '    └── images/',
            '',
            '9 directories, 15 files',
            '</pre>',
            '</div>'
        ];

        for (const line of treeLines) {
            await this.addOutput(line);
            await this.sleep(50); // Reduced from 100ms
        }
    }

    async cmdFortune() {
        const fortunes = [
            "The best way to predict the future is to invent it. - Alan Kay",
            "Code is like humor. When you have to explain it, it's bad. - Cory House",
            "Programs must be written for people to read, and only incidentally for machines to execute. - Harold Abelson",
            "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. - Martin Fowler",
            "First, solve the problem. Then, write the code. - John Johnson",
            "The most important property of a program is whether it accomplishes the intention of its user. - C.A.R. Hoare",
            "Simplicity is the ultimate sophistication. - Leonardo da Vinci",
            "Make it work, make it right, make it fast. - Kent Beck"
        ];

        const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        await this.addOutput(`<div class="info">${randomFortune}</div>`);
    }

    async cmdCowsay(text) {
        if (!text) text = "Moo! Type something after cowsay";
        
        // Add loading simulation
        await this.addOutput(`<div class="info">Generating cow art...</div>`);
        await this.sleep(Math.random() * 400 + 300); // 300-700ms loading
        
        const bubble = `_${"_".repeat(text.length + 2)}_`;
        const line1 = `< ${text} >`;
        const line2 = ` ${"‾".repeat(text.length + 2)} `;
        
        const cowLines = [
            '<div class="command-output">',
            '<pre>',
            ` ${bubble}`,
            `${line1}`,
            ` ${line2}`,
            '        \\   ^__^',
            '         \\  (oo)\\_______',
            '            (__)\\       )\\/\\',
            '                ||----w |',
            '                ||     ||',
            '</pre>',
            '</div>'
        ];

        for (const line of cowLines) {
            await this.addOutput(line);
            await this.sleep(50); // Reduced from 100ms
        }
    }

    async cmdFiglet(text) {
        if (!text) text = "HELLO";
        
        // Add loading simulation
        await this.addOutput(`<div class="info">Rendering ASCII art...</div>`);
        await this.sleep(Math.random() * 500 + 400); // 400-900ms loading
        
        // Simple ASCII art for common letters
        const figletOutput = text.toUpperCase().split('').map(char => {
            switch(char) {
                case 'H':
                    return ['██   ██ ', '██   ██ ', '███████ ', '██   ██ ', '██   ██ '];
                case 'E':
                    return ['███████ ', '██      ', '█████   ', '██      ', '███████ '];
                case 'L':
                    return ['██      ', '██      ', '██      ', '██      ', '███████ '];
                case 'O':
                    return [' ██████  ', '██    ██ ', '██    ██ ', '██    ██ ', ' ██████  '];
                case ' ':
                    return ['        ', '        ', '        ', '        ', '        '];
                default:
                    return ['███████ ', '      ██', '███████ ', '██      ', '███████ '];
            }
        });

        if (figletOutput.length > 0) {
            await this.addOutput('<div class="command-output"><pre>');
            for (let row = 0; row < 5; row++) {
                let line = '';
                for (let col = 0; col < figletOutput.length; col++) {
                    line += figletOutput[col][row];
                }
                await this.addOutput(line);
                await this.sleep(100); // Reduced from 200ms
            }
            await this.addOutput('</pre></div>');
        }
    }

    // Mock implementations for system commands
    async cmdMkdir(args) {
        if (!args.length) {
            await this.addOutput('<div class="error">mkdir: missing operand</div>');
        } else {
            await this.addOutput(`<div class="success">Directory '${args[0]}' created (simulation)</div>`);
        }
    }

    async cmdTouch(args) {
        if (!args.length) {
            await this.addOutput('<div class="error">touch: missing file operand</div>');
        } else {
            await this.addOutput(`<div class="success">File '${args[0]}' created (simulation)</div>`);
        }
    }

    async cmdRm(args) {
        if (!args.length) {
            await this.addOutput('<div class="error">rm: missing operand</div>');
        } else {
            await this.addOutput(`<div class="warning">rm: cannot remove '${args[0]}': Permission denied (read-only portfolio)</div>`);
        }
    }

    async cmdUname(args) {
        if (args.includes('-a')) {
            await this.addOutput('<div>Portfolio-Terminal 1.0.0 portfolio-kernel #1 SMP Web Browser x86_64 GNU/Linux</div>');
        } else {
            await this.addOutput('<div>Portfolio-Terminal</div>');
        }
    }

    async cmdPs() {
        const processes = [
            '  PID TTY          TIME CMD',
            ' 1337 pts/0    00:00:01 portfolio-sh',
            ' 1338 pts/0    00:00:00 terminal-emulator',
            ' 1339 pts/0    00:00:00 crt-renderer',
            ' 1340 pts/0    00:00:00 typing-animation'
        ];

        for (const line of processes) {
            await this.addOutput(`<div>${line}</div>`);
            await this.sleep(100);
        }
    }

    async cmdDf() {
        const diskInfo = [
            'Filesystem     1K-blocks    Used Available Use% Mounted on',
            '/dev/browser    ∞          42K     ∞      0% /',
            '/dev/memory     8192K     1337K   6855K   16% /tmp',
            '/dev/portfolio  1024K      256K    768K   25% /home/nikhil'
        ];

        for (const line of diskInfo) {
            await this.addOutput(`<div>${line}</div>`);
            await this.sleep(100);
        }
    }

    async cmdFree() {
        await this.addOutput('<div class="command-output">');
        await this.addOutput('<pre>');
        await this.addOutput('              total        used        free      shared  buff/cache   available');
        await this.addOutput('Mem:        8192000     1337000     6855000           0           0     6855000');
        await this.addOutput('Swap:             0           0           0');
        await this.addOutput('</pre>');
        await this.addOutput('</div>');
    }

    async cmdTop() {
        await this.addOutput('<div class="info">top - press q to quit (just kidding, this is a simulation)</div>');
        const topLines = [
            'Tasks: 4 total,   1 running,   3 sleeping,   0 stopped,   0 zombie',
            '%Cpu(s):  4.2 us,  1.3 sy,  0.0 ni, 94.4 id,  0.0 wa,  0.0 hi,  0.1 si,  0.0 st',
            'MiB Mem :   8192.0 total,   6855.0 free,   1337.0 used,      0.0 buff/cache',
            '',
            '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
            ' 1337 nikhil    20   0   42000   1337      0 S   2.0   0.1   0:01.42 portfolio',
            ' 1338 nikhil    20   0   13370    420      0 S   0.3   0.0   0:00.13 terminal',
            ' 1339 nikhil    20   0    6900    256      0 S   0.1   0.0   0:00.06 crt-render'
        ];

        for (const line of topLines) {
            await this.addOutput(`<div>${line}</div>`);
            await this.sleep(150);
        }
    }

    async cmdCurl(args) {
        if (!args.length) {
            await this.addOutput('<div class="error">curl: no URL specified</div>');
        } else {
            await this.addOutput(`<div class="info">curl: Fetching ${args[0]}...</div>`);
            await this.sleep(Math.random() * 1000 + 800); // 800-1800ms loading (longer for network simulation)
            await this.addOutput(`<div class="success">200 OK - Portfolio data retrieved successfully</div>`);
        }
    }

    async cmdPing(args) {
        if (!args.length) {
            await this.addOutput('<div class="error">ping: missing host operand</div>');
        } else {
            const host = args[0];
            await this.addOutput(`<div>PING ${host} (127.0.0.1): 56 data bytes</div>`);
            for (let i = 1; i <= 4; i++) {
                // Slightly randomized ping intervals
                await this.sleep(Math.random() * 400 + 800); // 800-1200ms per ping
                const time = (Math.random() * 10 + 1).toFixed(1);
                await this.addOutput(`<div>64 bytes from ${host}: icmp_seq=${i} time=${time}ms</div>`);
            }
            await this.addOutput(`<div class="info">--- ${host} ping statistics ---</div>`);
            await this.addOutput(`<div>4 packets transmitted, 4 received, 0% packet loss</div>`);
        }
    }

    // Portfolio command implementations
    async showAbout() {
        const aboutLines = [
            `<div class="command-output"><h1>About Me</h1></div>`,
            `<div>Hi! I'm Nikhil, currently a student at NSUT studying Computer Science and Artificial Intelligence.</div>`,
            ``,
            `<div>I use arch btw.</div>`,
            `<div>Currently focused on:</div>`,
            `<ul><li>Java and Spring Boot</li></ul>`,
            `<ul><li>Linux and CLI applications</li></ul>`,
            `<ul><li>Data structures and algorithms at <a href="https://leetcode.com/nikhilmaan25/">Leetcode</a></li></ul>`,
            `<ul><li>My open source projects</li></ul>`,
            ``,
            `<div class="info">Type 'skills' to see my technical expertise</div>`
        ];

        for (const line of aboutLines) {
            if (this.shouldStopTyping) break;
            await this.addOutput(line);
            await this.sleep(50);
        }
    }

    async showSkills() {
        const skillsLines = [
            `<div class="command-output"><h1>Technical Skills</h1></div>`,
            ``,
            `<div class="command-output"><h2>Programming Languages:</h2></div>`,
            `<ul><li>C/C++ - System programming, competitive programming</li></ul>`,
            `<ul><li>Python - Backend development, data analysis</li></ul>`,
            `<ul><li>JavaScript - Web development, Node.js</li></ul>`,
            `<ul><li>Java - Object-oriented programming, Android development</li></ul>`,
            `<ul><li>Go - Concurrent programming, microservices</li></ul>`,
            ``,
            `<div class="command-output"><h2>Databases:</h2></div>`,
            `<ul><li>MySQL - Relational database design</li></ul>`,
            `<ul><li>PostgreSQL - Advanced SQL, performance tuning</li></ul>`,
            `<ul><li>Firebase - NoSQL, real-time applications</li></ul>`,
            ``,
            `<div class="command-output"><h2>Frameworks & Tools:</h2></div>`,
            `<ul><li>Flutter - Cross-platform mobile development</li></ul>`,
            `<ul><li>Scikit-Learn - Machine learning, data science</li></ul>`,
            `<ul><li>Git - Version control, collaboration</li></ul>`,
            `<ul><li>Docker - Containerization, deployment</li></ul>`,
            ``,
            `<div class="info">Type 'projects' to see what I've built</div>`
        ];

        for (const line of skillsLines) {
            if (this.shouldStopTyping) break;
            await this.addOutput(line);
            await this.sleep(40);
        }
    }

    async showProjects() {
        const projectLines = [
            `<div class="command-output"><h1>Featured Projects</h1></div>`,
            ``,
            `<div class="command-output"><h2>Shell that runs on the JVM</h2></div>`,
            `<div>A Unix-like shell implementation built in Java that runs on the JVM</div>`,
            `<ul><li>Command parsing and execution engine</li></ul>`,
            `<ul><li>Built-in commands (cd, ls, pwd, grep, etc.)</li></ul>`,
            `<ul><li>Process management and I/O redirection</li></ul>`,
            `<ul><li>Cross-platform compatibility through JVM</li></ul>`,
            `<div class="warning">🚧 Work in Progress</div>`,
            ``,
            `<div class="command-output"><h2>Apache Kafka from scratch</h2></div>`,
            `<div>A distributed streaming platform implementation from ground up</div>`,
            `<ul><li>Distributed log storage and replication</li></ul>`,
            `<ul><li>Producer-consumer messaging architecture</li></ul>`,
            `<ul><li>Fault tolerance and partition management</li></ul>`,
            `<ul><li>Network protocol implementation</li></ul>`,
            `<div class="warning">🚧 Work in Progress</div>`,
            ``,
            `<div class="command-output"><h2>Relevant LeetCode Solutions</h2></div>`,
            `<div>Curated collection of algorithmic problem solutions with almost 100 stars</div>`,
            `<ul><li>Data structures and algorithms practice</li></ul>`,
            `<ul><li></li></ul>`,
            `<ul><li>Multiple language implementations</li></ul>`,
            `<div><a href="#" target="https://github.com/nikhilm25/RelevantLeetcode">GitHub Repository</a></div>`,
            ``,
            `<div class="command-output"><h2>Life Checklist App</h2></div>`,
            `<div>A personal productivity and goal tracking application</div>`,
            `<ul><li>Task management and categorization</li></ul>`,
            `<ul><li>Progress tracking and analytics</li></ul>`,
            `<ul><li>Cross-platform mobile app built with Flutter</li></ul>`,
            `<div><a href="#" target="_blank">GitHub Repository</a></div>`,
            ``,
            `<div class="info">Type 'contact' to get in touch</div>`
        ];

        for (const line of projectLines) {
            if (this.shouldStopTyping) break;
            await this.addOutput(line);
            await this.sleep(60);
        }
    }

    async showContact() {
        const contactLines = [
            `<div class="command-output"><h1>Get In Touch</h1></div>`,
            ``,
            `<div>I'm always excited to connect with fellow developers,</div>`,
            `<div>potential collaborators, or anyone interested in tech!</div>`,
            ``,
            `<div class="command-output"><h2>Contact Information:</h2></div>`,
            `<ul><li>GitHub: <a href="https://github.com/nikhilm25" target="_blank">github.com/nikhilm25</a></li></ul>`,
            `<ul><li>Email: <a href="mailto:nikhilmaan25@gmail.com">nikhilmaan25@gmail.com</a></li></ul>`,
            `<ul><li>LinkedIn: <a href="https://www.linkedin.com/in/nikhil-maan-308821277/" target="_blank">linkedin.com/in/nikhil-maan-308821277/</a></li></ul>`,
            ``,
            `<div class="command-output"><h2>Current Status:</h2></div>`,
            `<ul><li>Available for internship opportunities</li></ul>`,
            `<ul><li>Open to freelance projects</li></ul>`,
            `<ul><li>Looking for collaboration on open source</li></ul>`,
            ``,
            `<div class="info">Type 'resume' to view my detailed resume</div>`
        ];

        for (const line of contactLines) {
            if (this.shouldStopTyping) break;
            await this.addOutput(line);
            await this.sleep(70);
        }
    }

    async showResume() {
        const resumeLines = [
            `<div class="command-output"><h1>Resume</h1></div>`,
            ``,
            `<div class="info">Loading resume data...</div>`,
            ``,
            `<div class="command-output"><h2>Education:</h2></div>`,
            `<ul><li>Bachelor of Technology in Computer Science</li></ul>`,
            `<ul><li>Expected graduation: 2025</li></ul>`,
            `<ul><li>Relevant coursework: Data Structures, Algorithms, DBMS, OS</li></ul>`,
            ``,
            `<div class="command-output"><h2>Experience:</h2></div>`,
            `<ul><li>Software Development Intern (Summer 2023)</li></ul>`,
            `<ul><li>Open Source Contributor (2022-Present)</li></ul>`,
            `<ul><li>Competitive Programming (2021-Present)</li></ul>`,
            ``,
            `<div class="command-output"><h2>Key Projects:</h2></div>`,
            `<ul><li>Terminal Portfolio - Interactive portfolio with CRT effects</li></ul>`,
            `<ul><li>Shell Implementation - Unix-like shell in Java</li></ul>`,
            `<ul><li>Life Checklist - Flutter mobile application</li></ul>`,
            ``,
            `<div class="command-output"><h2>Technical Skills:</h2></div>`,
            `<ul><li>Languages: C/C++, Python, JavaScript, Java, Go</li></ul>`,
            `<ul><li>Technologies: Flutter, Node.js, MySQL, Git, Docker</li></ul>`,
            `<ul><li>Concepts: DSA, OOP, System Design, Database Design</li></ul>`,
            ``,
            `<div class="success">For a detailed PDF resume, please contact me directly</div>`
        ];

        for (const line of resumeLines) {
            if (this.shouldStopTyping) break;
            await this.addOutput(line);
            await this.sleep(60);
        }
    }

    async exitTerminal() {
        await this.addOutput('<div class="warning">Initiating terminal shutdown...</div>');
        await this.sleep(500);
        
        await this.addOutput('<div class="info">Saving session data...</div>');
        await this.sleep(800);
        
        await this.addOutput('<div class="info">Cleaning up processes...</div>');
        await this.sleep(600);
        
        await this.addOutput('<div class="success">Thanks for visiting! Goodbye!</div>');
        await this.sleep(1000);
        
        // Add the turning-off class to trigger the CRT turn-off animation
        const terminalContainer = document.querySelector('.terminal-container');
        terminalContainer.classList.add('turning-off');
        
        // After animation completes, redirect to YouTube video
        setTimeout(() => {
            // Replace with your desired YouTube video URL
            window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        }, 550); // Match the turn-off animation duration
    }

    // Visual effects
    startRandomGlitches() {
        setInterval(() => {
            if (Math.random() < 0.05) { // 5% chance every interval
                this.triggerGlitch();
            }
        }, 2000);
    }

    triggerGlitch() {
        const elements = document.querySelectorAll('.output-line, .prompt');
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        
        if (randomElement) {
            randomElement.classList.add('glitch-effect');
            setTimeout(() => {
                randomElement.classList.remove('glitch-effect');
            }, 300);
        }
    }
}

// Make terminal globally accessible for suggestions
let terminal;

document.addEventListener('DOMContentLoaded', () => {
    terminal = new Terminal();
});
