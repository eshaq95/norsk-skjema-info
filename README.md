
# Norwegian Address Form Application

## Project Overview

This application provides a user-friendly form interface for collecting Norwegian addresses with real-time validation and verification. It leverages Norwegian address APIs to ensure address accuracy and completeness.

### Key Features

- **Municipality, Street, and House Number Selection**: Step-by-step guided address entry
- **Real-time Address Validation**: Ensures addresses exist in Norway's address database
- **Responsive Design**: Works well on all device sizes
- **Form Validation**: Provides immediate feedback on required fields
- **Error Handling**: User-friendly error messages for API errors or network issues

## Technical Details

This project is built with:

- **Vite**: For fast development and optimized builds
- **TypeScript**: For type safety across the codebase
- **React**: For building the user interface components
- **Shadcn UI**: For consistent, accessible UI components
- **Tailwind CSS**: For responsive design and styling

## API Integrations

This application integrates with:
- **Norwegian Address API**: For municipality, street, and house number lookups
- **Google Places API**: (Optional) For alternative address input with autocomplete

## Project Structure

- **Address Components**: Modular components for different parts of an address
- **Form Components**: Common form elements with consistent styling and validation
- **Hooks**: Custom hooks for API communication and form logic
- **Utils**: Utility functions for validation and data formatting

## Getting Started

### Running Locally

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create a .env file with your API keys (see .env.example).

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Required Environment Variables

See `.env.example` for the required environment variables.

## Deployment

This project can be easily deployed using Lovable's built-in deployment features.

To deploy this project:
1. Open [Lovable](https://lovable.dev/projects/763fa5be-65e4-48d5-9b7f-6768a6aa0e7a)
2. Click on Share -> Publish

### Custom Domain Setup

You can connect a custom domain to your Lovable project:
1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow the instructions to verify ownership and set up DNS

For more information, see: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Project URL

**URL**: https://lovable.dev/projects/763fa5be-65e4-48d5-9b7f-6768a6aa0e7a
