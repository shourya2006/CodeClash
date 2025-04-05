import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../css/JoinRoom.css'
import io from 'socket.io-client';

const JoinRoom = () => {
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {

    const newSocket = io('http://localhost:8080', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      // console.log('Connected to server with ID:', newSocket.id);
    });

    newSocket.on('connect_error', () => {
      // console.error('Connection error');
      setError('Failed to connect to server. Please try again later.');
      setIsLoading(false);
    });
    
    newSocket.on('roomData', (data) => {
      // console.log('Room joined, received data:', data);
      setIsLoading(false);
      
      if (data && data.roomId) {
        // console.log(`Navigating to room ${data.roomId}`);
        setTimeout(() => {
          navigate(`/room/${data.roomId}`);
        }, 100);
      } else {
        // console.error('Invalid room data received:', data);
        setError('Error joining room. Please try again.');
      }
    });
    
    newSocket.on('error', (data) => {
      // console.error('Error from server:', data);
      setError(data.message);
      setIsLoading(false);
      alert(data.message);
    });
    
    newSocket.on('roomNotFound', () => {
      // console.error('Room not found event received');
      setError('Room not found! Please check the room code and try again.');
      setIsLoading(false);
      alert('Room not found! Please check the room code and try again.');
    });

    setSocket(newSocket);
    
    return () => {
      // console.log('Disconnecting socket...');
      newSocket.disconnect();
    };
  }, [navigate]);

  const [formData, setFormData] = useState({
    username: '',
    codeforcesHandle: '',
    roomCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setError('');
    
    if (!formData.username || !formData.codeforcesHandle || !formData.roomCode) {
      setError('Please fill in all fields');
      return;
    }
    
    if (socket) {
      setIsLoading(true);
      
      const roomId = formData.roomCode.toUpperCase().trim();
      // console.log(`Attempting to join room with ID: ${roomId}`);
      
      socket.emit('joinRoom', { 
        roomId, 
        username: formData.username,
        codeforcesHandle: formData.codeforcesHandle 
      });
      // console.log('Room join request sent to server:', {
      //   roomId,
      //   username: formData.username,
      //   codeforcesHandle: formData.codeforcesHandle
      // });
    } else {
      setError('Socket connection not established. Please refresh the page.');
      // console.error('Socket connection not established');
    }
  };

  return (
    <div className="join-room-container">
      <h1 className="join-room-title">Join an Existing Room</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="join-room-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Display Name</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="codeforcesHandle">Codeforces Handle</label>
          <input
            type="text"
            id="codeforcesHandle"
            name="codeforcesHandle"
            value={formData.codeforcesHandle}
            onChange={handleChange}
            placeholder="Enter your Codeforces handle"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="roomCode">Room Code</label>
          <input
            type="text"
            id="roomCode"
            name="roomCode"
            value={formData.roomCode}
            onChange={handleChange}
            placeholder="Enter the room code"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="join-room-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Joining...' : 'Join Room'}
        </button>
      </form>
      
      <div className="create-room-link">
        <p>Room not created yet?</p>
        <Link to="/create" className="create-room-text-link">
          Create a new room
        </Link>
      </div>
    </div>
  )
}

export default JoinRoom
