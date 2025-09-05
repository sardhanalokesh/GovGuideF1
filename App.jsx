import { useState } from 'react';
import axios from 'axios';
import './App.css'

function App() {
  const [query, setQuery] = useState(""); 
  const [response, setResponse] = useState("")
  const [msg, setMsg] = useState([])
  const [loading, setLoading] = useState(false)
  const [keywords, setKeywords] = useState("")
  const [schemes, setSchemes] = useState([])

  const handleChange = (event) => {
    setQuery(event.target.value)
  }

  const call = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      console.log("before: " + JSON.stringify(msg));
      
      const updated = [...msg, {
        'role': 'user',
        'content': query
      }];
      
      console.log("sending to API: " + JSON.stringify(updated));
      
      const res = await axios.post('https://my-node-app-974258768185.us-central1.run.app/api', { msg: updated });
      console.log("API response:", res);
      
      setMsg(res.data.resp);
      setKeywords(res.data.keywords || "");
      setSchemes(res.data.schemes || []);
      
      const lastMessage = res.data.resp[res.data.resp.length - 1];
      setResponse(lastMessage.content || "No response received");
      
      setQuery("");
      
    } catch (err) {
      console.error(err);
      setResponse("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };
/*
  const formatResponse = (text) => {
    // Split by newlines and create paragraphs
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim()) {
        return <p key={index} className="mb-3 leading-relaxed">{paragraph}</p>;
      }
      return null;
    }).filter(Boolean);
  };*/
  const formatResponse = (text) => {
  // Simple markdown parser for common AI response patterns
  const lines = text.split('\n');
  const elements = [];
  let currentIndex = 0;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      return;
    }

    // Headers (# ## ###)
    if (trimmedLine.startsWith('#')) {
      const headerLevel = trimmedLine.match(/^#+/)[0].length;
      const headerText = trimmedLine.replace(/^#+\s*/, '');
      const HeaderTag = `h${Math.min(headerLevel, 6)}`;
      
      elements.push(
        React.createElement(HeaderTag, {
          key: currentIndex++,
          className: `font-bold text-gray-800 mb-3 ${
            headerLevel === 1 ? 'text-2xl' :
            headerLevel === 2 ? 'text-xl' :
            headerLevel === 3 ? 'text-lg' :
            'text-base'
          }`
        }, headerText)
      );
      return;
    }

    // Bullet points (- * +)
    if (trimmedLine.match(/^[-*+]\s/)) {
      const listText = trimmedLine.replace(/^[-*+]\s/, '');
      elements.push(
        <div key={currentIndex++} className="flex items-start mb-2">
          <span className="text-blue-600 mr-2">•</span>
          <span className="text-gray-700">{parseInlineMarkdown(listText)}</span>
        </div>
      );
      return;
    }

    // Numbered lists (1. 2. etc.)
    if (trimmedLine.match(/^\d+\.\s/)) {
      const listText = trimmedLine.replace(/^\d+\.\s/, '');
      const number = trimmedLine.match(/^(\d+)\./)[1];
      elements.push(
        <div key={currentIndex++} className="flex items-start mb-2">
          <span className="text-blue-600 mr-2 font-medium">{number}.</span>
          <span className="text-gray-700">{parseInlineMarkdown(listText)}</span>
        </div>
      );
      return;
    }

    // Code blocks (```)
    if (trimmedLine.startsWith('```')) {
      // This is a simple implementation - in a real app, you might want to use a proper markdown parser
      elements.push(
        <div key={currentIndex++} className="bg-gray-100 p-3 rounded-md font-mono text-sm text-gray-800 mb-3">
          {trimmedLine.replace(/```/g, '')}
        </div>
      );
      return;
    }

    // Blockquotes (>)
    if (trimmedLine.startsWith('>')) {
      const quoteText = trimmedLine.replace(/^>\s*/, '');
      elements.push(
        <blockquote key={currentIndex++} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-3">
          {parseInlineMarkdown(quoteText)}
        </blockquote>
      );
      return;
    }

    // Regular paragraphs
    elements.push(
      <p key={currentIndex++} className="mb-3 leading-relaxed text-gray-700">
        {parseInlineMarkdown(trimmedLine)}
      </p>
    );
  });

  return elements;
};

// Helper function to parse inline markdown (bold, italic, inline code)
const parseInlineMarkdown = (text) => {
  // This is a simplified parser - for production, consider using a library like 'marked' or 'react-markdown'
  const parts = [];
  let currentText = text;
  let key = 0;

  // Split by markdown patterns while preserving the delimiters
  const patterns = [
    { regex: /\*\*(.*?)\*\*/g, component: 'strong', className: 'font-bold' },
    { regex: /\*(.*?)\*/g, component: 'em', className: 'italic' },
    { regex: /`(.*?)`/g, component: 'code', className: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono' }
  ];

  // Simple implementation - splits text and applies formatting
  let processedText = currentText;
  
  // Bold text
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
    return `<strong class="font-bold">${content}</strong>`;
  });
  
  // Italic text
  processedText = processedText.replace(/\*(.*?)\*/g, (match, content) => {
    return `<em class="italic">${content}</em>`;
  });
  
  // Inline code
  processedText = processedText.replace(/`(.*?)`/g, (match, content) => {
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">${content}</code>`;
  });

  // Return JSX by dangerously setting innerHTML (be careful with this in production)
  return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
};

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Gov Guide - Scheme Finder</h1>
          <p className='text-gray-600'>Find government schemes tailored to your needs</p>
        </div>

        <form onSubmit={call} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Enter your query about government schemes
            </label>
            <input 
              type='text' 
              value={query} 
              onChange={handleChange}
              placeholder='e.g., "I am a student looking for education loans" or "I want to start a business"'
              className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              disabled={loading}
            />
          </div>
          
          <button 
            type='submit'
            disabled={loading || !query.trim()}
            className='w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {loading ? 'Searching for schemes...' : 'Find Schemes'}
          </button>
        </form>

        {loading && (
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <p className='mt-2 text-gray-600'>Analyzing your query and finding relevant schemes...</p>
          </div>
        )}

        {response && !loading && (
          <div className='bg-gray-50 rounded-lg p-6 space-y-4'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Scheme Recommendations</h2>
            <div className='prose max-w-none'>
              {formatResponse(response)}
            </div>
          </div>
        )}

        {keywords && !loading && (
          <div className='bg-blue-50 rounded-lg p-4'>
            <h3 className='text-sm font-medium text-blue-800 mb-2'>Search Keywords Used:</h3>
            <span className='inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>
              {keywords}
            </span>
          </div>
        )}

        {schemes.length > 0 && !loading && (
          <div className='bg-green-50 rounded-lg p-6'>
            <h3 className='text-lg font-semibold text-green-800 mb-4'>
              Found {schemes.length} Relevant Schemes
            </h3>
            <div className='space-y-3'>
              {schemes.map((scheme, index) => (
                <div key={index} className='bg-white p-4 rounded-md border border-green-200'>
                  <h4 className='font-medium text-gray-800 mb-2'>{scheme.title}</h4>
                  {scheme.description && (
                    <p className='text-sm text-gray-600 mb-2'>{scheme.description}</p>
                  )}
                  <a 
                    href={scheme.link} 
                    target='_blank' 
                    rel='noopener noreferrer'
                    className='inline-block bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors'
                  >
                    Visit Scheme →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat History */}
        {msg.length > 0 && (
          <div className='border-t pt-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Conversation History</h3>
            <div className='space-y-3 max-h-64 overflow-y-auto'>
              {msg.map((message, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-100 text-blue-800 ml-8' 
                    : 'bg-gray-100 text-gray-800 mr-8'
                }`}>
                  <div className='text-xs font-medium mb-1 uppercase'>
                    {message.role === 'user' ? 'You' : 'Balu (Assistant)'}
                  </div>
                  <div className='text-sm'>{message.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App;