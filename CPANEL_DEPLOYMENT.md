# Deploying to cPanel

This Next.js application requires a Node.js environment to run properly, especially because it uses `next-auth` and server-side APIs.

To deploy this site to a cPanel hosting environment, follow these steps:

## Prerequisites
Your cPanel hosting plan must support **Setup Node.js App** (often powered by Phusion Passenger).

## 1. Upload the Files
1. Open cPanel and go to **File Manager**.
2. Create a folder for your app (e.g., `radio-app`) outside of your `public_html` directory to keep your source code secure.
3. Upload all the files from this repository into that folder (you can zip them first, upload, and then extract).

## 2. Create the Node.js Application
1. In cPanel, find the **Setup Node.js App** icon under the Software section.
2. Click **Create Application**.
3. Set the following fields:
   - **Node.js version**: Select the latest available version (e.g., 18.x or 20.x).
   - **Application mode**: `Production`
   - **Application root**: The folder you created in Step 1 (e.g., `radio-app`).
   - **Application URL**: The domain/subdomain where you want the app to be accessible.
   - **Application startup file**: `server.js` (this file was specially created to run Next.js on cPanel).

## 3. Set Environment Variables
Scroll down to the **Environment variables** section and add the following:
- Name: `NODE_ENV`, Value: `production`
- Name: `AUTH_URL`, Value: `https://your-domain.com` (replace with your actual domain)
- Name: `AUTH_SECRET`, Value: `your-secret-key` (generate a random secret key for next-auth)
- Name: `AUTH_TRUST_HOST`, Value: `true`

Click **Save** at the top right of the page.

## 4. Install Dependencies and Build
Once the app is saved:
1. In the Node.js App page, click the **Run NPM Install** button to install dependencies. (This might take a few minutes).
2. After installation finishes, you need to build the Next.js app. 
   - Connect via SSH to your cPanel or use the cPanel Terminal.
   - Run the command shown at the top of your Node.js App page to enter the virtual environment. It looks something like: `source /home/username/nodevenv/radio-app/20/bin/activate && cd /home/username/radio-app`
   - Run: `npm run build`

## 5. Restart the Application
1. Go back to the **Setup Node.js App** page in cPanel.
2. Click the **Restart** icon next to your application.
3. Visit your domain to verify the site is running!

## Note on next-auth
If you use any database or third-party OAuth providers, make sure their respective environment variables are also added to the Node.js App environment variables list.
