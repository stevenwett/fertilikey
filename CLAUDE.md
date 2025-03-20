# FertiliKey Project Guidelines

## Build Commands
- **Development**: `cd lib && npm run dev`
- **Production Build**: `cd lib && npm run build`
- **PHP Server**: `php -S localhost:8000 -t public`

## Project Structure
- **Frontend**: React components in `lib/js/components/`
- **Styling**: SCSS in `lib/scss/`
- **Backend**: PHP API endpoints in `public/api/`

## Code Style

### JavaScript/React
- Use functional components with hooks
- Follow React best practices for state management
- Handle API errors consistently with try/catch blocks
- Use async/await for asynchronous operations

### CSS/SCSS
- Follow BEM naming convention for classes
- Use Bootstrap mixins and utilities when possible
- Maintain custom variables in `lib/scss/main.scss`
- Mobile-first responsive design

### PHP
- Follow PSR-4 standards for PHP code
- Use appropriate error handling and logging
- Secure API endpoints properly

## Import Conventions
- Group imports by type (React, external libraries, local components)
- Use absolute paths for imports when possible