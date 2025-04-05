# CodeClash - 1v1 Competitive Coding Battles

CodeClash is a real-time competitive coding platform where programmers can challenge each other to solve Codeforces problems in a head-to-head battle format.

## Live Demo

Try CodeClash now: [https://codeclash-1-bq57.onrender.com/](https://codeclash-1-bq57.onrender.com/)

## Features

- **Real-time Coding Battles**: Challenge friends or practice partners to solve the same problem simultaneously
- **Codeforces Integration**: Problems are sourced directly from Codeforces based on difficulty rating
- **Rating-Based Matching**: Problems are selected based on player ratings
- **Live Verification**: Submit your solution on Codeforces and get instant verification
- **Time-Based Challenges**: Race against the clock with configurable time limits

## How to Use

### Creating a Room

1. Visit the [CodeClash website](https://codeclash-1-bq57.onrender.com/)
2. Click "Create Room" on the home page
3. Enter your display name, Codeforces handle, and select a rating (800-2000)
4. Choose a time limit for the challenge
5. Give your room a name and click "Create Room"
6. Share the generated room code with your opponent

### Joining a Room

1. Visit the [CodeClash website](https://codeclash-1-bq57.onrender.com/)
2. Click "Join Room" on the home page
3. Enter your display name, Codeforces handle, and the room code
4. Click "Join Room" to enter the battle

### During the Battle

1. Once both players are in the room, the host can click "Start Game"
2. A problem matching your room's rating will be selected
3. Click "Open Problem" to view the problem on Codeforces
4. Solve the problem in your preferred IDE/environment
5. Submit your solution on Codeforces
6. Return to CodeClash and click "Verify Solution"
7. First player to solve the problem correctly wins!

## Requirements

- A valid Codeforces account to submit solutions
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for real-time updates

## Technology Stack

- **Frontend**: React.js, Socket.IO client
- **Backend**: Node.js, Express, Socket.IO
- **External API**: Codeforces API

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd server && npm install
   cd ../1v1 && npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update values as needed
   
4. Run the backend:
   ```
   cd server && npm run dev
   ```
5. Run the frontend:
   ```
   cd 1v1 && npm run dev
   ```

## Deployment

This project is deployed on Render.com:
- Frontend: [https://codeclash-1-bq57.onrender.com/](https://codeclash-1-bq57.onrender.com/)
- Backend: Hosted on Render Web Services

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check issues page.

## License

This project is MIT licensed.

## Contact

Have questions? Reach out to the project maintainers through GitHub issues. 