// Base email template with common styles and structure
export const createEmailTemplate = (
  title: string,
  content: string,
  headerColor: string = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        /* Reset styles */
        body { 
          margin: 0; 
          padding: 0; 
          font-family: 'Inter', Arial, sans-serif; 
          background-color: #f8fafc; 
          line-height: 1.6;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        /* Container styles */
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        
        /* Header styles */
        .header { 
          background: ${headerColor}; 
          padding: 40px 20px; 
          text-align: center; 
        }
        .logo { 
          font-size: 32px; 
          font-weight: 700; 
          color: #ffffff; 
          margin: 0; 
          letter-spacing: -0.5px; 
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        /* Content styles */
        .content { 
          padding: 40px 30px; 
        }
        .title { 
          font-size: 24px; 
          font-weight: 600; 
          color: #1f2937; 
          margin: 0 0 20px 0; 
          text-align: center; 
        }
        .subtitle { 
          font-size: 16px; 
          color: #6b7280; 
          line-height: 1.6; 
          text-align: center; 
          margin-bottom: 30px; 
        }
        
        /* Button styles */
        .button { 
          display: inline-block; 
          color: #ffffff; 
          text-decoration: none; 
          padding: 16px 32px; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px; 
          margin: 20px 0; 
          transition: all 0.3s ease; 
          text-align: center;
        }
        .button-primary { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39); 
        }
        .button-success { 
          background: linear-gradient(135deg, #059669 0%, #047857 100%); 
          box-shadow: 0 4px 14px 0 rgba(5, 150, 105, 0.39); 
        }
        .button-danger { 
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
          box-shadow: 0 4px 14px 0 rgba(220, 38, 38, 0.39); 
        }
        .button:hover { 
          transform: translateY(-2px); 
          opacity: 0.9;
        }
        .button-container { 
          text-align: center; 
          margin: 30px 0; 
        }
        
        /* Card styles */
        .card { 
          background-color: #f3f4f6; 
          border-radius: 12px; 
          padding: 30px; 
          margin: 30px 0; 
          border: 1px solid #e5e7eb; 
        }
        .card-success { 
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); 
          border: 1px solid #bbf7d0; 
        }
        .card-warning { 
          background-color: #fef3c7; 
          border-left: 4px solid #f59e0b; 
          border-radius: 0 8px 8px 0; 
        }
        .card-danger { 
          background-color: #fef2f2; 
          border-left: 4px solid #dc2626; 
          border-radius: 0 8px 8px 0; 
        }
        .card-info { 
          background-color: #eff6ff; 
          border: 1px solid #bfdbfe; 
        }
        
        /* Text styles */
        .text-primary { color: #1f2937; }
        .text-secondary { color: #6b7280; }
        .text-success { color: #047857; }
        .text-warning { color: #92400e; }
        .text-danger { color: #dc2626; }
        .text-info { color: #1e40af; }
        
        .text-sm { font-size: 14px; }
        .text-xs { font-size: 12px; }
        .text-lg { font-size: 18px; }
        
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        
        /* Alternative link styles */
        .alternative-link { 
          background-color: #f3f4f6; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 30px 0; 
          border-left: 4px solid #6b7280; 
        }
        .alternative-title { 
          font-size: 14px; 
          font-weight: 600; 
          color: #374151; 
          margin: 0 0 10px 0; 
        }
        .alternative-url { 
          font-size: 12px; 
          color: #6b7280; 
          word-break: break-all; 
          font-family: 'Courier New', monospace; 
        }
        
        /* Footer styles */
        .footer { 
          background-color: #f9fafb; 
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e5e7eb; 
        }
        .footer-text { 
          font-size: 14px; 
          color: #6b7280; 
          margin: 0; 
        }
        
        /* Responsive styles */
        @media (max-width: 600px) {
          .content { padding: 30px 20px; }
          .header { padding: 30px 20px; }
          .button { padding: 14px 28px; font-size: 15px; }
          .card { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">QODWA</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p class="footer-text">
            This email was sent from Qodwa Platform. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Common email components
export const emailComponents = {
  title: (text: string) => `<h2 class="title">${text}</h2>`,
  subtitle: (text: string) => `<p class="subtitle">${text}</p>`,
  button: (
    href: string,
    text: string,
    type: 'primary' | 'success' | 'danger' = 'primary'
  ) => `
    <div class="button-container">
      <a href="${href}" class="button button-${type}">${text}</a>
    </div>
  `,
  alternativeLink: (
    url: string,
    title: string = "Can't click the button? Copy and paste this link:"
  ) => `
    <div class="alternative-link">
      <div class="alternative-title">${title}</div>
      <div class="alternative-url">${url}</div>
    </div>
  `,
  warningCard: (text: string, title: string = '⚠️ Important:') => `
    <div class="card card-warning">
      <p class="text-warning text-sm" style="margin: 0;">
        <strong>${title}</strong> ${text}
      </p>
    </div>
  `,
  infoCard: (content: string) => `
    <div class="card card-info">
      ${content}
    </div>
  `,
  successCard: (content: string) => `
    <div class="card card-success">
      ${content}
    </div>
  `,
};
