document.addEventListener('DOMContentLoaded', function () {
    const initialGreeting = "Hello! I'm JARVIS, your AI assistant. How can I help you today?";
    
    // Display the initial greeting
    const greetingDiv = document.createElement('div');
    greetingDiv.className = 'message ai-message';
    greetingDiv.innerHTML = `<strong>${initialGreeting}</strong>`;
    document.getElementById('messages').appendChild(greetingDiv);

    let conversationHistory = [
        { role: "system", content: "You are the best modern, smart, cool, intelligent genius assistant, especially in mathematics and Gen Z trends." }
    ];

    document.getElementById('chat-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const userInput = document.getElementById('user_input').value;

        // Append user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.innerHTML = `<strong>You:</strong> ${escapeHtml(userInput)}`;
        document.getElementById('messages').appendChild(userMessageDiv);

        // Add user message to conversation history
        conversationHistory.push({ role: "user", content: userInput });

        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading';
        loadingDiv.innerHTML = "<strong>JARVIS:</strong> Thinking...";
        document.getElementById('messages').appendChild(loadingDiv);

        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversation: conversationHistory }),
        })
            .then(response => response.json())
            .then(data => {
                // Remove loading indicator
                document.getElementById('messages').removeChild(loadingDiv);

                const aiMessageDiv = document.createElement('div');
                aiMessageDiv.className = 'message ai-message';

                // Format and render the response (detect code and highlight it)
                const formattedResponse = formatMarkdownWithMath(data.grok_response);
                aiMessageDiv.innerHTML = `<strong>JARVIS:</strong> ${formattedResponse}`;

                document.getElementById('messages').appendChild(aiMessageDiv);
                document.getElementById('user_input').value = ''; // Clear input field
                document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;

                // Add AI message to conversation history
                conversationHistory.push({ role: "assistant", content: data.grok_response });

                // Trigger syntax highlighting for code blocks
                highlightSyntax();
                // Trigger Math rendering after response is added to DOM
                renderMath();
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('messages').removeChild(loadingDiv);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'message ai-message error';
                errorDiv.innerHTML = "<strong>JARVIS:</strong> Oops! An error occurred. Please try again.";
                document.getElementById('messages').appendChild(errorDiv);
            });
    });
});

// Utility function to escape HTML (prevent XSS)
function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
}

// Format AI response to detect code blocks and wrap them in <pre><code> tags
function formatAIResponse(response) {
    // Use a regex to detect code blocks (e.g., ```language ... ```)
    return response.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const langClass = language ? `language-${language}` : 'language-plaintext';
        return `<pre><code class="${langClass}">${escapeHtml(code)}</code></pre>`;
    });
}

// Format Markdown and Math
function formatMarkdownWithMath(text) {
    if (!text) return '';

    // Convert LaTeX syntax to MathJax-compatible format
    const processedText = text
        // Handle block math (\[...\])
        .replace(/\\\[(.*?)\\\]/gs, (match, expr) => {
            return `<div class="math-block">\\[${expr}\\]</div>`;
        })
        // Handle inline math (\(...\))
        .replace(/\\\((.*?)\\\)/g, (match, expr) => {
            return `<span class="math-inline">\\(${expr}\\)</span>`;
        });

    // Format Markdown syntax
    return processedText
        // Headings
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^### (.*$)/gim, '<h4>$1</h4>')

        // Lists
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\.\s(.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
        // Bold and Italics
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Inline Code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Line breaks
        .replace(/\n/g, '<br>');
}

// Trigger syntax highlighting using Prism.js
function highlightSyntax() {
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
}

// Render MathJax and KaTeX for mathematical expressions
function renderMath() {
    if (window.MathJax) {
        MathJax.typesetPromise().then(() => {
            console.log("MathJax rendering complete.");
        }).catch((err) => console.error('MathJax rendering error:', err));
    } else if (window.KaTeX) {
        const elements = document.querySelectorAll('.math-inline, .math-block');
        elements.forEach(element => {
            try {
                KaTeX.render(element.innerText, element, {
                    throwOnError: false,
                    displayMode: element.classList.contains('math-block')
                });
            } catch (error) {
                console.error("KaTeX rendering error:", error);
            }
        });
    }
}

