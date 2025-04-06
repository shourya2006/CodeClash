import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Alert from "./Alert";
import "../css/Room.css";
import Confetti from "react-confetti";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [alert, setAlert] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });

  const [roomData, setRoomData] = useState({
    roomName: "Loading...",
    roomCode: roomId,
    players: [],
    timeLimit: 0,
    rating: 1500,
    problemLink: null,
    gameInProgress: false
  });

  const [countdown, setCountdown] = useState({
    minutes: 0,
    seconds: 0,
    isActive: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [gameResult, setGameResult] = useState({
    isGameOver: false,
    winner: null,
    isDraw: false,
    testCases: {}
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const timerRef = useRef(null);
  const lastProblemIdRef = useRef(null);

  const showAlert = useCallback((type, message) => {
    setAlert({
      isVisible: true,
      type,
      message,
    });
  }, []);

  const hideAlert = () => {
    setAlert((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  useEffect(() => {
    if (countdown.isActive) {
      if (countdown.minutes === 0 && countdown.seconds === 0) {
        // console.log("Timer is at 0, not starting interval");
        
        if (roomData.gameInProgress) {
          handleTimeUp();
        }
        return;
      }
      
      // console.log(`Starting timer interval at ${countdown.minutes}:${countdown.seconds}`);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev.minutes === 0 && prev.seconds === 0) {
            clearInterval(timerRef.current);
            // console.log("Time's up!");
            showAlert("error", "Time's up!");
            
            if (roomData.gameInProgress) {
              handleTimeUp();
            }
            
            return prev;
          }

          const newSeconds = prev.seconds - 1;
          const newMinutes = prev.minutes;

          if (newSeconds < 0) {
            return {
              minutes: newMinutes - 1,
              seconds: 59,
              isActive: true,
            };
          } else {
            return {
              minutes: newMinutes,
              seconds: newSeconds,
              isActive: true,
            };
          }
        });
      }, 1000);

      return () => {
        // console.log("Clearing timer interval");
        clearInterval(timerRef.current);
      };
    }
  }, [countdown.isActive, showAlert, roomData.gameInProgress]);

  useEffect(() => {
    // console.log(`Room component mounted with roomId: ${roomId}`);
    
    const newSocket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:8080", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      // console.log("Room - Connected to server with ID:", newSocket.id);
      // console.log("Room - Requesting data for room:", roomId);
      newSocket.emit("joinRoom", { 
        roomId: roomId,
        newSocketId: newSocket.id,
      });
    });

    newSocket.on("roomData", (data) => {
      // console.log("Room - Received room data:", data);
      if (!data) {
        // console.error("Room - Received null or undefined room data");
        return;
      }
      
      let problemLink = null;
      if (data.problemLink) {
        problemLink = data.problemLink;
        // console.log("Found problem link in data.problemLink:", problemLink);
      } else if (data.problem && data.problem.link) {
        problemLink = data.problem.link;
        // console.log("Found problem link in data.problem.link:", problemLink);
      }
      
      if (data.gameInProgress && !problemLink) {
        // console.warn("Game in progress but no problem link found, using fallback for testing");
        problemLink = "https://codeforces.com/problemset/problem/1352/A";
      }
      
      // console.log("Final problem link to use:", problemLink);
      

      const roomRating = data.rating || 1500; 
      // console.log(`Using room rating: ${roomRating}`);
      

      setRoomData({
        roomName: data.roomName || "Unknown Room",
        roomCode: data.roomId || roomId,
        players: data.players || [],
        timeLimit: data.timeLimit || 0,
        rating: roomRating,
        problemLink: problemLink,
        gameInProgress: data.gameInProgress || false
      });

      // console.log(roomData);
      if (data.players && data.players.length > 0) {
        (async () => {
          const updatedPlayers = await updatePlayerRatings(data.players);
          

          if (updatedPlayers.some((p, i) => p.rating !== data.players[i]?.rating)) {
            // console.log("Updated player ratings");
            setRoomData(prevData => ({
              ...prevData,
              players: updatedPlayers
            }));
          }
        })();
      }

      if (data.gameInProgress) {
        if (data.timeRemaining) {
          setCountdown({
            minutes: Math.floor(data.timeRemaining / 60),
            seconds: data.timeRemaining % 60,
            isActive: true,
          });
        } else {
          setCountdown({
            minutes: data.timeLimit || 0,
            seconds: 0,
            isActive: true,
          });
        }
      }
    });

    newSocket.on("gameStarted", (data) => {
      // console.log("Game started in room:", data.roomId, data);
      showAlert("success", "Game started!");
      
      // console.log("Problem link from gameStarted:", data.problemLink);
      
      let problemLink = null;
      if (data.problemLink) {
        problemLink = data.problemLink;
      } else if (data.problem && data.problem.link) {
        problemLink = data.problem.link;
      }
      
      

      setRoomData(prevData => {
        const updatedData = {
          ...prevData,
          problemLink: problemLink,
          gameInProgress: true,
          startTime: data.startTime 
        };
        // console.log("Updated room data after game start:", updatedData);
        return updatedData;
      });

      const timeLimit = data.timeLimit || roomData.timeLimit || 0;
      // console.log(`Setting timer with time limit: ${timeLimit} minutes`);
      
      setCountdown({
        minutes: timeLimit,
        seconds: 0,
        isActive: true,
      });
    });

    newSocket.on("gameOver", (data) => {
      // console.log("Game over received:", data);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setCountdown(prev => ({
        ...prev,
        isActive: false
      }));
      
      setGameResult({
        isGameOver: true,
        winner: data.winner,
        isDraw: data.isDraw,
        testCases: data.testCases || {}
      });
      
      if (!data.isDraw && data.winner) {
        const isCurrentPlayerWinner = socket && socket.id === data.winnerId;
        // console.log(`Current player is winner: ${isCurrentPlayerWinner}`);
        
        // console.log(`Showing celebration for winner: ${data.winner}`);
        setShowConfetti(true);
        
        if (isCurrentPlayerWinner) {
          showAlert("success", "Congratulations! You won!");
        } else {
          showAlert("info", `${data.winner} has won the game!`);
        }
        
        setTimeout(() => setShowConfetti(false), 10000); 
      } else if (data.isDraw) {
        showAlert("info", "The game ended in a draw!");
      }
    });

    newSocket.on("verificationResult", (data) => {
      // console.log("Verification result received:", data);
      setIsVerifying(false);
      
      if (data.success) {
        showAlert("success", "Your solution is correct on Codeforces! You win!");
        
      } else {
        let message;
        
        if (!data.submissionFound) {
          message = "No submissions found for this problem. Submit your solution on Codeforces first.";
        } else if (data.testCasesPassed > 0) {
          message = `No correct solution yet. Your best submission passed ${data.testCasesPassed} test cases.`;
        } else {
          message = "Your submissions for this problem didn't pass any test cases.";
        }
        
        showAlert("error", message);
        
        if (socket) {
          socket.emit("updateTestCases", {
            roomId,
            socketId: socket.id,
            testCasesPassed: data.testCasesPassed || 0
          });
        }
      }
    });

    newSocket.on("error", (data) => {
      setIsVerifying(false);
      showAlert("error", data.message);
    });

    setSocket(newSocket);

    return () => {
      // console.log("Disconnecting socket...");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      newSocket.disconnect();
    };
  }, [roomId, showAlert]);

  const fetchRandomProblem = async (rating, players) => {
    try {
      const player1Handle = players[0]?.handle;
      const player2Handle = players[1]?.handle;
      
      if (!player1Handle || !player2Handle) {
        showAlert("error", "Both players must have valid CF handles");
        return null;
      }
      
      // console.log(`Fetching problems for ${player1Handle} and ${player2Handle}`);
      

      const response1 = await fetch(
        `https://codeforces.com/api/user.status?handle=${player1Handle}&from=1&count=10000`
      );
      if (!response1.ok) {
        throw new Error(`Unable to fetch data for ${player1Handle}`);
      }
      const data1 = await response1.json();
      

      const response2 = await fetch(
        `https://codeforces.com/api/user.status?handle=${player2Handle}&from=1&count=10000`
      );
      if (!response2.ok) {
        throw new Error(`Unable to fetch data for ${player2Handle}`);
      }
      const data2 = await response2.json();
      

      const solvedProblems1 = {};
      const solvedProblems2 = {};
      
      for (let submission of data1.result) {
        if (submission.verdict === "OK") {
          const problemId = `${submission.problem.contestId}${submission.problem.index}`;
          solvedProblems1[problemId] = true;
        }
      }
      
      for (let submission of data2.result) {
        if (submission.verdict === "OK") {
          const problemId = `${submission.problem.contestId}${submission.problem.index}`;
          solvedProblems2[problemId] = true;
        }
      }
      
      // console.log(`Player 1 has solved ${Object.keys(solvedProblems1).length} problems`);
      // console.log(`Player 2 has solved ${Object.keys(solvedProblems2).length} problems`);
      

      const problemsetResponse = await fetch(
        `https://codeforces.com/api/problemset.problems`
      );
      if (!problemsetResponse.ok) {
        throw new Error("Unable to fetch problem set");
      }
      const problemset = await problemsetResponse.json();
      

      // console.log(`Looking for problems with rating ${rating}`);
      let filteredProblems = problemset.result.problems.filter(problem => {
        if (!problem.rating) return false;
        if (problem.rating !== rating) return false;
        
        const problemId = `${problem.contestId}${problem.index}`;
        return !solvedProblems1[problemId] && !solvedProblems2[problemId] && problemId !== lastProblemIdRef.current;
      });
      
      if (filteredProblems.length === 0) {
        // console.log(`No problems with exact rating ${rating}, trying range ${rating-200} to ${rating+200}`);
        filteredProblems = problemset.result.problems.filter(problem => {
          if (!problem.rating) return false;
          if (problem.rating < rating - 200 || problem.rating > rating + 200) return false;
          
          const problemId = `${problem.contestId}${problem.index}`;
          return !solvedProblems1[problemId] && !solvedProblems2[problemId] && problemId !== lastProblemIdRef.current;
        });
      }
      
      if (filteredProblems.length > 0) {
        // console.log(`Found ${filteredProblems.length} suitable problems`);
        
        const randomProblem = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
        
        const problemLink = `https://codeforces.com/problemset/problem/${randomProblem.contestId}/${randomProblem.index}`;
        const problemId = `${randomProblem.contestId}${randomProblem.index}`;
        
        lastProblemIdRef.current = problemId;
        
        // console.log(`Selected random problem: ${randomProblem.name} (${problemId}) with rating ${randomProblem.rating}`);
        
        return {
          name: randomProblem.name,
          rating: randomProblem.rating,
          link: problemLink,
          problemId: problemId,
          contestId: randomProblem.contestId,
          index: randomProblem.index
        };
      } else {
        // console.error("No suitable problems found");
        return null;
      }
    } catch (error) {
      // console.error("Error fetching random problem:", error);
      showAlert("error", `Error: ${error.message}`);
      return null;
    }
  };

  const handleStartGame = async () => {
    if (roomData.players.length !== 2 || !roomData.players[0].handle || !roomData.players[1].handle) {
      return;
    }

    setIsLoading(true);
    
    try {
      const updatedPlayers = await updatePlayerRatings(roomData.players);
      if (updatedPlayers !== roomData.players) {
        setRoomData({
          ...roomData,
          players: updatedPlayers
        });
      }
      
      const rating = roomData.rating || 1500;
      // console.log(`Using room rating: ${rating} for problem selection`);
      
      const problem = await fetchRandomProblem(rating, roomData.players);
      
      if (!problem) {
        // console.error("Failed to fetch a problem");
        showAlert("error", "Could not find a suitable problem. Please try again.");
        return;
      }
      
      // console.log("Starting game with problem:", problem);
      socket.emit('startGame', { 
        roomId, 
        problemLink: problem.link,
        problemName: problem.name,
        problemRating: problem.rating,
        problemId: problem.problemId,
        contestId: problem.contestId,
        index: problem.index,
        timeLimit: roomData.timeLimit
      });
    } catch (error) {
      // console.error("Error starting game:", error);
      showAlert("error", `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySolution = () => {
    const currentPlayer = roomData.players.find(p => p.socketId === socket.id);
    if (!currentPlayer || !currentPlayer.handle) {
      showAlert("error", "Your Codeforces handle is not set properly");
      return;
    }
    
    setIsVerifying(true);
    showAlert("info", `Checking Codeforces for submissions by ${currentPlayer.handle}...`);
    
    if (socket) {
      socket.emit("verifySolution", { 
        roomId,
        playerId: socket.id,
        playerName: getCurrentPlayerName()
      });
    }
  };

  const getCurrentPlayerName = () => {
    if (!socket || !roomData.players) return null;
    
    const currentPlayer = roomData.players.find(p => p.socketId === socket.id);
    return currentPlayer ? currentPlayer.name : null;
  };

  const handleTimeUp = () => {
    // console.log("Time's up - checking for winner based on test cases");
    if (socket) {
      socket.emit("timeUp", { roomId });
    }
  };

  const handleReturnHome = () => {
    if (socket) {
      socket.emit("discardRoom", { roomId });
    }
    navigate('/');
  };

  const fetchCodeforcesRating = async (handle) => {
    if (!handle) return null;
    
    try {
      // console.log(`Fetching rating for user: ${handle}`);
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      if (!response.ok) {
        throw new Error(`Unable to fetch rating for ${handle}`);
      }
      
      const data = await response.json();
      if (data.status === "OK" && data.result.length > 0) {
        const rating = data.result[0].rating || 0;
        // console.log(`Found rating for ${handle}: ${rating}`);
        return rating;
      }
      
      return 0;
    } catch {
      return 0;
    }
  };
  
  const updatePlayerRatings = async (players) => {
    if (!players || players.length === 0) return players;
    
    const updatedPlayers = [...players];
    
    for (let i = 0; i < updatedPlayers.length; i++) {
      const player = updatedPlayers[i];
      if (player.handle && (!player.rating || player.rating === 0)) {
        // console.log(`Silently fetching rating for ${player.handle}...`);
        const rating = await fetchCodeforcesRating(player.handle);
        if (rating > 0) {
          updatedPlayers[i] = { ...player, rating };
          
          if (socket) {
            socket.emit('updatePlayerRating', { 
              roomId,
              playerId: i + 1,
              rating
            });
          }
        }
      }
    }
    
    return updatedPlayers;
  };


  const getDifficultyLabel = (rating) => {
    if (rating < 900) return "Beginner";
    if (rating < 1200) return "Easy";
    if (rating < 1500) return "Medium";
    if (rating < 1800) return "Hard";
    if (rating < 2100) return "Expert";
    return "Master";
  };


  const getDifficultyClass = (rating) => {
    if (rating < 900) return "difficulty-beginner";
    if (rating < 1200) return "difficulty-easy";
    if (rating < 1500) return "difficulty-medium";
    if (rating < 1800) return "difficulty-hard";
    if (rating < 2100) return "difficulty-expert";
    return "difficulty-master";
  };

  const formatTimeDisplay = (minutes, seconds) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    showAlert("success", "Room code copied to clipboard!");
  };

  // console.log("Current room data on render:", roomData);

  return (
    <div className="room-container">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={true} />}
      
      {gameResult.isGameOver ? (
        <div className="victory-container">
          {gameResult.isDraw ? (
            <h1 className="draw-heading">It's a Draw!</h1>
          ) : (
            <h1 className="winner-heading">
              {gameResult.winner} Wins!
            </h1>
          )}
          <button className="return-home-btn" onClick={handleReturnHome}>
            Return to Home
          </button>
        </div>
      ) : (
        <>
          {roomData.gameInProgress && (
            <div className="warning-banner">
              ⚠️ WARNING: Do not reload the page or you may lose your Game! ⚠️
            </div>
          )}
          
          <Alert
            type={alert.type}
            message={alert.message}
            isVisible={alert.isVisible}
            onClose={hideAlert}
          />

          <div className="room-header">
            <div className="room-info">
              <h1 className="room-name">{roomData.roomName}</h1>
              <div className="room-details">
                <div className="info-badge code-badge" onClick={copyRoomCode} title="Click to copy">
                  <span className="badge-label">Room Code</span>
                  <span className="badge-value">{roomId}</span>
                  <span className="copy-hint">Click to copy</span>
                </div>
                
                {roomData.rating > 0 && (
                  <div className={`info-badge rating-badge ${getDifficultyClass(roomData.rating)}`}>
                    <span className="badge-label">Room Rating</span>
                    <span className="badge-value">{roomData.rating}</span>
                    <span className="difficulty-indicator">{getDifficultyLabel(roomData.rating)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="room-timer">
              <div className="timer-display">
                {countdown.isActive ? (
                  <span>{formatTimeDisplay(countdown.minutes, countdown.seconds)}</span>
                ) : (
                  <span>{formatTimeDisplay(roomData.timeLimit, 0)}</span>
                )}
              </div>
              <div className="timer-label">Time Remaining</div>
            </div>
          </div>
          {roomData.players.length !== 2 && !roomData.gameInProgress && (
            <>
              <div className="error-message">
                There must be 2 players to start the Game
              </div>
              <br />
            </>
          )}

          <div className="players-container">
            {roomData.players.map((player, index) => (
              <div
                key={player.id}
                className="player-card"
              >
                <div className="player-header">
                  <div className="player-avatar">
                    <span>{player.name ? player.name.charAt(0).toUpperCase() : "?"}</span>
                  </div>
                  <h2 className="player-name">
                    Player {index + 1}: {player.name}
                  </h2>
                  {socket && player.socketId === socket.id && (
                    <span className="you-indicator">YOU</span>
                  )}
                </div>

                <div className="player-details">
                  <div className="player-info">
                    <div className="info-row">
                      <span className="label">CF Handle:</span>
                      <span className="value">{player.handle || "Not set"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Rating:</span>
                      <span className={`value ${!player.rating ? "fetching" : ""}`}>
                        {player.rating ? player.rating : player.handle ? "Fetching..." : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {roomData.problemLink ? (
            <div className="problem-link-container">
              <a 
                href={roomData.problemLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="problem-link"
              >
                Open Problem
              </a>
              
              {roomData.gameInProgress && (
                <button
                  className="verify-solution-btn"
                  onClick={handleVerifySolution}
                  disabled={isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Verify Solution"}
                </button>
              )}
            </div>
          ) : (
            roomData.gameInProgress && (
              <div className="problem-link-container">
                <div className="error-message">Problem link not available. Please wait...</div>
              </div>
            )
          )}

          <div className="game-controls">
            {!roomData.gameInProgress && (
              <button
                className="start-game-btn"
                onClick={handleStartGame}
                disabled={roomData.players.length !== 2 || isLoading}
              >
                {isLoading 
                  ? "Fetching Ratings..." 
                  : (!roomData.players[0]?.rating && roomData.players[0]?.handle) 
                    ? "Waiting for Player 1 Rating..." 
                    : "Start Game"
                }
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Room;
