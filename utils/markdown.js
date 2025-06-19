// Markdown utility for Got Clue Anot extension
// Simplified HTML to Markdown converter

(function() {
    'use strict';
    
    // Simple HTML to Markdown converter
    window.htmlToMarkdown = function(html) {
        // Create a temporary DOM element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Convert to markdown
        return convertElementToMarkdown(tempDiv);
    };
    
    function convertElementToMarkdown(element) {
        let markdown = '';
        
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                // Add text content, cleaning up whitespace
                const text = node.textContent.trim();
                if (text) {
                    markdown += text + ' ';
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                markdown += convertElementByTag(node);
            }
        }
        
        return markdown.trim();
    }
    
    function convertElementByTag(element) {
        const tagName = element.tagName.toLowerCase();
        const content = convertElementToMarkdown(element);
        
        switch (tagName) {
            case 'h1':
                return `# ${content}\n\n`;
            case 'h2':
                return `## ${content}\n\n`;
            case 'h3':
                return `### ${content}\n\n`;
            case 'h4':
                return `#### ${content}\n\n`;
            case 'h5':
                return `##### ${content}\n\n`;
            case 'h6':
                return `###### ${content}\n\n`;
            case 'p':
                return `${content}\n\n`;
            case 'br':
                return '\n';
            case 'strong':
            case 'b':
                return `**${content}**`;
            case 'em':
            case 'i':
                return `*${content}*`;
            case 'code':
                return `\`${content}\``;
            case 'pre':
                return `\`\`\`\n${content}\n\`\`\`\n\n`;
            case 'a':
                const href = element.getAttribute('href');
                if (href) {
                    return `[${content}](${href})`;
                }
                return content;
            case 'img':
                const src = element.getAttribute('src');
                const alt = element.getAttribute('alt') || '';
                if (src) {
                    return `![${alt}](${src})`;
                }
                return '';
            case 'ul':
                return `${content}\n`;
            case 'ol':
                return `${content}\n`;
            case 'li':
                // Simple list item handling
                return `- ${content}\n`;
            case 'blockquote':
                return `> ${content}\n\n`;
            case 'table':
                return convertTable(element);
            case 'div':
            case 'span':
            case 'section':
            case 'article':
                // For generic containers, just return content
                return content;
            default:
                // For unknown tags, extract text content
                return element.textContent || '';
        }
    }
    
    function convertTable(table) {
        let markdown = '\n';
        const rows = table.querySelectorAll('tr');
        
        if (rows.length === 0) {
            return '';
        }
        
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td, th');
            const cellContents = Array.from(cells).map(cell => 
                cell.textContent.trim().replace(/\|/g, '\\|')
            );
            
            markdown += '| ' + cellContents.join(' | ') + ' |\n';
            
            // Add header separator after first row if it contains th elements
            if (index === 0 && row.querySelector('th')) {
                markdown += '| ' + cellContents.map(() => '---').join(' | ') + ' |\n';
            }
        });
        
        return markdown + '\n';
    }
    
    // Export for use in background script
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { htmlToMarkdown };
    }
})(); 