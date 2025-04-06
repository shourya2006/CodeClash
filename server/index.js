const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const axios = require("axios");
require('dotenv').config();

const app = express();
app.use(cors());

const rooms = [];

const generateRoomId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  if (rooms[result]) {
    return generateRoomId();
  }

  return result;
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const datas = [];
io.on("connection", (socket) => {
  //   console.log(`Connected ${socket.id}`);
  socket.on("createRoom", (data) => {
    // console.log(data)
    const roomId = generateRoomId();
    rooms.push(roomId);

    const roomRating = parseInt(data.rating) || 1500;
    const timeLimit = parseInt(data.timeLimit);

    datas.push({
      roomId: roomId,
      roomName: data.roomName,
      roomRating: roomRating,
      timeLimit: timeLimit,
      P1: data.username,
      p1Handle: data.codeforcesHandle,
      p1Rating: 0,
      P1SocketId: 0,
      testCases: {} // Track test cases passed by players
    });

    // console.log(`Created room ${roomId} with rating: ${roomRating}`);
    // console.log(datas);

    socket.emit("roomCreated", { roomId });
  });

  socket.on("joinRoom", (data) => {
    // console.log(`User ${socket.id} trying to join room: ${data.roomId}`);
    const roomCode = data.roomId.toUpperCase();
    console.log(`Looking for room with code: ${roomCode}`);
    console.log(`Available rooms: ${datas.map((r) => r.roomId).join(", ")}`);

    const roomData = datas.find(
      (room) => room.roomId.toUpperCase() === roomCode
    );
    // console.log(`room Data -`);
    if (data && roomData) {
      if (roomData.P1SocketId === 0) {
        roomData.P1SocketId = data.newSocketId;
      } else {
        roomData.P2SocketId = data.newSocketId;
      }
    }
    // console.log(roomData);
    if (roomData) {
      console.log(`Found room: ${roomData.roomId}`);

      socket.join(roomData.roomId);
      console.log(`User ${socket.id} joined room: ${roomData.roomId}`);

      let players = [];

      if (roomData.P2 && data.username && data.codeforcesHandle) {
        socket.emit("error", { message: "Room is already full" });
        return;
      } else if (data.username && data.codeforcesHandle) {
        roomData.P2 = data.username;
        roomData.p2Handle = data.codeforcesHandle;
        roomData.p2Rating = 0;

        players = [
          {
            id: 1,
            name: roomData.P1,
            handle: roomData.p1Handle,
            rating: roomData.p1Rating,
            isReady: false,
            socketId: roomData.P1SocketId,
          },
          {
            id: 2,
            name: roomData.P2,
            handle: roomData.p2Handle,
            rating: roomData.p2Rating,
            isReady: false,
            socketId: roomData.P2SocketId,
          },
        ];

        io.to(roomData.roomId).emit("roomData", {
          roomId: roomData.roomId,
          roomName: roomData.roomName,
          players: players,
          rating: roomData.roomRating,
        });
      } else {
        if (roomData.P2) {
          players = [
            {
              id: 1,
              name: roomData.P1,
              handle: roomData.p1Handle,
              rating: roomData.p1Rating,
              socketId: roomData.P1SocketId,
              isReady: false,
            },
            {
              id: 2,
              name: roomData.P2,
              handle: roomData.p2Handle,
              rating: roomData.p2Rating,
              socketId: roomData.P2SocketId,
              isReady: false,
            },
          ];
        } else {
          players = [
            {
              id: 1,
              name: roomData.P1,
              handle: roomData.p1Handle,
              rating: roomData.p1Rating,
              socketId: roomData.P1SocketId,
              isReady: false,
            },
          ];
        }

        console.log(
          `Sending room data to client: roomId=${roomData.roomId}, players=${players.length}, rating=${roomData.roomRating}`
        );

        let timeRemaining = null;
        if (roomData.gameInProgress && roomData.startTime) {
          const startTime = new Date(roomData.startTime).getTime();
          const currentTime = new Date().getTime();
          const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
          const totalSeconds = roomData.timeLimit * 60;
          timeRemaining = Math.max(0, totalSeconds - elapsedSeconds);
          console.log(
            `Game in progress. Elapsed time: ${elapsedSeconds}s, Time remaining: ${timeRemaining}s`
          );
        }

        socket.emit("roomData", {
          roomId: roomData.roomId,
          roomName: roomData.roomName,
          players: players,
          rating: roomData.roomRating,
          gameInProgress: roomData.gameInProgress || false,
          problemLink: roomData.problemLink,
          problemName: roomData.problemName,
          problemRating: roomData.problemRating,
          timeLimit: roomData.timeLimit,
          startTime: roomData.startTime,
          timeRemaining: timeRemaining,
        });
      }
    } else {
      socket.emit("roomNotFound");
    }
  });

  socket.on("startGame", (data) => {
    console.log(`Starting game in room: ${data.roomId}`);

    const roomData = datas.find((room) => room.roomId === data.roomId);

    if (roomData) {
      roomData.problemLink = data.problemLink;
      roomData.problemName = data.problemName;
      roomData.problemRating = data.problemRating;
      roomData.problemId = data.problemId;
      roomData.contestId = data.contestId;
      roomData.index = data.index;
      roomData.gameInProgress = true;
      roomData.testCases = {}; // Reset test cases on new game

      roomData.startTime = new Date().toISOString();
      roomData.timeLimit = data.timeLimit;

      console.log(`Stored problem data in room: ${data.problemLink}`);
      console.log(
        `Game started at: ${roomData.startTime} with time limit: ${roomData.timeLimit} minutes`
      );

      io.to(data.roomId).emit("gameStarted", {
        roomId: data.roomId,
        problemLink: data.problemLink,
        problemName: data.problemName,
        problemRating: data.problemRating,
        timeLimit: roomData.timeLimit,
        startTime: roomData.startTime,
      });
    } else {
      console.error(`Room ${data.roomId} not found when starting game`);
      socket.emit("error", { message: "Room not found" });
    }
  });

  socket.on("verifySolution", async (data) => {
    console.log(`Verifying solution for player ${data.playerId} in room ${data.roomId}`);
    
    const roomData = datas.find(room => room.roomId === data.roomId);
    if (!roomData) {
      console.error(`Room ${data.roomId} not found when verifying solution`);
      socket.emit("error", { message: "Room not found" });
      return;
    }
    
    // Find the player's handle
    let playerHandle = null;
    if (roomData.P1SocketId === data.playerId) {
      playerHandle = roomData.p1Handle;
      console.log(`Identified as Player 1: ${playerHandle}`);
    } else if (roomData.P2SocketId === data.playerId) {
      playerHandle = roomData.p2Handle;
      console.log(`Identified as Player 2: ${playerHandle}`);
    } else {
      console.error(`Socket ID ${data.playerId} doesn't match either player in room ${data.roomId}`);
      console.log(`Player 1 Socket: ${roomData.P1SocketId}, Player 2 Socket: ${roomData.P2SocketId}`);
      socket.emit("error", { message: "Player not found in room" });
      return;
    }
    
    if (!playerHandle) {
      console.error(`Could not find Codeforces handle for player ${data.playerId}`);
      socket.emit("error", { message: "Codeforces handle not set properly" });
      return;
    }
    
    try {
      // Get the problem details from the room data
      const contestId = roomData.contestId;
      const index = roomData.index;
      
      if (!contestId || !index) {
        console.error(`Missing problem details in room ${data.roomId}`);
        socket.emit("error", { message: "Problem details missing. Try restarting the game." });
        return;
      }
      
      console.log(`Checking submissions for ${playerHandle} on problem ${contestId}${index}`);
      
      // Call Codeforces API to get recent submissions
      console.log(`Making API request to Codeforces for ${playerHandle}`);
      const response = await axios.get(`https://codeforces.com/api/user.status?handle=${playerHandle}&count=30`);
      
      if (response.status !== 200) {
        console.error(`Codeforces API returned status ${response.status}`);
        throw new Error(`Codeforces API error: ${response.statusText}`);
      }
      
      if (response.data.status !== "OK") {
        console.error(`Codeforces API returned status ${response.data.status}`);
        throw new Error("Codeforces API returned an error");
      }
      
      // Get the submission time from when the game started
      const gameStartTime = new Date(roomData.startTime).getTime() / 1000; // Convert to seconds
      console.log(`Game started at timestamp: ${gameStartTime}`);
      
      // Check if there's a correct submission for this problem after the game started
      const submissions = response.data.result;
      console.log(`Retrieved ${submissions.length} submissions for ${playerHandle}`);
      
      let correctSubmission = null;
      let testCasesPassed = 0;
      let submissionFound = false;
      
      for (const submission of submissions) {
        // Match problem by ID and index
        const problemMatches = submission.problem.contestId == contestId && 
                               submission.problem.index === index;
        
        // Check if submission time is after game start
        const isAfterGameStart = submission.creationTimeSeconds > gameStartTime;
        
        if (problemMatches) {
          console.log(`Found submission for problem ${contestId}${index}:`, {
            submissionId: submission.id,
            verdict: submission.verdict,
            testsPassed: submission.passedTestCount || 0,
            submittedAt: submission.creationTimeSeconds,
            isAfterGameStart: isAfterGameStart
          });
          
          if (!isAfterGameStart) {
            console.log(`Submission ${submission.id} was made before the game started, ignoring`);
            continue;
          }
          
          submissionFound = true;
          
          if (submission.verdict === "OK") {
            // Correct submission
            correctSubmission = submission;
            testCasesPassed = submission.passedTestCount || 10; // Default to 10 if not provided
            console.log(`Found correct submission with ID ${submission.id}`);
            break;
          } else if (submission.verdict === "TESTING") {
            console.log(`Submission ${submission.id} is still being tested`);
          } else if (submission.verdict === "PENDING") {
            console.log(`Submission ${submission.id} is pending judgment`);
          } else {
            // Wrong submission but count test cases
            console.log(`Wrong submission ${submission.id} with verdict ${submission.verdict}`);
            console.log(`Passed test cases: ${submission.passedTestCount || 0}`);
            testCasesPassed = Math.max(testCasesPassed, submission.passedTestCount || 0);
          }
        }
      }
      
      if (!submissionFound) {
        console.log(`No submissions found for problem ${contestId}${index} after game start`);
      }
      
      // Store the test cases result for this player
      roomData.testCases[data.playerId] = testCasesPassed;
      
      const isCorrect = !!correctSubmission;
      console.log(`Final verification result for ${playerHandle}: ${isCorrect ? 'correct' : 'incorrect'}, test cases: ${testCasesPassed}`);
      
      // If correct, this player is the winner
      if (isCorrect) {
        console.log(`Player ${data.playerName} has won the game!`);
        
        // Mark the game as over
        roomData.gameInProgress = false;
        roomData.winner = data.playerName;
        roomData.gameWinnerId = data.playerId;
        
        // Broadcast game over to all players in the room
        console.log(`Broadcasting game over to all players in room ${data.roomId}`);
        io.to(data.roomId).emit("gameOver", {
          winner: data.playerName,
          winnerId: data.playerId,
          isDraw: false,
          testCases: roomData.testCases
        });
      }
      
      // Send verification result to the player
      socket.emit("verificationResult", {
        success: isCorrect,
        testCasesPassed: testCasesPassed,
        socketId: data.playerId,
        playerName: data.playerName,
        submissionFound: submissionFound
      });
    } catch (error) {
      console.error("Error verifying solution:", error);
      socket.emit("error", { 
        message: `Error verifying your solution: ${error.message}. Please try again in a moment.` 
      });
    }
  });
  
  socket.on("gameOver", (data) => {
    console.log(`Game over in room ${data.roomId}, winner: ${data.winner}`);
    
    const roomData = datas.find(room => room.roomId === data.roomId);
    if (!roomData) {
      console.error(`Room ${data.roomId} not found when ending game`);
      return;
    }
    
    roomData.gameInProgress = false;
    roomData.winner = data.winner;
    roomData.gameWinnerId = data.winnerId;
    
    console.log(`Broadcasting game over event to room ${data.roomId} with winner: ${data.winner}`);
    
    // Notify all players in the room
    io.to(data.roomId).emit("gameOver", {
      winner: data.winner,
      winnerId: data.winnerId,
      isDraw: false,
      testCases: roomData.testCases
    });
    
    // Log confirmation of broadcast
    console.log(`Game over notification sent to all players in room ${data.roomId}`);
  });
  
  socket.on("updateTestCases", (data) => {
    console.log(`Updating test cases for player ${data.socketId} in room ${data.roomId}: ${data.testCasesPassed}`);
    
    const roomData = datas.find(room => room.roomId === data.roomId);
    if (!roomData) {
      console.error(`Room ${data.roomId} not found when updating test cases`);
      return;
    }
    
    roomData.testCases[data.socketId] = data.testCasesPassed;
  });
  
  socket.on("timeUp", (data) => {
    console.log(`Time up in room ${data.roomId}`);
    
    const roomData = datas.find(room => room.roomId === data.roomId);
    if (!roomData) {
      console.error(`Room ${data.roomId} not found when time is up`);
      return;
    }
    
    roomData.gameInProgress = false;
    
    // Find the winner based on test cases
    const testCases = roomData.testCases || {};
    let winner = null;
    let maxTestCases = 0;
    let isDraw = false;
    
    const playerIds = Object.keys(testCases);
    
    // If no test cases or all 0, it's a draw
    if (playerIds.length === 0 || playerIds.every(id => testCases[id] === 0)) {
      isDraw = true;
    } else {
      // Find the player with most test cases passed
      playerIds.forEach(playerId => {
        const testCasesPassed = testCases[playerId] || 0;
        if (testCasesPassed > maxTestCases) {
          maxTestCases = testCasesPassed;
          winner = playerId;
          isDraw = false;
        } else if (testCasesPassed === maxTestCases && maxTestCases > 0) {
          isDraw = true;
          // If it's a draw, there's no single winner
          winner = null;
        }
      });
    }
    
    // Get the winner's name
    let winnerName = null;
    if (winner && !isDraw) {
      if (roomData.P1SocketId === winner) {
        winnerName = roomData.P1;
      } else if (roomData.P2SocketId === winner) {
        winnerName = roomData.P2;
      }
    }
    
    console.log(`Game result: ${isDraw ? 'Draw' : `Winner: ${winnerName}`}`);
    
    // Notify all players in the room
    io.to(data.roomId).emit("gameOver", {
      winner: winnerName,
      winnerId: winner,
      isDraw: isDraw,
      testCases: testCases
    });
  });
  
  socket.on("discardRoom", (data) => {
    console.log(`Discarding room ${data.roomId}`);
    
    // Remove room from arrays
    const roomIndex = rooms.indexOf(data.roomId);
    if (roomIndex !== -1) {
      rooms.splice(roomIndex, 1);
    }
    
    const dataIndex = datas.findIndex(room => room.roomId === data.roomId);
    if (dataIndex !== -1) {
      datas.splice(dataIndex, 1);
    }
    
    console.log(`Room ${data.roomId} discarded successfully`);
  });

  socket.on("playerReady", (data) => {
    console.log(
      `Player ${data.playerId} in room ${data.roomId} ready status: ${data.isReady}`
    );

    io.to(data.roomId).emit("playerReadyUpdate", {
      roomId: data.roomId,
      playerId: data.playerId,
      isReady: data.isReady,
    });
  });

  socket.on("updatePlayerRating", (data) => {
    console.log(
      `Updating player ${data.playerId} rating in room ${data.roomId} to ${data.rating}`
    );

    const roomData = datas.find((room) => room.roomId === data.roomId);
    if (!roomData) {
      console.error(
        `Room ${data.roomId} not found when updating player rating`
      );
      socket.emit("error", { message: "Room not found" });
      return;
    }

    if (data.playerId === 1) {
      roomData.p1Rating = data.rating;
      console.log(`Updated player 1 rating to ${data.rating}`);
    } else if (data.playerId === 2) {
      roomData.p2Rating = data.rating;
      console.log(`Updated player 2 rating to ${data.rating}`);
    }

    const players = [];
    if (roomData.P1) {
      players.push({
        id: 1,
        name: roomData.P1,
        handle: roomData.p1Handle,
        rating: roomData.p1Rating || 0,
        isReady: false,
      });
    }

    if (roomData.P2) {
      players.push({
        id: 2,
        name: roomData.P2,
        handle: roomData.p2Handle,
        rating: roomData.p2Rating || 0,
        isReady: false,
      });
    }

    io.to(data.roomId).emit("roomData", {
      roomId: roomData.roomId,
      roomName: roomData.roomName,
      players: players,
      rating: roomData.roomRating,
      gameInProgress: roomData.gameInProgress || false,
      problemLink: roomData.problemLink,
      problemName: roomData.problemName,
      problemRating: roomData.problemRating,
      timeLimit: roomData.timeLimit || 3,
      startTime: roomData.startTime,
    });
  });
});
io.on("disconnect", () => {
  console.log("user disconnected");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}...`);
});
