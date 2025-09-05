const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()

app.use(cors())
app.use(express.json())

// Function to call Sarvam AI API
/*
async function callSarvamAI(messages, systemPrompt = null) {
    const messagesWithSystem = systemPrompt ? 
        [{ role: "system", content: systemPrompt }, ...messages] : 
        messages;

    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "api-subscription-key": "",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "messages": messagesWithSystem,
            "model": "sarvam-m"
        }),
    });

    const body = await response.json();
    return body.choices[0].message.content;
}*/

async function callSarvamAI(messages, systemPrompt = null) {
    const messagesWithSystem = systemPrompt
        ? [{ role: "system", content: systemPrompt }, ...messages]
        : messages;

    const response = await axios.post("https://api.sarvam.ai/v1/chat/completions", {
        messages: messagesWithSystem,
        model: "sarvam-m"
    }, {
        headers: {
            "api-subscription-key": "API_KEY_SARVAM",
            "Content-Type": "application/json"
        }
    });

    return response.data.choices[0].message.content;
}
/*

// Function to scrape government schemes
async function scrapeSchemes(topic) {
    try {
        const response = await fetch("https://my-service-name-974258768185.us-central1.run.app/api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "topic": topic
            })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error scraping schemes:", error);
        return [];
    }
}
*/
async function scrapeSchemes(topic) {
    try {
        const response = await axios.post("https://my-service-name-974258768185.us-central1.run.app/api", {
            topic
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error scraping schemes:", error.message);
        return [];
    }
}

app.post('/api', async (req, res) => {
    const msg = req.body.msg;
    const userQuery = msg[msg.length - 1].content;
    
    console.log("Incoming request: " + userQuery);
    
    try {
        // STAGE 1: Extract search keywords from user query
        const keywordExtractionPrompt = `You are a keyword extraction specialist for government scheme searches. 
        Your task is to analyze user queries and extract 2-3 relevant keywords that would help find appropriate government schemes.
        
        Return ONLY the keywords separated by commas, nothing else.
        
        Examples:
        - "I am a student looking for education loans" -> "student education loan"
        - "I want to start a small business" -> "startup business scheme"
        - "I am a farmer and need subsidies" -> "farmer subsidy agriculture"
        - "I am unemployed and need job training" -> "employment training skill"
        
        Extract keywords from this query:`;
        
        const keywordMessages = [
            { role: "user", content: userQuery }
        ];
        
        const extractedKeywords = await callSarvamAI(keywordMessages, keywordExtractionPrompt);
        console.log("Extracted keywords:", extractedKeywords);
        
        // STAGE 2: Scrape schemes based on keywords
        const schemes = await scrapeSchemes(extractedKeywords.trim());
        console.log("Scraped schemes:", schemes);
        
        // STAGE 3: Generate final response with schemes
        const finalResponsePrompt = `You are Balu, a helpful government scheme advisor chatbot developed by Gov Guide. 
        Your role is to help users find relevant government schemes based on their situation.
        
        You have been provided with a user query and a list of government schemes that were found based on relevant keywords.
        
        Your task:
        1. Analyze the user's query to understand their specific needs
        2. Review the provided government schemes
        3. Provide a helpful summary that includes:
           - Brief acknowledgment of their query
           - List of relevant schemes with their titles and links
           - Brief explanation of how each scheme might help them
           - Encourage them to visit the links for detailed information
        
        Keep your response conversational, helpful, and encouraging.
        
        User Query: "${userQuery}"
        
        Available Government Schemes:
        ${schemes.map(scheme => `
        Title: ${scheme.title}
        Link: ${scheme.link}
        Description: ${scheme.description || 'No description available'}
        `).join('\n')}
        
        If no relevant schemes were found, apologize and suggest they try rephrasing their query or contact government offices directly.`;
        
        const finalResponse = await callSarvamAI([
            { role: "user", content: "Please provide a summary of relevant government schemes for my query." }
        ], finalResponsePrompt);
        
        console.log("Final response generated");
        
        // Add the assistant's response to the conversation
        const assistantMessage = {
            role: "assistant",
            content: finalResponse
        };
        
        const updatedMessages = [...msg, assistantMessage];
        
        res.json({
            'resp': updatedMessages,
            'keywords': extractedKeywords,
            'schemes': schemes
        });
        
    } catch (error) {
        console.error("Error processing request:", error);
        
        const errorMessage = {
            role: "assistant",
            content: "I apologize, but I encountered an error while searching for government schemes. Please try again or contact support if the issue persists."
        };
        
        const updatedMessages = [...msg, errorMessage];
        
        res.json({
            'resp': updatedMessages,
            'error': error.message
        });
    }
});

app.listen(8080, () => {
    console.log('Server started on port 3030');
});