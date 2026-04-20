# cf-open-chat

AI chat web application using free OpenRouter API, deployed to Cloudflare Pages.


## Project Structure

your-repo/

├── index.html

├── style.css

├── script.js

└── functions/

    └── api/
    
        └── chat.js
        

## Deployment Steps

1. Push to GitHub:
 Create a new repository and upload these 4 files:
index.html
style.css
script.js
functions/api/chat.js

2. Connect to Cloudflare Pages
   
Go to Cloudflare Dashboard → Workers & Pages → Create application → Connect to Git

Select your repository

Build settings:

Build command: (leave empty)

Output directory: .

Click Save and Deploy

3. Add API Key
In your Pages project → Settings → Environment Variables
Add variable:
Name: OPENROUTER_API_KEY
Value: your OpenRouter API key (get it from https://openrouter.ai/keys)
Save

4. Test
   
Visit your .pages.dev URL and try chatting!

## Get Free OpenRouter API Key

Go to https://openrouter.ai/
Sign up / Log in
Go to Keys → Create Secret Key
Copy the key and add it to Cloudflare Pages environment variables and redeploy.
