import React, { useState, useEffect } from 'react';
import './WeatherForecast.scss';
import axios from 'axios';
import { format } from 'date-fns';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CompressIcon from '@mui/icons-material/Compress';
import NavigationIcon from '@mui/icons-material/Navigation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Replace with your actual API key when implementing
const OPENWEATHER_API_KEY = "ba25ed73eef03334a531bf4c5c3ba7bd";

const WeatherForecast = ({ latitude, longitude }) => {
  const [forecast, setForecast] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  
  // Format dates for display
  const formatDateForDisplay = (dateString) => {
    return format(new Date(dateString), 'EEE, MMM d');
  };
  
  // Format times for display
  const formatTimeForDisplay = (dateTimeString) => {
    return format(new Date(dateTimeString), 'h:mm a');
  };
  
  // Format wind direction as cardinal direction
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  // Fetch 5-day forecast data when component mounts
  useEffect(() => {
    if (!latitude || !longitude) return;
    
    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch 5-day forecast with 3-hour intervals
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        
        // Process forecast data to extract unique dates and times
        const forecastData = response.data;
        const dateMap = new Map();
        
        forecastData.list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          const time = item.dt_txt.split(' ')[1];
          
          if (!dateMap.has(date)) {
            dateMap.set(date, []);
          }
          
          dateMap.get(date).push({
            time: time,
            fullDateTime: item.dt_txt,
            forecast: item
          });
        });
        
        // Extract unique dates for the date dropdown
        const dates = Array.from(dateMap.keys());
        setAvailableDates(dates);
        
        // Set default selected date to today/first available date
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
          
          // Set available times for the selected date
          const timesForSelectedDate = dateMap.get(dates[0]).map(item => ({
            time: item.time,
            fullDateTime: item.fullDateTime
          }));
          setAvailableTimes(timesForSelectedDate);
          
          // Set default selected time to first available time
          if (timesForSelectedDate.length > 0) {
            setSelectedTime(timesForSelectedDate[0].fullDateTime);
            
            // Find the forecast for selected date and time
            const selectedForecast = dateMap.get(dates[0]).find(
              item => item.fullDateTime === timesForSelectedDate[0].fullDateTime
            );
            
            if (selectedForecast) {
              setForecast(selectedForecast.forecast);
            }
          }
        }
        
        // Store the organized data for later use
        setForecast({
          dateMap: dateMap,
          city: forecastData.city,
          current: forecastData.list[0] // First forecast item (closest to current time)
        });
        
      } catch (err) {
        console.error("Error fetching weather forecast:", err);
        setError("Failed to load weather forecast. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchForecast();
  }, [latitude, longitude]);
  
  // Update available times when selected date changes
  const handleDateChange = (e) => {
    const newSelectedDate = e.target.value;
    setSelectedDate(newSelectedDate);
    
    if (forecast && forecast.dateMap) {
      const timesForSelectedDate = forecast.dateMap.get(newSelectedDate).map(item => ({
        time: item.time,
        fullDateTime: item.fullDateTime
      }));
      
      setAvailableTimes(timesForSelectedDate);
      
      // Set default selected time to first available time for the new date
      if (timesForSelectedDate.length > 0) {
        setSelectedTime(timesForSelectedDate[0].fullDateTime);
        
        // Find the forecast for selected date and time
        const selectedForecast = forecast.dateMap.get(newSelectedDate).find(
          item => item.fullDateTime === timesForSelectedDate[0].fullDateTime
        );
        
        if (selectedForecast) {
          setForecast({
            ...forecast,
            current: selectedForecast.forecast
          });
        }
      }
    }
  };
  
  // Update displayed forecast when selected time changes
  const handleTimeChange = (e) => {
    const newSelectedTime = e.target.value;
    setSelectedTime(newSelectedTime);
    
    if (forecast && forecast.dateMap) {
      const selectedDateFromTime = newSelectedTime.split(' ')[0];
      
      // Find the forecast for selected date and time
      const selectedForecast = forecast.dateMap.get(selectedDateFromTime).find(
        item => item.fullDateTime === newSelectedTime
      );
      
      if (selectedForecast) {
        setForecast({
          ...forecast,
          current: selectedForecast.forecast
        });
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="weather-forecast">
        <div className="weather-loading">Loading weather forecast...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="weather-forecast">
        <div className="weather-error">{error}</div>
      </div>
    );
  }

  // Show empty state if no forecast data
  if (!forecast || !forecast.current) {
    return (
      <div className="weather-forecast">
        <div className="weather-message">Select a date and time to view weather forecast</div>
      </div>
    );
  }

  // Current forecast data
  const current = forecast.current;
  const weather = current.weather[0];
  const temp = Math.round(current.main.temp);
  const windSpeed = Math.round(current.wind.speed);
  const windDirection = getWindDirection(current.wind.deg);
  const humidity = current.main.humidity;
  const pressure = current.main.pressure;
  const precipitation = current.pop ? `${Math.round(current.pop * 100)}%` : '0%';
  const weatherIcon = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <div className="weather-forecast">
      <h3>Weather Forecast</h3>
      
      <div className="weather-selectors">
        <div className="date-selector">
          <label htmlFor="forecast-date">
            <CalendarMonthIcon fontSize="small" /> Date:
          </label>
          <select 
            id="forecast-date" 
            value={selectedDate} 
            onChange={handleDateChange}
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDateForDisplay(date)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="time-selector">
          <label htmlFor="forecast-time">
            <AccessTimeIcon fontSize="small" /> Time:
          </label>
          <select 
            id="forecast-time" 
            value={selectedTime} 
            onChange={handleTimeChange}
          >
            {availableTimes.map(timeObj => (
              <option key={timeObj.fullDateTime} value={timeObj.fullDateTime}>
                {formatTimeForDisplay(timeObj.fullDateTime)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="weather-display">
        <div className="weather-main">
          <img 
            src={weatherIcon} 
            alt={weather.description} 
            className="weather-icon" 
          />
          <div className="weather-temp">{temp}°C</div>
          <div className="weather-desc">{weather.description}</div>
        </div>
        
        <div className="weather-details">
          <div className="weather-detail">
            <AirIcon fontSize="small" />
            <span>Wind:</span>
            <strong>{windSpeed} m/s {windDirection}</strong>
            <div className="wind-arrow" style={{ transform: `rotate(${current.wind.deg}deg)` }}>
              <NavigationIcon />
            </div>
          </div>
          
          <div className="weather-detail">
            <WaterDropIcon fontSize="small" />
            <span>Humidity:</span>
            <strong>{humidity}%</strong>
          </div>
          
          <div className="weather-detail">
            <ThermostatIcon fontSize="small" />
            <span>Precipitation:</span>
            <strong>{precipitation}</strong>
          </div>
          
          <div className="weather-detail">
            <CompressIcon fontSize="small" />
            <span>Pressure:</span>
            <strong>{pressure} hPa</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;