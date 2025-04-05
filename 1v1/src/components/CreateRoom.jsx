import React, { useEffect, useState } from 'react'
import io from 'socket.io-client';
import '../css/CreateRoom.css'
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) {
      const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:8080', {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'],
      });

      // newSocket.on('connect', () => {
      //   console.log('Connected to server with ID:', newSocket.id);
      // });

      newSocket.on('connect_error', () => {
        console.error('Connection error');
      });

      newSocket.on('roomCreated', (data) => {
        navigate(`/room/${data.roomId}`);
      });

      setSocket(newSocket);

      return () => {
        // console.log('Disconnecting socket...');
        newSocket.disconnect();
      };
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    codeforcesHandle: '',
    rating: '',
    roomName: '',
    timeLimit: '3'
  });
  
  const [ratingError, setRatingError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'rating') {
      const numValue = Number(value);
      setRatingError('');
      
      if (value && (!Number.isInteger(numValue) || numValue % 100 !== 0)) {
        setRatingError('Rating must be divisible by 100');
      } else if (value && (numValue < 800 || numValue > 2000)) {
        setRatingError('Rating must be between 800 and 2000');
      }
    }
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const rating = Number(formData.rating);
    if (!Number.isInteger(rating) || rating % 100 !== 0 || rating < 800 || rating > 2000) {
      setRatingError('Please enter a valid rating (800-2000, divisible by 100)');
      return;
    }
    
    if (socket) {
      socket.emit('createRoom', {
        ...formData,
        timeLimit: Number(formData.timeLimit)
      });
      // console.log('Room creation details sent to server:', formData);
    } else {
      // console.error('Socket connection not established');
    }
    
    // console.log('Room creation form submitted:', formData);
  };

  const timeLimitOptions = [
    { value: '3', label: '3 minutes' },
    { value: '5', label: '5 minutes' },
    { value: '10', label: '10 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' }
  ];

  return (
    <div className="create-room-container">
      <h1 className="create-room-title">Create a New Room</h1>
      
      <form className="create-room-form" onSubmit={handleSubmit}>
      <div className="form-group">
          <label htmlFor="username">Display Name</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your Username"
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
          <label htmlFor="rating">Rating (800-2000, divisible by 100)</label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="800"
            max="2000"
            step="100"
            placeholder="Enter rating (e.g., 1200, 1300)"
            required
          />
          {ratingError && <div className="error-message">{ratingError}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="timeLimit">Challenge Time Limit</label>
          <div className="select-wrapper">
            <select
              id="timeLimit"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={handleChange}
              required
            >
              {timeLimitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="select-hint">Select how long players have to solve the problem</span>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="roomName">Room Name</label>
          <input
            type="text"
            id="roomName"
            name="roomName"
            value={formData.roomName}
            onChange={handleChange}
            placeholder="Enter a name for your room"
            required
          />
        </div>
        
        <button type="submit" className="create-room-btn">
          Create Room
        </button>
      </form>
    </div>
  )
}

export default CreateRoom